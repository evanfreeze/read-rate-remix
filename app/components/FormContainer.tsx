import { AllHTMLAttributes } from "react";

interface Props extends AllHTMLAttributes<HTMLDivElement> {}

export default function FormContainer({ children, className = "", ...others }: Props) {
    return (
        <div
            {...others}
            className={`bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-200 py-8 px-10 rounded-3xl ${className}`}
        >
            {children}
        </div>
    );
}
