"use client"
import React, {useState} from 'react';
import {SampleText} from "@/components/SampleText";
import {useBenchmarkViewModel} from "@/hooks/useBenchmarkViewModel";
import {AppDesign, cn} from "@/utils/design-system";
import {SERIALIZATION_STACKS} from "@/models/types";
import {StackSelectorDialog} from "@/components/StackSelectorDialog";
import {CharacterCard} from "@/components/CharacterCard";

// Helper function to format bytes for the UI
function formatBytes(bytes: number, decimals = 2) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

export function GhostAppView() {
    const {
        state,
        updatePageCount,
        selectStack,
        showStackDialog,
        runBenchmark
    } = useBenchmarkViewModel();

    const [isCopied, setIsCopied] = useState(false);

    const handleCopyResults = () => {
        const resultsText = state.results.map(r => 
            `${r.name}: ${r.timeMs.toFixed(4)}ms | MEM: ${formatBytes(r.memoryBytes)}`
        ).join('\n');
        
        navigator.clipboard.writeText(resultsText).then(() => {
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
        });
    };

    return (
        <div className="flex min-h-screen flex-col items-center bg-[#0F172A] p-4 text-white font-sans selection:bg-[#A855F7]/30 pb-20">
            {/* Header */}
            <div className="mb-12 mt-8 text-center">
                <div className="mb-2 inline-block rounded-full bg-[#A855F7]/10 px-4 py-1 border border-[#A855F7]/20">
                    <SampleText text="NEXT.JS NATIVE ENGINE v1.1.14" isBold={true} fontSize={12}
                                overrideColor={AppDesign.AccentGlow}/>
                </div>
                <h1 className="bg-gradient-to-r from-white via-white to-gray-500 bg-clip-text text-5xl font-black tracking-tight text-transparent sm:text-6xl">
                    GHOST SERIALIZATION
                </h1>
                <p className="mt-4 text-gray-400 max-w-xl mx-auto">
                    Comparing Ghost Wasm Zero-Copy against native JSON.parse and Zod validation.
                    Testing with production-grade data volumes.
                </p>
            </div>

            <div className="w-full max-w-4xl space-y-6">
                {/* Configuration Card */}
                <div className="rounded-2xl border border-white/5 bg-white/5 p-8 backdrop-blur-xl shadow-2xl">
                    <div className="grid gap-8 md:grid-cols-2">
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <SampleText text="DATA VOLUME (PAGES)" isBold={true} fontSize={10} isSecondary={true}/>
                                <SampleText text={state.pageCount.toString()} isBold={true} fontSize={14}
                                            overrideColor={AppDesign.AccentGlow}/>
                            </div>
                            <input
                                type="range"
                                min="1"
                                max="20"
                                step="1"
                                value={state.pageCount}
                                onChange={(e) => updatePageCount(parseInt(e.target.value))}
                                className="w-full accent-[#A855F7] cursor-pointer"
                            />
                            <div className="flex justify-between text-[10px] text-gray-400 uppercase tracking-widest font-bold">
                                <span>1 Page</span>
                                <span>20 Pages</span>
                            </div>
                        </div>

                        <div className="flex flex-col justify-center border-l border-white/5 pl-8">
                            <div
                                className="cursor-pointer group"
                                onClick={() => showStackDialog(true)}
                            >
                                <SampleText text="SERIALIZATION ENGINE" isBold={true} fontSize={10} isSecondary={true}/>
                                <div className="mt-2 flex items-center justify-between">
                                    <div>
                                        <SampleText
                                            text={SERIALIZATION_STACKS[state.selectedStack].title}
                                            isBold={true}
                                            fontSize={20}
                                            overrideColor={AppDesign.AccentGlow}
                                        />
                                        <p className="text-[10px] text-gray-500 mt-1 uppercase tracking-wider font-medium">
                                            {SERIALIZATION_STACKS[state.selectedStack].description}
                                        </p>
                                    </div>
                                    <div
                                        className="h-8 w-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-[#A855F7]/20 transition-colors">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                                             stroke={AppDesign.AccentGlow} strokeWidth="3" strokeLinecap="round"
                                             strokeLinejoin="round">
                                            <path d="m9 18 6-6-6-6"/>
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-8">
                        <button
                            onClick={runBenchmark}
                            disabled={state.isLoading}
                            className={cn(
                                "relative flex min-h-16 w-full flex-col items-center justify-center gap-1 rounded-xl transition-all overflow-hidden",
                                "bg-gradient-to-r from-[#A855F7] to-[#7C3AED] hover:opacity-90 active:scale-[0.98]",
                                state.isLoading && "opacity-70 grayscale"
                            )}
                        >
                            {state.isLoading ? (
                                <div className="flex items-center space-x-3">
                                    <div
                                        className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"/>
                                    <SampleText text={state.loadingStatus} fontSize={12} isBold={true}/>
                                </div>
                            ) : (
                                <SampleText text="RUN STRESS COMPARISON" isBold={true} fontSize={14}/>
                            )}
                        </button>
                    </div>

                    {state.errorMessage && (
                        <div className="mt-4 rounded-xl border border-red-500/50 bg-red-500/10 p-4 text-center">
                            <SampleText text={`ERROR: ${state.errorMessage}`} fontSize={12} overrideColor="#EF4444"/>
                        </div>
                    )}
                </div>

                {/* Results Table */}
                {state.results.length > 0 && (
                    <div className="overflow-hidden rounded-2xl border border-white/5 bg-white/5 backdrop-blur-xl shadow-2xl">
                        <div className="bg-white/5 px-6 py-4 border-b border-white/5 flex justify-between items-center">
                            <SampleText text="BENCHMARK RESULTS" isBold={true} fontSize={12} isSecondary={true}/>
                            <button 
                                onClick={handleCopyResults}
                                className={cn(
                                    "flex items-center space-x-2 px-3 py-1 rounded-lg border transition-all text-[10px] font-bold uppercase tracking-wider",
                                    isCopied ? "border-emerald-500 bg-emerald-500/10 text-emerald-500" : "border-white/10 hover:bg-white/5 text-gray-400"
                                )}
                            >
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    {isCopied ? (
                                        <path d="M20 6 9 17l-5-5"/>
                                    ) : (
                                        <>
                                            <rect width="14" height="14" x="8" y="8" rx="2" ry="2"/>
                                            <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>
                                        </>
                                    )}
                                </svg>
                                <span>{isCopied ? "COPIED!" : "COPY TO CLIPBOARD"}</span>
                            </button>
                        </div>
                        <table className="w-full text-left">
                            <thead className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">
                            <tr>
                                <th className="px-6 py-4">Engine</th>
                                <th className="px-6 py-4">Avg Time</th>
                                <th className="px-6 py-4">Memory</th>
                                <th className="px-6 py-4">Status</th>
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                            {state.results.map((res) => (
                                <tr key={res.name}
                                    className={cn("transition-colors hover:bg-white/5", res.name.includes("GHOST") && "bg-[#A855F7]/5")}>
                                    <td className="px-6 py-4">
                                        <SampleText text={res.name} isBold={true} fontSize={14}
                                                    overrideColor={res.name.includes("GHOST") ? AppDesign.AccentGlow : "#FFF"}/>
                                    </td>
                                    <td className="px-6 py-4 font-mono text-sm">
                                        {res.timeMs.toFixed(4)}ms
                                    </td>
                                    <td className="px-6 py-4 font-mono text-sm text-gray-400">
                                        {formatBytes(res.memoryBytes)}
                                    </td>
                                    <td className="px-6 py-4">
                                        {res.jankCount > 0 ? (
                                            <span className="text-xs text-amber-500 font-bold uppercase tracking-tighter">JANK DETECTED</span>
                                        ) : (
                                            <span className="text-xs text-emerald-500 font-bold uppercase tracking-tighter">STABLE</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Characters Preview Grid - ALWAYS VISIBLE */}
                <div className="space-y-4">
                     <div className="flex items-center space-x-3">
                         <div className="h-px flex-1 bg-white/5"/>
                         <SampleText text="LIVE CHARACTER DATA" isBold={true} fontSize={10} isSecondary={true}/>
                         <div className="h-px flex-1 bg-white/5"/>
                     </div>
                     
                     {state.characters.length === 0 ? (
                         <div className="flex flex-col items-center justify-center py-12 opacity-30">
                             <div className="h-8 w-8 animate-spin rounded-full border-2 border-white border-t-transparent mb-4"/>
                             <SampleText text="DOWNLOADING API DATA..." fontSize={10} isBold={true}/>
                         </div>
                     ) : (
                         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                             {state.characters.map((char) => (
                                 <CharacterCard key={char.id} character={char} />
                             ))}
                         </div>
                     )}
                </div>
            </div>

            {state.isStackDialogVisible && (
                <StackSelectorDialog
                    current={state.selectedStack}
                    onSelect={selectStack}
                    onDismiss={() => showStackDialog(false)}
                />
            )}
        </div>
    );
}
