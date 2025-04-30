import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format a number as Thai Baht (THB) currency
 * @param amount The amount to format
 * @returns Formatted currency string
 */
export function formatTHB(amount: number) {
  return new Intl.NumberFormat('th-TH', { 
    style: 'currency', 
    currency: 'THB' 
  }).format(amount)
}
