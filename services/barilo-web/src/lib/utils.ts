import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { parseCookies } from "nookies";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function geCookie(name: string) {
  const cookies = parseCookies(null, "");
  return cookies[name];
}
