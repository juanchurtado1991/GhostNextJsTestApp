import {SERIALIZATION_STACKS, SerializationStack} from "@/models/types";
import {AppDesign, cn} from "@/utils/design-system";
import {SampleText} from "./SampleText";

interface StackSelectorDialogProps {
    current: SerializationStack;
    onSelect: (stack: SerializationStack) => void;
    onDismiss: () => void;
}

export function StackSelectorDialog({current, onSelect, onDismiss}: StackSelectorDialogProps) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="absolute inset-0 bg-black/60" onClick={onDismiss}/>
            <div
                className="relative w-full max-w-md overflow-hidden rounded-3xl border border-white/10 bg-[#1E293B] p-6 shadow-2xl">
                <SampleText text="SELECT SERIALIZATION ENGINE" isBold={true} fontSize={14} className="mb-6"/>

                <div className="flex flex-col gap-3">
                    {(Object.values(SerializationStack) as SerializationStack[]).map((stack) => {
                        const info = SERIALIZATION_STACKS[stack];
                        const isSelected = current === stack;

                        return (
                            <div
                                key={stack}
                                onClick={() => onSelect(stack)}
                                className={cn(
                                    "cursor-pointer rounded-xl border p-4 transition-all duration-200",
                                    isSelected
                                        ? "border-[#A855F7] bg-[#A855F7]/10 shadow-lg shadow-purple-500/5"
                                        : "border-white/5 bg-white/5 hover:border-white/20 hover:bg-white/10"
                                )}
                            >
                                <SampleText
                                    text={info.title}
                                    isBold={true}
                                    fontSize={14}
                                    overrideColor={isSelected ? AppDesign.AccentGlow : undefined}
                                />
                                <SampleText
                                    text={info.description}
                                    fontSize={10}
                                    isSecondary={true}
                                    className="mt-1"
                                />
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
