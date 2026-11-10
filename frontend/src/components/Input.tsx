import React from 'react'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helperText?: string
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, className = '', id, required, ...props }, ref) => {
    const generatedId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined)

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={generatedId}
            className="block text-sm font-medium text-zinc-900 mb-1.5"
          >
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        <input
          ref={ref}
          id={generatedId}
          required={required}
          className={`w-full h-10 px-3 py-2 bg-white text-zinc-900 text-sm rounded-lg border transition-colors placeholder:text-zinc-400 focus:outline-none disabled:bg-zinc-100 disabled:text-zinc-500 disabled:cursor-not-allowed ${
            error
              ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20'
              : 'border-zinc-300 hover:border-zinc-400 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20'
          } ${className}`}
          {...props}
        />
        {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
        {!error && helperText && (
          <p className="mt-1 text-xs text-zinc-500">{helperText}</p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'

