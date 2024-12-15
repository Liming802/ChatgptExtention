const imagesDictionary = {
  1: {
      src: chrome.runtime.getURL('1.png'),
      text: 'This ChatGPT query is estimated to use about 0.3 watt-hours of electricity, which is one CR1632 button battery capacity.'
  },
  2: {
      src: chrome.runtime.getURL('2.png'),
      text: 'This response will emit 0.3g of carbon dioxide, enough to fill a balloon with a diameter of 6cm.'
  },
  3: {
      src: chrome.runtime.getURL('3.png'),
      text: 'This operation requires about 720 joules of energy, and the database cooling consumes 172.7 grams of water.'
  }
};

let counter = 0;

function createFullScreenImage() {
  const image = document.createElement('img');
  image.src = imagesDictionary[counter].src;  // 从字典中取当前图片
  image.onload = () => {
    const imageWidth = image.width;  // 获取图片的原始宽度
    const imageHeight = image.height;  // 获取图片的原始高度
    const randomTop =  Math.random() * (900 - imageHeight)-100;  
    const randomLeft = Math.random() * (1000- imageWidth)-200; 
    image.style.position = 'absolute';  // 使用绝对定位
    image.style.top = `${randomTop}px`;  // 设置随机的纵向位置
    image.style.left = `${randomLeft}px`;  // 设置随机的横向位置
    image.style.zIndex = '-1';  // 确保图片在页面的最上层
  };

  return image;
}


function modifyDOM() {
  counter = counter === 3 ? 1 : counter + 1;
  const elementsWithDataTestId = document.querySelectorAll('[data-testid^="conversation-turn-"]');
  const elementsWithNumbers = [];
  elementsWithDataTestId.forEach(element => {
      const dataTestId = element.getAttribute('data-testid');
      if (dataTestId && dataTestId.startsWith('conversation-turn-')) {
          const number = parseInt(dataTestId.replace('conversation-turn-', ''), 10);
          if (!isNaN(number)) {
              elementsWithNumbers.push({ element, number });
          }
      }
  });

  elementsWithNumbers.sort((a, b) => b.number - a.number);
  const top10Elements = elementsWithNumbers.slice(0, 2);

  top10Elements.forEach(({ element }) => {    
      const paragraphs = element.querySelectorAll('p');
      paragraphs.forEach(paragraph => {
          const parent = paragraph.parentElement;
          if (
              parent &&
              parent.tagName === 'DIV' &&
              !parent.hasAttribute('data-modified') 
          ) {
              const requiredClass = "markdown prose w-full break-words dark:prose-invert light";
              const hasAllClasses = requiredClass.split(' ').every(cls =>
              parent.classList.contains(cls)
              );

              if (hasAllClasses) {
                  const fullScreenImage = createFullScreenImage();  // 获取当前图片
                  const newParagraph = document.createElement('p');
                  newParagraph.textContent = imagesDictionary[counter].text;  // 获取当前文字
                  newParagraph.style.color = "darkred";  // 设置为深灰色
                  newParagraph.style.fontStyle = "italic"; 

                  if (parent) {
                      const firstP = parent.querySelector('p');
                      if (firstP) {
                          document.body.appendChild(fullScreenImage);
                          parent.insertBefore(fullScreenImage, firstP); // 插入图片
                          parent.insertBefore(newParagraph, firstP); // 插入文字
                          parent.setAttribute('data-modified', 'true'); 
                      }
                  }
              }
          }
      });

      const divElements = element.querySelectorAll('div.whitespace-pre-wrap');
      divElements.forEach(div => {
          if (div && !div.hasAttribute('data-modified')) {
              div.setAttribute('data-modified', 'true');
              div.textContent = `Analyse: ${div.textContent}`;
              console.log('修改内容为:', div.textContent);
          }
      });
  });
}

  function createBatteryIcon() {
    const batteryIcon = document.createElement('span');
    batteryIcon.setAttribute('data-battery', 'true'); 
    batteryIcon.setAttribute('data-percentage', '15'); 
    batteryIcon.style.cssText = `
        display: inline-block;
        width: 40px;
        height: 15px;
        background-color: #54534d;
        border-radius: 5px;
        margin-right: 10px;
        border: 1px solid #54534d;
        position: relative;
        top: 0;
        left: 0;
    `;
    const batteryCharge = document.createElement('div');
    batteryCharge.style.cssText = `
        width: 80%; /* 默认填充满电 */
        height: 100%;
        background-color: #fff;
        border-radius: 5px;
    `;
    batteryIcon.appendChild(batteryCharge);

    return batteryIcon;
}

