// ---------------------------
// CONFIG
// ---------------------------

const URLS = [
  "https://www.fiverr.com/categories/business/ecommerce-management?source=pagination&offset=0&limit=120&ref=seller_level%3Ana",
  "https://www.fiverr.com/categories/business/project-management?source=pagination&offset=0&limit=120&ref=seller_level%3Ana",
  "https://www.fiverr.com/categories/business/hr-consulting?source=pagination&offset=0&limit=120&ref=seller_level%3Ana",
  "https://www.fiverr.com/categories/business/crm-developer?source=pagination&offset=0&limit=120&ref=seller_level%3Ana",
  "https://www.fiverr.com/categories/business/business-plans?source=pagination&offset=0&limit=120&ref=seller_level%3Ana",
  "https://www.fiverr.com/categories/business/business-services?source=pagination&offset=0&limit=120&ref=seller_level%3Ana",
  "https://www.fiverr.com/categories/business/online-investigations?source=pagination&offset=0&limit=120&ref=seller_level%3Ana",
  "https://www.fiverr.com/categories/business/online-presentations?source=pagination&offset=0&limit=120&ref=seller_level%3Ana",
  "https://www.fiverr.com/categories/business/sales?source=pagination&offset=0&limit=120&ref=seller_level%3Ana",
  "https://www.fiverr.com/categories/business/customer-care?source=pagination&offset=0&limit=120&ref=seller_level%3Ana",
  "https://www.fiverr.com/categories/business/ecommerce-management?source=pagination&offset=0&limit=120&ref=seller_level%3Ana",
  "https://www.fiverr.com/categories/data/data-entry?source=pagination&offset=0&limit=120&ref=seller_level%3Ana",
  "https://www.fiverr.com/categories/data/data-entry/data-typing?source=pagination&offset=0&limit=120&ref=seller_level%3Ana",
  "https://www.fiverr.com/categories/data/data-mining?source=pagination&offset=0&limit=120&ref=seller_level%3Ana",
  "https://www.fiverr.com/categories/data/data-formatting?source=pagination&offset=0&limit=120&ref=seller_level%3Ana",
  "https://www.fiverr.com/categories/data/data-cleaning?source=pagination&offset=0&limit=120&ref=seller_level%3Ana",
  "https://www.fiverr.com/categories/data/data-enrichment?source=pagination&offset=0&limit=120&ref=seller_level%3Ana",
  "https://www.fiverr.com/categories/data/data-processing?source=pagination&offset=0&limit=120&ref=seller_level%3Ana",
  "https://www.fiverr.com/categories/data/data-governance?source=pagination&offset=0&limit=120&ref=seller_level%3Ana",
  "https://www.fiverr.com/categories/lifestyle/life-coaching?source=pagination&offset=0&limit=120&ref=seller_level%3Ana",
  "https://www.fiverr.com/categories/lifestyle/career-counseling?source=pagination&offset=0&limit=120&ref=seller_level%3Ana",
  "https://www.fiverr.com/categories/programming-tech/software-development/help-consultation?source=pagination&offset=0&limit=120&ref=seller_level%3Ana",
  "https://www.fiverr.com/categories/programming-tech/software-development/convert-psd?source=pagination&offset=0&limit=120&ref=seller_level%3Ana",
  "https://www.fiverr.com/categories/programming-tech/software-development/web-application?source=pagination&offset=0&limit=120&ref=seller_level%3Ana",
  "https://www.fiverr.com/categories/programming-tech/software-development/desktop-applications?source=pagination&offset=0&limit=120&ref=seller_level%3Ana",
  "https://www.fiverr.com/categories/programming-tech/software-development/scripting?source=pagination&offset=0&limit=120&ref=seller_level%3Ana",
  "https://www.fiverr.com/categories/programming-tech/software-development/bug-fixes?source=pagination&offset=0&limit=120&ref=seller_level%3Ana",
  "https://www.fiverr.com/categories/programming-tech/software-development/CRM-Development?source=pagination&offset=0&limit=120&ref=seller_level%3Ana",
  "https://www.fiverr.com/categories/programming-tech/software-development/api-integrations?source=pagination&offset=0&limit=120&ref=seller_level%3Ana",
  "https://www.fiverr.com/categories/programming-tech/software-development/automations-workflows?source=pagination&offset=0&limit=120&ref=seller_level%3Ana",
  "https://www.fiverr.com/categories/programming-tech/online-coding-lessons?source=pagination&offset=0&limit=120&ref=seller_level%3Ana",
  "https://www.fiverr.com/categories/programming-tech/user-testing-services?source=pagination&offset=0&limit=120&ref=seller_level%3Ana",
  "https://www.fiverr.com/categories/programming-tech/support-it-services/technical-support?source=pagination&offset=0&limit=120&ref=seller_level%3Ana",
  "https://www.fiverr.com/categories/programming-tech/support-it-services/server-administrations?source=pagination&offset=0&limit=120&ref=seller_level%3Ana",
  "https://www.fiverr.com/categories/programming-tech/support-it-services/email-management?source=pagination&offset=0&limit=120&ref=seller_level%3Ana",
  "https://www.fiverr.com/categories/programming-tech/support-it-services/software-installation?source=pagination&offset=0&limit=120&ref=seller_level%3Ana",
  "https://www.fiverr.com/categories/programming-tech/support-it-services/voip-telephony?source=pagination&offset=0&limit=120&ref=seller_level%3Ana",
  "https://www.fiverr.com/categories/programming-tech/support-it-services/platform-migrations?source=pagination&offset=0&limit=120&ref=seller_level%3Ana",
  "https://www.fiverr.com/categories/online-marketing/book-marketing-services?source=pagination&offset=0&limit=120&ref=seller_level%3Ana",
"https://www.fiverr.com/categories/music-audio/voice-overs?source=pagination&offset=0&limit=120&ref=seller_level%3Ana",
"https://www.fiverr.com/categories/programming-tech/chatbots?source=pagination&offset=0&limit=120&ref=seller_level%3Ana",
"https://www.fiverr.com/categories/online-marketing/online-marketing-services?source=pagination&offset=0&limit=120&ref=seller_level%3Ana",
"https://www.fiverr.com/categories/online-marketing/guest-posting-services?source=pagination&offset=0&limit=120&ref=seller_level%3Ana",
"https://www.fiverr.com/categories/online-marketing/crowdfunding?source=pagination&offset=0&limit=120&ref=seller_level%3Ana",
"https://www.fiverr.com/categories/online-marketing/mobile-app-marketing?source=pagination&offset=0&limit=120&ref=seller_level%3Ana",
"https://www.fiverr.com/categories/online-marketing/podcast-marketing?source=pagination&offset=0&limit=120&ref=seller_level%3Ana",
"https://www.fiverr.com/categories/online-marketing/online-video-marketing/video-seo?source=pagination&offset=0&limit=120&ref=seller_level%3Ana",
"https://www.fiverr.com/categories/online-marketing/music-promotion?source=pagination&offset=0&limit=120&ref=seller_level%3Ana",
"https://www.fiverr.com/categories/online-marketing/e-commerce-marketing/ecommerce-seo-services?source=pagination&offset=0&limit=120&ref=seller_level%3Ana",
"https://www.fiverr.com/categories/online-marketing/local-seo-services?source=pagination&offset=0&limit=120&ref=seller_level%3Ana",
"https://www.fiverr.com/categories/online-marketing/generative-engine-optimization?source=pagination&offset=0&limit=120&ref=seller_level%3Ana",
"https://www.fiverr.com/categories/online-marketing/seo-services?source=pagination&offset=0&limit=120&ref=seller_level%3Ana",
"https://www.fiverr.com/categories/online-marketing/social-marketing/paid-social-media?source=pagination&offset=0&limit=120&ref=seller_level%3Ana",
"https://www.fiverr.com/categories/online-marketing/social-marketing/profile-setup-integration?source=pagination&offset=0&limit=120&ref=seller_level%3Ana",
"https://www.fiverr.com/categories/online-marketing/social-marketing/organic-social-media?source=pagination&offset=0&limit=120&ref=seller_level%3Ana",
"https://www.fiverr.com/categories/online-marketing/social-marketing/social-media-management?source=pagination&offset=0&limit=120&ref=seller_level%3Ana",
"https://www.fiverr.com/categories/online-marketing/social-marketing/social-content?source=pagination&offset=0&limit=120&ref=seller_level%3Ana",
"https://www.fiverr.com/categories/online-marketing/social-marketing/social-media-strateg?source=pagination&offset=0&limit=120&ref=seller_level%3Ana",
"https://www.fiverr.com/categories/online-marketing/social-commerce?source=pagination&offset=0&limit=120&ref=seller_level%3Ana",
"https://www.fiverr.com/categories/online-marketing/social-marketing/analytics-tracking?source=pagination&offset=0&limit=120&ref=seller_level%3Ana",
"https://www.fiverr.com/categories/online-marketing/influencer-marketing?source=pagination&offset=0&limit=120&ref=seller_level%3Ana",
"https://www.fiverr.com/categories/online-marketing/community-management?source=pagination&offset=0&limit=120&ref=seller_level%3Ana",
"https://www.fiverr.com/categories/online-marketing/email-marketing?source=pagination&offset=0&limit=120&ref=seller_level%3Ana",
"https://www.fiverr.com/categories/online-marketing/marketing-strategy?source=pagination&offset=0&limit=120&ref=seller_level%3Ana",
"https://www.fiverr.com/categories/writing-translation/proofreading-editing?source=pagination&offset=0&limit=120&ref=seller_level%3Ana",
"https://www.fiverr.com/categories/writing-translation/book-and-ebook-writing?source=pagination&offset=0&limit=120&ref=seller_level%3Ana",
"https://www.fiverr.com/categories/writing-translation/academic-support?source=pagination&offset=0&limit=120&ref=seller_level%3Ana",
"https://www.fiverr.com/categories/writing-translation/content-strategy?source=pagination&offset=0&limit=120&ref=seller_level%3Ana",
"https://www.fiverr.com/categories/writing-translation/website-content?source=pagination&offset=0&limit=120&ref=seller_level%3Ana",
"https://www.fiverr.com/categories/writing-translation/podcast?source=pagination&offset=0&limit=120&ref=seller_level%3Ana",
"https://www.fiverr.com/categories/writing-translation/speech-writing?source=pagination&offset=0&limit=120&ref=seller_level%3Ana",
"https://www.fiverr.com/categories/writing-translation/buy/quality-translation-services/book-translation?source=pagination&offset=0&limit=120&ref=seller_level%3Ana",
"https://www.fiverr.com/categories/writing-translation/tone-of-voice?source=pagination&offset=0&limit=120&ref=seller_level%3Ana",
"https://www.fiverr.com/categories/writing-translation/product-description?source=pagination&offset=0&limit=120&ref=seller_level%3Ana",
"https://www.fiverr.com/categories/writing-translation/business-names-and-slogans?source=pagination&offset=0&limit=120&ref=seller_level%3Ana",
"https://www.fiverr.com/categories/writing-translation/case-study-writing?source=pagination&offset=0&limit=120&ref=seller_level%3Ana",
"https://www.fiverr.com/categories/writing-translation/ad-copy?source=pagination&offset=0&limit=120&ref=seller_level%3Ana",
"https://www.fiverr.com/categories/writing-translation/sales-copy?source=pagination&offset=0&limit=120&ref=seller_level%3Ana",
"https://www.fiverr.com/categories/writing-translation/email-copy?source=pagination&offset=0&limit=120&ref=seller_level%3Ana",
"https://www.fiverr.com/categories/writing-translation/social-media-copywriting?source=pagination&offset=0&limit=120&ref=seller_level%3Ana",
"https://www.fiverr.com/categories/writing-translation/writing-press-releases?source=pagination&offset=0&limit=120&ref=seller_level%3Ana",
"https://www.fiverr.com/categories/writing-translation/ux-writing?source=pagination&offset=0&limit=120&ref=seller_level%3Ana",
"https://www.fiverr.com/categories/writing-translation/elearning-content-development?source=pagination&offset=0&limit=120&ref=seller_level%3Ana",
"https://www.fiverr.com/categories/writing-translation/technical-writing-services?source=pagination&offset=0&limit=120&ref=seller_level%3Ana",
"https://www.fiverr.com/categories/writing-translation/handwriting?source=pagination&offset=0&limit=120&ref=seller_level%3Ana",
"https://www.fiverr.com/categories/writing-translation/localization?source=pagination&offset=0&limit=120&ref=seller_level%3Ana",
"https://www.fiverr.com/categories/writing-translation/transcription?source=pagination&offset=0&limit=120&ref=seller_level%3Ana",
"https://www.fiverr.com/categories/writing-translation/interpretation?source=pagination&offset=0&limit=120&ref=seller_level%3Ana",
"https://www.fiverr.com/categories/writing-translation/technical-writing-services?source=pagination&offset=0&limit=120&ref=seller_level%3Ana",
"https://www.fiverr.com/categories/writing-translation/beta-reader?source=pagination&offset=0&limit=120&ref=seller_level%3Ana",
"https://www.fiverr.com/categories/writing-translation/book-editing?source=pagination&offset=0&limit=120&ref=seller_level%3Ana",
"https://www.fiverr.com/categories/writing-translation/quality-translation-services?source=pagination&offset=0&limit=120&ref=seller_level%3Ana",
"https://www.fiverr.com/categories/writing-translation/articles-blogposts?source=pagination&offset=0&limit=120&ref=seller_level%3Ana",
"https://www.fiverr.com/categories/writing-translation/script-writing?source=pagination&offset=0&limit=120&ref=seller_level%3Ana",
"https://www.fiverr.com/categories/writing-translation/creative-writing?source=pagination&offset=0&limit=120&ref=seller_level%3Ana",
"https://www.fiverr.com/categories/writing-translation/resume-writing?source=pagination&offset=0&limit=120&ref=seller_level%3Ana",
"https://www.fiverr.com/categories/writing-translation/cover-letter-services?source=pagination&offset=0&limit=120&ref=seller_level%3Ana",
"https://www.fiverr.com/categories/writing-translation/linkedin-profile-services?source=pagination&offset=0&limit=120&ref=seller_level%3Ana",
"https://www.fiverr.com/categories/writing-translation/job-description-writing-services?source=pagination&offset=0&limit=120&ref=seller_level%3Ana",
"https://www.fiverr.com/categories/writing-translation/writing-tips-and-advice?source=pagination&offset=0&limit=120&ref=seller_level%3Ana",
"https://www.fiverr.com/categories/writing-translation/proofreading-editing?source=pagination&offset=0&limit=120&ref=seller_level%3Ana",
"https://www.fiverr.com/categories/writing-translation/research-summaries?source=pagination&offset=0&limit=120&ref=seller_level%3Ana",
"https://www.fiverr.com/categories/programming-tech/website-development/shopify-development?source=pagination&offset=0&limit=120&ref=seller_level%3Ana",
"https://www.fiverr.com/categories/programming-tech/website-development/wordpress-development?source=pagination&offset=0&limit=120&ref=seller_level%3Ana",
"https://www.fiverr.com/categories/programming-tech/website-development/custom-websites-development?source=pagination&offset=0&limit=120&ref=seller_level%3Ana",
"https://www.fiverr.com/categories/programming-tech/website-development/squarespace-development?source=pagination&offset=0&limit=120&ref=seller_level%3Ana",
"https://www.fiverr.com/categories/programming-tech/website-development/wix-development?source=pagination&offset=0&limit=120&ref=seller_level%3Ana",
"https://www.fiverr.com/categories/programming-tech/website-development/webflow-development?source=pagination&offset=0&limit=120&ref=seller_level%3Ana",
"https://www.fiverr.com/categories/programming-tech/website-development/other-builders-development?source=pagination&offset=0&limit=120&ref=seller_level%3Ana",
"https://www.fiverr.com/categories/programming-tech/website-development/clickfunnels-development?source=pagination&offset=0&limit=120&ref=seller_level%3Ana",
"https://www.fiverr.com/categories/programming-tech/website-development/bubble-development?source=pagination&offset=0&limit=120&ref=seller_level%3Ana",
"https://www.fiverr.com/categories/programming-tech/website-development/godaddy-development?source=pagination&offset=0&limit=120&ref=seller_level%3Ana",
"https://www.fiverr.com/categories/data/data-entry?source=pagination&offset=0&limit=120&ref=seller_level%3Ana",
"https://www.fiverr.com/categories/graphics-design/book-design/layout?source=pagination&offset=0&limit=120&ref=seller_level%3Ana",
"https://www.fiverr.com/categories/graphics-design/book-design/cover?source=pagination&offset=0&limit=120&ref=seller_level%3Ana",
"https://www.fiverr.com/categories/graphics-design/brand-style-guides?source=pagination&offset=0&limit=120&ref=seller_level%3Ana",
"https://www.fiverr.com/categories/graphics-design/fonts-typography?source=pagination&offset=0&limit=120&ref=seller_level%3Ana",
"https://www.fiverr.com/categories/graphics-design/banner-ads?source=pagination&offset=0&limit=120&ref=seller_level%3Ana",
"https://www.fiverr.com/categories/graphics-design/resume-design?source=pagination&offset=0&limit=120&ref=seller_level%3Ana",
"https://www.fiverr.com/categories/graphics-design/sample-business-cards-design?source=pagination&offset=0&limit=120&ref=seller_level%3Ana",
"https://www.fiverr.com/categories/lifestyle/fitness?source=pagination&offset=0&limit=120&ref=seller_level%3Ana",
"https://www.fiverr.com/categories/graphics-design/email-design?source=pagination&offset=0&limit=120&ref=seller_level%3Ana",
"https://www.fiverr.com/categories/lifestyle/nutrition?source=pagination&offset=0&limit=120&ref=seller_level%3Ana",
"https://www.fiverr.com/categories/business/virtual-assistant-services?source=pagination&offset=0&limit=120&ref=seller_level%3Ana",
"https://www.fiverr.com/categories/business/supply-chain-management?source=pagination&offset=0&limit=120&ref=seller_level%3Ana",
"https://www.fiverr.com/categories/video-animation/video-editing?source=pagination&offset=0&limit=120&ref=seller_level%3Ana",
// "https://www.fiverr.com/categories/graphics-design/creative-logo-design?source=pagination&offset=0&limit=120&ref=seller_level%3Ana%7Cstyle%3Aflat_minimalist",
// "https://www.fiverr.com/categories/graphics-design/creative-logo-design?source=pagination&offset=0&limit=120&ref=seller_level%3Ana%7Cstyle%3Amodern",
// "https://www.fiverr.com/categories/graphics-design/creative-logo-design?source=pagination&offset=0&limit=120&ref=seller_level%3Ana%7Cstyle%3Aretro%2Csignature%2Cwatercolor_feminine%2Cgeometric",
// "https://www.fiverr.com/categories/graphics-design/creative-logo-design?source=pagination&offset=0&limit=120&ref=seller_level%3Ana%7Cstyle%3A3d%2Clettering%2Chand_drawn%2Cmascot_cartoon",
// "https://www.fiverr.com/categories/graphics-design/creative-logo-design?source=pagination&offset=0&limit=120&ref=seller_level%3Ana%7Cstyle%3Aother",
  // "https://www.fiverr.com/categories/programming-tech/website-maintenance/consultation",
];

