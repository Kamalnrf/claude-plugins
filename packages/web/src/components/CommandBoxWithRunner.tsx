import { useState } from "react";
import { CommandBox } from "./CommandBox";
import { cn } from "@/lib/utils";

type PackageRunner = "npm" | "bun" | "pnpm" | "yarn";

type RunnerConfig = {
  id: PackageRunner;
  label: string;
  prefix: string;
};

const RUNNERS: RunnerConfig[] = [
  { id: "npm", label: "npm", prefix: "npx" },
  { id: "bun", label: "bun", prefix: "bunx" },
  { id: "pnpm", label: "pnpm", prefix: "pnpm dlx" },
  { id: "yarn", label: "yarn", prefix: "yarn dlx" },
];

type Props = {
  command: string;
  className?: string;
};

export function CommandBoxWithRunner({ command, className }: Props) {
  const [selectedRunner, setSelectedRunner] = useState<PackageRunner>("npm");

  const runner = RUNNERS.find((r) => r.id === selectedRunner)!;
  const fullCommand = `${runner.prefix} ${command}`;

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <div className="flex items-center gap-1 bg-muted/50 rounded-md p-0.5 w-fit">
        {RUNNERS.map((r) => (
          <button
            key={r.id}
            type="button"
            onClick={() => setSelectedRunner(r.id)}
            className={cn(
              "px-2 py-1 text-[10px] font-medium rounded transition-colors",
              selectedRunner === r.id
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            )}
          >
            {r.label}
          </button>
        ))}
      </div>
      <CommandBox command={fullCommand} />
    </div>
  );
}
