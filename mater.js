import { Engine, Render, Runner, Bodies, World } from 'matter-js';

// 创建物理引擎
const engine = Engine.create();
const world = engine.world;
let imageDropped = false; 
let dropMode = false;

const imagesDictionary = {
  1: {
    src: chrome.runtime.getURL('1.png'),
    text: 'This ChatGPT query is estimated to use about 0.3 watt-hours of electricity, which is one CR1632 button battery capacity.',
    mass: 0.2
  },
  2: {
    src: chrome.runtime.getURL('2.png'),
    text: 'This response will emit 0.3g of carbon dioxide, enough to fill a balloon with a diameter of 6cm.',
    mass: 0.1
  },
  3: {
    src: chrome.runtime.getURL('3.png'),
    text: 'This operation requires about 720 joules of energy, and the database cooling consumes 172.7 grams of water.',
    mass: 0.3
  },
  4: {
    src: chrome.runtime.getURL('4.png'),
    text: 'This ChatGPT query is estimated to use about 0.5 watt-hours of electricity, would allow the electric vehicle travel approximately 1.5 meters.',
    mass:3
  },
  5: {
    src: chrome.runtime.getURL('5.png'),
    text: 'This response will emit 0.3g of carbon dioxide, enough to fill a balloon with a diameter of 6cm.',
    mass: 3
  },
  6: {
    src: chrome.runtime.getURL('6.png'),
    text: 'This operation requires about 720 joules of energy, and the database cooling consumes 172.7 grams of water.',
    mass: 4
  },
};

let counter = 1;  // 初始选择第一张图片
const container = document.createElement('div');
container.style.position = 'fixed';
container.style.top = '0';
container.style.left = '0';
container.style.width = '100vw'; // 视口宽度
container.style.height = '100vh'; // 视口高度
container.style.zIndex = '0'; // 保证在页面最上层
container.style.overflow = 'hidden'; // 避免内容溢出
container.style.pointerEvents = 'none'; // 禁止容器捕获鼠标事件
document.body.appendChild(container);

const render = Render.create({
  element: container,
  engine: engine,
  options: {
    width: window.innerWidth,
    height: window.innerHeight,
    background: 'transparent', // 设置为透明背景
    wireframes: false, // 禁用线框模式
  },
});
Render.run(render);
const runner = Runner.create();
Runner.run(runner, engine);

// 创建地面和墙壁
const ground1 = Bodies.rectangle(window.innerWidth / 2 + 130, window.innerHeight, window.innerWidth / 2 - 50, 250, {
  isStatic: true,
  render: { fillStyle: 'rgba(0, 0, 0, 0)' }
});
const ground2 = Bodies.rectangle(window.innerWidth / 2, window.innerHeight, window.innerWidth, 10, {
  isStatic: true,
  render: { fillStyle: 'rgba(0, 0, 0, 0)' }
});
World.add(world, ground1);
World.add(world, ground2);

// 创建墙壁
const leftWall = Bodies.rectangle(0, window.innerHeight / 2, 500, window.innerHeight, {
  isStatic: true,
  render: { fillStyle: 'rgba(0, 0, 0, 0)' }
});
const rightWall = Bodies.rectangle(window.innerWidth, window.innerHeight / 2, 200, window.innerHeight, {
  isStatic: true,
  render: { fillStyle: 'rgba(0, 0, 0, 0)' }
});
World.add(world, leftWall);
World.add(world, rightWall);

// 创建掉落的图片
function createFallingImage() {
  const { src, mass, text } = imagesDictionary[counter];

  // 创建 HTML 图片元素
  const img = new Image();
  img.src = src;

  img.onload = () => {
    const imgWidth = img.width/1.2;
    const imgHeight = img.height/1.2;
    // 创建物理世界中的图片对象
    const body = Bodies.rectangle(
      Math.random() * (window.innerWidth - 200 - 500) + 500, // Random X coordinate between leftWall and rightWall
      -imgHeight / 2, 
      imgWidth / 2,
      imgHeight,
      {
        render: {
          sprite: {
            texture: src,
            xScale: 0.8,
            yScale: 0.8,
          },
        },
        mass: mass,
        friction: 0.05,  // Reduces friction to allow smoother sliding
        restitution: 0.8,
      }
    );
    World.add(world, body);

    // 创建提示框
    const tooltip = document.createElement('div');
    tooltip.style.position = 'fixed';
    tooltip.style.background = 'rgba(0, 0, 0, 0.8)';
    tooltip.style.color = 'white';
    tooltip.style.padding = '5px';
    tooltip.style.borderRadius = '5px';
    tooltip.style.pointerEvents = 'none';
    tooltip.style.zIndex = '9999';
    tooltip.style.display = 'none';
    document.body.appendChild(tooltip);

    // 监听鼠标移动事件
    document.addEventListener('mousemove', (event) => {
      const mouseX = event.clientX;
      const mouseY = event.clientY;

      // 计算鼠标与物体的距离
      const distance = Math.sqrt(
        Math.pow(mouseX - body.position.x, 2) + Math.pow(mouseY - body.position.y, 2)
      );

      // 如果鼠标距离物体小于一定阈值（30），显示提示框
      if (distance < 30) {
        tooltip.textContent = text;  // 显示相应的文字
        tooltip.style.left = `${mouseX + 10}px`;  // 设置tooltip的位置
        tooltip.style.top = `${mouseY + 10}px`;
        tooltip.style.display = 'block';  // 显示tooltip
      } else {
        tooltip.style.display = 'none';  // 鼠标移出物体，隐藏tooltip
      }
    });
  };

  counter = counter < 6 ? counter + 1 : 1;  
}


