/**
 * Reality Quest AI - Interactive GPS & Cyber Map Engine
 * Specialized for AMBALA CANTT with Dual Views:
 * 1. Illustrated 3D Tactical Map (with interactive hotspot nodes)
 * 2. Live GPS Satellite/Cyberpunk Leaflet Radar Map
 */

class MapEngine {
  constructor() {
    this.map = null;
    this.playerMarker = null;
    this.radarCircle = null;
    this.spawnMarkers = [];
    this.activeMapView = "illustrated"; // "illustrated" or "gps"
    
    // Ambala Cantt Coordinates
    this.currentCoords = { lat: 30.3344, lng: 76.8407 };
    this.currentLocationName = "Ambala Cantt (Cantt Market)";
    this.currentWeather = "Clear Sky • 32°C";

    // Ambala Cantt Canonical POI Landmarks
    this.ambalaPOIs = [
      {
        id: "poi_cantt_market",
        name: "Cantt Market",
        tag: "YOUR LOCATION",
        category: "Shop / Market",
        icon: "🛒",
        type: "player_home",
        color: "#00f0ff",
        targetHint: "red signboard",
        desc: "High-activity bazaar in Ambala Cantt. Current player base.",
        questNotice: "Active Quest: Find the Red Signboard near Cantt Market and scan it.",
        coords: { lat: 30.3344, lng: 76.8407 },
        imgX: 46.5,
        imgY: 46.0
      },
      {
        id: "poi_railway_station",
        name: "Ambala Cantt Railway Station",
        tag: "Major Transit Hub",
        category: "Train Station",
        icon: "🚆",
        type: "transit",
        color: "#38bdf8",
        targetHint: "laptop",
        desc: "Major junction of Northern Railway. Infused with cyber terminal relays.",
        rewardDesc: "+250 XP & Cyber Core",
        coords: { lat: 30.3328, lng: 76.8360 },
        imgX: 41.2,
        imgY: 28.5
      },
      {
        id: "poi_defence_colony",
        name: "Defence Colony",
        tag: "QUEST LOCATION",
        category: "Quest Node",
        icon: "❗",
        type: "quest",
        color: "#ffb703",
        targetHint: "tree",
        desc: "Residential sector. Active quest to scan living trees for Sylvan Wood.",
        rewardDesc: "+150 XP, 100 Coins & 3 Diamonds",
        coords: { lat: 30.3380, lng: 76.8200 },
        imgX: 13.8,
        imgY: 26.5
      },
      {
        id: "poi_military_hospital",
        name: "Military Hospital",
        tag: "Medical Facility",
        category: "Hospital",
        icon: "➕",
        type: "hospital",
        color: "#ef4444",
        targetHint: "bottle",
        desc: "Cantonment medical center. Scan liquid containers to brew high-potency health potions.",
        rewardDesc: "+120 Energy Restored",
        coords: { lat: 30.3420, lng: 76.8280 },
        imgX: 31.8,
        imgY: 19.5
      },
      {
        id: "poi_army_museum",
        name: "Army Museum",
        tag: "Military Heritage",
        category: "Museum",
        icon: "🏛️",
        type: "museum",
        color: "#b026ff",
        targetHint: "chair",
        desc: "Historic military relics and armor exhibition. Scan furniture to forge Bastion Shields.",
        rewardDesc: "+220 XP & Bastion Shield",
        coords: { lat: 30.3430, lng: 76.8430 },
        imgX: 57.0,
        imgY: 24.0
      },
      {
        id: "poi_sadar_bazar",
        name: "Sadar Bazar",
        tag: "Commercial Zone",
        category: "Shop / Market",
        icon: "🛒",
        type: "market",
        color: "#00ff9d",
        targetHint: "backpack",
        desc: "Bustling market square. High-density drop rate for spatial backpacks.",
        rewardDesc: "+180 XP & Expansion Satchel",
        coords: { lat: 30.3410, lng: 76.8520 },
        imgX: 74.5,
        imgY: 24.5
      },
      {
        id: "poi_govt_school",
        name: "Government School",
        tag: "Academic Hub",
        category: "School",
        icon: "🎓",
        type: "school",
        color: "#38bdf8",
        targetHint: "book",
        desc: "Knowledge node. Scan books or notes to decipher ancient reality algorithms.",
        rewardDesc: "+200 XP & Codex Tome",
        coords: { lat: 30.3360, lng: 76.8240 },
        imgX: 18.0,
        imgY: 41.5
      },
      {
        id: "poi_park",
        name: "Cantt Ecological Park",
        tag: "Nature Reserve",
        category: "Park / Nature",
        icon: "🌳",
        type: "nature",
        color: "#00ff9d",
        targetHint: "tree",
        desc: "Lush green oasis with bio-luminescent photosynthesis lines.",
        rewardDesc: "+140 XP & Sylvan Wood",
        coords: { lat: 30.3310, lng: 76.8210 },
        imgX: 12.5,
        imgY: 55.0
      },
      {
        id: "poi_brahma_sarovar",
        name: "Brahma Sarovar (Sacred Waters)",
        tag: "BOSS / HIGH LEVEL AREA",
        category: "Boss Area",
        icon: "👹",
        type: "boss",
        color: "#ff0055",
        targetHint: "dog",
        desc: "Sacred waters guarding ancient celestial familiars. High-level zone.",
        rewardDesc: "+450 XP, 300 Coins & Celestial Aura",
        coords: { lat: 30.3220, lng: 76.8150 },
        imgX: 12.0,
        imgY: 71.5
      },
      {
        id: "poi_cbi_office",
        name: "CBI Office",
        tag: "Security HQ",
        category: "Government Agency",
        icon: "🛡️",
        type: "security",
        color: "#38bdf8",
        targetHint: "chair",
        desc: "Encrypted federal hub. Scan tactical gear to unlock armor upgrades.",
        rewardDesc: "+200 XP & Tactical Plating",
        coords: { lat: 30.3240, lng: 76.8310 },
        imgX: 29.5,
        imgY: 74.0
      },
      {
        id: "poi_sports_stadium",
        name: "War Heroes Memorial Sports Stadium",
        tag: "Athletic Arena",
        category: "Sports Stadium",
        icon: "🏃",
        type: "sports",
        color: "#b026ff",
        targetHint: "shoes",
        desc: "Synthetic track. Scan running shoes to gain speed buffs.",
        rewardDesc: "+180 XP & Velocity Greaves",
        coords: { lat: 30.3270, lng: 76.8370 },
        imgX: 42.5,
        imgY: 69.5
      },
      {
        id: "poi_rani_ka_bagh",
        name: "Rani Ka Bagh",
        tag: "Heritage Gardens",
        category: "Park / Nature",
        icon: "🌳",
        type: "nature",
        color: "#00ff9d",
        targetHint: "tree",
        desc: "Centuries-old royal gardens with massive sylvan canopy trees.",
        rewardDesc: "+160 XP & Ancient Sap",
        coords: { lat: 30.3250, lng: 76.8420 },
        imgX: 52.0,
        imgY: 76.5
      },
      {
        id: "poi_police_station",
        name: "Cantt Police Station",
        tag: "Law Enforcement",
        category: "Police Station",
        icon: "🛡️",
        type: "police",
        color: "#38bdf8",
        targetHint: "watch",
        desc: "Civil protection command center. Scan watches to sync patrol schedules.",
        rewardDesc: "+150 XP & Chrono Dial",
        coords: { lat: 30.3220, lng: 76.8500 },
        imgX: 70.0,
        imgY: 77.0
      },
      {
        id: "poi_old_fort",
        name: "Old Fort (Hidden Zone)",
        tag: "LOCKED BOSS AREA",
        category: "Boss / High Level Area",
        icon: "👹",
        locked: true,
        type: "boss_locked",
        color: "#ff0055",
        targetHint: "laptop",
        desc: "Ancient citadel locked by reality barriers. Requires Level 5 to enter.",
        rewardDesc: "+500 XP, 400 Coins & Mythic Core",
        coords: { lat: 30.3350, lng: 76.8620 },
        imgX: 71.0,
        imgY: 44.0
      },
      {
        id: "poi_bus_stand",
        name: "Ambala Cantt Bus Stand",
        tag: "Transit Depot",
        category: "Bus Stand",
        icon: "🚌",
        type: "transit",
        color: "#38bdf8",
        targetHint: "bottle",
        desc: "Commuter transit hub connecting Haryana, Punjab, and Chandigarh.",
        rewardDesc: "+120 XP & Travel Ration",
        coords: { lat: 30.3300, lng: 76.8450 },
        imgX: 61.2,
        imgY: 54.5
      },
      {
        id: "poi_shopping_complex",
        name: "Modern Shopping Complex",
        tag: "Retail Nexus",
        category: "Shop / Market",
        icon: "🛒",
        type: "market",
        color: "#00ff9d",
        targetHint: "coffee",
        desc: "Multi-story retail center with cafes, fashion stores, and electronics.",
        rewardDesc: "+150 XP & Hyper-Elixir",
        coords: { lat: 30.3280, lng: 76.8540 },
        imgX: 75.0,
        imgY: 60.5
      }
    ];
  }

