declare module './ghost-standalone-wasm-js.mjs' {
    export function ghostPrewarm(): void;
    export function ghostSerialize(model: any, modelName: string): string;
    export function ghostDeserialize(json: string, modelName: string): any;
    export function ghostDeserializeJs(json: string, modelName: string): any;
    export function ghostDeserializeBytes(bytes: Uint8Array, modelName: string): any;
    export function ghostDeserializeBytesJs(bytes: Uint8Array, modelName: string): any;
    export const memory: WebAssembly.Memory;
    export function _initialize(): void;
    export function startUnitTests(): void;
}
