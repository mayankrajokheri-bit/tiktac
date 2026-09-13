/**
 * NEON TIC-TAC-TOE — Game Logic, Minimax AI, Level System & Synthesized Audio
 */

(function () {
  'use strict';

  // --- Constants & Config ---
  const WINNING_COMBOS = [
    [0, 1, 2], // Row 1
    [3, 4, 5], // Row 2
    [6, 7, 8], // Row 3
    [0, 3, 6], // Col 1
    [1, 4, 7], // Col 2
    [2, 5, 8], // Col 3
    [0, 4, 8], // Diagonal \
    [2, 4, 6], // Diagonal /
  ];

  // Cyber Rank Tiers
  const RANKS = [
    { level: 1, title: 'Neon Novice', minXp: 0, maxXp: 100 },
    { level: 2, title: 'Grid Runner', minXp: 100, maxXp: 250 },
    { level: 3, title: 'Byte Striker', minXp: 250, maxXp: 450 },
    { level: 4, title: 'Circuit Breaker', minXp: 450, maxXp: 700 },
    { level: 5, title: 'Code Tactician', minXp: 700, maxXp: 1000 },
    { level: 6, title: 'Cyber Phantom', minXp: 1000, maxXp: 1400 },
    { level: 7, title: 'Matrix Sentinel', minXp: 1400, maxXp: 1900 },
    { level: 8, title: 'Quantum Master', minXp: 1900, maxXp: 2500 },
    { level: 9, title: 'Apex Disruptor', minXp: 2500, maxXp: 3200 },
    { level: 10, title: 'Cyber Overlord', minXp: 3200, maxXp: Infinity },
  ];

  // --- Game State ---
  let boardState = Array(9).fill('');
  let currentPlayer = 'X';
  let isGameActive = true;
  let gameMode = 'pvp'; // 'pvp' | 'ai'
  let aiDifficulty = 'hard'; // 'easy' | 'medium' | 'hard'
  let isAiThinking = false;
  let soundEnabled = true;
  let scores = { x: 0, o: 0, ties: 0 };

  // Level & Progression State
  let totalXp = 0;
  let playerLevel = 1;
  let currentStreak = 0;
  let maxStreak = 0;

  // --- DOM Elements ---
  const boardEl = document.getElementById('board');
  const cells = document.querySelectorAll('.cell');
  const turnBadge = document.getElementById('turn-badge');
  const turnAvatar = turnBadge.querySelector('.turn-avatar');
  const turnText = document.getElementById('turn-text');
  const scoreXEl = document.getElementById('score-x');
  const scoreOEl = document.getElementById('score-o');
  const scoreTiesEl = document.getElementById('score-ties');
  const labelPlayerO = document.getElementById('label-player-o');

  const modePvpBtn = document.getElementById('mode-pvp');
  const modeAiBtn = document.getElementById('mode-ai');
  const aiDiffContainer = document.getElementById('ai-difficulty-container');
  const diffChips = document.querySelectorAll('.diff-chip');

  const soundBtn = document.getElementById('sound-btn');
  const soundIcon = document.getElementById('sound-icon');
  const resetScoresBtn = document.getElementById('reset-scores-btn');
  const restartRoundBtn = document.getElementById('restart-round-btn');

  const strikeSvg = document.getElementById('strike-svg');
  const strikeLine = document.getElementById('strike-line');

  const resultModal = document.getElementById('result-modal');
  const modalBadge = document.getElementById('modal-badge');
  const modalSymbol = document.getElementById('modal-symbol');
  const modalTitle = document.getElementById('modal-title');
  const modalSubtitle = document.getElementById('modal-subtitle');
  const modalNextRoundBtn = document.getElementById('modal-next-round-btn');

  // Level HUD Elements
  const levelBadge = document.getElementById('level-badge');
  const rankTitle = document.getElementById('rank-title');
  const xpText = document.getElementById('xp-text');
  const xpBarFill = document.getElementById('xp-bar-fill');
  const streakBadge = document.getElementById('streak-badge');
  const streakCount = document.getElementById('streak-count');

  // Level-Up Modal Elements
  const levelupModal = document.getElementById('levelup-modal');
  const levelupNumber = document.getElementById('levelup-number');
  const levelupTitle = document.getElementById('levelup-title');
  const levelupContinueBtn = document.getElementById('levelup-continue-btn');

  const confettiCanvas = document.getElementById('confetti-canvas');
  const ctx = confettiCanvas.getContext('2d');

  // --- Web Audio API Synthesizer ---
  let audioCtx = null;

  function initAudio() {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        audioCtx = new AudioContextClass();
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  }

  function playTone(freq, type, duration, startTime = 0, gainLevel = 0.15) {
    if (!soundEnabled || !audioCtx) return;
    try {
      const now = audioCtx.currentTime + startTime;
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(gainLevel, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start(now);
      osc.stop(now + duration);
    } catch (e) {
      console.warn('Audio play error:', e);
    }
  }

  const Sound = {
    xMove() {
      initAudio();
      playTone(480, 'triangle', 0.12, 0, 0.18);
      playTone(720, 'sine', 0.15, 0.04, 0.2);
    },
    oMove() {
      initAudio();
      playTone(360, 'sine', 0.14, 0, 0.22);
      playTone(540, 'triangle', 0.16, 0.05, 0.18);
    },
    win() {
      initAudio();
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      notes.forEach((freq, idx) => {
        playTone(freq, 'triangle', 0.35, idx * 0.09, 0.22);
        playTone(freq * 1.5, 'sine', 0.25, idx * 0.09 + 0.02, 0.1);
      });
    },
    draw() {
      initAudio();
      playTone(440, 'sawtooth', 0.18, 0, 0.08);
      playTone(370, 'triangle', 0.25, 0.12, 0.12);
      playTone(311, 'sine', 0.35, 0.24, 0.15);
    },
    click() {
      initAudio();
      playTone(880, 'sine', 0.05, 0, 0.08);
    },
    reset() {
      initAudio();
      playTone(600, 'sine', 0.08, 0, 0.1);
      playTone(900, 'triangle', 0.12, 0.06, 0.12);
    },
    levelup() {
      initAudio();
      const notes = [440, 554.37, 659.25, 880, 1108.73]; // A4, C#5, E5, A5, C#6
      notes.forEach((freq, idx) => {
        playTone(freq, 'triangle', 0.42, idx * 0.1, 0.24);
        playTone(freq * 1.5, 'sine', 0.3, idx * 0.1 + 0.03, 0.12);
      });
    }
  };

  // --- Confetti Particle System ---
  let confettiParticles = [];
  let confettiAnimationId = null;

  function resizeCanvas() {
    confettiCanvas.width = window.innerWidth;
    confettiCanvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();

  function triggerConfetti() {
    confettiParticles = [];
    const colors = ['#00f0ff', '#ff2a85', '#ffbe0b', '#7b2cbf', '#ffffff', '#00ffcc'];
    const particleCount = 75;

    for (let i = 0; i < particleCount; i++) {
      confettiParticles.push({
        x: window.innerWidth / 2 + (Math.random() * 60 - 30),
        y: window.innerHeight * 0.45 + (Math.random() * 60 - 30),
        w: Math.random() * 9 + 5,
        h: Math.random() * 6 + 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        vx: (Math.random() - 0.5) * 17,
        vy: (Math.random() - 0.8) * 19 - 4,
        angle: Math.random() * 360,
        angularVelocity: (Math.random() - 0.5) * 15,
        gravity: 0.38,
        drag: 0.985,
        opacity: 1,
      });
    }

    if (confettiAnimationId) cancelAnimationFrame(confettiAnimationId);
    renderConfetti();
  }

  function renderConfetti() {
    ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
    let activeParticles = 0;

    confettiParticles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += p.gravity;
      p.vx *= p.drag;
      p.vy *= p.drag;
      p.angle += p.angularVelocity;
      p.opacity -= 0.007;

      if (p.opacity > 0 && p.y < confettiCanvas.height) {
        activeParticles++;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.angle * Math.PI) / 180);
        ctx.globalAlpha = Math.max(0, p.opacity);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
      }
    });

    if (activeParticles > 0) {
      confettiAnimationId = requestAnimationFrame(renderConfetti);
    } else {
      ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
    }
  }

  // --- Mark SVGs ---
  function createXMarkSvg() {
    return `
      <svg class="mark-svg mark-x" viewBox="0 0 100 100" aria-label="X">
        <line x1="22" y1="22" x2="78" y2="78" />
        <line x1="78" y1="22" x2="22" y2="78" />
      </svg>
    `;
  }

  function createOMarkSvg() {
    return `
      <svg class="mark-svg mark-o" viewBox="0 0 100 100" aria-label="O">
        <circle cx="50" cy="50" r="28" />
      </svg>
    `;
  }

  // --- Rank & Progression System ---
  function getCurrentRank(xp) {
    for (let i = RANKS.length - 1; i >= 0; i--) {
      if (xp >= RANKS[i].minXp) {
        return RANKS[i];
      }
    }
    return RANKS[0];
  }

  function updateLevelUI() {
    const rank = getCurrentRank(totalXp);
    playerLevel = rank.level;
    levelBadge.textContent = `LVL ${rank.level}`;
    rankTitle.textContent = rank.title;

    if (rank.maxXp === Infinity) {
      xpText.textContent = `${totalXp} XP (MAX)`;
      xpBarFill.style.width = '100%';
    } else {
      const xpInCurrentLevel = totalXp - rank.minXp;
      const xpNeeded = rank.maxXp - rank.minXp;
      const pct = Math.min(100, Math.max(0, (xpInCurrentLevel / xpNeeded) * 100));
      xpText.textContent = `${xpInCurrentLevel} / ${xpNeeded} XP`;
      xpBarFill.style.width = `${pct}%`;
    }

    streakCount.textContent = currentStreak;
    if (currentStreak > 0) {
      streakBadge.classList.add('active-streak');
    } else {
      streakBadge.classList.remove('active-streak');
    }
  }

  function addXp(amount) {
    const oldRank = getCurrentRank(totalXp);
    totalXp += amount;
    saveLevelData();
    updateLevelUI();

    const newRank = getCurrentRank(totalXp);
    if (newRank.level > oldRank.level) {
      setTimeout(() => {
        triggerLevelUpCelebration(newRank);
      }, 700);
    }
  }

  function triggerLevelUpCelebration(rank) {
    levelupNumber.textContent = `LVL ${rank.level}`;
    levelupTitle.textContent = rank.title.toUpperCase();
    levelupModal.classList.remove('hidden');
    Sound.levelup();
    triggerConfetti();
  }

  // --- Local Storage Management ---
  function loadPersistedData() {
    try {
      const savedScores = localStorage.getItem('neon_ttt_scores');
      if (savedScores) scores = JSON.parse(savedScores);

      const savedSound = localStorage.getItem('neon_ttt_sound');
      if (savedSound !== null) soundEnabled = savedSound === 'true';

      const savedMode = localStorage.getItem('neon_ttt_mode');
      if (savedMode) gameMode = savedMode;

      const savedDiff = localStorage.getItem('neon_ttt_diff');
      if (savedDiff) aiDifficulty = savedDiff;

      const savedXp = localStorage.getItem('neon_ttt_xp');
      if (savedXp) totalXp = parseInt(savedXp, 10) || 0;

      const savedStreak = localStorage.getItem('neon_ttt_streak');
      if (savedStreak) currentStreak = parseInt(savedStreak, 10) || 0;

      const savedMaxStreak = localStorage.getItem('neon_ttt_max_streak');
      if (savedMaxStreak) maxStreak = parseInt(savedMaxStreak, 10) || 0;
    } catch (e) {
      console.warn('LocalStorage not accessible', e);
    }
    updateScoreboardUI();
    updateSoundUI();
    updateModeUI();
    updateLevelUI();
  }

  function saveScores() {
    try {
      localStorage.setItem('neon_ttt_scores', JSON.stringify(scores));
    } catch (e) {}
  }

  function saveLevelData() {
    try {
      localStorage.setItem('neon_ttt_xp', totalXp.toString());
      localStorage.setItem('neon_ttt_streak', currentStreak.toString());
      localStorage.setItem('neon_ttt_max_streak', maxStreak.toString());
    } catch (e) {}
  }

  function saveSoundPref() {
    try {
      localStorage.setItem('neon_ttt_sound', soundEnabled.toString());
    } catch (e) {}
  }

  function saveModePref() {
    try {
      localStorage.setItem('neon_ttt_mode', gameMode);
      localStorage.setItem('neon_ttt_diff', aiDifficulty);
    } catch (e) {}
  }

  // --- UI Update Helpers ---
  function updateScoreboardUI() {
    scoreXEl.textContent = scores.x;
    scoreOEl.textContent = scores.o;
    scoreTiesEl.textContent = scores.ties;
  }

  function updateSoundUI() {
    soundIcon.textContent = soundEnabled ? '🔊' : '🔇';
    soundBtn.title = soundEnabled ? 'Sound Enabled' : 'Sound Muted';
    soundBtn.setAttribute('aria-label', soundBtn.title);
  }

  function updateModeUI() {
    if (gameMode === 'pvp') {
      modePvpBtn.classList.add('active');
      modePvpBtn.setAttribute('aria-checked', 'true');
      modeAiBtn.classList.remove('active');
      modeAiBtn.setAttribute('aria-checked', 'false');
      aiDiffContainer.classList.add('hidden');
      labelPlayerO.textContent = 'PLAYER O';
    } else {
      modeAiBtn.classList.add('active');
      modeAiBtn.setAttribute('aria-checked', 'true');
      modePvpBtn.classList.remove('active');
      modePvpBtn.setAttribute('aria-checked', 'false');
      aiDiffContainer.classList.remove('hidden');
      labelPlayerO.textContent = 'AI BOT';
    }

    diffChips.forEach(chip => {
      const isSelected = chip.dataset.diff === aiDifficulty;
      chip.classList.toggle('active', isSelected);
      chip.setAttribute('aria-checked', isSelected ? 'true' : 'false');
    });
  }

  function updateTurnBadge() {
    turnBadge.classList.remove('turn-x', 'turn-o');
    if (currentPlayer === 'X') {
      turnBadge.classList.add('turn-x');
      turnAvatar.textContent = '✕';
      turnAvatar.className = 'turn-avatar x-avatar';
      turnText.textContent = gameMode === 'ai' ? 'Your Turn (X)' : "Player X's Turn";
    } else {
      turnBadge.classList.add('turn-o');
      turnAvatar.textContent = '○';
      turnAvatar.className = 'turn-avatar o-avatar';
      turnText.textContent = gameMode === 'ai' ? 'AI Thinking...' : "Player O's Turn";
    }
  }

  // --- Winning Line Geometry ---
  function drawWinningLine(combo, winner) {
    const wrapper = document.querySelector('.board-wrapper');
    const wrapperRect = wrapper.getBoundingClientRect();
    const cellA = cells[combo[0]].getBoundingClientRect();
    const cellC = cells[combo[2]].getBoundingClientRect();

    const x1 = cellA.left + cellA.width / 2 - wrapperRect.left;
    const y1 = cellA.top + cellA.height / 2 - wrapperRect.top;
    const x2 = cellC.left + cellC.width / 2 - wrapperRect.left;
    const y2 = cellC.top + cellC.height / 2 - wrapperRect.top;

    // Extend line slightly past centers for aesthetic fullness
    const dx = x2 - x1;
    const dy = y2 - y1;
    const length = Math.sqrt(dx * dx + dy * dy);
    const extend = 16;
    const ex1 = x1 - (dx / length) * extend;
    const ey1 = y1 - (dy / length) * extend;
    const ex2 = x2 + (dx / length) * extend;
    const ey2 = y2 + (dy / length) * extend;

    strikeSvg.setAttribute('viewBox', `0 0 ${wrapperRect.width} ${wrapperRect.height}`);
    strikeLine.setAttribute('x1', ex1);
    strikeLine.setAttribute('y1', ey1);
    strikeLine.setAttribute('x2', ex2);
    strikeLine.setAttribute('y2', ey2);

    strikeLine.className = 'strike-line ' + (winner === 'X' ? 'strike-x' : 'strike-o');
    strikeSvg.classList.add('active');

    combo.forEach(idx => {
      cells[idx].classList.add('winning-cell', winner === 'X' ? 'win-x' : 'win-o');
    });
  }

  function clearWinningLine() {
    strikeSvg.classList.remove('active');
    cells.forEach(c => c.classList.remove('winning-cell', 'win-x', 'win-o'));
  }

  // --- Modal Notification ---
  function showResultModal(type, winner, bonusInfo = '') {
    resultModal.classList.remove('hidden');

    if (type === 'win') {
      const isAi = gameMode === 'ai';
      modalBadge.textContent = '🎉 ROUND VICTORY';
      modalSymbol.className = 'modal-symbol ' + (winner === 'X' ? 'symbol-x' : 'symbol-o');
      modalSymbol.textContent = winner === 'X' ? '✕' : '○';

      if (isAi) {
        if (winner === 'X') {
          modalTitle.textContent = 'YOU BEAT THE AI!';
          modalSubtitle.textContent = bonusInfo || 'Masterful strategy! Can you do it again?';
        } else {
          modalTitle.textContent = 'AI CLAIMS VICTORY!';
          modalSubtitle.textContent = bonusInfo || 'The algorithm strikes. Time for a rematch!';
        }
      } else {
        modalTitle.textContent = `PLAYER ${winner} WINS!`;
        modalSubtitle.textContent = bonusInfo || 'Magnificent game! Ready for another battle?';
      }
    } else {
      modalBadge.textContent = '⚔️ STALEMATE';
      modalSymbol.className = 'modal-symbol symbol-draw';
      modalSymbol.textContent = '🤝';
      modalTitle.textContent = "IT'S A DRAW!";
      modalSubtitle.textContent = bonusInfo || 'Evenly matched intellects. Settle the score!';
    }
  }

  function hideResultModal() {
    resultModal.classList.add('hidden');
  }

  // --- Move & Win Check ---
  function checkWinner(state) {
    for (const combo of WINNING_COMBOS) {
      const [a, b, c] = combo;
      if (state[a] && state[a] === state[b] && state[a] === state[c]) {
        return { winner: state[a], combo };
      }
    }
    if (state.every(cell => cell !== '')) {
      return { winner: 'tie', combo: null };
    }
    return null;
  }

  function handleCellClick(e) {
    const cell = e.currentTarget;
    const index = parseInt(cell.dataset.index, 10);

    if (!isGameActive || boardState[index] !== '' || isAiThinking) {
      return;
    }

    makeMove(index, currentPlayer);
  }

  function makeMove(index, player) {
    boardState[index] = player;
    const cell = cells[index];
    cell.classList.add('taken');
    cell.innerHTML = player === 'X' ? createXMarkSvg() : createOMarkSvg();

    if (player === 'X') {
      Sound.xMove();
    } else {
      Sound.oMove();
    }

    const result = checkWinner(boardState);

    if (result) {
      handleGameOver(result);
    } else {
      currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
      updateTurnBadge();

      if (gameMode === 'ai' && currentPlayer === 'O') {
        runAiTurn();
      }
    }
  }

  function handleGameOver(result) {
    isGameActive = false;

    if (result.winner === 'tie') {
      scores.ties++;
      saveScores();
      updateScoreboardUI();
      addXp(15);
      Sound.draw();
      setTimeout(() => showResultModal('tie', null, '+15 XP earned from stalemate'), 400);
    } else {
      const isX = result.winner === 'X';
      if (isX) scores.x++;
      else scores.o++;

      saveScores();
      updateScoreboardUI();
      drawWinningLine(result.combo, result.winner);
      Sound.win();
      triggerConfetti();

      // XP & Streak Calculation
      let earnedXp = 0;
      let infoText = '';

      if (gameMode === 'ai') {
        if (isX) {
          // Player won vs AI
          currentStreak++;
          maxStreak = Math.max(maxStreak, currentStreak);
          const baseDiffXp = aiDifficulty === 'easy' ? 35 : (aiDifficulty === 'medium' ? 65 : 100);
          const streakBonus = (currentStreak - 1) * 15;
          earnedXp = baseDiffXp + streakBonus;
          infoText = `+${earnedXp} XP earned! (${currentStreak} Win Streak 🔥)`;
        } else {
          // AI won against Player
          currentStreak = 0;
          earnedXp = 10;
          infoText = `Streak ended. +10 consolation XP earned.`;
        }
      } else {
        // Pass & Play mode
        currentStreak++;
        maxStreak = Math.max(maxStreak, currentStreak);
        earnedXp = 40 + (currentStreak - 1) * 10;
        infoText = `+${earnedXp} XP earned! (${currentStreak} Win Streak 🔥)`;
      }

      addXp(earnedXp);
      setTimeout(() => showResultModal('win', result.winner, infoText), 650);
    }
  }

  // --- AI Algorithms ---
  function getEmptyIndices(state) {
    const indices = [];
    state.forEach((val, idx) => {
      if (val === '') indices.push(idx);
    });
    return indices;
  }

  function runAiTurn() {
    isAiThinking = true;
    updateTurnBadge();

    // Natural human-like reaction latency (280ms - 420ms)
    const delay = Math.random() * 140 + 280;

    setTimeout(() => {
      if (!isGameActive) {
        isAiThinking = false;
        return;
      }

      let chosenIndex;
      if (aiDifficulty === 'easy') {
        chosenIndex = getEasyAiMove(boardState);
      } else if (aiDifficulty === 'medium') {
        chosenIndex = getMediumAiMove(boardState);
      } else {
        chosenIndex = getBestMinimaxMove(boardState);
      }

      isAiThinking = false;
      if (chosenIndex !== undefined && chosenIndex !== null) {
        makeMove(chosenIndex, 'O');
      }
    }, delay);
  }

  // Easy AI: Pure random empty cell
  function getEasyAiMove(state) {
    const empties = getEmptyIndices(state);
    if (empties.length === 0) return null;
    return empties[Math.floor(Math.random() * empties.length)];
  }

  // Medium AI: Tactical (wins if possible, blocks opponent, otherwise strategic/random)
  function getMediumAiMove(state) {
    const empties = getEmptyIndices(state);

    // 1. Can AI win right now?
    for (const idx of empties) {
      const copy = [...state];
      copy[idx] = 'O';
      if (checkWinner(copy)?.winner === 'O') return idx;
    }

    // 2. Can Player X win right now? (85% chance to block)
    if (Math.random() < 0.85) {
      for (const idx of empties) {
        const copy = [...state];
        copy[idx] = 'X';
        if (checkWinner(copy)?.winner === 'X') return idx;
      }
    }

    // 3. Take Center if available
    if (state[4] === '' && Math.random() < 0.65) return 4;

    // 4. Random fallback
    return empties[Math.floor(Math.random() * empties.length)];
  }

  // Unbeatable Minimax AI
  function getBestMinimaxMove(state) {
    const empties = getEmptyIndices(state);
    if (empties.length === 9) {
      const openings = [0, 2, 4, 6, 8];
      return openings[Math.floor(Math.random() * openings.length)];
    }

    let bestScore = -Infinity;
    let bestMove = empties[0];

    for (const idx of empties) {
      state[idx] = 'O';
      const score = minimax(state, 0, false, -Infinity, Infinity);
      state[idx] = '';
      if (score > bestScore) {
        bestScore = score;
        bestMove = idx;
      }
    }

    return bestMove;
  }

  function minimax(state, depth, isMaximizing, alpha, beta) {
    const terminal = checkWinner(state);
    if (terminal) {
      if (terminal.winner === 'O') return 10 - depth;
      if (terminal.winner === 'X') return depth - 10;
      return 0; // tie
    }

    const empties = getEmptyIndices(state);

    if (isMaximizing) {
      let maxEval = -Infinity;
      for (const idx of empties) {
        state[idx] = 'O';
        const evaluation = minimax(state, depth + 1, false, alpha, beta);
        state[idx] = '';
        maxEval = Math.max(maxEval, evaluation);
        alpha = Math.max(alpha, evaluation);
        if (beta <= alpha) break;
      }
      return maxEval;
    } else {
      let minEval = Infinity;
      for (const idx of empties) {
        state[idx] = 'X';
        const evaluation = minimax(state, depth + 1, true, alpha, beta);
        state[idx] = '';
        minEval = Math.min(minEval, evaluation);
        beta = Math.min(beta, evaluation);
        if (beta <= alpha) break;
      }
      return minEval;
    }
  }

  // --- Round & Match Reset ---
  function resetRound(silent = false) {
    boardState = Array(9).fill('');
    currentPlayer = 'X';
    isGameActive = true;
    isAiThinking = false;

    cells.forEach(cell => {
      cell.classList.remove('taken');
      cell.innerHTML = '';
    });

    clearWinningLine();
    hideResultModal();
    updateTurnBadge();

    if (!silent) Sound.reset();
  }

  function resetAllScores() {
    scores = { x: 0, o: 0, ties: 0 };
    currentStreak = 0;
    saveScores();
    saveLevelData();
    updateScoreboardUI();
    updateLevelUI();
    resetRound(false);
  }

  // --- Event Listeners Setup ---
  function setupEventListeners() {
    cells.forEach(cell => {
      cell.addEventListener('click', handleCellClick);
    });

    restartRoundBtn.addEventListener('click', () => resetRound(false));
    modalNextRoundBtn.addEventListener('click', () => resetRound(false));

    levelupContinueBtn.addEventListener('click', () => {
      levelupModal.classList.add('hidden');
      Sound.click();
    });

    levelupModal.addEventListener('click', e => {
      if (e.target === levelupModal) {
        levelupModal.classList.add('hidden');
      }
    });

    resetScoresBtn.addEventListener('click', () => {
      Sound.click();
      resetAllScores();
    });

    soundBtn.addEventListener('click', () => {
      soundEnabled = !soundEnabled;
      saveSoundPref();
      updateSoundUI();
      if (soundEnabled) Sound.click();
    });

    modePvpBtn.addEventListener('click', () => {
      if (gameMode !== 'pvp') {
        gameMode = 'pvp';
        saveModePref();
        updateModeUI();
        Sound.click();
        resetRound(true);
      }
    });

    modeAiBtn.addEventListener('click', () => {
      if (gameMode !== 'ai') {
        gameMode = 'ai';
        saveModePref();
        updateModeUI();
        Sound.click();
        resetRound(true);
      }
    });

    diffChips.forEach(chip => {
      chip.addEventListener('click', e => {
        aiDifficulty = e.currentTarget.dataset.diff;
        saveModePref();
        updateModeUI();
        Sound.click();
        resetRound(true);
      });
    });

    // Close result modal on backdrop click outside card
    resultModal.addEventListener('click', e => {
      if (e.target === resultModal) {
        resetRound(false);
      }
    });

    // Re-render winning line if window resized during active win
    window.addEventListener('resize', () => {
      if (!isGameActive) {
        const result = checkWinner(boardState);
        if (result && result.combo) {
          drawWinningLine(result.combo, result.winner);
        }
      }
    });
  }

  // --- Initialization ---
  function init() {
    loadPersistedData();
    setupEventListeners();
    updateTurnBadge();
  }

  init();
})();
