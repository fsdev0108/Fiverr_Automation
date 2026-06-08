// ---------------------------
// CONFIG
// ---------------------------

const DEFAULT_BACKEND_BASE = "http://127.0.0.1:3000";
const ALARM_NAME = "SendingCycle";
const ALARM_PERIOD = 10; //10min

let workerTabId = null;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function getBackendBase() {
  return new Promise((resolve) => {
    chrome.storage.sync.get(["backendBase"], (res) => {
      resolve(res.backendBase || DEFAULT_BACKEND_BASE);
    });
  });
}

async function getRunning() {
  return new Promise((resolve) => {
    chrome.storage.local.get(["isRunning"], (res) => {
      resolve(Boolean(res.isRunning));
    });
  });
}

async function setRunning(v) {
  await chrome.storage.local.set({ isRunning: v });
}

// async function openOrReuseTab(url) {
//   let { workerTabId } = await chrome.storage.local.get("workerTabId");
//   // if (!await getRunning()) return;
//   if (workerTabId !== null) {
//     try {
//       const tab = await chrome.tabs.update(workerTabId, { url, active: false });
//       workerTabId = tab.id;
//       return workerTabId;
//     } catch (e) {
//       workerTabId = null;
//     }
//   }
//   const tab = await chrome.tabs.create({ url, active: false });
//   chrome.storage.local.set({ workerTabId: tab.id });
//   return tab.id;
// }

async function openOrReuseTab(url) {
  let { workerTabId } = await chrome.storage.local.get("workerTabId");

  try {
    if (workerTabId) {
      await chrome.tabs.get(workerTabId);
      return (await chrome.tabs.update(workerTabId, { url, active: false })).id;
    }
  } catch {}

  const tab = await chrome.tabs.create({ url, active: false });
  chrome.storage.local.set({ workerTabId: tab.id });
  return tab.id;
}

function waitForTabLoaded(tabId, timeoutMS = 30000) {
  return new Promise((resolve) => {
    function listener(id, info) {
      if (id === tabId && info.status === "complete") {
        chrome.tabs.onUpdated.removeListener(listener);
        resolve();
      }
    }
    chrome.tabs.onUpdated.addListener(listener);
  });
}


function getRandomDelay(a, b) {
  const min = a / 1;
  const max = b / 1;

  if (Number.isNaN(min) || Number.isNaN(max)) {
    setRunning(false);
    return 1000;
  }

  return Math.floor(
    (Math.random() * (max - min) + min) * 60
  );
}
async function input_data1(tabId) {
  const [{ result }] = await chrome.scripting.executeScript({
    target: { tabId },
    func: async () => {

      const sleep = (ms) => new Promise(r => setTimeout(r, ms));

      // =========================
      // 1. FIND SLATE EDITOR
      // =========================
      const input =
        document.querySelector('#send-message-text-area [contenteditable="true"][data-slate-editor="true"]') ||
        document.querySelector('#send-message-text-area [contenteditable="true"]') ||
        document.querySelector('[data-slate-editor="true"]');

      // =========================
      // 2. FIND SEND BUTTON (stable)
      // =========================
      const sendButton =
        document.querySelector('button[aria-label="Send"]') ||
        [...document.querySelectorAll('button')]
          .find(btn => btn.getAttribute("aria-label")?.toLowerCase().includes("send"));

      // =========================
      // 3. FIND USER NAME (robust fallback)
      // =========================
      const nameEl =
        document.querySelector('header a[target="_blank"]') ||
        document.querySelector('header a[href*="pro.fiverr"]') ||
        [...document.querySelectorAll("header a")]
          .find(a => a.textContent?.trim().length > 0);

      if (!input || !sendButton) {
        return {
          state: "Error",
          message: "Editor or Send button not found"
        };
      }
      
      const fullName = nameEl?.textContent?.trim() || "there";
      const name = fullName.split(" ")[0];
      console.log("name========>", name);
      
      const msg =
`Hello ${name}! 👋
Nice to meet you. How are you?
I'm looking for a EU-based freelancer to help me with a project.`;

      // =========================
      // 4. TYPE INTO SLATE EDITOR
      // =========================
      input.focus();

      // Clear existing content safely
      input.textContent = "";

      // Preferred method: simulate paste (best for Slate/React)
      const dataTransfer = new DataTransfer();
      dataTransfer.setData("text/plain", msg);

      input.dispatchEvent(
        new ClipboardEvent("paste", {
          clipboardData: dataTransfer,
          bubbles: true
        })
      );

      // Fallback if paste didn't work
      if (!input.textContent.trim()) {
        input.textContent = msg;
      }

      // Trigger React/Slate updates
      input.dispatchEvent(new InputEvent("input", { bubbles: true }));
      input.dispatchEvent(new Event("change", { bubbles: true }));

      await sleep(800);

      // =========================
      // 5. CLICK SEND
      // =========================
      sendButton.click();

      return {
        state: "Success",
        message: "Message sent successfully"
      };
    }
  });

  console.log(result);

  if (result.state === "Error") {
    await setRunning(false);
    console.log("Error occurred! send1");
  }
}
// async function input_data2_1(tabId) {
//   let pdfBlob;

