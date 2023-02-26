const LOCAL_STORAGE_KEY = 'autoLoginExtension'

const saveDataToStore = (data) => chrome.storage.local.set({ [LOCAL_STORAGE_KEY]: JSON.stringify(data) })

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.set({ name: "Jack" })
  saveDataToStore({ login: "aaa", password: "bbb" })
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete' && /^http/.test(tab.url)) {
        chrome.scripting.insertCSS({ target: { tabId: tabId }, files: ["./foreground_styles.css"] })
          .then(() => {
              console.log("INJECTED THE FOREGROUND STYLES.");

              chrome.scripting.executeScript({ target: { tabId: tabId }, files: ["./foreground.js"] })
                .then(() => console.log("INJECTED THE FOREGROUND SCRIPT."));
          })
          .catch(err => console.log(err));
    }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.message === 'get_name') {
        chrome.storage.local.get('name', data => {
            if (chrome.runtime.lastError) return sendResponse({ message: 'fail' })

            sendResponse({ message: 'success', payload: data.name });
        });

        return true;
    } else if (request.message === 'change_name') {
        chrome.storage.local.set(
          { name: request.payload },
          () => {
              if (chrome.runtime.lastError) return sendResponse({ message: 'fail' })

              sendResponse({ message: 'success' });
          })

        return true;
    }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.message === 'get_login_and_password_from_background_local_store') {
        chrome.storage.local.get(LOCAL_STORAGE_KEY, data => {
            if (chrome.runtime.lastError) return sendResponse({ message: 'fail' })

            sendResponse({ message: 'success', payload: JSON.parse(data[LOCAL_STORAGE_KEY]) });
        });

        return true;
    } else if (request.message === 'change_name') {
        chrome.storage.local.set(
          { name: request.payload },
          () => {
              if (chrome.runtime.lastError) return sendResponse({ message: 'fail' })

              sendResponse({ message: 'success' });
          })

        return true;
    }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.message === 'write_new_input_toLocal_store') {
      chrome.storage.local.get(LOCAL_STORAGE_KEY, data => {
        if (chrome.runtime.lastError) return sendResponse({ message: 'fail' })

        const savedData = JSON.parse(data[LOCAL_STORAGE_KEY])

        savedData[request.payload.key] = request.payload.value

        saveDataToStore(savedData)
      });
        return true;
    }
});
