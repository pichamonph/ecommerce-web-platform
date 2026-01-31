import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function hasValidImageSrc(src?: string | null): src is string {
  if (!src) return false
  const trimmed = src.trim()
  if (!trimmed) return false
  return /^(https?:\/\/|data:image\/|blob:|\/)/i.test(trimmed)
}
