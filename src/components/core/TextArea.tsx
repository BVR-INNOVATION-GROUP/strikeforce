import React, { ComponentPropsWithoutRef } from 'react'
import ErrorMessage from './ErrorMessage'

export interface Props extends ComponentPropsWithoutRef<'textarea'> {
    title?: string
    error?: string
}

/**
 * TextArea component with error message support
 */
const TextArea = ({ title, value, onChange, className = "", placeholder, rows = 6, error, ...props }: Props) => {
    return (
        <div className={`flex flex-col gap-1 ${className}`}>
            {title && <p className="mb-3 text-sm">{title}</p>}
            <textarea
                rows={rows}
                placeholder={placeholder}
                className={`border p-3 border-custom rounded-lg outline-none ${
                    error ? 'border-red-500 focus:border-red-500' : 'focus:border-primary'
                }`}
                value={value}
                onChange={onChange}
                {...props}
            />
            {error && <ErrorMessage message={error} />}
        </div>
    )
}

export default TextArea