import {EngineResult, SERIALIZATION_STACKS, SerializationStack} from "@/models/types";
import {SampleText} from "./SampleText";
import {AppDesign, cn} from "@/utils/design-system";

interface PerformanceResultsCardProps {
    results: EngineResult[];
    selectedStack: SerializationStack;
    onCopyLogs: () => void;
}

const calculateMemorySavingsPercentage = (ghost: EngineResult | undefined, competitor: EngineResult | undefined) => {
    if (!ghost || !competitor || competitor.memoryBytes <= 0 || ghost.memoryBytes <= 0) return null;
    return Math.round(((competitor.memoryBytes - ghost.memoryBytes) / competitor.memoryBytes) * 100);
};

const getInsightText = (
    bestSavings: number | null,
    bestCompetitor: string,
    ghostZeroCopy: EngineResult | undefined,
    zodResult: EngineResult | undefined
): string => {
    if (bestSavings !== null && bestSavings > 0) {
        const speedNote = ghostZeroCopy && zodResult && ghostZeroCopy.timeMs > zodResult.timeMs
            ? ` Bridge overhead adds ~${(ghostZeroCopy.timeMs - zodResult.timeMs).toFixed(2)}ms — negligible at scale.`
            : "";
        return `Ghost uses ${bestSavings}% less RAM than ${bestCompetitor}. Less GC pressure = fewer dropped frames on mobile & Edge.${speedNote}`;
    }
    if (ghostZeroCopy && zodResult && ghostZeroCopy.timeMs < zodResult.timeMs) {
        return `Ghost is faster with zero-reflection overhead and type-safe multiplatform models.`;
    }
    return `Ghost delivers typed multiplatform serialization with competitive performance.`;
};

const formatResultsAsLogs = (results: EngineResult[]): string => {
    return results.map(r => 
        `${r.name}: ${r.timeMs.toFixed(4)}ms | MEM: ${Math.round(r.memoryBytes / 1024)}KB`
    ).join("\n");
};

const findLowestMemoryEngine = (results: EngineResult[]): EngineResult | null => {
    return results.reduce((min, r) =>
        r.memoryBytes > 0 && r.memoryBytes < (min?.memoryBytes ?? Infinity) ? r : min,
        null as EngineResult | null
    );
};

