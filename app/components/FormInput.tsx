import { AllHTMLAttributes, HTMLAttributes } from "react";

interface Props extends AllHTMLAttributes<HTMLInputElement> {
    className?: string;
}

export function FormInput({ className = "", ...others }: Props) {
    return <input {...others} className={`p-2 rounded-md border ${className}`} />;
}
