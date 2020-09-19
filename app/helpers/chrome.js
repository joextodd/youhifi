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
    console.log('setting data')
    chrome.storage.sync.set(data, () =>
      chrome.runtime.lastError
        ? reject(Error(chrome.runtime.lastError.message))
        : resolve()
    )
  })

export const getUrl = (videoId) => 
  new Promise((resolve, reject) =>
    chrome.runtime.sendMessage({ videoId }, response => {
      console.log(response)
      resolve(response)
    })
  )