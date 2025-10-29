import { useRef } from "react";
import CopyInstallButton, { type CopyInstallButtonHandle } from "./CopyInstallButton";
import { cn } from "@/lib/utils";

type Props = {
  command: string;
  className?: string;
}

export function CommandBox({
  command,
  className,
  ...props
}: Props) {
  const copyButtonRef = useRef<CopyInstallButtonHandle>(null);

  const handleClick = async () => {
    await copyButtonRef.current?.copyCommand();
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      }}
      className={cn(
        "flex items-center gap-2 w-full bg-muted/30 border border-border/50 rounded-md",
        "px-2.5 py-1.5 font-mono text-xs",
        "group-hover:border-primary/30 group-hover:bg-muted/50 transition-all",
        "cursor-pointer hover:bg-muted/40",
        className
      )}
      {...props}
    >
      <span className="select-none text-muted-foreground/50 text-[10px]">$</span>
      <span className="flex-1 whitespace-nowrap text-muted-foreground group-hover:text-foreground transition-colors text-[11px] overflow-auto scroll-smooth">
        {command}
      </span>
      <CopyInstallButton ref={copyButtonRef} command={command} />
    </div>
  );
}
