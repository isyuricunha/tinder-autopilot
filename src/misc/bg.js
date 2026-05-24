chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (!request || !request.url) {
    sendResponse([null, { message: 'Missing request URL' }]);
    return false;
  }

  fetch(request.url, request.options).then(
    function (response) {
      return response.text().then(function (text) {
        sendResponse([
          {
            body: text,
            status: response.status,
            statusText: response.statusText
          },
          null
        ]);
      });
    },
    function (error) {
      sendResponse([null, { message: error && error.message ? error.message : String(error) }]);
    }
  );
  return true;
});