//   // Fetch PDF blob
//   // try {
//   //   const base = (await getBackendBase()).replace(/\/+$/, "");
//   //   const resp = await fetch(`${base}/api/pdf`);
//   //   if (!resp.ok) {
//   //     throw new Error("Failed to fetch PDF");
//   //   }
//   //   pdfBlob = await resp.blob();
//   // } catch (error) {
//   //   console.error("Error fetching PDF:", error);
//   //   return;
//   // }

//   // const file = new File([pdfBlob], "Project Description.pdf", { type: "application/pdf" });

//   const [{ result }] = await chrome.scripting.executeScript({
//     target: { tabId },
//     func: () => {
//       // console.log("Inside content script - received file:", file);

//       // Query DOM elements inside the tab
//       const input = document.querySelector("textarea");
//       const sendButton = document.querySelector('button[aria-label="Send"]'); // Corrected typo here
//       const fileInput = document.querySelector('input[type="file"][name="attachments"]');
//       const attachButton = document.querySelector('button[aria-label="attachments"]'); // Fixed typo here
//       const tryAgainButton = [...document.querySelectorAll("button")]
//         .find(b => b.textContent.trim() === "Try again");
//       if (tryAgainButton) return;

//       if (!input || !fileInput || !attachButton) {
//         console.error("Required DOM elements not found.");
//         return { state: "Error", message: "Required DOM elements not found." };
//       }


//       const msg = `Thanks for reaching out, I'm interested in discussing a potential collaboration with you to efficiently plan a project together.
// `;


//       input.value = msg;

//       // if (file) {
//       //   // Prepare to attach the PDF file
//       //   const dt = new DataTransfer();
//       //   dt.items.add(file);
//       //   fileInput.files = dt.files;

//       //   // Trigger file input change event
//       //   fileInput.dispatchEvent(new Event("change", { bubbles: true }));
//       // }

//       // Trigger React input handling
//       input.dispatchEvent(new Event("input", { bubbles: true }));
//       input.dispatchEvent(new Event("change", { bubbles: true }));

//       // Click the attachments button (if it's part of the process)
//       // if (method == 2) {
//       //   setTimeout(() => {
//       //     sendButton.click();
//       //   }, delayTime);
//       // }

//       return { state: "Success" }; // Return success and the file object
//     },
//     // args: [file] // Passing the file to the injected script
//   });

//   console.log("Result from injected script:", result); // Log the result from the content script
//   if (result.state == "Error") {
//     await setRunning(false);
//     console.log("Error occured! send2_1");
//   }
// }

// async function input_data2_2(tabId) {
//   let pdfBlob;

//   // Fetch PDF blob
//   // try {
//   //   const base = (await getBackendBase()).replace(/\/+$/, "");
//   //   const resp = await fetch(`${base}/api/pdf`);
//   //   if (!resp.ok) {
//   //     throw new Error("Failed to fetch PDF");
//   //   }
//   //   pdfBlob = await resp.blob();
//   // } catch (error) {
//   //   console.error("Error fetching PDF:", error);
//   //   return;
//   // }

//   // const file = new File([pdfBlob], "Project Description.pdf", { type: "application/pdf" });

//   const [{ result }] = await chrome.scripting.executeScript({
//     target: { tabId },
//     func: () => {
//       // console.log("Inside content script - received file:", file);

//       // Query DOM elements inside the tab
//       const input = document.querySelector("textarea");
//       const sendButton = document.querySelector('button[aria-label="Send"]'); // Corrected typo here
//       const fileInput = document.querySelector('input[type="file"][name="attachments"]');
//       const attachButton = document.querySelector('button[aria-label="attachments"]'); // Fixed typo here
//       // let msg;
//       const tryAgainButton = [...document.querySelectorAll("button")]
//         .find(b => b.textContent.trim() === "Try again");
//       if (tryAgainButton) return;

//       if (!input || !fileInput || !attachButton) {
//         console.error("Required DOM elements not found.");
//         return { state: "Error", message: "Required DOM elements not found." };
//       }

//       const msg = `I'd like to discuss my potential collaboration ideas with you to plan a project effectively
// https://docs.google.com/document/d/12GHXZR9cWVuYY5zoh0pUCtaFbuOWvBOd5orRpYunqik
// `;

//       input.value = msg;

//       // if (file) {
//       //   // Prepare to attach the PDF file
//       //   const dt = new DataTransfer();
//       //   dt.items.add(file);
//       //   fileInput.files = dt.files;

//       //   // Trigger file input change event
//       //   fileInput.dispatchEvent(new Event("change", { bubbles: true }));
//       // }

//       // Trigger React input handling
//       input.dispatchEvent(new Event("input", { bubbles: true }));
//       input.dispatchEvent(new Event("change", { bubbles: true }));

