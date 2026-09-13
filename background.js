const DEFAULT_CATEGORIES = {
  movies: {
    id: "movies",
    name: "Movies",
    icon: "🍿",
    enabled: false,
    sites: [
      "net77.cc",
      "imdb.com",
      "rottentomatoes.com",
      "9gag.com",
      "fmovies.to",
      "123movies.net"
    ]
  },
  music: {
    id: "music",
    name: "Music",
    icon: "🎵",
    enabled: false,
    sites: [
      "spotify.com",
      "soundcloud.com",
      "deezer.com",
      "music.apple.com",
      "pandora.com",
      "tidal.com"
    ]
  },
  gaming: {
    id: "gaming",
    name: "Games",
    icon: "🎮",
    enabled: false,
    sites: [
      "discord.com",
      "roblox.com",
      "steampowered.com",
      "store.steampowered.com",
      "epicgames.com",
      "crunchyroll.com",
      "ign.com",
      "gamespot.com",
      "twitch.tv"
    ]
  },
  social: {
    id: "social",
    name: "Social Media",
    icon: "📱",
    enabled: false,
    sites: [
      "instagram.com",
      "facebook.com",
      "twitter.com",
      "x.com",
      "reddit.com",
      "tiktok.com",
      "threads.net",
      "pinterest.com",
      "linkedin.com",
      "snapchat.com"
    ]
  },
  streaming: {
    id: "streaming",
    name: "Streaming & Video",
    icon: "🎬",
    enabled: false,
    sites: [
      "youtube.com",
      "netflix.com",
      "twitch.tv",
      "disneyplus.com",
      "primevideo.com",
      "hulu.com",
      "max.com",
      "dailymotion.com",
      "vimeo.com"
    ]
  }
};

