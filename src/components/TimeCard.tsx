import { cn } from "@/lib/utils";

interface TimeCardProps {
  label: string;
  time: string;
  sublabel?: string;
  variant?: "sleep" | "wake" | "leave" | "default";
  className?: string;
}

const variantStyles = {
  sleep: "bg-secondary text-secondary-foreground",
  wake: "bg-primary text-primary-foreground",
  leave: "bg-card text-card-foreground border border-border",
  default: "bg-card text-card-foreground border border-border",
};

const TimeCard = ({ label, time, sublabel, variant = "default", className }: TimeCardProps) => {
  return (
    <div
      className={cn(
        "rounded-lg p-4 text-center shadow-md transition-all",
        variantStyles[variant],
        className
      )}
    >
      <p className="text-sm font-medium opacity-80">{label}</p>
      <p className="text-3xl font-bold tracking-tight">{time}</p>
      {sublabel && (
        <p className="text-xs opacity-70 mt-1">{sublabel}</p>
      )}
    </div>
  );
};

export default TimeCard;
