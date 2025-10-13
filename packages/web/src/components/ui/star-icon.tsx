import { Star } from "lucide-react";
import type { HTMLAttributes } from "react";

export interface StarIconProps extends HTMLAttributes<SVGElement> {
  size?: number;
}

export function StarIcon({ size = 14, className, ...props }: StarIconProps) {
  return <Star size={size} className={className} {...props} />;
}