  init(containerId = "game-map") {
    // Render Illustrated Ambala Cantt Map Hotspots
    this.renderIllustratedHotspots();

    // Setup map view toggle listeners
    this.setupViewSwitcher();
  }

  setupViewSwitcher() {
    const toggleBtn = document.getElementById("toggle-map-view-btn");
    if (toggleBtn) {
      toggleBtn.onclick = () => {
        this.toggleMapView();
      };
    }
  }

  toggleMapView() {
    const illustratedView = document.getElementById("ambala-illustrated-map-view");
    const gpsView = document.getElementById("ambala-gps-map-view");
    const toggleBtn = document.getElementById("toggle-map-view-btn");

    if (this.activeMapView === "illustrated") {
      this.activeMapView = "gps";
      if (illustratedView) illustratedView.classList.add("hidden");
      if (gpsView) gpsView.classList.remove("hidden");
      if (toggleBtn) toggleBtn.textContent = "🗺️ 3D Game Map";
      this.initLeafletMap("game-map");
    } else {
      this.activeMapView = "illustrated";
      if (gpsView) gpsView.classList.add("hidden");
      if (illustratedView) illustratedView.classList.remove("hidden");
      if (toggleBtn) toggleBtn.textContent = "🛰️ Live GPS Radar";
    }

    if (window.soundEngine) window.soundEngine.playClick();
  }

