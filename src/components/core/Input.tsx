import React, { ComponentPropsWithoutRef, ReactNode } from 'react'
import ErrorMessage from './ErrorMessage'

export interface Props extends ComponentPropsWithoutRef<'input'> {
    title?: string
    error?: string
    rightElement?: ReactNode
}

/**
 * Input component with error message support
 */
const Input = ({ title, defaultValue, value, onChange, className = "", placeholder, error, rightElement, ...props }: Props) => {
    return (
        <div className={`flex flex-col gap-1 ${className}`}>
            {title && <p className="mb-3 text-sm">{title}</p>}
            <div className="relative">
                <input
                    type="text"
                    className={`border p-3 text-base border-custom rounded-lg outline-none w-full ${rightElement ? 'pr-10' : ''} ${error ? 'border-red-500 focus:border-red-500' : 'focus:border-primary'
                        }`}
                    placeholder={placeholder}
                    defaultValue={defaultValue}
                    value={value}
                    onChange={onChange}
                    {...props}
                />
                {rightElement && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center">
                        {rightElement}
                    </div>
                )}
            </div>
            {error && <ErrorMessage message={error} />}
        </div>
    )
}

export default Input