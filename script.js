function Player() {
  this.color = INITIAL_PLAYER_COLOR;
  this.position = 0;
  this.score = 0;
  this.maxScore = 0;
  this.move = d => {
    this.position += d;
    if (this.position < 0) this.position = 0;
    if (this.position > BOARD_WIDTH - 1) this.position = BOARD_WIDTH - 1;
  };
  this.collect = part => {
    this.color = COLORS[part];
    addMusicPart(part);
    addPlayerParticle();
    this.score += 1;
    this.maxScore = Math.max(this.score, this.maxScore);
    hud.setScore(this.score, 1);
  };
  this.fail = () => {
    this.color = INITIAL_PLAYER_COLOR;
    if (this.score === 0) return;
    
    this.score -= PUNISHMENT;
    if (this.score <= 0) this.score = 0;

    hud.setScore(this.score);

    if (this.score === 0) {
      gameOver();
    }
  };
};

let finished = false;
let particles = [];
const player = new Player();
const bars = [];
let t = 0;
let pulseSize = 0;
let beat = false;
let hud;

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
canvas.width = WIDTH;
canvas.height = HEIGHT;

let prevBarIndex = 0;
const addBar = () => {
  const bar = Array(BOARD_WIDTH).fill(EMPTY);
  if (bars.length % PART_FREQ === 0) {
    const available = Object.keys(parts)
      .map(k => parts[k])
      .filter(part => !bars.some(bar => bar.includes(part)));

    let barIndex = prevBarIndex;
    if (available) {
      if (player.maxScore > 60) {
        const maxTries = 10;
        let tries = 0;
        while (tries < maxTries && (prevBarIndex === barIndex || prevBarIndex === barIndex - 1 || prevBarIndex === barIndex + 1)) {
          // force a difficult bar index
          barIndex = randRange(0, BOARD_WIDTH - 1);
          tries++;
        }
      } else if (player.maxScore > 50) {
        if (barIndex === BOARD_WIDTH - 1) barIndex -= 1;
        else if (barIndex === 0) barIndex += 1;
        else barIndex += randRange(0, 2) - 1;
      } else if (player.maxScore > 40) {
        if (barIndex === BOARD_WIDTH - 1) barIndex -= 1;
        else if (barIndex === 0) barIndex += 1;
        else barIndex += randRange(0, 4) - 2;

        if (barIndex >= BOARD_WIDTH) barIndex = BOARD_WIDTH - 1;
        if (barIndex < 0) barIndex = 0;
      } else {
        barIndex = randRange(0, BOARD_WIDTH - 1);
      }
      bar[barIndex] = randValue(available);
      prevBarIndex = barIndex;
    }

  }
  bars.push(bar);
};

const addPlayerParticle = () => {
  const { xCenter, yCenter, wh } = getPlayerRenderInfo();
  const howMany = Math.min(4 + Math.floor(player.score / 4), 16);
  let colorInc = 0;
  for (let i = 0; i < howMany; i++) {
    const a = Math.PI * 2 * i / howMany;
    const r = wh;
    const color = new Color(hexToHsl(player.color, 0.7));
    colorInc += 20;
    color.h += colorInc;
    particles.push(new Particle({
      color,
      x: xCenter,
      y: yCenter,
      r,
      dx: Math.cos(a + bars.length) * 3,
      dy: Math.sin(a + bars.length) * 3,
      update: function () {
        this.r -= 2;
        this.color.h += 5;
        if (this.r <= 0) {
          this.r = 0;
          this.dead = true;
          this.dx += Math.cos(t) * 3;
          this.dy += Math.sin(t) * 3;
        }
      }
    }));
  }
};

const triggerBeat = () => {
  beat = true;
};

const getPlayerRenderInfo = () => {
  const wh = (SQUARE_DIM + pulseSize) + 8;
  const space = WIDTH / BOARD_WIDTH * (player.position + 0.5);
  const x = space - wh / 2 - LINE_WIDTH / 2;
  const y = HEIGHT - DIST_PER_BAR / 2 - wh / 2;
  return { x, y, wh, xCenter: x + wh / 2, yCenter: y + wh / 2 };
};

const drawSeparators = () => {
  ctx.strokeStyle = pulseSize ? H_LINE_COLOR_BEAT : H_LINE_COLOR;
  ctx.lineWidth = H_LINE_WIDTH;
  for (let y = 0; y < HEIGHT; y += DIST_PER_BAR) {
    ctx.beginPath();
    ctx.moveTo(0, y - H_LINE_WIDTH / 2);
    ctx.lineTo(WIDTH, y - H_LINE_WIDTH / 2);
    ctx.closePath();
    ctx.stroke();
  }

  ctx.strokeStyle = LINE_COLOR;
  ctx.lineWidth = LINE_WIDTH;
  for (let i = 1; i < BOARD_WIDTH; i++) {
    const x = WIDTH / BOARD_WIDTH * i - LINE_WIDTH / 2;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, HEIGHT);
    ctx.closePath();
    ctx.stroke();
  }
};

