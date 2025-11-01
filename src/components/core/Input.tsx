import React, { Activity, HTMLAttributes } from 'react'

export interface Props extends HTMLAttributes<HTMLElement> {
    title?: string
}

const Input = ({ title, defaultValue, onChange }: Props) => {
    return (
        <div className='flex flex-col gap-1'>
            <Activity mode={title ? "visible" : "hidden"}>
                <p className="mb-3 text-sm">{title}</p>
            </Activity>
            <input type="text" className="border p-3  border-gray-200 rounded-lg outline-none" placeholder='title' />
        </div>
    )
}

export default Input