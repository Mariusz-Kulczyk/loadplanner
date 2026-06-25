'use strict';

const canvas = document.getElementById('glCanvas');
const gl = canvas.getContext('webgl', { antialias: true, alpha: false, preserveDrawingBuffer: true });

if (!gl) {
  alert('WebGL is not supported by this browser.');
}

const COLORS = ['#2563eb', '#16a34a', '#f59e0b', '#dc2626', '#7c3aed', '#0891b2', '#64748b', '#ea580c'];
const CARGO_PRESETS = [
  { name: 'Europaleta', length: 120, width: 80, height: 150, weight: 300, color: '#2563eb' },
  { name: 'Paleta przemysłowa', length: 120, width: 100, height: 150, weight: 400, color: '#16a34a' },
  { name: 'Półpaleta', length: 80, width: 60, height: 120, weight: 150, color: '#38bdf8' },
  { name: 'Skrzynia', length: 120, width: 80, height: 80, weight: 250, color: '#f59e0b' },
  { name: 'Karton', length: 60, width: 40, height: 40, weight: 25, color: '#a855f7' },
  { name: 'Big bag', length: 95, width: 95, height: 130, weight: 900, color: '#ea580c' },
  { name: 'Beczka', length: 60, width: 60, height: 90, weight: 120, color: '#0891b2' },
  { name: 'Rolka', length: 120, width: 80, height: 80, weight: 300, color: '#db2777' },
  { name: 'Wiązka', length: 240, width: 40, height: 40, weight: 500, color: '#64748b' },
  { name: 'Luzem', length: 100, width: 100, height: 100, weight: 200, color: '#84cc16' }
];

const APP_LANG = (document.documentElement.lang || 'pl').toLowerCase().slice(0, 2);
const APP_LOCALE = APP_LANG === 'de' ? 'de-DE' : APP_LANG === 'en' ? 'en-GB' : 'pl-PL';
const I18N = {
  pl: {
    cargo:'Ładunek', cargoList:'Lista ładunków', noCargo:'Brak ładunków', none:'Brak', outside:'POZA AUTEM',
    rotate:'Obrót', remove:'Usuń', loaded:'na aucie', excess:'poza autem / nadmiar', status:'Status', rotation:'Obrót',
    stacking:'Piętrowanie', yes:'tak', no:'nie', items:'Sztuki', onVehicle:'na aucie', outsideShort:'poza', stacked:'Stackowane', weight:'Waga',
    noApi:'Wklej własny klucz Gemini API, aby uruchomić analizę.', noText:'Wklej tekst do analizy.', connecting:'Przygotowuję wiadomość i zrzut ISO…', analyzing:'AI analizuje...', analyze:'Zaplanuj przez AI',
    aiError:'Błąd Gemini AI: {error}. Sprawdź klucz API i uprawnienia w Google AI Studio.', aiDone:'Gotowe: {count} pozycji z Gemini ({model}). Dane trafiły na listę ładunków i scenę 3D.',
    shotError:'Nie udało się pobrać zrzutu planera.', noInquiry:'Dodaj co najmniej jedną pozycję ładunku przed przygotowaniem zapytania.', shotReady:'Zrzut PNG i plik EML zostały przygotowane.', mailReady:'Otwieram szkic wiadomości.', emlReady:'Przygotowano plik EML ze zrzutem ISO jako załącznikiem.',
    greet:'Dzień dobry Panie Mariuszu,', intro:'Proszę o wstępne zapytanie transportowe na podstawie planu załadunku.',
    space:'Przestrzeń', limit:'limit', total:'Łącznie', cargoRows:'Lista ładunków:',
    shotNote:'Zrzut widoku Load Planner został pobrany jako PNG — dołączam go do tej wiadomości.', noShotNote:'Proszę o przygotowanie planu na podstawie powyższej listy.',
    piece:'szt.', each:'kg/szt.', subject:'Zapytanie transportowe — {vehicle} — {qty} szt.', saved:'Zapisano lokalnie w przeglądarce.', clearConfirm:'Wyczyścić cały projekt?', savedNone:'Brak zapisanych lokalnie ładunków.', savedCargo:'ładunek', vehicleSolo:'Solówka', vehicleTrailer:'Naczepa 13.6',
    statsInline:'Statystyki', cbm:'CBM', ldm:'LDM', available:'dostępna', loadingDetails:'Poniżej przedstawiam terminy i miejsca załadunku, rozładunku oraz wymagania operacyjne:',
    loadingDate:'Termin załadunku:', loadingPlace:'Miejsce załadunku:', unloadingDate:'Termin rozładunku:', unloadingPlace:'Miejsce rozładunku:', transportReq:'Wymagania dot. transportu:', handlingReq:'Czynności manipulacyjne:', notes:'Dodatkowe uwagi:',
    watermark:'MotoHouse · Planer Załadunku by Mariusz Kulczyk © 2026',
    presets:['Europaleta','Paleta przemysłowa','Półpaleta','Skrzynia','Karton','Big bag','Beczka','Rolka','Wiązka','Luzem']
  },
  en: {
    cargo:'Cargo', cargoList:'Cargo list', noCargo:'No cargo items', none:'None', outside:'OUTSIDE VEHICLE',
    rotate:'Rotate', remove:'Remove', loaded:'on vehicle', excess:'outside vehicle / excess', status:'Status', rotation:'Rotation',
    stacking:'Stacking', yes:'yes', no:'no', items:'Items', onVehicle:'on vehicle', outsideShort:'outside', stacked:'Stacked', weight:'Weight',
    noApi:'Paste your Gemini API key to start the analysis.', noText:'Paste text to analyze.', connecting:'Preparing the email and ISO screenshot…', analyzing:'AI is analyzing...', analyze:'Plan with AI',
    aiError:'Gemini AI error: {error}. Check your API key and permissions in Google AI Studio.', aiDone:'Done: {count} positions from Gemini ({model}). Data has been added to the cargo list and 3D scene.',
    shotError:'Planner screenshot could not be downloaded.', noInquiry:'Add at least one cargo item before preparing an inquiry.', shotReady:'PNG screenshot and EML file are ready.', mailReady:'Opening the email draft.', emlReady:'An EML email file with the ISO screenshot as attachment has been prepared.',
    greet:'Hello Mr. Mariusz,', intro:'Please prepare an initial transport inquiry based on the loading plan.',
    space:'Load space', limit:'limit', total:'Total', cargoRows:'Cargo list:',
    shotNote:'The Load Planner screenshot has been downloaded as PNG — I am attaching it to this message.', noShotNote:'Please prepare a proposal based on the list above.',
    piece:'pcs', each:'kg/pc', subject:'Transport inquiry — {vehicle} — {qty} items', saved:'Saved locally in this browser.', clearConfirm:'Clear the entire project?', savedNone:'No saved cargo loads.', savedCargo:'cargo', vehicleSolo:'Rigid truck', vehicleTrailer:'Trailer 13.6',
    statsInline:'Statistics', cbm:'CBM', ldm:'LDM', available:'available', loadingDetails:'Below are the loading / unloading details and operational requirements:',
    loadingDate:'Loading date/window:', loadingPlace:'Loading place:', unloadingDate:'Unloading date/window:', unloadingPlace:'Unloading place:', transportReq:'Transport requirements:', handlingReq:'Handling operations:', notes:'Additional notes:',
    watermark:'MotoHouse · Load Planner by Mariusz Kulczyk © 2026',
    presets:['Euro pallet','Industrial pallet','Half pallet','Crate','Carton','Big bag','Drum','Roll','Bundle','Loose cargo']
  },
  de: {
    cargo:'Ladung', cargoList:'Ladeliste', noCargo:'Keine Ladungspositionen', none:'Keine', outside:'AUSSERHALB DES FAHRZEUGS',
    rotate:'Drehen', remove:'Löschen', loaded:'im Fahrzeug', excess:'außerhalb des Fahrzeugs / Überhang', status:'Status', rotation:'Drehung',
    stacking:'Stapeln', yes:'ja', no:'nein', items:'Positionen', onVehicle:'im Fahrzeug', outsideShort:'außerhalb', stacked:'Gestapelt', weight:'Gewicht',
    noApi:'Fügen Sie Ihren Gemini API-Schlüssel ein, um die Analyse zu starten.', noText:'Fügen Sie Text zur Analyse ein.', connecting:'E-Mail und ISO-Screenshot werden vorbereitet…', analyzing:'KI analysiert...', analyze:'Mit KI planen',
    aiError:'Gemini AI-Fehler: {error}. Prüfen Sie API-Schlüssel und Berechtigungen in Google AI Studio.', aiDone:'Fertig: {count} Positionen von Gemini ({model}). Daten wurden zur Ladeliste und 3D-Szene hinzugefügt.',
    shotError:'Der Planner-Screenshot konnte nicht heruntergeladen werden.', noInquiry:'Fügen Sie mindestens eine Ladungsposition hinzu, bevor Sie eine Anfrage vorbereiten.', shotReady:'PNG-Screenshot und EML-Datei wurden vorbereitet.', mailReady:'E-Mail-Entwurf wird geöffnet.', emlReady:'Eine EML-Datei mit dem ISO-Screenshot als Anhang wurde vorbereitet.',
    greet:'Guten Tag Herr Mariusz,', intro:'Bitte erstellen Sie eine erste Transportanfrage auf Grundlage des Ladeplans.',
    space:'Laderaum', limit:'Limit', total:'Gesamt', cargoRows:'Ladeliste:',
    shotNote:'Der Screenshot des Load Planners wurde als PNG heruntergeladen — ich füge ihn dieser Nachricht bei.', noShotNote:'Bitte erstellen Sie ein Angebot auf Grundlage der obigen Liste.',
    piece:'Stk.', each:'kg/Stk.', subject:'Transportanfrage — {vehicle} — {qty} Positionen', saved:'Lokal im Browser gespeichert.', clearConfirm:'Gesamtes Projekt leeren?', savedNone:'Keine lokal gespeicherten Ladungen.', savedCargo:'Ladung', vehicleSolo:'Solo-Lkw', vehicleTrailer:'Sattelauflieger 13.6',
    statsInline:'Statistik', cbm:'CBM', ldm:'LDM', available:'verfügbar', loadingDetails:'Nachfolgend finden Sie Lade-/Entladedaten sowie operative Anforderungen:',
    loadingDate:'Ladetermin / Zeitfenster:', loadingPlace:'Ladeort:', unloadingDate:'Entladetermin / Zeitfenster:', unloadingPlace:'Entladeort:', transportReq:'Transportanforderungen:', handlingReq:'Manipulations-/Umschlagtätigkeiten:', notes:'Zusätzliche Hinweise:',
    watermark:'MotoHouse · Ladeplaner by Mariusz Kulczyk © 2026',
    presets:['Europalette','Industriepalette','Halbpalette','Kiste','Karton','Big Bag','Fass','Rolle','Bündel','Lose Ladung']
  }
};
const L10N = I18N[APP_LANG] || I18N.pl;
function tr(text, data = {}) { return String(text).replace(/\{(\w+)\}/g, (_, k) => data[k] == null ? '' : data[k]); }
function formatLocale(value, options = {}) { return Number(value || 0).toLocaleString(APP_LOCALE, options); }
function cargoName(index) { return `${L10N.cargo} ${index + 1}`; }
CARGO_PRESETS.forEach((preset, index) => { preset.name = L10N.presets[index] || preset.name; });

const STORAGE_KEY = 'loadpilot-3d-v3-6-7-project';
const LOAD_HISTORY_KEY = 'loadpilot-3d-v3-6-7-load-history';
const AI_MEMORY_KEY = 'loadpilot-3d-v3-6-7-ai-memory';
const GEMINI_API_BASE = 'https://generativelanguage.googleapis.com/v1beta';
const GEMINI_MODEL_CANDIDATES = [
  'gemini-2.5-flash',
  'gemini-2.5-flash-lite',
  'gemini-2.0-flash',
  'gemini-1.5-flash',
  'gemini-1.5-pro'
];
const DEG = Math.PI / 180;

let state = {
  space: { length: 1360, width: 245, height: 270, maxWeight: 24000, label: 'Naczepa 13.6' },
  cargo: [],
  selectedId: null,
  camera: { yaw: -42 * DEG, pitch: 25 * DEG, distance: 16, target: [6.8, 0.55, 1.22] },
  interaction: { mode: 'none', lastX: 0, lastY: 0, dragOffset: [0, 0], dragStart: null },
  grid: 5,
  dirty: false,
  contextMenu: { visible: false, x: 0, y: 0, itemId: null }
};

let nextId = 1;

const $ = (id) => document.getElementById(id);
function setStatus(text) { const el = $('engineStatus'); if (el) el.textContent = text; }

function uid(prefix = 'cargo') {
  return `${prefix}-${Date.now().toString(36)}-${nextId++}`;
}

function hexToRgb(hex) {
  const h = hex.replace('#', '');
  const n = parseInt(h.length === 3 ? h.split('').map(c => c + c).join('') : h, 16);
  return [(n >> 16 & 255) / 255, (n >> 8 & 255) / 255, (n & 255) / 255];
}

function lighten(rgb, factor) {
  return rgb.map(v => Math.min(1, v * factor));
}

function cm(v) { return v / 100; }
function mToCm(v) { return v * 100; }
function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }
function snapCm(v) { return Math.round(v / state.grid) * state.grid; }

