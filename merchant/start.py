#!/usr/bin/env python3
"""
Startup script for Stablecoin Merchant Payment Rails API
"""

import uvicorn
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

if __name__ == "__main__":
    # Get configuration from environment
    host = os.getenv("HOST", "0.0.0.0")
    port = int(os.getenv("PORT", "8000"))
    reload = os.getenv("RELOAD", "false").lower() == "true"
    
    print("🚀 Starting Stablecoin Merchant Payment Rails API")
    print(f"📍 Server will run on http://{host}:{port}")
    print("📚 API Documentation available at http://localhost:8000/docs")
    print("🔧 Admin interface available at http://localhost:8000/redoc")
    
    # Start the server
    uvicorn.run(
        "main:app",
        host=host,
        port=port,
        reload=reload,
        log_level="info"
    )
