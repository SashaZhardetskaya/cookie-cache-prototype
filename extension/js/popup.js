
var currentPageDomain = '';
var currentTabId = 0;
var cookiesFromCurrentSite = [];
var allCookies = [];


function updateAllCookies() {
    chrome.cookies.getAllCookieStores((stores) => {
        chrome.cookies.getAll({storeId: stores[0].id}, function(cookies) {
            allCookies = cookies;
            console.log('cookies for storeId', cookies);
        });
    });
}
updateAllCookies();



const sendMessageToAllTabs = (message) => {
    chrome.tabs.query({}, function (tabs) {
        tabs.forEach(tab => {
            chrome.tabs.sendMessage(tab.id, message);
        });
    });
};


// handle onMessage
const messagesCallbacks = [];
const onMessage = (cb) => {
    messagesCallbacks.push(cb);
};
const offMessage = (cb) => {
    messagesCallbacks.filter(x => x !== cb)
};
chrome.runtime.onMessage.addListener((message, sender) => {
    console.log('message', message);
    console.log('sender', sender);
    messagesCallbacks.forEach((cb, index) => {
        cb(message);
    })
});



// set current site
chrome.tabs.query({currentWindow: true, active: true}, function (tabs) {
    tabs.forEach(tab => {
        console.log('new URL(tab.url).hostname', new URL(tab.url).hostname);
        currentTabId = tab.id;
        currentPageDomain = new URL(tab.url).hostname.replace(/(https?:\/\/)?(www.)?/i, '');
        cookiesByDomainShowBtn.innerText = cookiesByDomainShowBtn.innerText + ` '${currentPageDomain}'`;
        cookiesByDomainClearBtn.innerText = cookiesByDomainClearBtn.innerText + ` '${currentPageDomain}'`;
        historyCurrentDomainClearBtn.innerText = historyCurrentDomainClearBtn.innerText + ` '${currentPageDomain}'`;
    });
});



// open browser pages
const cookiesOpenBrowserBtn = document.getElementsByClassName('js-cookies-open-all-btn')[0];
const cacheOpenBrowserBtn = document.getElementsByClassName('js-cache-open-all-btn')[0];
const downloadsOpenBrowserBtn = document.getElementsByClassName('js-downloads-open-all-btn')[0];
const historyOpenBrowserBtn = document.getElementsByClassName('js-history-open-all-btn')[0];
cookiesOpenBrowserBtn.addEventListener('click', () => {
    chrome.tabs.create({
        active: true,
        url: "chrome://settings/siteData",
    });
});
historyOpenBrowserBtn.addEventListener('click', () => {
    chrome.tabs.create({
        active: true,
        url: "chrome://history/",
    });
});
downloadsOpenBrowserBtn.addEventListener('click', () => {
    chrome.tabs.create({
        active: true,
        url: "chrome://downloads/",
    });
});




// cookies By Domain
const cookiesByDomainShowBtn = document.getElementsByClassName('js-cookies-show-by-domain-btn')[0];
const cookiesByDomainList = document.getElementsByClassName('js-cookies-show-by-domain-list')[0];
const cookiesByDomainClearBtn = document.getElementsByClassName('js-cookies-clear-by-domain-btn')[0];
cookiesByDomainShowBtn.addEventListener('click', () => {
    cookiesByDomainList.innerHTML = '';
    chrome.cookies.getAll({domain: currentPageDomain}, function(cookies) {
        cookies.forEach((cookie) => {
            const cookieItem = document.createElement('li');
            cookieItem.innerHTML = `${cookie.name} : ${cookie.value}`;
            cookiesByDomainList.appendChild(cookieItem);
        })
    });
});
cookiesByDomainClearBtn.addEventListener('click', () => {
    chrome.cookies.getAll({domain: currentPageDomain}, function(cookies) {
        cookies.forEach((cookie) => {
            chrome.cookies.remove({ url: "http" + (cookie.secure ? "s" : "") + "://" + cookie.domain + cookie.path, name: cookie.name });
        })
    });
    cookiesByDomainClearBtn.append(' - DONE');
    updateAllCookies()
});


