/**
 * Cleans a translation string by removing unwanted quotation marks
 */
export function cleanTranslation(text: string): string {
    if (!text) return text
  
    // Remove quotation marks from the beginning and end of the text
    let cleaned = text.trim()
  
    // Handle standard quotes
    cleaned = cleaned.replace(/^["'](.*)["']$/s, "$1")
  
    // Handle fancy quotes
    cleaned = cleaned.replace(/^["""](.*)[""]$/s, "$1")
  
    return cleaned
  }
  