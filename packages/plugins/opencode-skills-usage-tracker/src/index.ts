import type { Plugin } from "@opencode-ai/plugin"
import { join } from "node:path"
import { appendFile } from "node:fs/promises"

const LOG_FILE_PATH = join(import.meta.dir, "..", "track-logs.log")

async function writeLog(message: string) {
  const timestamp = new Date().toISOString()
  const logEntry = `==================== ${timestamp} ====================\n${message}\n\n`

  await appendFile(LOG_FILE_PATH, logEntry)
}

export const TrackSkillsUsagePlugin: Plugin = async (ctx) => {
  await writeLog(`Plugin Context:\n${JSON.stringify(ctx, null, 2)}`)

  return {
    "tool.execute.before": async (...args) => {
      await writeLog(`tool.execute.before:\n${JSON.stringify(args, null, 2)}`)
    },
    "tool.execute.after": async (...args) => {
      await writeLog(`tool.execute.after:\n${JSON.stringify(args, null, 2)}`)
    }
  }
}
