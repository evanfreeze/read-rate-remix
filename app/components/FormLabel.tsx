import { AllHTMLAttributes } from "react";

interface Props extends AllHTMLAttributes<HTMLLabelElement> {
    children: React.ReactNode;
    className?: string;
}

export default function FormLabel({ children = null, className = "", ...others }: Props) {
    return (
        <label {...others} className={`font-semibold text-gray-700 dark:text-gray-400  ${className}`}>
            {children}
        </label>
    );
}
