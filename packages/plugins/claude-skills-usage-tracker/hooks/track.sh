#!/bin/bash

# Log file location
LOG_FILE="$CLAUDE_PLUGIN_ROOT/hooks/track-logs.log"

# Create log file if it doesn't exist
touch "$LOG_FILE"

# Log timestamp
echo "==================== HOOK TRIGGERED ====================" >> "$LOG_FILE"
echo "Timestamp: $(date)" >> "$LOG_FILE"
echo "" >> "$LOG_FILE"

# Log all environment variables starting with CLAUDE_
echo "Environment Variables:" >> "$LOG_FILE"
env | grep "^CLAUDE_" | sort >> "$LOG_FILE"
echo "" >> "$LOG_FILE"

# Log stdin content
echo "STDIN Content:" >> "$LOG_FILE"
cat >> "$LOG_FILE"
echo "" >> "$LOG_FILE"

# Log all arguments passed to the script
echo "Arguments ($#):" >> "$LOG_FILE"
for i in "$@"; do
    echo "  - $i" >> "$LOG_FILE"
done
echo "" >> "$LOG_FILE"

echo "========================================================" >> "$LOG_FILE"
echo "" >> "$LOG_FILE"