//       // Click the attachments button (if it's part of the process)

//       setTimeout(() => {
//         sendButton.click();
//       }, 500);


//       return { state: "Success" }; // Return success and the file object
//     },
//     // args: [file] // Passing the file to the injected script
//   });
//   console.log("Result from injected script:", result); // Log the result from the content script
//   if (result.state == "Error") {
//     await setRunning(false);
//     console.log("Error occured! send2_2");
//   }
// }

// async function input_data3(tabId) {

//   const [{ result }] = await chrome.scripting.executeScript({
//     target: { tabId },
//     func: () => {
//       // console.log("Inside content script - received file:", file);

//       // Query DOM elements inside the tab
//       const input = document.querySelector("textarea");
//       const fileInput = document.querySelector('input[type="file"][name="attachments"]');
//       const sendButton = document.querySelector('button[aria-label="Send"]'); // Corrected typo here
//       const attachButton = document.querySelector('button[aria-label="attachments"]'); // Fixed typo here

//       const tryAgainButton = [...document.querySelectorAll("button")]
//         .find(b => b.textContent.trim() === "Try again");
//       if (tryAgainButton) return;

//       if (!input || !fileInput || !attachButton) {
//         console.error("Required DOM elements not found.");
//         return { state: "Error", message: "Required DOM elements not found." };
//       }

//       const msg = `If you are interested or have any questions, please feel free to contact me😉
//       `;

//       input.value = msg;

//       // Trigger React input handling
//       input.dispatchEvent(new Event("input", { bubbles: true }));
//       input.dispatchEvent(new Event("change", { bubbles: true }));


//       // Click the attachments button (if it's part of the process)
//       setTimeout(() => {
//         sendButton.click();
//       }, 1000);

//       return { state: "Success" }; // Return success and the file object
//     },
//     // args: [file] // Passing the file to the injected script
//   });

//   console.log("Result from injected script:", result); // Log the result from the content script
//   if (result.state == "Error") {
//     await setRunning(false);
//     console.log("Error occured! send3");
//   }
// }


async function sendToUser(data) {
  console.log(data);
  let delay;
  // Open the Fiverr tab
  const tabId = await openOrReuseTab(`https://pro.fiverr.com/inbox/${data.url}`);

  if (!tabId) return;

  await waitForTabLoaded(tabId);
  await sleep(10000);  // Allow time for the Fiverr page to fully load
  console.log("Tab loaded");

  input_data1(tabId);

  // delay = getRandomDelay(0.5, 1) * 1000;
  // await sleep(delay);

  // if (data.method && data.method == 1) {
  //   sendResult = input_data2_1(tabId);
  // } else if (data.method && data.method == 2) {
  //   input_data2_2(tabId);
  //   delay = getRandomDelay(1.1, 1.6) * 1000;

  //   await sleep(delay);
  //   input_data3(tabId)
  // }

  let randomDely = getRandomDelay(10 / 1, 10 / 1 + 5);
  
  chrome.alarms.create(ALARM_NAME, {
      delayInMinutes: (randomDely / 60)
  });

}


// ---------------------------
// RUN ONCE (NO LOOP)
// ---------------------------



async function getOrder() {
  console.log("getOrder");

  // Set an interval for repeated checks
  // while (true) {
    let state = await getRunning();
    console.log("Stopped");

    let data;

    if (!state) {
      await setRunning(false);
      console.log("Stopped !!!");
      return;
    }

    try {
      const base = (await getBackendBase()).replace(/\/+$/, "");
      const resp = await fetch(`${base}/api/eu`);
      data = await resp.json();
      sendToUser(data);
    } catch (e) {
      await setRunning(false);
      console.error("getOrder error:", e);
    }

  //   console.log("delay", randomDely);

  //   await sleep(randomDely * 1000);
  // }
  return;

}

// ---------------------------
// POPUP MESSAGE HANDLER
// ---------------------------

chrome.runtime.onMessage.addListener((msg, _, sendResponse) => {
  if (msg.type === "START_MONITOR") {
    (async () => {
      await setRunning(true);
      // connectState = false;
      getOrder(); // ✅ RUN ONCE
      // sendToUser({ url: "thejcmstudio" });
      sendResponse({ running: true });
    })();
    return true;
  }

  if (msg.type === "STOP_MONITOR") {
    (async () => {
      await setRunning(false);
      // connectState = false;
      sendResponse({ running: false });
    })();
    return true;
  }

  if (msg.type === "GET_STATUS") {
    (async () => {
      sendResponse({ running: await getRunning() });
    })();
    return true;
  }
});

chrome.alarms.onAlarm.addListener((alarm) => {
  console.log("Alarm", alarm.name);

  if (alarm.name !== ALARM_NAME) return;

  chrome.storage.local.get("isRunning", async (data) => {
    if (!data.isRunning) return;
    await getOrder();
  });
});