export function PerformanceResultsCard({results, selectedStack, onCopyLogs}: PerformanceResultsCardProps) {
    const selectedEngineName = SERIALIZATION_STACKS[selectedStack].engineName;

    const ghostZeroCopy = results.find(r => r.name === "GHOST");
    const zodResult = results.find(r => r.name === "ZOD + JSON.parse");
    const nativeResult = results.find(r => r.name === "STANDARD (JSON.parse)");

    const savingsVsZod = calculateMemorySavingsPercentage(ghostZeroCopy, zodResult);
    const savingsVsNative = calculateMemorySavingsPercentage(ghostZeroCopy, nativeResult);
    const bestSavings = savingsVsZod ?? savingsVsNative;
    const bestCompetitor = savingsVsZod !== null ? "Zod" : "JSON.parse";

    const lowestMemEngine = findLowestMemoryEngine(results);

    const handleCopyClick = () => {
        const logs = formatResultsAsLogs(results);
        navigator.clipboard.writeText(logs);
        onCopyLogs();
    };

    return (
        <div
            className="rounded-3xl border border-white/10 bg-[#1E293B]/50 p-6 shadow-2xl backdrop-blur-xl flex flex-col items-center w-full">


            {bestSavings !== null && bestSavings > 0 && (
                <div className="mb-4 flex flex-col items-center">
                    <div className="flex items-center gap-3">
                        <SampleText
                            text={`${bestSavings}%`}
                            isBold={true}
                            fontSize={48}
                            overrideColor={AppDesign.AccentGlow}
                        />
                        <div className="flex flex-col">
                            <SampleText text="MEMORY" isBold={true} fontSize={12} overrideColor={AppDesign.AccentGlow}/>
                            <SampleText text="SAVED" isBold={true} fontSize={12} overrideColor={AppDesign.AccentGlow}/>
                        </div>
                    </div>
                    <SampleText
                        text={`vs ${bestCompetitor} · MEMORY FOOTPRINT REDUCTION`}
                        isBold={true}
                        fontSize={10}
                        isSecondary={true}
                        className="mt-1"
                    />
                    {savingsVsZod !== null && savingsVsNative !== null && (
                        <SampleText
                            text={`${savingsVsZod}% vs Zod · ${savingsVsNative}% vs JSON.parse`}
                            fontSize={10}
                            isSecondary={true}
                            className="mt-0.5"
                        />
                    )}
                </div>
            )}

            <SampleText
                text="PERFORMANCE INSIGHT"
                isBold={true}
                fontSize={12}
                overrideColor={AppDesign.AccentGlow}
            />

            <SampleText
                text={getInsightText(bestSavings, bestCompetitor, ghostZeroCopy, zodResult)}
                fontSize={14}
                isBold={true}
                textAlign="center"
                className="py-3"
            />

            <div className="h-px w-full bg-white/10 mb-6"/>

            <SampleText
                text="MEMORY & CPU COMPARISON"
                isBold={true}
                fontSize={12}
                isSecondary={true}
                textAlign="center"
            />

            <SampleText
                text="Lower memory = less GC pressure. Lower time = faster parsing."
                fontSize={10}
                isSecondary={true}
                textAlign="center"
                className="mt-1 mb-6"
            />

            <div className="w-full space-y-4 mt-4">
                {results.map((res) => {
                    const isGhost = res.name.startsWith("GHOST");
                    const isCurrent = res.name === selectedEngineName;
                    const isLowestMem = lowestMemEngine && res.name === lowestMemEngine.name && res.memoryBytes > 0;


                    const engineMemSavings = !isGhost && ghostZeroCopy && res.memoryBytes > 0 && ghostZeroCopy.memoryBytes > 0
                        ? calculateMemorySavingsPercentage(ghostZeroCopy, res)
                        : null;

                    return (
                        <div
                            key={res.name}
                            className={cn(
                                "w-full rounded-2xl border p-4 transition-all duration-300",
                                isGhost ? "border-[#A855F7]/30 bg-[#A855F7]/5" : "border-white/5 bg-white/5"
                            )}
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex flex-col">
                                    <div className="flex items-center gap-2">
                                        <SampleText
                                            text={res.name}
                                            isBold={true}
                                            fontSize={14}
                                            overrideColor={isGhost ? "#A855F7" : undefined}
                                        />
                                        {isCurrent && (
                                            <span className="text-[8px] font-bold px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400">
                                                YOUR STACK
                                            </span>
                                        )}
                                        {isLowestMem && (
                                            <span className="text-[8px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400">
                                                LOWEST RAM
                                            </span>
                                        )}
                                    </div>
                                    <SampleText
                                        text={
                                            engineMemSavings !== null && engineMemSavings > 0
                                                ? `Ghost uses ${engineMemSavings}% less RAM`
                                                : isGhost && isLowestMem
                                                    ? "Lowest memory footprint"
                                                    : res.jankCount > 0
                                                        ? `${res.jankCount} dropped frames`
                                                        : "Perfect stability"
                                        }
                                        fontSize={10}
                                        isSecondary={true}
                                        overrideColor={
                                            (engineMemSavings !== null && engineMemSavings > 0) || (isGhost && isLowestMem)
                                                ? "#10B981" : undefined
                                        }
                                    />
                                </div>

                                <div className="flex gap-6 items-center">
                                    <div className="flex flex-col items-end">
                                        <SampleText text="MEMORY" fontSize={8} isSecondary={true} isBold={true}/>
                                        <SampleText
                                            text={res.memoryBytes > 0 ? `${Math.round(res.memoryBytes / 1024)} KB` : "N/A"}
                                            isBold={true}
                                            fontSize={16}
                                            overrideColor={isLowestMem ? "#10B981" : res.memoryBytes > 0 ? "#F8FAFC" : "#94A3B8"}
                                        />
                                    </div>
                                    <div className="flex flex-col items-end min-w-[80px]">
                                        <SampleText text="TIME" fontSize={8} isSecondary={true} isBold={true}/>
                                        <SampleText
                                            text={`${res.timeMs.toFixed(4)}ms`}
                                            isBold={true}
                                            fontSize={14}
                                            overrideColor={isGhost ? "#A855F7" : "#94A3B8"}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            <button
                onClick={handleCopyClick}
                className="mt-8 py-2 px-4 rounded-lg hover:bg-white/5 transition-colors group flex items-center gap-2"
            >
                <div className="h-1.5 w-1.5 rounded-full bg-purple-500 animate-pulse"/>
                <SampleText
                    text="COPY SESSION LOGS"
                    overrideColor={AppDesign.AccentGlow}
                    isBold={true}
                    fontSize={12}
                />
            </button>
        </div>
    );
}
