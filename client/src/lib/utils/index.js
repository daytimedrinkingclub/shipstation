import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function pluralize(count, singular, plural) {
  if (!plural) plural = singular + "s";
  return count === 1 ? singular : plural;
}

export function noop() {}
