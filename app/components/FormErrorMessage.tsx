import { AllHTMLAttributes } from "react";

interface Props extends AllHTMLAttributes<HTMLParagraphElement> {}

export default function FormErrorMessage({ children, className = "", ...others }: Props) {
    return (
        <p {...others} className={`text-red-600 font-semibold ${className}`}>
            {children}
        </p>
    );
}
