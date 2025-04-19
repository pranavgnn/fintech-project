/**
 * Debug utility to capture and analyze malformed JSON responses
 */
export const analyzeJsonError = (jsonText: string, error: Error): void => {
  console.error('JSON Parse Error:', error.message);
  
  // Extract position from error message if available
  const posMatch = error.message.match(/position (\d+)/);
  if (posMatch) {
    const position = parseInt(posMatch[1]);
    
    // Log characters around the error position
    const start = Math.max(0, position - 20);
    const end = Math.min(jsonText.length, position + 20);
    
    console.error(`Error at position ${position}. Text around position:`);
    console.error(JSON.stringify(jsonText.substring(start, position) + " 👉 " + jsonText.substring(position, end)));
    
    // Check for common JSON issues
    checkForCommonJsonIssues(jsonText, position);
  } else {
    // If no position info, look for general issues
    checkForCommonJsonIssues(jsonText, -1);
  }
};

const checkForCommonJsonIssues = (jsonText: string, position: number): void => {
  // Count open and closing braces
  const openBraces = (jsonText.match(/\{/g) || []).length;
  const closeBraces = (jsonText.match(/\}/g) || []).length;
  
  if (openBraces !== closeBraces) {
    console.error(`Brace mismatch: ${openBraces} opening vs ${closeBraces} closing braces`);
  }
  
  // Check for trailing commas in objects
  if (jsonText.includes(',}')) {
    console.error('Found trailing commas in objects');
  }
  
  // Check for control characters
  const controlChars = jsonText.match(/[\x00-\x1F\x7F-\x9F]/g);
  if (controlChars && controlChars.length > 0) {
    console.error(`Found ${controlChars.length} control characters in JSON`);
  }
  
  // Check for common specific issues
  if (jsonText.includes('"customer":}')) {
    console.error('Found empty object reference issue: "customer":}');
  }

  // Look for uncommon characters after a certain position
  if (position > 125000 && position < 126000) {
    console.error('Specific error near position 125818, checking for unusual patterns');
    const regionOfInterest = jsonText.substring(125000, 126000);
    console.error('Character codes in region:');
    for (let i = 0; i < regionOfInterest.length; i += 100) {
      const slice = regionOfInterest.substring(i, i + 100);
      const charCodes = Array.from(slice).map(c => c.charCodeAt(0));
      console.error(`Chars ${125000 + i}-${125000 + i + 99}: ${charCodes.join(',')}`);
    }
  }
};

/**
 * Attempts to fix common JSON structural issues
 */
export const repairJson = (json: string): string => {
  let fixed = json;
  
  // Fix empty object references
  fixed = fixed.replace(/"customer":\}/g, '"customer":null}');
  fixed = fixed.replace(/\"([^"]+)":\}/g, '"$1":null}');
  
  // Fix trailing commas in objects
  fixed = fixed.replace(/,\s*\}/g, '}');
  fixed = fixed.replace(/,\s*\]/g, ']');
  
  // Remove control characters
  fixed = fixed.replace(/[\x00-\x1F\x7F-\x9F]+/g, ' ');
  
  // If characters at position 125818 are problematic, try to truncate
  if (fixed.length > 125818) {
    const beforeError = fixed.substring(0, 125818);
    // Find last closing brace to ensure valid JSON
    const lastBrace = beforeError.lastIndexOf('}');
    if (lastBrace > beforeError.length - 20) { // if it's close to the end
      fixed = beforeError.substring(0, lastBrace + 1);
    }
  }
  
  return fixed;
};
