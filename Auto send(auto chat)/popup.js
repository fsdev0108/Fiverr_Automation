const backendInput = document.getElementById("backendBase");
const startBtn = document.getElementById("startBtn");
const stopBtn = document.getElementById("stopBtn");
const statusEl = document.getElementById("status");

const DEFAULT_BACKEND_BASE = "https://rabbit-fiverr.duckdns.org";

function setStatus(running) {
  statusEl.innerHTML =
    "Status: <strong>" + (running ? "running" : "stopped") + "</strong>";
}

document.addEventListener("DOMContentLoaded", () => {
  chrome.storage.sync.get(["backendBase"], (res) => {
    backendInput.value = res.backendBase || DEFAULT_BACKEND_BASE;
  });

  chrome.runtime.sendMessage({ type: "GET_STATUS" }, (res) => {
    if (res) setStatus(res.running);
  });
});

backendInput.addEventListener("change", () => {
  const value = backendInput.value.trim();
  chrome.storage.sync.set({ backendBase: value || DEFAULT_BACKEND_BASE });
});

startBtn.addEventListener("click", () => {
  const value = backendInput.value.trim();
  chrome.storage.sync.set(
    { backendBase: value || DEFAULT_BACKEND_BASE },
    () => {
      chrome.runtime.sendMessage({ type: "START_MONITOR" }, (res) => {
        if (res) setStatus(res.running);
      });
    }
  );
});

stopBtn.addEventListener("click", () => {
  chrome.runtime.sendMessage({ type: "STOP_MONITOR" }, (res) => {
    if (res) setStatus(res.running);
  });
});
