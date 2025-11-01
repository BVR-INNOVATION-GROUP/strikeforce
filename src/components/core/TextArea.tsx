import React, { Activity, HTMLAttributes } from 'react'

export interface Props extends HTMLAttributes<HTMLElement> {
    title?: string
}

const TextArea = ({ title }: Props) => {
    return (
        <div className='flex flex-col gap-1'>
            <Activity mode={title ? "visible" : "hidden"}>
                <p className="mb-3 text-sm">{title}</p>
            </Activity>

            <textarea rows={6} placeholder='About the project' className="border p-3  border-gray-200 rounded-lg outline-none">
            </textarea>
        </div>
    )
}

export default TextArea