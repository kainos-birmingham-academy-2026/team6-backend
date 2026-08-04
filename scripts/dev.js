const { spawn } = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");

const sourceFile = path.join(__dirname, "..", "src", "index.js");
let child;
let restartTimeout;

function startServer() {
  child = spawn(process.execPath, [sourceFile], {
    stdio: "inherit"
  });

  child.on("exit", (code, signal) => {
    if (signal !== "SIGTERM" && signal !== "SIGINT" && code !== 0) {
      console.error(`Server exited with code ${code}`);
    }
  });
}

function restartServer() {
  if (restartTimeout) {
    clearTimeout(restartTimeout);
  }

  restartTimeout = setTimeout(() => {
    if (child && !child.killed) {
      child.kill("SIGTERM");
    }
    startServer();
  }, 100);
}

startServer();

// Use polling-based watch to avoid file descriptor limits in restricted environments.
fs.watchFile(sourceFile, { interval: 250 }, (current, previous) => {
  if (current.mtimeMs !== previous.mtimeMs) {
    console.log("Source change detected. Restarting server...");
    restartServer();
  }
});

function shutdown() {
  fs.unwatchFile(sourceFile);
  if (child && !child.killed) {
    child.kill("SIGTERM");
  }
  process.exit(0);
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
