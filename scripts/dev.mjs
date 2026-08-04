import { spawn } from "node:child_process";

const npm = process.platform === "win32" ? "C:\\Program Files\\nodejs\\npm.cmd" : "npm";
let shuttingDown = false;

function spawnNpm(args) {
  if (process.platform !== "win32") {
    return spawn(npm, args, {
      cwd: process.cwd(),
      shell: false,
      stdio: ["inherit", "pipe", "pipe"],
    });
  }

  return spawn(process.env.ComSpec ?? "cmd.exe", ["/d", "/c", `npm.cmd ${args.join(" ")}`], {
    cwd: process.cwd(),
    shell: false,
    stdio: ["inherit", "pipe", "pipe"],
  });
}

const processes = [
  ["backend", ["run", "dev", "--workspace", "backend"]],
  ["frontend", ["run", "dev", "--workspace", "frontend"]],
].map(([name, args]) => {
  const child = spawnNpm(args);

  child.stdout.on("data", (chunk) => process.stdout.write(`[${name}] ${chunk}`));
  child.stderr.on("data", (chunk) => process.stderr.write(`[${name}] ${chunk}`));
  child.on("exit", (code, signal) => {
    if (shuttingDown) return;
    console.error(`[${name}] exited with ${signal ?? code}`);
    shutdown(code || 1);
  });

  return child;
});

function shutdown(code = 0) {
  shuttingDown = true;
  for (const child of processes) {
    if (!child.killed) child.kill();
  }
  process.exit(code);
}

process.on("SIGINT", () => shutdown(0));
process.on("SIGTERM", () => shutdown(0));