const REGION_QUERY = {
  "EU":
    "%7Cseller_location%3AAT%2CBG%2CCZ%2CDK%2CEE%2CDE%2CIS%2CIE%2CLV%2CIL%2CFI%2CGR%2CNO%2CNL%2CNZ%2CSE%2CCH%2CUA%2CRO%2CPL%2CMD&filter=new&ref_ctx_id=d84d629d6caf4cc1ae7242d8a6cb7ae4&showprofessioncampaign=false",
  "US":
  "%7Cseller_location%3AUS&filter=new&ref_ctx_id=d84d629d6caf4cc1ae7242d8a6cb7ae4&showprofessioncampaign=false",
  // "US":
  //   "%7Cseller_location%3AUS&ref_ctx_id=d84d629d6caf4cc1ae7242d8a6cb7ae4&showprofessioncampaign=false",
  // "US":
  // "&offset=0&limit=120&ref=seller_level%3Ana%7Cseller_location%3AUS&ref_ctx_id=d84d629d6caf4cc1ae7242d8a6cb7ae4&showprofessioncampaign=false"
};

const DEFAULT_BACKEND_BASE = "http://127.0.0.1:8000";

const ALARM_NAME = "fiverr_crawler_tick";
const ALARM_PERIOD = 0.5; // every 30 seconds

