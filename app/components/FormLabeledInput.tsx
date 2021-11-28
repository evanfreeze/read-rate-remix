import { AllHTMLAttributes } from "react";

interface Props extends AllHTMLAttributes<HTMLDivElement> {}

export default function FormLabeledInput({ children, className = "", ...others }: Props) {
    return (
        <div {...others} className={`flex flex-col gap-1 my-4 ${className}`}>
            {children}
        </div>
    );
}