const drawBars = () => {
  bars.forEach((bar, bi) => {
    bar.forEach((part, i) => {
      if (part === DEAD) return;

      const wh = part
        ? SQUARE_DIM + pulseSize
        : SQUARE_DIM + pulseSize / 4;
      const barOffset = DIST_PER_BAR * bi;
      const color = COLORS[part];
      const space = WIDTH / BOARD_WIDTH * (i + 0.5);
      const x = space - wh / 2 - LINE_WIDTH / 2;
      const y = t / SECONDS_PER_BAR() * DIST_PER_BAR - barOffset - wh / 2;

      if (part !== EMPTY) {
        ctx.shadowBlur = pulseSize + PULSE_SIZE / 2;
        ctx.shadowColor = color;
      }

      ctx.strokeStyle = color;
      ctx.lineWidth = LINE_WIDTH * 2;
      ctx.strokeRect(x, y, wh, wh);

      ctx.shadowBlur = null;
      ctx.shadowColor = null;

      if (y >= HEIGHT - DIST_PER_BAR / 2 - wh) {
        if (bar[i] !== undefined && bar[i] !== DEAD && bar[i] !== EMPTY) {
          if (player.position === i) {
            player.collect(bar[i]);
            bar[i] = DEAD;
          }
          if (player.position != i) {
            player.fail();
            bar[i] = EMPTY;
          }
        }
      }
    });
  });
};

const drawPlayer = () => {
  const { x, y, wh, xCenter, yCenter } = getPlayerRenderInfo();

  if (pulseSize) {
    const mult = bars.length % 2 === 0 ? -1 : 1;
    ctx.save();
    ctx.translate(xCenter, yCenter);
    ctx.rotate(mult * pulseSize / PULSE_SIZE * Math.PI * 2);
    ctx.translate(-xCenter, -yCenter);
  }

  ctx.shadowBlur = pulseSize + PULSE_SIZE;
  ctx.shadowColor = player.color;

  const fColor = new Color(hexToHsl(player.color));
  fColor.a = 0.4;
  ctx.fillStyle = fColor.get();
  ctx.fillRect(x, y, wh, wh);

  const sColor = new Color(hexToHsl(player.color));
  sColor.l += 10;
  ctx.strokeStyle = sColor.get();
  ctx.lineWidth = LINE_WIDTH * 2;
  ctx.strokeRect(x, y, wh, wh);

  ctx.shadowColor = null;
  ctx.shadowBlur = null;

  if (pulseSize) ctx.restore();

  for (let i = 0; i < particles.length; i++) {
    p = particles[i];
    ctx.fillStyle = p.color.get();
    ctx.fillRect(p.x - p.r / 2, p.y - p.r / 2, p.r, p.r);
  }
};

const drawLoop = () => {
  if (finished) return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (beat) {
    beat = false;
    pulseSize = PULSE_SIZE - SQUARE_DIM;
  }

  if (pulseSize > 0) pulseSize -= 1;

  for (let i = particles.length - 1; i >= 0; i--) {
    p = particles[i];
    if (p.dead || p.y >= canvas.height || p.x <= 0 || p.x >= canvas.width) {
      particles.splice(i, 1);
      continue;
    }
    p.update();
  }

  drawSeparators();
  drawBars();
  drawPlayer();

  t = new Tone.Ticks(Tone.Transport.ticks).toSeconds();

  requestAnimationFrame(drawLoop);
}

const start = () => {
  window.addEventListener('keydown', e => {
    if (e.keyCode === 37) player.move(-1);
    if (e.keyCode === 39) player.move(1);
    if (Tone.context.state !== 'running') {
      Tone.context.resume();
    }
  }, false);

  let initialX = null;
  let initialY = null;
  window.addEventListener('touchstart', e => {
    initialX = e.touches[0].clientX;
    initialY = e.touches[0].clientY;
    if (Tone.context.state !== 'running') {
      Tone.context.resume();
    }
  }, false);

  window.addEventListener('touchmove', e => {
    if (initialX === null || initialY === null) return;

    const currentX = e.touches[0].clientX;
    const currentY = e.touches[0].clientY;
    const diffX = initialX - currentX;
    const diffY = initialY - currentY;

    if (Math.abs(diffX) > Math.abs(diffY)) {
      if (diffX > 0) {
        player.move(-1);
      } else {
        player.move(1);
      }
    }

    initialX = null;
    initialY = null;

    e.preventDefault();
  }, false);

  hud = hudInit();

  drawLoop();
};

const gameOver = () => {
  let finished = true;
  musicStop();
  hud.gameOver();
};

const beginBtn = document.getElementById('begin');
const loading = document.getElementById('loading');
const instructions = document.getElementById('instructions');
beginBtn.addEventListener('click', () => {
  beginBtn.style.display = 'none';
  instructions.style.display = 'none';
  loading.style.display = 'block';

  const onBeat = () => {
    addBar();
    triggerBeat();
  };

  let samplesLoaded = 0;
  const onSamplesLoaded = () => {
    samplesLoaded++;
    if (samplesLoaded >= Object.keys(SAMPLES).length) {
      loading.style.display = 'none';
      canvas.style.display = 'block';
      start();
      musicStart();
    }
  };

  musicSetup(onSamplesLoaded, onBeat);

});

