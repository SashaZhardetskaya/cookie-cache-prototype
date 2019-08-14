



const requestsFromTabs = {};
browser.webRequest.onCompleted.addListener(
    (details) => {
      // if (details.fromCache) {}
      const urlsByTab = requestsFromTabs[details.tabId];
      const hostname = new URL(details.url).hostname;
      requestsFromTabs[details.tabId] = urlsByTab ? [...urlsByTab, hostname] : [hostname];
      console.log('requestsFromTabs', requestsFromTabs);
    },
    {urls: ['<all_urls>']},
);
browser.runtime.onMessage.addListener((message, sender) => {
  if (message.type === 'RemoveCacheFromTab') {
    console.log('requestsFromTabs[message.payload]', requestsFromTabs[message.payload]);
    // sendMessageGlobal({type: 'GetAllCookiesFromContent', payload: document.cookie})
    browser.browsingData.removeCache({hostnames: requestsFromTabs[message.payload] || [], since: 0});
  }
});
