import { Engine, Render, Runner, Bodies, Body, World } from 'matter-js';

// 创建物理引擎
const engine = Engine.create();
const world = engine.world;

// 图片信息
const imagesDictionary = {
  1: {
    src: chrome.runtime.getURL('1.png'),
    text: 'This ChatGPT query is estimated to use about 0.3 watt-hours of electricity, which is one CR1632 button battery capacity.',
    mass:2
  },
  2: {
    src: chrome.runtime.getURL('2.png'),
    text: 'This response will emit 0.3g of carbon dioxide, enough to fill a balloon with a diameter of 6cm.',
    mass:1
  },
  3: {
    src: chrome.runtime.getURL('3.png'),
    text: 'This operation requires about 720 joules of energy, and the database cooling consumes 172.7 grams of water.',
    mass:3
  },
};

let counter = 0;

// 创建容器
const container = document.createElement('div');
container.style.position = 'fixed';
container.style.top = '0';
container.style.left = '0';
container.style.width = '100vw'; // 视口宽度
container.style.height = '100vh'; // 视口高度
container.style.zIndex = '0'; // 保证在页面最上层
container.style.overflow = 'hidden'; // 避免内容溢出
container.style.pointerEvents = 'none'; // 禁止容器捕获鼠标事件
// container.style.background = 'rgba(255, 255, 255, 0.8)'; // 半透明背景（可选）
document.body.appendChild(container);


// 初始化渲染器
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

// 监听窗口尺寸变化

const runner = Runner.create();
Runner.run(runner, engine);
const ground1 = Bodies.rectangle(window.innerWidth / 2+150, window.innerHeight, window.innerWidth/2-50, 300, {
  isStatic: true,
  render: {
    fillStyle: 'rgba(0, 0, 0, 0)'  // Transparent background
  }
});
const ground2 = Bodies.rectangle(window.innerWidth / 2, window.innerHeight, window.innerWidth, 10, {
    isStatic: true,
    render: {
      fillStyle: 'rgba(0, 0, 0, 0)'  // Transparent background
    }
  });
World.add(world, ground1);
World.add(world, ground2);

// 创建掉落的图片
function createFallingImage() {
  const { src, mass } = imagesDictionary[counter];

  // 创建 HTML 图片元素
  const img = new Image();
  img.src = src;
  img.onload = () => {
    const imgWidth = img.width / 2;
    const imgHeight = img.height / 2;

    // 计算图片掉落的初始位置
    const body = Bodies.rectangle(
      Math.random() * (window.innerWidth - imgWidth) + imgWidth / 2, // 随机 X 坐标
      -imgHeight/2, // 初始在容器上方
      imgWidth/2,
      imgHeight,
      {
        render: {
          sprite: {
            texture: src, // 设置图片纹理
            xScale: 0.5,
            yScale: 0.5,
          },
        },
        mass: mass,
      }
    );
    World.add(world, body);
  };
}

function modifyDOM() {
  counter = counter === 3 ? 1 : counter + 1;
  const elementsWithDataTestId = document.querySelectorAll('[data-testid^="conversation-turn-"]');
  const elementsWithNumbers = [];
  elementsWithDataTestId.forEach((element) => {
    const dataTestId = element.getAttribute('data-testid');
    if (dataTestId && dataTestId.startsWith('conversation-turn-')) {
      const number = parseInt(dataTestId.replace('conversation-turn-', ''), 20);
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
        !parent.hasAttribute('data-modified') // 检查是否已经修改过
      ) {
        const requiredClass = 'markdown prose w-full break-words dark:prose-invert light';
        const hasAllClasses = requiredClass.split(' ').every((cls) =>
          parent.classList.contains(cls)
        );

        if (hasAllClasses) {
          createFallingImage();
          const newParagraph = document.createElement('p');
          newParagraph.textContent = imagesDictionary[counter].text; // 获取当前文字
          newParagraph.style.color = 'darkred'; // 设置为深灰色
          newParagraph.style.fontStyle = 'italic';

          if (parent) {
            parent.insertBefore(newParagraph, parent.firstChild); // 插入文字
            parent.setAttribute('data-modified', 'true'); // 设置已修改标记
          }
        }
      }
    });

    const divElements = element.querySelectorAll('div.whitespace-pre-wrap');
    divElements.forEach((div) => {
      if (div && !div.hasAttribute('data-modified')) {
        div.setAttribute('data-modified', 'true');
        div.textContent = `Analyse: ${div.textContent}`;
        console.log('修改内容为:', div.textContent);
      }
    });
  });
}


//   function createBatteryIcon() {
//     const batteryIcon = document.createElement('span');
//     batteryIcon.setAttribute('data-battery', 'true'); 
//     batteryIcon.setAttribute('data-percentage', '15'); 
//     batteryIcon.style.cssText = `
//         display: inline-block;
//         width: 40px;
//         height: 15px;
//         background-color: #54534d;
//         border-radius: 5px;
//         margin-right: 10px;
//         border: 1px solid #54534d;
//         position: relative;
//         top: 0;
//         left: 0;
//     `;
//     const batteryCharge = document.createElement('div');
//     batteryCharge.style.cssText = `
//         width: 80%; /* 默认填充满电 */
//         height: 100%;
//         background-color: #fff;
//         border-radius: 5px;
//     `;
//     batteryIcon.appendChild(batteryCharge);

//     return batteryIcon;
// }

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
