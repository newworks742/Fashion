"use client";
import { useEffect } from "react";

export default function Toast({ message, type = "info", onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`fixed top-6 right-6 px-4 py-3 rounded-lg shadow-md text-white z-50
      ${type === "success" ? "bg-green-600" : ""}
      ${type === "error" ? "bg-red-600" : ""}
      ${type === "info" ? "bg-blue-600" : ""}`}
    >
      {message}
    </div>
  );
}
