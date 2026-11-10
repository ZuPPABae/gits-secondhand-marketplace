import React from 'react'

export interface BadgeProps {
  children: React.ReactNode
  variant?: 'neutral' | 'available' | 'sold' | 'indigo' | 'danger'
  size?: 'sm' | 'md'
  className?: string
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  size = 'sm',
  className = '',
}) => {
  const baseStyles = 'inline-flex items-center font-medium rounded-md'

  const sizeStyles = {
    sm: 'text-[11px] px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
  }[size]

  const variantStyles = {
    neutral: 'bg-zinc-100 text-zinc-700 border border-zinc-200/60',
    available: 'bg-emerald-50 text-emerald-700 border border-emerald-200/60',
    sold: 'bg-zinc-100 text-zinc-500 border border-zinc-200',
    indigo: 'bg-indigo-50 text-indigo-700 border border-indigo-100',
    danger: 'bg-red-50 text-red-700 border border-red-200/60',
  }[variant]

  return (
    <span className={`${baseStyles} ${sizeStyles} ${variantStyles} ${className}`}>
      {children}
    </span>
  )
}