function modifyDOM() {
  const elementsWithDataTestId = document.querySelectorAll('[data-testid^="conversation-turn-"]');
  const elementsWithNumbers = [];
  elementsWithDataTestId.forEach((element) => {
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
    paragraphs.forEach((paragraph) => {
      const parent = paragraph.parentElement;
      if (
        parent &&
        parent.tagName === 'DIV' &&
        !parent.hasAttribute('data-modified') 
      ) {
        const requiredClass = 'markdown prose w-full break-words dark:prose-invert light';
        const hasAllClasses = requiredClass.split(' ').every((cls) =>
          parent.classList.contains(cls)
        );

        if (hasAllClasses) {
          const newParagraph = document.createElement('p');
          if (dropMode===false){
          newParagraph.textContent = imagesDictionary[counter].text; // 获取当前文字
          newParagraph.style.color = 'darkred'; // 设置为深灰色
          newParagraph.style.fontStyle = 'italic';}
          if (parent) {
            parent.insertBefore(newParagraph, parent.firstChild); 
            if(imageDropped&&dropMode){
            createFallingImage()};
            parent.setAttribute('data-modified', 'true');
            imageDropped = false;
          }
        }
      }
    });

    const divElements = element.querySelectorAll('div.whitespace-pre-wrap');
    divElements.forEach((div) => {
      if (div && !div.hasAttribute('data-modified')) {
        div.setAttribute('data-modified', 'true');
        div.textContent = `Analyse: ${div.textContent}`;
        const timestamp = getFormattedTime();
        const logs = JSON.parse(localStorage.getItem('textLogs')) || [];
        logs.push({ timestamp, textContent: div.textContent });
        localStorage.setItem('textLogs', JSON.stringify(logs));
        imageDropped = true;
        const storedLogs = JSON.parse(localStorage.getItem('textLogs'));
        console.log('所有修改日志:', storedLogs);
      }
    });
  });
}


