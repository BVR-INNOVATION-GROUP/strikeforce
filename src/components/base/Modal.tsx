"use client";

import { X } from 'lucide-react'
import React, { ReactNode, useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import IconButton from '../core/IconButton'
import { motion, AnimatePresence } from "framer-motion"

export interface Props {
    title?: string
    children: ReactNode
    actions?: ReactNode[]
    handleClose: () => void
    open?: boolean
}

const Modal = (props: Props) => {
    const [mounted, setMounted] = useState(false);

    // Ensure component is mounted (for portal)
    useEffect(() => {
        console.log('[DEBUG Modal] Component mounting');
        setMounted(true);
        return () => {
            console.log('[DEBUG Modal] Component unmounting');
            setMounted(false);
        };
    }, []);

    // Debug logging
    useEffect(() => {
        console.log('[DEBUG Modal] Props changed - open:', props?.open, 'mounted:', mounted, 'title:', props?.title);
    }, [props?.open, mounted, props?.title]);

    // Don't render if not mounted or not open
    if (!mounted) {
        console.log('[DEBUG Modal] Not rendering - not mounted');
        return null;
    }
    if (!props?.open) {
        console.log('[DEBUG Modal] Not rendering - not open');
        return null;
    }
    
    console.log('[DEBUG Modal] Rendering modal content');

    const modalContent = (
        <AnimatePresence mode="wait">
            {props?.open && (
                <motion.div
                    key="modal-backdrop"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={props.handleClose}
                    className='bg-black/20 backdrop-blur-sm h-[100vh] w-[100vw] fixed top-0 left-0 flex items-center justify-center'
                    style={{ zIndex: 100000 }}
                >
                    {/* Modal Content */}
                    <motion.div
                        key="modal-content"
                        transition={{ delay: .1 }}
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 30 }}
                        onClick={(e) => {
                            console.log('[DEBUG Modal] Content clicked, stopping propagation');
                            e.stopPropagation();
                        }}
                        className="bg-paper shadow-custom rounded-lg min-w-[40%] max-w-[60%] max-h-[90%] flex flex-col"
                        style={{ zIndex: 100001 }}
                    >
                        {/* Header - fixed height */}
                        <div className='flex items-center justify-between p-8 pb-6 flex-shrink-0'>
                            <div className='font-[600]'>
                                {props?.title}
                            </div>
                            <IconButton onClick={() => {
                                console.log('[DEBUG Modal] Close button clicked');
                                props?.handleClose();
                            }} icon={<X />} className='hover-bg-pale' />
                        </div>

                        {/* Content area - scrollable with fixed max height */}
                        <div className='px-8 flex-1 overflow-y-auto min-h-0'>
                            {props?.children}
                        </div>

                        {/* Footer - fixed height */}
                        <div className='flex mt-6 mb-8 px-8 items-center justify-end gap-2 flex-shrink-0'>
                            {
                                props?.actions?.map((a, i) => <span key={i}>{a}</span>)
                            }
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );

    // Render modal in a portal to ensure it's at the root level
    return createPortal(modalContent, document.body);
}

export default Modal