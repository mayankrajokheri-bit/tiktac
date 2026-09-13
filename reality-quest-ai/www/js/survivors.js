/**
 * 10 SURVIVORS OF GMN COLLEGE (THE APOCALYPSE)
 * Core Roster, Engineering Specialties, Perks & Sprite Data
 */

const SURVIVORS_ROSTER = [
  {
    id: 'aarav',
    name: 'Aarav',
    major: 'Robotics & AI Eng',
    title: 'Lead Scout & Tactician',
    icon: '🤖',
    perk: '+20% Sprint Speed & Radar Scanner',
    avatarClass: 'avatar-aarav',
    spriteClass: 'char-aarav',
    role: 'Team Leader',
    bio: 'Equipped with a bionic exoskeleton arm and holographic drone scanner. Strategic thinker who leads the GMN College expedition.',
    status: 'ACTIVE'
  },
  {
    id: 'alex',
    name: 'Alex',
    major: 'Mechanical Eng',
    title: 'Vanguard Breaker',
    icon: '⚙️',
    perk: '+30% Melee Impact & Heavy Armor',
    avatarClass: 'avatar-alex',
    spriteClass: 'char-alex',
    role: 'Vanguard',
    bio: 'Seasoned machinist with welding visor and custom gear-polearm. Excels at breaking barricades and parrying heavy strikes.',
    status: 'ACTIVE'
  },
  {
    id: 'ben',
    name: 'Ben',
    major: 'Electrical Eng',
    title: 'High-Voltage Specialist',
    icon: '⚡',
    perk: 'Fast Circuit Decryption & Stun Resistance',
    avatarClass: 'avatar-ben',
    spriteClass: 'char-ben',
    role: 'Systems Specialist',
    bio: 'Miner headlamp, exposed motherboard chest-rig, and frequency scanner. Master of breakers, currents, and lighting systems.',
    status: 'ACTIVE'
  },
  {
    id: 'chloe',
    name: 'Chloe',
    major: 'Civil Eng',
    title: 'Structural Architect',
    icon: '🏗️',
    perk: '+25% Trap Evasion & Quick Rigging',
    avatarClass: 'avatar-chloe',
    spriteClass: 'char-chloe',
    role: 'Architect',
    bio: 'White hardhat, reflective safety jacket, and climbing ropes. Analyzes structural weaknesses and disables occult collapse traps.',
    status: 'ACTIVE'
  },
  {
    id: 'dev',
    name: 'Dev',
    major: 'Computer Science',
    title: 'Cyber Specialist (Occult Pact)',
    icon: '💻',
    perk: 'Instant Terminal Decryption (Hidden Traitor)',
    avatarClass: 'avatar-dev',
    spriteClass: 'char-dev',
    role: 'Hacker',
    bio: 'Tactical programmer with dual wrist tablets. Smart, quiet... secretly made a demonic pact with Stella inside Level 6.',
    status: 'SUSPICIOUS'
  },
  {
    id: 'esha',
    name: 'Esha',
    major: 'Biotechnology',
    title: 'Field Medic & Pathologist',
    icon: '🧬',
    perk: 'Passive Health Regen (+5 HP/10s)',
    avatarClass: 'avatar-esha',
    spriteClass: 'char-esha',
    role: 'Medic',
    bio: 'Stained lab coat, medical bag, and pathogen scanners. Analyzes biological curses and provides squad first-aid.',
    status: 'ACTIVE'
  },
  {
    id: 'felix',
    name: 'Felix',
    major: 'Chemical Eng',
    title: 'Demolitions & Hazmat',
    icon: '🧪',
    perk: 'Immunity to Toxic Gas & Acid Flasks',
    avatarClass: 'avatar-felix',
    spriteClass: 'char-felix',
    role: 'Demolitions',
    bio: 'Heavy industrial hazmat suit and gas mask. Wields pressurized corrosive flasks to dissolve locks and ward off horrors.',
    status: 'ACTIVE'
  },
  {
    id: 'grace',
    name: 'Grace',
    major: 'Software Eng',
    title: 'Tactical Infiltrator',
    icon: '📡',
    perk: 'Silent Footsteps & Cryptic Puzzle Insight',
    avatarClass: 'avatar-grace',
    spriteClass: 'char-grace',
    role: 'Infiltrator',
    bio: 'Tactical beanie, encrypted comms headset, and military harness. Quick on her feet with combat knives and decryption tools.',
    status: 'ACTIVE'
  },
  {
    id: 'henry',
    name: 'Henry',
    major: 'Information Tech',
    title: 'Hardware & Infrastructure Specialist',
    icon: '🔧',
    perk: '+15% Max Health & Torque Grip',
    avatarClass: 'avatar-henry',
    spriteClass: 'char-henry',
    role: 'Support',
    bio: 'Red flannel, data slate, cable spools, and heavy pipe wrench. Keeps generator networks alive in critical blackout scenarios.',
    status: 'ACTIVE'
  },
  {
    id: 'tara',
    name: 'Tara',
    major: 'Aerospace & Telecom',
    title: 'Comms Navigator & Scout',
    icon: '🚀',
    perk: 'Emergency Flare & Full Map Radar',
    avatarClass: 'avatar-tara',
    spriteClass: 'char-tara',
    role: 'Navigator',
    bio: 'Flight jacket, satellite dish backpack, and scanner goggles. Establishes long-range comms and launches distress flares.',
    status: 'ACTIVE'
  }
];

