import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));
export const gp = (n: bigint | number) => `${typeof n === "number" ? n : n.toString()} GP`;
