import { HTMLAttributes } from 'react'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

export function Card({ children, className = '', ...props }: CardProps) {
  return (
    <div
      className={`bg-white rounded-lg shadow-md overflow-hidden ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}

export function CardHeader({ children, className = '', ...props }: CardProps) {
  return (
    <div className={`px-4 py-3 border-b border-gray-200 ${className}`} {...props}>
      {children}
    </div>
  )
}

export function CardBody({ children, className = '', ...props }: CardProps) {
  return (
    <div className={`px-4 py-3 ${className}`} {...props}>
      {children}
    </div>
  )
}

export function CardFooter({ children, className = '', ...props }: CardProps) {
  return (
    <div className={`px-4 py-3 border-t border-gray-200 ${className}`} {...props}>
      {children}
    </div>
  )
}
