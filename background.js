chrome.runtime.onMessage.addListener(function (url, sender, sendResponse) {
    fetch(url).then((res) => {
      res.json().then((json) => sendResponse(json));
    });

    return true;

//   console.log(
//     sender.tab
//       ? "from a content script:" + sender.tab.url
//       : "from the extension"
//   );
//   if (request.greeting === "hello") sendResponse({ farewell: "goodbye" });
//   else{
//     sendResponse({ farewell: "something" })
//   }

});
