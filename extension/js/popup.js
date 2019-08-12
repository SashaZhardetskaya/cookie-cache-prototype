
var currentPageDomain = '';
var cookiesFromCurrentSite = [];
var allCookies = [];


chrome.cookies.getAllCookieStores((stores) => {
    chrome.cookies.getAll({storeId: stores[0].id}, function(cookies) {
        allCookies = cookies;
        console.log('cookies for storeId', cookies);
        // for(var i=0; i<cookies.length;i++) {
        //     // chrome.cookies.remove({url: "http://domain.com" + cookies[i].path, name: cookies[i].name});
        // }
    });
});



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
        currentPageDomain = new URL(tab.url).hostname.replace(/(https?:\/\/)?(www.)?/i, '');
        cookieDomain.innerHTML = currentPageDomain;
        cookiesByDomainShowBtn.innerText = cookiesByDomainShowBtn.innerText + ` ${currentPageDomain}`;
    });
});


const cookieDomain = document.getElementsByClassName('js-cookies-test')[0];
cookieDomain.addEventListener('click', () => {
    console.log('************** cookieDomain click');
});


// cookies By Domain
const cookiesByDomainShowBtn = document.getElementsByClassName('js-cookies-show-by-domain-btn')[0];
const cookiesByDomainList = document.getElementsByClassName('js-cookies-show-by-domain-list')[0];
cookiesByDomainShowBtn.addEventListener('click', () => {
    cookiesByDomainList.innerHTML = '';
    chrome.cookies.getAll({domain: currentPageDomain}, function(cookies) {
        cookies.forEach((cookie) => {
            const cookieItem = document.createElement('li');
            cookieItem.innerHTML = `${cookie.name} : ${cookie.value}`;
            cookiesByDomainList.appendChild(cookieItem);
        })
        // chrome.cookies.remove({url: "http://domain.com" + cookies[i].path, name: cookies[i].name});
    });
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
        // cookieItem.innerHTML = cookie;
        cookiesOnCurrentSiteList.appendChild(cookieItem);
    })
});
cookiesOnCurrentSiteClearBtn.addEventListener('click', () => {
    const expandedCookieFromSite = allCookies.filter((cookieItem) => {
        for (let i=0; i < cookiesFromCurrentSite.length; i++) {
            if (cookiesFromCurrentSite[i].name === cookieItem.name && cookiesFromCurrentSite[i].value === cookieItem.value) {
                return true;
            }
            // chrome.cookies.remove({url: "http://domain.com" + cookies[i].path, name: cookies[i].name});
        }
        // cookiesFromCurrentSite.forEach((item) => {
        //     if (item.name === cookieItem.name
        // })
    });
    expandedCookieFromSite.forEach(cookie => {
        chrome.cookies.remove({ url: "http" + (cookie.secure ? "s" : "") + "://" + cookie.domain + cookie.path, name: cookie.name });
        // chrome.cookies.remove({url: cookie.domain + cookie.path, name: cookie.name});
    });
    console.log('expandedCookieFromSite', expandedCookieFromSite);
    sendMessageToAllTabs({type: 'EraseAllCookiesFromContent'});
    cookiesOnCurrentSiteClearBtn.innerHTML = 'DONE'

});


// triggers every time popup is init
window.onload = function() {
    console.log("onload" + Date())
};


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
    if (message.type === 'EraseAllCookiesFromContent') {
        cookiesFromCurrentSite = message.payload.split('; ').map(cookie => {
            return {
                name: cookie.slice(0, cookie.indexOf('=')),
                value: cookie.slice(cookie.indexOf('=') + 1, cookie.length),
            }
        });
    }
});

