/**
 * HTML utility functions
 */

/**
 * Decode HTML entities so rich text stored as &lt;p&gt; etc. renders as HTML
 */
export function decodeHtmlEntities(html: string): string {
  if (!html || typeof html !== "string") return html;
  if (typeof document === "undefined") {
    return html
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&amp;/g, "&")
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&nbsp;/g, "\u00A0");
  }
  const tmp = document.createElement("div");
  tmp.innerHTML = html;
  return tmp.innerHTML;
}

/**
 * Strip HTML tags to get plain text
 * Useful for displaying rich text content as plain text
 */
export function stripHtmlTags(html: string): string {
  if (!html || typeof html !== 'string') {
    return '';
  }
  
  if (typeof window === "undefined") {
    // Server-side: simple regex approach
    return html.replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").trim();
  }
  
  // Client-side: use DOM parser for better accuracy
  const tmp = document.createElement("div");
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || "";
}

/**
 * Safely render a value, converting objects to strings
 * Prevents "[object Object]" from appearing in the UI
 */
export function safeRender(value: any): string {
  if (value === null || value === undefined) {
    return '';
  }
  
  if (typeof value === 'string') {
    return value;
  }
  
  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }
  
  if (typeof value === 'object') {
    // If it's an array, join it
    if (Array.isArray(value)) {
      return value.map(item => safeRender(item)).join(', ');
    }
    
    // If it has a toString method, use it
    if (typeof value.toString === 'function' && value.toString !== Object.prototype.toString) {
      return value.toString();
    }
    
    // Otherwise, try to stringify (for debugging)
    try {
      return JSON.stringify(value);
    } catch {
      return '';
    }
  }
  
  return String(value);
}














