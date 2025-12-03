"use client";
import React, { useState, useEffect, useRef } from "react";
import { currenciesArray, CurrencyI } from "@/src/constants/currencies";
import { OptionI } from "@/src/components/core/Select";
import ErrorMessage from "@/src/components/core/ErrorMessage";
import { ChevronDown } from "lucide-react";

export interface Props {
  title?: string;
  currency: OptionI | null;
  amount: string;
  onCurrencyChange: (currency: OptionI | string) => void;
  onAmountChange: (amount: string) => void;
  currencyError?: string;
  amountError?: string;
  onClearError?: (field: string) => void;
  placeholder?: string;
}

/**
 * Format number string with thousand separators (commas)
 */
const formatWithCommas = (value: string): string => {
  if (!value || value === "") return "";
  let cleaned = value.replace(/[^\d.]/g, "");
  const parts = cleaned.split(".");
  if (parts.length > 2) {
    cleaned = parts[0] + "." + parts.slice(1).join("");
  }
  const [integerPart, decimalPart] = cleaned.split(".");
  const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return decimalPart !== undefined ? `${formattedInteger}.${decimalPart}` : formattedInteger;
};

/**
 * Remove formatting (commas) from number string
 */
const parseFormattedValue = (value: string): string => {
  if (!value || value === "") return "";
  return value.replace(/,/g, "");
};

/**
 * Merged Currency Input - Single unified input with integrated currency selector
 * Currency selector appears as a prefix in the input field
 */
const MergedCurrencyInput = ({
  title,
  currency,
  amount,
  onCurrencyChange,
  onAmountChange,
  currencyError,
  amountError,
  onClearError,
  placeholder = "0.00",
}: Props) => {
  const [displayValue, setDisplayValue] = useState<string>("");
  const [showCurrencyDropdown, setShowCurrencyDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Update display value when amount prop changes
  useEffect(() => {
    if (amount === "" || amount === null || amount === undefined) {
      setDisplayValue("");
    } else {
      const parsed = parseFormattedValue(amount);
      setDisplayValue(formatWithCommas(parsed));
    }
  }, [amount]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowCurrencyDropdown(false);
      }
    };
    if (showCurrencyDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showCurrencyDropdown]);

  /**
   * Handle input change - parse and format value
   */
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    
    if (inputValue === "" || inputValue === null || inputValue === undefined) {
      setDisplayValue("");
      onAmountChange("");
      onClearError?.("budget");
      return;
    }

    const parsed = parseFormattedValue(inputValue);
    
    if (/^\d*\.?\d*$/.test(parsed)) {
      setDisplayValue(formatWithCommas(parsed));
      onAmountChange(parsed);
      onClearError?.("budget");
    } else {
      setDisplayValue(formatWithCommas(parseFormattedValue(amount || "")));
    }
  };

  /**
   * Get current currency info
   */
  const getCurrentCurrency = (): CurrencyI | null => {
    if (!currency?.value) return null;
    return currenciesArray.find((c) => c.code === currency.value) || null;
  };

  const currentCurrency = getCurrentCurrency();

  /**
   * Handle currency selection
   */
  const handleCurrencySelect = (selectedCurrency: CurrencyI) => {
    const option: OptionI = {
      icon: selectedCurrency.icon,
      value: selectedCurrency.code,
      label: `${selectedCurrency.code} - ${selectedCurrency.name}`,
    };
    onCurrencyChange(option);
    setShowCurrencyDropdown(false);
    onClearError?.("currency");
    inputRef.current?.focus();
  };

  const hasError = !!(currencyError || amountError);

  return (
    <div className="flex flex-col gap-1">
      {title && <p className="mb-3 text-[12px]">{title}</p>}
      
      {/* Merged Input Container */}
      <div className="relative">
        <div
          className={`
            flex items-center border rounded-lg bg-paper
            ${hasError ? "border-red-500" : "border-custom"}
            focus-within:ring-2 focus-within:ring-primary
            transition-all outline-none
            focus-within:outline-none
          `}
        >
          {/* Currency Selector (Prefix) */}
          <div className="relative flex-shrink-0" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setShowCurrencyDropdown(!showCurrencyDropdown)}
              className={`
                flex items-center gap-2 px-3 py-2.5 border-r border-custom
                hover:bg-pale transition-colors
                ${hasError ? "border-red-500" : ""}
              `}
            >
              <span className="text-lg">{currentCurrency?.icon || "💵"}</span>
              <span className="text-sm font-medium text-default min-w-[60px] text-left">
                {currentCurrency?.code || "Select"}
              </span>
              <ChevronDown 
                size={14} 
                className={`text-secondary transition-transform ${showCurrencyDropdown ? "rotate-180" : ""}`}
              />
            </button>

            {/* Currency Dropdown */}
            {showCurrencyDropdown && (
              <div className="absolute top-full left-0 mt-1 w-64 max-h-60 overflow-y-auto bg-paper border border-custom rounded-lg shadow-lg z-50">
                {currenciesArray.map((curr) => (
                  <button
                    key={curr.code}
                    type="button"
                    onClick={() => handleCurrencySelect(curr)}
                    className={`
                      w-full flex items-center gap-3 px-3 py-2 hover:bg-pale transition-colors
                      ${currency?.value === curr.code ? "bg-very-pale" : ""}
                    `}
                  >
                    <span className="text-lg">{curr.icon}</span>
                    <div className="flex-1 text-left">
                      <div className="text-sm font-medium text-default">{curr.code}</div>
                      <div className="text-xs text-secondary">{curr.name}</div>
                    </div>
                    {currency?.value === curr.code && (
                      <span className="text-primary text-xs">✓</span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Amount Input */}
          <div className="flex-1">
            <input
              ref={inputRef}
              type="text"
              inputMode="decimal"
              value={displayValue}
              onChange={handleAmountChange}
              placeholder={placeholder}
              className="w-full px-3 py-2.5 bg-transparent border-0 outline-none focus:outline-none text-default placeholder:text-secondary"
            />
          </div>
        </div>
      </div>

      {/* Error Messages */}
      {(currencyError || amountError) && (
        <ErrorMessage message={currencyError || amountError || ""} />
      )}
    </div>
  );
};

export default MergedCurrencyInput;



