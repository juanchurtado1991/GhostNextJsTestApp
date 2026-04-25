import {
    deserializeModelFromBytesSync,
    deserializeModelSync,
    ensureGhostReady,
    getGhostWasmMemoryByteLength
} from "@/ghost-generated-types/ghost-bridge";
import {EngineResult} from "@/models/types";
import {CharacterResponseSchema} from "@/models/zod-schemas";

interface PerformanceExtended extends Performance {
    memory?: { usedJSHeapSize: number; totalJSHeapSize: number };
    measureUserAgentSpecificMemory?: () => Promise<{ bytes: number }>;
}

export interface BenchmarkConfig {
    pageCount: number;
    rawResponses: string[][];
    byteResponses: Uint8Array[][];
    iterations: number;
    onProgress?: (status: string) => void;
    targetEngine?: string;
}

async function allowGarbageCollectionSettle(ms = 80): Promise<void> {
    await new Promise((r) => setTimeout(r, ms));
}

async function calculateActiveHeapMemory(): Promise<number> {
    const perf = performance as PerformanceExtended;
    if (typeof perf.measureUserAgentSpecificMemory === "function") {
        try {
            const result = await perf.measureUserAgentSpecificMemory();
            return result.bytes;
        } catch {
            // Fall through to legacy API
        }
    }
    return perf.memory?.usedJSHeapSize ?? 0;
}

export type EngineName = "GHOST (Zero-Copy)" | "GHOST (String API)" | "ZOD + JSON.parse" | "STANDARD (JSON.parse)";

function executeSerializationIteration(engine: EngineName, raw: string, bytes: Uint8Array): unknown {
    if (engine === "GHOST (Zero-Copy)") {
        return deserializeModelFromBytesSync(bytes, "CharacterResponse");
    } else if (engine === "GHOST (String API)") {
        return deserializeModelSync(raw, "CharacterResponse");
    } else if (engine === "ZOD + JSON.parse") {
        return CharacterResponseSchema.parse(JSON.parse(raw));
    } else {
        return JSON.parse(raw);
    }
}

export async function runPerformanceBenchmark(config: BenchmarkConfig): Promise<EngineResult[]> {
    const WARMUP_ITERS = 50;
    let engines: EngineName[] = [
        "GHOST (Zero-Copy)",
        "GHOST (String API)",
        "ZOD + JSON.parse",
        "STANDARD (JSON.parse)",
    ];

    if (config.targetEngine) {
        engines = engines.filter(e => e === config.targetEngine);
    }

    const shuffledEngines = [...engines].sort(() => Math.random() - 0.5);
    const resultMap = new Map<EngineName, EngineResult>();

    await ensureGhostReady();
    await allowGarbageCollectionSettle(200);

    for (const engine of shuffledEngines) {
        config.onProgress?.(`[1/3] Warming up ${engine} (${WARMUP_ITERS} iters)...`);

        const keepAliveWarm: unknown[] = [];
        for (let w = 0; w < WARMUP_ITERS; w++) {
            for (let p = 0; p < config.pageCount; p++) {
                keepAliveWarm.push(executeSerializationIteration(engine, config.rawResponses[p][0], config.byteResponses[p][0]));
            }
        }

        if (keepAliveWarm.length === 0) throw new Error("Warmup produced no results.");
        await allowGarbageCollectionSettle(200);

        config.onProgress?.(`[2/3] Measuring ${engine} (${config.iterations} unique payloads)...`);

        const keepAlive: unknown[] = [];
        let jankCount = 0;

        await allowGarbageCollectionSettle(300);
        const memBefore = await calculateActiveHeapMemory();

        const t0 = performance.now();

        for (let j = 0; j < config.iterations; j++) {
            const iterStart = performance.now();

            for (let p = 0; p < config.pageCount; p++) {
                keepAlive.push(executeSerializationIteration(engine, config.rawResponses[p][j], config.byteResponses[p][j]));
            }

            const elapsed = performance.now() - iterStart;
            if (elapsed > 16.67) jankCount++;
        }

        const totalElapsed = performance.now() - t0;
        const avgTimeMs = totalElapsed / (config.iterations * config.pageCount);

        // Crucial: Wait for GC to settle before measuring final heap
        await allowGarbageCollectionSettle(400);
        const memAfter = await calculateActiveHeapMemory();
        
        let finalMemoryBytes = 0;
        if (engine.startsWith("GHOST")) {
            const wasmMemTotal = getGhostWasmMemoryByteLength();
            const jsDelta = memAfter > memBefore ? memAfter - memBefore : 0;
            finalMemoryBytes = wasmMemTotal + jsDelta;
        } else {
            finalMemoryBytes = memAfter > memBefore ? memAfter - memBefore : 0;
        }

        config.onProgress?.(`[3/3] Validating ${engine} output integrity...`);
        const sample = keepAlive[Math.floor(keepAlive.length / 2)] as any;
        if (!sample?.results?.[0]?.name) {
            throw new Error(`${engine} returned corrupt or empty data.`);
        }

        resultMap.set(engine, {
            name: engine,
            timeMs: avgTimeMs,
            memoryBytes: finalMemoryBytes,
            jankCount,
        });

        await allowGarbageCollectionSettle(300);
    }

    return engines.map((name) => resultMap.get(name)!);
}