// ---------------------------
// Helper functions
// ---------------------------

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function getBackendEndpoints() {
  return new Promise((resolve) => {
    chrome.storage.sync.get(["backendBase"], (res) => {
      const base = (res.backendBase || DEFAULT_BACKEND_BASE).replace(/\/+$/, "");
      resolve({
        saveIds: base + "/api/save-ids"
      });
    });
  });
}

async function getState() {
  return new Promise((resolve) => {
    chrome.storage.local.get(["crawler"], (res) => {
      resolve(
        res.crawler || {
          regionIndex: 0,
          urlIndex: 0,
          page: 1
        }
      );
    });
  });
}

async function saveState(state) {
  await chrome.storage.local.set({ crawler: state });
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

async function ensureAlarm() {
  chrome.alarms.create(ALARM_NAME, {
    periodInMinutes: ALARM_PERIOD
  });
}

// ---------------------------
// Tab helpers
// ---------------------------

async function openTempTab(url) {
  const tab = await chrome.tabs.create({ url, active: false });
  return tab.id;
}

function waitForLoad(tabId) {
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

async function closeTab(tabId) {
  try {
    await chrome.tabs.remove(tabId);
  } catch (e) {}
}

// ---------------------------
// Scrape IDs from listing page
// ---------------------------

async function scrapeIds(tabId) {
  const [{ result }] = await chrome.scripting.executeScript({
    target: { tabId },
    func: () => {
      const ids = [];
      const all = [];
      const spans = document.querySelectorAll("div._1lc1p3l1");
      const stars_num = document.querySelectorAll("span.rating-count-number");
      
      spans.forEach((span, index) => {
        const a = span.querySelector("a");
        if (!a) return;
        const href = a.getAttribute("href") || "";
        if (!href.includes("?")) return;
        const mainPart = href.split("?")[0];
        all.push(mainPart.replace("/", ""));
        const starText = stars_num[index]?.textContent?.trim();
        const starCount = starText ? parseFloat(starText) : 0;
        console.log("Star count for", starText, "is", starCount);
        if (starCount < 10) {
          ids.push(mainPart.replace("/", ""));
        }
      });
      
      return {ids, all};
    }
  });
  return result || { ids: [], all: [] };
}

// ---------------------------
// Backend sender
// ---------------------------

async function sendIds(ids, region, pageUrl) {
  if (!ids.length) return;

  const { saveIds } = await getBackendEndpoints();

  try {
    await fetch(saveIds, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids, region, page_url: pageUrl })
    });
  } catch (e) {
    console.error("[saveIds failed]:", e);
  }
}

