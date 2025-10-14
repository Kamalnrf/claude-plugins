import { useState, useRef, forwardRef, useImperativeHandle } from "react";
import { motion, AnimatePresence } from "motion/react";
import { CopyIcon, type CopyIconHandle } from "@/components/ui/copy";
import { CheckIcon } from "@/components/ui/check";
import { cn } from "@/lib/utils";

interface CopyInstallButtonProps {
  pluginIdentifier: string;
}

export interface CopyInstallButtonHandle {
  copyCommand: () => Promise<void>;
  triggerAnimation: () => void;
}

const CopyInstallButton = forwardRef<CopyInstallButtonHandle, CopyInstallButtonProps>(
  ({ pluginIdentifier }, ref) => {
    const [copied, setCopied] = useState(false);
    const iconRef = useRef<CopyIconHandle>(null);

    const copyInstallCommand = async (e?: React.MouseEvent) => {
      e?.preventDefault();
      e?.stopPropagation();

      const command = `npx claude-plugins install ${pluginIdentifier}`;
      await navigator.clipboard.writeText(command);
      setCopied(true);

      // Trigger icon animation
      iconRef.current?.startAnimation();
      setTimeout(() => {
        iconRef.current?.stopAnimation();
      }, 500);

      setTimeout(() => setCopied(false), 2000);
    };

    useImperativeHandle(ref, () => ({
      copyCommand: async () => {
        await copyInstallCommand();
      },
      triggerAnimation: () => {
        iconRef.current?.startAnimation();
        setTimeout(() => {
          iconRef.current?.stopAnimation();
        }, 500);
      }
    }));

    const handleMouseEnter = () => {
      if (!copied) {
        iconRef.current?.startAnimation();
      }
    };

    const handleMouseLeave = () => {
      if (!copied) {
        iconRef.current?.stopAnimation();
      }
    };

    return (
      <motion.button
        onClick={copyInstallCommand}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
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
              <CopyIcon size={14} ref={iconRef} />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    );
  }
);

CopyInstallButton.displayName = "CopyInstallButton";

export default CopyInstallButton;
