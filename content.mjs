async function fetchAPI(textContent) {
  const serverUrl = 'http://localhost:3000/proxy-prediction';  // 代理服务器 URL

  const requestPayload = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ textContent })  // 传递文本内容
  };

  try {
    const response = await fetch(serverUrl, requestPayload);  // 发送到 Express 代理服务器
    const data = await response.json();
    return data.response || "hello";  
  } catch (error) {
    console.error("Error with proxy server:", error);
    return "hello";  
  }
}

function modifyDOM() {
  const elementsWithDataTestId = document.querySelectorAll('[data-testid^="conversation-turn-"]');
  const elementsWithNumbers = [];
  elementsWithDataTestId.forEach(element => {
      const dataTestId = element.getAttribute('data-testid');
      const number = parseInt(dataTestId.replace('conversation-turn-', ''), 2);
      if (!isNaN(number)) {
          elementsWithNumbers.push({ element, number });
      }
  });

  elementsWithNumbers.sort((a, b) => b.number - a.number);
  const top2Elements = elementsWithNumbers.slice(0, 2);  // Change to slice(0, 2) to get top 2 elements

  top2Elements.forEach(({ element }) => {
    const divElements = element.querySelectorAll('div.whitespace-pre-wrap');
    divElements.forEach(div => {
        if (!div.hasAttribute('data-notified')) {
            div.setAttribute('data-notified', 'true');
            const textContentToSend = div.textContent;
            fetchAPI(textContentToSend).then(apiResponse => {
                // Update the newParagraph textContent based on the API response
                const newParagraph = document.createElement('p');
                newParagraph.textContent = apiResponse; // Use the API response
                const batteryIcon = createBatteryIcon();
                const paragraphs = element.querySelectorAll('p');
                paragraphs.forEach(paragraph => {
                    const parent = paragraph.parentElement;
                    if (parent && parent.tagName === 'DIV' && !parent.hasAttribute('data-modified')) {
                        const requiredClass = "markdown prose w-full break-words dark:prose-invert light";
                        const hasAllClasses = requiredClass.split(' ').every(cls => parent.classList.contains(cls));
                        if (hasAllClasses) {
                            parent.setAttribute('data-modified', 'true'); 
                            const firstP = parent.querySelector('p');
                            if (firstP) {
                                parent.insertBefore(batteryIcon, firstP);
                                parent.insertBefore(newParagraph, firstP);
                            }
                        }
                    }
                });
            });
        }
    });
  });
}

function createBatteryIcon() {
  const batteryIcon = document.createElement('span');
  batteryIcon.style.display = 'inline-block';
  batteryIcon.style.width = '30px';
  batteryIcon.style.height = '10px';
  batteryIcon.style.backgroundColor = '#54534d'; // 电池的绿色
  batteryIcon.style.borderRadius = '3px'; // 圆角边缘
  batteryIcon.style.marginRight = '10px'; // 电池图标和文本之间的间隔
  batteryIcon.style.border = '1px solid #54534d'; // 浅绿色边缘
  batteryIcon.style.position = 'relative'; // 允许定位
  batteryIcon.style.top = '-10px'; 
  batteryIcon.style.left = '-80px'; 

  const batteryCharge = document.createElement('div');
  batteryCharge.style.width = '60%'; 
  batteryCharge.style.height = '100%';
  batteryCharge.style.backgroundColor = '#fff'; // 电量的颜色
  batteryCharge.style.borderRadius = '5px 0 0 5px'; // 圆角效果
  batteryIcon.appendChild(batteryCharge);

  return batteryIcon;
}


function addPluginStatusIndicator() {
    if (document.getElementById('plugin-status')) return;
  
    const status = document.createElement('div');
    status.id = 'plugin-status';
    status.innerText = 'Plugin is Active, click to reset';
    status.style.position = 'fixed';
    status.style.bottom = '20px';
    status.style.right = '20px';
    status.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
    status.style.color = 'white';
    status.style.padding = '10px';
    status.style.borderRadius = '5px';
    status.style.zIndex = '1000';

    status.addEventListener('click', () => {
      localStorage.removeItem('modifiedElements');
      alert('Recetted');
  });

    document.body.appendChild(status);
  }
  
  function observeDOM() {
    const observer = new MutationObserver(() => {
      modifyDOM(); // 每当检测到 DOM 变化时调用
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }
  
  // 初始化
  function init() {
    addPluginStatusIndicator(); // 添加状态指示元素
    modifyDOM();                // 初次加载时修改现有 DOM
    observeDOM();               // 开始监听 DOM 变化
  }
  
  init(); // 运行初始化函数
  
// 创建 MutationObserver 来监听DOM的变化
const observer = new MutationObserver(() => {
const button = document.querySelector('[data-testid="send-button"]');
const textarea = document.getElementById('prompt-textarea');

  // 确保按钮和输入框都存在
  if (button && textarea) {
    // 给按钮添加点击事件监听
    button.addEventListener('click', function() {
      const content = getSmallestParagraph(textarea);
      console.log('Content sent via button click:', content);
    });
    observer.disconnect();  
  }
});

// 开始监听DOM的变化
observer.observe(document.body, {
  childList: true,
  subtree: true
});
