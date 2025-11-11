"use client"
import React, { ComponentPropsWithoutRef, ReactNode } from 'react'
import { motion } from "framer-motion"

export interface Props extends ComponentPropsWithoutRef<'button'> {
    children: ReactNode
}

const Button = ({ children, className = "", onClick, type = "button", disabled, ...props }: Props) => {
    return (
        <motion.button
            type={type}
            onClick={onClick}
            disabled={disabled}
            whileHover={disabled ? {} : { x: -1 }}
            className={`px-6 py-3 rounded flex gap-2 items-center justify-center min-w-max ${
                disabled 
                    ? "opacity-50 cursor-not-allowed" 
                    : "cursor-pointer"
            } ${className}`}
            {...props}
        >
            {children}
        </motion.button>
    )
}

export default Button