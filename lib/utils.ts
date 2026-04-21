import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatMoney(amount: number, opts: { cents?: boolean } = {}) {
  const { cents = false } = opts;
  if (cents) {
    return `$${amount.toFixed(2)}`;
  }
  if (Math.abs(amount) >= 100) {
    return `$${Math.round(amount).toLocaleString()}`;
  }
  return `$${amount.toFixed(2)}`;
}

export function hoursOfPaycheck(amount: number, hourlyWage = 24): number {
  return Math.round((amount / hourlyWage) * 10) / 10;
}
