"use client"
import React, { useState } from 'react'
import Project, { ProjectI, projectStatus } from './Project'
import { SearchSlash } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export interface Props {
    title: string
    content: ProjectI[]
    onMove?: (projectId: number | string, currentProjectStatus: projectStatus, x: number) => void
}

const Board = (props: Props) => {
    const [isDraggingOver, setIsDraggingOver] = useState(false)

    return (
        <motion.div 
            className="flex-1 z-[5] bg-paper flex flex-col rounded-lg overflow-hidden"
            initial={false}
            animate={{
                backgroundColor: isDraggingOver ? 'rgba(233, 34, 110, 0.05)' : undefined,
                borderWidth: isDraggingOver ? '2px' : '0px',
                borderColor: isDraggingOver ? 'rgba(233, 34, 110, 0.3)' : 'transparent',
                borderStyle: isDraggingOver ? 'dashed' : 'solid'
            }}
            transition={{ duration: 0.2 }}
        >
            <div className="bg-primary p-5 text-white font-semibold">
                {props?.title}
            </div>

            <div 
                className="h-[70vh] flex-col gap-3 flex p-4 overflow-y-auto"
                onDragEnter={() => setIsDraggingOver(true)}
                onDragLeave={(e) => {
                    // Only set false if we're leaving the drop zone entirely
                    const rect = e.currentTarget.getBoundingClientRect();
                    const x = e.clientX;
                    const y = e.clientY;
                    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
                        setIsDraggingOver(false);
                    }
                }}
                onDrop={() => setIsDraggingOver(false)}
            >
                <AnimatePresence mode="popLayout">
                    {props?.content?.length == 0 ? (
                        <motion.div
                            key="empty-state"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="flex flex-col text-center items-center justify-center flex-1"
                        >
                            <SearchSlash size={40} className='opacity-30 mb-6 mt-12' />
                            <p className="text-2xl">No projects found</p>
                            <p className='text-[12px] opacity-50 mt-3 max-w-[60%]'>
                                {props.onMove 
                                    ? "consider adding projects or if you have some on-hold projects drag them to the left"
                                    : "no projects in this category"}
                            </p>
                        </motion.div>
                    ) : (
                        props?.content?.map((p, i) => (
                            <Project 
                                {...p} 
                                onMove={props?.onMove} 
                                key={p.id}
                                index={i}
                            />
                        ))
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    )
}

export default Board