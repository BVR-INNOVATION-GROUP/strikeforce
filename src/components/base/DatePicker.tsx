import React, { Activity, HTMLAttributes } from 'react'

export interface Props extends HTMLAttributes<HTMLElement> {
    title?: string
}

const Input = ({ title, defaultValue, onChange, className }: Props) => {
    return (
        <div className={`flex flex-col gap-1 ${className}`}>
            <Activity mode={title ? "visible" : "hidden"}>
                <p className="mb-3 text-sm">{title}</p>
            </Activity>
            <input type="date" className="border p-3  border-custom rounded-lg outline-none" placeholder='title' />
        </div>
    )
}

export default Input