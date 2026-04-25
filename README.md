# Ghost Serialization Next.js Test Laboratory

Welcome to the **Ghost Serialization** Next.js Performance Laboratory. This application serves as the definitive testing ground for the Ghost Kotlin/Wasm engine running within a modern web framework environment. 

It is designed to stress-test serialization performance, measure memory footprints (GC pressure), and validate the Isomorphic Node.js integration of the WebAssembly artifacts.

## 🚀 Overview

This Next.js app simulates a heavy data-fetching load (fetching multiple pages of characters from a remote API) and benchmarks different serialization strategies to measure speed and memory usage. 

The primary goal is to demonstrate how the **Ghost Serialization WASM Engine** outperforms traditional `JSON.parse` and validation libraries (like Zod) in terms of **Memory Footprint** by using a Zero-Copy architecture across the Kotlin/JS interop bridge.

## 🛠 Tech Stack

- **Framework**: Next.js 16 (App Router + Turbopack)
- **UI**: React 19, Tailwind CSS, Custom Glassmorphism Design System
- **Core Engine**: Ghost Serialization (Kotlin 2.1.10 / WebAssembly)
- **Validation Fallback**: Zod

## 🧠 Architecture: The Invisible Bridge

This project utilizes the Ghost **"Invisible Bridge"** (`ghost-standalone.js`).
When you run the synchronization script, Ghost automatically:
1. Provisions a sandboxed OpenJDK 21 and Gradle 8.13 environment in `~/.ghost/`.
2. Downloads the `ghost-serialization-wasm` core library from Maven Central.
3. Transpiles your local TypeScript models into Kotlin Data Classes.
4. Compiles a highly-optimized WebAssembly engine.
5. Injects isomorphic Node.js loading patches to guarantee compatibility with Next.js SSR and Turbopack.

## 🚦 Running the Benchmark

### 1. Synchronize the Engine

Before running the app, ensure the WASM engine is perfectly synchronized with your TypeScript models:

```bash
npm run ghost:sync
```
*Note: This command will generate the `ghost-bridge.ts` and the `.wasm` binaries inside `src/ghost-generated-types/`.*

### 2. Start the Development Server

```bash
npm run dev
```

### 3. Run the Stress Test

Open [http://localhost:3000](http://localhost:3000) with your browser.
1. Adjust the **Stress Load** slider to fetch up to 10 pages of data (x100 iterations each).
2. Click **RUN STRESS COMPARISON**.
3. The app will hard-reload into a deterministic state machine, running the benchmark sequentially across 4 engines:
   - **GHOST (Zero-Copy)**: Raw bytes to typed Kotlin objects.
   - **GHOST (String API)**: JSON string to typed Kotlin objects.
   - **ZOD + JSON.parse**: Standard JS parsing with rigorous schema validation.
   - **STANDARD (JSON.parse)**: Unsafe native parsing.

## 📊 Interpreting Results

At the end of the benchmark, the **Performance Insight Card** will highlight the primary advantage of Ghost Serialization: **Memory Efficiency**.

Look for the **MEMORY SAVED** badge. Ghost typically uses significantly less active JS Heap RAM than native solutions, reducing Garbage Collection (GC) pressure and eliminating dropped frames (jank) on low-end mobile devices and Edge environments.