function getFormattedTime() {
  const now = new Date();
  return `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')} ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
}


function addPluginStatusIndicator() {
  if (document.getElementById('plugin-status')) return;

  const status = document.createElement('div');
  status.id = 'plugin-status';
  status.innerText = 'Data graph';
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
      width: 65%;
      height: 80%;
      background-color: black;
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
  canvas.width = 930;
  canvas.height = 500;
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

function getLogsPerDay() {
  const logs = JSON.parse(localStorage.getItem('textLogs')) || [];
  const dailyData = {};

  logs.forEach(log => {
    const date = log.timestamp.split(' ')[0]; // 提取日期部分（YYYY-MM-DD）
    dailyData[date] = (dailyData[date] || 0) + 1;
  });

  return dailyData;
}

function getLogsPerHour() {
  const logs = JSON.parse(localStorage.getItem('textLogs')) || [];
  const hourlyData = Array(24).fill(0); // 初始化为 0 的数组，长度为 24（代表 0 到 23 点）

  logs.forEach(log => {
    const hour = new Date(log.timestamp).getHours(); // 获取小时
    hourlyData[hour] += 1; // 累加该小时的数据
  });

  console.log(hourlyData); // 输出 hourlyData，查看是否正确
  return hourlyData;
}

function drawSimpleLineChart() {
  const canvas = document.getElementById('line-chart');
  const ctx = canvas.getContext('2d');
  const hourlyData = getLogsPerHour(); // Get hourly data for today
  const hours = Array.from({ length: 24 }, (_, i) => i); // Create an array of hours (0-23)

  // Filter out zero data points and corresponding hours
  const filteredData = hours.filter(hour => hourlyData[hour] > 0);
  const data = filteredData.map(hour => hourlyData[hour]); // Data points for hours with data

  // Ensure we have a maximum of 10 data points
  const maxDataPoints = 10;
  if (filteredData.length > maxDataPoints) {
    const step = Math.floor(filteredData.length / maxDataPoints);
    filteredData.splice(0, filteredData.length - maxDataPoints); // Adjust the number of hours to display
    data.splice(0, data.length - maxDataPoints);
  }

  const chartWidth = canvas.width; // Padding on both sides (more space for Y labels)
  const chartHeight = canvas.height - 60; // Padding on top and bottom
  const originX = 40; // Slightly adjust X origin to make space for Y labels
  const originY = canvas.height - 40;

  // Clear the canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Set background color to black
  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Draw X and Y axes
  ctx.beginPath();
  ctx.moveTo(originX, originY - chartHeight);
  ctx.lineTo(originX, originY); // Y axis
  ctx.lineTo(originX + chartWidth, originY); // X axis
  ctx.strokeStyle = 'white';
  ctx.stroke();

  // Y axis scale and step size
  const maxValue = Math.max(...data, 1); // Ensure maximum value is at least 1
  const yStepCount = 5; // Number of steps on Y axis
  const yStep = chartHeight / yStepCount;
  const scaleY = chartHeight / maxValue; // Y-axis scaling factor

  // Draw Y axis labels and grid lines
  for (let i = 0; i <= yStepCount; i++) {
    const y = originY - i * yStep;
    ctx.beginPath();
    ctx.moveTo(originX - 10, y);
    ctx.lineTo(originX, y);
    ctx.strokeStyle = 'white';
    ctx.stroke();
    ctx.fillText(Math.round(i * maxValue / yStepCount), originX - 30, y + 4); // Y labels
  }

  // Draw the data points (larger points)
  ctx.fillStyle = 'gold';
  filteredData.forEach((hour, index) => {
    const x = originX + (index * chartWidth) / (filteredData.length - 1);
    const y = originY - data[index] * scaleY;
    ctx.beginPath();
    ctx.arc(x, y, 8, 0, Math.PI * 2, true); // Increased size of data points (radius 8)
    ctx.fill();

    // Draw the quantity next to each data point
    ctx.fillStyle = 'white';
    ctx.font = '12px Arial';
    ctx.fillText(data[index], x + 10, y); // Positioning text to the right of the point
  });

  // Draw X axis labels (only for hours with data)
  ctx.fillStyle = 'white';
  ctx.font = '12px Arial';
  filteredData.forEach((hour, index) => {
    const x = originX + (index * chartWidth) / (filteredData.length - 1);
    const y = originY + 15; // Positioning text below the axis
    ctx.fillText(hour, x - 10, y);
  });

  // Add statistics (Today and Total) at the top-right corner
  const todayTotal = data.reduce((sum, count) => sum + count, 0);
  const totalData = Object.values(getLogsPerDay()).reduce((sum, count) => sum + count, 0);

  ctx.fillStyle = 'white';
  ctx.font = '14px Arial';
  ctx.textAlign = 'right';
  ctx.fillText(`Today: ${todayTotal} times`, canvas.width, 20);
  ctx.fillText(`Total: You have used Chatgpt for ${totalData} times, Equivalent to ${totalData*0.3} watt-hours `, canvas.width, 40);
}





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
// 创建按钮元素
const toggleButton = document.createElement('button');
toggleButton.textContent = 'Toggle Drop'; // 按钮文字
toggleButton.style.position = 'fixed';
toggleButton.style.bottom = '80px';
toggleButton.style.right = '20px';
toggleButton.style.width = '120px';
toggleButton.style.height = '40px';
toggleButton.style.border = 'none';
toggleButton.style.borderRadius = '5px';
toggleButton.style.cursor = 'pointer';
toggleButton.style.backgroundColor = 'green'; // 初始为绿色
toggleButton.style.color = 'white';
toggleButton.style.fontSize = '16px';
toggleButton.style.zIndex = '1000'; // 确保按钮在最上层

// 按钮点击事件
toggleButton.addEventListener('click', () => {
  dropMode= !dropMode; // 切换状态
  if (dropMode) {
    toggleButton.style.backgroundColor = 'green'; // 状态为 true 时，绿色
    toggleButton.textContent = 'DropMode On';
  } else {
    toggleButton.style.backgroundColor = 'gray'; // 状态为 false 时，灰色
    toggleButton.textContent = 'DropMode Off';
  }
  console.log('imageDropped:', dropMode); // 控制台打印状态
});

document.body.appendChild(toggleButton);

