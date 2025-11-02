import { X } from 'lucide-react'
import React, { ReactNode } from 'react'
import IconButton from '../core/IconButton'
import { motion } from "framer-motion"

export interface Props {
    title?: string
    children: ReactNode
    actions?: ReactNode[]
    handleClose: () => void
    open?: boolean
}

const Modal = (props: Props) => {
    return (
        props?.open
        &&
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className='bg-black/20 backdrop-blur-sm z-[15]  h-[100vh] w-[100vw] fixed top-0 left-0 flex items-center justify-center' >

            <motion.div
                transition={{ delay: .1 }}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-paper shadow-custom rounded-lg min-w-[40%] max-w-[60%] p-8 max-h-[90%]">

                <div className='flex items-center justify-between'>
                    <div className='font-[600]'>
                        {props?.title}
                    </div>
                    <IconButton onClick={() => props?.handleClose()} icon={<X />} className='hover-bg-pale' />
                </div>

                <div className='mt-6'>
                    {props?.children}
                </div>

                <div className='flex mt-10 items-center justify-end gap-2'>
                    {
                        props?.actions?.map((a, i) => <span key={i}>{a}</span>)
                    }
                </div>

            </motion.div>

        </motion.div>
    )
}

export default Modal