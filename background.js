function focusNextAudioTab() {
  chrome.tabs.query({}, function (tabs) {
    const audioTabs = tabs.filter(tab => tab.audible);
    if (audioTabs.length === 0) {
      console.log("No audio-playing tabs found.");
      return;
    }

    audioTabs.sort((a, b) => a.id - b.id);

    chrome.storage.local.get("lastAudioTabId", data => {
      let currentIndex = audioTabs.findIndex(t => t.id === data.lastAudioTabId);
      if (currentIndex === -1) currentIndex = -1;

      const nextIndex = (currentIndex + 1) % audioTabs.length;
      const nextTab = audioTabs[nextIndex];

      chrome.tabs.update(nextTab.id, { active: true });
      chrome.windows.update(nextTab.windowId, { focused: true });
      chrome.storage.local.set({ lastAudioTabId: nextTab.id });
    });
  });
}

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "switch-audio-tab",
    title: "Switch to Next Audio Tab",
    contexts: ["all"]
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "switch-audio-tab") {
    focusNextAudioTab();
  }
});

chrome.browserAction.onClicked.addListener(focusNextAudioTab);