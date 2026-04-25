export const AppDesign = {
    PrimaryDark: "#0F172A",
    SurfaceColor: "#1E293B",
    AccentGlow: "#A855F7", // Ghost Purple
    SecondaryIndigo: "#818CF8", // Indigo 400

    AccentGlowText: "text-[#A855F7]",
    AccentGlowBorder: "border-[#A855F7]",
    AccentGlowBg: "bg-[#A855F7]",

    TextPrimary: "text-[#F8FAFC]",
    TextSecondary: "text-[#94A3B8]",

    GlassBorder: "border-white/10",
    GlassColor: "bg-white/5",

    StatusAlive: "bg-[#10B981]",
    StatusDead: "bg-[#EF4444]",
    StatusUnknown: "bg-[#64748B]",

    ErrorColor: "#EF4444",
    WarningColor: "#FACC15",

    BackgroundGradient: "bg-gradient-to-b from-[#0F172A] to-[#020617]",
};

export const cn = (...classes: (string | undefined | boolean)[]) => {
    return classes.filter(Boolean).join(" ");
};
