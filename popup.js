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

function formatTimeRemaining(ms) {
  if (ms <= 0) return "00:00:00";
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

document.addEventListener("DOMContentLoaded", async () => {
  // Master Gatekeeper Elements
  const appLockScreen = document.getElementById("appLockScreen");
  const gatekeeperPinInput = document.getElementById("gatekeeperPinInput");
  const gatekeeperPinError = document.getElementById("gatekeeperPinError");
  const gatekeeperUnlockBtn = document.getElementById("gatekeeperUnlockBtn");

  // Header Elements
  const streakCountText = document.getElementById("streakCountText");
  const hardcoreActiveBanner = document.getElementById("hardcoreActiveBanner");
  const hardcoreCountdownBanner = document.getElementById("hardcoreCountdownBanner");

  // Nav Tabs
  const navBtns = document.querySelectorAll(".nav-btn");
  const tabPanes = document.querySelectorAll(".tab-pane");

  // Shield Tab
  const currentDomainDisplay = document.getElementById("currentDomainDisplay");
  const blockCurrentSiteBtn = document.getElementById("blockCurrentSiteBtn");
  const currentSiteBlockedBadge = document.getElementById("currentSiteBlockedBadge");
  const urlInput = document.getElementById("urlInput");
  const addButton = document.getElementById("addButton");
  const inputErrorMsg = document.getElementById("inputErrorMsg");
  const customSiteCountBadge = document.getElementById("customSiteCountBadge");
  const blockList = document.getElementById("blockList");
  const emptyBlocklistState = document.getElementById("emptyBlocklistState");

  // Assign Category Modal
  const assignCategoryModal = document.getElementById("assignCategoryModal");
  const assignTargetSiteDomain = document.getElementById("assignTargetSiteDomain");
  const assignCategoryButtonsGrid = document.getElementById("assignCategoryButtonsGrid");
  const cancelAssignCategoryBtn = document.getElementById("cancelAssignCategoryBtn");
  let targetSiteForAssignment = "";

  // Categories Tab
  const categoriesContainer = document.getElementById("categoriesContainer");
  const openNewCategoryModalBtn = document.getElementById("openNewCategoryModalBtn");
  const newCategoryModal = document.getElementById("newCategoryModal");
  const newCategoryNameInput = document.getElementById("newCategoryNameInput");
  const emojiOpts = document.querySelectorAll(".emoji-opt");
  const newCategoryError = document.getElementById("newCategoryError");
  const cancelNewCategoryBtn = document.getElementById("cancelNewCategoryBtn");
  const saveNewCategoryBtn = document.getElementById("saveNewCategoryBtn");

  // Hardcore Lock Tab
  const hardcoreInactiveView = document.getElementById("hardcoreInactiveView");
  const hardcoreActiveView = document.getElementById("hardcoreActiveView");
  const activateHardcoreBtn = document.getElementById("activateHardcoreBtn");
  const hardcoreLiveTimer = document.getElementById("hardcoreLiveTimer");
  const durationPills = document.querySelectorAll(".duration-pill");
  const hardcoreConfirmModal = document.getElementById("hardcoreConfirmModal");
  const confirmDurationText = document.getElementById("confirmDurationText");
  const cancelHardcoreModalBtn = document.getElementById("cancelHardcoreModalBtn");
  const startHardcoreConfirmBtn = document.getElementById("startHardcoreConfirmBtn");

  // Analytics Tab
  const statsTodayVal = document.getElementById("statsTodayVal");
  const statsStreakVal = document.getElementById("statsStreakVal");
  const statsTotalVal = document.getElementById("statsTotalVal");
  const topBlockedList = document.getElementById("topBlockedList");

  // Security Tab
  const pinStatusText = document.getElementById("pinStatusText");
  const setPinView = document.getElementById("setPinView");
  const managePinView = document.getElementById("managePinView");
  const newPinInput = document.getElementById("newPinInput");
  const confirmPinInput = document.getElementById("confirmPinInput");
  const savePinBtn = document.getElementById("savePinBtn");
  const currentPinInput = document.getElementById("currentPinInput");
  const removePinBtn = document.getElementById("removePinBtn");
  const changePinToggleBtn = document.getElementById("changePinToggleBtn");

  // Action PIN Modal
  const pinModal = document.getElementById("pinModal");
  const modalPinInput = document.getElementById("modalPinInput");
  const modalPinError = document.getElementById("modalPinError");
  const cancelPinModalBtn = document.getElementById("cancelPinModalBtn");
  const confirmPinModalBtn = document.getElementById("confirmPinModalBtn");

  // Application State
  let state = {
    blockedSites: [],
    categories: JSON.parse(JSON.stringify(DEFAULT_CATEGORIES)),
    passcode: null,
    hardcoreLock: { active: false, expiresAt: 0 },
    stats: { blockedCountToday: 0, totalBlockedCount: 0, streak: 1, topBlocked: {} }
  };
  let currentTabDomain = "";
  let selectedDurationKey = "30m";
  let lockTimerInterval = null;
  let pendingPinCallback = null;
  let selectedNewCategoryEmoji = "🍿";
  let expandedCategoryIds = new Set();

  // ========================================================
  // MASTER PIN GATEKEEPER LOCK CHECK
  // ========================================================
  function checkGatekeeperLock() {
    if (state.passcode && sessionStorage.getItem("focusshield_gatekeeper_unlocked") !== "true") {
      appLockScreen.classList.remove("hidden");
      gatekeeperPinInput.value = "";
      gatekeeperPinError.classList.add("hidden");
      setTimeout(() => gatekeeperPinInput.focus(), 100);
    } else {
      appLockScreen.classList.add("hidden");
    }
  }

  function handleGatekeeperUnlock() {
    const entered = gatekeeperPinInput.value.trim();
    if (entered === state.passcode) {
      sessionStorage.setItem("focusshield_gatekeeper_unlocked", "true");
      appLockScreen.classList.add("hidden");
    } else {
      gatekeeperPinError.classList.remove("hidden");
      gatekeeperPinInput.value = "";
      gatekeeperPinInput.focus();
    }
  }

  gatekeeperUnlockBtn.addEventListener("click", handleGatekeeperUnlock);
  gatekeeperPinInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") handleGatekeeperUnlock();
  });
  gatekeeperPinInput.addEventListener("input", () => {
    if (gatekeeperPinInput.value.length === 4) {
      handleGatekeeperUnlock();
    }
  });

  // 1. Tab Navigation
  navBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const targetTab = btn.dataset.tab;
      navBtns.forEach((b) => b.classList.remove("active"));
      tabPanes.forEach((p) => p.classList.remove("active"));
      btn.classList.add("active");
      document.getElementById(targetTab)?.classList.add("active");
    });
  });

  // 2. Load State from Storage
  async function loadState() {
    const data = await chrome.storage.local.get([
      "blockedSites",
      "categories",
      "blockedCategories",
      "passcode",
      "hardcoreLock",
      "stats"
    ]);

    state.blockedSites = data.blockedSites || [];

    if (data.categories && typeof data.categories === "object") {
      state.categories = data.categories;
    } else {
      state.categories = JSON.parse(JSON.stringify(DEFAULT_CATEGORIES));
      if (data.blockedCategories) {
        for (const [k, v] of Object.entries(data.blockedCategories)) {
          if (state.categories[k]) state.categories[k].enabled = !!v;
        }
      }
      await chrome.storage.local.set({ categories: state.categories });
    }

    // Clean up and merge duplicate old 'entertainment' category into 'movies'
    let updated = false;
    if (state.categories.entertainment) {
      if (!state.categories.movies) {
        state.categories.movies = JSON.parse(JSON.stringify(DEFAULT_CATEGORIES.movies));
      }
      if (Array.isArray(state.categories.entertainment.sites)) {
        state.categories.entertainment.sites.forEach((site) => {
          if (!state.categories.movies.sites.includes(site)) {
            state.categories.movies.sites.push(site);
          }
        });
      }
      delete state.categories.entertainment;
      updated = true;
    }

    // Ensure Movies and Music are populated
    if (!state.categories.movies) {
      state.categories.movies = JSON.parse(JSON.stringify(DEFAULT_CATEGORIES.movies));
      updated = true;
    }
    if (!state.categories.music) {
      state.categories.music = JSON.parse(JSON.stringify(DEFAULT_CATEGORIES.music));
      updated = true;
    }
    if (updated) {
      await chrome.storage.local.set({ categories: state.categories });
    }

    state.passcode = data.passcode || null;
    state.hardcoreLock = data.hardcoreLock || { active: false, expiresAt: 0 };
    state.stats = data.stats || {
      blockedCountToday: 0,
      totalBlockedCount: 0,
      streak: 1,
      topBlocked: {}
    };

    checkGatekeeperLock();
    renderAll();
  }

  // 3. Render All Views
  function renderAll() {
    renderStreakAndHeader();
    renderCurrentTabCard();
    renderCustomBlocklist();
    renderCategories();
    renderHardcoreLock();
    renderAnalytics();
    renderSecurity();
  }

  function renderStreakAndHeader() {
    const streak = state.stats.streak || 1;
    streakCountText.textContent = `${streak}d`;
  }

  // Detect Current Active Tab
  async function detectCurrentTab() {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tab && tab.url) {
        if (
          tab.url.startsWith("chrome://") ||
          tab.url.startsWith("chrome-extension://") ||
          tab.url.startsWith("edge://") ||
          tab.url.startsWith("about:")
        ) {
          currentTabDomain = "";
          currentDomainDisplay.textContent = "Browser Internal Page";
          blockCurrentSiteBtn.classList.add("hidden");
          currentSiteBlockedBadge.classList.add("hidden");
        } else {
          currentTabDomain = extractCleanDomain(tab.url);
          currentDomainDisplay.textContent = currentTabDomain || "Unknown Website";
          renderCurrentTabCard();
        }
      }
    } catch (e) {
      console.warn("Could not query active tab:", e);
    }
  }

  function getCategoryOfSite(domain) {
    if (!domain) return null;
    const clean = extractCleanDomain(domain);
    for (const [catKey, cat] of Object.entries(state.categories)) {
      if (Array.isArray(cat.sites) && cat.sites.includes(clean)) {
        return cat;
      }
    }
    return null;
  }

  function isDomainCurrentlyBlocked(domain) {
    if (!domain) return false;
    const clean = extractCleanDomain(domain);
    if (state.blockedSites.includes(clean)) return true;

    for (const cat of Object.values(state.categories)) {
      if (cat.enabled && Array.isArray(cat.sites)) {
        if (cat.sites.some((d) => clean === d || clean.endsWith("." + d))) {
          return true;
        }
      }
    }
    return false;
  }

  function renderCurrentTabCard() {
    if (!currentTabDomain) {
      blockCurrentSiteBtn.classList.add("hidden");
      currentSiteBlockedBadge.classList.add("hidden");
      return;
    }

    const isBlocked = isDomainCurrentlyBlocked(currentTabDomain);
    if (isBlocked) {
      blockCurrentSiteBtn.classList.add("hidden");
      currentSiteBlockedBadge.classList.remove("hidden");
    } else {
      blockCurrentSiteBtn.classList.remove("hidden");
      blockCurrentSiteBtn.innerHTML = `<span class="btn-icon">🚫</span> Block ${currentTabDomain}`;
      currentSiteBlockedBadge.classList.add("hidden");
    }
  }

  // ========================================================
  // RENDER CUSTOM BLOCKLIST (WITH 1-CLICK CATEGORY ASSIGN)
  // ========================================================
  function renderCustomBlocklist() {
    blockList.innerHTML = "";
    customSiteCountBadge.textContent = state.blockedSites.length;

    if (state.blockedSites.length === 0) {
      emptyBlocklistState.classList.remove("hidden");
    } else {
      emptyBlocklistState.classList.add("hidden");
      state.blockedSites.forEach((site, index) => {
        const li = document.createElement("li");

        const domainWrap = document.createElement("div");
        domainWrap.className = "site-domain-wrap";

        const domainSpan = document.createElement("span");
        domainSpan.className = "site-domain-text";
        domainSpan.textContent = site;
        domainWrap.appendChild(domainSpan);

        const actionsWrap = document.createElement("div");
        actionsWrap.className = "site-actions-wrap";

        // Category Tag / Assign Button
        const assignedCat = getCategoryOfSite(site);
        const catBtn = document.createElement("button");
        catBtn.className = "btn-assign-cat";
        if (assignedCat) {
          catBtn.textContent = `${assignedCat.icon || "🏷️"} ${assignedCat.name}`;
          catBtn.title = `Assigned to ${assignedCat.name}. Click to change`;
        } else {
          catBtn.textContent = "+ 🏷️ Category";
          catBtn.title = "Assign to a category (Movies, Music, Games, etc.)";
        }

        catBtn.addEventListener("click", (e) => {
          e.stopPropagation();
          openAssignCategoryModal(site);
        });

        // Delete Button
        const deleteBtn = document.createElement("button");
        deleteBtn.className = "btn-delete-site";
        deleteBtn.innerHTML = "🗑️";
        deleteBtn.title = "Unblock Site";

        deleteBtn.addEventListener("click", (e) => {
          e.stopPropagation();
          handleDeleteSite(index);
        });

        actionsWrap.appendChild(catBtn);
        actionsWrap.appendChild(deleteBtn);

        li.appendChild(domainWrap);
        li.appendChild(actionsWrap);

        // Double-click to assign category
        li.addEventListener("dblclick", () => {
          openAssignCategoryModal(site);
        });

        blockList.appendChild(li);
      });
    }
  }

  // ========================================================
  // 1-CLICK ASSIGN CATEGORY MODAL LOGIC
  // ========================================================
  function openAssignCategoryModal(site) {
    targetSiteForAssignment = site;
    assignTargetSiteDomain.textContent = site;
    assignCategoryButtonsGrid.innerHTML = "";

    const currentCat = getCategoryOfSite(site);

    Object.entries(state.categories).forEach(([catKey, cat]) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = `btn-assign-choice ${currentCat && currentCat.id === cat.id ? "already-assigned" : ""}`;
      btn.innerHTML = `<span>${cat.icon || "📁"}</span> <span>${cat.name}</span>`;

      btn.addEventListener("click", async () => {
        // Remove from any existing category first
        Object.values(state.categories).forEach((c) => {
          if (Array.isArray(c.sites)) {
            const idx = c.sites.indexOf(site);
            if (idx !== -1) c.sites.splice(idx, 1);
          }
        });

        // Add to chosen category
        if (!state.categories[catKey].sites) state.categories[catKey].sites = [];
        if (!state.categories[catKey].sites.includes(site)) {
          state.categories[catKey].sites.push(site);
        }

        await chrome.storage.local.set({ categories: state.categories });
        assignCategoryModal.classList.add("hidden");
        renderCustomBlocklist();
        renderCategories();
        renderCurrentTabCard();
      });

      assignCategoryButtonsGrid.appendChild(btn);
    });

    // Option to unassign category
    if (currentCat) {
      const unassignBtn = document.createElement("button");
      unassignBtn.type = "button";
      unassignBtn.className = "btn-assign-choice";
      unassignBtn.style.gridColumn = "span 2";
      unassignBtn.style.color = "#ff8598";
      unassignBtn.innerHTML = `<span>❌</span> <span>Remove from Category</span>`;

      unassignBtn.addEventListener("click", async () => {
        Object.values(state.categories).forEach((c) => {
          if (Array.isArray(c.sites)) {
            const idx = c.sites.indexOf(site);
            if (idx !== -1) c.sites.splice(idx, 1);
          }
        });
        await chrome.storage.local.set({ categories: state.categories });
        assignCategoryModal.classList.add("hidden");
        renderCustomBlocklist();
        renderCategories();
      });

      assignCategoryButtonsGrid.appendChild(unassignBtn);
    }

    assignCategoryModal.classList.remove("hidden");
  }

  cancelAssignCategoryBtn.addEventListener("click", () => {
    assignCategoryModal.classList.add("hidden");
  });

  // ========================================================
  // RENDER DYNAMIC CATEGORIES TAB
  // ========================================================
  function renderCategories() {
    categoriesContainer.innerHTML = "";

    const catEntries = Object.entries(state.categories);
    if (catEntries.length === 0) {
      categoriesContainer.innerHTML = `<div class="empty-chips-hint" style="text-align:center;">No categories found. Create one below!</div>`;
      return;
    }

    catEntries.forEach(([catKey, cat]) => {
      const sites = Array.isArray(cat.sites) ? cat.sites : [];
      const isExpanded = expandedCategoryIds.has(catKey);

      const card = document.createElement("div");
      card.className = `category-card ${isExpanded ? "expanded" : ""}`;

      // Card Header
      const header = document.createElement("div");
      header.className = "cat-card-header";

      // Left Header
      const left = document.createElement("div");
      left.className = "cat-header-left";
      left.innerHTML = `
        <div class="cat-icon-badge">${cat.icon || "📁"}</div>
        <div class="cat-header-info">
          <div class="cat-title-row">
            <span class="cat-name">${cat.name}</span>
            <span class="cat-site-count">${sites.length} ${sites.length === 1 ? "site" : "sites"}</span>
            <span class="cat-expand-chevron">▼</span>
          </div>
        </div>
      `;

      // Right Header (Toggle Switch)
      const right = document.createElement("div");
      right.className = "cat-header-right";

      const switchLabel = document.createElement("label");
      switchLabel.className = "switch";

      const switchInput = document.createElement("input");
      switchInput.type = "checkbox";
      switchInput.checked = !!cat.enabled;

      const sliderSpan = document.createElement("span");
      sliderSpan.className = "slider";

      switchLabel.appendChild(switchInput);
      switchLabel.appendChild(sliderSpan);
      right.appendChild(switchLabel);

      header.appendChild(left);
      header.appendChild(right);

      // Expand / Collapse on Header Click (except switch)
      header.addEventListener("click", (e) => {
        if (e.target.closest(".switch")) return;
        if (expandedCategoryIds.has(catKey)) {
          expandedCategoryIds.delete(catKey);
        } else {
          expandedCategoryIds.add(catKey);
        }
        renderCategories();
      });

      // Switch change handler
      switchInput.addEventListener("change", (e) => {
        const willEnable = switchInput.checked;

        if (willEnable) {
          state.categories[catKey].enabled = true;
          chrome.storage.local.set({ categories: state.categories });
          renderCurrentTabCard();
        } else {
          if (state.hardcoreLock.active && (state.hardcoreLock.isPermanent || Date.now() < state.hardcoreLock.expiresAt)) {
            switchInput.checked = true;
            alert("🚫 IRREVERSIBLE HARDCORE LOCK IS ACTIVE!\nCategory shields can NEVER be turned off during this lock.");
            return;
          }

          switchInput.checked = true; // revert until authenticated
          requestPinAuth(() => {
            state.categories[catKey].enabled = false;
            switchInput.checked = false;
            chrome.storage.local.set({ categories: state.categories });
            renderCurrentTabCard();
          });
        }
      });

      // Card Body (Sites Chips + Add Form)
      const body = document.createElement("div");
      body.className = "cat-card-body";

      const chipsContainer = document.createElement("div");
      chipsContainer.className = "site-chips-container";

      if (sites.length === 0) {
        chipsContainer.innerHTML = `<span class="empty-chips-hint">No websites in this category yet. Add one below!</span>`;
      } else {
        sites.forEach((site, sIndex) => {
          const chip = document.createElement("span");
          chip.className = "site-chip";
          chip.textContent = site;

          const removeChipBtn = document.createElement("button");
          removeChipBtn.className = "btn-remove-chip";
          removeChipBtn.innerHTML = "&times;";
          removeChipBtn.title = `Remove ${site}`;

          removeChipBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            handleRemoveSiteFromCategory(catKey, sIndex);
          });

          chip.appendChild(removeChipBtn);
          chipsContainer.appendChild(chip);
        });
      }

      // Inline Add Row
      const addRow = document.createElement("div");
      addRow.className = "cat-inline-add-row";

      const siteInput = document.createElement("input");
      siteInput.type = "text";
      siteInput.placeholder = `Add website to ${cat.name}...`;
      siteInput.spellcheck = false;

      const addBtn = document.createElement("button");
      addBtn.className = "btn-cat-add";
      addBtn.textContent = "+ Add";

      const executeAddSite = async () => {
        const val = siteInput.value.trim();
        if (!val) return;
        const clean = extractCleanDomain(val);
        if (!clean || !clean.includes(".")) {
          alert("Please enter a valid domain (e.g. reddit.com).");
          return;
        }

        if (!state.categories[catKey].sites) state.categories[catKey].sites = [];
        if (state.categories[catKey].sites.includes(clean)) {
          alert("This website is already in this category.");
          return;
        }

        state.categories[catKey].sites.push(clean);
        await chrome.storage.local.set({ categories: state.categories });
        renderCategories();
        renderCustomBlocklist();
        renderCurrentTabCard();
      };

      addBtn.addEventListener("click", executeAddSite);
      siteInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") executeAddSite();
      });

      addRow.appendChild(siteInput);
      addRow.appendChild(addBtn);

      body.appendChild(chipsContainer);
      body.appendChild(addRow);

      card.appendChild(header);
      card.appendChild(body);

      categoriesContainer.appendChild(card);
    });
  }

  function handleRemoveSiteFromCategory(catKey, siteIndex) {
    if (state.hardcoreLock.active && (state.hardcoreLock.isPermanent || Date.now() < state.hardcoreLock.expiresAt)) {
      alert("🚫 IRREVERSIBLE HARDCORE LOCK IS ACTIVE!\nYou can NEVER remove websites from categories during this lock.");
      return;
    }

    requestPinAuth(async () => {
      if (state.categories[catKey] && state.categories[catKey].sites) {
        state.categories[catKey].sites.splice(siteIndex, 1);
        await chrome.storage.local.set({ categories: state.categories });
        renderCategories();
        renderCustomBlocklist();
        renderCurrentTabCard();
      }
    });
  }

  // Create New Category Modal Flow
  openNewCategoryModalBtn.addEventListener("click", () => {
    newCategoryNameInput.value = "";
    newCategoryError.classList.add("hidden");
    selectedNewCategoryEmoji = "🍿";
    emojiOpts.forEach((opt) => {
      opt.classList.toggle("active", opt.dataset.emoji === "🍿");
    });
    newCategoryModal.classList.remove("hidden");
    newCategoryNameInput.focus();
  });

  emojiOpts.forEach((opt) => {
    opt.addEventListener("click", () => {
      emojiOpts.forEach((o) => o.classList.remove("active"));
      opt.classList.add("active");
      selectedNewCategoryEmoji = opt.dataset.emoji;
    });
  });

  cancelNewCategoryBtn.addEventListener("click", () => {
    newCategoryModal.classList.add("hidden");
  });

  saveNewCategoryBtn.addEventListener("click", async () => {
    const name = newCategoryNameInput.value.trim();
    if (!name) {
      newCategoryError.textContent = "Please enter a category name.";
      newCategoryError.classList.remove("hidden");
      return;
    }

    const catId = name.toLowerCase().replace(/[^a-z0-9]/g, "_") + "_" + Date.now().toString(36);

    state.categories[catId] = {
      id: catId,
      name: name,
      icon: selectedNewCategoryEmoji,
      enabled: true,
      sites: []
    };

    await chrome.storage.local.set({ categories: state.categories });
    expandedCategoryIds.add(catId);
    newCategoryModal.classList.add("hidden");
    renderCategories();
  });

  // Render Hardcore Lock
  function renderHardcoreLock() {
    const isLockActive = state.hardcoreLock.active && (state.hardcoreLock.isPermanent || Date.now() < state.hardcoreLock.expiresAt);

    if (isLockActive) {
      hardcoreActiveBanner.classList.remove("hidden");
      hardcoreInactiveView.classList.add("hidden");
      hardcoreActiveView.classList.remove("hidden");

      if (state.hardcoreLock.isPermanent) {
        hardcoreCountdownBanner.textContent = "PERMANENT (NEVER UNBLOCKS)";
        hardcoreLiveTimer.textContent = "♾️ PERMANENT";
      } else {
        startLiveCountdown();
      }
    } else {
      hardcoreActiveBanner.classList.add("hidden");
      hardcoreInactiveView.classList.remove("hidden");
      hardcoreActiveView.classList.add("hidden");

      if (lockTimerInterval) {
        clearInterval(lockTimerInterval);
        lockTimerInterval = null;
      }
    }
  }

  function startLiveCountdown() {
    if (lockTimerInterval) clearInterval(lockTimerInterval);

    function tick() {
      if (state.hardcoreLock.isPermanent) {
        hardcoreCountdownBanner.textContent = "PERMANENT (NEVER UNBLOCKS)";
        hardcoreLiveTimer.textContent = "♾️ PERMANENT";
        return;
      }
      const remaining = state.hardcoreLock.expiresAt - Date.now();
      if (remaining <= 0) {
        clearInterval(lockTimerInterval);
        state.hardcoreLock = { active: false, expiresAt: 0 };
        chrome.storage.local.set({ hardcoreLock: state.hardcoreLock });
        renderHardcoreLock();
      } else {
        const formatted = formatTimeRemaining(remaining);
        hardcoreCountdownBanner.textContent = `${formatted} remaining`;
        hardcoreLiveTimer.textContent = formatted;
      }
    }

    tick();
    lockTimerInterval = setInterval(tick, 1000);
  }

  // Render Analytics
  function renderAnalytics() {
    statsTodayVal.textContent = state.stats.blockedCountToday || 0;
    statsStreakVal.textContent = state.stats.streak || 1;
    statsTotalVal.textContent = state.stats.totalBlockedCount || 0;

    topBlockedList.innerHTML = "";
    const top = state.stats.topBlocked || {};
    const sorted = Object.entries(top).sort((a, b) => b[1] - a[1]).slice(0, 5);

    if (sorted.length === 0) {
      topBlockedList.innerHTML = `<div style="text-align:center; font-size:11px; color:#94a3b8; padding:10px;">No distraction attempts logged yet. Keep it up!</div>`;
    } else {
      sorted.forEach(([domain, hits]) => {
        const item = document.createElement("div");
        item.className = "top-blocked-item";
        item.innerHTML = `
          <span class="top-blocked-domain">${domain}</span>
          <span class="top-blocked-hits">${hits} attempts</span>
        `;
        topBlockedList.appendChild(item);
      });
    }
  }

  // Render Security
  function renderSecurity() {
    if (state.passcode) {
      pinStatusText.textContent = "Active (Protected)";
      pinStatusText.style.color = "var(--cyan)";
      setPinView.classList.add("hidden");
      managePinView.classList.remove("hidden");
    } else {
      pinStatusText.textContent = "No PIN set";
      pinStatusText.style.color = "var(--amber)";
      setPinView.classList.remove("hidden");
      managePinView.classList.add("hidden");
    }
  }

  // PIN Authorization Flow for Protected Actions
  function requestPinAuth(onSuccess) {
    if (!state.passcode) {
      onSuccess();
      return;
    }

    pendingPinCallback = onSuccess;
    modalPinInput.value = "";
    modalPinError.classList.add("hidden");
    pinModal.classList.remove("hidden");
    modalPinInput.focus();
  }

  confirmPinModalBtn.addEventListener("click", () => {
    const entered = modalPinInput.value.trim();
    if (entered === state.passcode) {
      pinModal.classList.add("hidden");
      if (pendingPinCallback) {
        const cb = pendingPinCallback;
        pendingPinCallback = null;
        cb();
      }
    } else {
      modalPinError.classList.remove("hidden");
      modalPinInput.value = "";
      modalPinInput.focus();
    }
  });

  modalPinInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      confirmPinModalBtn.click();
    }
  });

  cancelPinModalBtn.addEventListener("click", () => {
    pinModal.classList.add("hidden");
    pendingPinCallback = null;
    renderCategories();
  });

  // Actions: Add / Delete Site (Shield Tab)
  blockCurrentSiteBtn.addEventListener("click", async () => {
    if (!currentTabDomain) return;
    if (!state.blockedSites.includes(currentTabDomain)) {
      state.blockedSites.push(currentTabDomain);
      await chrome.storage.local.set({ blockedSites: state.blockedSites });
      renderCurrentTabCard();
      renderCustomBlocklist();
    }
  });

  addButton.addEventListener("click", async () => {
    const input = urlInput.value.trim();
    if (!input) {
      inputErrorMsg.textContent = "Please enter a domain.";
      inputErrorMsg.classList.remove("hidden");
      return;
    }

    const domain = extractCleanDomain(input);
    if (!domain || !domain.includes(".")) {
      inputErrorMsg.textContent = "Please enter a valid domain (e.g. net77.cc).";
      inputErrorMsg.classList.remove("hidden");
      return;
    }

    inputErrorMsg.classList.add("hidden");

    if (state.blockedSites.includes(domain)) {
      inputErrorMsg.textContent = "This site is already in your blocklist.";
      inputErrorMsg.classList.remove("hidden");
      return;
    }

    state.blockedSites.push(domain);
    await chrome.storage.local.set({ blockedSites: state.blockedSites });
    urlInput.value = "";
    renderCustomBlocklist();
    renderCurrentTabCard();
  });

  urlInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") addButton.click();
  });

  function handleDeleteSite(index) {
    if (state.hardcoreLock.active && (state.hardcoreLock.isPermanent || Date.now() < state.hardcoreLock.expiresAt)) {
      alert("🚫 IRREVERSIBLE HARDCORE LOCK ACTIVE!\nYou can NEVER unblock websites while Hardcore Lock is engaged.");
      return;
    }

    requestPinAuth(async () => {
      state.blockedSites.splice(index, 1);
      await chrome.storage.local.set({ blockedSites: state.blockedSites });
      renderCustomBlocklist();
      renderCurrentTabCard();
    });
  }

  // Hardcore Lock Duration Selector
  durationPills.forEach((pill) => {
    pill.addEventListener("click", () => {
      durationPills.forEach((p) => p.classList.remove("active"));
      pill.classList.add("active");
      selectedDurationKey = pill.dataset.duration;
    });
  });

  function getDurationMs(key) {
    const now = new Date();
    switch (key) {
      case "30m":
        return 30 * 60 * 1000;
      case "1h":
        return 60 * 60 * 1000;
      case "2h":
        return 2 * 60 * 60 * 1000;
      case "4h":
        return 4 * 60 * 60 * 1000;
      case "midnight": {
        const midnight = new Date(now);
        midnight.setHours(23, 59, 59, 999);
        return Math.max(60000, midnight.getTime() - now.getTime());
      }
      case "morning": {
        const morning = new Date(now);
        if (morning.getHours() >= 8) {
          morning.setDate(morning.getDate() + 1);
        }
        morning.setHours(8, 0, 0, 0);
        return Math.max(60000, morning.getTime() - now.getTime());
      }
      case "permanent":
        return 100 * 365 * 24 * 60 * 60 * 1000; // 100 years
      default:
        return 30 * 60 * 1000;
    }
  }

  function getDurationLabel(key) {
    switch (key) {
      case "30m": return "30 minutes";
      case "1h": return "1 hour";
      case "2h": return "2 hours";
      case "4h": return "4 hours";
      case "midnight": return "until Midnight tonight";
      case "morning": return "until 8:00 AM tomorrow";
      case "permanent": return "FOREVER (Permanent - Never Unblocks)";
      default: return key;
    }
  }

  activateHardcoreBtn.addEventListener("click", () => {
    confirmDurationText.textContent = getDurationLabel(selectedDurationKey);
    hardcoreConfirmModal.classList.remove("hidden");
  });

  cancelHardcoreModalBtn.addEventListener("click", () => {
    hardcoreConfirmModal.classList.add("hidden");
  });

  startHardcoreConfirmBtn.addEventListener("click", async () => {
    hardcoreConfirmModal.classList.add("hidden");
    const isPerm = selectedDurationKey === "permanent";
    const durationMs = getDurationMs(selectedDurationKey);
    const expiresAt = Date.now() + durationMs;

    state.hardcoreLock = {
      active: true,
      isPermanent: isPerm,
      expiresAt: expiresAt
    };

    await chrome.storage.local.set({ hardcoreLock: state.hardcoreLock });
    renderHardcoreLock();
  });

  // PIN Management
  savePinBtn.addEventListener("click", async () => {
    const pin = newPinInput.value.trim();
    const confirm = confirmPinInput.value.trim();

    if (!/^\d{4}$/.test(pin)) {
      alert("Please enter a valid 4-digit numeric PIN.");
      return;
    }

    if (pin !== confirm) {
      alert("PINs do not match! Please re-enter.");
      return;
    }

    state.passcode = pin;
    await chrome.storage.local.set({ passcode: pin });
    sessionStorage.setItem("focusshield_gatekeeper_unlocked", "true");
    newPinInput.value = "";
    confirmPinInput.value = "";
    alert("🔐 4-Digit Passcode enabled! You will need it whenever you open FocusShield.");
    renderSecurity();
  });

  removePinBtn.addEventListener("click", async () => {
    const entered = currentPinInput.value.trim();
    if (entered !== state.passcode) {
      alert("Incorrect current PIN.");
      return;
    }

    state.passcode = null;
    await chrome.storage.local.set({ passcode: null });
    sessionStorage.removeItem("focusshield_gatekeeper_unlocked");
    currentPinInput.value = "";
    alert("Passcode removed.");
    renderSecurity();
  });

  changePinToggleBtn.addEventListener("click", () => {
    const entered = currentPinInput.value.trim();
    if (entered !== state.passcode) {
      alert("Enter your current PIN first before changing.");
      return;
    }
    setPinView.classList.remove("hidden");
    managePinView.classList.add("hidden");
    currentPinInput.value = "";
  });

  // Initial Boot
  await loadState();
  await detectCurrentTab();
});