// ---------------------------
// ONE-TICK CRAWLER STEP
// ---------------------------

async function crawlTick() {
  const running = await getRunning();
  if (!running) return;

  const state = await getState();
  const regionKeys = Object.keys(REGION_QUERY);

  const region = regionKeys[state.regionIndex];
  const baseUrl = URLS[state.urlIndex];

  const fullUrl =
    baseUrl +
    REGION_QUERY[region] +
    `&page=${state.page}`;

  console.log("[Tick] Loading:", fullUrl);

  // Load page
  let tabId = null;
  let ids = [];
  let all = [];
  try {
    tabId = await openTempTab(fullUrl);
    await waitForLoad(tabId);
    await sleep(10000);

    ({ ids, all } = await scrapeIds(tabId));
    
    console.log("[Tick] Found IDs:", ids.length);

    if (ids.length > 0) {
      await sendIds(ids, region, fullUrl);
    }

  } catch (e) {
    console.error("Tick error:", e);
  } finally {
    if (tabId !== null) await closeTab(tabId);
  }

  // Update state for next tick
  state.page += 1;

  if (state.page > 21 || all.length < 100) {
    state.page = 1;
    state.urlIndex += 1;
    if (state.urlIndex >= URLS.length) {
      state.urlIndex = 0;
      state.regionIndex += 1;
      if (state.regionIndex >= regionKeys.length) state.regionIndex = 0;
    }
  }

  await saveState(state);
}

// ---------------------------
// Handle popup messages
// ---------------------------

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === "START_MONITOR") {
    (async () => {
      await setRunning(true);
      await ensureAlarm();
      sendResponse({ running: true });
    })();
    return true;
  }

  if (msg.type === "STOP_MONITOR") {
    (async () => {
      await setRunning(false);
      chrome.alarms.clear(ALARM_NAME);
      sendResponse({ running: false });
    })();
    return true;
  }

  if (msg.type === "GET_STATUS") {
    (async () => {
      const running = await getRunning();
      sendResponse({ running });
    })();
    return true;
  }
});

// ---------------------------
// Alarm event
// ---------------------------

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === ALARM_NAME) {
    crawlTick();
  }
});

// Restore state on startup
chrome.runtime.onStartup.addListener(async () => {
  if (await getRunning()) await ensureAlarm();
});
chrome.runtime.onInstalled.addListener(async () => {
  if (await getRunning()) await ensureAlarm();
});
