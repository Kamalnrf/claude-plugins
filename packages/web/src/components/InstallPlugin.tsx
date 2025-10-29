import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "react";
import {CommandBox} from "./CommandBox";

export interface InstallCommandProps extends HTMLAttributes<HTMLDivElement> {
  namespace: string;
  name: string;
}

export function InstallPlugin({
  namespace,
  name,
  className,
  ...props
}: InstallCommandProps) {
  const command = `npx claude-plugins install ${namespace}/${name}`;

  return (
    <div className={cn("w-full group-hover:opacity-100 transition-opacity", className)} {...props}>
      <CommandBox
        command={command}
        className="group-hover:border-primary/30 group-hover:bg-muted/50"
      />
    </div>
  );
}
