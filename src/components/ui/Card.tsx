import { ReactNode } from 'react'
import { clsx } from 'clsx'

interface CardProps {
  children: ReactNode
  className?: string
  padding?: 'sm' | 'md' | 'lg'
  hover?: boolean
}

export default function Card({ children, className, padding = 'md', hover = false }: CardProps) {
  return (
    <div
      className={clsx(
        'bg-white rounded-xl border border-slate-200 shadow-sm',
        {
          'p-4': padding === 'sm',
          'p-6': padding === 'md',
          'p-8': padding === 'lg',
          'hover:shadow-md transition-shadow': hover,
        },
        className
      )}
    >
      {children}
    </div>
  )
}
