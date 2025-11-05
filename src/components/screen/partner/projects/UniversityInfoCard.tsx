/**
 * UniversityInfoCard - displays university, department, and course
 */
import React from 'react'
import Card from '@/src/components/core/Card'
import { Building2, GraduationCap, FileText } from 'lucide-react'

export interface Props {
    university: string
    department: string
    course: string
}

const UniversityInfoCard = (props: Props) => {
    const { university, department, course } = props

    return (
        <Card title="University & Course">
            <div className="flex flex-col gap-4">
                <div className="flex items-center gap-3">
                    <Building2 size={20} className="opacity-60" />
                    <span className="text-[0.875rem] font-[500]">{university}</span>
                </div>
                <div className="flex items-center gap-3">
                    <GraduationCap size={20} className="opacity-60" />
                    <span className="text-[0.875rem] font-[500]">{department}</span>
                </div>
                <div className="flex items-center gap-3">
                    <FileText size={20} className="opacity-60" />
                    <span className="text-[0.875rem] font-[500]">{course}</span>
                </div>
            </div>
        </Card>
    )
}

export default UniversityInfoCard