function add(a, b) { return [a[0] + b[0], a[1] + b[1], a[2] + b[2]]; }
function sub(a, b) { return [a[0] - b[0], a[1] - b[1], a[2] - b[2]]; }
function mul(a, s) { return [a[0] * s, a[1] * s, a[2] * s]; }
function dot(a, b) { return a[0] * b[0] + a[1] * b[1] + a[2] * b[2]; }
function cross(a, b) { return [a[1]*b[2]-a[2]*b[1], a[2]*b[0]-a[0]*b[2], a[0]*b[1]-a[1]*b[0]]; }
function len(a) { return Math.hypot(a[0], a[1], a[2]); }
function norm(a) { const l = len(a) || 1; return [a[0]/l, a[1]/l, a[2]/l]; }

function mat4Identity() {
  return [1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1];
}
function mat4Multiply(a, b) {
  // Column-major multiplication for WebGL: out = a * b.
  // The previous v3 build used row-major indexing here, which could place the camera
  // outside the visible projection and make the whole scene look empty.
  const out = new Array(16);
  for (let c = 0; c < 4; c++) {
    for (let r = 0; r < 4; r++) {
      out[c * 4 + r] =
        a[0 * 4 + r] * b[c * 4 + 0] +
        a[1 * 4 + r] * b[c * 4 + 1] +
        a[2 * 4 + r] * b[c * 4 + 2] +
        a[3 * 4 + r] * b[c * 4 + 3];
    }
  }
  return out;
}
function mat4Perspective(fov, aspect, near, far) {
  const f = 1 / Math.tan(fov / 2);
  const nf = 1 / (near - far);
  return [
    f / aspect, 0, 0, 0,
    0, f, 0, 0,
    0, 0, (far + near) * nf, -1,
    0, 0, (2 * far * near) * nf, 0
  ];
}
function mat4LookAt(eye, target, up) {
  const z = norm(sub(eye, target));
  const x = norm(cross(up, z));
  const y = cross(z, x);
  return [
    x[0], y[0], z[0], 0,
    x[1], y[1], z[1], 0,
    x[2], y[2], z[2], 0,
    -dot(x, eye), -dot(y, eye), -dot(z, eye), 1
  ];
}
function mat4Translate(x, y, z) {
  return [1,0,0,0, 0,1,0,0, 0,0,1,0, x,y,z,1];
}
function mat4Scale(x, y, z) {
  return [x,0,0,0, 0,y,0,0, 0,0,z,0, 0,0,0,1];
}
function mat4RotateY(rad) {
  const c = Math.cos(rad), s = Math.sin(rad);
  return [c,0,-s,0, 0,1,0,0, s,0,c,0, 0,0,0,1];
}

function createShader(type, src) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, src);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(shader));
  return shader;
}
function createProgram(vs, fs) {
  const p = gl.createProgram();
  gl.attachShader(p, createShader(gl.VERTEX_SHADER, vs));
  gl.attachShader(p, createShader(gl.FRAGMENT_SHADER, fs));
  gl.linkProgram(p);
  if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p));
  return p;
}

const program = createProgram(`
  attribute vec3 aPosition;
  attribute float aShade;
  uniform mat4 uMVP;
  uniform vec3 uColor;
  uniform float uAlpha;
  varying vec3 vColor;
  void main() {
    vColor = uColor * aShade;
    gl_Position = uMVP * vec4(aPosition, 1.0);
  }
`, `
  precision mediump float;
  varying vec3 vColor;
  uniform float uAlpha;
  void main() {
    gl_FragColor = vec4(vColor, uAlpha);
  }
`);

const lineProgram = createProgram(`
  attribute vec3 aPosition;
  uniform mat4 uMVP;
  void main() { gl_Position = uMVP * vec4(aPosition, 1.0); }
`, `
  precision mediump float;
  uniform vec3 uColor;
  void main() { gl_FragColor = vec4(uColor, 1.0); }
`);


const textureProgram = createProgram(`
  attribute vec3 aPosition;
  attribute vec2 aTexCoord;
  uniform mat4 uMVP;
  varying vec2 vTexCoord;
  void main() {
    vTexCoord = aTexCoord;
    gl_Position = uMVP * vec4(aPosition, 1.0);
  }
`, `
  precision mediump float;
  varying vec2 vTexCoord;
  uniform sampler2D uTexture;
  uniform float uAlpha;
  void main() {
    vec4 tex = texture2D(uTexture, vTexCoord);
    gl_FragColor = vec4(tex.rgb, tex.a * uAlpha);
  }
`);

const loc = {
  pos: gl.getAttribLocation(program, 'aPosition'),
  shade: gl.getAttribLocation(program, 'aShade'),
  mvp: gl.getUniformLocation(program, 'uMVP'),
  color: gl.getUniformLocation(program, 'uColor'),
  alpha: gl.getUniformLocation(program, 'uAlpha'),
  linePos: gl.getAttribLocation(lineProgram, 'aPosition'),
  lineMvp: gl.getUniformLocation(lineProgram, 'uMVP'),
  lineColor: gl.getUniformLocation(lineProgram, 'uColor'),
  texPos: gl.getAttribLocation(textureProgram, 'aPosition'),
  texUv: gl.getAttribLocation(textureProgram, 'aTexCoord'),
  texMvp: gl.getUniformLocation(textureProgram, 'uMVP'),
  texSampler: gl.getUniformLocation(textureProgram, 'uTexture'),
  texAlpha: gl.getUniformLocation(textureProgram, 'uAlpha')
};

function makeCubeData() {
  const p = [
    // front z+
    -0.5,-0.5, 0.5, 0.5,-0.5, 0.5, 0.5, 0.5, 0.5, -0.5,-0.5, 0.5, 0.5, 0.5, 0.5, -0.5, 0.5, 0.5,
    // back z-
     0.5,-0.5,-0.5, -0.5,-0.5,-0.5, -0.5, 0.5,-0.5, 0.5,-0.5,-0.5, -0.5, 0.5,-0.5, 0.5, 0.5,-0.5,
    // left x-
    -0.5,-0.5,-0.5, -0.5,-0.5, 0.5, -0.5, 0.5, 0.5, -0.5,-0.5,-0.5, -0.5, 0.5, 0.5, -0.5, 0.5,-0.5,
    // right x+
     0.5,-0.5, 0.5, 0.5,-0.5,-0.5, 0.5, 0.5,-0.5, 0.5,-0.5, 0.5, 0.5, 0.5,-0.5, 0.5, 0.5, 0.5,
    // top y+
    -0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5,-0.5, -0.5, 0.5, 0.5, 0.5, 0.5,-0.5, -0.5, 0.5,-0.5,
    // bottom y-
    -0.5,-0.5,-0.5, 0.5,-0.5,-0.5, 0.5,-0.5, 0.5, -0.5,-0.5,-0.5, 0.5,-0.5, 0.5, -0.5,-0.5, 0.5
  ];
  const shades = [];
  [0.92, 0.58, 0.74, 0.82, 1.12, 0.48].forEach(s => { for (let i = 0; i < 6; i++) shades.push(s); });
  return { p: new Float32Array(p), s: new Float32Array(shades) };
}

function makeQuadData() {
  return {
    p: new Float32Array([
      -0.5, -0.5, 0,
       0.5, -0.5, 0,
       0.5,  0.5, 0,
      -0.5, -0.5, 0,
       0.5,  0.5, 0,
      -0.5,  0.5, 0
    ]),
    uv: new Float32Array([
      1, 1,
      0, 1,
      0, 0,
      1, 1,
      0, 0,
      1, 0
    ])
  };
}

const cube = makeCubeData();
const cubePosBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, cubePosBuffer);
gl.bufferData(gl.ARRAY_BUFFER, cube.p, gl.STATIC_DRAW);
const cubeShadeBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, cubeShadeBuffer);
gl.bufferData(gl.ARRAY_BUFFER, cube.s, gl.STATIC_DRAW);

const lineBuffer = gl.createBuffer();

const quad = makeQuadData();
const quadPosBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, quadPosBuffer);
gl.bufferData(gl.ARRAY_BUFFER, quad.p, gl.STATIC_DRAW);
const quadUvBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, quadUvBuffer);
gl.bufferData(gl.ARRAY_BUFFER, quad.uv, gl.STATIC_DRAW);


const CAB_LOGO_DATA_URL = 'data:image/png;base64,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';

let logoTexture = null;
let logoTextureReady = false;
function initTexture(url) {
  const tex = gl.createTexture();
  const img = new Image();
  img.onload = () => {
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    logoTextureReady = true;
  };
  img.onerror = () => { logoTextureReady = false; };
  img.src = url;
  return tex;
}
logoTexture = initTexture(CAB_LOGO_DATA_URL);

function drawTexturedQuad(x, y, z, w, h, vp, alpha = 1) {
  if (!logoTextureReady || !logoTexture) return;
  const model = mat4Multiply(mat4Translate(x + w / 2, y + h / 2, z), mat4Scale(w, h, 1));
  const mvp = mat4Multiply(vp, model);
  gl.useProgram(textureProgram);
  gl.bindBuffer(gl.ARRAY_BUFFER, quadPosBuffer);
  gl.enableVertexAttribArray(loc.texPos);
  gl.vertexAttribPointer(loc.texPos, 3, gl.FLOAT, false, 0, 0);
  gl.bindBuffer(gl.ARRAY_BUFFER, quadUvBuffer);
  gl.enableVertexAttribArray(loc.texUv);
  gl.vertexAttribPointer(loc.texUv, 2, gl.FLOAT, false, 0, 0);
  gl.uniformMatrix4fv(loc.texMvp, false, new Float32Array(mvp));
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, logoTexture);
  gl.uniform1i(loc.texSampler, 0);
  gl.uniform1f(loc.texAlpha, alpha);
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
  gl.depthMask(false);
  gl.drawArrays(gl.TRIANGLES, 0, 6);
  gl.depthMask(true);
  gl.disable(gl.BLEND);
}

function getCameraBasis() {
  const c = state.camera;
  const cp = Math.cos(c.pitch);
  const offset = [
    Math.cos(c.yaw) * cp * c.distance,
    Math.sin(c.pitch) * c.distance,
    Math.sin(c.yaw) * cp * c.distance
  ];
  const eye = add(c.target, offset);
  const forward = norm(sub(c.target, eye));
  const right = norm(cross(forward, [0, 1, 0]));
  const up = norm(cross(right, forward));
  return { eye, target: c.target, forward, right, up };
}

function getViewProjection() {
  const basis = getCameraBasis();
  const aspect = canvas.width / canvas.height;
  const projection = mat4Perspective(45 * DEG, aspect, 0.05, 200);
  const view = mat4LookAt(basis.eye, basis.target, [0, 1, 0]);
  return { vp: mat4Multiply(projection, view), basis };
}

function resizeCanvas() {
  const rect = canvas.getBoundingClientRect();
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const width = Math.max(1, Math.floor(rect.width * dpr));
  const height = Math.max(1, Math.floor(rect.height * dpr));
  if (canvas.width !== width || canvas.height !== height) {
    canvas.width = width;
    canvas.height = height;
  }
  gl.viewport(0, 0, canvas.width, canvas.height);
}

function drawBox(minX, minY, minZ, sx, sy, sz, color, vp, alpha = 1) {
  const model = mat4Multiply(mat4Translate(minX + sx/2, minY + sy/2, minZ + sz/2), mat4Scale(sx, sy, sz));
  const mvp = mat4Multiply(vp, model);
  gl.useProgram(program);
  gl.bindBuffer(gl.ARRAY_BUFFER, cubePosBuffer);
  gl.enableVertexAttribArray(loc.pos);
  gl.vertexAttribPointer(loc.pos, 3, gl.FLOAT, false, 0, 0);
  gl.bindBuffer(gl.ARRAY_BUFFER, cubeShadeBuffer);
  gl.enableVertexAttribArray(loc.shade);
  gl.vertexAttribPointer(loc.shade, 1, gl.FLOAT, false, 0, 0);
  gl.uniformMatrix4fv(loc.mvp, false, new Float32Array(mvp));
  gl.uniform3fv(loc.color, new Float32Array(color));
  gl.uniform1f(loc.alpha, alpha);
  if (alpha < 1) {
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.depthMask(false);
  }
  gl.drawArrays(gl.TRIANGLES, 0, 36);
  if (alpha < 1) {
    gl.depthMask(true);
    gl.disable(gl.BLEND);
  }
}

function drawLines(vertices, color, vp) {
  gl.useProgram(lineProgram);
  gl.bindBuffer(gl.ARRAY_BUFFER, lineBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.DYNAMIC_DRAW);
  gl.enableVertexAttribArray(loc.linePos);
  gl.vertexAttribPointer(loc.linePos, 3, gl.FLOAT, false, 0, 0);
  gl.uniformMatrix4fv(loc.lineMvp, false, new Float32Array(vp));
  gl.uniform3fv(loc.lineColor, new Float32Array(color));
  gl.drawArrays(gl.LINES, 0, vertices.length / 3);
}



