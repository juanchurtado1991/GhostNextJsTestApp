// AUTO-GENERATED - GHOST SERIALIZATION BRIDGE
// @ts-ignore
import * as GhostWasm from "./ghost-standalone-wasm-js.mjs";
const { ghostPrewarm, ghostDeserializeJs, ghostDeserializeBytesJs, memory } = GhostWasm as any;
import type { GhostCharacterOrigin } from "../ghost-models/CharacterResponse";
import type { GhostCharacter } from "../ghost-models/CharacterResponse";
import type { CharacterResponseInfo } from "../ghost-models/CharacterResponse";
import type { CharacterResponse } from "../ghost-models/CharacterResponse";

export interface GhostModels {
    GhostCharacterOrigin: GhostCharacterOrigin;
    GhostCharacter: GhostCharacter;
    CharacterResponseInfo: CharacterResponseInfo;
    CharacterResponse: CharacterResponse;
}

export type ModelName = keyof GhostModels;

/**
 * Ensures the Ghost WASM engine is loaded and initialized.
 */
export async function ensureGhostReady(): Promise<void> {
    if (typeof ghostPrewarm === 'function') ghostPrewarm();
}

/**
 * Deserializes a JSON string into a typed Kotlin/Wasm model.
 */
export function deserializeModelSync<T extends ModelName>(json: string, model: T): GhostModels[T] {
    const result = ghostDeserializeJs(json, model);
    if (result === null || result === undefined) throw new Error(`Failed to deserialize ${model}. Check if the model is registered.`);
    return result as GhostModels[T];
}

/**
 * Deserializes raw UTF-8 bytes into a typed Kotlin/Wasm model (Fastest Path).
 */
export function deserializeModelFromBytesSync<T extends ModelName>(bytes: Uint8Array, model: T): GhostModels[T] {
    const result = ghostDeserializeBytesJs(bytes, model);
    if (result === null || result === undefined) throw new Error(`Failed to deserialize ${model} from bytes.`);
    return result as GhostModels[T];
}

/**
 * Returns the current memory usage of the Ghost WASM linear memory.
 */
export function getGhostWasmMemoryByteLength(): number {
    if (!memory) return 0;
    return (memory as WebAssembly.Memory).buffer.byteLength;
}

// Re-export types for convenience
export type { GhostCharacterOrigin };
export type { GhostCharacter };
export type { CharacterResponseInfo };
export type { CharacterResponse };
