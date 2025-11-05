import React, { ComponentPropsWithoutRef } from 'react'
import ErrorMessage from './ErrorMessage'

export interface Props extends ComponentPropsWithoutRef<'input'> {
    title?: string
    error?: string
}

/**
 * Input component with error message support
 */
const Input = ({ title, defaultValue, value, onChange, className = "", placeholder, error, ...props }: Props) => {
    return (
        <div className={`flex flex-col gap-1 ${className}`}>
            {title && <p className="mb-3 text-sm">{title}</p>}
            <input
                type="text"
                className={`border p-3 text-base border-custom rounded-lg outline-none ${error ? 'border-red-500 focus:border-red-500' : 'focus:border-primary'
                    }`}
                placeholder={placeholder}
                defaultValue={defaultValue}
                value={value}
                onChange={onChange}
                {...props}
            />
            {error && <ErrorMessage message={error} />}
        </div>
    )
}

export default Input