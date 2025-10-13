import CopyInstallButton from "./CopyInstallButton";
import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "react";

export interface InstallCommandProps extends HTMLAttributes<HTMLDivElement> {
  namespace: string;
  name: string;
}

export function InstallCommand({
  namespace,
  name,
  className,
  ...props
}: InstallCommandProps) {
  const command = `npx claude-plugins install ${namespace}/${name}`;

  return (
    <div
      className={cn(
        "flex items-center gap-2 w-full bg-muted/30 border border-border/50 rounded-md",
        "px-2.5 py-1.5 font-mono text-xs",
        "group-hover:border-primary/30 group-hover:bg-muted/50 transition-all",
        className
      )}
      {...props}
    >
      <span className="select-none text-muted-foreground/50 text-[10px]">$</span>
      <span className="flex-1 truncate text-muted-foreground group-hover:text-foreground transition-colors text-[11px]">
        {command}
      </span>
      <CopyInstallButton pluginIdentifier={`${namespace}/${name}`} />
    </div>
  );
}
