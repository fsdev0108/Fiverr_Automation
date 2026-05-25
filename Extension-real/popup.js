const statusStrong = document.querySelector("#status strong");
const backendInput = document.getElementById("backendBase");

const DEFAULT_BACKEND_BASE = "http://127.0.0.1:8000";

function setStatus(running) {
  statusStrong.textContent = running ? "running" : "stopped";
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

document.getElementById("startBtn").addEventListener("click", () => {
  const base = (backendInput.value.trim() || DEFAULT_BACKEND_BASE);
  chrome.storage.sync.set({ backendBase: base }, () => {
    chrome.runtime.sendMessage(
      { type: "RUN_BATCH", backendBase: base, myTz: "America/Los_Angeles" },
      (res) => {
        if (res?.ok) setStatus(true);
        else setStatus(false);
      }
    );
  });
});

document.getElementById("stopBtn").addEventListener("click", () => {
  chrome.runtime.sendMessage({ type: "STOP" }, () => setStatus(false));
});