// Helper Functions
function getSurvivorById(id) {
  return SURVIVORS_ROSTER.find(s => s.id === id) || SURVIVORS_ROSTER[0];
}

function getCurrentPlayerSurvivor() {
  const savedId = localStorage.getItem('survivorCharId') || 'aarav';
  return getSurvivorById(savedId);
}

function setCurrentPlayerSurvivor(id) {
  const surv = getSurvivorById(id);
  localStorage.setItem('survivorCharId', surv.id);
  localStorage.setItem('survivorName', surv.name);
  localStorage.setItem('survivorMajor', surv.major);
  localStorage.setItem('survivorPerk', surv.perk);
  localStorage.setItem('survivorAvatarClass', surv.avatarClass);
  return surv;
}

// Render Survivor Selection Grid (for index.html player form)
// Render Survivor Selection Grid (for index.html player form)
function renderSurvivorSelectionGrid(containerId, onSelectCallback) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const currentId = localStorage.getItem('survivorCharId') || 'aarav';
  const currentSurvivor = getSurvivorById(currentId);

  let html = `
    <div class="survivors-selection-container">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
        <span style="font-family:var(--font-ui); font-size:11px; font-weight:700; color:#f1c40f; letter-spacing:1.5px;">
          SELECT YOUR ENGINEERING SPECIALIST (10 SURVIVORS):
        </span>
        <span style="font-size:10px; color:#a4b0be;" id="survivor-selected-badge">
          CURRENT: <strong>${currentSurvivor.name.toUpperCase()}</strong>
        </span>
      </div>
      <div class="survivors-grid">
  `;

  SURVIVORS_ROSTER.forEach(s => {
    const isSel = s.id === currentId ? 'selected' : '';
    html += `
      <div class="survivor-card ${isSel}" id="card-surv-${s.id}" onclick="selectSurvivorCard('${s.id}')">
        <div class="survivor-avatar ${s.avatarClass}"></div>
        <div class="card-name">${s.name}</div>
        <div class="card-major">${s.major}</div>
        <div class="card-perk">${s.perk}</div>
      </div>
    `;
  });

  html += `
      </div>

      <!-- Live Survivor Spotlight & Quick Confirm -->
      <div class="survivor-spotlight-confirm" id="survivor-spotlight-box">
        <div class="spotlight-left">
          <div class="survivor-avatar ${currentSurvivor.avatarClass}" id="spotlight-avatar"></div>
        </div>
        <div class="spotlight-details">
          <div class="spotlight-name-row">
            <span class="spotlight-name" id="spotlight-name">${currentSurvivor.name}</span>
            <span class="spotlight-major" id="spotlight-major">${currentSurvivor.major}</span>
            <span class="spotlight-role-tag" id="spotlight-role">${currentSurvivor.role}</span>
          </div>
          <div class="spotlight-perk" id="spotlight-perk">⚡ ${currentSurvivor.perk}</div>
          <div class="spotlight-bio" id="spotlight-bio">${currentSurvivor.bio}</div>
        </div>
        <button type="button" class="btn-spotlight-confirm" id="btn-spotlight-confirm" onclick="triggerConfirmCharacterModal()">
          ✅ CONFIRM <span id="spotlight-btn-name">${currentSurvivor.name.toUpperCase()}</span> & START LEVELS 1-7 ➔
        </button>
      </div>

    </div>
  `;

  container.innerHTML = html;

  window.selectSurvivorCard = function(id) {
    document.querySelectorAll('.survivor-card').forEach(c => c.classList.remove('selected'));
    const card = document.getElementById(`card-surv-${id}`);
    if (card) card.classList.add('selected');

    const surv = setCurrentPlayerSurvivor(id);
    const badge = document.getElementById('survivor-selected-badge');
    if (badge) badge.innerHTML = `CURRENT: <strong>${surv.name.toUpperCase()}</strong>`;

    // Update Spotlight box
    const spotAvatar = document.getElementById('spotlight-avatar');
    if (spotAvatar) spotAvatar.className = `survivor-avatar ${surv.avatarClass}`;
    const spotName = document.getElementById('spotlight-name');
    if (spotName) spotName.textContent = surv.name;
    const spotMajor = document.getElementById('spotlight-major');
    if (spotMajor) spotMajor.textContent = surv.major;
    const spotRole = document.getElementById('spotlight-role');
    if (spotRole) spotRole.textContent = surv.role;
    const spotPerk = document.getElementById('spotlight-perk');
    if (spotPerk) spotPerk.textContent = `⚡ ${surv.perk}`;
    const spotBio = document.getElementById('spotlight-bio');
    if (spotBio) spotBio.textContent = surv.bio;
    const spotBtnName = document.getElementById('spotlight-btn-name');
    if (spotBtnName) spotBtnName.textContent = surv.name.toUpperCase();

    // Auto-fill codename input if present
    const nameInput = document.getElementById('input-survivor-name');
    if (nameInput) nameInput.value = surv.name.toUpperCase();

    if (typeof HorrorAudio !== 'undefined' && HorrorAudio.playRadarPing) {
      HorrorAudio.playRadarPing();
    }

    if (typeof onSelectCallback === 'function') {
      onSelectCallback(surv);
    }
  };
}

