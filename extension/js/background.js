

chrome.cookies.getAllCookieStores((stores) => {
  console.log('++++++++++++++ stores', stores);
});

chrome.cookies.getAll({storeId: "0"}, function(cookies) {
  console.log('cookies for storeId', cookies);
  for(var i=0; i<cookies.length;i++) {
    // chrome.cookies.remove({url: "http://domain.com" + cookies[i].path, name: cookies[i].name});
  }
});

chrome.cookies.getAll({url: "https://www.amazon.com/"}, function(cookies) {
  console.log('cookies for url', cookies);
  for(var i=0; i<cookies.length;i++) {
    // chrome.cookies.remove({url: "http://domain.com" + cookies[i].path, name: cookies[i].name});
  }
});

chrome.cookies.getAll({name: "skin"}, function(cookies) {
  console.log('cookies for skin', cookies);
  for(var i=0; i<cookies.length;i++) {
    // chrome.cookies.remove({url: "http://domain.com" + cookies[i].path, name: cookies[i].name});
  }
});




chrome.tabs.query({
  // currentWindow: true,
  // active: true
}, function(tabs) {
  console.log("tabs ++++++", tabs);
  chrome.webNavigation.getAllFrames({
    tabId: tabs[0].id
  }, function(details) {
    // Get unique list of URLs
    var urls = details.reduce(function(urls, frame) {
      if (urls.indexOf(frame.url) === -1)
        urls.push(frame.url);
      return urls;
    }, []);
    console.log('urls &&&& L::', urls);

    // Get all cookies
    var index = 0;
    var cookies = [];
    urls.forEach(function(url) {
      chrome.cookies.getAll({
        url: url
      }, function(additionalCookies) {
        cookies = cookies.concat(additionalCookies);
        if (++index === urls.length) {
          // Collected all cookies!
          // TODO: Use cookies.
          // Note: The array may contain duplicate cookies!
        }
      }); // chrome.cookies.getAll
    }); // urls.forEach
  }); // chrome.webNavigation.getAllFrames
}); // chrome.tabs.query






const requestsFromTabs = {};
chrome.webRequest.onCompleted.addListener(
    (details) => {
      // if (details.fromCache) {}
      const urlsByTab = requestsFromTabs[details.tabId];
      requestsFromTabs[details.tabId] = urlsByTab ? [...urlsByTab, details.url] : [details.url];
      console.log('requestsFromTabs', requestsFromTabs);
    },
    {urls: ['<all_urls>']},
);
chrome.runtime.onMessage.addListener((message, sender) => {
  if (message.type === 'RemoveCacheFromTab') {
    console.log('requestsFromTabs[message.payload]', requestsFromTabs[message.payload]);
    // sendMessageGlobal({type: 'GetAllCookiesFromContent', payload: document.cookie})

    chrome.browsingData.removeCache({origins: requestsFromTabs[message.payload] || [], since: 0, originTypes: {protectedWeb: true}}, (resp) => {});

    chrome.browsingData.removeCacheStorage({origins: requestsFromTabs[message.payload], since: 0, originTypes: {protectedWeb: true}}, (resp) => {});
  }
});
