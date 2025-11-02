import React, { ReactNode } from 'react'
import IconButton from '../core/IconButton'

export interface SidebarLinkI {
    icon?: ReactNode
    image?: string
    title: string
    isFocused?: boolean
    path: string
}


const SidebarLink = ({ image, icon, title }: SidebarLinkI) => {
    return (
        <div className=''>
            <IconButton icon={

                icon
                    ?
                    icon
                    :
                    <img src={image} alt="" />

            } />
        </div>
    )
}

export default SidebarLink