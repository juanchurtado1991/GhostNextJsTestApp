import {AppDesign, cn} from "@/utils/design-system";

interface SampleTextProps {
  text: string;
  isBold?: boolean;
  fontSize?: number;
  isSecondary?: boolean;
  overrideColor?: string; // Can be hex or tailwind class
  textAlign?: "left" | "center" | "right";
  className?: string;
}

function resolveColorClass(
    isHex: boolean | undefined,
    overrideColor: string | undefined,
    isSecondary: boolean
): string {
  if (!isHex && overrideColor) return overrideColor;
  return isSecondary ? AppDesign.TextSecondary : AppDesign.TextPrimary;
}

function resolveColorStyle(
    isHex: boolean | undefined,
    overrideColor: string | undefined
): string | undefined {
  return isHex ? overrideColor : undefined;
}

export function SampleText({
  text,
  isBold = false,
  fontSize = 16,
  isSecondary = false,
  overrideColor,
  textAlign = "left",
  className,
}: SampleTextProps) {
  const isHex = overrideColor?.startsWith("#");

  return (
    <p
      className={cn(
          resolveColorClass(isHex, overrideColor, isSecondary),
        isBold ? "font-bold" : "font-normal",
        className
      )}
      style={{ 
        fontSize: `${fontSize}px`, 
        textAlign,
        color: resolveColorStyle(isHex, overrideColor)
      }}
    >
      {text}
    </p>
  );
}
