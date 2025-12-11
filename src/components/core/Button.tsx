"use client"
import React, { ComponentPropsWithoutRef, ReactNode } from 'react'
import { motion } from "framer-motion"
import { Loader2 } from "lucide-react"

export interface Props extends ComponentPropsWithoutRef<'button'> {
    children: ReactNode
    loading?: boolean
}

const Button = ({ children, className = "", onClick, type = "button", disabled, loading = false, ...props }: Props) => {
    const isDisabled = disabled || loading;
    
    return (
        <motion.button
            type={type}
            onClick={onClick}
            disabled={isDisabled}
            whileHover={isDisabled ? {} : { x: -1 }}
            className={`px-6 py-3 rounded flex gap-2 items-center justify-center min-w-max ${
                isDisabled 
                    ? "opacity-50 cursor-not-allowed" 
                    : "cursor-pointer"
            } ${className}`}
            {...props}
        >
            {loading && <Loader2 size={16} className="animate-spin" />}
            {children}
        </motion.button>
    )
}

export default Button