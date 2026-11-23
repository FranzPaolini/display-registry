// Logica condivisa: caricamento dati, parsing CSV, utilità.
(function () {
  const CFG = window.REGISTRY_CONFIG || {};

  function parseCSV(text) {
    const rows = [];
    let row = [], field = "", inQuotes = false;
    for (let i = 0; i < text.length; i++) {
      const c = text[i];
      if (inQuotes) {
        if (c === '"' && text[i + 1] === '"') { field += '"'; i++; }
        else if (c === '"') inQuotes = false;
        else field += c;
      } else if (c === '"') inQuotes = true;
      else if (c === ",") { row.push(field); field = ""; }
      else if (c === "\n" || c === "\r") {
        if (c === "\r" && text[i + 1] === "\n") i++;
        row.push(field); rows.push(row); row = []; field = "";
      } else field += c;
    }
    if (field !== "" || row.length) { row.push(field); rows.push(row); }
    const header = (rows.shift() || []).map(h => h.trim().toLowerCase().replace(/\s+/g, "_"));
    return rows
      .filter(r => r.some(v => v.trim() !== ""))
      .map(r => Object.fromEntries(header.map((h, i) => [h, (r[i] || "").trim()])));
  }

  async function fetchTable(url) {
    const sep = url.includes("?") ? "&" : "?";
    const res = await fetch(url + sep + "t=" + Date.now(), { cache: "no-store" });
    if (!res.ok) throw new Error("Impossibile caricare i dati (" + res.status + ")");
    const text = await res.text();
    const trimmed = text.trim();
    return trimmed.startsWith("[") || trimmed.startsWith("{") ? JSON.parse(trimmed) : parseCSV(text);
  }

  // Ultime versioni lette dalla scheda "Ultime versioni" del Google Sheet
  // (colonne: Software, Ultima versione). Se manca, resta quanto scritto in config.js.
  async function loadLatestVersions() {
    if (!CFG.latestVersionsUrl) return;
    try {
      const rows = await fetchTable(CFG.latestVersionsUrl);
      const map = { ...(CFG.latestVersions || {}) };
      rows.forEach(r => { if (r.software && r.ultima_versione) map[r.software] = r.ultima_versione; });
      CFG.latestVersions = map;
    } catch (e) {
      console.warn("Ultime versioni non caricate:", e);
    }
  }

  // Prodotti dalla scheda "Prodotti" (colonne: Prodotto, Linea, Immagine, Descrizione):
  // un'immagine per prodotto (es. Run, Bike) valida per tutti i display di quel prodotto.
  const types = {};
  // Le chiavi si confrontano senza maiuscole, spazi e simboli ("Excite+ Synchro" = "excitesynchro").
  const norm = v => String(v ?? "").toLowerCase().replace(/[^a-z0-9]/g, "");
  async function loadTypes() {
    Object.entries(CFG.types || {}).forEach(([k, v]) => { types[norm(k)] = typeof v === "string" ? { immagine: v } : v; });
    if (!CFG.typesUrl) return;
    try {
      const rows = await fetchTable(CFG.typesUrl);
      rows.forEach(r => { const k = r.prodotto || r.tipo; if (k) types[norm(k)] = r; });
    } catch (e) {
      console.warn("Prodotti non caricati:", e);
    }
  }
  // Trova il prodotto del sito per una console: prima "Linea + Prodotto" (Skill + Run = Skillrun),
  // poi la sola Linea (Technogym Ride), il solo Prodotto o il Tipo.
  function typeInfo(d) {
    const candidates = [norm((d.linea || "") + (d.prodotto || "")), norm(d.linea), norm(d.prodotto), norm(d.tipo)];
    for (const c of candidates) if (c && types[c]) return types[c];
    return {};
  }

  // Una cella può contenere più link a immagini, separati da spazio, virgola o a capo.
  // I link di Google Drive ("Condividi > chiunque abbia il link") vengono convertiti
  // in un indirizzo che il browser può mostrare come immagine.
  function images(value) {
    return String(value || "").split(/[\s,]+/)
      .filter(u => /^https?:\/\//i.test(u) || /\.(png|jpe?g|webp|gif|svg)$/i.test(u))
      .map(u => {
        const m = u.match(/drive\.google\.com\/(?:file\/d\/|open\?id=|uc\?(?:export=\w+&)?id=)([\w-]{20,})/);
        return m ? `https://drive.google.com/thumbnail?id=${m[1]}&sz=w1600` : u;
      });
  }

  // Immagini del prodotto di riferimento: colonna "Immagine prodotto" del display,
  // altrimenti l'immagine del suo prodotto nella scheda Prodotti.
  function productImages(d) {
    const own = images(d.immagine_prodotto || d.immagine);
    return own.length ? own : images(typeInfo(d).immagine);
  }

  async function loadDevices() {
    const [list] = await Promise.all([fetchTable(CFG.dataUrl || "data/devices.json"), loadLatestVersions(), loadTypes()]);
    return (Array.isArray(list) ? list : list.devices || [])
      .filter(d => d && d.id)
      .map(d => withProduct({ ...d, id: String(d.id).trim() }));
  }

  // Le specifiche del prodotto (scheda Prodotti, prese dal sito) valgono per ogni console
  // di quel prodotto; un valore scritto nella riga del display ha la precedenza.
  // Le voci della console descritta sul sito valgono solo se la console sul tavolo ha la
  // stessa diagonale (es. una Skillrun da 10" non eredita il "22"" della pagina prodotto).
  const PRODUCT_ONLY = new Set(["immagine", "descrizione", "fonte"]);
  const CONSOLE_FIELDS = new Set(["tipo_console", "pollici", "touch", "pannello", "risoluzione"]);
  const inches = v => parseFloat(String(v ?? "").replace(",", "."));
  function withProduct(d) {
    const p = typeInfo(d);
    const merged = {};
    const otherConsole = inches(d.pollici) && inches(p.pollici) && inches(d.pollici) !== inches(p.pollici);
    Object.entries(p).forEach(([k, v]) => {
      if (v === "" || v == null || PRODUCT_ONLY.has(k)) return;
      if (otherConsole && CONSOLE_FIELDS.has(k)) return;
      merged[k] = v;
    });
    Object.entries(d).forEach(([k, v]) => { if (v !== "" && v != null) merged[k] = v; else if (!(k in merged)) merged[k] = v; });
    return merged;
  }

  function cmpVersion(a, b) {
    const pa = String(a).split(/[.\-]/).map(n => parseInt(n, 10) || 0);
    const pb = String(b).split(/[.\-]/).map(n => parseInt(n, 10) || 0);
    for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
      const d = (pa[i] || 0) - (pb[i] || 0);
      if (d) return d > 0 ? 1 : -1;
    }
    return 0;
  }

  function versionStatus(d) {
    const latest = (CFG.latestVersions || {})[d.software];
    if (!latest || !d.versione) return { kind: "unknown", latest };
    const c = cmpVersion(d.versione, latest);
    return { kind: c === 0 ? "ok" : c < 0 ? "behind" : "ahead", latest };
  }

  function daysSince(dateStr) {
    if (!dateStr) return null;
    const t = Date.parse(dateStr);
    if (isNaN(t)) return null;
    return Math.floor((Date.now() - t) / 86400000);
  }

  function baseUrl() {
    if (CFG.publicBaseUrl) return CFG.publicBaseUrl.replace(/\/+$/, "") + "/";
    return location.href.replace(/[?#].*$/, "").replace(/[^/]*$/, "");
  }

  function deviceUrl(id) {
    return baseUrl() + "?id=" + encodeURIComponent(id);
  }

  function esc(s) {
    return String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  }

  window.Registry = { CFG, loadDevices, typeInfo, images, productImages, versionStatus, daysSince, deviceUrl, esc };
})();
