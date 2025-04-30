import { createContext, useContext } from "react";

// Define toast context type
export interface ToastContextType {
  showToast: (
    message: string,
    type?: "success" | "error" | "info",
    duration?: number
  ) => void;
}

// Create the context
export const ToastContext = createContext<ToastContextType | undefined>(
  undefined
);

// Custom hook to use the toast context
export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
