/**
 * CSV Parser Utility
 * Handles parsing CSV files and converting to structured data
 */

export interface ParsedCSVRow {
  [key: string]: string;
}

/**
 * Parse a CSV line handling quoted values and commas within quotes
 * @param line - CSV line to parse
 * @returns Array of field values
 */
function parseCSVLine(line: string): string[] {
  const values: string[] = [];
  let currentValue = "";
  let insideQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"') {
      if (insideQuotes && nextChar === '"') {
        // Escaped quote
        currentValue += '"';
        i++; // Skip next quote
      } else {
        // Toggle quote state
        insideQuotes = !insideQuotes;
      }
    } else if (char === "," && !insideQuotes) {
      // Field separator
      values.push(currentValue.trim());
      currentValue = "";
    } else {
      currentValue += char;
    }
  }

  // Add the last value
  values.push(currentValue.trim());

  return values;
}

/**
 * Parse CSV file content into structured data
 * Handles quoted values and commas within quoted strings
 * @param csvContent - Raw CSV file content as string
 * @returns Array of parsed rows with column names as keys
 */
export function parseCSV(csvContent: string): ParsedCSVRow[] {
  const lines = csvContent
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  if (lines.length === 0) {
    throw new Error("CSV file is empty");
  }

  // Parse header row
  const headers = parseCSVLine(lines[0]).map((h) =>
    h.replace(/^"|"$/g, "").trim()
  );

  if (headers.length === 0) {
    throw new Error("CSV file has no headers");
  }

  // Parse data rows
  const rows: ParsedCSVRow[] = [];
  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]).map((v) =>
      v.replace(/^"|"$/g, "").trim()
    );

    // Skip empty rows
    if (values.every((v) => v === "")) {
      continue;
    }

    // Create row object with headers as keys
    const row: ParsedCSVRow = {};
    headers.forEach((header, index) => {
      row[header] = values[index] || "";
    });

    rows.push(row);
  }

  return rows;
}

/**
 * Read CSV file and parse it
 * @param file - File object to read
 * @returns Promise resolving to parsed CSV data
 */
export async function readCSVFile(file: File): Promise<ParsedCSVRow[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const parsed = parseCSV(content);
        resolve(parsed);
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = () => {
      reject(new Error("Failed to read CSV file"));
    };

    reader.readAsText(file);
  });
}

/**
 * Validate CSV structure for courses
 * Expected columns: name, departmentId
 * @param rows - Parsed CSV rows
 * @returns Validation result with errors if unknown
 */
export function validateCoursesCSV(rows: ParsedCSVRow[]): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (rows.length === 0) {
    errors.push("CSV file contains no data rows");
    return { valid: false, errors };
  }

  // Check required columns
  const requiredColumns = ["name", "departmentId"];
  const firstRow = rows[0];
  const missingColumns = requiredColumns.filter((col) => !(col in firstRow));

  if (missingColumns.length > 0) {
    errors.push(`Missing required columns: ${missingColumns.join(", ")}`);
  }

  // Validate each row
  rows.forEach((row, index) => {
    const rowNumber = index + 2; // +2 because index is 0-based and we skip header row

    if (!row.name || row.name.trim().length === 0) {
      errors.push(`Row ${rowNumber}: Course name is required`);
    }

    if (!row.departmentId || row.departmentId.trim().length === 0) {
      errors.push(`Row ${rowNumber}: Department ID is required`);
    } else {
      const departmentId = parseInt(row.departmentId, 10);
      if (isNaN(departmentId)) {
        errors.push(`Row ${rowNumber}: Department ID must be a valid number`);
      }
    }
  });

  return {
    valid: errors.length === 0,
    errors,
  };
}