  renderIllustratedHotspots() {
    const container = document.getElementById("ambala-hotspots-layer");
    if (!container) return;

    container.innerHTML = "";

    this.ambalaPOIs.forEach(poi => {
      const pin = document.createElement("div");
      pin.className = `ambala-hotspot-node ${poi.type}`;
      pin.style.left = `${poi.imgX}%`;
      pin.style.top = `${poi.imgY}%`;
      pin.title = poi.name;

      if (poi.type === "player_home") {
        pin.innerHTML = `
          <div class="player-home-hotspot">
            <div class="home-radar-ring"></div>
            <div class="home-core">🔵</div>
            <div class="hotspot-tooltip">YOU ARE HERE<br><strong>Cantt Market</strong></div>
          </div>
        `;
      } else if (poi.locked) {
        pin.innerHTML = `
          <div class="locked-hotspot">
            <div class="locked-pulse"></div>
            <div class="locked-core">🔒</div>
            <div class="hotspot-tooltip"><strong>${poi.name}</strong><br><span style="color:#ff0055">Locked (Lv.5)</span></div>
          </div>
        `;
      } else if (poi.type === "quest") {
        pin.innerHTML = `
          <div class="quest-hotspot">
            <div class="quest-pulse"></div>
            <div class="quest-core">❗</div>
            <div class="hotspot-tooltip">QUEST LOCATION<br><strong>${poi.name}</strong></div>
          </div>
        `;
      } else {
        pin.innerHTML = `
          <div class="standard-hotspot" style="--poi-color: ${poi.color}">
            <span class="poi-icon">${poi.icon}</span>
            <div class="hotspot-tooltip"><strong>${poi.name}</strong><br>${poi.category}</div>
          </div>
        `;
      }

      pin.onclick = (e) => {
        e.stopPropagation();
        if (window.soundEngine) window.soundEngine.playLockOn();
        this.openAmbalaNodeModal(poi);
      };

      container.appendChild(pin);
    });
  }

