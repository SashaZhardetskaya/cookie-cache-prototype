
const sendMessageGlobal = (message) => {
    browser.runtime.sendMessage(message);
};

browser.runtime.onMessage.addListener((message, sender) => {
    // console.log('message', message);

    if (message.type === 'GetAllCookiesFromContent') {
        console.log(document.cookie);
        sendMessageGlobal({type: 'GetAllCookiesFromContent', payload: document.cookie})
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