function drawTexturedQuadFront(x, y, z, w, h, vp, alpha = 1) {
  if (!logoTextureReady || !logoTexture) return;
  // Quad is rotated so its face is visible on the front panel of the cab.
  const model = mat4Multiply(mat4Translate(x, y + h / 2, z + w / 2), mat4Multiply(mat4RotateY(Math.PI / 2), mat4Scale(w, h, 1)));
  const mvp = mat4Multiply(vp, model);
  gl.useProgram(textureProgram);
  gl.bindBuffer(gl.ARRAY_BUFFER, quadPosBuffer);
  gl.enableVertexAttribArray(loc.texPos);
  gl.vertexAttribPointer(loc.texPos, 3, gl.FLOAT, false, 0, 0);
  gl.bindBuffer(gl.ARRAY_BUFFER, quadUvBuffer);
  gl.enableVertexAttribArray(loc.texUv);
  gl.vertexAttribPointer(loc.texUv, 2, gl.FLOAT, false, 0, 0);
  gl.uniformMatrix4fv(loc.texMvp, false, new Float32Array(mvp));
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, logoTexture);
  gl.uniform1i(loc.texSampler, 0);
  gl.uniform1f(loc.texAlpha, alpha);
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
  gl.depthMask(false);
  gl.drawArrays(gl.TRIANGLES, 0, 6);
  gl.depthMask(true);
  gl.disable(gl.BLEND);
}

function boxEdges(x, y, z, sx, sy, sz) {
  const x2 = x + sx, y2 = y + sy, z2 = z + sz;
  const pts = [[x,y,z],[x2,y,z],[x2,y,z2],[x,y,z2],[x,y2,z],[x2,y2,z],[x2,y2,z2],[x,y2,z2]];
  const pairs = [[0,1],[1,2],[2,3],[3,0],[4,5],[5,6],[6,7],[7,4],[0,4],[1,5],[2,6],[3,7]];
  return pairs.flatMap(([a,b]) => [...pts[a], ...pts[b]]);
}

function drawGrid(vp) {
  const L = cm(state.space.length), W = cm(state.space.width), H = cm(state.space.height);
  const lines = [];
  const step = 0.5;
  for (let x = 0; x <= L + 0.001; x += step) lines.push(x, 0.002, 0, x, 0.002, W);
  for (let z = 0; z <= W + 0.001; z += step) lines.push(0, 0.002, z, L, 0.002, z);
  drawLines(lines, [0.70, 0.76, 0.84], vp);
  drawLines(boxEdges(0, 0, 0, L, H, W), [0.12, 0.20, 0.32], vp);
  drawLines([0,0.01,0, L,0.01,0, 0,0.01,0, 0,0.01,W, 0,0.01,0, 0,H,0], [0.05,0.10,0.20], vp);
}


function getVehicleConfig() {
  const cargoLength = state.space.length;
  if (cargoLength <= 490) {
    return {
      type: 'van',
      name: 'Renault Master',
      cabLengthCm: 155,
      cabHeightCm: Math.min(250, Math.max(210, state.space.height)),
      widthExtraCm: 8,
      color: [0.78, 0.84, 0.92],
      glass: [0.36, 0.56, 0.78]
    };
  }
  if (cargoLength <= 1000) {
    return {
      type: 'solo',
      name: 'Mercedes-Benz Atego',
      cabLengthCm: 220,
      cabHeightCm: Math.min(285, Math.max(235, state.space.height * 0.92)),
      widthExtraCm: 18,
      color: [0.82, 0.87, 0.94],
      glass: [0.30, 0.49, 0.70]
    };
  }
  return {
    type: 'tractor',
    name: 'Scania R/S',
    cabLengthCm: 260,
    cabHeightCm: Math.min(330, Math.max(275, state.space.height * 0.95)),
    widthExtraCm: 22,
    color: [0.82, 0.86, 0.92],
    glass: [0.26, 0.44, 0.66]
  };
}

function drawVehicleFront(vp) {
  const cfg = getVehicleConfig();
  const W = cm(state.space.width);
  const cabL = cm(cfg.cabLengthCm);
  const cabH = cm(cfg.cabHeightCm);
  const cabW = W + cm(cfg.widthExtraCm);
  const z0 = -cm(cfg.widthExtraCm) / 2;
  const x0 = -cabL;

  // Przezroczysta kabina/przód pojazdu. Przestrzeń ładunkowa nadal zaczyna się od X=0,
  // więc algorytm nigdy nie może tam położyć towaru.
  if (cfg.type === 'van') {
    drawBox(x0, 0, z0, cabL * 0.92, cabH * 0.88, cabW, cfg.color, vp, 0.26);
    drawBox(x0 + cabL * 0.60, 0.02, z0 + cabW * 0.08, cabL * 0.34, cabH * 0.44, cabW * 0.84, cfg.color, vp, 0.20);
    drawBox(x0 + cabL * 0.13, cabH * 0.50, z0 + cabW * 0.10, cabL * 0.34, cabH * 0.26, cabW * 0.80, cfg.glass, vp, 0.38);
  } else if (cfg.type === 'solo') {
    drawBox(x0, 0, z0, cabL * 0.86, cabH * 0.88, cabW, cfg.color, vp, 0.25);
    drawBox(x0 + cabL * 0.66, 0.04, z0 + cabW * 0.09, cabL * 0.25, cabH * 0.36, cabW * 0.82, cfg.color, vp, 0.20);
    drawBox(x0 + cabL * 0.12, cabH * 0.53, z0 + cabW * 0.09, cabL * 0.38, cabH * 0.24, cabW * 0.82, cfg.glass, vp, 0.40);
  } else {
    drawBox(x0, 0, z0, cabL * 0.78, cabH * 0.92, cabW, cfg.color, vp, 0.25);
    drawBox(x0 + cabL * 0.58, 0.04, z0 + cabW * 0.08, cabL * 0.25, cabH * 0.35, cabW * 0.84, cfg.color, vp, 0.20);
    drawBox(x0 + cabL * 0.10, cabH * 0.56, z0 + cabW * 0.10, cabL * 0.35, cabH * 0.23, cabW * 0.80, cfg.glass, vp, 0.40);
  }

  // Koła jako proste bryły pomocnicze.
  const wheel = [0.03, 0.04, 0.06];
  const wheelY = -0.10;
  const wheelH = 0.22;
  const wheelL = 0.34;
  const wheelW = 0.18;
  const wheelXs = cfg.type === 'van' ? [x0 + cabL * 0.22, x0 + cabL * 0.76] : [x0 + cabL * 0.22, x0 + cabL * 0.68];
  for (const wx of wheelXs) {
    drawBox(wx, wheelY, z0 - 0.06, wheelL, wheelH, wheelW, wheel, vp, 0.98);
    drawBox(wx, wheelY, z0 + cabW - wheelW + 0.06, wheelL, wheelH, wheelW, wheel, vp, 0.98);
  }

  // MotoHouse logo on the RIGHT side of the cab (front part of the vehicle, not on the trailer).
  // For this coordinate system the vehicle faces towards negative X, so the right side is the lower-Z side.
  const logoAspect = 1200 / 280;
  const logoW = Math.min(2.0, Math.max(1.15, cabL * 0.56));
  const logoH = logoW / logoAspect;
  const plateW = logoW + 0.18;
  const plateH = logoH + 0.10;
  const plateX = x0 + cabL * 0.14;
  const plateY = cabH * 0.38;
  const plateZ = z0 - 0.028;
  // subtle backing plate to ensure the logo is always visible against the transparent cab
  drawBox(plateX - 0.02, plateY - 0.03, plateZ, plateW, plateH, 0.012, [0.98, 0.99, 1.0], vp, 0.96);
  drawTexturedQuad(plateX, plateY, z0 - 0.034, logoW, logoH, vp, 1);

  drawLines(boxEdges(x0, 0, z0, cabL * 0.92, cabH * 0.9, cabW), [0.10, 0.16, 0.26], vp);
  drawLines([0,0,0, x0,0,0, 0,0,W, x0,0,W, x0,0,z0, x0,0,z0+cabW], [0.60, 0.66, 0.75], vp);
}

function drawOverflowZone(vp) {
  const W = cm(state.space.width);
  const L = cm(state.space.length);
  const z = -2.0;
  const lines = [
    0,0.012,z, L,0.012,z,
    0,0.012,z-0.02, 0,0.012,0,
    L,0.012,z-0.02, L,0.012,0
  ];
  drawLines(lines, [0.95, 0.30, 0.25], vp);
}

function renderScene() {
  resizeCanvas();
  gl.enable(gl.DEPTH_TEST);
  // Culling disabled so all faces remain visible even if geometry winding changes.
  gl.disable(gl.CULL_FACE);
  gl.clearColor(0.92, 0.96, 1.0, 1);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  const { vp } = getViewProjection();
  const L = cm(state.space.length), W = cm(state.space.width);

  drawBox(0, -0.025, 0, L, 0.025, W, [0.78, 0.84, 0.91], vp);
  drawGrid(vp);
  drawVehicleFront(vp);

  for (const item of state.cargo) {
    const rgb = hexToRgb(item.color || '#2563eb');
    const selected = item.id === state.selectedId;
    const alpha = item.unloaded ? 0.72 : 1;
    const color = item.unloaded ? [0.95, 0.35, 0.30] : (selected ? lighten(rgb, 1.2) : rgb);
    drawBox(cm(item.x), cm(item.y), cm(item.z), cm(item.length), cm(item.height), cm(item.width), color, vp, alpha);
    drawLines(boxEdges(cm(item.x), cm(item.y), cm(item.z), cm(item.length), cm(item.height), cm(item.width)), item.unloaded ? [0.95, 0.10, 0.10] : (selected ? [1.0, 0.90, 0.10] : [0.10, 0.12, 0.16]), vp);
  }

  setStatus(`WebGL OK · ${L10N.cargoList.toLowerCase()}: ${state.cargo.length} · canvas: ${canvas.width}×${canvas.height}`);
}
function render() {
  renderScene();
  requestAnimationFrame(render);
}

function cargoAabb(item, nx = item.x, nz = item.z, length = item.length, width = item.width, ny = item.y, height = item.height) {
  return { minX: nx, maxX: nx + length, minY: ny, maxY: ny + height, minZ: nz, maxZ: nz + width };
}
function intersects(a, b) {
  return !(a.maxX <= b.minX || a.minX >= b.maxX || a.maxY <= b.minY || a.minY >= b.maxY || a.maxZ <= b.minZ || a.minZ >= b.maxZ);
}
function sameFootprint(a, x, z, length, width) {
  return Math.abs(a.x - x) < 0.01 && Math.abs(a.z - z) < 0.01 && Math.abs(a.length - length) < 0.01 && Math.abs(a.width - width) < 0.01;
}
function hasStackSupport(item, x, z, y, length, width, items) {
  if (y <= 0) return true;
  if (!item.stackable) return false;
  const maxStack = Math.max(1, Number(item.maxStack || 1));
  const sameColumn = items.filter(o => o.id !== item.id && sameFootprint(o, x, z, length, width));
  const below = sameColumn.find(o => Math.abs((o.y + o.height) - y) < 0.01 && o.stackable);
  if (!below) return false;
  const layersBelow = sameColumn.filter(o => o.y < y + 0.01).length;
  return layersBelow < maxStack;
}
function canPlaceAgainst(item, x, z, y = item.y, length = item.length, width = item.width, height = item.height, items = state.cargo) {
  if (x < 0 || z < 0 || y < 0) return false;
  if (x + length > state.space.length || z + width > state.space.width || y + height > state.space.height) return false;
  if (!hasStackSupport(item, x, z, y, length, width, items)) return false;
  const box = cargoAabb(item, x, z, length, width, y, height);
  return !items.some(other => other.id !== item.id && !other.unloaded && intersects(box, cargoAabb(other)));
}
function canPlace(item, x, z, length = item.length, width = item.width, y = item.y) {
  return canPlaceAgainst(item, x, z, y, length, width, item.height, state.cargo);
}
function moveCargo(id, x, z) {
  const item = state.cargo.find(c => c.id === id);
  if (!item) return false;
  const nx = clamp(snapCm(x), 0, state.space.length - item.length);
  const nz = clamp(snapCm(z), 0, state.space.width - item.width);
  if (!canPlace(item, nx, nz)) return false;
  item.x = nx; item.z = nz; item.unloaded = false; state.dirty = true; updateUI(); return true;
}
function rotateSelected() {
  const item = state.cargo.find(c => c.id === state.selectedId);
  if (!item || !item.rotatable) return;
  const nl = item.width, nw = item.length;
  if (item.unloaded) {
    item.length = nl; item.width = nw; item.rotationY = item.rotationY === 90 ? 0 : 90;
    state.dirty = true; updateUI(); return;
  }
  const nx = clamp(item.x, 0, state.space.length - nl);
  const nz = clamp(item.z, 0, state.space.width - nw);
  if (!canPlace(item, nx, nz, nl, nw, item.y)) return;
  item.length = nl; item.width = nw; item.x = nx; item.z = nz; item.rotationY = item.rotationY === 90 ? 0 : 90; state.dirty = true; updateUI();
}
function deleteCargo(id) {
  const item = state.cargo.find(c => c.id === id);
  if (!item) return;
  if (item.y > 0) {
    // deleting a stacked item is safe. If it supports something above, delete the whole upper part of that column.
    state.cargo = state.cargo.filter(c => !(sameFootprint(c, item.x, item.z, item.length, item.width) && c.y >= item.y));
  } else {
    const hasAbove = state.cargo.some(c => c.id !== id && sameFootprint(c, item.x, item.z, item.length, item.width) && c.y > item.y);
    if (hasAbove && !confirm(APP_LANG === 'en' ? 'This item has cargo stacked on it. Remove the whole column?' : APP_LANG === 'de' ? 'Auf dieser Position befindet sich weitere Ladung. Gesamte Säule entfernen?' : 'Ta pozycja ma ładunki na sobie. Usunąć całą kolumnę?')) return;
    state.cargo = state.cargo.filter(c => !(sameFootprint(c, item.x, item.z, item.length, item.width) && c.y >= item.y));
  }
  if (!state.cargo.some(c => c.id === state.selectedId)) state.selectedId = null;
  state.dirty = true;
  updateUI();
}

