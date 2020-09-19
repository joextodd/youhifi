export const listenStorage = (actions) => {
  chrome.storage.onChanged.addListener((changes, namespace) => {
    for (var key in changes) {
      actions.storageUpdate({ [key]: changes[key].newValue })
    }
  })
}

export const getStorageData = key =>
  new Promise((resolve, reject) =>
    chrome.storage.sync.get(key, result =>
      chrome.runtime.lastError
        ? reject(Error(chrome.runtime.lastError.message))
        : resolve(result)
    )
  )

export const setStorageData = data =>
  new Promise((resolve, reject) => {
    chrome.storage.sync.set(data, () =>
      chrome.runtime.lastError
        ? reject(Error(chrome.runtime.lastError.message))
        : resolve()
    )
  })

export const sendBackground = (message) => 
  new Promise((resolve, reject) =>
    chrome.runtime.sendMessage(message, response => {
      response.err ? reject(response.err) : resolve(response)
    })
  )

export const listenBackground = (actions) => {
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action) {
      actions[message.action](message.params)
    }
  }
);
}