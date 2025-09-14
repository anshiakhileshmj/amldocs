from fastapi import APIRouter, Depends, HTTPException, status, Request, Header
from typing import List, Optional
from datetime import datetime
import json
import httpx
import hashlib
import hmac

from app.models import WebhookLogResponse, WebhookEvent
from app.core.security import get_current_merchant, verify_webhook_signature
from app.database import get_supabase
from app.core.config import settings

router = APIRouter()

async def send_webhook(merchant_id: str, event_type: str, data: dict):
    """Send webhook to merchant"""
    supabase = get_supabase()
    
    # Get merchant webhook URL
    merchant_result = supabase.table("merchants").select("webhook_url").eq("id", merchant_id).execute()
    
    if not merchant_result.data or not merchant_result.data[0].get("webhook_url"):
        return None
    
    webhook_url = merchant_result.data[0]["webhook_url"]
    
    # Prepare webhook payload
    payload = {
        "event_type": event_type,
        "merchant_id": merchant_id,
        "data": data,
        "timestamp": datetime.utcnow().isoformat()
    }
    
    # Create signature
    payload_str = json.dumps(payload, sort_keys=True)
    signature = hmac.new(
        settings.webhook_secret.encode(),
        payload_str.encode(),
        hashlib.sha256
    ).hexdigest()
    
    headers = {
        "Content-Type": "application/json",
        "X-Webhook-Signature": f"sha256={signature}",
        "User-Agent": "Stablecoin-Payment-API/1.0"
    }
    
    # Send webhook
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(webhook_url, json=payload, headers=headers)
            
            # Log webhook attempt
            webhook_log = {
                "merchant_id": merchant_id,
                "event_type": event_type,
                "payload": payload,
                "response_status": response.status_code,
                "response_body": response.text,
                "retry_count": 0
            }
            
            supabase.table("webhook_logs").insert(webhook_log).execute()
            
            return response.status_code == 200
            
    except Exception as e:
        # Log failed webhook
        webhook_log = {
            "merchant_id": merchant_id,
            "event_type": event_type,
            "payload": payload,
            "response_status": None,
            "response_body": str(e),
            "retry_count": 0
        }
        
        supabase.table("webhook_logs").insert(webhook_log).execute()
        
        return False

@router.post("/test")
async def test_webhook(
    current_merchant: dict = Depends(get_current_merchant)
):
    """Test webhook configuration"""
    test_data = {
        "test": True,
        "message": "This is a test webhook from Stablecoin Payment API",
        "timestamp": datetime.utcnow().isoformat()
    }
    
    success = await send_webhook(
        current_merchant["id"],
        "test",
        test_data
    )
    
    return {
        "success": success,
        "message": "Test webhook sent" if success else "Failed to send test webhook"
    }

@router.get("/logs", response_model=List[WebhookLogResponse])
async def get_webhook_logs(
    current_merchant: dict = Depends(get_current_merchant),
    event_type: Optional[str] = None,
    limit: int = 50,
    offset: int = 0
):
    """Get webhook delivery logs"""
    supabase = get_supabase()
    
    query = supabase.table("webhook_logs").select("*").eq("merchant_id", current_merchant["id"])
    
    if event_type:
        query = query.eq("event_type", event_type)
    
    query = query.order("created_at", desc=True).range(offset, offset + limit - 1)
    
    result = query.execute()
    
    return [WebhookLogResponse(**log) for log in result.data]

@router.post("/retry/{log_id}")
async def retry_webhook(
    log_id: str,
    current_merchant: dict = Depends(get_current_merchant)
):
    """Retry a failed webhook"""
    supabase = get_supabase()
    
    # Get webhook log
    log_result = supabase.table("webhook_logs").select("*").eq("id", log_id).eq("merchant_id", current_merchant["id"]).execute()
    
    if not log_result.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Webhook log not found"
        )
    
    log = log_result.data[0]
    
    # Check retry count
    if log["retry_count"] >= 5:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Maximum retry attempts exceeded"
        )
    
    # Retry webhook
    success = await send_webhook(
        log["merchant_id"],
        log["event_type"],
        log["payload"]
    )
    
    # Update retry count
    supabase.table("webhook_logs").update({
        "retry_count": log["retry_count"] + 1
    }).eq("id", log_id).execute()
    
    return {
        "success": success,
        "message": "Webhook retry completed" if success else "Webhook retry failed"
    }

@router.post("/incoming")
async def receive_webhook(
    request: Request,
    x_webhook_signature: str = Header(None)
):
    """Receive incoming webhook (for external services)"""
    try:
        body = await request.body()
        payload = json.loads(body)
        
        # Verify signature if provided
        if x_webhook_signature:
            expected_signature = hmac.new(
                settings.webhook_secret.encode(),
                body,
                hashlib.sha256
            ).hexdigest()
            
            if not hmac.compare_digest(x_webhook_signature, f"sha256={expected_signature}"):
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid webhook signature"
                )
        
        # Process webhook payload
        event_type = payload.get("event_type")
        merchant_id = payload.get("merchant_id")
        data = payload.get("data", {})
        
        if not event_type or not merchant_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Missing required fields: event_type, merchant_id"
            )
        
        # Log incoming webhook
        supabase = get_supabase()
        webhook_log = {
            "merchant_id": merchant_id,
            "event_type": f"incoming_{event_type}",
            "payload": payload,
            "response_status": 200,
            "response_body": "Processed successfully",
            "retry_count": 0
        }
        
        supabase.table("webhook_logs").insert(webhook_log).execute()
        
        return {"status": "success", "message": "Webhook processed successfully"}
        
    except json.JSONDecodeError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid JSON payload"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to process webhook: {str(e)}"
        )

@router.get("/events/supported")
async def get_supported_events():
    """Get list of supported webhook events"""
    return {
        "events": [
            {
                "name": "payment.created",
                "description": "A new payment request was created"
            },
            {
                "name": "payment.completed",
                "description": "A payment was successfully completed"
            },
            {
                "name": "payment.failed",
                "description": "A payment failed"
            },
            {
                "name": "payment.expired",
                "description": "A payment request expired"
            },
            {
                "name": "payment.refunded",
                "description": "A payment was refunded"
            },
            {
                "name": "transaction.confirmed",
                "description": "A transaction was confirmed on the blockchain"
            },
            {
                "name": "transaction.failed",
                "description": "A transaction failed on the blockchain"
            },
            {
                "name": "payout.created",
                "description": "A payout was created"
            },
            {
                "name": "payout.completed",
                "description": "A payout was completed"
            },
            {
                "name": "payout.failed",
                "description": "A payout failed"
            },
            {
                "name": "wallet.created",
                "description": "A new wallet was created"
            },
            {
                "name": "test",
                "description": "Test webhook event"
            }
        ]
    }