function rotateCargoById(id) {
  state.selectedId = id;
  hideCargoContextMenu(false);
  rotateSelected();
}
function showCargoContextMenu(ev, item) {
  const menu = $('cargoContextMenu');
  if (!menu || !item) return;
  state.selectedId = item.id;
  state.contextMenu.visible = true;
  state.contextMenu.itemId = item.id;

  const workspace = document.querySelector('.workspace');
  const rect = workspace.getBoundingClientRect();
  const menuWidth = 170;
  const menuHeight = 132;
  const x = clamp(ev.clientX - rect.left, 8, Math.max(8, rect.width - menuWidth - 8));
  const y = clamp(ev.clientY - rect.top, 60, Math.max(60, rect.height - menuHeight - 8));

  state.contextMenu.x = x;
  state.contextMenu.y = y;
  menu.style.left = `${x}px`;
  menu.style.top = `${y}px`;
  menu.classList.add('open');
  menu.setAttribute('aria-hidden', 'false');
  updateUI();
}
function hideCargoContextMenu(update = true) {
  const menu = $('cargoContextMenu');
  state.contextMenu.visible = false;
  state.contextMenu.itemId = null;
  if (menu) {
    menu.classList.remove('open');
    menu.setAttribute('aria-hidden', 'true');
  }
  if (update) updateUI();
}
function getMouseRay(ev) {
  const rect = canvas.getBoundingClientRect();
  const x = ((ev.clientX - rect.left) / rect.width) * 2 - 1;
  const y = 1 - ((ev.clientY - rect.top) / rect.height) * 2;
  const { basis } = getViewProjection();
  const aspect = canvas.width / canvas.height;
  const tan = Math.tan(45 * DEG / 2);
  const dir = norm(add(add(basis.forward, mul(basis.right, x * tan * aspect)), mul(basis.up, y * tan)));
  return { origin: basis.eye, dir };
}
function intersectPlaneY(ray, y = 0) {
  const denom = ray.dir[1];
  if (Math.abs(denom) < 0.0001) return null;
  const t = (y - ray.origin[1]) / denom;
  if (t < 0) return null;
  return add(ray.origin, mul(ray.dir, t));
}
function intersectAabb(ray, item) {
  const min = [cm(item.x), cm(item.y), cm(item.z)];
  const max = [cm(item.x + item.length), cm(item.y + item.height), cm(item.z + item.width)];
  let tmin = -Infinity, tmax = Infinity;
  for (let i = 0; i < 3; i++) {
    if (Math.abs(ray.dir[i]) < 0.00001) {
      if (ray.origin[i] < min[i] || ray.origin[i] > max[i]) return null;
    } else {
      let t1 = (min[i] - ray.origin[i]) / ray.dir[i];
      let t2 = (max[i] - ray.origin[i]) / ray.dir[i];
      if (t1 > t2) [t1, t2] = [t2, t1];
      tmin = Math.max(tmin, t1);
      tmax = Math.min(tmax, t2);
      if (tmin > tmax) return null;
    }
  }
  return tmin >= 0 ? tmin : tmax >= 0 ? tmax : null;
}
function pickCargo(ev) {
  const ray = getMouseRay(ev);
  let best = null;
  for (const item of state.cargo) {
    const t = intersectAabb(ray, item);
    if (t !== null && (!best || t < best.t)) best = { item, t };
  }
  return best?.item || null;
}

function makeCargoFromTemplate(t, index, colorIndex = 0) {
  return {
    id: uid('cargo'),
    name: t.name,
    baseName: t.name,
    originalLength: +t.length,
    originalWidth: +t.width,
    length: +t.length,
    width: +t.width,
    height: +t.height,
    weight: +t.weight,
    color: t.color || COLORS[colorIndex % COLORS.length],
    x: 0,
    y: 0,
    z: 0,
    rotationY: 0,
    rotatable: t.rotatable !== false,
    stackable: !!t.stackable,
    maxStack: Math.max(1, Number(t.maxStack || 1)),
    groupKey: t.groupKey || `${t.name}|${t.length}|${t.width}|${t.height}|${t.weight}|${!!t.stackable}|${t.maxStack || 1}`,
    itemNo: index + 1
  };
}
function expandTemplates(templates) {
  const out = [];
  templates.forEach((t, ti) => {
    const qty = Math.max(1, Number(t.quantity || 1));
    for (let i = 0; i < qty; i++) {
      const item = makeCargoFromTemplate(t, i, ti);
      item.name = qty > 1 ? `${t.name} ${i + 1}` : t.name;
      out.push(item);
    }
  });
  return out;
}
function templateOrientations(t) {
  const base = { length: +t.length, width: +t.width, rotationY: 0 };
  const rotated = { length: +t.width, width: +t.length, rotationY: 90 };
  const arr = [base];
  if (t.rotatable !== false && Math.abs(base.length - rotated.length) > 0.01) arr.push(rotated);
  return arr;
}
function stackLayersFor(t) {
  const layersByHeight = Math.max(1, Math.floor(state.space.height / (+t.height || 1)));
  return t.stackable ? Math.max(1, Math.min(Number(t.maxStack || 1), layersByHeight)) : 1;
}
function makePackingColumns(templates) {
  const columns = [];
  templates.forEach((raw, ti) => {
    const t = {
      ...raw,
      quantity: Math.max(1, Number(raw.quantity || 1)),
      length: +raw.length,
      width: +raw.width,
      height: +raw.height,
      weight: +raw.weight,
      stackable: !!raw.stackable,
      maxStack: Math.max(1, Number(raw.maxStack || 1)),
      color: raw.color || COLORS[ti % COLORS.length],
      groupKey: raw.groupKey || `${raw.name}|${raw.length}|${raw.width}|${raw.height}|${raw.weight}|${!!raw.stackable}|${raw.maxStack || 1}`,
      templateIndex: ti
    };
    const maxLayers = stackLayersFor(t);
    let left = t.quantity;
    while (left > 0) {
      const stackCount = t.stackable ? Math.min(maxLayers, left) : 1;
      columns.push({
        template: t,
        stackCount,
        area: t.length * t.width,
        maxSide: Math.max(t.length, t.width),
        minSide: Math.min(t.length, t.width)
      });
      left -= stackCount;
    }
  });

  // Duże i trudne elementy jako pierwsze, ale bez wymuszania jednej orientacji.
  columns.sort((a, b) =>
    (b.area - a.area) ||
    (b.maxSide - a.maxSide) ||
    (b.stackCount - a.stackCount) ||
    (a.template.templateIndex - b.template.templateIndex)
  );
  return columns;
}
function footprintIntersects(a, b) {
  return !(a.x + a.length <= b.x || a.x >= b.x + b.length || a.z + a.width <= b.z || a.z >= b.z + b.width);
}
function canPlaceFootprint(rect, placed) {
  if (rect.x < 0 || rect.z < 0) return false;
  if (rect.x + rect.length > state.space.length || rect.z + rect.width > state.space.width) return false;
  if (rect.height > state.space.height) return false;
  return !placed.some(p => footprintIntersects(rect, p));
}
function uniqueSortedNumbers(values) {
  return [...new Set(values.map(v => Math.round(v * 1000) / 1000))].filter(v => v >= -0.001).sort((a, b) => a - b);
}
function scorePlacement(rect, placed) {
  const currentMaxX = placed.length ? Math.max(...placed.map(p => p.x + p.length)) : 0;
  const newMaxX = Math.max(currentMaxX, rect.x + rect.length);
  const touchesLeft = rect.x === 0 ? 1 : 0;
  const touchesBack = rect.z === 0 ? 1 : 0;
  const touchesRight = Math.abs(rect.x + rect.length - state.space.length) < 0.01 ? 1 : 0;
  const touchesSide = Math.abs(rect.z + rect.width - state.space.width) < 0.01 ? 1 : 0;
  const edgeContact = touchesLeft + touchesBack + touchesRight + touchesSide;

  // Sąsiedztwo nagradza zwarte układanie pasami, a nie chaotyczne dziury.
  let neighborContact = 0;
  for (const p of placed) {
    const zOverlap = Math.max(0, Math.min(rect.z + rect.width, p.z + p.width) - Math.max(rect.z, p.z));
    const xOverlap = Math.max(0, Math.min(rect.x + rect.length, p.x + p.length) - Math.max(rect.x, p.x));
    if (Math.abs(rect.x - (p.x + p.length)) < 0.01 || Math.abs((rect.x + rect.length) - p.x) < 0.01) neighborContact += zOverlap;
    if (Math.abs(rect.z - (p.z + p.width)) < 0.01 || Math.abs((rect.z + rect.width) - p.z) < 0.01) neighborContact += xOverlap;
  }

  // Kolejność: minimalny LDM, potem możliwie najbliżej początku, potem zwarte ściany/sąsiedzi.
  return [
    newMaxX,
    rect.x,
    rect.z,
    -neighborContact,
    -edgeContact,
    rect.rotationY ? 0.001 : 0
  ];
}
function compareScore(a, b) {
  for (let i = 0; i < a.length; i++) {
    if (Math.abs(a[i] - b[i]) > 0.0001) return a[i] - b[i];
  }
  return 0;
}
function findBestColumnPlacement(column, placed) {
  const xs = [0];
  const zs = [0];
  placed.forEach(p => {
    xs.push(p.x, p.x + p.length);
    zs.push(p.z, p.z + p.width);
  });

  const xCandidates = uniqueSortedNumbers(xs);
  const zCandidates = uniqueSortedNumbers(zs);
  let best = null;

  for (const orient of templateOrientations(column.template)) {
    for (const x of xCandidates) {
      for (const z of zCandidates) {
        const rect = {
          x: snapCm(x),
          z: snapCm(z),
          length: orient.length,
          width: orient.width,
          height: column.stackCount * column.template.height,
          rotationY: orient.rotationY,
          column
        };
        if (!canPlaceFootprint(rect, placed)) continue;
        const score = scorePlacement(rect, placed);
        if (!best || compareScore(score, best.score) < 0) best = { ...rect, score };
      }
    }
  }
  return best;
}
function pushItemsFromColumnRect(rect, counters, placedItems, unloaded = false) {
  const column = rect.column;
  const t = column.template;
  const countKey = t.groupKey;
  let counter = counters.get(countKey) || 0;
  for (let layer = 0; layer < column.stackCount; layer++) {
    counter += 1;
    const item = makeCargoFromTemplate(t, counter - 1, t.templateIndex);
    item.name = t.quantity > 1 ? `${t.name} ${counter}` : t.name;
    item.length = rect.length;
    item.width = rect.width;
    item.rotationY = rect.rotationY;
    item.x = rect.x;
    item.z = rect.z;
    item.y = layer * t.height;
    item.stackable = !!t.stackable;
    item.maxStack = Math.max(1, Number(t.maxStack || 1));
    item.groupKey = t.groupKey;
    item.unloaded = !!unloaded;
    placedItems.push(item);
  }
  counters.set(countKey, counter);
}


