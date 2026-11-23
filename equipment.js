// Proporzioni, area visibile e sagoma in scala dello schermo di una console.
(function () {
  let uid = 0;

  function geometry(d) {
    const m = String(d.risoluzione || "").match(/(\d{3,5})\s*[x×]\s*(\d{3,5})/i);
    let w = m ? +m[1] : 16, h = m ? +m[2] : 9;
    if (w < h) [w, h] = [h, w];
    const vertical = /vert|portrait/i.test(d.orientamento || "");
    if (vertical) [w, h] = [h, w];
    const gcd = (a, b) => b ? gcd(b, a % b) : a;
    const k = gcd(w, h);
    let ratio = `${w / k}:${h / k}`;
    if (ratio.length > 6) ratio = (Math.max(w, h) / Math.min(w, h)).toFixed(2) + ":1";
    return { w, h, vertical, ratio, hasRes: !!m };
  }

  function physicalSize(d) {
    const inch = parseFloat(String(d.pollici || "").replace(",", "."));
    if (!inch) return null;
    const { w, h } = geometry(d);
    const r = w / h;
    const hIn = inch / Math.sqrt(1 + r * r);
    return { width: Math.round(hIn * r * 2.54), height: Math.round(hIn * 2.54) };
  }

  function sizeSvg(d) {
    const id = ++uid;
    const geo = geometry(d);
    const box = 300, pad = 36;
    const s = (box - pad * 2) / Math.max(geo.w, geo.h);
    const W = geo.w * s, H = geo.h * s, x = (box - W) / 2, y = (box - H) / 2 - 6;
    const totem = /totem|kiosk/i.test(d.tipo || "");
    const stand = totem
      ? `<rect x="${box / 2 - W * 0.32}" y="${y + H}" width="${W * 0.64}" height="${Math.min(14, box - y - H - 4)}" rx="2" class="sil-stand"/>`
      : `<path d="M${box / 2 - 6} ${y + H} h12 l4 14 h-20z" class="sil-stand"/><rect x="${box / 2 - 30}" y="${y + H + 14}" width="60" height="4" rx="2" class="sil-stand"/>`;
    const diag = d.pollici
      ? `<line x1="${x + 10}" y1="${y + H - 10}" x2="${x + W - 10}" y2="${y + 10}" class="sil-diag"/>
         <text x="${box / 2}" y="${y + H / 2}" class="sil-label" text-anchor="middle" dominant-baseline="middle">${String(d.pollici).replace(/[<&>]/g, "")}″</text>` : "";
    return `<svg viewBox="0 0 ${box} ${box}" class="equip sil" role="img" aria-label="Dimensione del display">
      <defs><linearGradient id="sg${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" class="silg-a"/><stop offset="1" class="silg-b"/></linearGradient></defs>
      ${stand}
      <rect x="${x}" y="${y}" width="${W}" height="${H}" rx="6" class="sil-bezel"/>
      <rect x="${x + 5}" y="${y + 5}" width="${W - 10}" height="${H - 10}" rx="2" fill="url(#sg${id})"/>
      ${diag}
    </svg>`;
  }

  window.Equipment = { geometry, physicalSize, sizeSvg };
})();
