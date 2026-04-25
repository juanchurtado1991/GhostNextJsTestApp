import {cn} from "@/utils/design-system";
import {ReactNode} from "react";

interface CardProps {
    children: ReactNode;
    className?: string;
}

export function Card({children, className}: CardProps) {
    return (
        <div
            className={cn(
                "rounded-[20px] bg-[#1E293B]/50 border-t border-l border-white/10 shadow-xl",
                className
            )}
            style={{
                borderImage: "linear-gradient(to bottom right, rgba(255,255,255,0.1), transparent) 1"
            }}
        >
            {children}
        </div>
    );
}
