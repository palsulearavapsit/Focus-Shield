const QUOTES = [
  {
    quote: "Discipline is choosing between what you want now, and what you want most.",
    author: "Abraham Lincoln"
  },
  {
    quote: "Your future self is watching you right now through your memories.",
    author: "FocusShield Directive"
  },
  {
    quote: "Comfort is the enemy of achievement. Close this tab and finish the mission.",
    author: "David Goggins"
  },
  {
    quote: "You don't get the results you want; you get the results of what you do.",
    author: "James Clear"
  },
  {
    quote: "Starve your distractions, feed your focus.",
    author: "Robin Sharma"
  },
  {
    quote: "Success is the sum of small efforts, repeated day in and day out.",
    author: "Robert Collier"
  },
  {
    quote: "One day or Day One. You decide.",
    author: "Paulo Coelho"
  }
];

function getQueryParam(name) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(name);
}

document.addEventListener("DOMContentLoaded", async () => {
  const targetDomainEl = document.getElementById("targetDomain");
  const quoteEl = document.getElementById("motivationalQuote");
  const quoteAuthorEl = document.getElementById("quoteAuthor");
  const todayCountEl = document.getElementById("todayCount");
  const streakCountEl = document.getElementById("streakCount");
  const closeTabBtn = document.getElementById("closeTabBtn");
  const toggleBreathingBtn = document.getElementById("toggleBreathingBtn");
  const breathingWidget = document.getElementById("breathingWidget");
  const breathingRing = document.getElementById("breathingRing");
  const breathingGuideText = document.getElementById("breathingGuideText");

  // 1. Get Target Domain
  let domain = getQueryParam("target") || "Distracting Website";
  targetDomainEl.textContent = domain;

  // 2. Set Random Quote
  const randomQuote = QUOTES[Math.floor(Math.random() * QUOTES.length)];
  quoteEl.textContent = randomQuote.quote;
  quoteAuthorEl.textContent = `— ${randomQuote.author}`;

  // 3. Record Distraction Attempt in Background & Fetch Stats
  try {
    chrome.runtime.sendMessage(
      { action: "RECORD_BLOCKED", domain: domain },
      (response) => {
        if (response && response.stats) {
          todayCountEl.textContent = response.stats.blockedCountToday || 1;
          const streak = response.stats.streak || 1;
          streakCountEl.textContent = `${streak} ${streak === 1 ? "Day" : "Days"}`;
        }
      }
    );
  } catch (e) {
    console.warn("Could not connect to background service:", e);
  }

  // 4. Close Tab Action
  closeTabBtn.addEventListener("click", () => {
    try {
      chrome.runtime.sendMessage({ action: "CLOSE_TAB" }, () => {
        window.close();
      });
    } catch {
      window.close();
    }
  });

  // 5. Box Breathing Widget
  let breathingInterval = null;
  let isBreathingActive = false;

  function runBreathingCycle() {
    const stages = [
      { text: "Inhale...", state: "inhale", duration: 4000 },
      { text: "Hold...", state: "hold-in", duration: 4000 },
      { text: "Exhale...", state: "exhale", duration: 4000 },
      { text: "Hold...", state: "hold-out", duration: 4000 }
    ];

    let currentStageIndex = 0;

    function nextStage() {
      if (!isBreathingActive) return;
      const stage = stages[currentStageIndex];
      breathingGuideText.textContent = stage.text;

      if (stage.state === "inhale") {
        breathingRing.className = "breathing-ring inhale";
      } else if (stage.state === "exhale") {
        breathingRing.className = "breathing-ring exhale";
      }

      currentStageIndex = (currentStageIndex + 1) % stages.length;
      breathingInterval = setTimeout(nextStage, stage.duration);
    }

    nextStage();
  }

  toggleBreathingBtn.addEventListener("click", () => {
    if (breathingWidget.classList.contains("hidden")) {
      breathingWidget.classList.remove("hidden");
      isBreathingActive = true;
      runBreathingCycle();
      toggleBreathingBtn.innerHTML = '<span class="btn-icon">🧘</span> Stop Breathing Guide';
    } else {
      breathingWidget.classList.add("hidden");
      isBreathingActive = false;
      clearTimeout(breathingInterval);
      toggleBreathingBtn.innerHTML = '<span class="btn-icon">🧘</span> 60s Dopamine Reset';
    }
  });
});