// Trigger Confirm Character Modal
function triggerConfirmCharacterModal(charId) {
  const id = charId || localStorage.getItem('survivorCharId') || 'aarav';
  openConfirmCharacterModal(id);
}

// Open Dedicated Character Confirmation Modal
function openConfirmCharacterModal(charId) {
  const surv = getSurvivorById(charId || localStorage.getItem('survivorCharId') || 'aarav');
  let modal = document.getElementById('modal-confirm-character');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'modal-confirm-character';
    modal.className = 'confirm-modal-overlay';
    document.body.appendChild(modal);
  }

  const ageVal = (document.getElementById('input-survivor-age') && document.getElementById('input-survivor-age').value) || localStorage.getItem('survivorAge') || '18';
  const nameVal = (document.getElementById('input-survivor-name') && document.getElementById('input-survivor-name').value.trim()) || surv.name.toUpperCase();

  modal.innerHTML = `
    <div class="confirm-modal-box">
      <div class="confirm-badge-top">⚔️ CONFIRM YOUR OPERATIVE ⚔️</div>
      <div class="confirm-char-avatar ${surv.avatarClass}"></div>
      <h2 class="confirm-char-name">${surv.name}</h2>
      <div class="confirm-char-branch">${surv.major} • ${surv.role.toUpperCase()}</div>

      <div class="confirm-char-stats">
        <div class="confirm-stat-row">
          <span class="confirm-stat-label">OPERATIVE CODENAME:</span>
          <span class="confirm-stat-value" style="color:#00ff9d;">${nameVal}</span>
        </div>
        <div class="confirm-stat-row">
          <span class="confirm-stat-label">OPERATIVE AGE:</span>
          <span class="confirm-stat-value">${ageVal} YEARS OLD</span>
        </div>
        <div class="confirm-stat-row">
          <span class="confirm-stat-label">ENGINEERING BRANCH:</span>
          <span class="confirm-stat-value" style="color:#f1c40f;">${surv.major}</span>
        </div>
        <div class="confirm-stat-row">
          <span class="confirm-stat-label">TACTICAL COMBAT CLASS:</span>
          <span class="confirm-stat-value" style="color:#00cec9;">${surv.role}</span>
        </div>
        <div class="confirm-stat-row">
          <span class="confirm-stat-label">UNIQUE SURVIVAL PERK:</span>
          <span class="confirm-stat-value" style="color:#e056fd;">${surv.perk}</span>
        </div>
      </div>

      <p style="font-size:11px; color:#cbd5e1; line-height:1.4; margin:10px 0 16px 0; font-style:italic;">
        “${surv.bio}”
      </p>

      <div class="confirm-actions-row">
        <button type="button" class="btn-confirm-cancel" onclick="closeConfirmCharacterModal()">
          🔄 CHANGE
        </button>
        <button type="button" class="btn-confirm-final" onclick="finalizeSurvivorConfirmation('${surv.id}')">
          ✅ CONFIRM & START LEVELS 1-7 ➔
        </button>
      </div>
    </div>
  `;

  modal.classList.add('active');

  if (typeof HorrorAudio !== 'undefined' && HorrorAudio.playRadarPing) {
    HorrorAudio.playRadarPing();
  }
}

