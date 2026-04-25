import {useEffect, useRef, useState} from "react";
import {EngineResult, SerializationStack, UiState} from "@/models/types";
import {fetchCharactersFromApi} from "@/services/characterService";

const ITERATIONS = 50;
const CANONICAL_ENGINE_ORDER = ["GHOST (Zero-Copy)", "GHOST (String API)", "ZOD + JSON.parse", "STANDARD (JSON.parse)"];

interface BenchmarkPayloads {
    raw: string[][];
    bytes: Uint8Array[][];
}

const generateMockedPayloads = async (
    pageCount: number,
    onProgress: (status: string) => void
): Promise<BenchmarkPayloads> => {
    const raw: string[][] = [];
    const bytes: Uint8Array[][] = [];

    const decoder = new TextDecoder();
    const encoder = new TextEncoder();

    for (let i = 1; i <= pageCount; i++) {
        onProgress(`Downloading raw bytes for page ${i}/${pageCount}...`);
        const resp = await fetch(`https://rickandmortyapi.com/api/character?page=${i}`);
        if (!resp.ok) throw new Error(`API returned ${resp.status} for page ${i}`);
        
        // This is the Ghost way: GET THE BYTES DIRECTLY
        const buffer = await resp.arrayBuffer();
        const baseBytes = new Uint8Array(buffer);
        const baseText = decoder.decode(baseBytes);

        const pageVariantsRaw: string[] = [];
        const pageVariantsBytes: Uint8Array[] = [];
        for (let j = 0; j < ITERATIONS; j++) {
            const mutated = baseText.replace('"name":"', `"name":"[v${j}] `);
            pageVariantsRaw.push(mutated);
            pageVariantsBytes.push(encoder.encode(mutated));
        }
        raw.push(pageVariantsRaw);
        bytes.push(pageVariantsBytes);
    }

    return {raw, bytes};
};

const persistEngineResult = (newResult: EngineResult) => {
    const resultsStr = sessionStorage.getItem("benchmark_results");
    const results: EngineResult[] = resultsStr ? JSON.parse(resultsStr) : [];
    results.push(newResult);
    sessionStorage.setItem("benchmark_results", JSON.stringify(results));
};

const advanceToNextEngineInQueue = () => {
    const queueStr = sessionStorage.getItem("benchmark_queue");
    if (!queueStr) return;

    const queue: string[] = JSON.parse(queueStr);
    const nextEngine = queue.shift();
    sessionStorage.setItem("benchmark_queue", JSON.stringify(queue));

    if (nextEngine) {
        window.location.assign(`/?benchmark=${encodeURIComponent(nextEngine)}`);
    } else {
        sessionStorage.removeItem("benchmark_queue");
        window.location.assign("/");
    }
};

const getSortedBenchmarkResults = (rawResults: string): EngineResult[] => {
    const results: EngineResult[] = JSON.parse(rawResults);
    return results.sort((a, b) =>
        CANONICAL_ENGINE_ORDER.indexOf(a.name) - CANONICAL_ENGINE_ORDER.indexOf(b.name)
    );
};

const initializeBenchmarkQueue = (pageCount: number) => {
    const shuffled = [...CANONICAL_ENGINE_ORDER].sort(() => Math.random() - 0.5);
    const first = shuffled.shift()!;

    sessionStorage.setItem("benchmark_queue", JSON.stringify(shuffled));
    sessionStorage.setItem("benchmark_results", JSON.stringify([]));
    sessionStorage.setItem("benchmark_pageCount", pageCount.toString());

    window.location.assign(`/?benchmark=${encodeURIComponent(first)}`);
};

export function useBenchmarkViewModel() {
    const isProcessingRef = useRef(false);
    const [state, setState] = useState<UiState>({
        characters: [],
        isLoading: false,
        loadingStatus: "INITIALIZING ENGINE...",
        errorMessage: null,
        results: [],
        pageCount: 20,
        selectedStack: SerializationStack.GHOST_WASM,
        isStackDialogVisible: false,
    });

    const executeBenchmarkSequence = async (
        targetEngine: string,
        activePageCount: number
    ) => {
        setState(prev => ({
            ...prev,
            isLoading: true,
            errorMessage: null,
            loadingStatus: `Preparing ${targetEngine}...`,
            results: []
        }));

        try {
            const payloads = await generateMockedPayloads(activePageCount, (status) => {
                setState(s => ({...s, loadingStatus: status}));
            });

            const {runPerformanceBenchmark} = await import("@/utils/benchmark-engine");
            const newResults = await runPerformanceBenchmark({
                pageCount: activePageCount,
                rawResponses: payloads.raw,
                byteResponses: payloads.bytes,
                iterations: ITERATIONS,
                targetEngine,
                onProgress: (status) => setState(s => ({...s, loadingStatus: status}))
            });

            persistEngineResult(newResults[0]);
            advanceToNextEngineInQueue();
        } catch (e: unknown) {
            const error = e as Error;
            console.error("Benchmark failed:", error);
            setState(prev => ({...prev, isLoading: false, errorMessage: "Benchmark Failure: " + error.message}));
            sessionStorage.removeItem("benchmark_queue");
        }
    };

    useEffect(() => {
        if (isProcessingRef.current) return;
        isProcessingRef.current = true;

        const init = async () => {
            setState(s => ({...s, isLoading: true, loadingStatus: "Calibrating Atmosphere..."}));
            try {
                const chars = await fetchCharactersFromApi(1);

                if (typeof window !== "undefined") {
                    const searchParams = new URLSearchParams(window.location.search);
                    const targetEngine = searchParams.get("benchmark");
                    const savedPageCount = parseInt(sessionStorage.getItem("benchmark_pageCount") || "20", 10);

                    if (targetEngine) {
                        setState(s => ({...s, characters: chars, pageCount: savedPageCount}));
                        setTimeout(() => executeBenchmarkSequence(targetEngine, savedPageCount), 100);
                        return;
                    }

                    const resultsStr = sessionStorage.getItem("benchmark_results");
                    if (resultsStr) {
                        setState(s => ({
                            ...s,
                            results: getSortedBenchmarkResults(resultsStr),
                            characters: chars,
                            pageCount: savedPageCount,
                            isLoading: false
                        }));
                        sessionStorage.removeItem("benchmark_results");
                        sessionStorage.removeItem("benchmark_pageCount");
                        return;
                    }
                }

                setState(s => ({...s, isLoading: false, characters: chars}));
            } catch (e: unknown) {
                const error = e as Error;
                setState(s => ({...s, isLoading: false, errorMessage: "Hydration Error: " + error.message}));
            }
        };
        init();
    }, []);

    return {
        state,
        updatePageCount: (count: number) => setState(prev => ({...prev, pageCount: count})),
        selectStack: (stack: SerializationStack) => setState(prev => ({
            ...prev,
            selectedStack: stack,
            isStackDialogVisible: false
        })),
        showStackDialog: (show: boolean) => setState(prev => ({...prev, isStackDialogVisible: show})),
        runBenchmark: () => {
            if (state.isLoading) return;
            initializeBenchmarkQueue(state.pageCount);
        },
    };
}
