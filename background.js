chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.get(["blockedSites"], (result) => {
    updateRules(result.blockedSites || []);
  });
});

chrome.storage.onChanged.addListener((changes, area) => {
  if (area === "local" && changes.blockedSites) {
    updateRules(changes.blockedSites.newValue);
  }
});

function updateRules(blockedSites) {
  const rules = blockedSites.map((domain, index) => ({
    id: index + 1,
    priority: 1,
    action: { type: "block" },
    condition: {
      urlFilter: domain,
      resourceTypes: ["main_frame"]
    }
  }));

  chrome.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: rules.map(r => r.id),
    addRules: rules
  });
}