function closeConfirmCharacterModal() {
  const modal = document.getElementById('modal-confirm-character');
  if (modal) modal.classList.remove('active');
}

// Finalize Confirmation and start Levels 1 to 7 Hub
function finalizeSurvivorConfirmation(charId) {
  const surv = setCurrentPlayerSurvivor(charId || localStorage.getItem('survivorCharId') || 'aarav');
  
  const inpName = document.getElementById('input-survivor-name');
  if (inpName && inpName.value.trim()) {
    localStorage.setItem('survivorName', inpName.value.trim().toUpperCase());
  } else {
    localStorage.setItem('survivorName', surv.name.toUpperCase());
  }

  const inpAge = document.getElementById('input-survivor-age');
  if (inpAge && inpAge.value.trim()) {
    localStorage.setItem('survivorAge', inpAge.value.trim());
  }

  localStorage.setItem('survivorRole', surv.role);

  closeConfirmCharacterModal();

  if (typeof HorrorAudio !== 'undefined') {
    if (HorrorAudio.playStinger) HorrorAudio.playStinger();
    if (HorrorAudio.playSlam) HorrorAudio.playSlam();
  }

  if (typeof updateHubSurvivorBanner === 'function') {
    updateHubSurvivorBanner();
  }

  if (typeof openLevelsHub === 'function') {
    openLevelsHub();
  } else {
    const hub = document.getElementById('scene-levels-hub');
    if (hub) {
      document.querySelectorAll('.scene-view').forEach(s => s.classList.remove('active'));
      hub.classList.add('active');
    }
  }
}

