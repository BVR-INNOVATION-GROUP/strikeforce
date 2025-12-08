"use client"
import { ChevronDown, ChevronUp } from 'lucide-react'
import React, { useState, useRef, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from "framer-motion"
import ErrorMessage from './ErrorMessage'

export interface OptionI {
    label: string
    icon?: string
    value: string | number
    isSelected?: boolean
    onChange?: (value: OptionI) => void
}

export interface Props {
    title?: string
    options: OptionI[]
    value?: OptionI | string | null
    onChange: (value: OptionI | string) => void
    placeHolder: string
    error?: string
    searchable?: boolean // Enable typing/search functionality
}

const Option = (o: OptionI & { onSelect?: (option: OptionI) => void }) => {
    return (
        <div
            onClick={(e) => {
                e.stopPropagation();
                if (o?.onSelect) {
                    o.onSelect(o);
                } else if (o?.onChange) {
                    o.onChange(o);
                }
            }}
            className={`p-4 cursor-pointer rounded flex items-center gap-2 hover-bg-pale `}>
            {o?.icon && <span>{o?.icon}</span>}
            <span> {o.label}</span>
        </div>
    )
}

/**
 * Interface for dropdown positioning state
 * Calculates optimal position based on available viewport space
 */
interface DropdownPosition {
    position: 'above' | 'below'
    left: number
    top: number
    width: number
    maxHeight: number
    viewportLeft: number
    viewportTop: number
}

const Select = (props: Props) => {
    const [open, setOpen] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const triggerRef = useRef<HTMLDivElement>(null)
    const dropdownRef = useRef<HTMLDivElement>(null)
    const inputRef = useRef<HTMLInputElement>(null)
    const [position, setPosition] = useState<DropdownPosition>({
        position: 'below',
        left: 0,
        top: 0,
        width: 0,
        maxHeight: 0,
        viewportLeft: 0,
        viewportTop: 0
    })

    // Filter options based on search query when searchable
    const filteredOptions = props.searchable && searchQuery
        ? props.options.filter(option => 
            String(option.label).toLowerCase().includes(searchQuery.toLowerCase()) ||
            String(option.value).toLowerCase().includes(searchQuery.toLowerCase())
          )
        : props.options

    /**
     * Calculates optimal dropdown position based on viewport and trigger element position
     * Considers available space above, below, left, and right of the trigger
     * Returns viewport-relative coordinates for portal rendering
     */
    const calculatePosition = useCallback((): DropdownPosition & { viewportLeft: number; viewportTop: number } => {
        if (!triggerRef.current) {
            return {
                position: 'below',
                left: 0,
                top: 0,
                width: 0,
                maxHeight: 0,
                viewportLeft: 0,
                viewportTop: 0
            }
        }

        const triggerRect = triggerRef.current.getBoundingClientRect()
        const viewportHeight = window.innerHeight

        // Calculate available space above and below
        const spaceAbove = triggerRect.top
        const spaceBelow = viewportHeight - triggerRect.bottom

        // Default position is below - only open above if there's insufficient space below
        // (less than 150px) and significantly more space above (at least 50px more)
        const position: 'above' | 'below' = spaceBelow < 150 && spaceAbove > spaceBelow + 50 ? 'above' : 'below'

        // Calculate max height based on available space
        const availableVerticalSpace = position === 'above' ? spaceAbove : spaceBelow
        // Reserve some margin (40px) and use 80% of available space max, with 40vh as upper limit
        const maxHeight = Math.min(
            Math.max(availableVerticalSpace - 40, 150), // Minimum 150px, account for margin
            Math.min(viewportHeight * 0.4, 400) // Max 40vh or 400px, whichever is smaller
        )

        // Calculate horizontal position and width
        // Use full trigger width and align with trigger's left edge
        const width = triggerRect.width
        const left = 0

        // Calculate top position relative to trigger
        const top = position === 'above'
            ? -(availableVerticalSpace - 16) // Position above with 16px gap
            : triggerRect.height + 4 // Position below with 4px gap

        // Calculate viewport-relative positions for portal rendering
        const viewportLeft = triggerRect.left
        const viewportTop = position === 'above'
            ? triggerRect.top - availableVerticalSpace + 16
            : triggerRect.bottom + 4

        return {
            position,
            left,
            top,
            width,
            maxHeight,
            viewportLeft,
            viewportTop
        }
    }, [])

    /**
     * Updates dropdown position when open state or viewport changes
     * Also handles closing dropdown when clicking outside
     */
    useEffect(() => {
        if (!open) return

        // Calculate initial position
        const updatePosition = () => {
            const pos = calculatePosition()
            setPosition({
                position: pos.position,
                left: pos.left,
                top: pos.top,
                width: pos.width,
                maxHeight: pos.maxHeight,
                viewportLeft: pos.viewportLeft,
                viewportTop: pos.viewportTop
            })
        }

        // Update position on mount and when open
        updatePosition()

        // Handle window resize and scroll
        window.addEventListener('resize', updatePosition)
        window.addEventListener('scroll', updatePosition, true) // Use capture to catch all scrolls

        // Handle click outside to close
        const handleClickOutside = (event: MouseEvent) => {
            if (
                triggerRef.current &&
                dropdownRef.current &&
                !triggerRef.current.contains(event.target as Node) &&
                !dropdownRef.current.contains(event.target as Node)
            ) {
                setOpen(false)
                if (props.searchable) {
                    setSearchQuery('')
                }
            }
        }

        document.addEventListener('mousedown', handleClickOutside)

        return () => {
            window.removeEventListener('resize', updatePosition)
            window.removeEventListener('scroll', updatePosition, true)
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [open, calculatePosition])

    /**
     * Closes dropdown when an option is selected
     */
    const handleOptionSelect = (option: OptionI) => {
        props.onChange(option)
        setOpen(false)
        setSearchQuery('') // Clear search when option is selected
    }

    // Focus input when dropdown opens and searchable is enabled
    useEffect(() => {
        if (open && props.searchable && inputRef.current) {
            inputRef.current.focus()
        }
    }, [open, props.searchable])

    return (
        <div>
            {props?.title && <p className='mb-3 text-[12px]'>{props?.title}</p>}
            <div
                ref={triggerRef}
                onClick={() => {
                    if (!props.searchable) {
                        setOpen(!open)
                    } else {
                        setOpen(true)
                    }
                }}
                className={`border relative border-custom rounded-lg p-3 flex items-center justify-between ${props.error ? 'border-red-500' : ''
                    }`}>
                {props.searchable && open ? (
                    <input
                        ref={inputRef}
                        type="text"
                        value={searchQuery}
                        onChange={(e) => {
                            setSearchQuery(e.target.value)
                            if (!open) setOpen(true)
                        }}
                        onClick={(e) => e.stopPropagation()}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && filteredOptions.length > 0) {
                                handleOptionSelect(filteredOptions[0])
                            } else if (e.key === 'Escape') {
                                setOpen(false)
                                setSearchQuery('')
                            }
                        }}
                        className="flex-1 min-w-0 outline-none bg-transparent text-sm"
                        placeholder={props?.placeHolder}
                    />
                ) : (
                    <span className="flex-1 min-w-0">{props?.value ?
                        <div
                            className={`cursor-pointer rounded flex items-center gap-2 hover-bg-pale whitespace-nowrap overflow-hidden`}>
                            {typeof props.value === 'string' ? (
                                <span className="truncate">{props.options.find(o => String(o.value) === String(props.value))?.label || props.value}</span>
                            ) : (
                                <>
                                    {props?.value?.icon && <span className="flex-shrink-0">{props?.value?.icon}</span>}
                                    <span className="truncate"> {props?.value?.label}</span>
                                </>
                            )}
                        </div>
                        : props?.placeHolder}</span>
                )}
                <span className="flex-shrink-0">
                    {
                        open
                            ?
                            <ChevronUp size={17} opacity={.7} />
                            :
                            <ChevronDown size={17} opacity={.7} />
                    }
                </span>

                {/* Dropdown - rendered in portal to appear above modals */}
                {open && typeof document !== 'undefined' && createPortal(
                    <AnimatePresence>
                        {open && (
                            <motion.div
                                ref={dropdownRef}
                                initial={{ opacity: 0, y: position.position === 'above' ? 10 : -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: position.position === 'above' ? 10 : -10 }}
                                style={{
                                    position: 'fixed',
                                    left: `${position.viewportLeft}px`,
                                    top: `${position.viewportTop}px`,
                                    width: `${position.width}px`,
                                    maxHeight: `${position.maxHeight}px`,
                                    zIndex: 100002 // Higher than modal backdrop (100000) and modal content (100001) to ensure visibility
                                }}
                                className="bg-paper rounded-lg flex flex-col p-4 overflow-y-auto shadow-custom-lg">
                                {
                                    filteredOptions?.length == 0
                                        ?
                                        <div className="flex flex-col text-center items-center justify-center">
                                            <p className="text-2xl mt-6">No Options found</p>
                                            <p className='text-[12px] opacity-50 mt-3 max-w-[60%]'>
                                                {props.searchable && searchQuery ? 'No matching results' : 'no data found for the selected section'}
                                            </p>
                                        </div>
                                        :
                                        filteredOptions?.map((o, i) => (
                                            <Option
                                                key={i}
                                                {...o}
                                                onSelect={(option) => handleOptionSelect(option)}
                                            />
                                        ))
                                }
                            </motion.div>
                        )}
                    </AnimatePresence>,
                    document.body
                )}
            </div>
            {props.error && <ErrorMessage message={props.error} />}
        </div>
    )
}

export default Select