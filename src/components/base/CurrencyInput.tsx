"use client";
import React, { useState, useEffect } from "react";
import Select, { OptionI } from "@/src/components/core/Select";
import Input from "@/src/components/core/Input";
import { currenciesArray, CurrencyI } from "@/src/constants/currencies";
import ErrorMessage from "@/src/components/core/ErrorMessage";

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
 * Handles decimal points properly
 * Example: "1000000.50" -> "1,000,000.50"
 */
const formatWithCommas = (value: string): string => {
  if (!value || value === "") return "";
  
  // Remove all non-digit and non-decimal characters (except first decimal point)
  let cleaned = value.replace(/[^\d.]/g, "");
  
  // Handle multiple decimal points - keep only the first one
  const parts = cleaned.split(".");
  if (parts.length > 2) {
    cleaned = parts[0] + "." + parts.slice(1).join("");
  }
  
  // Split integer and decimal parts
  const [integerPart, decimalPart] = cleaned.split(".");
  
  // Format integer part with commas
  const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  
  // Combine with decimal if exists
  return decimalPart !== undefined ? `${formattedInteger}.${decimalPart}` : formattedInteger;
};

/**
 * Remove formatting (commas) from number string
 * Example: "1,000,000.50" -> "1000000.50"
 */
const parseFormattedValue = (value: string): string => {
  if (!value || value === "") return "";
  // Remove all commas, keep digits and decimal point
  return value.replace(/,/g, "");
};

/**
 * Combined currency selector and amount input component
 * Displays currency selector and amount input side by side
 * Formats amount with thousand separators (commas)
 */
const CurrencyInput = ({
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
  // Internal state for formatted display value
  const [displayValue, setDisplayValue] = useState<string>("");

  /**
   * Update display value when amount prop changes
   */
  useEffect(() => {
    if (amount === "" || amount === null || amount === undefined) {
      setDisplayValue("");
    } else {
      // Format the parsed value for display
      const parsed = parseFormattedValue(amount);
      setDisplayValue(formatWithCommas(parsed));
    }
  }, [amount]);

  /**
   * Handle input change - parse and format value
   */
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    
    // If empty, clear both display and actual value
    if (inputValue === "" || inputValue === null || inputValue === undefined) {
      setDisplayValue("");
      onAmountChange("");
      onClearError?.("budget");
      return;
    }

    // Parse the input to remove commas
    const parsed = parseFormattedValue(inputValue);
    
    // Validate: only numbers and one decimal point allowed
    if (/^\d*\.?\d*$/.test(parsed)) {
      // Update display with formatting
      setDisplayValue(formatWithCommas(parsed));
      // Update parent with unformatted value
      onAmountChange(parsed);
      onClearError?.("budget");
    } else {
      // Invalid input - revert to last valid display value
      setDisplayValue(formatWithCommas(parseFormattedValue(amount || "")));
    }
  };

  /**
   * Get currency options for select
   */
  const getCurrencyOptions = (): OptionI[] => {
    return currenciesArray.map((c: CurrencyI) => ({
      icon: c.icon,
      value: c.code,
      label: c.code,
      isSelected: currency?.value === c.code,
    }));
  };

  return (
    <div className="flex flex-col gap-1">
      {title && <p className="mb-3 text-[12px]">{title}</p>}
      <div className="flex gap-2 items-end">
        {/* Currency Select */}
        <div className="flex-shrink-0" style={{ width: "120px" }}>
          <Select
            placeHolder="Currency"
            onChange={(value) => {
              onCurrencyChange(value);
              onClearError?.("currency");
            }}
            value={currency}
            options={getCurrencyOptions()}
            error={currencyError}
          />
        </div>

        {/* Amount Input - formatted with commas */}
        <div className="flex-1">
          <Input
            type="text"
            inputMode="decimal"
            value={displayValue}
            onChange={handleAmountChange}
            placeholder={placeholder}
            error={amountError}
          />
        </div>
      </div>
      {(currencyError || amountError) && (
        <ErrorMessage
          message={currencyError || amountError || ""}
        />
      )}
    </div>
  );
};

export default CurrencyInput;
