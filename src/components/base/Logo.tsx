"use client";

import React, { useState } from 'react'
import { useAuthStore } from '@/src/store'
import { BASE_URL } from '@/src/api/client'

const Logo = () => {
    const { organization } = useAuthStore();
    const [imageError, setImageError] = useState(false);

    // If organization has a logo, display it
    if (organization?.logo && !imageError) {
        const logoUrl = organization.logo.startsWith("http") 
            ? organization.logo 
            : `${BASE_URL}/${organization.logo}`;
        
        return (
            <div className='flex ml-[1vw] items-center justify-center'>
                <img 
                    src={logoUrl} 
                    alt={organization.name || "Organization Logo"} 
                    className="h-12 w-auto object-contain max-w-[200px]"
                    onError={() => {
                        setImageError(true);
                    }}
                />
            </div>
        );
    }

    // Default logo
    return (
        <div className='flex ml-[1vw] items-center justify-center gap-1 flex-col'>
            <div className="bg-primary rounded-lg px-4  py-1">
                <p className="text-2xl font-bold uppercase text-white">s</p>
            </div>
            <div className="bg-primary rounded-lg h-1 w-1"></div>
        </div>
    )
}

export default Logo