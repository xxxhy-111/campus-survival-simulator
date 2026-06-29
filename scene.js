/* ==========================================================
   校园生存模拟器 - 封面场景绘制脚本
   像素风 / Canvas 2D / 960 x 540
   内容: 大学门前人来人往 + 背向玩家的新生小白
   ========================================================== */

let APP_CONTENTS = {};

// 安全绑定事件的辅助函数
function bindClick(id, callback) {
  const el = document.getElementById(id);
  if (el) el.addEventListener('click', callback);
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
      events: [],
      createdAt: new Date().toISOString()
    };
  }

  /* ==========================================================
     页面路由
     ========================================================== */
  const pages = {
    cover: document.getElementById('page-cover'),
    save: document.getElementById('page-save'),
    game: document.getElementById('page-game')
  };
  function showPage(name) {
    Object.values(pages).forEach(p => { if (p) p.classList.remove('active'); });
    if (pages[name]) pages[name].classList.add('active');
    if (name === 'game') {
      startGameLoop();
    } else {
      stopGameLoop();
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
  let playerFacing = 1;     // 1=朝右, -1=朝左
  let playerStepFrame = 0;  // 走路动画帧计数器

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

  // 地点对应的 Canvas 场景渲染函数
  const SCENE_FNS = {
    dorm: renderDormScene,
  };

  // 鼠标点击：主角移动到点击位置
  if (gameCanvas) {
    gameCanvas.addEventListener('click', function(e) {
      const rect = gameCanvas.getBoundingClientRect();
      const scaleX = gameCanvas.width / rect.width;
      const scaleY = gameCanvas.height / rect.height;
      const clickX = (e.clientX - rect.left) * scaleX;
      const clickY = (e.clientY - rect.top) * scaleY;

      // 可活动范围：左边寝室 + 右边阳台（排除卫生间和晾衣区）
      const minY = 150;
      const maxY = 505;
      const minX = 30;
      const maxX = 930;

      // 卫生间区域 (bathX=720, bathY=370, bathW=240, bathH=140)
      const bathX = 720;
      const bathY = 370;
      const bathW = 240;
      const bathH = 140;
      const inBathroom = clickX >= bathX && clickX <= bathX + bathW &&
                         clickY >= bathY && clickY <= bathY + bathH;

      // 晾衣杆+衣服区域 (x735-955, y245-300)
      const clothesX = 735;
      const clothesY = 245;
      const clothesW = 220;
      const clothesH = 55;
      const inClothes = clickX >= clothesX && clickX <= clothesX + clothesW &&
                       clickY >= clothesY && clickY <= clothesY + clothesH;

      if (!inBathroom && !inClothes) {
        targetX = Math.max(minX, Math.min(maxX, clickX));
        targetY = Math.max(minY, Math.min(maxY, clickY));
      }
    });
  }

  function startGameLoop() {
    if (gameLoopId) return;
    updateGameUI();
    // 每次进入游戏，重置主角到默认位置
    playerX = 130;
    playerY = GAME_H - 30 - 90;
    targetX = playerX;
    targetY = playerY;
    function loop() {
      // 障碍物区域碰撞检测（卫生间 + 晾衣杆）
      const bathX = 720, bathY = 370, bathW = 240, bathH = 140;
      const clothesX = 735, clothesY = 245, clothesW = 220, clothesH = 55;

      // === 更新主角位置 ===
      const dx = targetX - playerX;
      const dy = targetY - playerY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const speed = 2.5;  // 每帧移动像素

      if (dist > speed) {
        // 逐帧靠近目标点（先试新位置，如果进入障碍物区域则不移动）
        const nextX = playerX + (dx / dist) * speed;
        const nextY = playerY + (dy / dist) * speed;
        const inBathroom = nextX >= bathX && nextX <= bathX + bathW &&
                           nextY >= bathY && nextY <= bathY + bathH;
        const inClothes = nextX >= clothesX && nextX <= clothesX + clothesW &&
                         nextY >= clothesY && nextY <= clothesY + clothesH;
        if (!inBathroom && !inClothes) {
          playerX = nextX;
          playerY = nextY;
        } else {
          // 碰到卫生间边界，停止
          targetX = playerX;
          targetY = playerY;
        }
        // 更新朝向
        if (Math.abs(dx) > 0.5) {
          playerFacing = dx > 0 ? 1 : -1;
        }
        // 走路动画帧推进
        playerStepFrame = (playerStepFrame + 1) % 60;
      } else {
        // 到达目标
        playerX = targetX;
        playerY = targetY;
        playerStepFrame = 0;
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
    // 室友1：右上书桌（书桌2，x=340），穿蓝色T恤
    drawRoommatePixel(365, 150, '#4a8ac8');
    // 室友2：右下书桌（书桌3，x=340），穿绿色T恤
    drawRoommatePixel(365, H - 30 - 80, '#e86a4a');
    // 室友3：左上书桌（书桌0，x=40），穿橙色T恤
    drawRoommatePixel(65, 150, '#e8a04a');

    // === 主角小白（动态坐标，鼠标点击控制移动）===
    drawDormPlayer(playerX, playerY, playerFacing, playerStepFrame);
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
    window._currentGameData = currentGameData;
    showPage('game');
  }

  function saveToSlot(slotNum) {
    if (!currentGameData) return;
    writeSave(slotNum, Object.assign({}, currentGameData));
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

  /* ==========================================================
     手机界面
     ========================================================== */
  document.addEventListener('click', (e) => {
    const btnPhone = e.target.closest('#btn-phone');
    const btnPhoneClose = e.target.closest('#btn-phone-close');
    if (btnPhone) {
      const phoneOverlay = document.getElementById('phone-overlay');
      if (phoneOverlay) phoneOverlay.classList.add('active');
    }
    if (btnPhoneClose) {
      const phoneOverlay = document.getElementById('phone-overlay');
      if (phoneOverlay) phoneOverlay.classList.remove('active');
    }
  });

  APP_CONTENTS = {
    calendar: {
      title: '📅 日历',
      html: function() { return `
        <div class="app-calendar">
          <div class="cal-date">
            <div class="cal-semester">${YEAR_NAMES[Math.min(YEAR_NAMES.length - 1, Math.ceil(currentGameData.day / 90) - 1)]}</div>
            <div class="cal-day">${WEEKDAYS[(currentGameData.day - 1) % 7]}</div>
            <div class="cal-week">第 ${currentGameData.day} 天</div>
          </div>
          <div class="cal-tips">
            <p>🕒 当前时段：${TIME_SLOTS[currentGameData.timeSlot]}</p>
            <p>📅 每学年总天数：90天</p>
            <p>📚 共 360 天可毕业</p>
          </div>
        </div>`; }
    },
    group: {
      title: '👥 科大小组手',
      html: function() { return `
        <div class="app-group">
          <div class="group-chat" id="group-chat-schedule">
            <div class="schedule-table">
              <div class="schedule-header">
                <div class="sch-cell sch-time">时间</div>
                <div class="sch-cell">周一</div>
                <div class="sch-cell">周二</div>
                <div class="sch-cell">周三</div>
                <div class="sch-cell">周四</div>
                <div class="sch-cell">周五</div>
              </div>
              <div class="schedule-row">
                <div class="sch-cell sch-time">1-2节<br><span class="sch-small">08:00-09:40</span></div>
                <div class="sch-cell sch-course sch-math">高等数学<br><span class="sch-small">教1-201</span></div>
                <div class="sch-cell sch-course sch-eng">大学英语<br><span class="sch-small">教2-305</span></div>
                <div class="sch-cell sch-course sch-prog">C语言程序设计<br><span class="sch-small">实验楼A</span></div>
                <div class="sch-cell sch-course sch-math">高等数学<br><span class="sch-small">教1-201</span></div>
                <div class="sch-cell sch-course sch-comp">计算机导论<br><span class="sch-small">教3-108</span></div>
              </div>
              <div class="schedule-row">
                <div class="sch-cell sch-time">3-4节<br><span class="sch-small">10:00-11:40</span></div>
                <div class="sch-cell sch-course sch-comp">计算机导论<br><span class="sch-small">教3-108</span></div>
                <div class="sch-cell"></div>
                <div class="sch-cell sch-course sch-eng">大学英语<br><span class="sch-small">教2-305</span></div>
                <div class="sch-cell sch-course sch-pe">体育<br><span class="sch-small">操场</span></div>
                <div class="sch-cell sch-course sch-prog">C语言程序设计<br><span class="sch-small">实验楼A</span></div>
              </div>
              <div class="schedule-row">
                <div class="sch-cell sch-time">5-6节<br><span class="sch-small">14:00-15:40</span></div>
                <div class="sch-cell sch-course sch-pe">体育<br><span class="sch-small">操场</span></div>
                <div class="sch-cell sch-course sch-math">高等数学<br><span class="sch-small">教1-201</span></div>
                <div class="sch-cell"></div>
                <div class="sch-cell sch-course sch-comp">计算机导论<br><span class="sch-small">教3-108</span></div>
                <div class="sch-cell sch-course sch-eng">大学英语<br><span class="sch-small">教2-305</span></div>
              </div>
              <div class="schedule-row">
                <div class="sch-cell sch-time">7-8节<br><span class="sch-small">16:00-17:40</span></div>
                <div class="sch-cell"></div>
                <div class="sch-cell sch-course sch-prog">C语言程序设计<br><span class="sch-small">实验楼A</span></div>
                <div class="sch-cell sch-course sch-math">高等数学<br><span class="sch-small">教1-201</span></div>
                <div class="sch-cell"></div>
                <div class="sch-cell"></div>
              </div>
            </div>
            <div class="schedule-legend">
              <span class="legend-item"><span class="legend-dot sch-math"></span>理科课程</span>
              <span class="legend-item"><span class="legend-dot sch-eng"></span>文科课程</span>
              <span class="legend-item"><span class="legend-dot sch-prog"></span>编程课程</span>
              <span class="legend-item"><span class="legend-dot sch-comp"></span>计算机基础</span>
              <span class="legend-item"><span class="legend-dot sch-pe"></span>体育</span>
            </div>
          </div>
        </div>`; }
    },
    shop: {
      title: '🛒 购物',
      html: function() { return `
        <div class="app-shop">
          <div class="shop-balance">💰 余额：<strong>${currentGameData.money}</strong> 元</div>
          <div class="shop-items">
            <div class="shop-item-row">
              <div class="item-info"><span class="item-emoji">🍫</span> <span>巧克力</span></div>
              <div class="item-price">8元</div>
              <div class="item-effect">💻 +5</div>
              <button class="pixel-btn shop-buy" data-item="choco" data-price="8" data-code="5">购买</button>
            </div>
            <div class="shop-item-row">
              <div class="item-info"><span class="item-emoji">📖</span> <span>技术书籍</span></div>
              <div class="item-price">50元</div>
              <div class="item-effect">📚 +15</div>
              <button class="pixel-btn shop-buy" data-item="book" data-price="50" data-book="15">购买</button>
            </div>
          </div>
        </div>`; }
    },
    chat: {
      title: '💬 聊天',
      html: function() { return `
        <div class="app-chat">
          <div class="chat-list">
            <div class="chat-contact" data-contact="roommate-a">
              <div class="contact-avatar" style="background:#4a8ac8">A</div>
              <div class="contact-info">
                <div class="contact-name">室友A</div>
                <div class="contact-preview">一起去图书馆？</div>
              </div>
            </div>
            <div class="chat-contact" data-contact="roommate-b">
              <div class="contact-avatar" style="background:#e86a4a">B</div>
              <div class="contact-info">
                <div class="contact-name">室友B</div>
                <div class="contact-preview">考试加油！💪</div>
              </div>
            </div>
            <div class="chat-contact" data-contact="roommate-c">
              <div class="contact-avatar" style="background:#e8a04a">C</div>
              <div class="contact-info">
                <div class="contact-name">室友C</div>
                <div class="contact-preview">食堂人好多...</div>
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
    call: {
      title: '📞 电话',
      html: function() { return `
        <div class="app-call">
          <div class="call-section">
            <div class="call-section-title">📱 室友</div>
            <div class="call-list">
              <div class="call-contact">
                <div class="call-avatar" style="background:#4a8ac8">A</div>
                <div class="call-info">
                  <div class="call-name">室友A</div>
                  <div class="call-status">💻 正在写代码...</div>
                </div>
                <button class="pixel-btn call-btn" data-who="roommate-a">📞</button>
              </div>
              <div class="call-contact">
                <div class="call-avatar" style="background:#e86a4a">B</div>
                <div class="call-info">
                  <div class="call-name">室友B</div>
                  <div class="call-status">📚 在图书馆</div>
                </div>
                <button class="pixel-btn call-btn" data-who="roommate-b">📞</button>
              </div>
              <div class="call-contact">
                <div class="call-avatar" style="background:#e8a04a">C</div>
                <div class="call-info">
                  <div class="call-name">室友C</div>
                  <div class="call-status">🎮 在打游戏</div>
                </div>
                <button class="pixel-btn call-btn" data-who="roommate-c">📞</button>
              </div>
            </div>
          </div>
          <div class="call-section">
            <div class="call-section-title">👨‍👩‍👧 家人</div>
            <div class="call-list">
              <div class="call-contact">
                <div class="call-avatar" style="background:#e87a9a">妈</div>
                <div class="call-info">
                  <div class="call-name">妈妈</div>
                  <div class="call-status">🏠 在家</div>
                </div>
                <button class="pixel-btn call-btn" data-who="mom">📞</button>
              </div>
            </div>
          </div>
          <div class="call-tips">📍 前往教学楼可解锁更多联系人</div>
        </div>`; }
    },
    settings: {
      title: '⚙️ 设置',
      html: function() { return `
        <div class="app-settings">
          <div class="setting-row">
            <span>🔊 音效</span>
            <label class="switch">
              <input type="checkbox" id="setting-sound" checked>
              <span class="slider"></span>
            </label>
          </div>
          <div class="setting-row">
            <span>🎵 音乐</span>
            <label class="switch">
              <input type="checkbox" id="setting-music" checked>
              <span class="slider"></span>
            </label>
          </div>
          <div class="setting-divider"></div>
          <div class="setting-info">
            <p>📖 游戏帮助</p>
            <p class="setting-desc">点击地图上的地点移动，消耗体力。</p>
            <p class="setting-desc">在寝室可以学习、写代码或社交。</p>
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
          openSimpleNotice('💰 金钱不足！');
          return;
        }
        currentGameData.money -= price;
        if (buyBtn.dataset.code) {
          currentGameData.programming = Math.min(500, currentGameData.programming + parseInt(buyBtn.dataset.code, 10));
          openSimpleNotice('✅ 购买成功！编程能力 +' + buyBtn.dataset.code);
        }
        if (buyBtn.dataset.book) {
          currentGameData.knowledge = Math.min(500, currentGameData.knowledge + parseInt(buyBtn.dataset.book, 10));
          openSimpleNotice('✅ 购买成功！知识 +' + buyBtn.dataset.book);
        }
        updateGameUI();
      });
    });
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
        'roommate-a': [
          {t:'other', n:'室友A', m:'一起去图书馆吗？'},
          {t:'me', m:'我正在寝室写代码'},
          {t:'other', n:'室友A', m:'哦哦，那加油！💪'},
        ],
        'roommate-b': [
          {t:'other', n:'室友B', m:'考试加油！💪'},
          {t:'me', m:'谢谢！高数太难了'},
          {t:'other', n:'室友B', m:'一起复习吧！'},
        ],
        'roommate-c': [
          {t:'other', n:'室友C', m:'食堂人好多...'},
          {t:'me', m:'中午人太多了'},
          {t:'other', n:'室友C', m:'要不叫外卖？'},
        ],
        'mom': [
          {t:'other', n:'妈妈', m:'天冷了记得加衣服'},
          {t:'me', m:'知道了，妈'},
          {t:'other', n:'妈妈', m:'钱还够花吗？'},
        ],
      };
      const history = msgs[who] || [];
      if (panel) {
        panel.innerHTML = '<div class="chat-detail-header">💬 与 ' + (who === 'mom' ? '妈妈' : who.replace('roommate-','室友')) + ' 的聊天</div><div class="chat-detail-msgs">' +
          history.map(m => `<div class="chat-bubble ${m.t==='me'?'bubble-me':'bubble-other'}"><span class="bubble-text">${m.n ? m.n+': ' : ''}${m.m}</span></div>`).join('') + '</div>';
      }
    }
    // 电话拨打
    if (e.target.classList.contains('call-btn')) {
      const who = e.target.dataset.who;
      const names = { 'roommate-a':'室友A','roommate-b':'室友B','roommate-c':'室友C','mom':'妈妈' };
      openSimpleNotice('📞 正在呼叫 ' + (names[who] || who) + '...');
    }
  });

  bindClick('btn-app-close', () => {
    const appOverlay = document.getElementById('app-overlay');
    if (appOverlay) appOverlay.classList.remove('active');
  });

  /* ==========================================================
     地图界面
     ========================================================== */
  bindClick('btn-map', () => {
    updateGameUI();
    const mapOverlay = document.getElementById('map-overlay');
    if (mapOverlay) mapOverlay.classList.add('active');
  });
  bindClick('btn-map-close', () => {
    const mapOverlay = document.getElementById('map-overlay');
    if (mapOverlay) mapOverlay.classList.remove('active');
  });
  document.querySelectorAll('.map-place').forEach(placeBtn => {
    placeBtn.addEventListener('click', () => {
      const place = placeBtn.dataset.place;
      currentGameData.location = place;
      updateGameUI();
      document.getElementById('map-overlay').classList.remove('active');
    });
  });

  /* ==========================================================
     行动栏
  ========================================================== */
  // 推进时间（amount 为整数时段数），内部处理 day 进位、遗忘惩罚、UI 更新
  function advanceTime(amount) {
    const d = currentGameData;
    const prevDay = d.day;
    d.timeSlot += amount;
    while (d.timeSlot >= 6) {
      d.timeSlot -= 6;
      d.day++;
    }
    // 进天时检查遗忘惩罚
    if (d.day > prevDay) {
      if (d.day - d.lastStudyDay >= 2) {
        d.knowledge = Math.max(0, d.knowledge - 3);
      }
      if (d.day - d.lastCodeDay >= 2) {
        d.program = Math.max(0, d.program - 3);
      }
    }
    // 跨天时遗忘惩罚已在上面处理
    updateGameUI();
  }

  function doAction(type) {
    if (!currentGameData) return;
    const d = currentGameData;
    const ts = TIME_SLOTS[d.timeSlot];

    switch (type) {
      case 'rest':
        advanceTime(2); // 休息跳过两个时段
        openSimpleNotice(`😴 休息了一会儿（${ts}）\n跳过两个时段`);
        break;
      case 'study':
        d.knowledge = Math.min(500, d.knowledge + 5);
        d.lastStudyDay = d.day;
        advanceTime(1); // 学习度过一个时段
        openSimpleNotice(`📖 努力学习（${ts}）\n知识储备 +5`);
        break;
      case 'code':
        d.program = Math.min(500, d.program + 5);
        d.lastCodeDay = d.day;
        advanceTime(1); // 写代码度过一个时段
        openSimpleNotice(`💻 写代码（${ts}）\n编程能力 +5`);
        break;
    }
  }

  bindClick('btn-rest', () => doAction('rest'));
  bindClick('btn-study', () => doAction('study'));
  bindClick('btn-code', () => doAction('code'));


  bindClick('btn-next-time', () => {
    if (!currentGameData) return;
    advanceTime(1);
    if (currentGameData.day > 360) {
      openSimpleNotice('🎓 恭喜毕业！\n大学生活圆满结束！');
      stopGameLoop();
      showPage('cover');
      return;
    }
    openSimpleNotice(`⏭️ 时间流逝……\n现在是${TIME_SLOTS[currentGameData.timeSlot]}，${WEEKDAYS[(currentGameData.day - 1) % 7]}`);
  });

  bindClick('btn-game-save', () => {
    if (!currentGameSlot || !currentGameData) {
      openSimpleNotice('请先进入游戏，再进行存档！');
      return;
    }
    saveToSlot(currentGameSlot);
    openSimpleNotice(`💾 已保存到存档 ${currentGameSlot}！`);
  });

});