  openAmbalaNodeModal(poi) {
    const modal = document.getElementById("node-interaction-modal");
    if (!modal) return;

    document.getElementById("node-modal-icon").textContent = poi.icon;
    document.getElementById("node-modal-title").textContent = poi.name;
    document.getElementById("node-modal-type").textContent = `${poi.category} • ${poi.tag}`;
    document.getElementById("node-modal-lore").textContent = poi.desc;
    document.getElementById("node-modal-reward").textContent = poi.rewardDesc || poi.questNotice || "+150 XP & Ambala Cache";

    const scanBtn = document.getElementById("node-modal-scan-btn");
    scanBtn.onclick = () => {
      modal.classList.add("hidden");
      window.app.switchScreen("scan");
      window.app.selectTargetHint(poi.targetHint, poi.name);
    };

    modal.classList.remove("hidden");
  }

  initLeafletMap(containerId = "game-map") {
    const el = document.getElementById(containerId);
    if (!el) return;

    if (this.map) {
      this.map.invalidateSize();
      return;
    }

    this.map = L.map(containerId, {
      zoomControl: false,
      attributionControl: false,
      maxZoom: 19,
      minZoom: 12
    }).setView([this.currentCoords.lat, this.currentCoords.lng], 15);

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      subdomains: 'abcd',
      maxZoom: 20
    }).addTo(this.map);

    L.control.zoom({ position: 'bottomright' }).addTo(this.map);

    // Player Marker at Cantt Market
    const playerIcon = L.divIcon({
      className: 'player-radar-icon-container',
      html: `
        <div class="player-beacon">
          <div class="beacon-pulse"></div>
          <div class="beacon-core"><span class="beacon-symbol">⚡</span></div>
        </div>
      `,
      iconSize: [44, 44],
      iconAnchor: [22, 22]
    });

    this.playerMarker = L.marker([this.currentCoords.lat, this.currentCoords.lng], {
      icon: playerIcon,
      zIndexOffset: 1000
    }).addTo(this.map);

    this.radarCircle = L.circle([this.currentCoords.lat, this.currentCoords.lng], {
      radius: 350,
      color: '#00f0ff',
      weight: 1.5,
      dashArray: '4, 8',
      fillColor: '#00f0ff',
      fillOpacity: 0.08
    }).addTo(this.map);

    // Plot Ambala POIs on Leaflet Map
    this.ambalaPOIs.forEach(poi => {
      const markerIcon = L.divIcon({
        className: 'ar-node-icon-wrapper',
        html: `
          <div class="ar-node-marker" style="--node-color: ${poi.color}">
            <div class="node-ring"></div>
            <div class="node-icon">${poi.icon}</div>
          </div>
        `,
        iconSize: [38, 38],
        iconAnchor: [19, 19]
      });

      const marker = L.marker([poi.coords.lat, poi.coords.lng], { icon: markerIcon }).addTo(this.map);
      marker.on('click', () => {
        if (window.soundEngine) window.soundEngine.playLockOn();
        this.openAmbalaNodeModal(poi);
      });
      this.spawnMarkers.push(marker);
    });
  }

  recenter() {
    if (this.activeMapView === "gps" && this.map) {
      this.map.flyTo([this.currentCoords.lat, this.currentCoords.lng], 15, { animate: true, duration: 0.8 });
    } else {
      const scrollWrap = document.getElementById("ambala-map-scroll-container");
      if (scrollWrap) {
        scrollWrap.scrollTo({
          left: (scrollWrap.scrollWidth - scrollWrap.clientWidth) / 2,
          top: (scrollWrap.scrollHeight - scrollWrap.clientHeight) / 2,
          behavior: "smooth"
        });
      }
    }
    if (window.soundEngine) window.soundEngine.playSonar();
  }
}

window.mapEngine = new MapEngine();
