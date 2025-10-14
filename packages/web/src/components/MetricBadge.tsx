import type { ComponentType, HTMLAttributes, RefObject } from "react";
import { useRef } from "react";
import { cn } from "@/lib/utils";

export interface IconHandle {
  startAnimation: () => void;
  stopAnimation: () => void;
}

export interface MetricBadgeProps extends HTMLAttributes<HTMLDivElement> {
  icon: ComponentType<{ size?: number; ref?: RefObject<IconHandle> }>;
  value: string;
  color: "yellow" | "blue" | "green";
}

const colorClasses = {
  yellow: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 hover:bg-yellow-500/20",
  blue: "bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-500/20",
  green: "bg-green-500/10 text-green-600 dark:text-green-400 hover:bg-green-500/20",
};

export function MetricBadge({
  icon: Icon,
  value,
  color,
  className,
  ...props
}: MetricBadgeProps) {
  const iconRef = useRef<IconHandle>(null);

  const handleMouseEnter = () => {
    iconRef.current?.startAnimation();
  };

  const handleMouseLeave = () => {
    iconRef.current?.stopAnimation();
  };

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1 px-1.5 py-0.5 rounded transition-all",
        "hover:scale-105",
        colorClasses[color],
        className
      )}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      {...props}
    >
      <Icon size={12} ref={iconRef} />
      <span className="font-semibold tabular-nums text-[11px]">{value}</span>
    </div>
  );
}
