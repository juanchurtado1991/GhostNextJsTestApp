import {AppDesign, cn} from "@/utils/design-system";
import {SampleText} from "./SampleText";

interface StatusIndicatorProps {
    status: string;
}

const getStatusColorClass = (status: string): string => {
    const normalizedStatus = status.toUpperCase();
    if (normalizedStatus === "ALIVE") return AppDesign.StatusAlive;
    if (normalizedStatus === "DEAD") return AppDesign.StatusDead;
    return AppDesign.StatusUnknown;
};

export function StatusIndicator({status}: StatusIndicatorProps) {
    return (
        <div className="flex items-center gap-1.5 py-1">
            <div className={cn("h-2 w-2 rounded-full", getStatusColorClass(status))}/>
            <SampleText
                text={status}
                fontSize={12}
                isBold={true}
            />
        </div>
    );
}