function autoPackSingleTemplateExact(templates) {
  const raw = { ...templates[0] };
  const columns = makePackingColumns([raw]);
  if (!columns.length) return false;

  const orientations = templateOrientations(raw);
  const widthLimit = state.space.width;
  const best = { score: null, layout: null, skipped: null };

  // Dla jednorodnego ładunku szukamy najlepszego układu pasów po szerokości auta.
  // Dzięki temu van 420x220 potrafi zrobić 1 pas 120 cm + 1 pas 80 cm dla EP,
  // a dla 120x110 wybiera dwa pasy po 110 cm zamiast błędnego ustawienia wszystkich tak samo.
  const max0 = Math.floor(widthLimit / orientations[0].width);
  const max1 = orientations.length > 1 ? Math.floor(widthLimit / orientations[1].width) : 0;

  function buildLaneList(counts) {
    const lanes = [];
    let z = 0;
    counts.forEach((count, oi) => {
      const orient = orientations[oi];
      for (let i = 0; i < count; i++) {
        lanes.push({
          orient,
          z,
          width: orient.width,
          length: orient.length,
          capacity: Math.floor(state.space.length / orient.length),
          nextX: 0,
          placed: 0
        });
        z += orient.width;
      }
    });
    return lanes;
  }

  function evaluateCounts(counts) {
    const totalWidth = counts.reduce((sum, c, i) => sum + c * orientations[i].width, 0);
    if (totalWidth <= 0 || totalWidth > widthLimit) return;
    const lanes = buildLaneList(counts).filter(l => l.capacity > 0);
    if (!lanes.length) return;

    const placements = [];
    const skipped = [];
    for (const column of columns) {
      let bestLane = null;
      for (const lane of lanes) {
        if (lane.placed >= lane.capacity) continue;
        const endX = lane.nextX + lane.length;
        const score = [endX, lane.nextX, lane.z, lane.width];
        if (!bestLane || compareScore(score, bestLane.score) < 0) bestLane = { lane, score };
      }
      if (!bestLane) {
        skipped.push(column);
        continue;
      }
      const lane = bestLane.lane;
      placements.push({
        x: lane.nextX,
        z: lane.z,
        length: lane.length,
        width: lane.width,
        height: column.stackCount * column.template.height,
        rotationY: lane.orient.rotationY,
        column
      });
      lane.nextX += lane.length;
      lane.placed += 1;
    }

    const packedCount = placements.reduce((sum, p) => sum + p.column.stackCount, 0);
    const maxX = placements.length ? Math.max(...placements.map(p => p.x + p.length)) : 0;
    const usedWidth = totalWidth;
    const wasteWidth = widthLimit - usedWidth;
    const score = [
      -packedCount,
      maxX,
      wasteWidth,
      -usedWidth
    ];

    if (!best.score || compareScore(score, best.score) < 0) {
      best.score = score;
      best.layout = placements;
      best.skipped = skipped;
    }
  }

  if (orientations.length === 1) {
    for (let c0 = 1; c0 <= max0; c0++) evaluateCounts([c0]);
  } else {
    for (let c0 = 0; c0 <= max0; c0++) {
      for (let c1 = 0; c1 <= max1; c1++) {
        if (c0 === 0 && c1 === 0) continue;
        evaluateCounts([c0, c1]);
      }
    }
  }

  if (!best.layout) return false;

  const placedItems = [];
  const counters = new Map();
  for (const rect of best.layout) pushItemsFromColumnRect(rect, counters, placedItems, false);
  if (best.skipped?.length) placeSkippedColumnsOutside(best.skipped, counters, placedItems);

  state.cargo = placedItems;
  state.selectedId = placedItems[0]?.id || null;
  state.dirty = true;
  updateCameraTarget();
  updateUI();
  if (best.skipped?.length) {
    setStatus(`WebGL OK · poza autem: ${best.skipped.length} kolumn`);
  }
  return true;
}

function placeSkippedColumnsOutside(skipped, counters, placedItems) {
  let outsideX = 0;
  let laneDepth = 0;
  let laneZStart = -200; // 200 cm od lewej krawędzi auta
  const gap = 10;
  const laneGap = 35;

  for (const column of skipped) {
    // Dla placu odkładczego wybieramy orientację z krótszym wymiarem wzdłuż auta,
    // żeby lista nadmiarowa była czytelna i nie uciekała daleko poza widok.
    const orient = templateOrientations(column.template)
      .sort((a, b) => (a.length - b.length) || (a.width - b.width))[0];
    const height = column.stackCount * column.template.height;
    if (outsideX + orient.length > state.space.length && outsideX > 0) {
      outsideX = 0;
      laneZStart -= laneDepth + laneGap;
      laneDepth = 0;
    }
    const rect = {
      x: outsideX,
      z: laneZStart - orient.width,
      length: orient.length,
      width: orient.width,
      height,
      rotationY: orient.rotationY,
      column
    };
    pushItemsFromColumnRect(rect, counters, placedItems, true);
    outsideX += orient.length + gap;
    laneDepth = Math.max(laneDepth, orient.width);
  }
}

function orderColumnsForSolver(columns) {
  const clone = (arr) => arr.map(c => ({ ...c }));

  function templateAspect(c) {
    const l = +c.template.length || 1;
    const w = +c.template.width || 1;
    return Math.max(l, w) / Math.max(1, Math.min(l, w));
  }

  const variants = [];

  // 1. Dotychczasowa kolejność: duże powierzchnie jako pierwsze.
  variants.push(clone(columns));

  // 2. Długie i wąskie elementy jako pierwsze.
  // To naprawia układy typu: 100x100, 100x100, 400x20, 400x20,
  // gdzie krótki greedy blokował pasy dla długich elementów.
  variants.push(clone(columns).sort((a, b) =>
    (templateAspect(b) - templateAspect(a)) ||
    (b.maxSide - a.maxSide) ||
    (a.minSide - b.minSide) ||
    (b.area - a.area)
  ));

  // 3. Najdłuższy bok jako pierwszy.
  variants.push(clone(columns).sort((a, b) =>
    (b.maxSide - a.maxSide) ||
    (a.minSide - b.minSide) ||
    (b.area - a.area)
  ));

  // 4. Najwęższe elementy jako pierwsze, gdy są bardzo długie.
  variants.push(clone(columns).sort((a, b) =>
    (a.minSide - b.minSide) ||
    (b.maxSide - a.maxSide) ||
    (b.area - a.area)
  ));

  // 5. Wysokie / niestackowalne wcześniej, żeby nie robiły kolizji z kolumnami.
  variants.push(clone(columns).sort((a, b) =>
    ((b.template.height * b.stackCount) - (a.template.height * a.stackCount)) ||
    (b.area - a.area)
  ));

  // Usuwamy duplikaty kolejności, żeby nie liczyć tego samego kilka razy.
  const seen = new Set();
  return variants.filter(arr => {
    const key = arr.map(c => `${c.template.groupKey}:${c.stackCount}:${c.maxSide}:${c.minSide}`).join('|');
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function packColumnsInOrder(columns) {
  const placedColumns = [];
  const skipped = [];

  for (const column of columns) {
    const rect = findBestColumnPlacement(column, placedColumns);
    if (!rect) {
      skipped.push(column);
      continue;
    }
    placedColumns.push(rect);
  }

  return { placedColumns, skipped };
}

function scorePackedLayout(result) {
  const placedUnits = result.placedColumns.reduce((sum, p) => sum + p.column.stackCount, 0);
  const skippedUnits = result.skipped.reduce((sum, p) => sum + p.stackCount, 0);
  const maxX = result.placedColumns.length ? Math.max(...result.placedColumns.map(p => p.x + p.length)) : 0;
  const usedArea = result.placedColumns.reduce((sum, p) => sum + p.length * p.width, 0);
  const usedWidthAtFront = result.placedColumns
    .filter(p => p.x < 0.01)
    .reduce((sum, p) => Math.max(sum, p.z + p.width), 0);

  // Najważniejsze: zmieścić jak najwięcej sztuk, potem minimalny LDM,
  // potem większe wykorzystanie powierzchni i szerokości.
  return [
    skippedUnits,
    -placedUnits,
    maxX,
    -usedArea,
    -usedWidthAtFront
  ];
}

function chooseBestMixedLayout(columns) {
  let best = null;

  for (const ordered of orderColumnsForSolver(columns)) {
    const result = packColumnsInOrder(ordered);
    const score = scorePackedLayout(result);

    if (!best || compareScore(score, best.score) < 0) {
      best = { ...result, score };
    }

    // Jeśli wszystko weszło i LDM jest bardzo dobry, nie trzeba dalej przesadnie szukać.
    if (result.skipped.length === 0 && score[2] <= state.space.length * 0.55) {
      // Nie robimy break, bo inna kolejność może jeszcze zmniejszyć LDM,
      // ale obecny wynik zostaje kandydatem.
    }
  }

  return best;
}

function autoPackTemplates(templates) {
  // Dla jednorodnego ładunku używamy dokładniejszego solvera pasów.
  if (templates.length === 1 && autoPackSingleTemplateExact(templates)) return;

  const columns = makePackingColumns(templates);
  const best = chooseBestMixedLayout(columns);

  const placedItems = [];
  const counters = new Map();

  for (const rect of best.placedColumns) {
    pushItemsFromColumnRect(rect, counters, placedItems, false);
  }

  if (best.skipped.length) {
    placeSkippedColumnsOutside(best.skipped, counters, placedItems);
  }

  state.cargo = placedItems;
  state.selectedId = placedItems[0]?.id || null;
  state.dirty = true;
  updateCameraTarget();
  updateUI();

  if (best.skipped.length) {
    setStatus(`WebGL OK · poza autem: ${best.skipped.length} kolumn`);
    console.warn('Poza autem ustawiono kolumny ładunku:', best.skipped.map(s => s.template.name));
  }
}


function asNumber(v, fallback = 0) {
  const n = Number(String(v ?? '').replace(',', '.').replace(/[^0-9.\-]/g, ''));
  return Number.isFinite(n) ? n : fallback;
}
function parseBoolStack(value) {
  return /tak|yes|true|stack|stak|pi[eę]tr|warstw|mo[żz]na/i.test(String(value ?? ''));
}
function normalizeAiItems(items) {
  const out = [];
  (items || []).forEach((raw, idx) => {
    const quantity = Math.max(1, Math.round(asNumber(raw.quantity ?? raw.qty ?? raw.ilosc ?? raw['ilość'], 1)));
    const name = String(raw.name ?? raw.nazwa ?? `Ładunek ${idx + 1}`).trim() || `Ładunek ${idx + 1}`;
    const length = asNumber(raw.length ?? raw.dlugosc ?? raw['długość'], 0);
    const width = asNumber(raw.width ?? raw.szerokosc ?? raw['szerokość'], 0);
    const height = asNumber(raw.height ?? raw.wysokosc ?? raw['wysokość'], 0);
    const weight = asNumber(raw.weight ?? raw.waga, 0);
    if (!length || !width || !height || !weight) return;
    out.push({
      name,
      quantity,
      length,
      width,
      height,
      weight,
      stackable: raw.stackable === true || parseBoolStack(raw.stackable ?? raw.stackowane ?? raw.stack),
      maxStack: raw.maxStack ? Math.max(1, Math.round(asNumber(raw.maxStack, 1))) : 2,
      color: COLORS[idx % COLORS.length]
    });
  });
  return out;
}
function templatesToMemoryLines(templates) {
  return templates.map(t => [
    Math.round(t.quantity || 1),
    t.name,
    Math.round(t.length),
    Math.round(t.width),
    Math.round(t.height),
    Math.round(t.weight),
    t.stackable ? 'tak' : 'nie'
  ].join(', ')).join('\n\n');
}
function parseNormalizedCargoLines(text) {
  const templates = [];
  const chunks = text.split(/\n+/).map(l => l.trim()).filter(Boolean);
  chunks.forEach((line, idx) => {
    const parts = line.split(/[,;|]/).map(p => p.trim()).filter(Boolean);
    if (parts.length >= 7) {
      const quantity = asNumber(parts[0], 1);
      const name = parts[1] || `Ładunek ${idx + 1}`;
      const length = asNumber(parts[2], 0);
      const width = asNumber(parts[3], 0);
      const height = asNumber(parts[4], 0);
      const weight = asNumber(parts[5], 0);
      if (length && width && height && weight) {
        templates.push({ name, quantity, length, width, height, weight, stackable: parseBoolStack(parts[6]), maxStack: 2, color: COLORS[idx % COLORS.length] });
      }
    }
  });
  return templates;
}
function parseLooseCargoText(text) {
  const templates = [];
  const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  lines.forEach((line, idx) => {
    // Przykłady: "8 europalet 120x80x150 300 kg stack", "2 x Pallet 120 x 80 x 150 / 300 kg"
    const m = line.match(/(?:^|\b)(\d+)\s*(?:x|szt\.?|pcs|palet|ep)?\s*([\p{L}0-9 ._\-\/]+?)\s*[=:,-]?\s*(\d+(?:[.,]\d+)?)\s*[x×]\s*(\d+(?:[.,]\d+)?)\s*[x×]\s*(\d+(?:[.,]\d+)?)(?:\s*cm|\s*cmb|\s*)[^0-9]*(\d+(?:[.,]\d+)?)\s*(?:kg|kgs|kilogram)/iu);
    if (!m) return;
    templates.push({
      quantity: asNumber(m[1], 1),
      name: (m[2] || `Ładunek ${idx + 1}`).trim().replace(/^(x|szt\.?|pcs)\s+/i, '') || `Ładunek ${idx + 1}`,
      length: asNumber(m[3], 0),
      width: asNumber(m[4], 0),
      height: asNumber(m[5], 0),
      weight: asNumber(m[6], 0),
      stackable: parseBoolStack(line),
      maxStack: 2,
      color: COLORS[idx % COLORS.length]
    });
  });
  return templates;
}
function fallbackAnalyzeCargoText(text) {
  const normalized = parseNormalizedCargoLines(text);
  if (normalized.length) return normalized;
  const stc = parseStc(text).map((t, i) => ({ ...t, stackable: parseBoolStack(text), maxStack: 2, color: COLORS[i % COLORS.length] }));
  if (stc.length) return stc;
  return parseLooseCargoText(text);
}

function extractJsonArrayOrObject(text) {
  const cleaned = String(text || '')
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/```$/i, '')
    .trim();

  try {
    return JSON.parse(cleaned);
  } catch (_) {}

  const objectStart = cleaned.indexOf('{');
  const objectEnd = cleaned.lastIndexOf('}');
  if (objectStart >= 0 && objectEnd > objectStart) {
    try { return JSON.parse(cleaned.slice(objectStart, objectEnd + 1)); } catch (_) {}
  }

  const arrayStart = cleaned.indexOf('[');
  const arrayEnd = cleaned.lastIndexOf(']');
  if (arrayStart >= 0 && arrayEnd > arrayStart) {
    try { return JSON.parse(cleaned.slice(arrayStart, arrayEnd + 1)); } catch (_) {}
  }

  return null;
}

function parseAiCsvLines(text) {
  const templates = [];
  const lines = String(text || '')
    .split(/\n+/)
    .map(l => l.trim())
    .filter(Boolean);

  lines.forEach((line, idx) => {
    const clean = line
      .replace(/^\s*[-*]\s*/, '')
      .replace(/\[|\]/g, '')
      .trim();

    const parts = clean.split(/[,;|]/).map(p => p.trim()).filter(Boolean);
    if (parts.length < 7) return;

    const quantity = Math.max(1, Math.round(asNumber(parts[0], 1)));
    const name = parts[1] || `Ładunek ${idx + 1}`;
    const length = asNumber(parts[2], 0);
    const width = asNumber(parts[3], 0);
    const height = asNumber(parts[4], 0);
    const weight = asNumber(parts[5], 0);

    if (!length || !width || !height || !weight) return;

    templates.push({
      quantity,
      name,
      length,
      width,
      height,
      weight,
      stackable: parseBoolStack(parts[6]),
      maxStack: parseBoolStack(parts[6]) ? 2 : 1,
      color: COLORS[idx % COLORS.length]
    });
  });

  return templates;
}

function buildGeminiPrompt(text) {
  return [
    'Jesteś asystentem do porządkowania danych logistycznych.',
    'Z dowolnego tekstu użytkownika wyciągnij listę ładunków do planera 3D.',
    'Użytkownik może wkleić tekst chaotyczny: STC, email, tabelę, listę palet, opis słowny, mieszane jednostki, literówki.',
    'Twoje zadanie: uporządkuj to do prostego formatu. Nie licz LDM i nie układaj ładunku.',
    '',
    'ZWRÓĆ WYŁĄCZNIE linie tekstu, bez markdown, bez tabeli, bez komentarzy.',
    'Każda pozycja ma być od nowego akapitu w dokładnym formacie:',
    '[ilość], [nazwa ładunku], [długość cm], [szerokość cm], [wysokość cm], [waga kg], [czy stackowane tak/nie]',
    '',
    'Zasady:',
    '- wymiary zawsze przelicz na centymetry',
    '- waga zawsze w kilogramach',
    '- jeśli ilość nie jest jasna, wpisz 1',
    '- jeśli nazwa nie jest jasna, wpisz Paleta albo Ładunek',
    '- jeśli stackowanie nie jest jawnie podane, wpisz nie',
    '- jeśli jest STC: 1 Pallet = 120 x 80 x 150 cms / 300 Kgs, wynik ma być: 1, Pallet, 120, 80, 150, 300, nie',
    '- jeśli jest kilka identycznych pozycji, możesz je zsumować tylko gdy mają identyczne wymiary, wagę i stackowanie',
    '- nie dodawaj żadnych pól poza wskazanym formatem',
    '',
    'Dane wejściowe:',
    text
  ].join('\n');
}

async function listGeminiModels(apiKey) {
  try {
    const response = await fetch(`${GEMINI_API_BASE}/models?key=${encodeURIComponent(apiKey)}`);
    if (!response.ok) return [];
    const payload = await response.json().catch(() => ({}));
    return (payload.models || [])
      .filter(m => (m.supportedGenerationMethods || []).includes('generateContent'))
      .map(m => String(m.name || '').replace(/^models\//, ''))
      .filter(Boolean);
  } catch {
    return [];
  }
}

async function callGeminiModel(model, prompt, apiKey) {
  const url = `${GEMINI_API_BASE}/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [
        {
          role: 'user',
          parts: [{ text: prompt }]
        }
      ],
      generationConfig: {
        temperature: 0,
        responseMimeType: 'text/plain'
      }
    })
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const msg = payload?.error?.message || `HTTP ${response.status}`;
    throw new Error(`${model}: ${msg}`);
  }

  const content = (payload?.candidates || [])
    .flatMap(c => c?.content?.parts || [])
    .map(p => p.text || '')
    .join('\n')
    .trim();

  if (!content) throw new Error(`${model}: pusta odpowiedź`);
  return content;
}

