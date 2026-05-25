let busy = false;

const ALARM = "fiverr_tick";
const DEFAULT_BACKEND = "http://127.0.0.1:8000";

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  // popup asks status
  if (msg?.type === "GET_STATUS") {
    chrome.storage.local.get(["running"], (res) => {
      sendResponse({ running: Boolean(res.running) });
    });
    return true;
  }

  // stop
  if (msg?.type === "STOP") {
    chrome.storage.local.set({ running: false }, () => {
      chrome.alarms.clear(ALARM);
      sendResponse({ ok: true });
    });
    return true;
  }

  // start
  if (msg?.type === "RUN_BATCH") {
    const backendBase = (msg.backendBase || DEFAULT_BACKEND).replace(/\/+$/, "");
    const myTz = msg.myTz || "America/Los_Angeles";

    chrome.storage.local.set({ running: true, backendBase, myTz }, () => {
      chrome.alarms.create(ALARM, { periodInMinutes: 0.05 });
      processOneBatch(); // run immediately once
      sendResponse({ ok: true });
    });

    return true;
  }
});

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === ALARM) processOneBatch();
});

// When service worker restarts, restore alarm if running=true
function restoreAlarmIfRunning() {
  chrome.storage.local.get(["running"], (res) => {
    if (res.running) {
      chrome.alarms.create(ALARM, { periodInMinutes: 1 });
    }
  });
}
restoreAlarmIfRunning();
chrome.runtime.onStartup.addListener(restoreAlarmIfRunning);
chrome.runtime.onInstalled.addListener(restoreAlarmIfRunning);

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function fetchJson(url, options = {}) {
  const res = await fetch(url, options);
  const text = await res.text();
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${text.slice(0, 200)}`);
  try { return JSON.parse(text); }
  catch { throw new Error(`Not JSON: ${text.slice(0, 200)}`); }
}

async function take10FromBackend(base) {
  return await fetchJson(`${base}/userids_from_file`);
}

async function sendBatchToBackend(base, usersPayload, myTz, file_state) {
  return await fetchJson(`${base}/filter_users_and_write`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ users: usersPayload, my_tz: myTz, count: file_state })
  });
}

// ---- TAB SCRAPE ----
function waitForTabComplete(tabId, timeoutMs = 30000) {
  return new Promise((resolve, reject) => {
    const t = setTimeout(() => {
      chrome.tabs.onUpdated.removeListener(listener);
      reject(new Error("Tab load timeout"));
    }, timeoutMs);

    function listener(updatedTabId, info) {
      if (updatedTabId === tabId && info.status === "complete") {
        clearTimeout(t);
        chrome.tabs.onUpdated.removeListener(listener);
        resolve();
      }
    }
    chrome.tabs.onUpdated.addListener(listener);
  });
}

async function scrapeFromTab(tabId) {
  const [{ result }] = await chrome.scripting.executeScript({
    target: { tabId },
    func: async () => {
      const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
      const pick = (sel) => document.querySelector(sel);
      const pickAll = (sel) => Array.from(document.querySelectorAll(sel));

      let img = null,
          timeEl = null,
          lan = null,
          contactBtn = null;

      for (let i = 0; i < 40; i++) {
        img = pick("img.efe4354");

        const darks = pickAll(".flex.co-text-dark");
        timeEl =
          darks.find(el =>
            (el.textContent || "").includes("Local time")
          ) || pick(".flex.co-text-dark.m-b-4");

        const spans = pickAll("span[data-track-tag='text']");
        lan = spans[1] || null;
        country = spans[0] || null;

        // Find Contact me button
        contactBtn = pickAll("button").find(btn =>
          (btn.textContent || "").includes("Contact me")
        );

        const timeText = (timeEl?.textContent || "").trim();

        if (img?.getAttribute("src") && timeText) {
          break;
        }

        await sleep(500);
      }

      return {
        img_url: img?.getAttribute("src") || "",
        language: (lan?.textContent || "").trim(),
        country: (country?.textContent || "").trim(),
        time_text: (timeEl?.textContent || "").trim(),

        // disable status
        is_disabled: contactBtn?.disabled || false,

        // optional
        disabled_attr: contactBtn?.hasAttribute("disabled") || false
      };
    }
  });

  return result;
}

async function openScrapeClose(userid) {
  const url = `https://www.fiverr.com/${encodeURIComponent(userid)}`;
  const tab = await chrome.tabs.create({ url, active: false });

  try {
    await waitForTabComplete(tab.id);
    await sleep(10000);
    const scraped = await scrapeFromTab(tab.id);
    return { userid, ...scraped, profile_url: url };
  } finally {
    try { await chrome.tabs.remove(tab.id); } catch {}
  }
}

// ⭐ ONE batch per tick

async function processOneBatch() {
  if (busy) return;

  const { running, backendBase, myTz } = await chrome.storage.local.get([
    "running", "backendBase", "myTz"
  ]);

  if (!running) return;

  busy = true;
  try {
    const batchInfo = await take10FromBackend(backendBase);
    const taken = batchInfo.taken || [];
    const file_state = batchInfo.count || 0;
    console.log(file_state);
    
    // IMPORTANT: don't auto-stop unless you really want to
    if (taken.length === 0) {
      return; // just wait for next alarm tick
    }

    const usersPayload = [];
    for (const userid of taken) {
      try {
        usersPayload.push(await openScrapeClose(userid)); // now returns correct data
      } catch {
        usersPayload.push({
          userid,
          img_url: "",
          language: "",
          time_text: "",
          profile_url: `https://www.fiverr.com/${encodeURIComponent(userid)}`,
        });
      }
    }
    console.log("file_state", file_state);
    
    await sendBatchToBackend(backendBase, usersPayload, myTz, file_state);
  } catch (e) {
    console.error("processOneBatch error:", e);
  } finally {
    busy = false;
  }
}

