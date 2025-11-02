import CurrencyInput from '@/src/components/base/CurrencyInput'
import DatePicker from '@/src/components/base/DatePicker'
import Modal from '@/src/components/base/Modal'
import MultiSelect from '@/src/components/base/MultiSelect'
import Button from '@/src/components/core/Button'
import Input from '@/src/components/core/Input'
import Select, { OptionI } from '@/src/components/core/Select'
import TextArea from '@/src/components/core/TextArea'
import { currenciesArray } from '@/src/constants/currencies'
import React, { ReactNode, useEffect, useState } from 'react'

interface DepartmentI {
    id: string | number
    name: string
}

interface University {
    id: string | number
    name: string
    departments: DepartmentI[]
}

export interface Props {
    open: boolean
    setOpen: (open: boolean) => void
}

const topUgandanUniversities: University[] = [
    {
        id: 1,
        name: "Makerere University",
        departments: [
            { id: 1, name: "Computer Science" },
            { id: 2, name: "Engineering" },
            { id: 3, name: "Medicine" },
            { id: 4, name: "Business Administration" }
        ]
    },
    {
        id: 2,
        name: "Kyambogo University",
        departments: [
            { id: 1, name: "Engineering" },
            { id: 2, name: "Education" },
            { id: 3, name: "Management Science" }
        ]
    },
    {
        id: 3,
        name: "Uganda Christian University",
        departments: [
            { id: 1, name: "Law" },
            { id: 2, name: "Business" },
            { id: 3, name: "Social Sciences" }
        ]
    },
    {
        id: 4,
        name: "Mbarara University of Science and Technology",
        departments: [
            { id: 1, name: "Medicine" },
            { id: 2, name: "Computer Science" },
            { id: 3, name: "Engineering" }
        ]
    },
    { id: 5, name: "Kampala International University", departments: [] },
    { id: 6, name: "Gulu University", departments: [] },
    { id: 7, name: "Ndejje University", departments: [] },
    { id: 8, name: "Uganda Martyrs University", departments: [] },
    { id: 9, name: "Nkumba University", departments: [] },
    { id: 10, name: "Busitema University", departments: [] },
    { id: 11, name: "Islamic University in Uganda", departments: [] },
    { id: 12, name: "Bishop Stuart University", departments: [] },
    { id: 13, name: "Kabale University", departments: [] },
    { id: 14, name: "Uganda Technology and Management University", departments: [] },
];

const ProjectForm = (props: Props) => {
    const [universities] = useState<University[]>(topUgandanUniversities);
    const [university, setUniversity] = useState<OptionI>();
    const [department, setDepartment] = useState<OptionI | null>(null);
    const [currency, setCurrency] = useState<OptionI | null>(null)
    const [title, setTitle] = useState("")
    const [desc, setDesc] = useState("")

    const handleUniversityChange = (o: OptionI) => {
        setUniversity(o)
    }
    const handleDepartmentChange = (o: OptionI) => {
        setDepartment(o)
    }

    const handleCurrencyChange = (o: OptionI) => {
        setCurrency(o)
    }

    const getUniversities = () => {
        return universities?.filter(o => o?.id != university?.value)?.map(u => ({ label: u.name, value: u.id, isSelected: university?.value === u.id }))
    }

    const getDepartments = () => {
        if (university) {
            const foundUniversity = universities?.find(u => u?.id == university?.value)
            const foundDepartments = foundUniversity?.departments?.map(d => ({ label: d?.name, value: d?.id })) ?? []
            return foundDepartments
        }
        return []
    }

    const getCurrencies = () => {
        return currenciesArray?.map(c => ({ icon: c.icon, value: c?.code, isSelected: currency?.value === c?.code, label: c?.code }))
    }

    useEffect(() => {
        setDepartment(null)
    }, [university])

    const [step, setStep] = useState(2)

    const getActions = (): ReactNode[] => {
        switch (step) {
            case 1:

                return [<Button onClick={() => props?.setOpen && props?.setOpen(false)} className='bg-pale'>cancel</Button>, <Button onClick={() => setStep(step + 1)} className='bg-primary'>Continue</Button>]

            case 2:

                return [<Button onClick={() => setStep(step - 1)} className='bg-pale'>back</Button>, <Button className='bg-primary'>Submit new project</Button>]


            default:
                return []
        }
    }

    return (
        <Modal

            open={props?.open}
            actions={getActions()}
            title='Add project' handleClose={() => props?.setOpen && props?.setOpen(false)}>
            <div className="flex flex-col gap-8">

                {
                    step == 1
                        ?
                        <>
                            <Select placeHolder='Select the university' title='Unviersity' onChange={handleUniversityChange} value={university} options={getUniversities()} />
                            <Select placeHolder='Select the Department' title='Department' onChange={handleDepartmentChange} value={department} options={getDepartments()} />
                            <MultiSelect title='Skill required for the project' placeHolder='select skills' />
                        </>
                        :
                        step == 2
                        &&
                        <>
                            <Input title='Project Title' />
                            <TextArea title='Description' />
                            <div className="flex gap-2 flex-end">
                                <div className="flex gap-2 items-end">
                                    <Select placeHolder='Select the currency' title='Currency' onChange={handleCurrencyChange} value={currency} options={getCurrencies()} />
                                    <Input className='flex-1' />
                                </div>
                                <div className="flex-1 ">
                                    <DatePicker title='Deadline' />
                                </div>
                            </div>

                        </>

                }

            </div>

        </Modal>
    )
}

export default ProjectForm