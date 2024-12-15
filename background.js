
chrome.action.onClicked.addListener((tab) => {
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    files: ["dist/content.bundle.js"]
  }).then(() => {
    console.log("Content script injected/reloaded successfully.");
  }).catch((error) => {
    console.error("Script injection failed: ", error);
  });
});

// chrome.debugger.attach({ }, "1.0", function() {
//   chrome.debugger.sendCommand({ tabId: tab.id }, "Network.enable", {}, function() {
//     chrome.debugger.onEvent.addListener(function(debuggeeId, message, params) {
//       if (message === "Network.requestWillBeSent") {
//         const request = params.request;
//         if (request.url.includes("https://chatgpt.com/backend-api/lat/r")) {
//           console.log("Intercepted Request:", request);
//         }
//       }
//     });
//   });
// });



// chrome.webRequest.onCompleted.addListener(
//   function(details) {
//     if (details.url.includes('https://chatgpt.com/backend-api/lat/r')) {
//       console.log("Intercepted API response for:", details.url);

//       // 注入 content script 以便捕获页面的响应
//       chrome.scripting.executeScript({
//         target: { tabId: details.tabId },
//         func: captureApiResponse,
//       });
//     }
//   },
//   { urls: ["https://chatgpt.com/backend-api/lat/r"] }
// );

// // 定义一个 content script 函数来捕获响应
// function captureApiResponse() {
//   // 假设你已经从某个地方（如 payload 或 storage）获取到了 token
//   const token = 'your_access_token_here'; // 替换为实际的 token

//   fetch('https://chatgpt.com/backend-api/lat/r', {
//     method: 'POST',  // 使用 POST 请求
//     headers: {
//       'Content-Type': 'application/json',  // 设置头部
//       'Authorization': `Bearer ${token}`,  // 使用 Bearer token 来授权
//     },
//     body: JSON.stringify({
//       // 根据实际的请求体数据构建 Payload
//       key1: 'value1',
//       key2: 'value2',
//     })
//   })
//   .then(response => response.json())
//   .then(data => {
//     console.log("Captured API Data:", data);  // 输出捕获的数据
//   })
//   .catch(error => console.error("Error fetching API response:", error));  // 捕获错误并输出
// }


