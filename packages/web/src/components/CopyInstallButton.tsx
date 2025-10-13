import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { CopyIcon } from "@/components/ui/copy";
import { CheckIcon } from "@/components/ui/check";
import { cn } from "@/lib/utils";

interface CopyInstallButtonProps {
  pluginIdentifier: string;
}

export default function CopyInstallButton({ pluginIdentifier }: CopyInstallButtonProps) {
  const [copied, setCopied] = useState(false);

  const copyInstallCommand = async (e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();

    const command = `npx claude-plugins install ${pluginIdentifier}`;
    await navigator.clipboard.writeText(command);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.button
      onClick={copyInstallCommand}
      className={cn(
        "p-1 rounded transition-all relative",
        copied
          ? "bg-green-500/20 text-green-600 dark:text-green-400"
          : "hover:bg-primary/10 text-muted-foreground hover:text-primary"
      )}
      whileTap={{ scale: 0.9 }}
      aria-label={`Copy install command for ${pluginIdentifier}`}
    >
      <AnimatePresence mode="wait">
        {copied ? (
          <motion.div
            key="check"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <CheckIcon size={14} />
          </motion.div>
        ) : (
          <motion.div
            key="copy"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <CopyIcon size={14} />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  );
}
