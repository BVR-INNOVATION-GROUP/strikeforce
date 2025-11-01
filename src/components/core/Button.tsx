"use client"
import React, { HTMLAttributes, ReactNode } from 'react'
import { motion } from "framer-motion"

export interface Props extends HTMLAttributes<HTMLButtonElement> {
    children: ReactNode
}

const Button = ({ children, className, onClick }: Props) => {
    return (
        <motion.button
            onClick={onClick}
            whileHover={{ y: -2 }}
            className={`px-6 py-3 rounded cursor-pointer ${className}`}>
            {children}
        </motion.button>
    )
}

export default Button