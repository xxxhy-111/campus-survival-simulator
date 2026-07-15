/* ==========================================================
   校园生存模拟器 - 封面场景绘制脚本
   像素风 / Canvas 2D / 960 x 540
   内容: 大学门前人来人往 + 背向玩家的新生小白
   ========================================================== */

let APP_CONTENTS = {};

// 安全绑定事件的辅助函数
function bindClick(id, callback) {
  const el = document.getElementById(id);
  if (el) el.addEventListener('click', (e) => {
    if (window.gameAudio) { gameAudio.init(); gameAudio.play('click'); }
    callback(e);
  });
}

document.addEventListener('DOMContentLoaded', function() {
  const canvas = document.getElementById('cover-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = false;

  const W = canvas.width;   // 960
  const H = canvas.height;  // 540

  /* ==========================================================
     基础像素绘制工具
     ========================================================== */

  // 以像素数组绘制 (每个数字代表一个颜色, 0 = 透明)
  // matrix: 二维数组, 每个值是颜色键
  // palette: { '1': '#rrggbb', '2': '...' }
  function drawMatrix(x, y, matrix, palette, scale = 1) {
    for (let r = 0; r < matrix.length; r++) {
      const row = matrix[r];
      for (let c = 0; c < row.length; c++) {
        const key = row[c];
        if (key === 0 || key === '.' || key === ' ') continue;
        const color = palette[key];
        if (!color) continue;
        ctx.fillStyle = color;
        ctx.fillRect(x + c * scale, y + r * scale, scale, scale);
      }
    }
  }

  // 绘制带描边的矩形像素块
  function pixelBlock(x, y, w, h, fill, outline = null, inner = null) {
    ctx.fillStyle = fill;
    ctx.fillRect(x, y, w, h);
    if (inner) {
      ctx.fillStyle = inner;
      ctx.fillRect(x + 2, y + 2, w - 4, h - 4);
    }
    if (outline) {
      ctx.fillStyle = outline;
      // 上边缘
      ctx.fillRect(x, y, w, 1);
      // 下边缘
      ctx.fillRect(x, y + h - 1, w, 1);
      // 左边缘
      ctx.fillRect(x, y, 1, h);
      // 右边缘
      ctx.fillRect(x + w - 1, y, 1, h);
    }
  }

  // 画天空的像素点 (用于模拟像素风, 其实整块填也可以, 这里加噪点)
  function drawSky() {
    // 渐变天空 - 用多层横向色带模拟像素风渐变
    const bands = [
      { y: 0,   h: 60,  c: '#ffd8a8' },  // 暖色晨光
      { y: 60,  h: 80,  c: '#f5b895' },
      { y: 140, h: 80,  c: '#d89a88' },
      { y: 220, h: 60,  c: '#b07a72' }
    ];
    bands.forEach(b => {
      ctx.fillStyle = b.c;
      ctx.fillRect(0, b.y, W, b.h);
    });

    // 噪点 - 让天空更像像素图
    ctx.fillStyle = 'rgba(255,220,160,0.25)';
    for (let i = 0; i < 120; i++) {
      const rx = Math.floor(Math.random() * W);
      const ry = Math.floor(Math.random() * 280);
      ctx.fillRect(rx, ry, 1, 1);
    }

    // 太阳
    const sunX = 150, sunY = 100;
    // 光晕
    ctx.fillStyle = 'rgba(255,240,150,0.25)';
    for (let r = 40; r > 15; r -= 4) {
      for (let a = 0; a < Math.PI * 2; a += 0.2) {
        const px = Math.floor(sunX + Math.cos(a) * r);
        const py = Math.floor(sunY + Math.sin(a) * r);
        ctx.fillRect(px, py, 2, 2);
      }
    }
    // 太阳本体 (像素方块)
    ctx.fillStyle = '#fff2a8';
    ctx.fillRect(sunX - 12, sunY - 12, 24, 24);
    ctx.fillStyle = '#ffd966';
    ctx.fillRect(sunX - 10, sunY - 10, 20, 20);
    ctx.fillStyle = '#ffb347';
    ctx.fillRect(sunX - 8, sunY - 8, 16, 16);
    // 光芒十字
    ctx.fillStyle = 'rgba(255,240,150,0.8)';
    ctx.fillRect(sunX - 20, sunY - 1, 40, 2);
    ctx.fillRect(sunX - 1, sunY - 20, 2, 40);

    // 云
    drawCloud(700, 80, 1.2);
    drawCloud(500, 50, 1.0);
    drawCloud(820, 130, 0.9);
  }

  function drawCloud(x, y, scale = 1) {
    const s = scale;
    ctx.fillStyle = '#ffffff';
    // 主体
    ctx.fillRect(x, y + 6 * s, 40 * s, 10 * s);
    ctx.fillRect(x + 8 * s, y, 24 * s, 16 * s);
    ctx.fillRect(x - 10 * s, y + 4 * s, 18 * s, 12 * s);
    ctx.fillRect(x + 34 * s, y + 4 * s, 18 * s, 12 * s);
    // 底部阴影
    ctx.fillStyle = 'rgba(180,180,200,0.6)';
    ctx.fillRect(x, y + 14 * s, 40 * s, 2 * s);
  }

  /* ==========================================================
     远景: 远山 / 校园建筑
     ========================================================== */
  function drawFarBackground() {
    // 远山 (左)
    ctx.fillStyle = '#8b9dc3';
    drawMountain(0, 260, 200, 60);
    // 山 (中)
    ctx.fillStyle = '#6b8ba8';
    drawMountain(120, 280, 180, 50);
    // 山 (右)
    ctx.fillStyle = '#8b9dc3';
    drawMountain(600, 260, 250, 70);

    // 远景建筑 - 校园主建筑轮廓 (在校门后面)
    drawCampusBuildings();
  }

  function drawMountain(x, y, w, h) {
    // 三角形山 - 用循环像素堆叠
    for (let i = 0; i < h; i += 2) {
      const bw = w - (w / h) * i * 2;
      ctx.fillRect(x + (w - bw) / 2, y + h - i - 2, bw, 2);
    }
  }

  function drawCampusBuildings() {
    const groundY = 340;

    // 中央主楼 (对称式复古教学楼)
    // 主体
    pixelBlock(420, 180, 140, 140, '#e8d9b5', '#5c3a1e', '#f5ecd0');
    // 屋顶三角部分
    ctx.fillStyle = '#8b3a2a';
    for (let i = 0; i < 40; i += 2) {
      const bw = 160 - i * 3;
      ctx.fillRect(410 + (160 - bw) / 2, 180 - i - 2, bw, 2);
    }
    // 屋顶中央小尖塔
    pixelBlock(485, 130, 10, 20, '#a0522d', '#3a1e0a');
    ctx.fillStyle = '#ffd966';
    ctx.fillRect(488, 122, 4, 10);

    // 主楼窗户 (整齐的像素窗)
    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 4; col++) {
        const wx = 435 + col * 30;
        const wy = 205 + row * 28;
        pixelBlock(wx, wy, 18, 20, '#5a8abf', '#2a1e0a', '#8ab8e0');
        // 十字窗棂
        ctx.fillStyle = '#3a2a15';
        ctx.fillRect(wx + 8, wy + 2, 2, 16);
        ctx.fillRect(wx + 2, wy + 9, 14, 2);
      }
    }
    // 主楼主入口 (拱形门)
    pixelBlock(470, 290, 40, 30, '#8b4513', '#3a1e0a');
    ctx.fillStyle = '#5c2a0a';
    ctx.fillRect(488, 295, 4, 25);

    // 左侧配楼
    pixelBlock(260, 230, 120, 110, '#d8c5a0', '#5c3a1e', '#ead8b8');
    // 屋顶
    ctx.fillStyle = '#a0522d';
    ctx.fillRect(256, 222, 128, 10);
    ctx.fillStyle = '#5c2a0a';
    ctx.fillRect(256, 220, 128, 2);
    // 左楼窗户
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 3; col++) {
        const wx = 275 + col * 32;
        const wy = 245 + row * 26;
        pixelBlock(wx, wy, 18, 18, '#5a8abf', '#2a1e0a', '#8ab8e0');
        ctx.fillStyle = '#3a2a15';
        ctx.fillRect(wx + 8, wy + 2, 2, 14);
        ctx.fillRect(wx + 2, wy + 8, 14, 2);
      }
    }

    // 右侧配楼
    pixelBlock(600, 230, 120, 110, '#d8c5a0', '#5c3a1e', '#ead8b8');
    ctx.fillStyle = '#a0522d';
    ctx.fillRect(596, 222, 128, 10);
    ctx.fillStyle = '#5c2a0a';
    ctx.fillRect(596, 220, 128, 2);
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 3; col++) {
        const wx = 615 + col * 32;
        const wy = 245 + row * 26;
        pixelBlock(wx, wy, 18, 18, '#5a8abf', '#2a1e0a', '#8ab8e0');
        ctx.fillStyle = '#3a2a15';
        ctx.fillRect(wx + 8, wy + 2, 2, 14);
        ctx.fillRect(wx + 2, wy + 8, 14, 2);
      }
    }

    // 远处小塔 (钟楼)
    pixelBlock(180, 200, 30, 60, '#c8b58a', '#5c3a1e', '#e0d0a8');
    ctx.fillStyle = '#8b3a2a';
    for (let i = 0; i < 20; i += 2) {
      const bw = 40 - i;
      ctx.fillRect(175 + (40 - bw) / 2, 200 - i - 2, bw, 2);
    }
    // 钟面
    pixelBlock(188, 215, 14, 14, '#fff8dc', '#3a1e0a');
    ctx.fillStyle = '#2a1a0a';
    ctx.fillRect(194, 218, 2, 8);
    ctx.fillRect(194, 222, 5, 2);
  }

  /* ==========================================================
     中景: 大学校门
     ========================================================== */
  function drawUniversityGate() {
    // 校门地面基础
    const gateY = 340;

    // 左侧门柱
    drawGatePillar(300, gateY - 140, 60, 140);
    // 右侧门柱
    drawGatePillar(600, gateY - 140, 60, 140);

    // 横梁 (连接两门柱, 上方有校名)
    // 主横梁
    pixelBlock(290, gateY - 150, 380, 20, '#a0522d', '#3a1e0a', '#c8784a');
    // 横梁顶部装饰
    pixelBlock(286, gateY - 158, 388, 8, '#5c2a0a', '#3a1e0a');

    // 校名标牌
    const signX = 380, signY = gateY - 142;
    pixelBlock(signX, signY, 200, 24, '#fff8dc', '#3a1e0a', '#fff2c2');
    // 校名 (像素化文字)
    ctx.fillStyle = '#8b1a1a';
    ctx.font = 'bold 16px "ZCOOL KuaiLe", "Microsoft YaHei", sans-serif';
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'center';
    ctx.fillText('科技大学', signX + 100, signY + 12);

    // 校名两侧装饰花纹
    ctx.fillStyle = '#d4a017';
    ctx.fillRect(signX + 8, signY + 10, 20, 4);
    ctx.fillRect(signX + 172, signY + 10, 20, 4);
    ctx.fillStyle = '#8b1a1a';
    ctx.fillRect(signX + 12, signY + 11, 12, 2);
    ctx.fillRect(signX + 176, signY + 11, 12, 2);

    // 门柱顶部装饰 (中式风格)
    drawPillarTop(296, gateY - 160);
    drawPillarTop(664, gateY - 160);

    // 中央通道 (校门入口的路径阴影)
    ctx.fillStyle = 'rgba(80,50,30,0.35)';
    ctx.fillRect(380, gateY - 5, 200, 10);
  }

  function drawGatePillar(x, y, w, h) {
    // 主柱体
    pixelBlock(x, y, w, h, '#e8d9b5', '#3a1e0a', '#f5ecd0');
    // 柱体横纹 (砖块)
    ctx.fillStyle = '#c8b58a';
    for (let r = 0; r < 6; r++) {
      ctx.fillRect(x + 4, y + 10 + r * 22, w - 8, 2);
    }
    // 柱体纵向中线装饰
    ctx.fillStyle = '#a0522d';
    ctx.fillRect(x + w / 2 - 1, y + 4, 2, h - 8);

    // 底部基座 (加宽)
    pixelBlock(x - 8, y + h - 18, w + 16, 18, '#a0522d', '#3a1e0a', '#c8784a');
    ctx.fillStyle = '#3a1e0a';
    ctx.fillRect(x - 8, y + h - 10, w + 16, 2);
  }

  function drawPillarTop(x, y) {
    // 类似中式飞檐的简化装饰
    ctx.fillStyle = '#5c2a0a';
    ctx.fillRect(x, y + 4, 56, 4);
    ctx.fillStyle = '#a0522d';
    ctx.fillRect(x + 4, y, 48, 6);
    // 装饰尖顶
    ctx.fillStyle = '#d4a017';
    ctx.fillRect(x + 24, y - 6, 8, 8);
    ctx.fillStyle = '#8b1a1a';
    ctx.fillRect(x + 26, y - 4, 4, 4);
  }

  /* ==========================================================
     前景: 地面 / 道路 / 树木
     ========================================================== */
  function drawGround() {
    const groundY = 340;
    // 主地面 (草地) - 多条横向色带
    const grassBands = [
      '#7fa968', '#6a9a5c', '#5a8a4e', '#4a7a3e', '#3a6a2e'
    ];
    for (let i = 0; i < grassBands.length; i++) {
      ctx.fillStyle = grassBands[i];
      ctx.fillRect(0, groundY + i * 12, W, 12);
    }
    // 其余下部地面
    ctx.fillStyle = '#3a5a2e';
    ctx.fillRect(0, groundY + 60, W, H - groundY - 60);

    // 道路 (从校门延伸向前) - 梯形
    ctx.fillStyle = '#c8b898';
    // 使用像素化梯形 - 逐行
    const roadStart = 200;
    const roadEnd = 820;
    const topHalf = 100;  // 道路顶部半宽 (在 340 处)
    const bottomHalf = 480; // 底部半宽
    for (let y = 0; y < H - groundY; y += 2) {
      const t = y / (H - groundY);
      const halfW = topHalf + (bottomHalf - topHalf) * t;
      const cx = W / 2;
      ctx.fillRect(cx - halfW, groundY + y, halfW * 2, 2);
    }
    // 道路横向条纹 (纹理)
    ctx.fillStyle = 'rgba(120,90,60,0.35)';
    for (let y = 20; y < H - groundY; y += 10) {
      const t = y / (H - groundY);
      const halfW = topHalf + (bottomHalf - topHalf) * t;
      const cx = W / 2;
      ctx.fillRect(cx - halfW, groundY + y, halfW * 2, 2);
    }
    // 道路两侧边缘
    ctx.fillStyle = '#8b7a5a';
    for (let y = 0; y < H - groundY; y += 2) {
      const t = y / (H - groundY);
      const halfW = topHalf + (bottomHalf - topHalf) * t;
      const cx = W / 2;
      ctx.fillRect(cx - halfW - 2, groundY + y, 2, 2);
      ctx.fillRect(cx + halfW, groundY + y, 2, 2);
    }

    // 道路上的黄色虚线中线 (像素化斑马线)
    ctx.fillStyle = '#e8c068';
    for (let i = 0; i < 8; i++) {
      const y = groundY + 30 + i * 22;
      const t = (y - groundY) / (H - groundY);
      const halfW = (topHalf + (bottomHalf - topHalf) * t) * 0.15;
      const cx = W / 2;
      ctx.fillRect(cx - halfW, y, halfW * 2, 4);
    }

    // 草地细节 - 随机小色块 (固定种子)
    const seed = 42;
    let s = seed;
    function rnd() { s = (s * 9301 + 49297) % 233280; return s / 233280; }
    for (let i = 0; i < 300; i++) {
      const rx = Math.floor(rnd() * W);
      const ry = groundY + Math.floor(rnd() * (H - groundY));
      // 避开道路
      const t = (ry - groundY) / (H - groundY);
      const halfW = topHalf + (bottomHalf - topHalf) * t;
      if (Math.abs(rx - W / 2) < halfW - 4) continue;
      ctx.fillStyle = rnd() > 0.5 ? '#4a7a3e' : '#9aba78';
      ctx.fillRect(rx, ry, 2, 2);
    }

    // 左右两侧的树 (前景)
    drawTree(110, groundY + 30, 1.1);
    drawTree(30, groundY + 70, 1.3);
    drawTree(850, groundY + 30, 1.1);
    drawTree(930, groundY + 70, 1.3);
  }

  function drawTree(x, baseY, scale = 1) {
    const s = scale;
    // 树干
    ctx.fillStyle = '#5c3a1e';
    ctx.fillRect(x - 4 * s, baseY - 40 * s, 8 * s, 40 * s);
    ctx.fillStyle = '#3a2410';
    ctx.fillRect(x - 4 * s, baseY - 40 * s, 2 * s, 40 * s);
    ctx.fillStyle = '#7a4a2a';
    ctx.fillRect(x + 2 * s, baseY - 38 * s, 2 * s, 38 * s);

    // 树冠 (多层圆形)
    const crownY = baseY - 60 * s;
    // 主体 1
    ctx.fillStyle = '#3a6a2e';
    ctx.fillRect(x - 28 * s, crownY - 10 * s, 56 * s, 40 * s);
    ctx.fillRect(x - 32 * s, crownY, 64 * s, 30 * s);
    // 主体 2
    ctx.fillStyle = '#4a7a3e';
    ctx.fillRect(x - 24 * s, crownY - 8 * s, 48 * s, 36 * s);
    // 高光
    ctx.fillStyle = '#6a9a5c';
    ctx.fillRect(x - 18 * s, crownY - 4 * s, 20 * s, 16 * s);
    ctx.fillStyle = '#8aba78';
    ctx.fillRect(x - 12 * s, crownY - 2 * s, 8 * s, 8 * s);
    // 阴影
    ctx.fillStyle = 'rgba(40,20,10,0.35)';
    ctx.fillRect(x - 12 * s, baseY + 2, 24 * s, 4 * s);
  }

  /* ==========================================================
     前景角色: 主角 (背向玩家的新生小白)
     ========================================================== */
  function drawProtagonist() {
    // 角色站在道路靠前景的位置
    const cx = W / 2;         // 480
    const feetY = 470;

    // 阴影
    ctx.fillStyle = 'rgba(40,20,10,0.45)';
    ctx.fillRect(cx - 28, feetY - 2, 56, 6);

    // ============= 行李 (行李箱 - 左手) =============
    // 拉杆箱 - 蓝色
    const bagX = cx - 58;
    const bagY = feetY - 62;
    // 拉杆
    pixelBlock(bagX + 18, bagY - 20, 6, 22, '#6a6a6a', '#2a2a2a');
    pixelBlock(bagX + 14, bagY - 24, 14, 6, '#8a8a8a', '#2a2a2a');
    // 箱体
    pixelBlock(bagX, bagY, 40, 60, '#3a5a8b', '#1a2a4a', '#5a7aaa');
    // 箱体条纹
    ctx.fillStyle = '#1a2a4a';
    for (let i = 1; i < 4; i++) {
      ctx.fillRect(bagX, bagY + i * 15, 40, 2);
    }
    // 箱子把手
    pixelBlock(bagX + 14, bagY - 6, 12, 4, '#6a6a6a', '#2a2a2a');
    // 轮子
    ctx.fillStyle = '#2a2a2a';
    ctx.fillRect(bagX + 2, bagY + 58, 6, 4);
    ctx.fillRect(bagX + 32, bagY + 58, 6, 4);
    // 箱子挂饰 (标签 - 红色)
    pixelBlock(bagX + 32, bagY + 12, 6, 8, '#e84a4a', '#6a1a1a');

    // ============= 双肩包 (背后) =============
    const backpackX = cx - 22;
    const backpackY = feetY - 98;
    // 背包主体
    pixelBlock(backpackX, backpackY, 44, 40, '#4a3a2a', '#2a1a0a', '#6a4a3a');
    // 前面袋
    pixelBlock(backpackX + 6, backpackY + 22, 32, 14, '#5a4a3a', '#2a1a0a');
    // 拉链
    ctx.fillStyle = '#d4a017';
    ctx.fillRect(backpackX + 20, backpackY + 28, 4, 4);
    // 背带 (从肩膀延伸)
    ctx.fillStyle = '#3a2a1a';
    ctx.fillRect(backpackX - 2, backpackY + 4, 6, 20);
    ctx.fillRect(backpackX + 40, backpackY + 4, 6, 20);

    // ============= 人物本体 (背向) =============
    // 腿
    const legTop = feetY - 40;
    // 左腿
    pixelBlock(cx - 14, legTop, 12, 40, '#2a3a5a', '#0a1a2a', '#4a5a7a');
    // 右腿
    pixelBlock(cx + 2, legTop, 12, 40, '#2a3a5a', '#0a1a2a', '#4a5a7a');
    // 鞋子 (白鞋)
    pixelBlock(cx - 16, feetY - 6, 16, 8, '#f5f5f5', '#2a2a2a', '#ffffff');
    pixelBlock(cx, feetY - 6, 16, 8, '#f5f5f5', '#2a2a2a', '#ffffff');

    // 身体 / T恤 (白色)
    const bodyTop = feetY - 86;
    pixelBlock(cx - 20, bodyTop, 40, 48, '#f8f4e8', '#5c5040', '#ffffff');
    // 袖口
    pixelBlock(cx - 26, bodyTop + 4, 8, 20, '#f8f4e8', '#5c5040');
    pixelBlock(cx + 18, bodyTop + 4, 8, 20, '#f8f4e8', '#5c5040');
    // 手臂 (垂下来)
    pixelBlock(cx - 26, bodyTop + 22, 8, 22, '#f0d8b8', '#8a6a50');
    pixelBlock(cx + 18, bodyTop + 22, 8, 22, '#f0d8b8', '#8a6a50');
    // 手 (扶着拉杆箱)
    pixelBlock(cx - 28, bodyTop + 44, 10, 8, '#f0d8b8', '#8a6a50');
    // 右手握拳 (看不太清因为是背面, 简化)
    pixelBlock(cx + 18, bodyTop + 44, 10, 8, '#f0d8b8', '#8a6a50');

    // 脖子
    pixelBlock(cx - 8, bodyTop - 4, 16, 6, '#f0d8b8', '#8a6a50');

    // 头 (后脑勺 - 黑色短发)
    const headTop = bodyTop - 30;
    // 头发 (从背后看 - 主要是黑发轮廓)
    pixelBlock(cx - 18, headTop, 36, 24, '#1a1a1a', '#000000', '#2a2a2a');
    // 头发顶部弧度
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(cx - 16, headTop - 2, 32, 2);
    ctx.fillRect(cx - 14, headTop - 4, 28, 2);
    ctx.fillRect(cx - 12, headTop - 6, 24, 2);
    // 头发高光
    ctx.fillStyle = '#3a3a3a';
    ctx.fillRect(cx - 10, headTop + 2, 8, 3);
    // 后颈处的头发边缘
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(cx - 18, headTop + 22, 36, 4);

    // 脖子后面
    ctx.fillStyle = '#e8c89a';
    ctx.fillRect(cx - 6, bodyTop - 4, 12, 4);

    // 小白的头微微抬起望向校门 (头部略仰)
    // 因为是背向, 所以只需要保证整体朝向校门即可

    // 一个小细节: 手腕上的手表
    ctx.fillStyle = '#d4a017';
    ctx.fillRect(cx + 16, bodyTop + 32, 12, 3);
    ctx.fillStyle = '#2a2a2a';
    ctx.fillRect(cx + 20, bodyTop + 30, 4, 3);
  }

  /* ==========================================================
     前景角色: 行人 / 学生 (增加"人来人往"感)
     ========================================================== */

  // 小型行人 (远处, 小尺寸)
  function drawSmallPedestrian(x, y, palette) {
    // 头
    pixelBlock(x - 3, y - 14, 6, 6, palette.skin, palette.skinDark);
    // 头发
    pixelBlock(x - 3, y - 14, 6, 3, palette.hair);
    // 身体
    pixelBlock(x - 4, y - 8, 8, 8, palette.shirt, palette.shirtDark);
    // 腿
    pixelBlock(x - 4, y, 3, 6, palette.pants, palette.pantsDark);
    pixelBlock(x + 1, y, 3, 6, palette.pants, palette.pantsDark);
    // 阴影
    ctx.fillStyle = 'rgba(40,20,10,0.3)';
    ctx.fillRect(x - 5, y + 6, 10, 2);
  }

  // 中等尺寸行人 (中距离)
  function drawMediumPedestrian(x, y, palette, hasBag = false) {
    // 阴影
    ctx.fillStyle = 'rgba(40,20,10,0.35)';
    ctx.fillRect(x - 8, y + 2, 16, 3);
    // 腿
    pixelBlock(x - 6, y - 14, 5, 14, palette.pants, palette.pantsDark);
    pixelBlock(x + 1, y - 14, 5, 14, palette.pants, palette.pantsDark);
    // 鞋
    pixelBlock(x - 6, y - 2, 5, 3, '#2a2a2a');
    pixelBlock(x + 1, y - 2, 5, 3, '#2a2a2a');
    // 身体
    pixelBlock(x - 8, y - 30, 16, 16, palette.shirt, palette.shirtDark);
    // 手臂
    pixelBlock(x - 10, y - 28, 4, 12, palette.shirt, palette.shirtDark);
    pixelBlock(x + 6, y - 28, 4, 12, palette.shirt, palette.shirtDark);
    // 头
    pixelBlock(x - 5, y - 40, 10, 10, palette.skin, palette.skinDark);
    // 头发
    pixelBlock(x - 5, y - 40, 10, 4, palette.hair);
    // 如果是长发/发型
    if (palette.hairStyle === 'long') {
      pixelBlock(x - 6, y - 38, 3, 10, palette.hair);
      pixelBlock(x + 3, y - 38, 3, 10, palette.hair);
    }
    // 包
    if (hasBag) {
      pixelBlock(x + 6, y - 22, 6, 10, '#8b4513', '#3a1e0a');
    }
  }

  function drawAllPedestrians() {
    // 远处 (校门附近) 的行人
    const farPalettes = [
      { skin: '#f0d8b8', skinDark: '#8a6a50', hair: '#2a1a0a',
        shirt: '#e84a4a', shirtDark: '#8a1a1a', pants: '#2a3a5a', pantsDark: '#0a1a2a' },
      { skin: '#f0d8b8', skinDark: '#8a6a50', hair: '#5c3a1a', hairStyle: 'long',
        shirt: '#4a9ae8', shirtDark: '#1a4a8a', pants: '#3a2a1a', pantsDark: '#1a0a00' },
      { skin: '#e8c89a', skinDark: '#7a5a40', hair: '#1a1a1a',
        shirt: '#5a8a3a', shirtDark: '#2a4a1a', pants: '#4a3a2a', pantsDark: '#1a0a00' },
      { skin: '#f0d8b8', skinDark: '#8a6a50', hair: '#3a2a1a',
        shirt: '#e8a04a', shirtDark: '#8a4a1a', pants: '#2a3a5a', pantsDark: '#0a1a2a' }
    ];
    // 校门通道内的行人
    drawSmallPedestrian(410, 370, farPalettes[0]);
    drawSmallPedestrian(470, 365, farPalettes[1]);
    drawSmallPedestrian(540, 372, farPalettes[2]);
    drawSmallPedestrian(580, 368, farPalettes[3]);

    // 中距离行人 (道路两侧)
    const midPalettes = [
      { skin: '#f0d8b8', skinDark: '#8a6a50', hair: '#2a1a0a',
        shirt: '#e85a5a', shirtDark: '#8a1a1a', pants: '#2a3a5a', pantsDark: '#0a1a2a' },
      { skin: '#f0d8b8', skinDark: '#8a6a50', hair: '#4a2a1a', hairStyle: 'long',
        shirt: '#5a8ae8', shirtDark: '#1a4a7a', pants: '#3a2a1a', pantsDark: '#1a0a00' },
      { skin: '#e8c89a', skinDark: '#7a5a40', hair: '#1a1a1a',
        shirt: '#6a9a4a', shirtDark: '#2a4a1a', pants: '#4a3a2a', pantsDark: '#1a0a00' },
      { skin: '#f0d8b8', skinDark: '#8a6a50', hair: '#5c3a1e', hairStyle: 'long',
        shirt: '#d4a0c8', shirtDark: '#8a4a8a', pants: '#4a3a5a', pantsDark: '#1a0a2a' }
    ];
    drawMediumPedestrian(230, 420, midPalettes[0], true);
    drawMediumPedestrian(280, 440, midPalettes[1]);
    drawMediumPedestrian(680, 430, midPalettes[2], true);
    drawMediumPedestrian(740, 450, midPalettes[3]);
    drawMediumPedestrian(350, 400, farPalettes[1]);
    drawMediumPedestrian(620, 410, farPalettes[3], true);

    // 一些骑自行车的学生 (简化 - 两个方块)
    drawBicycle(780, 430);
    drawBicycle(200, 450);
  }

  function drawBicycle(x, y) {
    // 阴影
    ctx.fillStyle = 'rgba(40,20,10,0.35)';
    ctx.fillRect(x - 18, y + 2, 36, 3);
    // 车轮
    ctx.fillStyle = '#2a2a2a';
    ctx.fillRect(x - 18, y - 10, 14, 14);
    ctx.fillRect(x + 4, y - 10, 14, 14);
    // 车轮内圈
    ctx.fillStyle = '#c0c0c0';
    ctx.fillRect(x - 15, y - 7, 8, 8);
    ctx.fillRect(x + 7, y - 7, 8, 8);
    ctx.fillStyle = '#2a2a2a';
    ctx.fillRect(x - 13, y - 5, 4, 4);
    ctx.fillRect(x + 9, y - 5, 4, 4);
    // 车架
    ctx.fillStyle = '#e84a4a';
    ctx.fillRect(x - 10, y - 4, 20, 3);
    ctx.fillRect(x - 6, y - 8, 3, 6);
    ctx.fillRect(x + 4, y - 14, 3, 12);
    // 车把
    ctx.fillStyle = '#3a3a3a';
    ctx.fillRect(x + 6, y - 16, 6, 3);
    // 座位上的小人 - 简化
    pixelBlock(x - 2, y - 22, 8, 10, '#4a9ae8', '#1a4a8a');
    pixelBlock(x, y - 28, 6, 6, '#f0d8b8', '#8a6a50');
    pixelBlock(x, y - 28, 6, 3, '#2a1a0a');
  }

  /* ==========================================================
     飘动元素: 落叶 / 飞鸟 / 阳光粒子 (增加动态)
     ========================================================== */
  const leaves = [];
  for (let i = 0; i < 18; i++) {
    leaves.push({
      x: Math.random() * W,
      y: Math.random() * 300,
      vx: -0.3 - Math.random() * 0.4,
      vy: 0.2 + Math.random() * 0.3,
      size: 2 + Math.floor(Math.random() * 2),
      color: Math.random() > 0.5 ? '#e8a04a' : '#d48a3a'
    });
  }

  function drawAndUpdateLeaves() {
    leaves.forEach(l => {
      l.x += l.vx;
      l.y += l.vy;
      if (l.x < -10) l.x = W + 10;
      if (l.y > H) l.y = -10;
      ctx.fillStyle = l.color;
      ctx.fillRect(Math.floor(l.x), Math.floor(l.y), l.size, l.size);
    });
  }

  // 小鸟 (远景)
  function drawBirds(time) {
    const birds = [
      { x: 300, y: 90, speed: 0.2 },
      { x: 600, y: 60, speed: 0.3 }
    ];
    birds.forEach(b => {
      const bx = (b.x + time * b.speed) % (W + 100);
      const flap = Math.floor(time / 15) % 2 === 0;
      ctx.fillStyle = '#2a2a2a';
      // 简化鸟形
      if (flap) {
        ctx.fillRect(bx - 4, b.y - 1, 3, 2);
        ctx.fillRect(bx - 1, b.y, 3, 2);
        ctx.fillRect(bx + 2, b.y - 1, 3, 2);
      } else {
        ctx.fillRect(bx - 4, b.y - 2, 3, 2);
        ctx.fillRect(bx - 1, b.y - 3, 3, 2);
        ctx.fillRect(bx + 2, b.y - 2, 3, 2);
      }
    });
  }

  /* ==========================================================
     主渲染循环
     ========================================================== */
  let frameCount = 0;

  function render() {
    // 清空
    ctx.clearRect(0, 0, W, H);

    // 天空
    drawSky();
    drawBirds(frameCount);

    // 远山 + 建筑
    drawFarBackground();

    // 地面 / 道路
    drawGround();

    // 校门
    drawUniversityGate();

    // 行人
    drawAllPedestrians();

    // 主角 (前景最前)
    drawProtagonist();

    // 落叶 (飘动)
    drawAndUpdateLeaves();

    // 画面暗角 (vignette) - 增强氛围
    const grd = ctx.createRadialGradient(W / 2, H / 2, 200, W / 2, H / 2, 600);
    grd.addColorStop(0, 'rgba(0,0,0,0)');
    grd.addColorStop(1, 'rgba(20,10,5,0.45)');
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, W, H);

    frameCount++;
    requestAnimationFrame(render);
  }

  render();

  /* ==========================================================
     存档系统 (localStorage)
     ========================================================== */
  const STORAGE_KEY = 'campus_sim_saves_v1';
  const LAST_SLOT_KEY = 'campus_sim_last_slot_v1';

  function loadAllSaves() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return {};
      return JSON.parse(raw) || {};
    } catch (e) { return {}; }
  }
  function writeSave(slotNum, data) {
    const all = loadAllSaves();
    all[slotNum] = data;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
    localStorage.setItem(LAST_SLOT_KEY, String(slotNum));
  }
  function getSave(slotNum) {
    const all = loadAllSaves();
    return all[slotNum] || null;
  }
  function getLastSlot() {
    const v = localStorage.getItem(LAST_SLOT_KEY);
    return v ? parseInt(v, 10) : null;
  }

  function createNewSaveData() {
    const schedule = generateSemesterSchedule(REQUIRED_COURSE_LOAD, [], 0);
    return {
      health: 100,
      program: 0,
      knowledge: 30,
      money: 1500,
      day: 1,
      location: 'dorm',
      timeSlot: 0,    // 0=上午, 1=中午, 2=下午, 3=傍晚, 4=夜晚, 5=深夜
      lastStudyDay: 1,   // 上次学习是第几天
      lastCodeDay: 1,    // 上次写代码是第几天
      lastSleepDay: 1,   // 上次睡觉是第几天
      breakfastEaten: false,  // 今天是否吃了早餐
      lunchEaten: false,      // 今天是否吃了午餐
      dinnerEaten: false,     // 今天是否吃了晚餐
      events: [],
      schedule: schedule,     // 当前学期课程表
      scheduleSemester: getSemesterIndex(1), // 当前课程表所属学期
      requiredCourseLoad: REQUIRED_COURSE_LOAD, // 固定必修课量，选修课会在此基础上增加
      electives: [],          // 已选选修课列表
      xiaoguFavor: 0,         // 小谷好感度（上限1000）
      roommateFavors: { xin: 0, wang: 0, tang: 0 }, // 室友好感度（老信、老王、老唐）
      bagPages: [             // 背包分页（3页，每页15格）
        new Array(15).fill(null),
        new Array(15).fill(null),
        new Array(15).fill(null)
      ],
      bagPageIdx: 0,          // 当前查看的背包页
      sceneItems: [],         // 当前场景中的可拾取物品
      createdAt: new Date().toISOString()
    };
  }

  const TRASH_ITEMS = [
    { name: '塑料瓶', icon: '🥤', desc: '一个废弃的饮料瓶', value: 1 },
    { name: '易拉罐', icon: '🥫', desc: '一个铝制易拉罐', value: 2 },
    { name: '快递盒', icon: '📦', desc: '一个快递纸箱', value: 3 },
    { name: '塑料袋', icon: '🛍️', desc: '一个购物塑料袋', value: 1 },
    { name: '旧课本', icon: '📚', desc: '一本没人要的旧书', value: 5 },
    { name: '空笔芯', icon: '🖊️', desc: '用完的笔芯', value: 1 },
    { name: '外卖盒', icon: '🥡', desc: '吃剩的外卖盒', value: 2 },
    { name: '废纸张', icon: '📄', desc: '废纸一张', value: 1 }
  ];

  function generateSceneItems(loc) {
    if (!currentGameData) return;
    currentGameData.sceneItems = [];
    const bounds = getSceneBounds();
    const itemCount = Math.floor(Math.random() * 4) + 2;

    for (let i = 0; i < itemCount; i++) {
      const itemType = TRASH_ITEMS[Math.floor(Math.random() * TRASH_ITEMS.length)];
      let x, y;
      let attempts = 0;
      do {
        x = bounds.minX + Math.random() * (bounds.maxX - bounds.minX - 40);
        y = bounds.minY + Math.random() * (bounds.maxY - bounds.minY - 20);
        attempts++;
      } while (attempts < 100 && isTooCloseToPlayer(x, y, 50));

      currentGameData.sceneItems.push({
        id: `item_${Date.now()}_${i}`,
        name: itemType.name,
        icon: itemType.icon,
        desc: itemType.desc,
        x: x,
        y: y
      });
    }
  }

  function isTooCloseToPlayer(x, y, dist) {
    const dx = x - playerX;
    const dy = y - playerY;
    return Math.sqrt(dx * dx + dy * dy) < dist;
  }

  function drawSceneItems() {
    if (!gctx || !currentGameData || !currentGameData.sceneItems) return;
    currentGameData.sceneItems.forEach(item => {
      gctx.font = '24px sans-serif';
      gctx.textAlign = 'center';
      gctx.textBaseline = 'middle';
      gctx.fillText(item.icon, item.x + 10, item.y + 10);
      gctx.font = '10px "ZCOOL KuaiLe", sans-serif';
      gctx.fillStyle = '#3a1a05';
      gctx.fillText(item.name, item.x + 10, item.y + 28);
      gctx.fillStyle = '#fff';
    });
  }

  // 向背包添加物品（item: { name, icon, desc, count }，同名同图标的物品可堆叠，每格最多16个）
  function addItemToBag(item) {
    if (!currentGameData) return false;
    if (!currentGameData.bagPages) {
      currentGameData.bagPages = [
        new Array(15).fill(null),
        new Array(15).fill(null),
        new Array(15).fill(null)
      ];
    }
    const maxPerCell = 16;
    let remaining = item.count || 1;

    // 1) 先在已有同种物品的格子上堆叠
    for (let p = 0; p < currentGameData.bagPages.length && remaining > 0; p++) {
      const page = currentGameData.bagPages[p];
      for (let i = 0; i < page.length && remaining > 0; i++) {
        const cell = page[i];
        if (cell && cell.name === item.name && cell.icon === item.icon && cell.count < maxPerCell) {
          const space = maxPerCell - cell.count;
          const add = Math.min(space, remaining);
          cell.count += add;
          remaining -= add;
        }
      }
    }

    // 2) 剩余部分放入空格
    for (let p = 0; p < currentGameData.bagPages.length && remaining > 0; p++) {
      const page = currentGameData.bagPages[p];
      for (let i = 0; i < page.length && remaining > 0; i++) {
        if (!page[i]) {
          const add = Math.min(maxPerCell, remaining);
          page[i] = {
            name: item.name,
            icon: item.icon || '📦',
            desc: item.desc || '',
            count: add
          };
          remaining -= add;
        }
      }
    }

    return remaining === 0;
  }

  // 必修课程信息（含学分和能力加成）
  const COURSE_INFO = {
    '高等数学': { credits: 4, knowledge: 10, program: 0 },
    '大学英语': { credits: 3, knowledge: 8, program: 0 },
    'C语言程序设计': { credits: 3, knowledge: 5, program: 10 },
    '计算机导论': { credits: 2, knowledge: 8, program: 0 },
    '体育': { credits: 1, knowledge: 0, program: 0 },
    '线性代数': { credits: 3, knowledge: 10, program: 0 },
    '数据结构': { credits: 4, knowledge: 5, program: 12 },
    '概率论': { credits: 3, knowledge: 10, program: 0 },
    '操作系统': { credits: 4, knowledge: 8, program: 8 },
    '数据库原理': { credits: 3, knowledge: 5, program: 10 },
    '离散数学': { credits: 3, knowledge: 10, program: 0 },
    '软件工程': { credits: 3, knowledge: 5, program: 10 }
  };

  // 选修课程列表
  const ELECTIVE_COURSES = [
    { name: 'Python程序设计', credits: 2, knowledge: 5, program: 10, desc: '学习Python编程基础', type: 'sch-prog', loc: '实验楼D' },
    { name: '人工智能导论', credits: 3, knowledge: 8, program: 12, desc: 'AI入门课程', type: 'sch-comp', loc: '教3-402' },
    { name: '计算机网络', credits: 3, knowledge: 8, program: 8, desc: '网络原理与协议', type: 'sch-comp', loc: '教2-408' },
    { name: '编译原理', credits: 4, knowledge: 5, program: 12, desc: '编译器设计与实现', type: 'sch-prog', loc: '实验楼A' },
    { name: '机器学习', credits: 3, knowledge: 8, program: 15, desc: 'ML算法与实践', type: 'sch-prog', loc: '实验楼B' },
    { name: 'Web开发', credits: 2, knowledge: 3, program: 12, desc: '前后端开发技术', type: 'sch-prog', loc: '实验楼C' },
    { name: '算法设计与分析', credits: 4, knowledge: 5, program: 15, desc: '高级算法课程', type: 'sch-math', loc: '教1-406' },
    { name: '计算机图形学', credits: 3, knowledge: 5, program: 10, desc: '图形渲染原理', type: 'sch-comp', loc: '教3-305' },
    { name: '信息安全', credits: 3, knowledge: 8, program: 8, desc: '网络安全基础', type: 'sch-comp', loc: '教2-506' },
    { name: '移动应用开发', credits: 2, knowledge: 3, program: 12, desc: 'App开发实战', type: 'sch-prog', loc: '实验楼E' }
  ];

  const COURSES = [
    { name: '高等数学', type: 'sch-math', loc: '教1-201' },
    { name: '大学英语', type: 'sch-eng', loc: '教2-305' },
    { name: 'C语言程序设计', type: 'sch-prog', loc: '实验楼A' },
    { name: '计算机导论', type: 'sch-comp', loc: '教3-108' },
    { name: '体育', type: 'sch-pe', loc: '操场' },
    { name: '线性代数', type: 'sch-math', loc: '教1-302' },
    { name: '数据结构', type: 'sch-prog', loc: '实验楼B' },
    { name: '概率论', type: 'sch-math', loc: '教1-105' },
    { name: '操作系统', type: 'sch-comp', loc: '教3-206' },
    { name: '数据库原理', type: 'sch-comp', loc: '实验楼C' },
    { name: '离散数学', type: 'sch-math', loc: '教1-101' },
    { name: '软件工程', type: 'sch-prog', loc: '教3-102' },
    { name: '思想道德与政治', type: 'sch-eng', loc: '教2-101' },
    { name: '电路与电子学', type: 'sch-comp', loc: '实验楼D' },
    { name: '大学物理', type: 'sch-math', loc: '教1-301' }
  ];

  const TIME_PERIODS = [
    { name: '1-2节', time: '08:00-09:40', slot: 0 },
    { name: '3-4节', time: '10:00-11:40', slot: 0 },
    { name: '5-6节', time: '14:00-15:40', slot: 2 },
    { name: '7-8节', time: '16:00-17:40', slot: 2 }
  ];

  const REQUIRED_COURSE_LOAD = 9;
  const MAX_ELECTIVES = 3;
  const SEMESTER_LENGTH_DAYS = 45;
  const WEEK_SCHEDULE_DAYS = ['周一', '周二', '周三', '周四', '周五'];

  function shuffleArray(arr) {
    const copy = arr.slice();
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }

  function createEmptySchedule() {
    const schedule = {};
    WEEK_SCHEDULE_DAYS.forEach(day => {
      schedule[day] = [];
    });
    return schedule;
  }

  function getSemesterIndex(day) {
    return Math.floor((Math.max(1, day) - 1) / SEMESTER_LENGTH_DAYS);
  }

  function getSemesterLabel(semesterIndex) {
    const yearNames = ['一', '二', '三', '四'];
    const year = Math.floor(semesterIndex / 2) + 1;
    const term = semesterIndex % 2 === 0 ? '上学期' : '下学期';
    return `大${yearNames[Math.min(year, 4) - 1] || '四'}${term}`;
  }

  function countScheduleCourses(schedule) {
    return WEEK_SCHEDULE_DAYS.reduce((sum, day) => {
      const daySchedule = schedule && schedule[day] ? schedule[day] : [];
      return sum + daySchedule.filter(Boolean).length;
    }, 0);
  }

  function createScheduleCourse(course, periodIdx) {
    const period = TIME_PERIODS[periodIdx];
    return {
      name: course.name,
      type: course.type,
      loc: course.loc,
      periodName: period.name,
      periodTime: period.time
    };
  }

  function getElectiveByName(name) {
    return ELECTIVE_COURSES.find(course => course.name === name) || null;
  }

  function collectScheduledCourseNames(schedule) {
    const names = new Set();
    WEEK_SCHEDULE_DAYS.forEach(day => {
      const daySchedule = schedule && schedule[day] ? schedule[day] : [];
      daySchedule.forEach(course => {
        if (course && course.name) names.add(course.name);
      });
    });
    return names;
  }

  function getAllScheduleSlots(schedule) {
    const allSlots = {};
    WEEK_SCHEDULE_DAYS.forEach(day => {
      allSlots[day] = [];
      TIME_PERIODS.forEach((period, idx) => {
        allSlots[day].push({ day, periodIdx: idx });
      });
    });
    return allSlots;
  }

  function pickBalancedSlots(schedule, count) {
    const allSlots = getAllScheduleSlots(schedule);
    const picked = [];
    while (picked.length < count) {
      const dayCounts = WEEK_SCHEDULE_DAYS.map(day => {
        const daySchedule = schedule[day] || [];
        return {
          day,
          count: daySchedule.filter(Boolean).length
        };
      }).sort((a, b) => {
        if (a.count !== b.count) return a.count - b.count;
        return Math.random() - 0.5;
      });
      const target = dayCounts.find(item => (schedule[item.day] || []).filter(Boolean).length < TIME_PERIODS.length);
      if (!target) break;
      const available = shuffleArray(allSlots[target.day]).filter(slot => !(schedule[slot.day] || [])[slot.periodIdx]);
      if (!available.length) break;
      const slot = available[0];
      picked.push(slot);
      schedule[slot.day][slot.periodIdx] = { _reserved: true };
    }
    picked.forEach(slot => {
      delete schedule[slot.day][slot.periodIdx]._reserved;
      schedule[slot.day][slot.periodIdx] = null;
    });
    return picked;
  }

  function generateSemesterSchedule(requiredCourseLoad = REQUIRED_COURSE_LOAD, electiveNames = [], semesterIndex = 0) {
    const schedule = createEmptySchedule();
    const requiredSlots = Math.max(0, Math.min(requiredCourseLoad, WEEK_SCHEDULE_DAYS.length * TIME_PERIODS.length));
    const electiveSlots = Math.max(0, Math.min(electiveNames.length, WEEK_SCHEDULE_DAYS.length * TIME_PERIODS.length - requiredSlots));
    const selectedSlots = pickBalancedSlots(schedule, requiredSlots + electiveSlots);

    const freshmanCourses = [
      { name: '大学英语', type: 'sch-eng', loc: '教2-305' },
      { name: 'C语言程序设计', type: 'sch-prog', loc: '实验楼A' },
      { name: '高等数学', type: 'sch-math', loc: '教1-201' },
      { name: '体育', type: 'sch-pe', loc: '操场' },
      { name: '思想道德与政治', type: 'sch-eng', loc: '教2-101' },
      { name: '数据结构', type: 'sch-prog', loc: '实验楼B' },
      { name: '电路与电子学', type: 'sch-comp', loc: '实验楼D' },
      { name: '大学物理', type: 'sch-math', loc: '教1-301' },
      { name: '离散数学', type: 'sch-math', loc: '教1-101' }
    ];

    const yearIndex = Math.floor(semesterIndex / 2);
    const availableCourses = yearIndex === 0 ? freshmanCourses : COURSES;

    const requiredCourses = shuffleArray(availableCourses);
    const electives = shuffleArray(electiveNames.map(getElectiveByName).filter(Boolean));

    selectedSlots.slice(0, requiredSlots).forEach((slot, idx) => {
      const course = requiredCourses[idx % requiredCourses.length];
      schedule[slot.day][slot.periodIdx] = createScheduleCourse(course, slot.periodIdx);
    });

    selectedSlots.slice(requiredSlots).forEach((slot, idx) => {
      const course = electives[idx];
      if (!course) return;
      schedule[slot.day][slot.periodIdx] = createScheduleCourse(course, slot.periodIdx);
    });

    return schedule;
  }

  function addCourseToSchedule(schedule, course) {
    const picked = pickBalancedSlots(schedule, 1);
    if (!picked.length) return false;
    const slot = picked[0];
    schedule[slot.day][slot.periodIdx] = createScheduleCourse(course, slot.periodIdx);
    return true;
  }

  function ensureScheduleState(data) {
    if (!data) return;
    if (!Array.isArray(data.electives)) data.electives = [];
    data.electives = data.electives.filter((name, idx, arr) => getElectiveByName(name) && arr.indexOf(name) === idx).slice(0, MAX_ELECTIVES);
    if (typeof data.requiredCourseLoad !== 'number' || Number.isNaN(data.requiredCourseLoad)) {
      const currentLoad = countScheduleCourses(data.schedule);
      data.requiredCourseLoad = Math.max(REQUIRED_COURSE_LOAD, currentLoad - data.electives.length);
    }
    if (typeof data.scheduleSemester !== 'number' || Number.isNaN(data.scheduleSemester)) {
      data.scheduleSemester = getSemesterIndex(data.day || 1);
    }
    if (!data.schedule || typeof data.schedule !== 'object' || countScheduleCourses(data.schedule) === 0) {
      data.schedule = generateSemesterSchedule(data.requiredCourseLoad, data.electives, data.scheduleSemester);
      return;
    }

    const scheduledNames = collectScheduledCourseNames(data.schedule);
    data.electives.forEach(name => {
      if (scheduledNames.has(name)) return;
      const course = getElectiveByName(name);
      if (course && addCourseToSchedule(data.schedule, course)) {
        scheduledNames.add(name);
      }
    });
  }

  function trySelectElectiveCourse(courseName) {
    if (!currentGameData) return { ok: false, message: '当前没有可用存档。' };
    if (!currentGameData.electives) currentGameData.electives = [];
    if (currentGameData.electives.includes(courseName)) {
      return { ok: false, message: `《${courseName}》已经选过了。` };
    }
    if (currentGameData.electives.length >= MAX_ELECTIVES) {
      return { ok: false, message: `本学期选修课已选满 ${MAX_ELECTIVES} 节。` };
    }
    const course = getElectiveByName(courseName);
    if (!course) {
      return { ok: false, message: '未找到这门选修课。' };
    }
    if (!currentGameData.schedule) {
      currentGameData.schedule = generateSemesterSchedule(currentGameData.requiredCourseLoad || REQUIRED_COURSE_LOAD, currentGameData.electives || [], currentGameData.scheduleSemester || 0);
    }
    const inserted = addCourseToSchedule(currentGameData.schedule, course);
    if (!inserted) {
      return { ok: false, message: '课程表已经排满，暂时无法继续选课。' };
    }
    currentGameData.electives.push(courseName);
    return {
      ok: true,
      message: `✅ 已选择选修课：${courseName}\n当前课程量 +1，已选 ${currentGameData.electives.length}/${MAX_ELECTIVES} 节`
    };
  }

  function generateRandomSchedule() {
    const schedule = createEmptySchedule();
    const selected = [];
    const allSlots = getAllScheduleSlots(schedule);
    const dailyCounts = { '周一': 0, '周二': 0, '周三': 0, '周四': 0, '周五': 0 };
    const wednesdaySlots = allSlots['周三'].sort(() => Math.random() - 0.5);
    for (let i = 0; i < 3 && i < wednesdaySlots.length; i++) {
      selected.push(wednesdaySlots[i]);
      dailyCounts['周三']++;
    }
    const otherDays = ['周一', '周二', '周四', '周五'].sort(() => Math.random() - 0.5);
    const twoCourseDays = otherDays.slice(0, 2);
    const oneCourseDays = otherDays.slice(2, 4);
    twoCourseDays.forEach(day => {
      const slots = allSlots[day].sort(() => Math.random() - 0.5);
      for (let i = 0; i < 2 && i < slots.length; i++) {
        selected.push(slots[i]);
        dailyCounts[day]++;
      }
    });
    oneCourseDays.forEach(day => {
      const slots = allSlots[day].sort(() => Math.random() - 0.5);
      if (slots.length > 0) {
        selected.push(slots[0]);
        dailyCounts[day]++;
      }
    });
    const courseIndices = [];
    for (let i = 0; i < selected.length; i++) {
      courseIndices.push(Math.floor(Math.random() * COURSES.length));
    }
    selected.forEach((slot, i) => {
      const courseIdx = courseIndices[i];
      const course = COURSES[courseIdx];
      const period = TIME_PERIODS[slot.periodIdx];
      schedule[slot.day][slot.periodIdx] = {
        name: course.name,
        type: course.type,
        loc: course.loc,
        periodName: period.name,
        periodTime: period.time
      };
    });
    return schedule;
  }

  function renderScheduleTable() {
    if (!currentGameData) return '';
    const schedule = currentGameData.schedule || {};
    let html = `
      <div class="schedule-header">
        <div class="sch-cell sch-time">时间</div>
        <div class="sch-cell">周一</div>
        <div class="sch-cell">周二</div>
        <div class="sch-cell">周三</div>
        <div class="sch-cell">周四</div>
        <div class="sch-cell">周五</div>
      </div>`;
    TIME_PERIODS.forEach((period, pIdx) => {
      html += `<div class="schedule-row">
        <div class="sch-cell sch-time">${period.name}<br><span class="sch-small">${period.time}</span></div>`;
      ['周一', '周二', '周三', '周四', '周五'].forEach(day => {
        const daySchedule = schedule[day] || [];
        const course = daySchedule[pIdx];
        if (course) {
          html += `<div class="sch-cell sch-course ${course.type}">${course.name}<br><span class="sch-small">${course.loc}</span></div>`;
        } else {
          html += `<div class="sch-cell"></div>`;
        }
      });
      html += `</div>`;
    });
    return html;
  }

  /* ==========================================================
     页面路由
     ========================================================== */
  const pages = {
    cover: document.getElementById('page-cover'),
    save: document.getElementById('page-save'),
    game: document.getElementById('page-game'),
    fail: document.getElementById('page-fail')
  };
  function showPage(name) {
    Object.values(pages).forEach(p => { if (p) p.classList.remove('active'); });
    if (pages[name]) pages[name].classList.add('active');
    if (name === 'game') {
      startGameLoop();
    } else {
      stopGameLoop();
      // 离开游戏页时停止背景音乐
      if (window.gameAudio) gameAudio.stopBgm();
    }
  }

  /* ==========================================================
     存档页渲染
     ========================================================== */
  let savePageMode = 'new-game';
  const slotEls = document.querySelectorAll('.save-slot');

  function renderSaveSlots() {
    const saves = loadAllSaves();
    slotEls.forEach(slotEl => {
      const num = slotEl.dataset.slot;
      const data = saves[num];
      const emptyEl = slotEl.querySelector('.slot-empty');
      const dataEl = slotEl.querySelector('.slot-data');
      const actionEl = slotEl.querySelector('.slot-action');
      slotEl.classList.toggle('slot-has-data', !!data);
      slotEl.classList.toggle('slot-current', currentGameSlot === num);
      if (data) {
        emptyEl.style.display = 'none';
        dataEl.style.display = 'flex';
        slotEl.querySelector('.slot-day-num').textContent = data.day || 1;
        slotEl.querySelector('.slot-time').textContent = data.updatedAt || '—';
        slotEl.querySelector('.stat-study').textContent = data.program ?? 0;
        slotEl.querySelector('.stat-energy').textContent = data.health ?? 100;
        slotEl.querySelector('.stat-money').textContent = data.money ?? 1500;
        actionEl.textContent = (currentGameSlot === num) ? '当前存档' : (savePageMode === 'save' ? '点击继续' : '点击选择');
      } else {
        emptyEl.style.display = 'block';
        dataEl.style.display = 'none';
        actionEl.textContent = (savePageMode === 'new-game') ? '点击开始新游戏' : '空存档';
      }
    });
  }
  function refreshSavePageTitles() {
    const t = document.getElementById('save-page-title');
    const s = document.getElementById('save-page-subtitle');
    if (t) t.textContent = '选择存档';
    if (s) s.textContent = '点击空存档开始新游戏 · 已有存档将被询问是否覆盖';
    if (savePageMode === 'new-game') {
      if (t) t.textContent = '选择存档';
      if (s) s.textContent = '点击空存档开始新游戏 · 已有存档将被询问是否覆盖';
    } else {
      if (t) t.textContent = '选择存档继续';
      if (s) s.textContent = '点击任一有数据的存档 · 继续上次游戏进度';
    }
  }
  function enterSavePage(mode) {
    savePageMode = mode;
    refreshSavePageTitles();
    renderSaveSlots();
    showPage('save');
  }

  /* ==========================================================
     游戏状态
     ========================================================== */
  let currentGameSlot = null;
  let currentGameData = null;
  let gameLoopId = null;

  // 主角位置（像素坐标，feetY 为脚的 y 坐标）
  const GAME_W = 960;
  const GAME_H = 540;
  let playerX = 130;        // 主角当前 x 坐标（中心）
  let playerY = 540 - 30 - 90;  // 主角当前脚的 y 坐标
  let targetX = 130;        // 目标 x
  let targetY = 540 - 30 - 90;  // 目标 y
  let currentPath = [];     // 当前寻路路径点数组
  let playerFacing = 1;     // 1=朝右, -1=朝左
  let playerStepFrame = 0;  // 走路动画帧计数器
  let showXiaoguMenu = false; // 小谷交互菜单显示状态
  let showRoommateMenu = null; // 室友交互菜单（null/'xin'/'wang'/'tang'）

  // 室友数据：位置、衣服颜色、名称
  const ROOMMATES = [
    { key: 'xin', name: '老信', cx: 365, feetY: 150, color: '#4a8ac8' },
    { key: 'wang', name: '老王', cx: 365, feetY: 430, color: '#e86a4a' },
    { key: 'tang', name: '老唐', cx: 65, feetY: 150, color: '#e8a04a' }
  ];

  const LOCATIONS = {
    dorm: '寝室',
    canteen: '食堂',
    library: '图书馆',
    teaching: '教学楼',
    gym: '体育馆',
    mall: '校园超市',
    cafeteria: '咖啡厅',
    outdoor: '操场'
  };
  const TIME_SLOTS = ['上午', '中午', '下午', '傍晚', '夜晚', '深夜'];
  const WEEKDAYS = ['星期一', '星期二', '星期三', '星期四', '星期五', '星期六', '星期日'];
  const YEAR_NAMES = ['大一', '大二', '大三', '大四'];

  /* ==========================================================
     UI 更新
     ========================================================== */
  function updateStatusBars() {
    if (!currentGameData) return;
    const h = currentGameData.health;
    const p = currentGameData.program;
    const k = currentGameData.knowledge;
    const fillHealth = document.getElementById('fill-health');
    const fillProgram = document.getElementById('fill-program');
    const fillKnowledge = document.getElementById('fill-knowledge');
    const valHealth = document.getElementById('val-health');
    const valProgram = document.getElementById('val-program');
    const valKnowledge = document.getElementById('val-knowledge');
    if (fillHealth) fillHealth.style.width = h + '%';
    if (fillProgram) fillProgram.style.width = (p / 5) + '%';
    if (fillKnowledge) fillKnowledge.style.width = (k / 5) + '%';
    if (valHealth) valHealth.textContent = h;
    if (valProgram) valProgram.textContent = p;
    if (valKnowledge) valKnowledge.textContent = k;
  }

  function updateStatusInfo() {
    if (!currentGameData) return;
    const day = currentGameData.day;
    const infoSemester = document.getElementById('info-semester');
    const infoDay = document.getElementById('info-day');
    const infoMoney = document.getElementById('info-money');
    const infoLocation = document.getElementById('info-location');
    const phoneClock = document.getElementById('phone-clock');
    const yearIdx = Math.min(YEAR_NAMES.length - 1, Math.ceil(day / 90) - 1);
    if (infoSemester) infoSemester.textContent = YEAR_NAMES[yearIdx];
    if (infoDay) infoDay.textContent = WEEKDAYS[(day - 1) % 7];
    if (infoMoney) {
      const moneySpan = infoMoney.querySelector('span');
      if (moneySpan) moneySpan.textContent = currentGameData.money;
    }
    if (infoLocation) infoLocation.textContent = '🕒 ' + TIME_SLOTS[currentGameData.timeSlot];
    if (phoneClock) phoneClock.textContent = TIME_SLOTS[currentGameData.timeSlot];
    // 地图当前地点高亮
    document.querySelectorAll('.map-place').forEach(btn => {
      btn.classList.toggle('current', btn.dataset.place === currentGameData.location);
    });
  }

  function updateGameUI() {
    updateStatusBars();
    updateStatusInfo();
  }

  /* ==========================================================
     游戏主循环 (Canvas 渲染)
     ========================================================== */
  const gameCanvas = document.getElementById('game-canvas');
  const gctx = gameCanvas ? gameCanvas.getContext('2d') : null;
  if (gctx) gctx.imageSmoothingEnabled = false;

  // 获取当前场景的移动范围和障碍物
  function getSceneBounds() {
    const loc = currentGameData ? currentGameData.location : 'dorm';
    if (loc === 'teaching') {
      return {
        minX: 30, maxX: 930,
        minY: 400, maxY: 505,
        obstacles: [
          { x: 155, y: 440, w: 55, h: 55 }
        ]
      };
    }
    if (loc === 'outdoor') {
      return {
        minX: 30, maxX: 930,
        minY: 430, maxY: 480,
        obstacles: []
      };
    }
    return {
      minX: 30, maxX: 930,
      minY: 150, maxY: 505,
      obstacles: [
        { x: 720, y: 370, w: 240, h: 140 },
        { x: 735, y: 245, w: 220, h: 55 }
      ]
    };
  }

  function getSceneStartPos(loc) {
    if (loc === 'teaching') {
      return { x: 900, y: 450 };
    }
    if (loc === 'outdoor') {
      return { x: 480, y: 455 };
    }
    return { x: 130, y: GAME_H - 30 - 90 };
  }

  // 检查点是否在障碍物内
  function isInObstacle(x, y, obstacles) {
    for (const obs of obstacles) {
      if (x >= obs.x && x <= obs.x + obs.w && y >= obs.y && y <= obs.y + obs.h) {
        return true;
      }
    }
    return false;
  }

  // 寻路：简单几何绕行算法
  function findPath(startX, startY, targetX, targetY, bounds) {
    const path = [{ x: startX, y: startY }];

    // 检查直线是否被障碍物阻挡
    let blocked = false;
    let blockingObs = null;

    for (const obs of bounds.obstacles) {
      if (lineIntersectsRect(startX, startY, targetX, targetY, obs)) {
        blocked = true;
        blockingObs = obs;
        break;
      }
    }

    if (!blocked) {
      path.push({ x: targetX, y: targetY });
      return path;
    }

    // 计算绕行路径
    const obsTop = blockingObs.y - 5;
    const obsBottom = blockingObs.y + blockingObs.h + 5;
    const obsLeft = blockingObs.x - 5;
    const obsRight = blockingObs.x + blockingObs.w + 5;

    const topClear = obsTop >= bounds.minY + 10;
    const bottomClear = obsBottom <= bounds.maxY - 10;

    let bypassY;
    if (topClear) {
      bypassY = obsTop;
    } else if (bottomClear) {
      bypassY = obsBottom;
    } else {
      bypassY = Math.max(bounds.minY + 10, (bounds.minY + blockingObs.y) / 2);
    }

    bypassY = Math.max(bounds.minY + 5, Math.min(bounds.maxY - 5, bypassY));

    const startLeft = startX < blockingObs.x;
    const targetLeft = targetX < blockingObs.x;

    if (startLeft === targetLeft) {
      path.push({ x: targetX, y: targetY });
      return path;
    }

    if (startLeft) {
      path.push({ x: obsLeft, y: bypassY });
      path.push({ x: obsRight, y: bypassY });
    } else {
      path.push({ x: obsRight, y: bypassY });
      path.push({ x: obsLeft, y: bypassY });
    }

    path.push({ x: targetX, y: targetY });
    return path;
  }

  function lineIntersectsRect(x1, y1, x2, y2, rect) {
    const steps = 50;
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const px = x1 + (x2 - x1) * t;
      const py = y1 + (y2 - y1) * t;
      if (px >= rect.x && px <= rect.x + rect.w &&
          py >= rect.y && py <= rect.y + rect.h) {
        return true;
      }
    }
    return false;
  }

  function findNearestWalkable(startCol, startRow, bounds, gridSize) {
    const queue = [{ col: startCol, row: startRow }];
    const visited = new Set();
    visited.add(`${startCol},${startRow}`);

    const dirs = [
      { dx: 0, dy: -1 }, { dx: 0, dy: 1 },
      { dx: -1, dy: 0 }, { dx: 1, dy: 0 },
      { dx: -1, dy: -1 }, { dx: -1, dy: 1 },
      { dx: 1, dy: -1 }, { dx: 1, dy: 1 }
    ];

    while (queue.length > 0) {
      const current = queue.shift();

      for (const dir of dirs) {
        const col = current.col + dir.dx;
        const row = current.row + dir.dy;
        const key = `${col},${row}`;

        if (visited.has(key)) continue;
        visited.add(key);

        const nx = col * gridSize + gridSize / 2;
        const ny = row * gridSize + gridSize / 2;

        if (nx < bounds.minX || nx > bounds.maxX) continue;
        if (ny < bounds.minY || ny > bounds.maxY) continue;
        if (!isInObstacle(nx, ny, bounds.obstacles)) {
          return { col, row };
        }

        queue.push({ col, row });
      }
    }

    return null;
  }

  // 鼠标点击：主角移动到点击位置
  if (gameCanvas) {
    gameCanvas.addEventListener('click', function(e) {
      const rect = gameCanvas.getBoundingClientRect();
      const scaleX = gameCanvas.width / rect.width;
      const scaleY = gameCanvas.height / rect.height;
      const clickX = (e.clientX - rect.left) * scaleX;
      const clickY = (e.clientY - rect.top) * scaleY;

      const bounds = getSceneBounds();
      if (window.gameAudio) gameAudio.init();

      // 教学楼场景：检测点击102教室门
      const loc = currentGameData ? currentGameData.location : 'dorm';
      if (loc === 'teaching') {
        // 小谷菜单显示时，检测菜单点击
        if (showXiaoguMenu) {
          const menuX = 220;
          const menuY = 410;
          const menuW = 90;
          const menuH = 24;
          // 对话按钮
          if (clickX >= menuX && clickX <= menuX + menuW &&
              clickY >= menuY && clickY <= menuY + menuH) {
            showXiaoguMenu = false;
            if (window.gameAudio) gameAudio.play('click');
            talkToXiaogu();
            return;
          }
          // 送礼按钮
          if (clickX >= menuX && clickX <= menuX + menuW &&
              clickY >= menuY + 28 && clickY <= menuY + 28 + menuH) {
            if (window.gameAudio) gameAudio.play('click');
            return;
          }
          // 返回按钮
          if (clickX >= menuX && clickX <= menuX + menuW &&
              clickY >= menuY + 56 && clickY <= menuY + 56 + menuH) {
            showXiaoguMenu = false;
            if (window.gameAudio) gameAudio.play('close');
            return;
          }
          // 点击菜单外关闭
          showXiaoguMenu = false;
        }
        // 小谷点击区域：x=155-210, y=430-495
        if (clickX >= 150 && clickX <= 215 && clickY >= 425 && clickY <= 495) {
          showXiaoguMenu = true;
          if (window.gameAudio) gameAudio.play('click');
          return;
        }
        // 102教室门区域：x=500, y=280
        if (clickX >= 495 && clickX <= 555 && clickY >= 255 && clickY <= 390) {
          if (window.gameAudio) gameAudio.play('click');
          attendClass();
          return;
        }
      }

      // 寝室场景：室友交互
      if (loc === 'dorm') {
        // 室友菜单显示时，检测菜单点击
        if (showRoommateMenu) {
          const rm = ROOMMATES.find(r => r.key === showRoommateMenu);
          if (rm) {
            const menuW = 90;
            const menuH = 24;
            const gap = 4;
            let menuX = rm.cx + 30;
            if (menuX + menuW > 920) menuX = rm.cx - 30 - menuW;
            let menuY = rm.feetY - 60;
            if (menuY < 30) menuY = rm.feetY + 10;

            // 对话按钮
            if (clickX >= menuX && clickX <= menuX + menuW &&
                clickY >= menuY && clickY <= menuY + menuH) {
              const key = showRoommateMenu;
              showRoommateMenu = null;
              if (window.gameAudio) gameAudio.play('click');
              talkToRoommate(key);
              return;
            }
            // 送礼按钮
            if (clickX >= menuX && clickX <= menuX + menuW &&
                clickY >= menuY + menuH + gap && clickY <= menuY + menuH + gap + menuH) {
              if (window.gameAudio) gameAudio.play('click');
              return;
            }
            // 返回按钮
            if (clickX >= menuX && clickX <= menuX + menuW &&
                clickY >= menuY + (menuH + gap) * 2 && clickY <= menuY + (menuH + gap) * 2 + menuH) {
              showRoommateMenu = null;
              if (window.gameAudio) gameAudio.play('close');
              return;
            }
          }
          // 点击菜单外关闭
          showRoommateMenu = null;
        }
        // 检测点击室友
        for (const rm of ROOMMATES) {
          if (clickX >= rm.cx - 25 && clickX <= rm.cx + 25 &&
              clickY >= rm.feetY - 85 && clickY <= rm.feetY + 5) {
            showRoommateMenu = rm.key;
            if (window.gameAudio) gameAudio.play('click');
            return;
          }
        }
      }

      // === 场景物品拾取 ===
      if (currentGameData && currentGameData.sceneItems) {
        for (let i = currentGameData.sceneItems.length - 1; i >= 0; i--) {
          const item = currentGameData.sceneItems[i];
          const dx = clickX - (item.x + 10);
          const dy = clickY - (item.y + 10);
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 25) {
            addItemToBag({ name: item.name, icon: item.icon, desc: item.desc, count: 1 });
            currentGameData.sceneItems.splice(i, 1);
            if (window.gameAudio) gameAudio.play('pickup');
            openSimpleNotice(`🎒 获得物品：${item.name}\n${item.desc}`);
            return;
          }
        }
      }

      let finalTargetX = Math.max(bounds.minX, Math.min(bounds.maxX, clickX));
      let finalTargetY = Math.max(bounds.minY, Math.min(bounds.maxY, clickY));

      if (isInObstacle(finalTargetX, finalTargetY, bounds.obstacles)) {
        const obs = bounds.obstacles[0];
        const distLeft = Math.abs(finalTargetX - obs.x);
        const distRight = Math.abs(finalTargetX - (obs.x + obs.w));
        if (distLeft < distRight) {
          finalTargetX = obs.x - 10;
        } else {
          finalTargetX = obs.x + obs.w + 10;
        }
        finalTargetX = Math.max(bounds.minX, Math.min(bounds.maxX, finalTargetX));
      }

      const path = findPath(playerX, playerY, finalTargetX, finalTargetY, bounds);
      if (path && path.length > 1) {
        currentPath = path;
        targetX = finalTargetX;
        targetY = finalTargetY;
      } else {
        targetX = finalTargetX;
        targetY = finalTargetY;
        currentPath = [];
      }
    });
  }

  function startGameLoop() {
    if (gameLoopId) return;
    updateGameUI();
    playerX = 130;
    playerY = GAME_H - 30 - 90;
    targetX = playerX;
    targetY = playerY;
    let stuckFrames = 0;
    let lastPlayerX = playerX;
    let lastPlayerY = playerY;
    function loop() {
      const bounds = getSceneBounds();

      const speed = 2.5;
      let dx = 0, dy = 0, dist = 0;

      if (currentPath.length > 0) {
        const waypoint = currentPath[0];
        dx = waypoint.x - playerX;
        dy = waypoint.y - playerY;
        dist = Math.sqrt(dx * dx + dy * dy);

        if (dist <= speed) {
          playerX = waypoint.x;
          playerY = waypoint.y;
          currentPath.shift();
          if (currentPath.length === 0) {
            playerStepFrame = 0;
          }
        } else {
          playerX += (dx / dist) * speed;
          playerY += (dy / dist) * speed;
          playerStepFrame = (playerStepFrame + 1) % 60;
        }
      } else {
        dx = targetX - playerX;
        dy = targetY - playerY;
        dist = Math.sqrt(dx * dx + dy * dy);

        if (dist > speed) {
          const nextX = playerX + (dx / dist) * speed;
          const nextY = playerY + (dy / dist) * speed;
          const inObstacle = isInObstacle(nextX, nextY, bounds.obstacles);
          const outOfBounds = nextX < bounds.minX || nextX > bounds.maxX ||
                             nextY < bounds.minY || nextY > bounds.maxY;
          if (!inObstacle && !outOfBounds) {
            playerX = nextX;
            playerY = nextY;
            playerStepFrame = (playerStepFrame + 1) % 60;
          } else {
            const path = findPath(playerX, playerY, targetX, targetY, bounds);
            if (path && path.length > 1) {
              currentPath = path;
            } else {
              targetX = playerX;
              targetY = playerY;
            }
          }
        } else {
          playerX = targetX;
          playerY = targetY;
          playerStepFrame = 0;
        }
      }

      if (Math.abs(playerX - lastPlayerX) < 0.5 && Math.abs(playerY - lastPlayerY) < 0.5) {
        stuckFrames++;
        if (stuckFrames > 20 && (currentPath.length > 0 || dist > speed)) {
          stuckFrames = 0;
          currentPath = [];
          const path = findPath(playerX, playerY, targetX, targetY, bounds);
          if (path && path.length > 1) {
            currentPath = path;
          } else {
            targetX = playerX;
            targetY = playerY;
          }
        }
      } else {
        stuckFrames = 0;
      }
      lastPlayerX = playerX;
      lastPlayerY = playerY;

      if (Math.abs(dx) > 0.5) {
        playerFacing = dx > 0 ? 1 : -1;
      }

      // === 渲染场景 ===
      const fn = SCENE_FNS[currentGameData.location] || renderDormScene;
      fn();
      gameLoopId = requestAnimationFrame(loop);
    }
    loop();
  }
  function stopGameLoop() {
    if (gameLoopId) {
      cancelAnimationFrame(gameLoopId);
      gameLoopId = null;
    }
  }

  /* ==========================================================
     教学楼场景 Canvas 渲染
     ========================================================== */
  function drawVendingMachine(x, y) {
    // 自动售货机主体
    gctx.fillStyle = '#c0c0c8';
    gctx.fillRect(x, y, 80, 140);
    // 顶部面板
    gctx.fillStyle = '#a0a0a8';
    gctx.fillRect(x, y, 80, 20);
    // 显示屏
    gctx.fillStyle = '#2a3a4a';
    gctx.fillRect(x + 8, y + 5, 40, 12);
    gctx.fillStyle = '#4ae88a';
    gctx.fillRect(x + 10, y + 7, 36, 8);
    // 玻璃橱窗
    gctx.fillStyle = 'rgba(100,150,200,0.3)';
    gctx.fillRect(x + 6, y + 25, 68, 75);
    // 橱窗边框
    gctx.fillStyle = '#808088';
    gctx.fillRect(x + 4, y + 23, 72, 2);
    gctx.fillRect(x + 4, y + 98, 72, 2);
    gctx.fillRect(x + 4, y + 23, 2, 77);
    gctx.fillRect(x + 74, y + 23, 2, 77);
    // 饮料瓶（不同颜色）
    const drinkColors = ['#e84a4a', '#4a8ae8', '#4ae88a', '#e8e84a', '#e84ae8'];
    for (let i = 0; i < 5; i++) {
      const dx = x + 10 + i * 13;
      const dy = y + 30;
      gctx.fillStyle = drinkColors[i];
      gctx.fillRect(dx, dy, 10, 25);
      gctx.fillStyle = '#ffffff';
      gctx.fillRect(dx + 2, dy + 5, 6, 3);
    }
    for (let i = 0; i < 5; i++) {
      const dx = x + 10 + i * 13;
      const dy = y + 60;
      gctx.fillStyle = drinkColors[(i + 2) % 5];
      gctx.fillRect(dx, dy, 10, 25);
      gctx.fillStyle = '#ffffff';
      gctx.fillRect(dx + 2, dy + 5, 6, 3);
    }
    // 取货口
    gctx.fillStyle = '#3a3a40';
    gctx.fillRect(x + 10, y + 108, 45, 20);
    gctx.fillStyle = '#2a2a30';
    gctx.fillRect(x + 12, y + 110, 41, 16);
    // 投币口和按钮
    gctx.fillStyle = '#e8c040';
    gctx.fillRect(x + 60, y + 110, 14, 10);
    gctx.fillStyle = '#a08020';
    gctx.fillRect(x + 62, y + 113, 10, 4);
    // 按钮面板
    gctx.fillStyle = '#5a5a60';
    gctx.fillRect(x + 58, y + 30, 18, 70);
    for (let i = 0; i < 6; i++) {
      gctx.fillStyle = i < 3 ? '#e84a4a' : '#4ae88a';
      gctx.fillRect(x + 61, y + 33 + i * 11, 12, 8);
    }
  }

  function drawClassroomDoor(x, y, label) {
    // 教室门
    gctx.fillStyle = '#6a4a2a';
    gctx.fillRect(x - 5, y - 5, 60, 10);
    gctx.fillRect(x - 5, y - 5, 8, 110);
    gctx.fillRect(x + 47, y - 5, 8, 110);
    // 门板
    gctx.fillStyle = '#8b6914';
    gctx.fillRect(x, y, 50, 100);
    // 门上玻璃窗
    gctx.fillStyle = 'rgba(160,200,240,0.6)';
    gctx.fillRect(x + 5, y + 10, 40, 30);
    gctx.fillStyle = '#6a4a2a';
    gctx.fillRect(x + 23, y + 10, 4, 30);
    // 门把手
    gctx.fillStyle = '#d4a017';
    gctx.fillRect(x + 38, y + 55, 6, 8);
    // 门牌
    gctx.fillStyle = '#f0e0c0';
    gctx.fillRect(x + 8, y - 22, 34, 14);
    gctx.fillStyle = '#3a2a1a';
    gctx.font = 'bold 10px "ZCOOL KuaiLe",sans-serif';
    gctx.textAlign = 'center';
    gctx.fillText(label, x + 25, y - 12);
  }

  function drawXiaogu(cx, feetY) {
    // === 地面阴影 ===
    gctx.fillStyle = 'rgba(40,20,10,0.35)';
    gctx.fillRect(cx - 18, feetY, 36, 5);

    // === 腿（白色过膝长袜 + 粉色鞋子）===
    // 粉色鞋子
    gctx.fillStyle = '#d8a8b0';
    gctx.fillRect(cx - 13, feetY - 4, 12, 4);
    gctx.fillRect(cx + 1, feetY - 4, 12, 4);
    // 白色长袜（高22，和小白腿一样）
    gctx.fillStyle = '#fff5f0';
    gctx.fillRect(cx - 12, feetY - 22, 10, 18);
    gctx.fillRect(cx + 2, feetY - 22, 10, 18);
    // 袜口粉色边
    gctx.fillStyle = '#e8c0c8';
    gctx.fillRect(cx - 13, feetY - 24, 12, 2);
    gctx.fillRect(cx + 1, feetY - 24, 12, 2);

    // === 粉色连衣裙 ===
    // 裙子部分（高10，覆盖腿上部）
    gctx.fillStyle = '#e8b8c0';
    gctx.fillRect(cx - 15, feetY - 32, 30, 10);
    // 上身（高16，和小白身体上半对齐：feetY-48到feetY-32 = 16）
    gctx.fillStyle = '#e0b0b8';
    gctx.fillRect(cx - 14, feetY - 48, 28, 16);
    // 领口
    gctx.fillStyle = '#fff0e8';
    gctx.fillRect(cx - 6, feetY - 50, 12, 6);

    // === 蓬松横条纹短袖（位置对齐小白手臂）===
    // 左袖
    for (let i = 0; i < 4; i++) {
      gctx.fillStyle = i % 2 === 0 ? '#e8b8c0' : '#f0d0d8';
      gctx.fillRect(cx - 22, feetY - 46 + i * 4, 10, 4);
    }
    // 右袖
    for (let i = 0; i < 4; i++) {
      gctx.fillStyle = i % 2 === 0 ? '#e8b8c0' : '#f0d0d8';
      gctx.fillRect(cx + 12, feetY - 46 + i * 4, 10, 4);
    }
    // 手（对齐小白手的位置：feetY-30到feetY-18 = 12高，宽8）
    gctx.fillStyle = '#f5ddd0';
    gctx.fillRect(cx - 22, feetY - 30, 10, 8);
    gctx.fillRect(cx + 12, feetY - 30, 10, 8);

    // === 头部（和小白一样：宽28，高26，cx-14，feetY-74）
    gctx.fillStyle = '#c89898';
    gctx.fillRect(cx - 14, feetY - 74, 28, 26);

    // === 脸部（和小白一样：宽24，高20，cx-12，feetY-68）
    gctx.fillStyle = '#fff0e8';
    gctx.fillRect(cx - 12, feetY - 68, 24, 20);

    // 刘海
    gctx.fillStyle = '#c89898';
    gctx.fillRect(cx - 12, feetY - 68, 24, 6);
    // 头发两侧
    gctx.fillRect(cx - 14, feetY - 66, 4, 18);
    gctx.fillRect(cx + 10, feetY - 66, 4, 18);

    // 白色猫耳
    gctx.fillStyle = '#fff5f0';
    gctx.beginPath();
    gctx.moveTo(cx - 12, feetY - 76);
    gctx.lineTo(cx - 8, feetY - 86);
    gctx.lineTo(cx - 4, feetY - 76);
    gctx.fill();
    gctx.beginPath();
    gctx.moveTo(cx + 4, feetY - 76);
    gctx.lineTo(cx + 8, feetY - 86);
    gctx.lineTo(cx + 12, feetY - 76);
    gctx.fill();
    // 猫耳内部粉色
    gctx.fillStyle = '#e8b8c0';
    gctx.beginPath();
    gctx.moveTo(cx - 12, feetY - 76);
    gctx.lineTo(cx - 8, feetY - 82);
    gctx.lineTo(cx - 4, feetY - 76);
    gctx.fill();
    gctx.beginPath();
    gctx.moveTo(cx + 4, feetY - 76);
    gctx.lineTo(cx + 8, feetY - 82);
    gctx.lineTo(cx + 12, feetY - 76);
    gctx.fill();

    // === 眼睛（对齐小白眼睛位置：feetY-62，宽5高5）
    gctx.fillStyle = '#b88888';
    gctx.fillRect(cx - 8, feetY - 62, 5, 5);
    gctx.fillRect(cx + 3, feetY - 62, 5, 5);
    // 眼睛高光
    gctx.fillStyle = '#ffffff';
    gctx.fillRect(cx - 7, feetY - 61, 2, 2);
    gctx.fillRect(cx + 4, feetY - 61, 2, 2);

    // === 头顶好感度显示（点击小谷后显示）===
    if (showXiaoguMenu && currentGameData) {
      const favor = currentGameData.xiaoguFavor || 0;
      const label = `💕 ${favor}`;
      gctx.font = 'bold 12px "ZCOOL KuaiLe",sans-serif';
      gctx.textAlign = 'center';
      gctx.textBaseline = 'middle';
      const textW = gctx.measureText(label).width;
      const boxW = textW + 12;
      const boxH = 16;
      const boxX = cx - boxW / 2;
      const boxY = feetY - 100;
      // 气泡背景
      gctx.fillStyle = 'rgba(255, 240, 245, 0.95)';
      gctx.fillRect(boxX, boxY, boxW, boxH);
      // 粉色边框
      gctx.fillStyle = '#e8b8c0';
      gctx.fillRect(boxX, boxY, boxW, 1);
      gctx.fillRect(boxX, boxY + boxH - 1, boxW, 1);
      gctx.fillRect(boxX, boxY, 1, boxH);
      gctx.fillRect(boxX + boxW - 1, boxY, 1, boxH);
      // 小尾巴
      gctx.fillStyle = 'rgba(255, 240, 245, 0.95)';
      gctx.beginPath();
      gctx.moveTo(cx - 4, boxY + boxH);
      gctx.lineTo(cx, boxY + boxH + 5);
      gctx.lineTo(cx + 4, boxY + boxH);
      gctx.fill();
      // 文字
      gctx.fillStyle = '#8b3a4a';
      gctx.fillText(label, cx, boxY + boxH / 2);
    }

    // === 右上角名字显示（点击后显示）===
    if (showXiaoguMenu) {
      const nameLabel = '小谷';
      gctx.font = 'bold 13px "ZCOOL KuaiLe",sans-serif';
      gctx.textAlign = 'left';
      gctx.textBaseline = 'middle';
      const nameW = gctx.measureText(nameLabel).width;
      const nameBoxW = nameW + 8;
      const nameBoxH = 18;
      const nameBoxX = cx + 22;
      const nameBoxY = feetY - 78;
      gctx.fillStyle = '#fff5f0';
      gctx.fillRect(nameBoxX, nameBoxY, nameBoxW, nameBoxH);
      gctx.fillStyle = '#e8b8c0';
      gctx.fillRect(nameBoxX, nameBoxY, nameBoxW, 1);
      gctx.fillRect(nameBoxX, nameBoxY + nameBoxH - 1, nameBoxW, 1);
      gctx.fillRect(nameBoxX, nameBoxY, 1, nameBoxH);
      gctx.fillRect(nameBoxX + nameBoxW - 1, nameBoxY, 1, nameBoxH);
      gctx.fillStyle = '#8b3a4a';
      gctx.fillText(nameLabel, nameBoxX + 4, nameBoxY + nameBoxH / 2);
    }
  }

  function renderTeachingScene() {
    if (!gctx) return;
    const W = 960, H = 540;
    gctx.clearRect(0, 0, W, H);

    // === 走廊墙壁 ===
    // 墙壁下半部分（浅米色）
    gctx.fillStyle = '#e8dcc0';
    gctx.fillRect(0, 0, W, 380);
    // 墙壁上半部分（白色）
    gctx.fillStyle = '#f5f0e8';
    gctx.fillRect(0, 0, W, 180);
    // 墙裙线
    gctx.fillStyle = '#c8b088';
    gctx.fillRect(0, 178, W, 4);
    gctx.fillRect(0, 376, W, 4);

    // === 地面（走廊地砖）===
    gctx.fillStyle = '#d0c0a0';
    gctx.fillRect(0, 380, W, H - 380);
    // 地砖格子
    gctx.fillStyle = 'rgba(150,120,80,0.2)';
    for (let x = 0; x < W; x += 60) {
      gctx.fillRect(x, 380, 1, H - 380);
    }
    for (let y = 380; y < H; y += 40) {
      gctx.fillRect(0, y, W, 1);
    }

    // === 顶部照明（长条形荧光灯）===
    for (let i = 0; i < 5; i++) {
      const lx = 80 + i * 180;
      const ly = 20;
      gctx.fillStyle = '#e8e8e8';
      gctx.fillRect(lx, ly, 120, 12);
      gctx.fillStyle = '#ffffff';
      gctx.fillRect(lx + 2, ly + 2, 116, 8);
      gctx.fillStyle = 'rgba(255,255,200,0.3)';
      gctx.fillRect(lx - 10, ly + 12, 140, 30);
    }

    // === 窗户（走廊一侧，上方）===
    for (let i = 0; i < 4; i++) {
      const wx = 520 + i * 110;
      const wy = 50;
      // 窗框
      gctx.fillStyle = '#6a7a8a';
      gctx.fillRect(wx - 3, wy - 3, 96, 76);
      // 玻璃
      gctx.fillStyle = 'rgba(140,180,220,0.5)';
      gctx.fillRect(wx, wy, 90, 70);
      // 窗格
      gctx.fillStyle = '#6a7a8a';
      gctx.fillRect(wx + 43, wy, 4, 70);
      gctx.fillRect(wx, wy + 33, 90, 4);
    }

    // === 公告栏 ===
    gctx.fillStyle = '#8b6914';
    gctx.fillRect(40, 60, 120, 80);
    gctx.fillStyle = '#f5e8c8';
    gctx.fillRect(45, 65, 110, 70);
    gctx.fillStyle = '#3a2a1a';
    gctx.font = 'bold 12px "ZCOOL KuaiLe",sans-serif';
    gctx.textAlign = 'center';
    gctx.fillText('📋 公告栏', 100, 82);
    gctx.font = '10px "ZCOOL KuaiLe",sans-serif';
    gctx.fillText('本周课程表', 100, 100);
    gctx.fillText('期末考试安排', 100, 115);
    gctx.fillText('社团招新', 100, 130);

    // === 自动售货机（最左边）===
    drawVendingMachine(60, 240);

    // === 小谷（售货机旁边）===
    drawXiaogu(180, 380 + 100);

    // === 小谷交互菜单 ===
    if (showXiaoguMenu) {
      const menuX = 220;
      const menuY = 410;
      const menuW = 90;
      const menuH = 24;
      const gap = 4;
      const menuItems = ['对话', '送礼', '返回'];

      gctx.fillStyle = '#f5f0e0';
      gctx.fillRect(menuX - 2, menuY - 2, menuW + 4, menuH * 3 + gap * 2 + 4);
      gctx.fillStyle = '#c8a574';
      gctx.fillRect(menuX - 2, menuY - 2, menuW + 4, 2);
      gctx.fillRect(menuX - 2, menuY + menuH * 3 + gap * 2, menuW + 4, 2);
      gctx.fillRect(menuX - 2, menuY - 2, 2, menuH * 3 + gap * 2 + 4);
      gctx.fillRect(menuX + menuW, menuY - 2, 2, menuH * 3 + gap * 2 + 4);

      menuItems.forEach((item, idx) => {
        const by = menuY + idx * (menuH + gap);
        gctx.fillStyle = '#e8dcc0';
        gctx.fillRect(menuX, by, menuW, menuH);
        gctx.fillStyle = '#5c3a1a';
        gctx.font = '14px sans-serif';
        gctx.textAlign = 'center';
        gctx.textBaseline = 'middle';
        gctx.fillText(item, menuX + menuW / 2, by + menuH / 2);
      });
    }

    // === 教室门（往右边几间）===
    drawClassroomDoor(280, 280, '101');
    drawClassroomDoor(500, 280, '102');
    drawClassroomDoor(720, 280, '103');

    // === 走廊尽头的楼梯间 ===
    gctx.fillStyle = '#5a5a60';
    gctx.fillRect(W - 70, 250, 60, 130);
    gctx.fillStyle = '#4a4a50';
    gctx.fillRect(W - 65, 255, 50, 120);
    // 楼梯标识
    gctx.fillStyle = '#ffffff';
    gctx.font = 'bold 14px "ZCOOL KuaiLe",sans-serif';
    gctx.textAlign = 'center';
    gctx.fillText('楼梯', W - 40, 320);

    // === 主角（动态位置）===
    drawDormPlayer(playerX, playerY, playerFacing, playerStepFrame);
    drawSceneItems();
  }

  /* ==========================================================
     寝室场景 Canvas 渲染
     ========================================================== */
  function renderDormScene() {
    if (!gctx) return;
    const W = 960, H = 540;
    gctx.clearRect(0, 0, W, H);

    // === 墙壁背景 ===
    // 淡米色墙面
    gctx.fillStyle = '#e8d9b5';
    gctx.fillRect(0, 0, W, H);

    // 墙面纹理（竖向条纹）
    gctx.fillStyle = 'rgba(180,150,110,0.15)';
    for (let x = 0; x < W; x += 20) {
      gctx.fillRect(x, 0, 2, H);
    }

    // 踢脚线（木质棕色）
    gctx.fillStyle = '#8b5a3a';
    gctx.fillRect(0, H - 30, W, 4);
    gctx.fillStyle = '#6a3a2a';
    gctx.fillRect(0, H - 26, W, 22);

    // === 天花板 ===
    gctx.fillStyle = '#d4c4a0';
    gctx.fillRect(0, 0, W, 20);
    // 吊灯
    gctx.fillStyle = '#8a8a8a';
    gctx.fillRect(W/2 - 30, 20, 60, 8);
    gctx.fillStyle = '#fff8e0';
    gctx.fillRect(W/2 - 20, 28, 40, 12);
    // 灯光发光效果
    const lightGrd = gctx.createRadialGradient(W/2, 34, 0, W/2, 34, 120);
    lightGrd.addColorStop(0, 'rgba(255,248,200,0.2)');
    lightGrd.addColorStop(1, 'rgba(255,248,200,0)');
    gctx.fillStyle = lightGrd;
    gctx.fillRect(W/2 - 120, 28, 240, 200);

    // === 地面（木地板） ===
    gctx.fillStyle = '#c8a878';
    gctx.fillRect(0, H - 30, W, 30);
    gctx.fillStyle = '#b89868';
    gctx.fillRect(0, H - 30, W, 2);
    // 地板横纹
    gctx.fillStyle = '#a87848';
    for (let y = H - 28; y < H; y += 8) {
      gctx.fillRect(0, y, W, 1);
    }

    // === 寝室门（左侧入口）===
    gctx.fillStyle = '#b87848';
    gctx.fillRect(0, 80, 8, 260);
    gctx.fillStyle = '#8a5a2a';
    gctx.fillRect(0, 80, 4, 260);
    gctx.fillStyle = '#d4a060';
    gctx.fillRect(2, 160, 4, 30);

    // === 左右分区墙 ===
    // 寝室和阳台的分隔线（垂直虚线），阳台占寝室宽度的1/4（960/4=240）
    gctx.fillStyle = 'rgba(138, 90, 58, 0.3)';
    gctx.fillRect(720, 25, 2, H - 55);

    // === 四个上床下桌（放在左边寝室区，2x2布局）===
    // 左上
    drawPixelBunkDesk(40, 50, 180, 100, 0);
    // 左下
    drawPixelBunkDesk(40, H - 30 - 180, 180, 100, 1);
    // 右上
    drawPixelBunkDesk(340, 50, 180, 100, 2);
    // 右下
    drawPixelBunkDesk(340, H - 30 - 180, 180, 100, 3);

    // === 右侧：阳台（上半部分，占寝室宽度1/4，宽240）===
    // 阳台地面（瓷砖）
    gctx.fillStyle = '#c8d8e8';
    gctx.fillRect(720, 30, 240, H - 60);

    // 阳台外景色（窗户效果）
    gctx.fillStyle = '#a8c8e8';
    gctx.fillRect(728, 40, 224, 160);

    // 窗户（多格玻璃）
    gctx.fillStyle = '#6a4a2a';
    gctx.fillRect(728, 40, 224, 4);   // 上框
    gctx.fillRect(728, 196, 224, 4);  // 下框
    gctx.fillRect(728, 40, 4, 160);   // 左框
    gctx.fillRect(948, 40, 4, 160);   // 右框

    // 中间分割（竖格）
    gctx.fillRect(838, 40, 4, 160);
    // 中间分割（横格）
    gctx.fillRect(728, 118, 224, 4);

    // 玻璃反光
    gctx.fillStyle = 'rgba(255,255,255,0.3)';
    gctx.fillRect(738, 48, 25, 30);
    gctx.fillRect(850, 130, 20, 25);

    // 窗外天空蓝色
    gctx.fillStyle = '#8ab8e0';
    gctx.fillRect(732, 44, 216, 152);

    // 阳台地砖格子
    gctx.fillStyle = '#b8c8d8';
    for (let x = 720; x < 960; x += 24) {
      gctx.fillRect(x, 220, 1, H - 250);
    }
    for (let y = 220; y < H - 30; y += 24) {
      gctx.fillRect(720, y, 240, 1);
    }

    // 阳台栏杆（在窗户下方）
    gctx.fillStyle = '#8ab8e0';
    gctx.fillRect(720, 220, 240, 8);
    gctx.fillStyle = '#6a98c0';
    for (let rx = 720; rx < 960; rx += 20) {
      gctx.fillRect(rx, 220, 4, 4);
    }

    // 阳台上的晾衣杆
    gctx.fillStyle = '#8a8a8a';
    gctx.fillRect(735, 245, 210, 3);
    gctx.fillRect(735, 245, 3, 18);
    gctx.fillRect(942, 245, 3, 18);
    // 挂着的衣服（3件，更紧凑）
    gctx.fillStyle = '#4a8ac8';
    gctx.fillRect(755, 250, 35, 45);
    gctx.fillStyle = '#e88a4a';
    gctx.fillRect(810, 250, 35, 45);
    gctx.fillStyle = '#9a4ae8';
    gctx.fillRect(865, 250, 35, 45);
    gctx.fillStyle = '#4ac88a';
    gctx.fillRect(920, 250, 20, 40);

    // === 右侧：卫生间（下半部分，宽240）===
    const bathX = 720;
    const bathY = H - 30 - 140;
    const bathW = 240;
    const bathH = 140;

    // 卫生间地面（湿区，更亮的瓷砖）
    gctx.fillStyle = '#d8e8f0';
    gctx.fillRect(bathX, bathY, bathW, bathH);

    // 卫生间格子地板
    gctx.fillStyle = '#b8d0e0';
    for (let bx = bathX; bx < bathX + bathW; bx += 20) {
      gctx.fillRect(bx, bathY, 1, bathH);
    }
    for (let by = bathY; by < bathY + bathH; by += 20) {
      gctx.fillRect(bathX, by, bathW, 1);
    }

    // 卫生间门框
    gctx.fillStyle = '#8a5a3a';
    gctx.fillRect(bathX - 6, bathY - 8, bathW + 12, 8);
    gctx.fillRect(bathX - 6, bathY - 8, 6, bathH + 8);
    gctx.fillRect(bathX + bathW, bathY - 8, 6, bathH + 8);
    gctx.fillRect(bathX - 6, bathY + bathH, bathW + 12, 6);

    // 淋浴区（玻璃隔断，缩小版）
    gctx.fillStyle = 'rgba(180, 200, 230, 0.5)';
    gctx.fillRect(bathX, bathY + 35, 65, bathH - 35);
    // 淋浴玻璃框
    gctx.fillStyle = '#6a8aa8';
    gctx.fillRect(bathX, bathY + 35, 65, 3);
    gctx.fillRect(bathX, bathY + 35, 3, bathH - 35);
    gctx.fillRect(bathX + 65, bathY + 35, 3, bathH - 35);
    // 淋浴喷头
    gctx.fillStyle = '#8a8a8a';
    gctx.fillRect(bathX + 28, bathY + 45, 15, 3);
    gctx.fillRect(bathX + 32, bathY + 48, 7, 12);

    // 洗手台（缩小版）
    gctx.fillStyle = '#e8e8e8';
    gctx.fillRect(bathX + 70, bathY + 50, 55, 18);
    // 洗手盆
    gctx.fillStyle = '#a8a8a8';
    gctx.fillRect(bathX + 78, bathY + 52, 38, 14);
    gctx.fillStyle = '#c8e0f0';
    gctx.fillRect(bathX + 81, bathY + 54, 32, 10);
    // 水龙头
    gctx.fillStyle = '#c8c8c8';
    gctx.fillRect(bathX + 95, bathY + 45, 4, 8);
    gctx.fillRect(bathX + 92, bathY + 45, 10, 3);

    // 镜子（缩小版）
    gctx.fillStyle = '#3a3a4a';
    gctx.fillRect(bathX + 70, bathY + 5, 55, 35);
    gctx.fillStyle = '#5a7a9a';
    gctx.fillRect(bathX + 72, bathY + 7, 51, 31);
    gctx.fillStyle = 'rgba(255,255,255,0.4)';
    gctx.fillRect(bathX + 75, bathY + 10, 12, 8);

    // 马桶（缩小版）
    gctx.fillStyle = '#e8e8e8';
    gctx.fillRect(bathX + 130, bathY + 48, 32, 22);
    gctx.fillStyle = '#d8d8d8';
    gctx.fillRect(bathX + 130, bathY + 48, 32, 4);
    gctx.fillStyle = '#f8f8f8';
    gctx.fillRect(bathX + 134, bathY + 52, 24, 14);

    // 洗衣机（缩小版）
    gctx.fillStyle = '#e0e0e5';
    gctx.fillRect(bathX + 170, bathY + 25, 65, 95);
    // 洗衣机顶部面板
    gctx.fillStyle = '#c8c8d0';
    gctx.fillRect(bathX + 170, bathY + 25, 65, 10);
    // 洗衣机滚筒门
    gctx.fillStyle = '#3a4a5a';
    gctx.beginPath();
    gctx.arc(bathX + 202, bathY + 72, 18, 0, Math.PI * 2);
    gctx.fill();
    gctx.fillStyle = '#5a7a8a';
    gctx.beginPath();
    gctx.arc(bathX + 202, bathY + 72, 14, 0, Math.PI * 2);
    gctx.fill();
    gctx.fillStyle = 'rgba(180, 210, 230, 0.5)';
    gctx.beginPath();
    gctx.arc(bathX + 202, bathY + 72, 10, 0, Math.PI * 2);
    gctx.fill();
    // 洗衣机控制面板
    gctx.fillStyle = '#2a3a4a';
    gctx.fillRect(bathX + 173, bathY + 29, 58, 4);
    gctx.fillStyle = '#4a6a7a';
    gctx.fillRect(bathX + 175, bathY + 30, 20, 2);
    gctx.fillStyle = '#e84a4a';
    gctx.fillRect(bathX + 208, bathY + 30, 3, 2);
    gctx.fillStyle = '#4ae88a';
    gctx.fillRect(bathX + 215, bathY + 30, 3, 2);
    // 洗衣机底部
    gctx.fillStyle = '#a8a8b0';
    gctx.fillRect(bathX + 170, bathY + 115, 65, 4);

    // 卫生间标识牌
    gctx.fillStyle = '#3a2a1a';
    gctx.font = 'bold 12px "ZCOOL KuaiLe",sans-serif';
    gctx.textAlign = 'center';
    gctx.fillText('🚿 卫生间', (bathX + bathX + bathW) / 2, bathY - 14);

    // === 室友们（坐在各自书桌前，按图中像素风格）===
    // 老信：右上书桌（书桌2，x=340），穿蓝色T恤
    drawRoommatePixel(ROOMMATES[0].cx, ROOMMATES[0].feetY, ROOMMATES[0].color);
    // 老王：右下书桌（书桌3，x=340），穿橙色T恤
    drawRoommatePixel(ROOMMATES[1].cx, ROOMMATES[1].feetY, ROOMMATES[1].color);
    // 老唐：左上书桌（书桌0，x=40），穿橙色T恤
    drawRoommatePixel(ROOMMATES[2].cx, ROOMMATES[2].feetY, ROOMMATES[2].color);

    // === 室友交互菜单 ===
    if (showRoommateMenu) {
      const rm = ROOMMATES.find(r => r.key === showRoommateMenu);
      if (rm) {
        const menuW = 90;
        const menuH = 24;
        const gap = 4;
        const menuItems = ['对话', '送礼', '返回'];
        // 菜单位置：在室友右侧，如果太靠右则放左侧
        let menuX = rm.cx + 30;
        if (menuX + menuW > 920) menuX = rm.cx - 30 - menuW;
        let menuY = rm.feetY - 60;
        if (menuY < 30) menuY = rm.feetY + 10;

        gctx.fillStyle = '#f5f0e0';
        gctx.fillRect(menuX - 2, menuY - 2, menuW + 4, menuH * 3 + gap * 2 + 4);
        gctx.fillStyle = '#c8a574';
        gctx.fillRect(menuX - 2, menuY - 2, menuW + 4, 2);
        gctx.fillRect(menuX - 2, menuY + menuH * 3 + gap * 2, menuW + 4, 2);
        gctx.fillRect(menuX - 2, menuY - 2, 2, menuH * 3 + gap * 2 + 4);
        gctx.fillRect(menuX + menuW, menuY - 2, 2, menuH * 3 + gap * 2 + 4);

        menuItems.forEach((item, idx) => {
          const by = menuY + idx * (menuH + gap);
          gctx.fillStyle = '#e8dcc0';
          gctx.fillRect(menuX, by, menuW, menuH);
          gctx.fillStyle = '#5c3a1a';
          gctx.font = '14px sans-serif';
          gctx.textAlign = 'center';
          gctx.textBaseline = 'middle';
          gctx.fillText(item, menuX + menuW / 2, by + menuH / 2);
        });

        // 室友头顶好感度气泡
        if (currentGameData && currentGameData.roommateFavors) {
          const favor = currentGameData.roommateFavors[rm.key] || 0;
          const label = `💕 ${favor}`;
          gctx.font = 'bold 12px "ZCOOL KuaiLe",sans-serif';
          gctx.textAlign = 'center';
          gctx.textBaseline = 'middle';
          const textW = gctx.measureText(label).width;
          const boxW = textW + 12;
          const boxH = 16;
          const boxX = rm.cx - boxW / 2;
          const boxY = rm.feetY - 95;
          gctx.fillStyle = 'rgba(255, 240, 245, 0.95)';
          gctx.fillRect(boxX, boxY, boxW, boxH);
          gctx.fillStyle = '#e8b8c0';
          gctx.fillRect(boxX, boxY, boxW, 1);
          gctx.fillRect(boxX, boxY + boxH - 1, boxW, 1);
          gctx.fillRect(boxX, boxY, 1, boxH);
          gctx.fillRect(boxX + boxW - 1, boxY, 1, boxH);
          gctx.fillStyle = 'rgba(255, 240, 245, 0.95)';
          gctx.beginPath();
          gctx.moveTo(rm.cx - 4, boxY + boxH);
          gctx.lineTo(rm.cx, boxY + boxH + 5);
          gctx.lineTo(rm.cx + 4, boxY + boxH);
          gctx.fill();
          gctx.fillStyle = '#8b3a4a';
          gctx.fillText(label, rm.cx, boxY + boxH / 2);
        }

        // 右上角名字显示
        const nameLabel = rm.name;
        gctx.font = 'bold 13px "ZCOOL KuaiLe",sans-serif';
        gctx.textAlign = 'left';
        gctx.textBaseline = 'middle';
        const nameW = gctx.measureText(nameLabel).width;
        const nameBoxW = nameW + 8;
        const nameBoxH = 18;
        const nameBoxX = rm.cx + 22;
        const nameBoxY = rm.feetY - 78;
        gctx.fillStyle = '#fff5f0';
        gctx.fillRect(nameBoxX, nameBoxY, nameBoxW, nameBoxH);
        gctx.fillStyle = '#c8a574';
        gctx.fillRect(nameBoxX, nameBoxY, nameBoxW, 1);
        gctx.fillRect(nameBoxX, nameBoxY + nameBoxH - 1, nameBoxW, 1);
        gctx.fillRect(nameBoxX, nameBoxY, 1, nameBoxH);
        gctx.fillRect(nameBoxX + nameBoxW - 1, nameBoxY, 1, nameBoxH);
        gctx.fillStyle = '#5c3a1a';
        gctx.fillText(nameLabel, nameBoxX + 4, nameBoxY + nameBoxH / 2);
      }
    }

    // === 主角小白（动态坐标，鼠标点击控制移动）===
    drawDormPlayer(playerX, playerY, playerFacing, playerStepFrame);
    drawSceneItems();
  }

  function drawDormDoor(x, y, w, h) {
    // 门框
    gctx.fillStyle = '#6a4a2a';
    gctx.fillRect(x - 6, y - 6, w + 12, 10);
    gctx.fillRect(x - 6, y - 6, 6, h + 6);
    gctx.fillRect(x + w, y - 6, 6, h + 6);
    // 门框底
    gctx.fillRect(x - 6, y + h, w + 12, 6);

    // 玻璃门（半透明蓝色）
    gctx.fillStyle = 'rgba(160,200,240,0.7)';
    gctx.fillRect(x, y, w/2 - 2, h);
    gctx.fillRect(x + w/2 + 2, y, w/2 - 2, h);
    // 门框中间分割
    gctx.fillStyle = '#6a4a2a';
    gctx.fillRect(x + w/2 - 1, y, 2, h);

    // 门把手
    gctx.fillStyle = '#d4a017';
    gctx.fillRect(x + w/2 - 10, y + h/2 - 4, 8, 8);
    gctx.fillStyle = '#a07800';
    gctx.fillRect(x + w/2 - 9, y + h/2 - 3, 6, 6);

    // 阳台外景（简化）
    gctx.fillStyle = '#a8d8ea';
    gctx.fillRect(x + 2, y + 2, w - 4, h - 4);
    // 阳台地面
    gctx.fillStyle = '#c8d8e8';
    gctx.fillRect(x + 2, y + h - 40, w - 4, 36);
    // 阳台栏杆
    gctx.fillStyle = '#8ab8e0';
    gctx.fillRect(x - 8, y + h - 60, w + 16, 8);
    gctx.fillStyle = '#6a98c0';
    for (let bx = x - 8; bx < x + w + 8; bx += 20) {
      gctx.fillRect(bx, y + h - 60, 4, 60);
    }
    // 栏杆扶手
    gctx.fillStyle = '#aac8e0';
    gctx.fillRect(x - 10, y + h - 64, w + 20, 6);
    // 天空
    gctx.fillStyle = '#c8e8ff';
    gctx.fillRect(x + 2, y + 2, w - 4, h - 60);
  }

  function drawBunkDesk(bx, by, bw, bh) {
    const W = 960, H = 540;
    // 上床
    const bedY = by + 40;
    const bedH = 50;
    // 床架
    gctx.fillStyle = '#8a5a2a';
    gctx.fillRect(bx + 10, bedY, bw - 20, 8);     // 床头板
    gctx.fillRect(bx + 10, bedY + bedH - 8, bw - 20, 8);  // 床尾板
    gctx.fillRect(bx + 10, bedY, 6, bedH);        // 左侧柱
    gctx.fillRect(bx + bw - 16, bedY, 6, bedH);   // 右侧柱
    // 床垫/被子
    gctx.fillStyle = '#f0e8d8';
    gctx.fillRect(bx + 16, bedY + 8, bw - 32, bedH - 16);
    // 被子花纹
    gctx.fillStyle = 'rgba(180,140,100,0.3)';
    gctx.fillRect(bx + 20, bedY + 12, bw - 40, bedH - 22);
    // 枕头
    gctx.fillStyle = '#fff8f0';
    gctx.fillRect(bx + 18, bedY + 10, 30, 16);

    // 下桌
    const deskY = bedY + bedH + 5;
    const deskH = bh - bedH - 5;
    // 桌面
    gctx.fillStyle = '#c8a060';
    gctx.fillRect(bx, deskY, bw, 8);
    gctx.fillStyle = '#b88848';
    gctx.fillRect(bx, deskY + 8, bw, 4);
    // 桌面物品
    // 显示器
    gctx.fillStyle = '#1a1a2a';
    gctx.fillRect(bx + bw/2 - 35, deskY - 60, 70, 50);
    gctx.fillStyle = '#2a4a6a';
    gctx.fillRect(bx + bw/2 - 31, deskY - 56, 62, 42);
    // 显示器支架
    gctx.fillStyle = '#4a4a5a';
    gctx.fillRect(bx + bw/2 - 6, deskY - 14, 12, 10);
    gctx.fillRect(bx + bw/2 - 20, deskY - 6, 40, 4);
    // 键盘
    gctx.fillStyle = '#2a2a3a';
    gctx.fillRect(bx + bw/2 - 30, deskY - 10, 60, 10);
    gctx.fillStyle = '#3a3a4a';
    gctx.fillRect(bx + bw/2 - 28, deskY - 8, 56, 6);
    // 鼠标
    gctx.fillStyle = '#1a1a2a';
    gctx.fillRect(bx + bw/2 + 20, deskY - 8, 14, 8);
    // 主机
    gctx.fillStyle = '#2a2a3a';
    gctx.fillRect(bx + bw - 40, deskY - 50, 30, 50);
    gctx.fillStyle = '#1a1a2a';
    gctx.fillRect(bx + bw - 38, deskY - 48, 26, 46);
    // 主机指示灯
    gctx.fillStyle = '#00ff44';
    gctx.fillRect(bx + bw - 36, deskY - 44, 4, 4);
    // 书架
    gctx.fillStyle = '#8a5a2a';
    gctx.fillRect(bx, deskY - 90, 30, 90);
    gctx.fillStyle = '#b88848';
    for (let r = 0; r < 3; r++) {
      gctx.fillRect(bx, deskY - 90 + r * 28, 28, 4);
    }
    // 书架上的书
    const bookColors = ['#e84a4a','#4a9ae8','#4ae84a','#e8a04a','#9a4ae8'];
    for (let r = 0; r < 3; r++) {
      for (let i = 0; i < 4; i++) {
        gctx.fillStyle = bookColors[(r*4+i) % bookColors.length];
        gctx.fillRect(bx + 2 + i * 6, deskY - 90 + r * 28 - 18, 5, 16);
      }
    }
    // 桌子腿
    gctx.fillStyle = '#8a5a2a';
    gctx.fillRect(bx + 4, deskY + 12, 6, deskH - 12);
    gctx.fillRect(bx + bw - 10, deskY + 12, 6, deskH - 12);
    // 椅子
    const chairX = bx + bw/2 - 20;
    const chairY = deskY + deskH - 20;
    gctx.fillStyle = '#5a3a1a';
    gctx.fillRect(chairX, chairY - 30, 40, 5);
    gctx.fillRect(chairX + 4, chairY - 30, 4, 30);
    gctx.fillRect(chairX + 32, chairY - 30, 4, 30);
    gctx.fillRect(chairX, chairY, 40, 5);
  }

  // 像素风格上床下桌（按图中样式）
  function drawPixelBunkDesk(bx, by, bw, bh, index) {
    // === 上床部分 ===
    const bedH = 45;
    // 床架（深棕色）
    gctx.fillStyle = '#6a3a1a';
    gctx.fillRect(bx, by, bw, 6);     // 床头横梁
    gctx.fillRect(bx, by + bedH - 6, bw, 6);  // 床尾横梁
    gctx.fillRect(bx, by, 8, bedH);   // 左立柱
    gctx.fillRect(bx + bw - 8, by, 8, bedH); // 右立柱
    // 床底横梁
    gctx.fillRect(bx + 8, by + bedH/2 - 2, bw - 16, 4);
    
    // 床垫（蓝色）
    gctx.fillStyle = '#6a98c8';
    gctx.fillRect(bx + 8, by + 6, bw - 16, bedH - 12);
    
    // 被子（白色/淡黄色，带格子花纹）
    gctx.fillStyle = '#f8f4e0';
    gctx.fillRect(bx + 10, by + 8, bw - 20, bedH - 16);
    // 被子格子花纹
    gctx.fillStyle = '#e0d8b8';
    for (let i = 0; i < 6; i++) {
      const gx = bx + 12 + i * 18;
      for (let j = 0; j < 2; j++) {
        const gy = by + 10 + j * 12;
        gctx.fillRect(gx, gy, 14, 8);
      }
    }
    
    // 枕头（浅黄色）
    gctx.fillStyle = '#f0d898';
    gctx.fillRect(bx + 12, by + 8, 24, 12);
    
    // === 下桌部分 ===
    const deskTopY = by + bedH;
    const deskH = bh - bedH;
    
    // 桌面（木黄色）
    gctx.fillStyle = '#d4a858';
    gctx.fillRect(bx, deskTopY, bw, 8);
    // 桌面边缘
    gctx.fillStyle = '#b88840';
    gctx.fillRect(bx, deskTopY + 8, bw, 4);
    
    // 桌腿
    gctx.fillStyle = '#8a5a2a';
    gctx.fillRect(bx + 6, deskTopY + 12, 6, deskH - 12);
    gctx.fillRect(bx + bw - 12, deskTopY + 12, 6, deskH - 12);
    
    // === 桌面物品 ===
    // 笔记本电脑
    gctx.fillStyle = '#3a3a4a';
    gctx.fillRect(bx + bw/2 - 28, deskTopY - 45, 56, 38);
    // 屏幕
    gctx.fillStyle = '#5a7a9a';
    gctx.fillRect(bx + bw/2 - 24, deskTopY - 41, 48, 28);
    // 键盘区域
    gctx.fillStyle = '#2a2a3a';
    gctx.fillRect(bx + bw/2 - 24, deskTopY - 10, 48, 6);
    // 触控板
    gctx.fillStyle = '#4a4a5a';
    gctx.fillRect(bx + bw/2 + 8, deskTopY - 8, 12, 4);
    
    // === 右侧储物柜/书架 ===
    const shelfW = 45;
    gctx.fillStyle = '#c8a050';
    gctx.fillRect(bx + bw - shelfW, deskTopY + 12, shelfW, deskH - 12);
    // 隔板
    gctx.fillStyle = '#a88038';
    gctx.fillRect(bx + bw - shelfW, deskTopY + 12 + deskH/3, shelfW, 3);
    gctx.fillRect(bx + bw - shelfW, deskTopY + 12 + deskH*2/3, shelfW, 3);
    
    // 柜子里的物品（不同书桌放不同物品）
    const items = [
      // 书桌0（主角的）- 有水壶和书籍
      [{x:0,y:0,w:12,h:18,col:'#4a8ac8'}, {x:18,y:2,w:6,h:14,col:'#e84a4a'}, {x:24,y:2,w:6,h:14,col:'#4ae84a'}, {x:30,y:4,w:6,h:12,col:'#e8a04a'}],
      // 书桌1 - 有杯子和零食
      [{x:5,y:3,w:10,h:14,col:'#8a8a8a'}, {x:20,y:4,w:12,h:12,col:'#e88a4a'}, {x:35,y:5,w:6,h:10,col:'#9a4ae8'}],
      // 书桌2 - 有纸巾盒和饮料
      [{x:3,y:2,w:14,h:16,col:'#f0f0f0'}, {x:20,y:4,w:8,h:12,col:'#4ae8e8'}, {x:32,y:3,w:10,h:14,col:'#e84a8a'}],
      // 书桌3 - 有盆栽和文具
      [{x:5,y:0,w:10,h:20,col:'#4ae86a'}, {x:20,y:6,w:8,h:10,col:'#d4d4d4'}, {x:32,y:5,w:8,h:12,col:'#e8c84a'}]
    ];
    
    const shelfItems = items[index % items.length];
    shelfItems.forEach(item => {
      gctx.fillStyle = item.col;
      gctx.fillRect(bx + bw - shelfW + 4 + item.x, deskTopY + 18 + item.y, item.w, item.h);
    });
    
    // === 梯子（右侧）===
    gctx.fillStyle = '#6a4a2a';
    const ladderX = bx + bw - 4;
    for (let step = 0; step < 4; step++) {
      const stepY = by + bedH + step * 30;
      gctx.fillRect(ladderX - 4, stepY, 4, 6);
      gctx.fillRect(ladderX - 8, stepY + 2, 12, 2);
    }
    
    // === 椅子 ===
    const chairX = bx + 25;
    const chairY = deskTopY + deskH;
    gctx.fillStyle = '#b89860';
    gctx.fillRect(chairX, chairY - 28, 32, 6);   // 座面
    gctx.fillRect(chairX + 4, chairY - 28, 4, 28); // 前腿
    gctx.fillRect(chairX + 24, chairY - 28, 4, 28); // 后腿
    gctx.fillRect(chairX, chairY, 32, 4);         // 横梁
    gctx.fillRect(chairX + 6, chairY - 40, 20, 4);  // 靠背横档
    gctx.fillRect(chairX + 8, chairY - 40, 3, 12);  // 靠背左柱
    gctx.fillRect(chairX + 19, chairY - 40, 3, 12); // 靠背右柱
    
    // === 地面阴影 ===
    gctx.fillStyle = 'rgba(40,20,10,0.2)';
    gctx.fillRect(bx, chairY + 4, bw, 6);
  }

  function drawBed(x, y, w, h) {
    // 床框
    gctx.fillStyle = '#8a5a2a';
    gctx.fillRect(x, y, w, h);
    // 床垫
    gctx.fillStyle = '#f0e8d8';
    gctx.fillRect(x + 4, y + 4, w - 8, h - 8);
    // 被子
    gctx.fillStyle = '#e8d8c0';
    gctx.fillRect(x + 6, y + 6, w - 12, h - 12);
    gctx.fillStyle = 'rgba(160,120,80,0.25)';
    gctx.fillRect(x + 8, y + 8, w - 16, h - 16);
  }

  // 主角小白（Minecraft风格，按图中样式）
  // 参数：cx-中心x, feetY-脚y, facing-朝向(1右/-1左), stepFrame-走路帧(0,1,2,3)
  function drawDormPlayer(cx, feetY, facing, stepFrame) {
    // 判断是否在走路
    const dx = targetX - playerX;
    const dy = targetY - playerY;
    const isMoving = (Math.abs(dx) + Math.abs(dy)) > 2;

    // === 地面阴影 ===
    gctx.fillStyle = 'rgba(40,20,10,0.35)';
    gctx.fillRect(cx - 18, feetY, 36, 5);

    // === 腿（黑色裤子，Minecraft方块风格）===
    gctx.fillStyle = '#1a1a1a';
    let legOffset = 0;
    if (isMoving) {
      legOffset = (stepFrame % 60 < 30) ? -4 : 4;
    }
    // 左腿
    gctx.fillRect(cx - 12 + legOffset, feetY - 22, 10, 22);
    // 右腿
    gctx.fillRect(cx + 2 - legOffset, feetY - 22, 10, 22);

    // === 身体（白色衬衫，带黑领带）===
    gctx.fillStyle = '#ffffff';
    gctx.fillRect(cx - 14, feetY - 48, 28, 26);
    // 黑色领带
    gctx.fillStyle = '#1a1a1a';
    gctx.fillRect(cx - 3, feetY - 48, 6, 20);
    // 领带结
    gctx.fillRect(cx - 5, feetY - 48, 10, 4);

    // === 手臂（白色袖子，浅色皮肤手）===
    let armOffset = isMoving ? ((stepFrame % 60 < 30) ? 3 : -3) : 0;
    // 左手臂
    gctx.fillStyle = '#ffffff';
    gctx.fillRect(cx - 20 + armOffset, feetY - 46, 8, 16);
    gctx.fillStyle = '#e8d4b0';
    gctx.fillRect(cx - 20 + armOffset, feetY - 30, 8, 12);
    // 右手臂
    gctx.fillStyle = '#ffffff';
    gctx.fillRect(cx + 12 - armOffset, feetY - 46, 8, 16);
    gctx.fillStyle = '#e8d4b0';
    gctx.fillRect(cx + 12 - armOffset, feetY - 30, 8, 12);
    // 白色袖口装饰
    gctx.fillStyle = '#e8e8e8';
    gctx.fillRect(cx - 20 + armOffset, feetY - 34, 8, 4);
    gctx.fillRect(cx + 12 - armOffset, feetY - 34, 8, 4);

    // === 头部（白色方块头）===
    gctx.fillStyle = '#ffffff';
    gctx.fillRect(cx - 14, feetY - 74, 28, 26);
    // 头发顶部蓝色装饰
    gctx.fillStyle = '#4a8ac8';
    gctx.fillRect(cx - 12, feetY - 76, 8, 6);
    gctx.fillRect(cx + 4, feetY - 76, 8, 6);

    // === 脸部 ===
    gctx.fillStyle = '#e8d4b0';
    gctx.fillRect(cx - 12, feetY - 68, 24, 20);

    // === 眼睛（黑色方块）===
    gctx.fillStyle = '#1a1a1a';
    gctx.fillRect(cx - 8, feetY - 62, 5, 5);
    gctx.fillRect(cx + 3, feetY - 62, 5, 5);
  }

  // Minecraft风格室友（方块人，背对玩家，坐在书桌前）
  // 参数：cx-中心x, feetY-脚y, shirtColor-衣服颜色
  function drawRoommatePixel(cx, feetY, shirtColor) {
    // === 地面阴影 ===
    gctx.fillStyle = 'rgba(40,20,10,0.35)';
    gctx.fillRect(cx - 18, feetY, 36, 5);

    // === 凳子（方块风格）===
    gctx.fillStyle = '#8a6d3b';
    gctx.fillRect(cx - 16, feetY - 28, 32, 6);
    // 凳腿
    gctx.fillStyle = '#5c4a2a';
    gctx.fillRect(cx - 12, feetY - 22, 4, 22);
    gctx.fillRect(cx + 8, feetY - 22, 4, 22);

    // === 腿（方块风格，坐在凳子上）===
    gctx.fillStyle = '#2a2a2a';
    // 大腿（水平）
    gctx.fillRect(cx - 12, feetY - 26, 10, 6);
    gctx.fillRect(cx + 2, feetY - 26, 10, 6);
    // 小腿（垂直）
    gctx.fillRect(cx - 11, feetY - 20, 8, 20);
    gctx.fillRect(cx + 3, feetY - 20, 8, 20);
    // 鞋子（方块）
    gctx.fillStyle = '#4a4a4a';
    gctx.fillRect(cx - 12, feetY - 2, 10, 2);
    gctx.fillRect(cx + 2, feetY - 2, 10, 2);

    // === 身体（方块风格上衣，背对）===
    gctx.fillStyle = shirtColor;
    gctx.fillRect(cx - 14, feetY - 52, 28, 26);

    // === 手臂（方块风格，伸向键盘）===
    // 左手臂（伸向桌面）
    gctx.fillStyle = shirtColor;
    gctx.fillRect(cx - 20, feetY - 50, 8, 14);
    // 左手
    gctx.fillStyle = '#d8b898';
    gctx.fillRect(cx - 6, feetY - 36, 8, 8);

    // === 头部（方块风格，后脑勺）===
    gctx.fillStyle = '#3a3a3a';
    gctx.fillRect(cx - 12, feetY - 76, 24, 24);
    // 头发顶部
    gctx.fillStyle = '#2a2a2a';
    gctx.fillRect(cx - 10, feetY - 78, 20, 4);
    // 后脑勺分界线
    gctx.fillStyle = '#4a4a4a';
    gctx.fillRect(cx - 1, feetY - 78, 2, 26);
  }

  /* ==========================================================
     进入游戏页
     ========================================================== */
  function enterGamePage(slotNum, data) {
    currentGameSlot = String(slotNum);
    // 兼容旧存档：确保新字段有默认值
    const defaults = createNewSaveData();
    currentGameData = Object.assign({}, defaults, data);
    // 兼容旧存档：确保室友好感度字段存在
    if (!currentGameData.roommateFavors) {
      currentGameData.roommateFavors = { xin: 0, wang: 0, tang: 0 };
    }
    ensureScheduleState(currentGameData);
    window._currentGameData = currentGameData;
    showPage('game');
    // 进入游戏后启动背景音乐
    if (window.gameAudio) gameAudio.startBgm();
  }

  function saveToSlot(slotNum) {
    if (!currentGameData) return;
    writeSave(slotNum, Object.assign({}, currentGameData));
  }

  // 地点对应的 Canvas 场景渲染函数
  const SCENE_FNS = {
    dorm: renderDormScene,
    teaching: renderTeachingScene,
    outdoor: renderOutdoorScene,
  };

  /* ==========================================================
     操场场景 Canvas 渲染（参考图样式）
     ========================================================== */
  function renderOutdoorScene() {
    if (!gctx) return;
    const W = 960, H = 540;
    gctx.clearRect(0, 0, W, H);

    // === 天空背景 ===
    const sky = gctx.createLinearGradient(0, 0, 0, 200);
    sky.addColorStop(0, '#87ceeb');
    sky.addColorStop(1, '#e0f4ff');
    gctx.fillStyle = sky;
    gctx.fillRect(0, 0, W, 200);

    // === 远景建筑（背景层）===
    gctx.fillStyle = '#b8c4d4';
    gctx.fillRect(0, 120, W, 80);
    gctx.fillStyle = '#8a9db8';
    for (let i = 0; i < 20; i++) {
      gctx.fillRect(i * 50 + 10, 100 + (i % 3) * 25, 35, 20);
    }

    // === 云朵 ===
    drawOutdoorCloud(gctx, 150, 60);
    drawOutdoorCloud(gctx, 450, 40);
    drawOutdoorCloud(gctx, 720, 70);

    // === 看台（观众席）===
    // 看台顶棚
    gctx.fillStyle = '#d0d0d0';
    gctx.fillRect(0, 180, W, 15);
    // 顶棚阴影
    gctx.fillStyle = '#a0a0a0';
    gctx.fillRect(0, 192, W, 3);
    // 柱子
    gctx.fillStyle = '#9a9a9a';
    const pillars = [80, 180, 280, 380, 480, 580, 680, 780, 880];
    pillars.forEach(px => {
      gctx.fillRect(px - 6, 195, 12, 65);
    });
    // 阶梯座位
    gctx.fillStyle = '#c0c0c0';
    for (let row = 0; row < 6; row++) {
      gctx.fillRect(0, 195 + row * 11, W, 8);
      gctx.fillStyle = '#a8a8a8';
    }
    // 座位纹理
    gctx.fillStyle = '#b0b0b0';
    for (let col = 0; col < 40; col++) {
      for (let row = 0; row < 6; row++) {
        gctx.fillRect(col * 24 + 4, 198 + row * 11, 10, 4);
      }
    }
    // 跑道上方的边缘
    gctx.fillStyle = '#808080';
    gctx.fillRect(0, 260, W, 5);

    // === 跑道（外圈）===
    gctx.fillStyle = '#c84a4a';
    gctx.fillRect(0, 265, W, 60);
    // 跑道内边缘
    gctx.fillStyle = '#a03232';
    gctx.fillRect(0, 265, W, 3);
    // 跑道白线（分道线）
    gctx.fillStyle = '#fff';
    gctx.fillRect(0, 285, W, 2);
    gctx.fillRect(0, 305, W, 2);

    // === 足球场（中心内场）===
    gctx.fillStyle = '#4a9a3a';
    gctx.fillRect(0, 325, W, 100);
    // 草地纹理
    gctx.fillStyle = '#3a8a2a';
    for (let i = 0; i < 50; i++) {
      const gx = (i * 23) % W;
      const gy = 330 + (i * 19) % 90;
      gctx.fillRect(gx, gy, 2, 4);
    }
    // 球场边线
    gctx.strokeStyle = '#fff';
    gctx.lineWidth = 3;
    gctx.strokeRect(10, 330, W - 20, 90);
    // 中圈
    gctx.beginPath();
    gctx.arc(W / 2, 375, 35, 0, Math.PI * 2);
    gctx.stroke();
    // 中线
    gctx.beginPath();
    gctx.moveTo(W / 2, 330);
    gctx.lineTo(W / 2, 420);
    gctx.stroke();
    // 左球门区
    gctx.strokeRect(10, 355, 60, 30);
    // 右球门区
    gctx.strokeRect(W - 70, 355, 60, 30);
    // 左球门
    gctx.fillStyle = '#fff';
    gctx.fillRect(10, 365, 6, 20);
    gctx.fillRect(3, 360, 20, 4);
    gctx.fillRect(3, 380, 20, 4);
    // 右球门
    gctx.fillRect(W - 16, 365, 6, 20);
    gctx.fillRect(W - 23, 360, 20, 4);
    gctx.fillRect(W - 23, 380, 20, 4);

    // === 下方跑道（玩家所在）===
    gctx.fillStyle = '#c84a4a';
    gctx.fillRect(0, 425, W, 60);
    // 跑道白线
    gctx.fillStyle = '#fff';
    gctx.fillRect(0, 445, W, 2);

    // === 下方台阶区域 ===
    gctx.fillStyle = '#b8b8b8';
    gctx.fillRect(0, 485, W, 55);
    // 台阶
    gctx.fillStyle = '#a8a8a8';
    gctx.fillRect(0, 485, W, 8);
    gctx.fillRect(0, 498, W, 8);
    gctx.fillRect(0, 511, W, 8);
    gctx.fillRect(0, 524, W, 8);

    // === 跑道上的行人 ===
    drawRunner(gctx, 80, 295, '#4a8ac8');
    drawRunner(gctx, 200, 295, '#e86a4a');
    drawRunner(gctx, 350, 295, '#4a8ac8');
    drawRunner(gctx, 500, 295, '#e8a04a');
    drawRunner(gctx, 650, 295, '#4a8ac8');
    drawRunner(gctx, 780, 295, '#e86a4a');

    // === 足球场踢球的人 ===
    drawSoccerPlayer(gctx, 120, 385);
    drawSoccerPlayer(gctx, W / 2 + 50, 370);

    // === 看台上方的角色 ===
    drawTennisPlayer(gctx, 680, 220);

    // === 标题 ===
    gctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    gctx.font = 'bold 20px "ZCOOL KuaiLe", sans-serif';
    gctx.textAlign = 'center';
    gctx.fillText('🏟️ 操 场', W / 2, 30);

    // === 时段提示 ===
    const timeSlot = currentGameData ? currentGameData.timeSlot : 0;
    const slotNames = ['上午', '中午', '下午', '傍晚', '夜晚', '深夜'];
    const dayNight = (timeSlot === 0 || timeSlot === 1 || timeSlot === 2) ? '☀️' :
                     (timeSlot === 3) ? '🌅' : '🌙';
    gctx.font = '14px "ZCOOL KuaiLe", sans-serif';
    gctx.fillStyle = '#3a1a05';
    gctx.textAlign = 'left';
    gctx.fillText(`${dayNight} ${slotNames[timeSlot] || ''}`, 12, 28);

    drawSceneItems();
  }

  // 绘制跑步的人
  function drawRunner(ctx, x, y, color) {
    // 头
    ctx.fillStyle = '#f5d0b8';
    ctx.fillRect(x - 6, y - 18, 12, 12);
    // 身体
    ctx.fillStyle = color;
    ctx.fillRect(x - 8, y - 6, 16, 10);
    // 短裤
    ctx.fillStyle = '#2a2a2a';
    ctx.fillRect(x - 7, y + 4, 14, 8);
    // 腿
    ctx.fillStyle = '#f5d0b8';
    ctx.fillRect(x - 5, y + 10, 4, 8);
    ctx.fillRect(x + 1, y + 10, 4, 8);
    // 手臂摆动
    ctx.fillStyle = '#f5d0b8';
    ctx.fillRect(x - 12, y - 4, 6, 3);
    ctx.fillRect(x + 6, y - 4, 6, 3);
    // 鞋子
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(x - 6, y + 16, 5, 4);
    ctx.fillRect(x + 1, y + 16, 5, 4);
  }

  // 绘制踢足球的人
  function drawSoccerPlayer(ctx, x, y) {
    // 头
    ctx.fillStyle = '#f5d0b8';
    ctx.fillRect(x - 5, y - 16, 10, 10);
    // 身体
    ctx.fillStyle = '#e84a4a';
    ctx.fillRect(x - 6, y - 4, 12, 8);
    // 短裤
    ctx.fillStyle = '#2a2a2a';
    ctx.fillRect(x - 5, y + 4, 10, 6);
    // 腿
    ctx.fillStyle = '#f5d0b8';
    ctx.fillRect(x - 4, y + 10, 3, 8);
    ctx.fillRect(x + 1, y + 10, 3, 8);
    // 足球
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(x + 12, y + 16, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#1a1a1a';
    ctx.beginPath();
    ctx.arc(x + 14, y + 15, 2, 0, Math.PI * 2);
    ctx.fill();
  }

  // 绘制打网球的人（看台上）
  function drawTennisPlayer(ctx, x, y) {
    // 头
    ctx.fillStyle = '#f5d0b8';
    ctx.fillRect(x - 4, y - 14, 8, 8);
    // 身体
    ctx.fillStyle = '#fff';
    ctx.fillRect(x - 5, y - 4, 10, 8);
    // 短裙
    ctx.fillStyle = '#2a2a2a';
    ctx.fillRect(x - 5, y + 4, 10, 6);
    // 腿
    ctx.fillStyle = '#f5d0b8';
    ctx.fillRect(x - 3, y + 10, 3, 6);
    ctx.fillRect(x + 0, y + 10, 3, 6);
    // 球拍
    ctx.fillStyle = '#e8a04a';
    ctx.fillRect(x + 8, y - 12, 8, 2);
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(x + 14, y - 12, 8, 0, Math.PI * 2);
    ctx.fill();
  }

  // 操场云朵绘制（独立函数，避免与封面drawCloud冲突）
  function drawOutdoorCloud(ctx, x, y) {
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(x, y, 15, 0, Math.PI * 2);
    ctx.arc(x + 15, y - 6, 18, 0, Math.PI * 2);
    ctx.arc(x + 32, y, 14, 0, Math.PI * 2);
    ctx.fill();
  }

  /* ==========================================================
     弹窗
     ========================================================== */
  const modalMask = document.getElementById('modal-mask');
  const modalBody = document.getElementById('modal-body-text');
  const modalYes = document.getElementById('modal-yes');
  const modalNo = document.getElementById('modal-no');

  function openConfirm(message, onYes) {
    if (modalBody) modalBody.textContent = message;
    if (modalMask) modalMask.classList.add('active');
    if (modalYes) modalYes.onclick = () => { closeModal(); if (onYes) onYes(); };
    if (modalNo) modalNo.onclick = closeModal;
  }
  function closeModal() {
    if (modalMask) modalMask.classList.remove('active');
  }
  function openSimpleNotice(message) {
    if (modalBody) modalBody.textContent = message;
    if (modalYes) modalYes.textContent = '好';
    if (modalMask) modalMask.classList.add('active');
    if (modalNo) modalNo.style.display = 'none';
    if (modalYes) modalYes.onclick = () => {
      modalYes.textContent = '是';
      if (modalNo) modalNo.style.display = '';
      closeModal();
    };
    if (modalNo) modalNo.onclick = () => {};
  }

  /* ==========================================================
     存档槽点击事件
     ========================================================== */
  slotEls.forEach(slotEl => {
    slotEl.addEventListener('click', () => {
      const num = slotEl.dataset.slot;
      const data = getSave(num);
      if (savePageMode === 'new-game') {
        if (!data) {
          const newData = createNewSaveData();
          writeSave(num, newData);
          enterGamePage(num, newData);
        } else {
          openConfirm(`存档 ${num} 已有数据（第 ${data.day} 天）\n是否覆盖此存档？`, () => {
            const newData = createNewSaveData();
            writeSave(num, newData);
            enterGamePage(num, newData);
          });
        }
      } else if (savePageMode === 'save') {
        if (!data) {
          openSimpleNotice(`存档 ${num} 目前是空的，无法继续。\n请先点击"新游戏"创建一个！`);
        } else {
          enterGamePage(num, data);
        }
      }
    });
  });

  /* ==========================================================
     封面页按钮
     ========================================================== */
  bindClick('btn-new-game', () => enterSavePage('new-game'));

  bindClick('btn-continue', () => {
    const lastSlot = getLastSlot();
    if (lastSlot && getSave(lastSlot)) {
      enterGamePage(lastSlot, getSave(lastSlot));
      return;
    }
    const saves = loadAllSaves();
    const keys = Object.keys(saves);
    if (keys.length > 0) {
      enterGamePage(keys[0], saves[keys[0]]);
      return;
    }
    openSimpleNotice('当前没有任何存档，请先点击"新游戏"开始！');
  });

  bindClick('btn-save', () => {
    if (!currentGameData) currentGameData = createNewSaveData();
    enterSavePage('save');
  });

  /* ==========================================================
     返回按钮
     ========================================================== */
  bindClick('btn-back-cover', () => showPage('cover'));
  bindClick('btn-game-back', () => {
    stopGameLoop();
    showPage('cover');
  });
  bindClick('btn-fail-back-title', () => {
    currentGameData = null;
    currentGameSlot = null;
    showPage('cover');
  });

  /* ==========================================================
     手机界面
     ========================================================== */
  document.addEventListener('click', (e) => {
    const btnPhone = e.target.closest('#btn-phone');
    const btnPhoneClose = e.target.closest('#btn-phone-close');
    if (btnPhone) {
      const phoneOverlay = document.getElementById('phone-overlay');
      if (phoneOverlay) phoneOverlay.classList.add('active');
      if (window.gameAudio) { gameAudio.init(); gameAudio.play('open'); }
    }
    if (btnPhoneClose) {
      const phoneOverlay = document.getElementById('phone-overlay');
      if (phoneOverlay) phoneOverlay.classList.remove('active');
      if (window.gameAudio) gameAudio.play('close');
    }
  });

  APP_CONTENTS = {
    baolema: {
      title: '🍔 饱了吗',
      html: function() {
        const canOrder = [0, 1, 3].includes(currentGameData.timeSlot);
        const nextSlot = currentGameData.timeSlot === 2 ? '傍晚' :
                         currentGameData.timeSlot === 4 ? '明天上午' :
                         currentGameData.timeSlot === 5 ? '明天上午' : '稍后';
        if (!canOrder) {
          return `
        <div class="app-baolema">
          <div class="baolema-banner">🎉 新用户立减5元！</div>
          <div class="shop-balance">💰 余额：<strong>${currentGameData.money}</strong> 元</div>
          <div class="baolema-closed">
            <div class="baolema-closed-icon">🍽️</div>
            <div class="baolema-closed-title">当前时段暂不营业</div>
            <div class="baolema-closed-desc">现在是${TIME_SLOTS[currentGameData.timeSlot]}，外卖小哥正在休息~</div>
            <div class="baolema-closed-time">可点时段：上午、中午、傍晚</div>
            <div class="baolema-closed-next">⏰ 下次营业：${nextSlot}</div>
          </div>
          <div class="baolema-tip">💡 吃饱了才有力气学习！</div>
        </div>`;
        }
        return `
        <div class="app-baolema">
          <div class="baolema-banner">🎉 新用户立减5元！</div>
          <div class="shop-balance">💰 余额：<strong>${currentGameData.money}</strong> 元</div>
          <div class="shop-items">
            <div class="shop-item-row">
              <div class="item-info"><span class="item-emoji">🍜</span> <span>牛肉面</span></div>
              <div class="item-price">15元</div>
              <div class="item-effect">❤️+3</div>
              <button class="pixel-btn baolema-buy" data-item="noodle" data-price="15" data-health="3">下单</button>
            </div>
            <div class="shop-item-row">
              <div class="item-info"><span class="item-emoji">🍱</span> <span>便当</span></div>
              <div class="item-price">20元</div>
              <div class="item-effect">❤️+5</div>
              <button class="pixel-btn baolema-buy" data-item="bento" data-price="20" data-health="5">下单</button>
            </div>
            <div class="shop-item-row">
              <div class="item-info"><span class="item-emoji">🍔</span> <span>汉堡套餐</span></div>
              <div class="item-price">18元</div>
              <div class="item-effect">❤️+4</div>
              <button class="pixel-btn baolema-buy" data-item="burger" data-price="18" data-health="4">下单</button>
            </div>
          </div>
          <div class="baolema-tip">💡 吃饱了才有力气学习！</div>
        </div>`;
      }
    },
    group: {
      title: '👥 科大小组手',
      html: function() {
        const d = currentGameData;
        const yearIdx = Math.min(YEAR_NAMES.length - 1, Math.ceil(d.day / 90) - 1);
        const isSophomore = yearIdx >= 1;
        const electives = d.electives || [];
        const selectedElectiveCount = electives.length;
        const remainingElectives = Math.max(0, MAX_ELECTIVES - selectedElectiveCount);
        const totalCourseLoad = countScheduleCourses(d.schedule || {});

        // 必修课程学分表
        let requiredHtml = '';
        COURSES.forEach(c => {
          const info = COURSE_INFO[c.name];
          if (info) {
            const progStr = info.program > 0 ? `<span class="elec-bonus">💻 +${info.program}</span>` : '';
            requiredHtml += `
              <div class="elec-item">
                <div class="elec-info">
                  <div class="elec-name">${c.name}</div>
                  <div class="elec-desc">${c.loc} · ${c.type === 'sch-prog' ? '编程课' : c.type === 'sch-comp' ? '计算机基础' : c.type === 'sch-math' ? '理科' : c.type === 'sch-eng' ? '文科' : '体育'}</div>
                </div>
                <div class="elec-stats">
                  <span class="elec-credit">学分 ${info.credits}</span>
                  <span class="elec-bonus">📚 +${info.knowledge}</span>
                  ${progStr}
                </div>
              </div>`;
          }
        });

        // 选修课程列表
        let electiveHtml = '';
        ELECTIVE_COURSES.forEach(c => {
          const selected = electives.includes(c.name);
          const disabled = selected || selectedElectiveCount >= MAX_ELECTIVES;
          const progStr = c.program > 0 ? `<span class="elec-bonus">💻 +${c.program}</span>` : '';
          electiveHtml += `
            <div class="elec-item ${selected ? 'elec-selected' : ''}">
              <div class="elec-info">
                <div class="elec-name">${c.name}</div>
                <div class="elec-desc">${c.desc}</div>
              </div>
              <div class="elec-stats">
                <span class="elec-credit">学分 ${c.credits}</span>
                <span class="elec-bonus">📚 +${c.knowledge}</span>
                ${progStr}
              </div>
              <button class="pixel-btn elec-btn ${selected ? 'elec-btn-selected' : ''}" data-elective="${c.name}" ${disabled ? 'disabled' : ''}>${selected ? '已选' : (selectedElectiveCount >= MAX_ELECTIVES ? '已满' : '选择')}</button>
            </div>`;
        });

        return `
        <div class="app-group">
          <div class="group-tabs">
            <button class="group-tab active" data-tab="schedule">📋 课程表</button>
            <button class="group-tab" data-tab="credits">🎓 学分与加成</button>
            <button class="group-tab" data-tab="elective" ${isSophomore ? '' : 'disabled'}>📝 选课${isSophomore ? '' : ' (大二解锁)'}</button>
          </div>
          <div class="group-content" id="group-tab-schedule">
            <div class="schedule-table">
              ${renderScheduleTable()}
            </div>
            <div class="schedule-legend">
              <span class="legend-item">📚 当前课程量 ${totalCourseLoad} 节/周</span>
              <span class="legend-item">📝 选修课 ${selectedElectiveCount}/${MAX_ELECTIVES}</span>
              <span class="legend-item"><span class="legend-dot sch-math"></span>理科课程</span>
              <span class="legend-item"><span class="legend-dot sch-eng"></span>文科课程</span>
              <span class="legend-item"><span class="legend-dot sch-prog"></span>编程课程</span>
              <span class="legend-item"><span class="legend-dot sch-comp"></span>计算机基础</span>
              <span class="legend-item"><span class="legend-dot sch-pe"></span>体育</span>
            </div>
          </div>
          <div class="group-content" id="group-tab-credits" style="display:none">
            <div class="elec-section">
              <div class="elec-section-title">📚 必修课程</div>
              ${requiredHtml}
            </div>
            <div class="elec-section">
              <div class="elec-section-title">📝 已选选修课</div>
              ${electives.length > 0 ? electives.map(name => {
                const c = ELECTIVE_COURSES.find(e => e.name === name);
                if (!c) return '';
                const progStr = c.program > 0 ? `<span class="elec-bonus">💻 +${c.program}</span>` : '';
                return `<div class="elec-item elec-selected">
                  <div class="elec-info">
                    <div class="elec-name">${c.name}</div>
                    <div class="elec-desc">${c.desc}</div>
                  </div>
                  <div class="elec-stats">
                    <span class="elec-credit">学分 ${c.credits}</span>
                    <span class="elec-bonus">📚 +${c.knowledge}</span>
                    ${progStr}
                  </div>
                </div>`;
              }).join('') : '<div class="elec-empty">暂未选择选修课</div>'}
            </div>
          </div>
          <div class="group-content" id="group-tab-elective" style="display:none">
            ${isSophomore ? `<div class="elec-section">
              <div class="elec-section-title">📝 选修课程（每选 1 节，课程量 +1；需选满 ${MAX_ELECTIVES} 节）</div>
              <div class="elec-empty">${remainingElectives > 0 ? `当前已选 ${selectedElectiveCount}/${MAX_ELECTIVES} 节，还需再选 ${remainingElectives} 节。` : `本学期选修课已选满 ${MAX_ELECTIVES}/${MAX_ELECTIVES} 节。`}</div>
              ${electiveHtml}
            </div>` : '<div class="elec-locked">🔒 选课功能在大二后开启</div>'}
          </div>
        </div>`;
      }
    },
    shop: {
      title: '🛒 购物',
      html: function() { return `
        <div class="app-shop">
          <div class="shop-balance">💰 余额：<strong>${currentGameData.money}</strong> 元</div>
          <div class="shop-items">
            <div class="shop-item-row">
              <div class="item-info"><span class="item-emoji">📖</span> <span>数据结构</span></div>
              <div class="item-price">50元</div>
              <div class="item-effect">📚 +15</div>
              <button class="pixel-btn shop-buy" data-item="datastruct" data-price="50" data-book="15">购买</button>
            </div>
            <div class="shop-item-row">
              <div class="item-info"><span class="item-emoji">📚</span> <span>三年算法五年编程</span></div>
              <div class="item-price">80元</div>
              <div class="item-effect">💻 +20</div>
              <button class="pixel-btn shop-buy" data-item="algo" data-price="80" data-code="20">购买</button>
            </div>
          </div>
        </div>`; }
    },
    chat: {
      title: '💬 聊天',
      html: function() { return `
        <div class="app-chat">
          <div class="chat-list">
            <div class="chat-contact" data-contact="roommate-xin">
              <div class="contact-avatar" style="background:#4a8ac8">信</div>
              <div class="contact-info">
                <div class="contact-name">老信</div>
                <div class="contact-preview">高数作业写了吗？</div>
              </div>
            </div>
            <div class="chat-contact" data-contact="roommate-wang">
              <div class="contact-avatar" style="background:#e86a4a">王</div>
              <div class="contact-info">
                <div class="contact-name">老王</div>
                <div class="contact-preview">要不要一起点外卖？</div>
              </div>
            </div>
            <div class="chat-contact" data-contact="roommate-tang">
              <div class="contact-avatar" style="background:#e8a04a">唐</div>
              <div class="contact-info">
                <div class="contact-name">老唐</div>
                <div class="contact-preview">帮我带个饭呗</div>
              </div>
            </div>
            <div class="chat-contact" data-contact="mom">
              <div class="contact-avatar" style="background:#e87a9a">妈</div>
              <div class="contact-info">
                <div class="contact-name">妈妈 👩</div>
                <div class="contact-preview">天冷了记得加衣服</div>
              </div>
            </div>
          </div>
          <div class="chat-detail" id="chat-detail-panel">
            <div class="chat-detail-header">💬 点击左侧联系人查看聊天</div>
          </div>
        </div>`; }
    },
    bag: {
      title: '🎒 背包',
      html: function() {
        const data = currentGameData || {};
        let pageIdx = data.bagPageIdx || 0;
        const totalPages = (data.bagPages && data.bagPages.length) || 3;
        if (pageIdx < 0) pageIdx = 0;
        if (pageIdx >= totalPages) pageIdx = totalPages - 1;
        const pageItems = (data.bagPages && data.bagPages[pageIdx]) || new Array(15).fill(null);

        // 分页切换按钮
        const pageTabs = [];
        for (let p = 0; p < totalPages; p++) {
          pageTabs.push(`<button class="bag-page-tab ${p === pageIdx ? 'active' : ''}" data-page="${p}">${p + 1}</button>`);
        }

        // 格子渲染
        const cellsHtml = pageItems.map((cell, idx) => {
          if (cell && cell.name) {
            return `<div class="bag-cell bag-cell-filled" data-idx="${idx}">
              <div class="bag-cell-icon">${cell.icon || '📦'}</div>
              <div class="bag-cell-count">${cell.count || 1}</div>
            </div>`;
          }
          return `<div class="bag-cell" data-idx="${idx}"></div>`;
        }).join('');

        return `
        <div class="app-bag">
          <div class="bag-page-tabs">${pageTabs.join('')}</div>
          <div class="bag-grid">${cellsHtml}</div>
        </div>`; }
    },
    settings: {
      title: '⚙️ 设置',
      html: function() {
        const soundOn = window.gameAudio ? !gameAudio.isMuted() : true;
        const bgmVol = window.gameAudio ? Math.round(gameAudio.getBgmVolume() * 100) : 60;
        const sfxVol = window.gameAudio ? Math.round(gameAudio.getSfxVolume() * 100) : 80;
        return `
        <div class="app-settings">
          <div class="setting-row">
            <span>🔊 音效</span>
            <label class="switch">
              <input type="checkbox" id="setting-sound" ${soundOn ? 'checked' : ''} onchange="if(window.gameAudio){gameAudio.setMuted(!this.checked);if(this.checked)gameAudio.play('click');}">
              <span class="slider"></span>
            </label>
          </div>
          <div class="setting-row">
            <span>音效音量</span>
            <input type="range" min="0" max="100" value="${sfxVol}" oninput="if(window.gameAudio){gameAudio.setSfxVolume(this.value/100);}" class="volume-slider">
          </div>
          <div class="setting-row">
            <span>🎵 音乐</span>
            <label class="switch">
              <input type="checkbox" id="setting-music" ${window.gameAudio && gameAudio.isBgmEnabled() ? 'checked' : ''} onchange="if(window.gameAudio){gameAudio.setBgmEnabled(this.checked);}">
              <span class="slider"></span>
            </label>
          </div>
          <div class="setting-row">
            <span>音乐音量</span>
            <input type="range" min="0" max="100" value="${bgmVol}" oninput="if(window.gameAudio){gameAudio.setBgmVolume(this.value/100);}" class="volume-slider">
          </div>
          <div class="setting-divider"></div>
          <div class="setting-version">🎮 校园生存模拟器 v0.1</div>
          <div class="setting-divider"></div>
          <button class="btn-back-title" id="btn-back-to-title">🏠 回到标题</button>
        </div>`; }
    }
  };

  // 定义 openApp 并挂到 window，供 HTML onclick 调用
  window.openApp = function(appName) {
    if (!APP_CONTENTS[appName]) return;
    if (window.gameAudio) { gameAudio.init(); gameAudio.play('open'); }
    const info = APP_CONTENTS[appName];
    const phoneOverlay = document.getElementById('phone-overlay');
    const appTitle = document.getElementById('app-title-text');
    const appContent = document.getElementById('app-content-area');
    const appOverlay = document.getElementById('app-overlay');
    if (phoneOverlay) phoneOverlay.classList.remove('active');
    if (appTitle) appTitle.textContent = info.title;
    if (appContent) appContent.innerHTML = info.html();
    if (appOverlay) appOverlay.classList.add('active');
    // 绑定购买按钮
    document.querySelectorAll('.shop-buy').forEach(buyBtn => {
      buyBtn.addEventListener('click', () => {
        const price = parseInt(buyBtn.dataset.price, 10);
        if (!currentGameData || currentGameData.money < price) {
          if (window.gameAudio) gameAudio.play('error');
          openSimpleNotice('💰 金钱不足！');
          return;
        }
        currentGameData.money -= price;
        if (buyBtn.dataset.code) {
          currentGameData.programming = Math.min(500, currentGameData.programming + parseInt(buyBtn.dataset.code, 10));
          if (window.gameAudio) gameAudio.play('buy');
          openSimpleNotice('✅ 购买成功！编程能力 +' + buyBtn.dataset.code);
        }
        if (buyBtn.dataset.book) {
          currentGameData.knowledge = Math.min(500, currentGameData.knowledge + parseInt(buyBtn.dataset.book, 10));
          if (window.gameAudio) gameAudio.play('buy');
          openSimpleNotice('✅ 购买成功！知识 +' + buyBtn.dataset.book);
        }
        updateGameUI();
      });
    });
    // 绑定饱了吗下单按钮
    document.querySelectorAll('.baolema-buy').forEach(buyBtn => {
      buyBtn.addEventListener('click', () => {
        if (![0, 1, 3].includes(currentGameData.timeSlot)) {
          if (window.gameAudio) gameAudio.play('error');
          openSimpleNotice('🍽️ 当前时段暂不营业\n可点时段：上午、中午、傍晚');
          return;
        }
        const price = parseInt(buyBtn.dataset.price, 10);
        const item = buyBtn.dataset.item;
        const itemNames = {
          burger: '汉堡套餐',
          noodle: '牛肉面',
          bento: '便当'
        };
        if (!currentGameData || currentGameData.money < price) {
          if (window.gameAudio) gameAudio.play('error');
          openSimpleNotice('💰 金钱不足！');
          return;
        }
        currentGameData.money -= price;
        if (window.gameAudio) gameAudio.play('eat');

        // 标记对应餐食已吃
        const d = currentGameData;
        let mealName = '';
        if (d.timeSlot === 0) {
          d.breakfastEaten = true;
          mealName = '早餐';
        } else if (d.timeSlot === 1) {
          d.lunchEaten = true;
          mealName = '午餐';
        } else if (d.timeSlot === 3) {
          d.dinnerEaten = true;
          mealName = '晚餐';
        }

        let gain = [];
        if (buyBtn.dataset.health) {
          d.health = Math.min(100, d.health + parseInt(buyBtn.dataset.health, 10));
          gain.push('❤️+' + buyBtn.dataset.health);
        }
        const isGameOver = advanceTime(1);
        if (isGameOver) return;
        let msg = '🍔 ' + (itemNames[item] || item) + ' 送到啦！';
        if (mealName) {
          msg += '\n🍚 ' + mealName + '搞定！';
        }
        if (gain.length > 0) {
          msg += '\n吃饱了！' + gain.join(' ');
        }
        msg += `\n现在是${TIME_SLOTS[d.timeSlot]}，${WEEKDAYS[(d.day - 1) % 7]}`;
        if (d._lastMissedSleep) {
          msg += `\n😫 昨晚没睡觉！健康 -10`;
        }
        if (d._lastHealthLost > 0) {
          msg += `\n😫 饿肚子了！健康 -${d._lastHealthLost}（没吃${d._lastMissedMeals.filter(m => m !== '睡觉').join('、')}）`;
        }
        openSimpleNotice(msg);
        const appOverlay = document.getElementById('app-overlay');
        if (appOverlay) appOverlay.classList.remove('active');
        updateGameUI();
      });
    });
    if (appContent) {
      appContent.onclick = null;
    }
    if (appName === 'group' && appContent) {
      appContent.onclick = e => {
        const tab = e.target.closest('.group-tab[data-tab]');
        if (tab) {
          if (tab.disabled) return;
          appContent.querySelectorAll('.group-tab[data-tab]').forEach(t => t.classList.remove('active'));
          tab.classList.add('active');
          appContent.querySelectorAll('.group-content').forEach(c => c.style.display = 'none');
          const target = appContent.querySelector('#group-tab-' + tab.dataset.tab);
          if (target) target.style.display = '';
          return;
        }

        const btn = e.target.closest('.elec-btn');
        if (btn) {
          const result = trySelectElectiveCourse(btn.dataset.elective);
          openSimpleNotice(result.message);
          if (!result.ok) return;
          appContent.innerHTML = info.html();
          const electiveTabBtn = appContent.querySelector('.group-tab[data-tab="elective"]');
          const electiveTabPanel = appContent.querySelector('#group-tab-elective');
          const scheduleTabPanel = appContent.querySelector('#group-tab-schedule');
          const creditsTabPanel = appContent.querySelector('#group-tab-credits');
          if (electiveTabBtn) electiveTabBtn.classList.add('active');
          appContent.querySelectorAll('.group-tab[data-tab]').forEach(t => {
            if (t !== electiveTabBtn) t.classList.remove('active');
          });
          if (electiveTabPanel) electiveTabPanel.style.display = '';
          if (scheduleTabPanel) scheduleTabPanel.style.display = 'none';
          if (creditsTabPanel) creditsTabPanel.style.display = 'none';
          updateGameUI();
        }
      };
    }
    // 绑定"回到标题"按钮
    const backTitleBtn = document.getElementById('btn-back-to-title');
    if (backTitleBtn) {
      backTitleBtn.addEventListener('click', () => {
        stopGameLoop();
        const appOverlay2 = document.getElementById('app-overlay');
        if (appOverlay2) appOverlay2.classList.remove('active');
        showPage('cover');
      });
    }
  };

  // 群组切换（室友群/班级群）
  document.addEventListener('click', e => {
    if (e.target.classList.contains('group-tab')) {
      document.querySelectorAll('.group-tab').forEach(t => t.classList.remove('active'));
      e.target.classList.add('active');
      document.querySelectorAll('.group-chat').forEach(c => c.classList.add('hidden'));
      const g = e.target.dataset.group;
      const el = document.getElementById('group-chat-' + g);
      if (el) el.classList.remove('hidden');
    }
    // 聊天联系人点击
    if (e.target.closest('.chat-contact')) {
      const contact = e.target.closest('.chat-contact');
      const who = contact.dataset.contact;
      const panel = document.getElementById('chat-detail-panel');
      const msgs = {
        'roommate-xin': [
          {t:'other', n:'老信', m:'高数作业写了吗？'},
          {t:'me', m:'还没呢，正在写'},
          {t:'other', n:'老信', m:'写完借我看看呗！🙏'},
        ],
        'roommate-wang': [
          {t:'other', n:'老王', m:'要不要一起点外卖？凑满减'},
          {t:'me', m:'好啊，我想吃黄焖鸡'},
          {t:'other', n:'老王', m:'行，我来下单！'},
        ],
        'roommate-tang': [
          {t:'other', n:'老唐', m:'回来帮我带个饭呗'},
          {t:'me', m:'你又不想下楼？'},
          {t:'other', n:'老唐', m:'嘿嘿，拜托了兄弟🙏'},
        ],
        'mom': [
          {t:'other', n:'妈妈', m:'天冷了记得加衣服'},
          {t:'me', m:'知道了，妈'},
          {t:'other', n:'妈妈', m:'钱还够花吗？'},
        ],
      };
      const history = msgs[who] || [];
      if (panel) {
        const contactNames = { 'roommate-xin': '老信', 'roommate-wang': '老王', 'roommate-tang': '老唐', 'mom': '妈妈' };
        const displayName = contactNames[who] || who;
        panel.innerHTML = '<div class="chat-detail-header">💬 与 ' + displayName + ' 的聊天</div><div class="chat-detail-msgs">' +
          history.map(m => `<div class="chat-bubble ${m.t==='me'?'bubble-me':'bubble-other'}"><span class="bubble-text">${m.n ? m.n+': ' : ''}${m.m}</span></div>`).join('') + '</div>';
      }
    }
    // 背包分页切换
    if (e.target.classList.contains('bag-page-tab')) {
      const p = parseInt(e.target.dataset.page, 10);
      if (!isNaN(p) && currentGameData) {
        currentGameData.bagPageIdx = p;
        // 重新渲染背包界面
        const info = APP_CONTENTS['bag'];
        const appBody = document.getElementById('app-content-area');
        if (appBody) appBody.innerHTML = info.html();
        if (window.gameAudio) gameAudio.play('click');
      }
    }
    // 背包格子点击（预留物品使用接口）
    if (e.target.closest && e.target.closest('.bag-cell-filled')) {
      const cellEl = e.target.closest('.bag-cell-filled');
      const idx = parseInt(cellEl.dataset.idx, 10);
      if (currentGameData && currentGameData.bagPages && currentGameData.bagPages[currentGameData.bagPageIdx || 0]) {
        const cell = currentGameData.bagPages[currentGameData.bagPageIdx || 0][idx];
        if (cell) {
          openSimpleNotice(`${cell.icon || '📦'} ${cell.name} x${cell.count}\n${cell.desc || ''}`);
        }
      }
    }
  });

  bindClick('btn-app-close', () => {
    const appOverlay = document.getElementById('app-overlay');
    if (appOverlay) appOverlay.classList.remove('active');
    if (window.gameAudio) gameAudio.play('close');
  });

  /* ==========================================================
     地图界面
     ========================================================== */
  bindClick('btn-map', () => {
    updateGameUI();
    const mapOverlay = document.getElementById('map-overlay');
    if (mapOverlay) mapOverlay.classList.add('active');
    if (window.gameAudio) gameAudio.play('open');
  });
  bindClick('btn-map-close', () => {
    const mapOverlay = document.getElementById('map-overlay');
    if (mapOverlay) mapOverlay.classList.remove('active');
    if (window.gameAudio) gameAudio.play('close');
  });
  document.querySelectorAll('.map-place').forEach(placeBtn => {
    placeBtn.addEventListener('click', () => {
      const place = placeBtn.dataset.place;
      const implementedPlaces = ['dorm', 'teaching', 'outdoor'];
      if (!implementedPlaces.includes(place)) {
        const placeNames = {
          canteen: '食堂',
          library: '图书馆',
          gym: '体育馆',
          mall: '校园超市',
          cafeteria: '咖啡厅'
        };
        openSimpleNotice(`🏗️ ${placeNames[place] || place} 敬请期待`);
        if (window.gameAudio) gameAudio.play('error');
        return;
      }
      currentGameData.location = place;
      const startPos = getSceneStartPos(place);
      playerX = startPos.x;
      playerY = startPos.y;
      targetX = playerX;
      targetY = playerY;
      currentPath = [];
      showXiaoguMenu = false;
      showRoommateMenu = null;
      generateSceneItems(place);
      updateGameUI();
      document.getElementById('map-overlay').classList.remove('active');
      if (window.gameAudio) { gameAudio.init(); gameAudio.play('success'); }
    });
  });

  /* ==========================================================
     行动栏
  ========================================================== */
  // 推进时间（amount 为整数时段数），内部处理 day 进位、遗忘惩罚、饥饿惩罚、UI 更新
  function advanceTime(amount) {
    const d = currentGameData;
    const prevDay = d.day;
    let healthLost = 0;
    let missedMeals = [];

    // 逐时段推进，检查每个餐点是否没吃
    for (let i = 0; i < amount; i++) {
      const currentSlot = d.timeSlot;
      const currentDay = d.day;

      // 推进一个时段
      d.timeSlot++;
      if (d.timeSlot >= 6) {
        d.timeSlot = 0;
        d.day++;
        // 新的一天，重置三餐记录（前一天的晚餐在跨天时已检查过）
        d.breakfastEaten = false;
        d.lunchEaten = false;
        d.dinnerEaten = false;
      }

      // 检查是否跳过了餐点（进入下一个时段后检查上一个餐点）
      // 上午(0) -> 中午(1)：检查早餐是否吃了
      if (d.timeSlot === 1 && !d.breakfastEaten) {
        healthLost += 3;
        missedMeals.push('早餐');
      }
      // 中午(1) -> 下午(2)：检查午餐是否吃了
      if (d.timeSlot === 2 && !d.lunchEaten) {
        healthLost += 3;
        missedMeals.push('午餐');
      }
      // 傍晚(3) -> 夜晚(4)：检查晚餐是否吃了
      if (d.timeSlot === 4 && !d.dinnerEaten) {
        healthLost += 3;
        missedMeals.push('晚餐');
      }
    }

    // 扣除健康值
    if (healthLost > 0) {
      d.health = Math.max(0, d.health - healthLost);
    }

    // 进天时检查遗忘惩罚和睡眠惩罚
    if (d.day > prevDay) {
      const currentSemester = getSemesterIndex(d.day);
      if (d.scheduleSemester !== currentSemester) {
        d.schedule = generateSemesterSchedule(d.requiredCourseLoad || REQUIRED_COURSE_LOAD, d.electives || [], currentSemester);
        d.scheduleSemester = currentSemester;
        d._scheduleChanged = `📅 进入${getSemesterLabel(currentSemester)}，课程表已更新！课量保持 ${countScheduleCourses(d.schedule)} 节/周。`;
      }
      if (d.day - d.lastStudyDay >= 2) {
        d.knowledge = Math.max(0, d.knowledge - 3);
      }
      if (d.day - d.lastCodeDay >= 2) {
        d.program = Math.max(0, d.program - 3);
      }
      // 检查前一天是否睡过觉
      if (d.lastSleepDay < prevDay) {
        healthLost += 10;
        missedMeals.push('睡觉');
        d.health = Math.max(0, d.health - 10);
      }
    }

    // 保存惩罚信息，供调用方显示
    d._lastHealthLost = healthLost;
    d._lastMissedMeals = missedMeals;
    d._lastMissedSleep = d.day > prevDay && d.lastSleepDay < prevDay;

    // 健康下降时播放警告音
    if (healthLost > 0 && window.gameAudio) {
      gameAudio.play('warn');
    }

    // 检查健康值是否为0，触发坏结局
    if (d.health <= 0) {
      d.health = 0;
      updateGameUI();
      gameOver();
      return true; // 返回true表示游戏已结束
    }

    updateGameUI();
    return false; // 返回false表示游戏继续
  }

  // 游戏失败处理
  function gameOver() {
    if (!currentGameData) return;
    stopGameLoop();
    const failDays = document.getElementById('fail-days');
    const failHealth = document.getElementById('fail-health');
    if (failDays) failDays.textContent = currentGameData.day;
    if (failHealth) failHealth.textContent = currentGameData.health;
    if (window.gameAudio) gameAudio.play('fail');
    showPage('fail');
  }

  // 与小谷对话
  const XIAOGU_DIALOGUES = [
    { xiaogu: '今天的食堂饭菜怎么样？我听说中午有糖醋排骨！', player: '还可以吧，就是排队太久了，差点迟到。' },
    { xiaogu: '你有没有觉得高数课越来越难了？我上次都没听懂。', player: '确实，我也得多去图书馆补补课了。' },
    { xiaogu: '最近图书馆人好多，你一般什么时候去啊？', player: '我通常傍晚去，那时候人少一点。' },
    { xiaogu: '下周体育课要测800米，我好慌啊……', player: '哈哈别怕，我陪你一起跑！' },
    { xiaogu: '你买了那本数据结构的教材吗？听说挺贵的。', player: '买了，确实不便宜，不过挺有用的。' },
    { xiaogu: '昨天晚上寝室好吵，根本没睡好。', player: '我们寝室也是，室友打游戏到凌晨。' },
    { xiaogu: '你觉得C语言难学吗？我总觉得指针搞不懂。', player: '刚开始确实难，多写代码就习惯了。' },
    { xiaogu: '校园超市新出了一种面包，还挺好吃的！', player: '真的吗？下课我去买一个尝尝。' },
    { xiaogu: '你有没有参加什么社团呀？', player: '还没呢，你有什么推荐吗？' },
    { xiaogu: '今天天气真好，真想在操场上晒晒太阳。', player: '是啊，可惜下午还有课。' },
    { xiaogu: '你平时几点起床啊？我总是踩点上课。', player: '我一般七点起，不过偶尔也会赖床。' },
    { xiaogu: '听说这学期期末考试提前了，你开始复习了吗？', player: '啊？还没呢，得赶紧开始了。' },
    { xiaogu: '实验楼的电脑太卡了，上次写代码差点崩溃。', player: '哈哈，我都是自己带笔记本去上课的。' },
    { xiaogu: '你有没有觉得大学物理的公式太多了？', player: '确实，我都记不住，只能靠刷题了。' },
    { xiaogu: '最近食堂的窗口换了新菜单，你试过吗？', player: '还没，中午一起去尝尝？' },
    { xiaogu: '我昨天在图书馆借了一本小说，好好看！', player: '什么书？推荐给我呗。' },
    { xiaogu: '你有没有觉得电路与电子学好难啊？', player: '太难了，我都快听不懂了。' },
    { xiaogu: '下课后要不要一起去校园超市逛逛？', player: '好啊，正好我要买点东西。' },
    { xiaogu: '你最近编程能力进步了不少呀！', player: '谢谢，多练练就好了。' },
    { xiaogu: '今天的离散数学课你听懂了吗？', player: '勉强吧，有些地方还得回去琢磨。' }
  ];

  function talkToXiaogu() {
    if (!currentGameData) return;
    // 主角走向小谷面前（小谷在x=180，站在她右侧）
    const targetPos = { x: 230, y: 470 };
    const bounds = getSceneBounds();
    const path = findPath(playerX, playerY, targetPos.x, targetPos.y, bounds);
    if (path && path.length > 1) {
      currentPath = path;
      targetX = targetPos.x;
      targetY = targetPos.y;
    } else {
      targetX = targetPos.x;
      targetY = targetPos.y;
      currentPath = [];
    }

    // 随机增加2-5点好感度
    const favorGain = Math.floor(Math.random() * 4) + 2;
    currentGameData.xiaoguFavor = Math.min(1000, (currentGameData.xiaoguFavor || 0) + favorGain);

    // 走到后延迟显示对话
    const dialogue = XIAOGU_DIALOGUES[Math.floor(Math.random() * XIAOGU_DIALOGUES.length)];
    const walkDuration = 1200;
    setTimeout(() => {
      if (window.gameAudio) { gameAudio.play('talk'); gameAudio.play('favor'); }
      const msg = `🐱 小谷：${dialogue.xiaogu}\n\n🧑 我：${dialogue.player}\n\n💕 小谷好感度 +${favorGain}（当前：${currentGameData.xiaoguFavor}）`;
      openSimpleNotice(msg);
    }, walkDuration);
  }

  // 与室友对话
  const ROOMMATE_DIALOGUES = {
    xin: [
      { roommate: '兄弟，今天高数作业写了吗？借我参考一下呗。', player: '我还没写完呢，等我写完再说。' },
      { roommate: '你有没有觉得食堂的饭菜越来越难吃了？', player: '还好吧，我比较不挑食。' },
      { roommate: '昨晚打游戏打到凌晨三点，困死了。', player: '难怪你今天上课一直在打瞌睡。' },
      { roommate: '这周末要不要一起去校外吃顿好的？', player: '行啊，我也想换换口味了。' },
      { roommate: '你说数据结构到底怎么学啊？我完全听不懂。', player: '多刷题吧，我也在慢慢摸索。' },
      { roommate: '今天体育课跑了一千米，腿都要断了。', player: '哈哈，你平时得多锻炼了。' },
      { roommate: '你编程好厉害，能不能教教我？', player: '互相学习嘛，有问题随时问。' }
    ],
    wang: [
      { roommate: '哟，今天又去图书馆了？真用功啊。', player: '没办法，快期末了得抓紧。' },
      { roommate: '你有没有多余的充电线？我的坏了。', player: '我找找看，应该有一根。' },
      { roommate: '今天英语课老师提问我，我啥都不会，尴尬死了。', player: '哈哈，下次记得预习一下。' },
      { roommate: '要不要一起点外卖？凑个满减。', player: '好啊，你想吃什么？' },
      { roommate: '我最近在追一部剧，超级好看！推荐你也看看。', player: '什么剧？说来听听。' },
      { roommate: '寝室的Wi-Fi怎么这么卡啊？气死我了。', player: '可能是用的人太多了吧。' },
      { roommate: '你说毕业以后我们能找到好工作吗？', player: '别想那么远，先把眼前的事做好。' }
    ],
    tang: [
      { roommate: '哥们儿，帮我带个饭呗？我不想下楼了。', player: '行吧，你想吃什么？' },
      { roommate: '今天电路与电子学课你听懂了吗？我全程懵。', player: '勉强吧，回去得再看看书。' },
      { roommate: '你有没有 notice 到最近操场上人特别多？', player: '可能是天气好了大家都出来运动了。' },
      { roommate: '我昨天在校园超市买到了打折的零食，超划算！', player: '真的吗？我也去看看。' },
      { roommate: '下学期选课你打算选什么？', player: '还没想好，你有什么推荐吗？' },
      { roommate: '你觉不觉得咱们宿管阿姨特别凶？', player: '还好吧，她也是为了咱们好。' },
      { roommate: '今晚要不要一起开黑？好久没打游戏了。', player: '行啊，不过别打太晚。' }
    ]
  };

  function talkToRoommate(key) {
    if (!currentGameData) return;
    const rm = ROOMMATES.find(r => r.key === key);
    if (!rm) return;

    // 走到室友附近
    const targetPos = { x: rm.cx + (rm.cx < 200 ? 50 : -50), y: rm.feetY };
    const bounds = getSceneBounds();
    const path = findPath(playerX, playerY, targetPos.x, targetPos.y, bounds);
    if (path && path.length > 1) {
      currentPath = path;
      targetX = targetPos.x;
      targetY = targetPos.y;
    } else {
      targetX = targetPos.x;
      targetY = targetPos.y;
      currentPath = [];
    }

    // 随机增加2-5点好感度
    const favorGain = Math.floor(Math.random() * 4) + 2;
    if (!currentGameData.roommateFavors) currentGameData.roommateFavors = { xin: 0, wang: 0, tang: 0 };
    currentGameData.roommateFavors[key] = Math.min(1000, (currentGameData.roommateFavors[key] || 0) + favorGain);

    // 走到后延迟显示对话
    const dialogues = ROOMMATE_DIALOGUES[key] || [];
    const dialogue = dialogues[Math.floor(Math.random() * dialogues.length)];
    const walkDuration = 1000;
    setTimeout(() => {
      if (window.gameAudio) { gameAudio.play('talk'); gameAudio.play('favor'); }
      const msg = `🧑‍🤝‍🧑 ${rm.name}：${dialogue.roommate}\n\n🧑 我：${dialogue.player}\n\n💕 ${rm.name}好感度 +${favorGain}（当前：${currentGameData.roommateFavors[key]}）`;
      openSimpleNotice(msg);
    }, walkDuration);
  }

  // 上课（点击102教室门触发）
  function attendClass() {
    if (!currentGameData) return;
    const d = currentGameData;
    const dayOfWeek = (d.day - 1) % 7;

    // 周末没有课
    if (dayOfWeek >= 5) {
      if (window.gameAudio) gameAudio.play('error');
      openSimpleNotice('今天是周末，没有课哦~');
      return;
    }

    const weekdayKey = ['周一', '周二', '周三', '周四', '周五'][dayOfWeek];
    const daySchedule = (d.schedule || {})[weekdayKey] || [];

    // 查找当前时段的课程
    let course = null;
    for (let i = 0; i < TIME_PERIODS.length; i++) {
      if (TIME_PERIODS[i].slot === d.timeSlot && daySchedule[i]) {
        course = daySchedule[i];
        break;
      }
    }

    if (!course) {
      if (window.gameAudio) gameAudio.play('error');
      openSimpleNotice('当前时段没有课~\n可以打开手机查看课程表');
      return;
    }

    // 上课钟声
    if (window.gameAudio) gameAudio.play('classBell');
    const ts = TIME_SLOTS[d.timeSlot];

    // 若上课跳过了中午时段，不会减健康值
    if (d.timeSlot === 1) {
      d.lunchEaten = true;
    }

    const isGameOver = advanceTime(1);
    if (isGameOver) return;

    let msg = `📚 上了一节${course.name}（${course.periodName}）\n地点：${course.loc}`;
    if (d._lastMissedSleep) {
      msg += '\n😫 昨晚没睡觉！健康 -10';
    }
    if (d._lastHealthLost > 0) {
      msg += `\n😫 饿肚子了！健康 -${d._lastHealthLost}（没吃${d._lastMissedMeals.filter(m => m !== '睡觉').join('、')}）`;
    }
    openSimpleNotice(msg);
  }

  function doAction(type) {
    if (!currentGameData) return;
    const d = currentGameData;
    const ts = TIME_SLOTS[d.timeSlot];
    let isGameOver = false;
    // 播放对应音效
    if (window.gameAudio) gameAudio.play(type);

    switch (type) {
      case 'rest':
        let healthGain = 0;
        if (d.timeSlot === 4 || d.timeSlot === 5) {
          healthGain = 6;
        } else {
          healthGain = 4;
        }
        d.health = Math.min(100, d.health + healthGain);
        d.lastSleepDay = d.day;

        if (d.timeSlot === 5) {
          // 深夜休息只跳到第二天上午
          isGameOver = advanceTime(1);
          if (isGameOver) return;
          let msg = `😴 睡了一觉，天亮了！\n健康 +${healthGain}\n现在是${TIME_SLOTS[d.timeSlot]}，${WEEKDAYS[(d.day - 1) % 7]}`;
          if (d._lastMissedSleep) {
            msg += `\n😫 昨晚没睡觉！健康 -10`;
          }
          if (d._lastHealthLost > 0) {
            msg += `\n😫 饿肚子了！健康 -${d._lastHealthLost}（没吃${d._lastMissedMeals.filter(m => m !== '睡觉').join('、')}）`;
          }
          openSimpleNotice(msg);
        } else {
          isGameOver = advanceTime(2); // 休息跳过两个时段
          if (isGameOver) return;
          let msg = `😴 休息了一会儿（${ts}）\n跳过两个时段\n健康 +${healthGain}`;
          if (d._lastMissedSleep) {
            msg += `\n😫 昨晚没睡觉！健康 -10`;
          }
          if (d._lastHealthLost > 0) {
            msg += `\n😫 饿肚子了！健康 -${d._lastHealthLost}（没吃${d._lastMissedMeals.filter(m => m !== '睡觉').join('、')}）`;
          }
          openSimpleNotice(msg);
        }
        break;
      case 'study':
        d.knowledge = Math.min(500, d.knowledge + 5);
        d.lastStudyDay = d.day;
        isGameOver = advanceTime(1); // 学习度过一个时段
        if (isGameOver) return;
        let msgStudy = `📖 努力学习（${ts}）\n知识储备 +5`;
        if (d._lastMissedSleep) {
          msgStudy += `\n😫 昨晚没睡觉！健康 -10`;
        }
        if (d._lastHealthLost > 0) {
          msgStudy += `\n😫 饿肚子了！健康 -${d._lastHealthLost}（没吃${d._lastMissedMeals.filter(m => m !== '睡觉').join('、')}）`;
        }
        openSimpleNotice(msgStudy);
        break;
      case 'code':
        d.program = Math.min(500, d.program + 5);
        d.lastCodeDay = d.day;
        isGameOver = advanceTime(1); // 写代码度过一个时段
        if (isGameOver) return;
        let msgCode = `💻 写代码（${ts}）\n编程能力 +5`;
        if (d._lastMissedSleep) {
          msgCode += `\n😫 昨晚没睡觉！健康 -10`;
        }
        if (d._lastHealthLost > 0) {
          msgCode += `\n😫 饿肚子了！健康 -${d._lastHealthLost}（没吃${d._lastMissedMeals.filter(m => m !== '睡觉').join('、')}）`;
        }
        openSimpleNotice(msgCode);
        break;
    }
  }

  bindClick('btn-rest', () => doAction('rest'));
  bindClick('btn-study', () => doAction('study'));
  bindClick('btn-code', () => doAction('code'));


  bindClick('btn-next-time', () => {
    if (!currentGameData) return;
    if (window.gameAudio) gameAudio.play('tick');
    const isGameOver = advanceTime(1);
    if (isGameOver) return;
    if (currentGameData.day > 360) {
      openSimpleNotice('🎓 恭喜毕业！\n大学生活圆满结束！');
      stopGameLoop();
      showPage('cover');
      return;
    }
    const d = currentGameData;
    let msg = `⏭️ 时间流逝……\n现在是${TIME_SLOTS[d.timeSlot]}，${WEEKDAYS[(d.day - 1) % 7]}`;
    if (d._lastMissedSleep) {
      msg += `\n😫 昨晚没睡觉！健康 -10`;
    }
    if (d._lastHealthLost > 0) {
      msg += `\n😫 饿肚子了！健康 -${d._lastHealthLost}（没吃${d._lastMissedMeals.filter(m => m !== '睡觉').join('、')}）`;
    }
    openSimpleNotice(msg);
  });

  bindClick('btn-game-save', () => {
    if (!currentGameSlot || !currentGameData) {
      if (window.gameAudio) gameAudio.play('error');
      openSimpleNotice('请先进入游戏，再进行存档！');
      return;
    }
    saveToSlot(currentGameSlot);
    if (window.gameAudio) gameAudio.play('save');
    openSimpleNotice(`💾 已保存到存档 ${currentGameSlot}！`);
  });

});
