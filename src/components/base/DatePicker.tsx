"use client";
import React, { useState, useRef, useEffect } from "react";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ErrorMessage from "@/src/components/core/ErrorMessage";

export interface Props {
  title?: string;
  value: string;
  onChange: (value: string) => void;
  min?: string;
  max?: string;
  error?: string;
  placeholder?: string;
  onClearError?: (field: string) => void;
}

/**
 * Custom date picker component that adheres to the theme
 * Features calendar popup with theme styling
 */
const DatePicker = ({
  title,
  value,
  onChange,
  min,
  max,
  error,
  placeholder = "Select date",
  onClearError,
}: Props) => {
  const [open, setOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const containerRef = useRef<HTMLDivElement>(null);
  const calendarRef = useRef<HTMLDivElement>(null);

  /**
   * Parse date string or default to today
   */
  const selectedDate = value ? new Date(value) : null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  /**
   * Get minimum date
   */
  const minDate = min ? new Date(min) : null;
  if (minDate) minDate.setHours(0, 0, 0, 0);

  /**
   * Get maximum date
   */
  const maxDate = max ? new Date(max) : null;
  if (maxDate) maxDate.setHours(0, 0, 0, 0);

  /**
   * Initialize current month to selected date or today
   */
  useEffect(() => {
    if (selectedDate) {
      setCurrentMonth(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1));
    } else {
      setCurrentMonth(new Date(today.getFullYear(), today.getMonth(), 1));
    }
  }, [open]);

  /**
   * Close calendar on outside click
   */
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        calendarRef.current &&
        !containerRef.current.contains(event.target as Node) &&
        !calendarRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [open]);

  /**
   * Get days in month
   */
  const getDaysInMonth = (date: Date): number => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  /**
   * Get first day of month (0 = Sunday, 6 = Saturday)
   */
  const getFirstDayOfMonth = (date: Date): number => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  /**
   * Format date for input value (YYYY-MM-DD)
   */
  const formatDateForInput = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  /**
   * Format date for display
   */
  const formatDateForDisplay = (date: Date): string => {
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  /**
   * Check if date is disabled
   */
  const isDateDisabled = (date: Date): boolean => {
    const dateOnly = new Date(date);
    dateOnly.setHours(0, 0, 0, 0);

    if (minDate && dateOnly < minDate) return true;
    if (maxDate && dateOnly > maxDate) return true;
    return false;
  };

  /**
   * Check if date is selected
   */
  const isDateSelected = (date: Date): boolean => {
    if (!selectedDate) return false;
    return (
      date.getDate() === selectedDate.getDate() &&
      date.getMonth() === selectedDate.getMonth() &&
      date.getFullYear() === selectedDate.getFullYear()
    );
  };

  /**
   * Check if date is today
   */
  const isToday = (date: Date): boolean => {
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  /**
   * Handle date selection
   */
  const handleDateSelect = (day: number) => {
    const newDate = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      day
    );

    if (!isDateDisabled(newDate)) {
      onChange(formatDateForInput(newDate));
      setOpen(false);
      onClearError?.("deadline");
    }
  };

  /**
   * Navigate to previous month
   */
  const goToPreviousMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1)
    );
  };

  /**
   * Navigate to next month
   */
  const goToNextMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1)
    );
  };

  /**
   * Generate calendar days
   */
  const generateCalendarDays = (): (number | null)[] => {
    const daysInMonth = getDaysInMonth(currentMonth);
    const firstDay = getFirstDayOfMonth(currentMonth);
    const days: (number | null)[] = [];

    // Empty cells for days before first day of month
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }

    return days;
  };

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className="flex flex-col gap-1" ref={containerRef}>
      {title && <p className="mb-3 text-[12px]">{title}</p>}
      <div className="relative">
        <input
          type="text"
          readOnly
          value={selectedDate ? formatDateForDisplay(selectedDate) : ""}
          onClick={() => {
            setOpen(!open);
            onClearError?.("deadline");
          }}
          placeholder={placeholder}
          className={`border border-custom rounded-lg p-3 w-full cursor-pointer bg-paper ${error ? "border-red-500" : open ? "border-primary" : ""
            }`}
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
          <Calendar size={18} opacity={0.5} />
        </div>

        {/* Calendar Popup */}
        <AnimatePresence>
          {open && (
            <motion.div
              ref={calendarRef}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute bottom-full left-0 mt-2 bg-paper border border-custom rounded-lg shadow-custom-lg z-50 p-4 min-w-[300px]"
            >
              {/* Calendar Header */}
              <div className="flex items-center justify-between mb-4">
                <button
                  type="button"
                  onClick={goToPreviousMonth}
                  className="p-2 rounded hover:bg-pale transition-colors"
                >
                  <ChevronLeft size={16} opacity={0.7} />
                </button>
                <h3 className="text-sm font-medium">
                  {monthNames[currentMonth.getMonth()]}{" "}
                  {currentMonth.getFullYear()}
                </h3>
                <button
                  type="button"
                  onClick={goToNextMonth}
                  className="p-2 rounded hover:bg-pale transition-colors"
                >
                  <ChevronRight size={16} opacity={0.7} />
                </button>
              </div>

              {/* Week Days Header */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {weekDays.map((day) => (
                  <div
                    key={day}
                    className="text-xs text-center p-2 opacity-60 font-medium"
                  >
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Days */}
              <div className="grid grid-cols-7 gap-1">
                {generateCalendarDays().map((day, index) => {
                  if (day === null) {
                    return <div key={`empty-${index}`} className="p-2" />;
                  }

                  const date = new Date(
                    currentMonth.getFullYear(),
                    currentMonth.getMonth(),
                    day
                  );
                  const disabled = isDateDisabled(date);
                  const selected = isDateSelected(date);
                  const isTodayDate = isToday(date);

                  return (
                    <button
                      key={day}
                      type="button"
                      onClick={() => handleDateSelect(day)}
                      disabled={disabled}
                      className={`p-2 text-sm rounded transition-colors ${selected
                        ? "bg-primary text-white"
                        : disabled
                          ? "opacity-30 cursor-not-allowed"
                          : isTodayDate
                            ? "bg-pale-primary text-primary border border-primary"
                            : "hover:bg-pale"
                        }`}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      {error && <ErrorMessage message={error} />}
    </div>
  );
};

export default DatePicker;
