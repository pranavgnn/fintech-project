/**
 * Format number using Indian numbering system (with commas for thousands)
 */
export const formatIndianCurrency = (amount: number): string => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(amount);
};

/**
 * Format a date string to a human-readable format
 */
export const formatDate = (dateString: string): string => {
  if (!dateString) return "";

  const date = new Date(dateString);
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

/**
 * Format account number to hide all but last 4 digits
 */
export const maskAccountNumber = (accountNumber: string): string => {
  if (!accountNumber || accountNumber.length < 4) return accountNumber;

  const lastFour = accountNumber.slice(-4);
  return `•••• •••• ${lastFour}`;
};

/**
 * Format currency in a compact form (e.g., 1.2k, 1.2M)
 */
export const formatCurrencyCompact = (amount: number): string => {
  if (Math.abs(amount) >= 1000000) {
    return `₹${(amount / 1000000).toFixed(1)}M`;
  } else if (Math.abs(amount) >= 1000) {
    return `₹${(amount / 1000).toFixed(1)}k`; // Changed from 't' to 'k'
  } else {
    return `₹${amount.toFixed(2)}`;
  }
};