const cookiesByGoogleShowBtn = document.getElementsByClassName('js-cookies-show-by-google-btn')[0];
const cookiesByGoogleList = document.getElementsByClassName('js-cookies-show-by-google-list')[0];
const cookiesByGoogleClearBtn = document.getElementsByClassName('js-cookies-clear-by-google-btn')[0];
cookiesByGoogleShowBtn.addEventListener('click', () => {
    cookiesByGoogleList.innerHTML = '';
    chrome.cookies.getAll({domain: '.google.com'}, function(cookies) {
        cookies.forEach((cookie) => {
            const cookieItem = document.createElement('li');
            cookieItem.innerHTML = `${cookie.name} : ${cookie.value}`;
            cookiesByGoogleList.appendChild(cookieItem);
        })
    });
});
cookiesByGoogleClearBtn.addEventListener('click', () => {
    chrome.cookies.getAll({domain: '.google.com'}, function(cookies) {
        cookies.forEach((cookie) => {
            chrome.cookies.remove({ url: "http" + (cookie.secure ? "s" : "") + "://" + cookie.domain + cookie.path, name: cookie.name });
        })
    });
    cookiesByGoogleClearBtn.append(' - DONE');
    updateAllCookies()
});




// cookies By Current Page (set by current page)
const cookiesOnCurrentSiteShowBtn = document.getElementsByClassName('js-cookies-show-current-site-btn')[0];
const cookiesOnCurrentSiteList = document.getElementsByClassName('js-cookies-show-current-site-list')[0];
const cookiesOnCurrentSiteClearBtn = document.getElementsByClassName('js-cookies-clear-current-site-btn')[0];
sendMessageToAllTabs({type: 'GetAllCookiesFromContent'});
cookiesOnCurrentSiteShowBtn.addEventListener('click', () => {
    sendMessageToAllTabs({type: 'GetAllCookiesFromContent'});
    cookiesOnCurrentSiteList.innerHTML = '';
    cookiesFromCurrentSite.forEach((cookie) => {
        const cookieItem = document.createElement('li');
        cookieItem.innerHTML = `${cookie.name} : ${cookie.value}`;
        cookiesOnCurrentSiteList.appendChild(cookieItem);
    })
});
cookiesOnCurrentSiteClearBtn.addEventListener('click', () => {
    const expandedCookieFromSite = allCookies.filter((cookieItem) => {
        for (let i=0; i < cookiesFromCurrentSite.length; i++) {
            if (cookiesFromCurrentSite[i].name === cookieItem.name && cookiesFromCurrentSite[i].value === cookieItem.value) {
                return true;
            }
        }
    });
    expandedCookieFromSite.forEach(cookie => {
        chrome.cookies.remove({ url: "http" + (cookie.secure ? "s" : "") + "://" + cookie.domain + cookie.path, name: cookie.name });
    });
    console.log('expandedCookieFromSite', expandedCookieFromSite);
    cookiesOnCurrentSiteClearBtn.append(' - DONE');
    updateAllCookies()
});




// All cookies for All sites
const cookiesAllCountBtn = document.getElementsByClassName('js-cookies-count-all-btn')[0];
const cookiesAllCountNumber = document.getElementsByClassName('js-cookies-count-all-number')[0];
const cookiesAllClearBtn = document.getElementsByClassName('js-cookies-clear-all-btn')[0];
cookiesAllCountBtn.addEventListener('click', () => {
    cookiesAllCountNumber.innerHTML = allCookies.length;
});
cookiesAllClearBtn.addEventListener('click', () => {
    updateAllCookies();
    allCookies.forEach(cookie => {
        chrome.cookies.remove({ url: "http" + (cookie.secure ? "s" : "") + "://" + cookie.domain + cookie.path, name: cookie.name });
    });
    cookiesAllClearBtn.append(' - DONE');
    updateAllCookies()
});