async function callAiForCargo(text, apiKey) {
  const prompt = buildGeminiPrompt(text);
  const available = await listGeminiModels(apiKey);

  const dynamic = available
    .filter(m => /^gemini/i.test(m))
    .filter(m => !/embedding|imagen|veo|tts|aqa|vision/i.test(m))
    .sort((a, b) => {
      const score = (m) =>
        (/2\.5-flash\b/.test(m) ? 0 :
         /2\.5-flash-lite/.test(m) ? 1 :
         /2\.0-flash/.test(m) ? 2 :
         /1\.5-flash/.test(m) ? 3 :
         /pro/.test(m) ? 4 : 5);
      return score(a) - score(b);
    });

  const models = [...new Set([...GEMINI_MODEL_CANDIDATES, ...dynamic])];
  const errors = [];

  for (const model of models) {
    try {
      setAiStatus(APP_LANG === 'en' ? `Trying Gemini: ${model}...` : APP_LANG === 'de' ? `Gemini wird versucht: ${model}...` : `Próbuję Gemini: ${model}...`);
      const content = await callGeminiModel(model, prompt, apiKey);

      let templates = parseAiCsvLines(content);
      if (!templates.length) {
        const parsed = extractJsonArrayOrObject(content);
        if (parsed) templates = normalizeAiItems(parsed.items || parsed);
      }

      if (!templates.length) throw new Error(`${model}: ${APP_LANG === 'en' ? 'response without recognizable positions' : APP_LANG === 'de' ? 'Antwort ohne erkennbare Positionen' : 'odpowiedź bez rozpoznawalnych pozycji'}`);

      return { templates, raw: content, model };
    } catch (err) {
      errors.push(err.message || String(err));
      console.warn('Gemini model failed:', err.message || err);
    }
  }

  throw new Error(`${APP_LANG === 'en' ? 'No Gemini model worked' : APP_LANG === 'de' ? 'Kein Gemini-Modell hat funktioniert' : 'Żaden model Gemini nie zadziałał'}. ${errors.slice(-3).join(' | ')}`);
}

const GEMINI_KEY_SESSION = 'mkulczyk_loadplanner_gemini_key';

function getGeminiApiKey() {
  const fieldValue = $('geminiApiKey')?.value?.trim() || '';
  return fieldValue || sessionStorage.getItem(GEMINI_KEY_SESSION) || '';
}

function syncGeminiKeyStorage() {
  const key = $('geminiApiKey')?.value?.trim() || '';
  const remember = !!$('rememberGeminiKey')?.checked;
  if (remember && key) sessionStorage.setItem(GEMINI_KEY_SESSION, key);
  else sessionStorage.removeItem(GEMINI_KEY_SESSION);
}

function initGeminiKeyField() {
  const keyInput = $('geminiApiKey');
  const remember = $('rememberGeminiKey');
  if (!keyInput) return;
  const sessionKey = sessionStorage.getItem(GEMINI_KEY_SESSION) || '';
  if (sessionKey) {
    keyInput.value = sessionKey;
    if (remember) remember.checked = true;
  }
  keyInput.addEventListener('input', syncGeminiKeyStorage);
  remember?.addEventListener('change', syncGeminiKeyStorage);
}

function setAiStatus(text, kind = '') {
  const el = $('aiStatus');
  if (!el) return;
  el.className = `ai-status ${kind}`.trim();
  el.textContent = text;
}
function setAiLoading(loading) {
  const btn = $('analyzeAi');
  if (!btn) return;
  btn.disabled = !!loading;
  btn.classList.toggle('loading', !!loading);
  document.querySelector('.ai-panel')?.classList.toggle('ai-working', !!loading);
  const label = btn.querySelector('.btn-label');
  if (label) label.textContent = loading ? L10N.analyzing : L10N.analyze;
}


async function analyzeAiInput() {
  const text = $('aiInput')?.value?.trim() || '';
  const apiKey = getGeminiApiKey();
  if (!text) { setAiStatus(L10N.noText, 'error'); return; }
  if (!apiKey) { setAiStatus(L10N.noApi, 'error'); $('geminiApiKey')?.focus(); return; }

  syncGeminiKeyStorage();
  setAiLoading(true);
  setAiStatus(L10N.connecting);

  let templates = [];
  let rawAi = '';
  let usedModel = '';

  try {
    const result = await callAiForCargo(text, apiKey);
    templates = result.templates;
    rawAi = result.raw || '';
    usedModel = result.model || '';
  } catch (err) {
    setAiLoading(false);
    setAiStatus(tr(L10N.aiError, { error: err.message }), 'error');
    return;
  }

  const memory = templatesToMemoryLines(templates);
  if ($('aiMemory')) $('aiMemory').value = memory;
  localStorage.setItem(AI_MEMORY_KEY, memory);
  if (rawAi) console.log(`Surowa odpowiedź Gemini ${usedModel}:`, rawAi);

  if ($('aiReplace')?.checked !== false) autoPackTemplates(templates);
  else { state.cargo.push(...expandTemplates(templates)); repackExisting(); }

  setAiLoading(false);
  setAiStatus(tr(L10N.aiDone, { count: templates.length, model: usedModel }), 'ok');
}

