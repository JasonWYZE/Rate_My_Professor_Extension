
    chrome.runtime.onMessage.addListener(function (url, sender, sendResponse) {
    fetch(url).then((res) => res.json().then((json) => sendResponse(json)));
    
    return true;
});