// Cache
const cacheCurrentPageRemoveBtn = document.getElementsByClassName('js-caches-clear-current-site-btn')[0];
const cacheAllRemoveBtn = document.getElementsByClassName('js-caches-clear-all-btn')[0];
const cacheForPastTenMinutesRemoveBtn = document.getElementsByClassName('js-caches-clear-past-ten-minutes-btn')[0];
cacheCurrentPageRemoveBtn.addEventListener('click', () => {
    chrome.runtime.sendMessage({type: 'RemoveCacheFromTab', payload: currentTabId});
    cacheCurrentPageRemoveBtn.append(' - DONE');
});
cacheAllRemoveBtn.addEventListener('click', () => {
    chrome.browsingData.removeCache({}, (resp) => { // C:\Users\zhara\AppData\Local\Google\Chrome\User Data\Default\Code Cache
    });
    chrome.browsingData.removeCacheStorage({}, (resp) => { // C:\Users\zhara\AppData\Local\Google\Chrome\User Data\Default\Cache
        cacheAllRemoveBtn.append(' - DONE');
    });
});
cacheForPastTenMinutesRemoveBtn.addEventListener('click', () => {
    console.log('cacheForPastTenMinutesRemoveBtn');
    chrome.browsingData.removeCache({since: new Date(Date.now() - 600000).getTime()}, (resp) => { // C:\Users\zhara\AppData\Local\Google\Chrome\User Data\Default\Code Cache
    });
    chrome.browsingData.removeCacheStorage({since: new Date(Date.now() - 600000).getTime()}, (resp) => { // C:\Users\zhara\AppData\Local\Google\Chrome\User Data\Default\Cache
    });
});



// History
const historyCurrentDomainClearBtn = document.getElementsByClassName('js-history-clear-current-domain-btn')[0];
const historyAllClearBtn = document.getElementsByClassName('js-history-clear-all-btn')[0];
const historyForPastTenMinutesClearBtn = document.getElementsByClassName('js-history-clear-past-ten-minutes-btn')[0];

historyCurrentDomainClearBtn.addEventListener('click', () => {
    console.log('historyCurrentDomainClearBtn');
    chrome.history.search({text: currentPageDomain}, (history) => {
        history.forEach(historyItem => {
            chrome.history.deleteUrl({url: historyItem.url}, () => {
                historyCurrentDomainClearBtn.append(' - DONE');
            });
        })
    });
});
historyAllClearBtn.addEventListener('click', () => {
    console.log('historyAllClearBtn');
    chrome.browsingData.removeHistory({}, () => {});
    historyAllClearBtn.append(' - DONE');
});
historyForPastTenMinutesClearBtn.addEventListener('click', () => {
    console.log('historyForPastTenMinutesRemoveBtn');
    chrome.browsingData.removeHistory({since: new Date(Date.now() - 600000).getTime()}, () => {});
    historyForPastTenMinutesClearBtn.append(' - DONE');
});


// Downloads
const downloadsCurrentDomainClearBtn = document.getElementsByClassName('js-downloads-clear-current-domain-btn')[0];
const downloadsAllClearBtn = document.getElementsByClassName('js-downloads-clear-all-btn')[0];
const downloadsForPastTenMinutesClearBtn = document.getElementsByClassName('js-downloads-clear-past-ten-minutes-btn')[0];

downloadsCurrentDomainClearBtn.addEventListener('click', () => {
    console.log('downloadsCurrentDomainClearBtn');
    chrome.downloads.search({query: [currentPageDomain]}, (downloads) => {
        console.log('*** downloads', downloads);
        downloads.forEach(downloadsItem => {
            chrome.downloads.removeFile({downloadId: downloadsItem.id}, () => {
                historyCurrentDomainClearBtn.append(' - DONE');
            });
        })
    });
});
downloadsAllClearBtn.addEventListener('click', () => {
    console.log('downloadsAllClearBtn');
    chrome.browsingData.removeDownloads({}, () => {});
    historyAllClearBtn.append(' - DONE');
});
downloadsForPastTenMinutesClearBtn.addEventListener('click', () => {
    console.log('downloadsForPastTenMinutesRemoveBtn');
    chrome.browsingData.removeDownloads({since: new Date(Date.now() - 600000).getTime()}, () => {});
    historyForPastTenMinutesClearBtn.append(' - DONE');
});



chrome.downloads.search({}, (downloads) => {
    console.log('+++ downloads', downloads);
});










onMessage(message => {
    console.log('received message: ', message);
    if (message.type === 'GetAllCookiesFromContent') {
        cookiesFromCurrentSite = message.payload.split('; ').map(cookie => {
            return {
                name: cookie.slice(0, cookie.indexOf('=')),
                value: cookie.slice(cookie.indexOf('=') + 1, cookie.length),
            }
        });
    }
});



