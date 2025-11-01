import React from 'react'
import Logo from './Logo'
import IconButton from '../core/IconButton'
import { Bell } from 'lucide-react'

const Navbar = () => {
    return (
        <div className="h-[8%] bg-paper flex items-center ">
            <div className="max-w-[98vw] w-[96vw] flex items-center justify-between m-auto">
                <Logo />
                <div className="flex items-center gap-8 justify-end">
                    <div>
                        <IconButton icon={<Bell />} indicator />
                    </div>
                    <img src="https://images.pexels.com/photos/2743754/pexels-photo-2743754.jpeg" className='h-11 w-11 rounded-full object-cover' alt="" />
                </div>
            </div>
        </div>
    )
}

export default Navbar