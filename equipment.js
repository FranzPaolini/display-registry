// Illustrazioni SVG per tipo di equipment e vista quotata con le dimensioni.
// Nessuna immagine esterna: tutto viene disegnato in base a tipo, risoluzione e orientamento.
(function () {
  let uid = 0;

  // Riconosce il tipo di equipment dal campo "Tipo" del foglio.
  function kindOf(tipo) {
    const t = String(tipo || "").toLowerCase();
    if (/video\s*wall/.test(t)) return "videowall";
    if (/\bled\b|ledwall/.test(t)) return "ledwall";
    if (/totem/.test(t)) return "totem";
    if (/kiosk|chiosco/.test(t)) return "kiosk";
    if (/tablet/.test(t)) return "tablet";
    if (/parete|muro|wall|bar\b|stretch/.test(t)) return "wall";
    return "monitor";
  }

  const KIND_LABEL = {
    videowall: "Videowall", ledwall: "LED wall", totem: "Totem", kiosk: "Kiosk",
    tablet: "Tablet", wall: "Display a parete", monitor: "Monitor"
  };

  // Proporzioni dalla risoluzione + orientamento.
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

  // Area visibile in cm a partire da diagonale (pollici) e proporzioni.
  function physicalSize(d) {
    const inch = parseFloat(String(d.pollici || "").replace(",", "."));
    if (!inch) return null;
    const { w, h } = geometry(d);
    const r = w / h;
    const hIn = inch / Math.sqrt(1 + r * r);
    return { width: Math.round(hIn * r * 2.54), height: Math.round(hIn * 2.54) };
  }

  // Contenuto "signage" generico sullo schermo.
  function screen(x, y, w, h, id) {
    const p = Math.max(3, Math.min(w, h) * 0.07);
    const vertical = h > w;
    const blocks = vertical
      ? `<rect x="${x + p}" y="${y + p}" width="${w * 0.45}" height="${h * 0.035}" rx="1.5" fill="#fff" opacity=".85"/>
         <rect x="${x + p}" y="${y + h * 0.12}" width="${w - 2 * p}" height="${h * 0.42}" rx="3" fill="url(#hl${id})"/>
         <rect x="${x + p}" y="${y + h * 0.58}" width="${w * 0.7}" height="${h * 0.04}" rx="1.5" fill="#fff" opacity=".9"/>
         <rect x="${x + p}" y="${y + h * 0.65}" width="${w * 0.5}" height="${h * 0.025}" rx="1.5" fill="#fff" opacity=".45"/>
         <rect x="${x + p}" y="${y + h * 0.75}" width="${(w - 3 * p) / 2}" height="${h * 0.17}" rx="3" fill="#fff" opacity=".12"/>
         <rect x="${x + w / 2 + p / 2}" y="${y + h * 0.75}" width="${(w - 3 * p) / 2}" height="${h * 0.17}" rx="3" fill="#fff" opacity=".12"/>`
      : `<rect x="${x + p}" y="${y + p}" width="${w * 0.25}" height="${h * 0.06}" rx="1.5" fill="#fff" opacity=".85"/>
         <rect x="${x + p}" y="${y + h * 0.22}" width="${w * 0.42}" height="${h * 0.09}" rx="1.5" fill="#fff" opacity=".92"/>
         <rect x="${x + p}" y="${y + h * 0.36}" width="${w * 0.32}" height="${h * 0.05}" rx="1.5" fill="#fff" opacity=".45"/>
         <rect x="${x + p}" y="${y + h * 0.62}" width="${w * 0.15}" height="${h * 0.11}" rx="${h * 0.055}" fill="#fff" opacity=".9"/>
         <rect x="${x + w * 0.52}" y="${y + p}" width="${w * 0.48 - p}" height="${h - 2 * p}" rx="3" fill="url(#hl${id})"/>`;
    return `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="url(#sc${id})"/>
      <g clip-path="url(#cp${id})">${blocks}
        <path d="M${x} ${y} L${x + w * 0.55} ${y} L${x} ${y + h * 0.9} Z" fill="#fff" opacity=".05"/></g>`;
  }

  function defs(id, x, y, w, h) {
    return `<defs>
      <linearGradient id="sc${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#23324a"/><stop offset="1" stop-color="#0d141f"/></linearGradient>
      <linearGradient id="hl${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#5f8cff"/><stop offset="1" stop-color="#2bc4b5"/></linearGradient>
      <linearGradient id="bd${id}" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#2b2b2d"/><stop offset=".5" stop-color="#3d3d40"/><stop offset="1" stop-color="#202022"/></linearGradient>
      <linearGradient id="mt${id}" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#8d8d8f"/><stop offset=".5" stop-color="#c9c9cb"/><stop offset="1" stop-color="#7a7a7c"/></linearGradient>
      <radialGradient id="sh${id}"><stop offset="0" stop-color="#000" stop-opacity=".28"/><stop offset="1" stop-color="#000" stop-opacity="0"/></radialGradient>
      <clipPath id="cp${id}"><rect x="${x}" y="${y}" width="${w}" height="${h}"/></clipPath>
    </defs>`;
  }

  const shadow = (id, cx, cy, rx) => `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${rx * 0.09}" fill="url(#sh${id})"/>`;

  // Rettangolo schermo che sta dentro (maxW x maxH) rispettando le proporzioni.
  function fit(geo, maxW, maxH) {
    const s = Math.min(maxW / geo.w, maxH / geo.h);
    return { w: geo.w * s, h: geo.h * s };
  }

  function equipmentSvg(d) {
    const id = ++uid;
    const kind = kindOf(d.tipo);
    const geo = geometry(d);
    const V = 400, floor = 368;
    let body = "", sx, sy, sw, sh;

    if (kind === "totem") {
      const g = geo.vertical ? geo : { w: geo.h, h: geo.w };
      ({ w: sw, h: sh } = fit(g, 132, 250));
      const bw = sw + 24, bh = sh + 64, bx = (V - bw) / 2, by = floor - bh - 14;
      sx = (V - sw) / 2; sy = by + 16;
      body = `${shadow(id, V / 2, floor, bw * 0.8)}
        <rect x="${bx - 8}" y="${floor - 16}" width="${bw + 16}" height="16" rx="3" fill="url(#mt${id})"/>
        <rect x="${bx}" y="${by}" width="${bw}" height="${bh}" rx="8" fill="url(#bd${id})"/>
        <rect x="${bx + bw / 2 - 14}" y="${by + bh - 30}" width="28" height="4" rx="2" fill="#5a5a5e"/>`;
    } else if (kind === "kiosk") {
      const g = geo.vertical ? geo : { w: geo.h, h: geo.w };
      ({ w: sw, h: sh } = fit(g, 120, 170));
      const hw = sw + 26, hh = sh + 40, hx = (V - hw) / 2, hy = 46;
      sx = (V - sw) / 2; sy = hy + 13;
      body = `${shadow(id, V / 2, floor, 110)}
        <rect x="${V / 2 - 95}" y="${floor - 12}" width="190" height="12" rx="3" fill="url(#mt${id})"/>
        <path d="M${V / 2 - 34} ${hy + hh} L${V / 2 + 34} ${hy + hh} L${V / 2 + 44} ${floor - 12} L${V / 2 - 44} ${floor - 12} Z" fill="url(#bd${id})"/>
        <rect x="${hx}" y="${hy}" width="${hw}" height="${hh}" rx="10" fill="url(#bd${id})"/>
        <rect x="${V / 2 - 24}" y="${hy + hh + 22}" width="48" height="6" rx="3" fill="#111"/>
        <rect x="${V / 2 - 16}" y="${hy + hh + 40}" width="32" height="22" rx="3" fill="#4a4a4e"/>`;
    } else if (kind === "videowall" || kind === "ledwall") {
      const cols = 2, rows = 2, gap = kind === "ledwall" ? 0 : 3;
      const one = fit(geo.vertical ? { w: geo.h, h: geo.w } : geo, 140, 100);
      const tw = one.w * cols + gap * (cols - 1), th = one.h * rows + gap * (rows - 1);
      const x0 = (V - tw) / 2, y0 = 70;
      sx = x0; sy = y0; sw = tw; sh = th;
      let tiles = "";
      for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
        const tx = x0 + c * (one.w + gap), ty = y0 + r * (one.h + gap);
        tiles += `<rect x="${tx - 1.5}" y="${ty - 1.5}" width="${one.w + 3}" height="${one.h + 3}" fill="#151515"/>`;
      }
      const leds = kind === "ledwall"
        ? `<pattern id="px${id}" width="5" height="5" patternUnits="userSpaceOnUse"><circle cx="2.5" cy="2.5" r="1" fill="#000" opacity=".35"/></pattern>
           <rect x="${x0}" y="${y0}" width="${tw}" height="${th}" fill="url(#px${id})"/>
           <line x1="${x0 + tw / 2}" y1="${y0}" x2="${x0 + tw / 2}" y2="${y0 + th}" stroke="#000" opacity=".25"/>
           <line x1="${x0}" y1="${y0 + th / 2}" x2="${x0 + tw}" y2="${y0 + th / 2}" stroke="#000" opacity=".25"/>`
        : Array.from({ length: cols - 1 }, (_, i) => `<rect x="${x0 + (i + 1) * one.w + i * gap}" y="${y0}" width="${gap}" height="${th}" fill="#151515"/>`).join("") +
          Array.from({ length: rows - 1 }, (_, i) => `<rect x="${x0}" y="${y0 + (i + 1) * one.h + i * gap}" width="${tw}" height="${gap}" fill="#151515"/>`).join("");
      body = `<rect x="${x0 - 30}" y="${y0 - 30}" width="${tw + 60}" height="${th + 60}" fill="#000" opacity=".04"/>
        ${tiles}`;
      return wrap(id, sx, sy, sw, sh, body, leds);
    } else if (kind === "tablet") {
      ({ w: sw, h: sh } = fit(geo, 190, 190));
      const bw = sw + 22, bh = sh + 22, bx = (V - bw) / 2, by = floor - bh - 60;
      sx = bx + 11; sy = by + 11;
      body = `${shadow(id, V / 2, floor, 90)}
        <path d="M${V / 2 - 10} ${by + bh} L${V / 2 + 10} ${by + bh} L${V / 2 + 22} ${floor - 6} L${V / 2 - 22} ${floor - 6} Z" fill="url(#mt${id})"/>
        <rect x="${V / 2 - 60}" y="${floor - 8}" width="120" height="8" rx="4" fill="url(#mt${id})"/>
        <rect x="${bx}" y="${by}" width="${bw}" height="${bh}" rx="18" fill="#1d1d1f"/>`;
    } else if (kind === "wall") {
      ({ w: sw, h: sh } = fit(geo, 290, 230));
      sx = (V - sw) / 2; sy = (V - sh) / 2 - 10;
      body = `<rect x="0" y="0" width="${V}" height="${V}" fill="#000" opacity=".03"/>
        <rect x="${sx - 8}" y="${sy + 6}" width="${sw + 16}" height="${sh + 16}" rx="6" fill="#000" opacity=".12" filter="blur(6px)"/>
        <rect x="${sx - 6}" y="${sy - 6}" width="${sw + 12}" height="${sh + 12}" rx="5" fill="#141414"/>`;
    } else {
      ({ w: sw, h: sh } = fit(geo, 290, 210));
      sx = (V - sw) / 2; sy = floor - sh - 92;
      const neckH = floor - 10 - (sy + sh + 6);
      body = `${shadow(id, V / 2, floor, 120)}
        <path d="M${V / 2 - 12} ${sy + sh} L${V / 2 + 12} ${sy + sh} L${V / 2 + 16} ${sy + sh + 6 + neckH} L${V / 2 - 16} ${sy + sh + 6 + neckH} Z" fill="url(#mt${id})"/>
        <rect x="${V / 2 - 80}" y="${floor - 10}" width="160" height="10" rx="5" fill="url(#mt${id})"/>
        <rect x="${sx - 7}" y="${sy - 7}" width="${sw + 14}" height="${sh + 14}" rx="6" fill="#161616"/>`;
    }
    return wrap(id, sx, sy, sw, sh, body, "");
  }

  function wrap(id, sx, sy, sw, sh, body, overlay) {
    return `<svg viewBox="0 0 400 400" class="equip" role="img" aria-label="Illustrazione dell'equipment">
      ${defs(id, sx, sy, sw, sh)}${body}${screen(sx, sy, sw, sh, id)}${overlay}</svg>`;
  }

  // Vista dimensioni: schermo in scala con quote di larghezza, altezza e diagonale.
  function dimensionsSvg(d) {
    const geo = geometry(d);
    const size = physicalSize(d);
    const { w, h } = fit(geo, 250, 250);
    const x = (400 - w) / 2 + 10, y = (400 - h) / 2 - 10;
    const inch = d.pollici ? `${d.pollici}″` : "";
    return `<svg viewBox="0 0 400 400" class="equip dims" role="img" aria-label="Dimensioni dello schermo">
      <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="3" class="dim-screen"/>
      <line x1="${x + 6}" y1="${y + h - 6}" x2="${x + w - 6}" y2="${y + 6}" class="dim-diag"/>
      <text x="${x + w / 2}" y="${y + h / 2}" class="dim-big" text-anchor="middle" dominant-baseline="middle">${inch}</text>
      ${size ? `
      <line x1="${x}" y1="${y + h + 22}" x2="${x + w}" y2="${y + h + 22}" class="dim-line"/>
      <line x1="${x}" y1="${y + h + 14}" x2="${x}" y2="${y + h + 30}" class="dim-line"/>
      <line x1="${x + w}" y1="${y + h + 14}" x2="${x + w}" y2="${y + h + 30}" class="dim-line"/>
      <text x="${x + w / 2}" y="${y + h + 44}" class="dim-txt" text-anchor="middle">${size.width} cm</text>
      <line x1="${x - 22}" y1="${y}" x2="${x - 22}" y2="${y + h}" class="dim-line"/>
      <line x1="${x - 30}" y1="${y}" x2="${x - 14}" y2="${y}" class="dim-line"/>
      <line x1="${x - 30}" y1="${y + h}" x2="${x - 14}" y2="${y + h}" class="dim-line"/>
      <text x="${x - 30}" y="${y + h / 2}" class="dim-txt" text-anchor="middle" transform="rotate(-90 ${x - 30} ${y + h / 2})" dy="-4">${size.height} cm</text>` : ""}
      ${geo.hasRes ? `<text x="200" y="${Math.max(24, y - 18)}" class="dim-cap" text-anchor="middle">${geo.ratio} · ${geo.vertical ? "verticale" : "orizzontale"}${/wall/.test(kindOf(d.tipo)) ? " · singolo pannello" : ""}</text>` : ""}
    </svg>`;
  }

  // Dimensione del display: sagoma dello schermo in scala con la diagonale in pollici.
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

  window.Equipment = { kindOf, KIND_LABEL, geometry, physicalSize, equipmentSvg, dimensionsSvg, sizeSvg };
})();
