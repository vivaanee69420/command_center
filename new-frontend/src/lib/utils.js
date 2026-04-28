import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount) {
  return "£" + Number(amount).toLocaleString("en-GB", { maximumFractionDigits: 0 });
}

export function formatNumber(num) {
  return Number(num).toLocaleString("en-GB");
}

export function getInitials(name) {
  return name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}
