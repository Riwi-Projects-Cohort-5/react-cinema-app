import { cn } from "@shared/utils/cn";

type GreenIndicatorTone = "accent" | "warning";

interface GreenIndicatorProps {
  text: string;
  tone?: GreenIndicatorTone;
  className?: string;
}

const toneClasses: Record<GreenIndicatorTone, { dot: string; text: string; shadow: string }> = {
  accent: { dot: "bg-accent", text: "text-accent", shadow: "shadow-accent" },
  warning: { dot: "bg-warning", text: "text-warning", shadow: "shadow-warning" },
};

const GreenIndicator = ({ text, tone = "accent", className = "" }: GreenIndicatorProps) => {
  const { dot, text: textClass, shadow } = toneClasses[tone];

  return (
    <div className={cn("flex items-center justify-center gap-2", className)}>
      <div className="relative w-2 h-2">
        <div className={cn("absolute inset-0 rounded-full animate-pulse shadow-lg", dot, shadow)} />
        <div className={cn("absolute inset-0 rounded-full opacity-30 animate-ping", dot)} />
      </div>
      <span className={cn("text-caption font-medium", textClass)}>{text}</span>
    </div>
  );
};

export default GreenIndicator;