function templatesFromCargo() {
  const map = new Map();
  state.cargo.forEach((c, i) => {
    const key = c.groupKey || `${c.baseName || c.name}|${c.originalLength || c.length}|${c.originalWidth || c.width}|${c.height}|${c.weight}|${!!c.stackable}|${c.maxStack || 1}|${c.color || COLORS[i % COLORS.length]}`;
    if (!map.has(key)) {
      map.set(key, {
        name: c.baseName || c.name.replace(/ \d+$/, ''),
        length: c.originalLength || c.length,
        width: c.originalWidth || c.width,
        height: c.height,
        weight: c.weight,
        quantity: 0,
        color: c.color || COLORS[i % COLORS.length],
    unloaded: !!c.unloaded,
        stackable: !!c.stackable,
        maxStack: Math.max(1, Number(c.maxStack || 1)),
        groupKey: key
      });
    }
    map.get(key).quantity += 1;
  });
  return [...map.values()];
}
function repackExisting() {
  if (!state.cargo.length) return updateUI();
  autoPackTemplates(templatesFromCargo());
}
function parseStc(text) {
  const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  const templates = [];
  lines.forEach((line, idx) => {
    const match = line.match(/(?:STC:\s*)?(\d+)\s*\([^)]*\)?\s*([^=]+?)\s*=\s*(\d+(?:[.,]\d+)?)\s*x\s*(\d+(?:[.,]\d+)?)\s*x\s*(\d+(?:[.,]\d+)?).*?\/\s*(\d+(?:[.,]\d+)?)\s*kgs?/i);
    if (!match) return;
    templates.push({
      name: (match[2] || cargoName(idx)).replace(/one/gi, '').trim() || cargoName(idx),
      quantity: Number(match[1]),
      length: Number(match[3].replace(',', '.')),
      width: Number(match[4].replace(',', '.')),
      height: Number(match[5].replace(',', '.')),
      weight: Number(match[6].replace(',', '.')),
      color: COLORS[idx % COLORS.length]
    });
  });
  return templates;
}
function calculateStats() {
  const totalItems = state.cargo.length;
  const loadedCargo = state.cargo.filter(c => !c.unloaded);
  const unloadedItems = totalItems - loadedCargo.length;
  const totalWeight = state.cargo.reduce((s, c) => s + c.weight, 0);
  const loadedWeight = loadedCargo.reduce((s, c) => s + c.weight, 0);
  const totalVolume = state.cargo.reduce((s, c) => s + c.length*c.width*c.height, 0) / 1_000_000;
  const loadedVolume = loadedCargo.reduce((s, c) => s + c.length*c.width*c.height, 0) / 1_000_000;
  const spaceVolume = state.space.length*state.space.width*state.space.height / 1_000_000;
  const usedLength = loadedCargo.length ? Math.max(...loadedCargo.map(c => c.x + c.length)) : 0;
  const ldm = usedLength / 100;
  const availableLdm = state.space.length / 100;
  const stacked = state.cargo.filter(c => c.y > 0).length;
  const vehicleName = state.space.label || inferSpaceLabel();
  return { totalItems, loadedItems: loadedCargo.length, unloadedItems, totalWeight, loadedWeight, totalVolume, loadedVolume, spaceVolume, usedLength, ldm, availableLdm, stacked, vehicleName };
}
function inferSpaceLabel() {
  if (state.space.length <= 490) return 'Van 8 EP';
  if (state.space.length <= 1000) return L10N.vehicleSolo;
  return L10N.vehicleTrailer;
}
function overLimitClass(value, limit) {
  return Number(value) > Number(limit || 0) ? ' class="stat-over"' : '';
}
function esc(v) {
  return String(v ?? '').replace(/[&<>"]/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[ch]));
}
function updateCargoList() {
  const el = $('cargoList');
  if (!el) return;
  if (!state.cargo.length) { el.innerHTML = `<div class="selected">${esc(L10N.noCargo)}</div>`; return; }
  el.innerHTML = state.cargo.map((c, i) => `
    <div class="cargo-row ${c.id === state.selectedId ? 'selected' : ''} ${c.unloaded ? 'unloaded' : ''}" data-id="${esc(c.id)}">
      <div class="cargo-row-main" data-action="select" data-id="${esc(c.id)}">
        <div class="cargo-row-title"><span class="cargo-dot" style="background:${esc(c.color || '#2563eb')}"></span>${i + 1}. ${esc(c.name)}</div>
        <div class="cargo-row-meta">${c.unloaded ? `<b>${L10N.outside}</b> · ` : ''}${Math.round(c.length)}×${Math.round(c.width)}×${Math.round(c.height)} cm · ${Math.round(c.weight)} kg<br>X ${Math.round(c.x)} · Z ${Math.round(c.z)} · Y ${Math.round(c.y)} · ${L10N.rotation.toLowerCase()} ${c.rotationY || 0}°${c.stackable ? ` · ${L10N.stacking.toLowerCase()} ${c.maxStack}x` : ''}</div>
      </div>
      <button class="cargo-mini-btn" data-action="rotate" data-id="${esc(c.id)}">${esc(L10N.rotate)}</button>
      <button class="cargo-mini-btn danger" data-action="delete" data-id="${esc(c.id)}">${esc(L10N.remove)}</button>
    </div>`).join('');
}
function updateUI() {
  const s = calculateStats();
  const statsEl = $('stats');
  if (statsEl) statsEl.innerHTML = `
    <div class="stat-chip"><span>${L10N.space}</span><strong>${esc(s.vehicleName)}</strong></div>
    <div class="stat-chip"><span>${L10N.items}</span><strong>${s.loadedItems} / ${s.totalItems}</strong></div>
    <div class="stat-chip"><span>${L10N.weight}</span><strong${overLimitClass(s.loadedWeight, state.space.maxWeight)}>${formatLocale(Math.round(s.loadedWeight))} / ${formatLocale(Math.round(state.space.maxWeight))} kg</strong></div>
    <div class="stat-chip"><span>CBM</span><strong${overLimitClass(s.loadedVolume, s.spaceVolume)}>${s.loadedVolume.toFixed(2)} / ${s.spaceVolume.toFixed(2)} m³</strong></div>
    <div class="stat-chip"><span>LDM</span><strong${overLimitClass(s.ldm, s.availableLdm)}>${s.ldm.toFixed(2)} / ${s.availableLdm.toFixed(2)} m</strong></div>`;
  const sel = state.cargo.find(c => c.id === state.selectedId);
  $('selectedInfo').innerHTML = sel ? `<b>${esc(sel.name)}</b><br>${sel.length} × ${sel.width} × ${sel.height} cm<br>${sel.weight} kg<br>X: ${Math.round(sel.x)} cm · Z: ${Math.round(sel.z)} cm · Y: ${Math.round(sel.y)} cm<br>${L10N.rotation}: ${sel.rotationY || 0}°<br>${L10N.status}: ${sel.unloaded ? L10N.excess : L10N.loaded}<br>${L10N.stacking}: ${sel.stackable ? `${L10N.yes}, max ${sel.maxStack}` : L10N.no}` : esc(L10N.none);
  updateCargoList();
  document.body.classList.toggle('planner-empty-list', !state.cargo.length);
}
function updateCameraTarget() {
  const cfg = getVehicleConfig();
  let minX = -cfg.cabLengthCm;
  let maxX = state.space.length;
  let minZ = 0;
  let maxZ = state.space.width;
  state.cargo.forEach(c => {
    minX = Math.min(minX, c.x);
    maxX = Math.max(maxX, c.x + c.length);
    minZ = Math.min(minZ, c.z);
    maxZ = Math.max(maxZ, c.z + c.width);
  });
  state.camera.target = [cm((minX + maxX) / 2), cm(state.space.height) * 0.30, cm((minZ + maxZ) / 2)];
  state.camera.distance = Math.max(cm(maxX - minX), cm(maxZ - minZ), cm(state.space.height)) * 1.25;
}
function setView(view) {
  updateCameraTarget();
  if (view === 'iso') { state.camera.yaw = -42 * DEG; state.camera.pitch = 25 * DEG; }
  if (view === 'top') { state.camera.yaw = -90 * DEG; state.camera.pitch = 89 * DEG; }
  if (view === 'side') { state.camera.yaw = -90 * DEG; state.camera.pitch = 8 * DEG; }
}

canvas.addEventListener('mousedown', (ev) => {
  state.interaction.lastX = ev.clientX;
  state.interaction.lastY = ev.clientY;
  const picked = pickCargo(ev);

  if (ev.button === 2 && picked) {
    ev.preventDefault();
    canvas.classList.remove('dragging');
    state.interaction.mode = 'none';
    showCargoContextMenu(ev, picked);
    return;
  }

  if (ev.button !== 2) hideCargoContextMenu(false);
  canvas.classList.add('dragging');

  if (picked && !ev.shiftKey && ev.button === 0) {
    state.selectedId = picked.id;
    const ray = getMouseRay(ev);
    const hit = intersectPlaneY(ray, 0);
    if (hit) {
      state.interaction.mode = 'dragCargo';
      state.interaction.dragOffset = [mToCm(hit[0]) - picked.x, mToCm(hit[2]) - picked.z];
    }
    updateUI();
    ev.preventDefault();
    return;
  }
  state.selectedId = picked ? picked.id : null;
  state.interaction.mode = ev.shiftKey || ev.button === 2 ? 'panCamera' : 'rotateCamera';
  updateUI();
});
window.addEventListener('mousemove', (ev) => {
  const dx = ev.clientX - state.interaction.lastX;
  const dy = ev.clientY - state.interaction.lastY;
  state.interaction.lastX = ev.clientX;
  state.interaction.lastY = ev.clientY;

  if (state.interaction.mode === 'rotateCamera') {
    state.camera.yaw -= dx * 0.006;
    state.camera.pitch = clamp(state.camera.pitch + dy * 0.004, -80 * DEG, 89 * DEG);
  } else if (state.interaction.mode === 'panCamera') {
    const { basis } = getCameraBasis();
    const scale = state.camera.distance * 0.0015;
    state.camera.target = add(state.camera.target, add(mul(basis.right, -dx * scale), mul(basis.up, dy * scale)));
  } else if (state.interaction.mode === 'dragCargo' && state.selectedId) {
    const hit = intersectPlaneY(getMouseRay(ev), 0);
    if (hit) moveCargo(state.selectedId, mToCm(hit[0]) - state.interaction.dragOffset[0], mToCm(hit[2]) - state.interaction.dragOffset[1]);
  }
});
window.addEventListener('mouseup', () => {
  canvas.classList.remove('dragging');
  state.interaction.mode = 'none';
});
canvas.addEventListener('contextmenu', ev => ev.preventDefault());
window.addEventListener('mousedown', (ev) => {
  const menu = $('cargoContextMenu');
  if (state.contextMenu?.visible && menu && !menu.contains(ev.target) && ev.target !== canvas && ev.button !== 2) hideCargoContextMenu();
});
canvas.addEventListener('wheel', (ev) => {
  ev.preventDefault();
  const factor = Math.exp(ev.deltaY * 0.001);
  state.camera.distance = clamp(state.camera.distance * factor, 1.5, 80);
}, { passive: false });
window.addEventListener('keydown', (ev) => {
  const item = state.cargo.find(c => c.id === state.selectedId);
  if (!item) return;
  const step = ev.shiftKey ? 20 : 5;
  if (ev.key === 'q' || ev.key === 'Q' || ev.key === 'e' || ev.key === 'E') rotateSelected();
  if (ev.key === 'Delete' || ev.key === 'Backspace') { deleteCargo(state.selectedId); }
  if (ev.key === 'ArrowLeft' || ev.key === 'a' || ev.key === 'A') moveCargo(item.id, item.x - step, item.z);
  if (ev.key === 'ArrowRight' || ev.key === 'd' || ev.key === 'D') moveCargo(item.id, item.x + step, item.z);
  if (ev.key === 'ArrowUp' || ev.key === 'w' || ev.key === 'W') moveCargo(item.id, item.x, item.z - step);
  if (ev.key === 'ArrowDown' || ev.key === 's' || ev.key === 'S') moveCargo(item.id, item.x, item.z + step);
});


function applySpaceValues(length, width, height, maxWeight, label = '') {
  $('spaceLength').value = length;
  $('spaceWidth').value = width;
  $('spaceHeight').value = height;
  $('spaceWeight').value = maxWeight;
  state.space.length = +length;
  state.space.width = +width;
  state.space.height = +height;
  state.space.maxWeight = +maxWeight;
  state.space.label = label || inferSpaceLabel();
  updateCameraTarget();
  repackExisting();
}
function applyCargoPreset(preset) {
  if (!preset) return;
  $('cargoName').value = preset.name || L10N.cargo;
  $('cargoLength').value = preset.length || 120;
  $('cargoWidth').value = preset.width || 80;
  $('cargoHeight').value = preset.height || 100;
  $('cargoWeight').value = preset.weight || 1;
  $('cargoColor').value = preset.color || '#2563eb';
}
function initCargoPresets() {
  const select = $('cargoPreset');
  if (!select) return;
  select.innerHTML = CARGO_PRESETS.map((preset, index) => `<option value="${index}">${esc(preset.name)}</option>`).join('');
  select.addEventListener('change', () => applyCargoPreset(CARGO_PRESETS[Number(select.value)]));
  applyCargoPreset(CARGO_PRESETS[0]);
}
$('presetTrailer')?.addEventListener('click', () => applySpaceValues(1360, 245, 270, 24000, L10N.vehicleTrailer));
$('presetVan8')?.addEventListener('click', () => applySpaceValues(420, 220, 220, 1200, 'Van 8 EP'));
$('applySpace')?.addEventListener('click', () => {
  state.space.length = +$('spaceLength').value || 1360;
  state.space.width = +$('spaceWidth').value || 245;
  state.space.height = +$('spaceHeight').value || 270;
  state.space.maxWeight = +$('spaceWeight').value || 24000;
  state.space.label = inferSpaceLabel();
  updateCameraTarget(); updateUI();
});
$('addCargo')?.addEventListener('click', () => {
  const templates = [{
    name: $('cargoName').value || L10N.cargo,
    length: +$('cargoLength').value || 120,
    width: +$('cargoWidth').value || 80,
    height: +$('cargoHeight').value || 100,
    weight: +$('cargoWeight').value || 1,
    quantity: +$('cargoQty').value || 1,
    color: $('cargoColor').value || '#2563eb',
    stackable: $('cargoStackable').checked,
    maxStack: +$('cargoMaxStack').value || 1
  }];
  const newItems = expandTemplates(templates);
  state.cargo.push(...newItems);
  repackExisting();
});
$('analyzeAi')?.addEventListener('click', analyzeAiInput);
$('autoPack')?.addEventListener('click', repackExisting);
function readLoadHistory() {
  try {
    const list = JSON.parse(localStorage.getItem(LOAD_HISTORY_KEY) || '[]');
    if (Array.isArray(list) && list.length) return list;
  } catch {
    // Older builds saved only one project. It is converted below when possible.
  }
  try {
    const legacy = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
    if (!legacy?.cargo?.length) return [];
    return [{
      id: 'legacy-load',
      date: legacy.date || new Date().toISOString(),
      vehicleLabel: legacy.space?.label || 'zapis lokalny',
      itemCount: legacy.cargo.length,
      weight: legacy.cargo.reduce((sum, item) => sum + Number(item.weight || 0), 0),
      templates: cargoToTemplates(legacy.cargo)
    }];
  } catch {
    return [];
  }
}
function cargoToTemplates(cargo) {
  const previousCargo = state.cargo;
  state.cargo = Array.isArray(cargo) ? cargo : [];
  const templates = templatesFromCargo();
  state.cargo = previousCargo;
  return templates;
}
function saveLoadHistoryEntry() {
  const templates = templatesFromCargo();
  if (!templates.length) return false;
  const cargoSnapshot = state.cargo.map(item => ({ ...item }));
  const entry = {
    id: uid('saved-load'),
    date: new Date().toISOString(),
    vehicleLabel: state.space.label || inferSpaceLabel(),
    itemCount: state.cargo.length,
    weight: state.cargo.reduce((sum, item) => sum + Number(item.weight || 0), 0),
    cargo: cargoSnapshot,
    templates
  };
  const list = [entry, ...readLoadHistory()].slice(0, 40);
  localStorage.setItem(LOAD_HISTORY_KEY, JSON.stringify(list));
  return true;
}
function restoreSavedLoad(entry) {
  if (Array.isArray(entry?.cargo) && entry.cargo.length) {
    state.cargo = entry.cargo.map((c, i) => ({
      ...c,
      id: uid('cargo'),
      baseName: c.baseName || c.name?.replace(/ \d+$/, '') || 'Ładunek',
      originalLength: c.originalLength || c.length,
      originalWidth: c.originalWidth || c.width,
      stackable: !!c.stackable,
      maxStack: Math.max(1, Number(c.maxStack || 1)),
      color: c.color || COLORS[i % COLORS.length],
      x: Number(c.x || 0),
      y: Number(c.y || 0),
      z: Number(c.z || 0),
      rotationY: Number(c.rotationY || 0),
      unloaded: !!c.unloaded
    }));
    state.selectedId = null;
    updateCameraTarget();
    updateUI();
  } else if (entry?.templates?.length) {
    autoPackTemplates(entry.templates);
  } else {
    return;
  }
  state.space.label = state.space.label || inferSpaceLabel();
  $('savedLoadsPanel')?.classList.remove('open');
}
function renderSavedLoadsPanel() {
  const panel = $('savedLoadsPanel');
  if (!panel) return;
  const list = readLoadHistory();
  if (!list.length) {
    panel.innerHTML = `<div class="saved-load-empty">${esc(L10N.savedNone)}</div>`;
    panel.classList.add('open');
    return;
  }
  panel.innerHTML = list.map((entry, index) => {
    const date = new Date(entry.date || Date.now()).toLocaleString(APP_LOCALE, { dateStyle: 'short', timeStyle: 'short' });
    return `
      <button type="button" class="saved-load-tile" data-load-index="${index}">
        <strong>${esc(entry.itemCount || entry.cargo?.length || entry.templates?.reduce((sum, item) => sum + Number(item.quantity || 0), 0) || 0)} szt. · ${formatLocale(Math.round(entry.weight || 0))} kg</strong>
        <span>${esc(date)} · ${esc(entry.vehicleLabel || L10N.savedCargo)}</span>
      </button>
    `;
  }).join('');
  panel.querySelectorAll('[data-load-index]').forEach(btn => {
    btn.addEventListener('click', () => restoreSavedLoad(list[Number(btn.dataset.loadIndex)]));
  });
  panel.classList.add('open');
}
$('saveProject')?.addEventListener('click', () => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ space: state.space, cargo: state.cargo, nextId }));
  saveLoadHistoryEntry();
  state.dirty = false;
  alert(L10N.saved);
});
$('loadProject')?.addEventListener('click', () => {
  renderSavedLoadsPanel();
});
$('clearProject')?.addEventListener('click', () => {
  if (!confirm(L10N.clearConfirm)) return;
  state.cargo = []; state.selectedId = null; updateUI();
});

