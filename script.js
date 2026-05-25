// ── ここを書き換えると 絵柄を 変えられます ─────────────
// 6 つの絵柄を 2 枚ずつ、 合計 12 枚で 遊びます
const SYMBOLS = ['🍣', '🍕', '🍜', '🍔', '🍩', '🍪'];
// ─────────────────────────────────────────────

const board       = document.getElementById('board');
const movesEl     = document.getElementById('moves');
const timerEl     = document.getElementById('timer');
const matchedEl   = document.getElementById('matched');
const totalEl     = document.getElementById('total');
const resetBtn    = document.getElementById('reset');
const modal       = document.getElementById('clear-modal');
const finalMoves  = document.getElementById('final-moves');
const finalTime   = document.getElementById('final-time');
const playAgain   = document.getElementById('play-again');

let flipped   = [];      // 現在 表向きの 未マッチカード
let moves     = 0;
let matched   = 0;
let startTime = null;
let timerId   = null;
let locked    = false;   // 判定中は クリックを 無効化

// ── 配列を シャッフルする (Fisher-Yates) ──
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ── タイマー表示を 更新 ──
function fmtTime(sec) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

function tick() {
  if (!startTime) return;
  const elapsed = Math.floor((Date.now() - startTime) / 1000);
  timerEl.textContent = fmtTime(elapsed);
}

// ── カードクリック時の 処理 ──
function onCardClick(card) {
  if (locked) return;
  if (card.classList.contains('flipped')) return;
  if (card.classList.contains('matched')) return;

  // 最初の 1 クリックで タイマー開始
  if (!startTime) {
    startTime = Date.now();
    timerId = setInterval(tick, 1000);
  }

  card.classList.add('flipped');
  flipped.push(card);

  if (flipped.length === 2) {
    moves++;
    movesEl.textContent = moves;
    const [a, b] = flipped;
    if (a.dataset.symbol === b.dataset.symbol) {
      // マッチ
      a.classList.add('matched');
      b.classList.add('matched');
      flipped = [];
      matched++;
      matchedEl.textContent = matched;
      if (matched === SYMBOLS.length) {
        endGame();
      }
    } else {
      // 不一致 → 1 秒後に 裏返す
      locked = true;
      setTimeout(() => {
        a.classList.remove('flipped');
        b.classList.remove('flipped');
        flipped = [];
        locked = false;
      }, 1000);
    }
  }
}

// ── ボードの 構築 ──
function buildBoard() {
  board.innerHTML = '';
  const deck = shuffle([...SYMBOLS, ...SYMBOLS]);
  deck.forEach(symbol => {
    const card = document.createElement('div');
    card.className = 'card';
    card.dataset.symbol = symbol;
    card.innerHTML = `
      <div class="card-inner">
        <div class="card-face card-back"></div>
        <div class="card-face card-front">${symbol}</div>
      </div>
    `;
    card.addEventListener('click', () => onCardClick(card));
    board.appendChild(card);
  });
}

// ── ゲーム終了 ──
function endGame() {
  clearInterval(timerId);
  finalMoves.textContent = moves;
  finalTime.textContent = timerEl.textContent;
  setTimeout(() => modal.classList.remove('hidden'), 500);
}

// ── リセット ──
function reset() {
  clearInterval(timerId);
  flipped = [];
  moves = 0;
  matched = 0;
  startTime = null;
  locked = false;
  movesEl.textContent = '0';
  matchedEl.textContent = '0';
  timerEl.textContent = '0:00';
  totalEl.textContent = SYMBOLS.length;
  modal.classList.add('hidden');
  buildBoard();
}

// ── 起動 ──
resetBtn.addEventListener('click', reset);
playAgain.addEventListener('click', reset);
reset();
