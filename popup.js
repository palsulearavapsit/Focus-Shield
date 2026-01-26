const urlInput = document.getElementById("urlInput");
const addButton = document.getElementById("addButton");
const blockList = document.getElementById("blockList");

function extractDomain(url) {
  return url.replace(/^https?:\/\//, "").replace(/^www\./, "").split("/")[0];
}


function renderList(blockedSites) {
  blockList.innerHTML = "";
  blockedSites.forEach((site, index) => {
    const li = document.createElement("li");
    li.textContent = site;
    li.addEventListener("click", () => {
      blockedSites.splice(index, 1);
      chrome.storage.local.set({ blockedSites });
      renderList(blockedSites);
    });
    blockList.appendChild(li);
  });
}

addButton.onclick = () => {
  const input = urlInput.value.trim();
  if (input) {
    const domain = extractDomain(input);
    chrome.storage.local.get(["blockedSites"], (result) => {
      const sites = result.blockedSites || [];
      if (!sites.includes(domain)) {
        sites.push(domain);
        chrome.storage.local.set({ blockedSites: sites });
        renderList(sites);
        urlInput.value = "";
      }
    });
  }
};

chrome.storage.local.get(["blockedSites"], (result) => {
  renderList(result.blockedSites || []);
});
