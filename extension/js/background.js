
chrome.cookies.getAll({domain: "amazon.com"}, function(cookies) {
  console.log('cookies for amazon', cookies);
  for(var i=0; i<cookies.length;i++) {
    // chrome.cookies.remove({url: "http://domain.com" + cookies[i].path, name: cookies[i].name});
  }
});

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
chrome.cookies.getAll({name: "session-id-time"}, function(cookies) {
  console.log('cookies for skin', cookies);
  for(var i=0; i<cookies.length;i++) {
    // chrome.cookies.remove({url: "http://domain.com" + cookies[i].path, name: cookies[i].name});
  }
});
chrome.cookies.getAll({name: "zhara"}, function(cookies) {
  console.log('cookies for skin', cookies);
  for(var i=0; i<cookies.length;i++) {

    // chrome.cookies.remove({url: "http://domain.com" + cookies[i].path, name: cookies[i].name});
  }
});

chrome.cookies.getAll({domain: "google.com"}, function(cookies) {
  console.log('cookies for amazon', cookies);
  for(var i=0; i<cookies.length;i++) {
    // chrome.cookies.remove({url: "http://domain.com" + cookies[i].path, name: cookies[i].name});
  }
});

chrome.cookies.getAll({domain: "github.com"}, function(cookies) {
  console.log('cookies for github', cookies);
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

//
// chrome.browserAction.onClicked.addListener((tab) => {
//   console.log('BA clicked');
//
//
//   // ingect iframe here
// });


