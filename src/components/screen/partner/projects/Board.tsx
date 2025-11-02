"use client"
import React from 'react'
import Project, { ProjectI, projectStatus } from './Project'
import { SearchSlash } from 'lucide-react'

export interface Props {
    title: string
    content: ProjectI[]
    onMove?: (projectId: number | string, currentProjectStatus: projectStatus, x: number) => void
}

const Board = (props: Props) => {
    return (
        <div className="flex-1 z-[5] bg-paper flex flex-col rounded-lg overflow-hidden">

            <div className="bg-primary p-5">
                {props?.title}
            </div>

            <div className=" h-[70vh]  flex-col gap-3 flex p-4 overflow-y-scroll">
                {
                    props?.content?.length == 0
                        ?
                        <div className="flex flex-col text-center items-center justify-center">
                            <SearchSlash size={40} className='opacity-30 mb-6 mt-12' />
                            <p className="text-2xl">No projects found</p>
                            <p className='text-[12px] opacity-50 mt-3 max-w-[60%]'>consider adding projects or if you have some on-hold projects drag them to the left</p>
                        </div>
                        :

                        props?.content?.map((p, i) => <Project {...p} onMove={props?.onMove} key={i} />)
                }
            </div>

        </div>
    )
}

export default Board