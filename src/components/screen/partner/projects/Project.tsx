"use client"
import { Clock } from 'lucide-react'
import React, { useRef, useState } from 'react'
import { motion } from "framer-motion"

export interface UserI {
    avatar: string
    name: string
}

export interface GroupI {
    name: string
    members: UserI[]
}

export type projectStatus = "in-progress" | "on-hold" | "completed"

export interface ProjectI {
    id: number | string
    title: string
    description: string
    skills: string[]
    status: projectStatus
    group: GroupI
    expiryDate: string
    cost: string
    onMove?: (projectId: number | string, currentProjectStatus: projectStatus, x: number) => void
}

const Project = (p: ProjectI) => {

    const moveRef = useRef(false)

    const handleDrag = (x: number) => {
        // p?.onMove && p?.onMove(p?.id, p?.status, x)
        if (!moveRef.current && p?.onMove) {
            moveRef.current = true
            p.onMove(p?.id, p?.status, x)
        }
    }

    const handleDragEnd = () => {
        moveRef.current = false
    }

    return (
        <motion.div
            drag={p.status != "completed"}
            dragSnapToOrigin
            // dragElastic={0}
            dragConstraints={{ left: p?.status == "in-progress" ? 200 : 0, right: p.status == "on-hold" ? 0 : 200 }}
            onDragEnd={() => handleDragEnd()}
            onDrag={(_, i) => handleDrag(i?.point?.x)}
            className='rounded-lg p-8 bg-pale'>
            <h3 className="text-[1rem] font-[600]">{p.title}</h3>
            <p className='my-3 mb-6 opacity-60'>{p.description}</p>
            <div className="flex flex-wrap gap-3 items-center">
                {
                    p?.skills?.map((s, i) => <div key={i} className='rounded-full bg-very-pale px-4 py-2'>{s}</div>)
                }
            </div>
            <div className="my-3 flex items-center ">
                {
                    p?.group?.members?.map((m, i) => <img
                        style={{
                            transform: `translateX(-${i * 12}px)`,

                        }}
                        key={i} src={m?.avatar} className={`h-12  w-12 border-2 border-pale rounded-full object-cover`} />)
                }
            </div>

            <div className="flex mt-8 items-center justify-between">
                <p className='underline'>{p?.cost}</p>
                <p className='font-[500] opacity-50 flex items-center gap-2'> <Clock size={14} /> {p?.expiryDate}</p>
            </div>
        </motion.div>
    )
}

export default Project