import React, { HTMLAttributes, HTMLProps } from "react";

interface Props extends HTMLAttributes<HTMLButtonElement> {
    children: React.ReactNode;
    className?: string;
}

export default function FormSubmitButton({ children, className = "", ...others }: Props) {
    return (
        <button
            type="submit"
            {...others}
            className={`border w-full py-2 text-lg font-bold rounded-xl transition-all duration-150 text-gray-700 bg-gray-200 dark:bg-gray-700 dark:text-gray-300 hover:text-gray-100 hover:bg-blue-500 ${className}`}
        >
            {children}
        </button>
    );
}
