
const sendMessageGlobal = (message) => {
    browser.runtime.sendMessage(message);
};

browser.runtime.onMessage.addListener((message, sender) => {
    // console.log('message', message);

    if (message.type === 'GetAllCookiesFromContent') {
        console.log('document.cookie: ', document.cookie);
        if (document.cookie) { // TODO => edge does not show document.cookie when it's more then 3 requests in a row. That's why I added condition. It's not fo real code!! This works weird
            sendMessageGlobal({type: 'GetAllCookiesFromContent', payload: document.cookie})
        }
    }

});



// caches.open('v1').then(function(cache) {
//     return cache.add(
//         'https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/browsingData/RemovalOptions'
//     );
// })


// caches.keys().then(function(keys) {
//     console.log('keys2', keys);
//     keys.forEach(function(request, index, array) {
//         console.log('request, index, array', request, index, array);
//     });
// });

// sendMessageGlobal({type: 'GetPageDomain', payload: this.document.location.host});





