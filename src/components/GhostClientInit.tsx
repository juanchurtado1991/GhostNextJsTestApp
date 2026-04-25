"use client";

import React, {useEffect, useState} from "react";
import {ensureGhostReady} from "@/ghost-generated-types/ghost-bridge";

const initializeGhostEngine = async (onSuccess: () => void) => {
    console.log("👻 Initializing Ghost Serialization...");
    try {
        await ensureGhostReady();
        console.log("✅ Ghost Engine Synced.");
        onSuccess();
    } catch (e) {
        console.error("❌ Failed to initialize Ghost:", e);
        onSuccess();
    }
};

export default function GhostClientInit({children}: { children: React.ReactNode }) {
    const [isInitialized, setIsInitialized] = useState(false);

    useEffect(() => {
        initializeGhostEngine(() => setIsInitialized(true));
    }, []);

    if (!isInitialized) {
        return (
            <div className="fixed inset-0 flex items-center justify-center bg-[#0F172A] z-50">
                <div className="flex flex-col items-center gap-4">
                    <div
                        className="w-12 h-12 border-4 border-[#A855F7] border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-[#A855F7] font-mono text-sm animate-pulse tracking-widest">WARMING UP GHOST
                        ENGINE...</p>
                </div>
            </div>
        );
    }

    return <>{children}</>;
}
