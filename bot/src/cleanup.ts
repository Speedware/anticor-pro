import { config } from "./config";
import { deleteExpiredRequests } from "./db";

const DAY_MS = 24 * 60 * 60 * 1000;

function runCleanup() {
  const deleted = deleteExpiredRequests(config.retentionYears);
  if (deleted > 0) {
    console.log(`Удалено заявок старше ${config.retentionYears} лет: ${deleted}`);
  }
}

export function startRetentionCleanup() {
  runCleanup();
  setInterval(runCleanup, DAY_MS);
}
