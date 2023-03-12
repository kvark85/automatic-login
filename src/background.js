const LOCAL_STORAGE_KEY = 'autoLoginExtension'

// fired first every time an extension popup is opened
console.log('from background script')

const saveDataToStore = (data) => chrome.storage.local.set({ [LOCAL_STORAGE_KEY]: JSON.stringify(data) })

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.set({ name: "Jack" })
  saveDataToStore({ login: "aaa", password: "bbb" })
});

let tabId

chrome.tabs.onUpdated.addListener((currentTabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && /^http/.test(tab.url)) {
    tabId = currentTabId

    chrome.scripting.insertCSS({ target: { tabId: currentTabId }, files: ["./src/foreground/foreground_styles.css"] })
      .then(() => {
        console.log("INJECTED THE FOREGROUND STYLES.");

        chrome.scripting.executeScript({ target: { tabId: currentTabId }, files: ["./src/foreground/foreground.js"] })
          .then(() => console.log("INJECTED THE FOREGROUND SCRIPT."));
      })
      .catch(err => console.log(err));
  }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  switch (request.message) {
    case 'get_name':
      chrome.storage.local.get('name', data => {
        if (chrome.runtime.lastError) return sendResponse({ message: 'fail' })

        sendResponse({ message: 'success', payload: data.name });
      });

      return true;
    case 'change_name':
      chrome.storage.local.set(
        { name: request.payload },
        () => {
          if (chrome.runtime.lastError) return sendResponse({ message: 'fail' })

          sendResponse({ message: 'success' });
        })

      return true;
    case 'get_login_and_password_from_background_local_store':
      chrome.storage.local.get(LOCAL_STORAGE_KEY, data => {
        if (chrome.runtime.lastError) return sendResponse({ message: 'fail' })

        sendResponse({ message: 'success', payload: JSON.parse(data[LOCAL_STORAGE_KEY]) });
      });

      return true;
    case 'write_new_input_toLocal_store':
      chrome.storage.local.get(LOCAL_STORAGE_KEY, data => {
        if (chrome.runtime.lastError) return sendResponse({ message: 'fail' })

        const savedData = JSON.parse(data[LOCAL_STORAGE_KEY])

        savedData[request.payload.key] = request.payload.value

        saveDataToStore(savedData)
      });
      return true;
    case 'get_current_data_from_local_store':
      chrome.tabs.sendMessage(tabId, { message: 'get_current_data_from_local_store' })

      return true;
    default:
      return true;
  }
});
