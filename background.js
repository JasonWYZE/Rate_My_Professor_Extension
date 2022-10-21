
    chrome.runtime.onMessage.addListener(function (url, sender, sendResponse) {
        fetch(url).then((res) => res.json().then((json) => sendResponse(json)));

    // fetch(url).then(r => r.json())
    // .then(json => sendResponse(json.Content));
   
    
    return true;
});
