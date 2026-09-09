interface GreenIndicatorProps {
  text: string;
  className?: string;
}

const GreenIndicator = ({ text, className = "" }: GreenIndicatorProps) => {
  return (
    <div className={`flex items-center justify-center gap-2 ${className}`}>
      <div className="relative w-2 h-2">
        <div className="absolute inset-0 bg-accent rounded-full animate-pulse shadow-lg shadow-accent"></div>

        <div className="absolute inset-0 bg-accent rounded-full opacity-30 animate-ping"></div>
      </div>
      <span className="text-caption font-medium text-accent">{text}</span>
    </div>
  );
};

export default GreenIndicator;
