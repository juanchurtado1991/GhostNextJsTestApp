export enum SerializationStack {
    GHOST_WASM = "GHOST_WASM",
    ZOD_NATIVE = "ZOD_NATIVE",
    JSON_NATIVE = "JSON_NATIVE",
}

export interface SerializationStackInfo {
    id: SerializationStack;
    title: string;
    description: string;
    engineName: string;
}

export const SERIALIZATION_STACKS: Record<SerializationStack, SerializationStackInfo> = {
    [SerializationStack.GHOST_WASM]: {
        id: SerializationStack.GHOST_WASM,
        title: "GHOST (WASM)",
        description: "30 ~ 35% less JS heap than Zod. about 15% more ms.",
        engineName: "GHOST",
    },
    [SerializationStack.ZOD_NATIVE]: {
        id: SerializationStack.ZOD_NATIVE,
        title: "ZOD + JSON.parse",
        description: "Next.js standard. Fast for small payloads. High memory cost at scale (~24MB per batch).",
        engineName: "ZOD + JSON.parse",
    },
    [SerializationStack.JSON_NATIVE]: {
        id: SerializationStack.JSON_NATIVE,
        title: "NATIVE JSON.parse",
        description: "Fastest raw parse. Zero type safety. Still allocates ~12MB per batch on the JS heap.",
        engineName: "STANDARD (JSON.parse)",
    },
};

import {CharacterResponse, GhostCharacter} from "@/ghost-models/CharacterResponse";

export type {GhostCharacter, CharacterResponse};

export interface EngineResult {
    name: string;
    timeMs: number;
    memoryBytes: number;
    jankCount: number;
}

export interface UiState {
    characters: GhostCharacter[];
    isLoading: boolean;
    loadingStatus: string;
    errorMessage: string | null;
    results: EngineResult[];
    pageCount: number;
    selectedStack: SerializationStack;
    isStackDialogVisible: boolean;
}
