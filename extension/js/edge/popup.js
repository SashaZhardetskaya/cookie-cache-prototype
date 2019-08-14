
var currentPageDomain = '';
var currentTabId = 0;
var cookiesFromCurrentSite = [];
var allCookies = [];


function updateAllCookies() {
    browser.cookies.getAllCookieStores((stores) => {
        browser.cookies.getAll({storeId: stores[0].id}, function(cookies) {
            allCookies = cookies;
            console.log('cookies for storeId', cookies);
        });
    });
}
updateAllCookies();



const sendMessageToAllTabs = (message) => {
    browser.tabs.query({}, function (tabs) {
        tabs.forEach(tab => {
            browser.tabs.sendMessage(tab.id, message);
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
browser.runtime.onMessage.addListener((message, sender) => {
    console.log('message', message);
    console.log('sender', sender);
    messagesCallbacks.forEach((cb, index) => {
        cb(message);
    })
});



// set current site
browser.tabs.query({currentWindow: true, active: true}, function (tabs) {
    tabs.forEach(tab => {
        console.log('new URL(tab.url).hostname', new URL(tab.url).hostname);
        currentTabId = tab.id;
        currentPageDomain = new URL(tab.url).hostname.replace(/(https?:\/\/)?(www.)?/i, '');
        cookiesByDomainShowBtn.innerText = cookiesByDomainShowBtn.innerText + ` '${currentPageDomain}'`;
        cookiesByDomainClearBtn.innerText = cookiesByDomainClearBtn.innerText + ` '${currentPageDomain}'`;
        historyCurrentDomainClearBtn.innerText = historyCurrentDomainClearBtn.innerText + ` '${currentPageDomain}'`;
        // downloadsCurrentDomainClearBtn.innerText = downloadsCurrentDomainClearBtn.innerText + ` '${currentPageDomain}'`;
    });
});




// cookies By Domain
const cookiesByDomainShowBtn = document.getElementsByClassName('js-cookies-show-by-domain-btn')[0];
const cookiesByDomainList = document.getElementsByClassName('js-cookies-show-by-domain-list')[0];
const cookiesByDomainClearBtn = document.getElementsByClassName('js-cookies-clear-by-domain-btn')[0];
cookiesByDomainShowBtn.addEventListener('click', () => {
    cookiesByDomainList.innerHTML = '';
    browser.cookies.getAll({domain: currentPageDomain}, function(cookies) {
        cookies.forEach((cookie) => {
            const cookieItem = document.createElement('li');
            cookieItem.innerHTML = `${cookie.name} : ${cookie.value}`;
            cookiesByDomainList.appendChild(cookieItem);
        })
    });
});
cookiesByDomainClearBtn.addEventListener('click', () => {
    browser.cookies.getAll({domain: currentPageDomain}, function(cookies) {
        cookies.forEach((cookie) => {
            browser.cookies.remove({ url: "http" + (cookie.secure ? "s" : "") + "://" + cookie.domain + cookie.path, name: cookie.name });
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
    browser.cookies.getAll({domain: 'google.com'}, function(cookies) {
        console.log('.google.com cookies', cookies);
        cookies.forEach((cookie) => {
            const cookieItem = document.createElement('li');
            cookieItem.innerHTML = `${cookie.name} : ${cookie.value}`;
            cookiesByGoogleList.appendChild(cookieItem);
        })
    });
});
cookiesByGoogleClearBtn.addEventListener('click', () => {
    browser.cookies.getAll({domain: 'google.com'}, function(cookies) {
        cookies.forEach((cookie) => {
            browser.cookies.remove({ url: "http" + (cookie.secure ? "s" : "") + "://" + cookie.domain + cookie.path, name: cookie.name });
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
        browser.cookies.remove({ url: "http" + (cookie.secure ? "s" : "") + "://" + cookie.domain + cookie.path, name: cookie.name });
    });
    cookiesOnCurrentSiteClearBtn.append(' - DONE');
    updateAllCookies()
});



// cookies By Domain (+3d party and more)
const cookiesThirdPartiessShowBtn = document.getElementsByClassName('js-cookies-show-third-parties-btn')[0];
const cookiesThirdPartiessList = document.getElementsByClassName('js-cookies-show-third-parties-list')[0];
const cookiesThirdPartiessClearBtn = document.getElementsByClassName('js-cookies-clear-third-parties-btn')[0];
cookiesThirdPartiessShowBtn.addEventListener('click', () => {
    cookiesThirdPartiessList.innerHTML = 'start!!!';
    browser.runtime.sendMessage({type: 'GetAllOutgoingUrls', payload: currentTabId});
    onMessage(message => {
        if (message.type === 'GetAllOutgoingUrls') {
            const hostnamesArr = message.payload.map(url => url.replace(/(https?:\/\/)?(www.)?/i, '')).filter((v, i, a) => a.indexOf(v) === i);
            hostnamesArr.forEach(hostname => {
                browser.cookies.getAll({domain: hostname}, function(cookies) {
                    cookies.forEach((cookie) => {
                        const cookieItem = document.createElement('li');
                        cookieItem.innerHTML = `${cookie.name} : ${cookie.value}`;
                        cookiesThirdPartiessList.appendChild(cookieItem);
                    })
                });
            });
        }
    });
});

cookiesThirdPartiessClearBtn.addEventListener('click', () => {
    browser.runtime.sendMessage({type: 'GetAllOutgoingUrls', payload: currentTabId});
    onMessage(message => {
        if (message.type === 'GetAllOutgoingUrls') {
            const hostnamesArr = message.payload.map(url => url.replace(/(https?:\/\/)?(www.)?/i, '')).filter((v, i, a) => a.indexOf(v) === i);
            hostnamesArr.forEach(hostname => {
                browser.cookies.getAll({domain: hostname}, function(cookies) {
                    cookies.forEach((cookie) => {
                        browser.cookies.remove({ url: "http" + (cookie.secure ? "s" : "") + "://" + cookie.domain + cookie.path, name: cookie.name });
                    })
                });
            });
        }
    });
    cookiesThirdPartiessClearBtn.append(' - DONE');

    updateAllCookies();
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
        browser.cookies.remove({ url: "http" + (cookie.secure ? "s" : "") + "://" + cookie.domain + cookie.path, name: cookie.name });
    });
    cookiesAllClearBtn.append(' - DONE');
    updateAllCookies()
});



// History
const historyCurrentDomainClearBtn = document.getElementsByClassName('js-history-clear-current-domain-btn')[0];
const historyAllClearBtn = document.getElementsByClassName('js-history-clear-all-btn')[0];
const historyForPastTenMinutesClearBtn = document.getElementsByClassName('js-history-clear-past-ten-minutes-btn')[0];

historyCurrentDomainClearBtn.addEventListener('click', () => {
    console.log('historyCurrentDomainClearBtn');
    browser.history.search({text: currentPageDomain}).then((history) => {
        console.log('history currentPageDomain', history);
        history.forEach(historyItem => {
            browser.history.deleteUrl({url: historyItem.url}, () => {});
        });
        historyCurrentDomainClearBtn.append(' - DONE');
    });
});
historyAllClearBtn.addEventListener('click', () => {
    console.log('historyAllClearBtn');
    browser.browsingData.removeHistory({});
    historyAllClearBtn.append(' - DONE');
});
historyForPastTenMinutesClearBtn.addEventListener('click', () => {
    console.log('historyForPastTenMinutesRemoveBtn');
    browser.browsingData.removeHistory({since: new Date(Date.now() - 600000).getTime()}, () => {});
    historyForPastTenMinutesClearBtn.append(' - DONE');
});


// Downloads
// const downloadsCurrentDomainClearBtn = document.getElementsByClassName('js-downloads-clear-current-domain-btn')[0];
const downloadsAllClearBtn = document.getElementsByClassName('js-downloads-clear-all-btn')[0];
const downloadsForPastTenMinutesClearBtn = document.getElementsByClassName('js-downloads-clear-past-ten-minutes-btn')[0];
// downloadsCurrentDomainClearBtn.addEventListener('click', () => {
//     console.log('downloadsCurrentDomainClearBtn');
//     browser.downloads.search({query: [currentPageDomain]}, (downloads) => {
//         downloads.forEach(downloadsItem => {
//             if (downloadsItem.exists) {
//                 browser.downloads.erase(downloadsItem.id, () => {});
//             }
//         });
//         downloadsCurrentDomainClearBtn.append(' - DONE');
//     });
// });
downloadsAllClearBtn.addEventListener('click', () => {
    console.log('downloadsAllClearBtn');
    browser.downloads.erase({limit: 10}).then(() => {
        downloadsAllClearBtn.append(' - DONE');
    });
});
downloadsForPastTenMinutesClearBtn.addEventListener('click', () => {
    console.log('downloadsForPastTenMinutesRemoveBtn');
    browser.downloads.erase({endedAfter: new Date(Date.now() - 600000).getTime()}).then(() => {
        downloadsForPastTenMinutesClearBtn.append(' - DONE');
    });
});





onMessage(message => {
    console.log('received message: ', message);
    if (message.type === 'GetAllCookiesFromContent') {
        console.log('+++ cookie', message.payload);

        if (message.payload) { // TODO => edge does not show document.cookie when it's more then 3 requests in a row. That's why I added condition. It's not fo real code!! This works weird
            cookiesFromCurrentSite = message.payload.split('; ').map(cookie => {
                return {
                    name: cookie.slice(0, cookie.indexOf('=')),
                    value: cookie.slice(cookie.indexOf('=') + 1, cookie.length),
                }
            });
        }
    }
});



