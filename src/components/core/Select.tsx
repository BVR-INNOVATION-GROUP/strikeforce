"use client"
import { ChevronDown, ChevronUp, SearchSlash } from 'lucide-react'
import React, { Activity, useState } from 'react'
import { motion } from "framer-motion"

export interface OptionI {
    label: string
    value: string | number
    isSelected?: boolean
    onChange?: (value: OptionI) => void
}

export interface Props {
    title?: string
    options: OptionI[]
    value?: OptionI | null
    onChange: (value: OptionI) => void
    placeHolder: string
}

const Option = (o: OptionI) => {
    return (
        <div
            onClick={() => o?.onChange ? o?.onChange(o) : null}
            className={`p-4 cursor-pointer rounded hover-bg-pale `}>
            {o.label}
        </div>
    )
}

const Select = (props: Props) => {

    const [open, setOpen] = useState(false)

    return (
        <div>
            <Activity mode={props?.title ? "visible" : "hidden"}>
                <p className='mb-3 text-[12px]'>{props?.title}</p>
            </Activity>
            <div

                onClick={() => setOpen(!open)}
                className='border relative border-gray-200  rounded-lg p-3 flex items-center justify-between'>
                <span>{props?.value ? props?.value?.label : props?.placeHolder}</span>
                {
                    open
                        ?
                        <ChevronUp size={17} opacity={.7} />
                        :
                        <ChevronDown size={17} opacity={.7} />
                }

                {/* dowpdown */}
                {
                    open && <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-paper rounded-lg z-50 flex flex-col p-4 overflow-y-scroll  absolute top-[110%] max-h-[40vh] shadow-custom w-full min-h-[20vh] left-0">

                        {

                            props?.options?.length == 0
                                ?
                                <div className="flex flex-col text-center items-center justify-center">
                                    {/* <SearchSlash size={40} className='opacity-30 mb-6 mt-12' /> */}
                                    <p className="text-2xl mt-6">No projects found</p>
                                    <p className='text-[12px] opacity-50 mt-3 max-w-[60%]'>no data found for the selected section</p>
                                </div>
                                :
                                props?.options?.map((o, i) => <Option key={i} {...o} onChange={props?.onChange} />)
                        }

                    </motion.div>
                }
            </div>
        </div>
    )
}

export default Select