$('cargoContextMenu').addEventListener('mousedown', ev => ev.stopPropagation());
$('cargoContextMenu').addEventListener('click', (ev) => {
  const btn = ev.target.closest('[data-context-action]');
  if (!btn) return;
  const id = state.contextMenu.itemId || state.selectedId;
  if (!id) return hideCargoContextMenu();
  const action = btn.dataset.contextAction;
  if (action === 'rotate') { rotateCargoById(id); return; }
  if (action === 'select') { state.selectedId = id; hideCargoContextMenu(); updateUI(); return; }
  if (action === 'delete') { hideCargoContextMenu(false); deleteCargo(id); return; }
});
window.addEventListener('keydown', (ev) => {
  if (ev.key === 'Escape' && state.contextMenu?.visible) hideCargoContextMenu();
});
$('cargoList').addEventListener('click', (ev) => {
  const btn = ev.target.closest('[data-action]');
  if (!btn) return;
  const id = btn.dataset.id;
  const action = btn.dataset.action;
  if (action === 'select') { state.selectedId = id; updateUI(); return; }
  if (action === 'rotate') { state.selectedId = id; rotateSelected(); return; }
  if (action === 'delete') { deleteCargo(id); return; }
});
document.querySelectorAll('[data-view]').forEach(btn => btn.addEventListener('click', () => setView(btn.dataset.view)));

initGeminiKeyField();
initCargoPresets();
if ($('aiMemory')) $('aiMemory').value = localStorage.getItem(AI_MEMORY_KEY) || '';
updateCameraTarget();
updateUI();
render();


function formatInquiryNumber(value) { return formatLocale(value, { maximumFractionDigits: 1 }); }
function inquiryCargoRows() {
  const grouped = new Map();
  state.cargo.forEach((item) => {
    const baseName = item.baseName || String(item.name || L10N.cargo).replace(/\s+\d+$/, '');
    const key = [baseName, item.length, item.width, item.height, item.weight].join('|');
    if (!grouped.has(key)) grouped.set(key, { name: baseName, length: Number(item.length || 0), width: Number(item.width || 0), height: Number(item.height || 0), weight: Number(item.weight || 0), qty: 0 });
    grouped.get(key).qty += 1;
  });
  return Array.from(grouped.values());
}
function waitForRenderFrames(count = 2) {
  return new Promise((resolve) => {
    const next = (left) => left <= 0 ? resolve() : requestAnimationFrame(() => next(left - 1));
    next(count);
  });
}
function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url; link.download = filename;
  document.body.appendChild(link); link.click(); link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1200);
}
function downloadDataUrl(dataUrl, filename) {
  try {
    const link = document.createElement('a');
    link.href = dataUrl; link.download = filename;
    document.body.appendChild(link); link.click(); link.remove();
    return true;
  } catch (error) { console.warn(L10N.shotError, error); return false; }
}
function utf8Base64(text) {
  return btoa(unescape(encodeURIComponent(text)));
}
function dataUrlBase64(dataUrl) {
  return String(dataUrl || '').split(',')[1] || '';
}
function wrapBase64(value, width = 76) {
  return String(value).match(new RegExp(`.{1,${width}}`, 'g'))?.join('\r\n') || '';
}
function buildAttachedEml(subject, plainBody, screenshotDataUrl, filename) {
  const boundary = `----=_Mkulczyk_${Date.now().toString(36)}`;
  const htmlBody = `<div style="font-family:Arial,sans-serif;white-space:pre-wrap;line-height:1.45">${esc(plainBody).replace(/\n/g, '<br>')}</div>`;
  const chunks = [
    'MIME-Version: 1.0',
    'To: contact@mkulczyk.pl',
    `Subject: =?UTF-8?B?${utf8Base64(subject)}?=`,
    `Content-Type: multipart/mixed; boundary="${boundary}"`,
    '',
    `--${boundary}`,
    'Content-Type: text/plain; charset="UTF-8"',
    'Content-Transfer-Encoding: base64',
    '',
    wrapBase64(utf8Base64(plainBody)),
    '',
    `--${boundary}`,
    'Content-Type: text/html; charset="UTF-8"',
    'Content-Transfer-Encoding: base64',
    '',
    wrapBase64(utf8Base64(htmlBody)),
    '',
    `--${boundary}`,
    `Content-Type: image/png; name="${filename}"`,
    'Content-Transfer-Encoding: base64',
    `Content-Disposition: attachment; filename="${filename}"`,
    '',
    wrapBase64(dataUrlBase64(screenshotDataUrl)),
    '',
    `--${boundary}--`,
    ''
  ];
  return new Blob([chunks.join('\r\n')], { type: 'message/rfc822' });
}
function buildStatsSummaryLine() {
  const s = calculateStats();
  return `${L10N.items} ${formatLocale(s.totalItems)} | ${L10N.weight} ${formatLocale(Math.round(s.loadedWeight))} / ${formatLocale(Math.round(state.space.maxWeight))} kg | ${L10N.cbm} ${s.loadedVolume.toFixed(2)} / ${s.spaceVolume.toFixed(2)} m³ | ${L10N.ldm} ${s.ldm.toFixed(2)} / ${s.availableLdm.toFixed(2)} m`;
}
async function addWatermarkToScreenshot(dataUrl) {
  if (!dataUrl) return dataUrl;
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const pad = Math.max(18, Math.round(img.width * 0.016));
      const overlayH = Math.max(86, Math.round(img.height * 0.14));
      const out = document.createElement('canvas');
      out.width = img.width;
      out.height = img.height + overlayH;
      const ctx = out.getContext('2d');
      ctx.drawImage(img, 0, 0);
      ctx.fillStyle = '#0c1016';
      ctx.fillRect(0, img.height, out.width, overlayH);
      ctx.fillStyle = 'rgba(255,255,255,0.96)';
      ctx.font = `700 ${Math.max(15, Math.round(img.width * 0.017))}px Inter, Arial, sans-serif`;
      ctx.fillText(L10N.watermark, pad, img.height + Math.round(overlayH * 0.42));
      ctx.fillStyle = 'rgba(255,255,255,0.88)';
      ctx.font = `600 ${Math.max(13, Math.round(img.width * 0.014))}px Inter, Arial, sans-serif`;
      const statsLine = buildStatsSummaryLine();
      wrapTextToCanvas(ctx, statsLine, pad, img.height + Math.round(overlayH * 0.78), out.width - pad * 2, Math.max(16, Math.round(img.width * 0.019)));
      resolve(out.toDataURL('image/png'));
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
}
function wrapTextToCanvas(ctx, text, x, y, maxWidth, lineHeight) {
  const words = String(text || '').split(/\s+/);
  let line = '';
  let currentY = y;
  words.forEach((word) => {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && line) {
      ctx.fillText(line, x, currentY);
      line = word;
      currentY += lineHeight;
    } else line = test;
  });
  if (line) ctx.fillText(line, x, currentY);
}
async function captureIsoScreenshot() {
  const previous = { yaw: state.camera.yaw, pitch: state.camera.pitch, distance: state.camera.distance, target: [...state.camera.target] };
  setView('iso');
  // Render synchronously after selecting ISO so the exported frame cannot be replaced or cleared.
  renderScene();
  try { gl.finish(); } catch (_) {}
  let dataUrl = '';
  try { dataUrl = canvas.toDataURL('image/png'); } catch (error) { console.warn(L10N.shotError, error); }
  state.camera.yaw = previous.yaw;
  state.camera.pitch = previous.pitch;
  state.camera.distance = previous.distance;
  state.camera.target = previous.target;
  renderScene();
  return addWatermarkToScreenshot(dataUrl);
}
async function prepareInquiryEmail() {
  const status = $('inquiryStatus');
  const rows = inquiryCargoRows();
  if (!rows.length) { if (status) status.textContent = L10N.noInquiry; return; }
  if (status) status.textContent = L10N.connecting;

  const s = calculateStats();
  const totalQty = rows.reduce((sum, row) => sum + row.qty, 0);
  const vehicle = state.space.label || inferSpaceLabel();
  const lines = rows.map((row, index) => `${index + 1}. ${row.name} | ${row.qty} ${L10N.piece} | ${formatInquiryNumber(row.length)} × ${formatInquiryNumber(row.width)} × ${formatInquiryNumber(row.height)} cm | ${formatInquiryNumber(row.weight)} ${L10N.each} | ${formatInquiryNumber(row.weight * row.qty)} kg`).join('\n');
  const statsLine = `${L10N.items} ${formatLocale(s.totalItems)} | ${L10N.weight} ${formatLocale(Math.round(s.loadedWeight))}/${formatLocale(Math.round(state.space.maxWeight))} kg | ${L10N.cbm} ${s.loadedVolume.toFixed(2)}/${s.spaceVolume.toFixed(2)} m³ | ${L10N.ldm} ${s.ldm.toFixed(2)}/${s.availableLdm.toFixed(2)} m`;
  const body = [
    L10N.greet,
    '',
    L10N.intro,
    '',
    `${L10N.space}: ${vehicle} · ${formatInquiryNumber(state.space.length)} × ${formatInquiryNumber(state.space.width)} × ${formatInquiryNumber(state.space.height)} cm · ${L10N.limit} ${formatInquiryNumber(state.space.maxWeight)} kg`,
    statsLine,
    '',
    L10N.cargoRows,
    lines,
    '',
    L10N.shotNote,
    '',
    L10N.loadingDetails,
    `${L10N.loadingDate} `,
    `${L10N.loadingPlace} `,
    `${L10N.unloadingDate} `,
    `${L10N.unloadingPlace} `,
    `${L10N.transportReq} `,
    `${L10N.handlingReq} `,
    `${L10N.notes} `
  ].join('\n');

  const subject = tr(L10N.subject, { vehicle, qty: totalQty });
  const image = await captureIsoScreenshot();
  const stamp = new Date().toISOString().slice(0, 10);
  if (image) {
    downloadDataUrl(image, `loadplanner-iso-${stamp}.png`);
    const eml = buildAttachedEml(subject, body, image, `loadplanner-iso-${stamp}.png`);
    downloadBlob(eml, `zapytanie-transportowe-${stamp}.eml`);
    if (status) status.textContent = L10N.emlReady || L10N.shotReady;
  } else if (status) {
    status.textContent = L10N.mailReady;
  }
  window.location.href = `mailto:contact@mkulczyk.pl?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
$('sendInquiry')?.addEventListener('click', prepareInquiryEmail);


/* Gemini key instructions modal */
(function () {
  const modal = document.getElementById('geminiModal');
  const opener = document.getElementById('geminiHelp');
  if (!modal || !opener) return;
  const close = () => { modal.classList.remove('is-open'); modal.setAttribute('aria-hidden', 'true'); };
  opener.addEventListener('click', () => { modal.classList.add('is-open'); modal.setAttribute('aria-hidden', 'false'); });
  modal.querySelectorAll('[data-gemini-close]').forEach((node) => node.addEventListener('click', close));
  window.addEventListener('keydown', (event) => { if (event.key === 'Escape' && modal.classList.contains('is-open')) close(); });
}());


/* v15 planner mode controls */
(function () {
  const tabs = Array.from(document.querySelectorAll('[data-planner-mode]'));
  const panes = Array.from(document.querySelectorAll('[data-planner-pane]'));
  if (!tabs.length || !panes.length) return;
  function setMode(mode) {
    tabs.forEach((tab) => {
      const active = tab.dataset.plannerMode === mode;
      tab.classList.toggle('is-active', active);
      tab.setAttribute('aria-selected', active ? 'true' : 'false');
    });
    panes.forEach((pane) => pane.classList.toggle('is-active', pane.dataset.plannerPane === mode));
  }
  tabs.forEach((tab) => tab.addEventListener('click', () => setMode(tab.dataset.plannerMode)));
}());
