
const sendMessageGlobal = (message) => {
    chrome.runtime.sendMessage(message);
};

function eraseCookie(name) {
    document.cookie = name + '=; Max-Age=0'
}

chrome.runtime.onMessage.addListener((message, sender) => {
    console.log('message', message);
    console.log('sender', sender);

    if (message.type === 'GetAllCookiesFromContent') {
        console.log(document.cookie);
        sendMessageGlobal({type: 'GetAllCookiesFromContent', payload: document.cookie})
    }

    if (message.type === 'EraseAllCookiesFromContent') {
        console.log('before erase', document.cookie);
        document.cookie.split('; ').forEach(name => {
            console.log('name', name);
            eraseCookie(name)
        });
        console.log('after erase', document.cookie);

        sendMessageGlobal({type: 'EraseAllCookiesFromContent', payload: document.cookie})
    }

});

// sendMessageGlobal({type: 'GetPageDomain', payload: this.document.location.host});





