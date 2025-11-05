"use client"
import { ChevronDown, ChevronUp, X } from 'lucide-react'
import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from "framer-motion"
import ErrorMessage from '@/src/components/core/ErrorMessage'

export interface OptionI {
    label: string
    icon?: string
    value: string | number
}

export interface Props {
    title?: string
    options?: OptionI[]
    value?: OptionI[]
    onChange?: (value: OptionI[]) => void
    placeHolder?: string
    error?: string
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
}

/**
 * Individual selectable option component
 * Highlights if already selected
 */
const Option = ({ option, isSelected, onToggle }: { option: OptionI; isSelected: boolean; onToggle: () => void }) => {
    return (
        <div
            onClick={onToggle}
            className={`p-4 cursor-pointer rounded flex items-center gap-2 transition-colors ${isSelected
                ? 'bg-pale-primary text-primary'
                : 'hover:bg-pale'
                }`}
        >
            {option?.icon && <span>{option.icon}</span>}
            <span className="flex-1">{option.label}</span>
            {isSelected && (
                <span className="text-primary text-sm font-medium">✓</span>
            )}
        </div>
    )
}

/**
 * Selected chip component that can be removed
 */
const Chip = ({ option, onRemove }: { option: OptionI; onRemove: () => void }) => {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="flex items-center gap-1 bg-pale-primary text-primary rounded-full px-3 py-1 text-sm"
        >
            {option?.icon && <span className="text-xs">{option.icon}</span>}
            <span>{option.label}</span>
            <button
                type="button"
                onClick={(e) => {
                    e.stopPropagation()
                    onRemove()
                }}
                className="ml-1 hover:bg-primary  rounded-full p-0.5 transition-colors"
            >
                <X size={12} />
            </button>
        </motion.div>
    )
}

/**
 * MUI-style autocomplete multi-select component
 * Features:
 * - Search/filter functionality
 * - Multiple selection with chips
 * - Smart dropdown positioning
 * - Keyboard navigation
 * - Click outside to close
 */
const MultiSelect = (props: Props) => {
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
        maxHeight: 0
    })

    const selectedValues = props.value || []
    const selectedValueSet = useMemo(() => {
        return new Set(selectedValues.map(v => v.value))
    }, [selectedValues])

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
        const viewportWidth = window.innerWidth
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
     * Filters options based on search query
     */
    const filteredOptions = useMemo(() => {
        if (!props.options) return []
        if (!searchQuery.trim()) return props.options

        const query = searchQuery.toLowerCase()
        return props.options.filter(option =>
            option.label.toLowerCase().includes(query)
        )
    }, [props.options, searchQuery])

    /**
     * Updates dropdown position when open state or viewport changes
     * Also handles closing dropdown when clicking outside
     */
    useEffect(() => {
        if (!open) return

        // Calculate initial position
        const updatePosition = () => {
            setPosition(calculatePosition())
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
                setSearchQuery('')
            }
        }

        document.addEventListener('mousedown', handleClickOutside)

        // Focus input when dropdown opens
        if (inputRef.current) {
            inputRef.current.focus()
        }

        return () => {
            window.removeEventListener('resize', updatePosition)
            window.removeEventListener('scroll', updatePosition, true)
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [open, calculatePosition])

    /**
     * Toggles option selection
     */
    const toggleOption = (option: OptionI) => {
        if (!props.onChange) return

        const isSelected = selectedValueSet.has(option.value)
        let newSelected: OptionI[]

        if (isSelected) {
            // Remove from selection
            newSelected = selectedValues.filter(v => v.value !== option.value)
        } else {
            // Add to selection
            newSelected = [...selectedValues, option]
        }

        props.onChange(newSelected)
    }

    /**
     * Removes a selected chip
     */
    const removeChip = (option: OptionI) => {
        if (!props.onChange) return
        const newSelected = selectedValues.filter(v => v.value !== option.value)
        props.onChange(newSelected)
    }

    /**
     * Handles keyboard navigation
     */
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Escape') {
            setOpen(false)
            setSearchQuery('')
        }
    }

    return (
        <div>
            {props?.title && <p className='mb-3 text-[12px]'>{props?.title}</p>}

            {/* Selected chips - displayed above input */}
            {selectedValues.length > 0 && (
                <div className="flex items-center gap-2 flex-wrap mb-2">
                    <AnimatePresence>
                        {selectedValues.map((option) => (
                            <Chip
                                key={option.value}
                                option={option}
                                onRemove={() => removeChip(option)}
                            />
                        ))}
                    </AnimatePresence>
                </div>
            )}

            <div
                ref={triggerRef}
                onClick={() => {
                    setOpen(!open)
                    if (!open) {
                        setTimeout(() => inputRef.current?.focus(), 0)
                    }
                }}
                className={`border relative border-custom rounded-lg min-h-[48px] p-2 flex items-center gap-2 ${props.error ? 'border-red-500' : ''
                    } ${open ? 'border-primary' : ''}`}
            >
                {/* Combined search input (always visible) */}
                <input
                    ref={inputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onClick={(e) => {
                        e.stopPropagation()
                        if (!open) {
                            setOpen(true)
                        }
                    }}
                    onFocus={() => setOpen(true)}
                    className="flex-1 min-w-[120px] outline-none bg-transparent text-sm"
                    placeholder={selectedValues.length === 0 ? (props?.placeHolder || 'Search options...') : 'Search options...'}
                />

                {/* Chevron icon */}
                <button
                    type="button"
                    onClick={(e) => {
                        e.stopPropagation()
                        setOpen(!open)
                        if (!open) {
                            setTimeout(() => inputRef.current?.focus(), 0)
                        }
                    }}
                    className="flex-shrink-0"
                >
                    {open ? (
                        <ChevronUp size={17} opacity={0.7} />
                    ) : (
                        <ChevronDown size={17} opacity={0.7} />
                    )}
                </button>

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
                                    zIndex: 100002 // Higher than modal content (100001) and side panel (99999) to ensure visibility
                                }}
                                className="bg-paper rounded-lg flex flex-col shadow-custom-lg border border-custom"
                            >
                                {/* Options list */}
                                <div className="overflow-y-auto flex flex-col p-2">
                                    {filteredOptions.length === 0 ? (
                                        <div className="flex flex-col text-center items-center justify-center py-8">
                                            <p className="text-lg mt-2">No options found</p>
                                            <p className='text-[12px] opacity-50 mt-2 max-w-[80%]'>
                                                {searchQuery
                                                    ? `No results for "${searchQuery}"`
                                                    : 'No options available'}
                                            </p>
                                        </div>
                                    ) : (
                                        filteredOptions.map((option) => (
                                            <Option
                                                key={option.value}
                                                option={option}
                                                isSelected={selectedValueSet.has(option.value)}
                                                onToggle={() => toggleOption(option)}
                                            />
                                        ))
                                    )}
                                </div>
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

export default MultiSelect