// Render Squad Roster Modal (for Levels Hub)
function openSquadRosterModal() {
  let modal = document.getElementById('modal-squad-roster');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'modal-squad-roster';
    modal.className = 'squad-modal-overlay';
    document.body.appendChild(modal);
  }

  const currentId = localStorage.getItem('survivorCharId') || 'aarav';

  let listHtml = '';
  SURVIVORS_ROSTER.forEach(s => {
    const isPlayer = s.id === currentId ? '<span style="color:#00ff9d; font-weight:700;">(YOU)</span>' : '';
    const statusColor = s.status === 'ACTIVE' ? '#2ed573' : (s.status === 'SUSPICIOUS' ? '#ff4757' : '#aaa');
    listHtml += `
      <div class="squad-member-row">
        <div class="survivor-avatar ${s.avatarClass}"></div>
        <div style="flex:1; text-align:left;">
          <div style="font-family:var(--font-title); font-size:1.15rem; color:#fff;">
            ${s.name} ${isPlayer}
            <span style="font-size:9px; color:${statusColor}; float:right; border:1px solid ${statusColor}; padding:1px 6px; border-radius:10px;">${s.status}</span>
          </div>
          <div style="font-size:10px; color:#f1c40f; font-weight:700;">${s.major} — ${s.role}</div>
          <div style="font-size:9.5px; color:#cbd5e1; line-height:1.3; margin-top:2px;">${s.bio}</div>
          <div style="font-size:9px; color:#00cec9; margin-top:2px;">⚡ Perk: ${s.perk}</div>
        </div>
      </div>
    `;
  });

  modal.innerHTML = `
    <div class="squad-modal-box">
      <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1.5px solid rgba(255,255,255,0.1); padding-bottom:12px; margin-bottom:14px;">
        <div>
          <h2 style="font-family:var(--font-horror); font-size:2.2rem; color:#00ff9d; letter-spacing:2px; line-height:1;">
            GMN COLLEGE SQUAD ROSTER
          </h2>
          <div style="font-size:11px; color:#f1c40f; letter-spacing:1px; margin-top:3px;">
            10 ENGINEERING SURVIVORS • SQUAD STATUS
          </div>
        </div>
        <button onclick="closeSquadRosterModal()" style="background:none; border:1px solid rgba(255,255,255,0.3); color:#fff; width:34px; height:34px; border-radius:50%; font-size:16px; cursor:pointer;">✕</button>
      </div>
      <div class="squad-list-grid">
        ${listHtml}
      </div>
      <div style="text-align:center; margin-top:16px;">
        <button class="action-btn-main" onclick="closeSquadRosterModal()" style="padding:8px 30px; font-size:1.1rem;">CLOSE ROSTER</button>
      </div>
    </div>
  `;

  modal.classList.add('active');
}

function closeSquadRosterModal() {
  const modal = document.getElementById('modal-squad-roster');
  if (modal) modal.classList.remove('active');
}

// Render Authentic In-Game Survivor Sprite Model (For Level 1 to 7 player representation)
function renderInGameSurvivorSprite(containerId, options = {}) {
  const container = typeof containerId === 'string' ? document.getElementById(containerId) : containerId;
  if (!container) return;

  const surv = getCurrentPlayerSurvivor();
  const name = (localStorage.getItem('survivorName') || surv.name).toUpperCase();

  container.innerHTML = `
    <div class="in-game-survivor-model" id="in-game-model-${surv.id}">
      <div class="player-hud-tag" style="font-size:10px; font-weight:800; letter-spacing:1px; white-space:nowrap; margin-bottom:2px; background:rgba(0,0,0,0.75); padding:1px 6px; border-radius:4px; border:1px solid #00ff9d; color:#fff;">
        ${name} (${surv.major})
      </div>
      <div class="survivor-sprite-body ${surv.spriteClass}" style="width:48px; height:74px;"></div>
      <div class="player-aura-ring"></div>
      ${options.includeShield ? '<div class="guardian-shield-bubble" id="player-shield-bubble"></div>' : ''}
    </div>
  `;
}

// Export to window
window.SURVIVORS_ROSTER = SURVIVORS_ROSTER;
window.getSurvivorById = getSurvivorById;
window.getCurrentPlayerSurvivor = getCurrentPlayerSurvivor;
window.setCurrentPlayerSurvivor = setCurrentPlayerSurvivor;
window.renderSurvivorSelectionGrid = renderSurvivorSelectionGrid;
window.triggerConfirmCharacterModal = triggerConfirmCharacterModal;
window.openConfirmCharacterModal = openConfirmCharacterModal;
window.closeConfirmCharacterModal = closeConfirmCharacterModal;
window.finalizeSurvivorConfirmation = finalizeSurvivorConfirmation;
window.openSquadRosterModal = openSquadRosterModal;
window.closeSquadRosterModal = closeSquadRosterModal;
window.renderInGameSurvivorSprite = renderInGameSurvivorSprite;


