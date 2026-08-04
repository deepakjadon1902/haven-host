import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);
const port = Number(process.argv[2]);

if (!Number.isInteger(port) || port <= 0 || port > 65535) {
  console.error("Usage: node scripts/kill-port.mjs <port>");
  process.exit(1);
}

if (process.platform !== "win32") {
  process.exit(0);
}

const { stdout } = await execFileAsync("netstat", ["-ano"]);
const pids = new Set();

for (const line of stdout.split(/\r?\n/)) {
  const parts = line.trim().split(/\s+/);
  if (parts.length < 5) continue;
  const [protocol, localAddress, , state, pid] = parts;
  if (!/^TCP$/i.test(protocol)) continue;
  if (state !== "LISTENING") continue;
  if (!localAddress.endsWith(`:${port}`)) continue;
  if (/^\d+$/.test(pid)) pids.add(pid);
}

for (const pid of pids) {
  try {
    await execFileAsync("taskkill", ["/PID", pid, "/T", "/F"]);
    console.log(`[dev] freed port ${port} from PID ${pid}`);
  } catch (error) {
    console.warn(`[dev] could not stop PID ${pid}: ${error.message}`);
  }
}