function extractCleanDomain(raw) {
  if (!raw || typeof raw !== "string") return "";
  let clean = raw.trim().toLowerCase();
  clean = clean.replace(/^[a-zA-Z]+:\/\//, "");
  clean = clean.replace(/^www\./, "");
  clean = clean.split("/")[0];
  clean = clean.split("?")[0];
  clean = clean.split("#")[0];
  clean = clean.split(":")[0];
  return clean;
}

function getTodayDateString() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

async function getNormalizedCategories() {
  const data = await chrome.storage.local.get(["categories", "blockedCategories"]);
  let categories = data.categories;

  if (!categories || typeof categories !== "object") {
    categories = JSON.parse(JSON.stringify(DEFAULT_CATEGORIES));
    if (data.blockedCategories) {
      for (const [k, v] of Object.entries(data.blockedCategories)) {
        if (categories[k]) categories[k].enabled = !!v;
      }
    }
    await chrome.storage.local.set({ categories });
  }

  // Clean up and merge duplicate old 'entertainment' category into 'movies'
  let updated = false;
  if (categories.entertainment) {
    if (!categories.movies) {
      categories.movies = JSON.parse(JSON.stringify(DEFAULT_CATEGORIES.movies));
    }
    if (Array.isArray(categories.entertainment.sites)) {
      categories.entertainment.sites.forEach((site) => {
        if (!categories.movies.sites.includes(site)) {
          categories.movies.sites.push(site);
        }
      });
    }
    delete categories.entertainment;
    updated = true;
  }

  // Ensure Movies and Music exist if user had older category version
  if (!categories.movies) {
    categories.movies = JSON.parse(JSON.stringify(DEFAULT_CATEGORIES.movies));
    updated = true;
  }
  if (!categories.music) {
    categories.music = JSON.parse(JSON.stringify(DEFAULT_CATEGORIES.music));
    updated = true;
  }
  if (!categories.gaming) {
    categories.gaming = JSON.parse(JSON.stringify(DEFAULT_CATEGORIES.gaming));
    updated = true;
  }
  if (updated) {
    await chrome.storage.local.set({ categories });
  }

  return categories;
}

async function updateAllRules() {
  try {
    const data = await chrome.storage.local.get(["blockedSites"]);
    const customSites = data.blockedSites || [];
    const categories = await getNormalizedCategories();

    const domainSet = new Set();

    customSites.forEach((site) => {
      const d = extractCleanDomain(site);
      if (d) domainSet.add(d);
    });

    for (const cat of Object.values(categories)) {
      if (cat.enabled && Array.isArray(cat.sites)) {
        cat.sites.forEach((site) => {
          const d = extractCleanDomain(site);
          if (d) domainSet.add(d);
        });
      }
    }

    const allDomains = Array.from(domainSet);

    const existingRules = await chrome.declarativeNetRequest.getDynamicRules();
    const removeRuleIds = existingRules.map((r) => r.id);

    const addRules = allDomains.map((domain, index) => ({
      id: index + 1,
      priority: 1,
      action: {
        type: "redirect",
        redirect: {
          extensionPath: `/blocked.html?target=${encodeURIComponent(domain)}`
        }
      },
      condition: {
        urlFilter: `||${domain}^`,
        resourceTypes: ["main_frame"]
      }
    }));

    await chrome.declarativeNetRequest.updateDynamicRules({
      removeRuleIds,
      addRules
    });
  } catch (err) {
    console.error("FocusShield: Error updating DNR rules:", err);
  }
}

async function recordDistractionAttempt(domain) {
  try {
    const data = await chrome.storage.local.get(["stats"]);
    const today = getTodayDateString();
    let stats = data.stats || {
      blockedCountToday: 0,
      totalBlockedCount: 0,
      lastActiveDate: today,
      streak: 1,
      topBlocked: {}
    };

    if (stats.lastActiveDate !== today) {
      const lastDate = new Date(stats.lastActiveDate);
      const currentDate = new Date(today);
      const diffDays = Math.round((currentDate - lastDate) / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        stats.streak = (stats.streak || 1) + 1;
      } else if (diffDays > 1) {
        stats.streak = 1;
      }
      stats.blockedCountToday = 0;
      stats.lastActiveDate = today;
    }

    stats.blockedCountToday = (stats.blockedCountToday || 0) + 1;
    stats.totalBlockedCount = (stats.totalBlockedCount || 0) + 1;

    if (domain) {
      stats.topBlocked = stats.topBlocked || {};
      stats.topBlocked[domain] = (stats.topBlocked[domain] || 0) + 1;
    }

    await chrome.storage.local.set({ stats });
    return stats;
  } catch (err) {
    console.error("FocusShield: Error recording distraction:", err);
    return null;
  }
}

async function checkHardcoreLock() {
  try {
    const { hardcoreLock } = await chrome.storage.local.get(["hardcoreLock"]);
    if (hardcoreLock && hardcoreLock.active) {
      if (Date.now() >= hardcoreLock.expiresAt) {
        await chrome.storage.local.set({
          hardcoreLock: { active: false, expiresAt: 0 }
        });
        await chrome.action.setBadgeText({ text: "" });
      } else {
        const remainingMinutes = Math.max(1, Math.ceil((hardcoreLock.expiresAt - Date.now()) / (60 * 1000)));
        await chrome.action.setBadgeText({ text: `${remainingMinutes}m` });
        await chrome.action.setBadgeBackgroundColor({ color: "#e63946" });
      }
    } else {
      await chrome.action.setBadgeText({ text: "" });
    }
  } catch (err) {
    console.error("FocusShield: Error checking hardcore lock:", err);
  }
}

chrome.runtime.onInstalled.addListener(async () => {
  const data = await chrome.storage.local.get([
    "blockedSites",
    "categories",
    "passcode",
    "hardcoreLock",
    "stats"
  ]);

  const initialUpdates = {};
  if (!data.blockedSites) initialUpdates.blockedSites = [];
  if (!data.categories) {
    initialUpdates.categories = JSON.parse(JSON.stringify(DEFAULT_CATEGORIES));
  }
  if (data.passcode === undefined) initialUpdates.passcode = null;
  if (!data.hardcoreLock) initialUpdates.hardcoreLock = { active: false, expiresAt: 0 };
  if (!data.stats) {
    initialUpdates.stats = {
      blockedCountToday: 0,
      totalBlockedCount: 0,
      lastActiveDate: getTodayDateString(),
      streak: 1,
      topBlocked: {}
    };
  }

  if (Object.keys(initialUpdates).length > 0) {
    await chrome.storage.local.set(initialUpdates);
  }

  await updateAllRules();
  await checkHardcoreLock();

  chrome.alarms.create("focusShieldMonitor", { periodInMinutes: 1 });
});

chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === "focusShieldMonitor") {
    await checkHardcoreLock();
  }
});

chrome.storage.onChanged.addListener(async (changes, area) => {
  if (area === "local") {
    if (changes.blockedSites || changes.categories || changes.blockedCategories) {
      await updateAllRules();
    }
    if (changes.hardcoreLock) {
      await checkHardcoreLock();
    }
  }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  (async () => {
    if (message.action === "RECORD_BLOCKED") {
      const stats = await recordDistractionAttempt(message.domain);
      sendResponse({ success: true, stats });
    } else if (message.action === "GET_DEFAULT_CATEGORIES") {
      sendResponse({ defaultCategories: DEFAULT_CATEGORIES });
    } else if (message.action === "CLOSE_TAB" && sender.tab?.id) {
      await chrome.tabs.remove(sender.tab.id);
      sendResponse({ success: true });
    } else if (message.action === "REFRESH_RULES") {
      await updateAllRules();
      sendResponse({ success: true });
    } else {
      sendResponse({ success: false, error: "Unknown action" });
    }
  })();
  return true;
});