function addPluginStatusIndicator() {
  if (document.getElementById('plugin-status')) return;

  const status = document.createElement('div');
  status.id = 'plugin-status';
  status.innerText = 'Plugin is Active';
  status.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      background-color: rgba(0, 0, 0, 0.7);
      color: white;
      padding: 10px;
      border-radius: 5px;
      z-index: 1000;
      cursor: pointer;
  `;

  // 创建折线图容器
  const chartContainer = document.createElement('div');
  chartContainer.id = 'line-chart-container';
  chartContainer.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 80%;
      height: 60%;
      background-color: white;
      border: 1px solid #ccc;
      border-radius: 10px;
      display: none; /* 初始状态隐藏 */
      z-index: 1001;
      padding: 20px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  `;

  // 添加折线图绘制内容
  const canvas = document.createElement('canvas');
  canvas.id = 'line-chart';
  canvas.width = 800;
  canvas.height = 400;
  chartContainer.appendChild(canvas);

  document.body.appendChild(chartContainer);

  // 点击状态按钮显示/隐藏折线图
  status.addEventListener('click', () => {
      const isChartVisible = chartContainer.style.display === 'block';
      chartContainer.style.display = isChartVisible ? 'none' : 'block';
  });

  // 点击空白处关闭折线图
  document.addEventListener('click', (event) => {
      if (
          chartContainer.style.display === 'block' &&
          !chartContainer.contains(event.target) &&
          event.target !== status
      ) {
          chartContainer.style.display = 'none';
      }
  });

  document.body.appendChild(status);

  // 绘制折线图
  drawSimpleLineChart();
}

function drawSimpleLineChart() {
  const canvas = document.getElementById('line-chart');
  const ctx = canvas.getContext('2d');

  // 模拟数据
  const data = [10, 30, 20, 50, 40, 60, 70];
  const labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'];

  // 计算图表尺寸
  const chartWidth = canvas.width - 40; // 两侧留白
  const chartHeight = canvas.height - 40; // 上下留白
  const originX = 20;
  const originY = canvas.height - 20;

  // 绘制轴线
  ctx.beginPath();
  ctx.moveTo(originX, originY);
  ctx.lineTo(originX, originY - chartHeight); // Y轴
  ctx.lineTo(originX + chartWidth, originY); // X轴
  ctx.strokeStyle = '#000';
  ctx.stroke();

  // 绘制数据线
  const maxValue = Math.max(...data);
  const stepX = chartWidth / (data.length - 1); // X轴步长
  const scaleY = chartHeight / maxValue; // Y轴比例

  ctx.beginPath();
  ctx.strokeStyle = '#007BFF';
  ctx.lineWidth = 2;

  data.forEach((value, index) => {
      const x = originX + index * stepX;
      const y = originY - value * scaleY;

      if (index === 0) {
          ctx.moveTo(x, y);
      } else {
          ctx.lineTo(x, y);
      }

      // 绘制数据点
      ctx.arc(x, y, 3, 0, Math.PI * 2, true);
      ctx.fillStyle = '#007BFF';
      ctx.fill();
  });

  ctx.stroke();

  // 绘制标签
  ctx.fillStyle = '#000';
  ctx.font = '12px Arial';
  labels.forEach((label, index) => {
      const x = originX + index * stepX;
      const y = originY + 15; // X轴下方留出空间
      ctx.fillText(label, x - 10, y);
  });
}

// 初始化
addPluginStatusIndicator();


  function observeDOM() {
      let timeout; // 防止快速重复触发
      const observer = new MutationObserver(() => {
          clearTimeout(timeout);
          timeout = setTimeout(() => {
              modifyDOM();
          }, 100); // 延迟触发，避免频繁调用
      });

      observer.observe(document.body, { childList: true, subtree: true });
  }

  function init() {
      addPluginStatusIndicator();
      modifyDOM();
      observeDOM();
  }

  init(); 
