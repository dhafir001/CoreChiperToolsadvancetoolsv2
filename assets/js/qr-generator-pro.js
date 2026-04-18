(function () {
  if (!window.location.pathname.endsWith("qr-generator.html")) return;
  const root = document.querySelector("#tool-workspace");
  const status = document.querySelector("#tool-status");
  if (!root || !status) return;
  const setStatus = (message, type = "info") => {
    status.textContent = message;
    status.className = `tool-status${type === "info" ? "" : ` ${type}`}`;
  };
  const html = (strings, ...values) => strings.reduce((acc, part, index) => acc + part + (values[index] ?? ""), "");
  const ensureQr = async () => {
    if (window.QRCode) return window.QRCode;
    await new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = "https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js";
      script.async = true;
      script.onload = resolve;
      script.onerror = () => reject(new Error("Gagal memuat library QR. Cek koneksi browser."));
      document.head.appendChild(script);
    });
    return window.QRCode;
  };
  const readAsDataUrl = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
  const loadImage = (dataUrl) => new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = dataUrl;
  });
  const downloadBlob = (blob, filename) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  const canvasToBlob = (canvas, type = "image/png") => new Promise((resolve) => canvas.toBlob(resolve, type));
  const escapeXml = (value) => String(value ?? "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
  const rgba = (hex, alpha) => {
    const value = Number.parseInt((hex || "#000000").replace("#", "").padEnd(6, "0").slice(0, 6), 16);
    return `rgba(${(value >> 16) & 255}, ${(value >> 8) & 255}, ${value & 255}, ${alpha})`;
  };
  const backgrounds = {
    plain: { color: "#ffffff", accent: "#ffffff", alpha: 0 },
    sky: { color: "#ffffff", accent: "#dcecff", alpha: 0.14 },
    mint: { color: "#ffffff", accent: "#dcf7ee", alpha: 0.12 },
    peach: { color: "#fffdf8", accent: "#ffe8d6", alpha: 0.11 },
    lavender: { color: "#fffaff", accent: "#eadbff", alpha: 0.15 },
    lemonade: { color: "#fffef5", accent: "#ffe99a", alpha: 0.16 },
    noir: { color: "#0b1220", accent: "#1d4ed8", alpha: 0.18 },
  };
  const themes = {
    default: { preview: "#ffffff", text: "#182433", muted: "#5b6574", stops: ["#ffffff", "#ffffff"] },
    instagram: { preview: "linear-gradient(135deg,#833ab4,#fd1d1d 58%,#fcb045)", text: "#ffffff", muted: "rgba(255,255,255,.82)", stops: ["#833ab4", "#fd1d1d", "#fcb045"] },
    business: { preview: "linear-gradient(135deg,#f7f1e8,#efe1ca)", text: "#1f2937", muted: "#6b7280", stops: ["#f7f1e8", "#efe1ca"] },
    dark: { preview: "linear-gradient(160deg,#0f172a,#111827)", text: "#f8fafc", muted: "rgba(248,250,252,.72)", stops: ["#0f172a", "#111827"] },
    aurora: { preview: "linear-gradient(135deg,#061a40,#0353a4 45%,#00b4d8)", text: "#f8fafc", muted: "rgba(255,255,255,.76)", stops: ["#061a40", "#0353a4", "#00b4d8"] },
    candy: { preview: "linear-gradient(135deg,#ff85a2,#ffa8c5 52%,#ffd6e7)", text: "#5a1833", muted: "rgba(90,24,51,.72)", stops: ["#ff85a2", "#ffa8c5", "#ffd6e7"] },
    forest: { preview: "linear-gradient(135deg,#0b3d2e,#14532d 52%,#34d399)", text: "#effff5", muted: "rgba(239,255,245,.72)", stops: ["#0b3d2e", "#14532d", "#34d399"] },
    royal: { preview: "linear-gradient(135deg,#312e81,#6d28d9 58%,#c084fc)", text: "#ffffff", muted: "rgba(255,255,255,.78)", stops: ["#312e81", "#6d28d9", "#c084fc"] },
  };
  const fonts = {
    modern: { family: "'Segoe UI', Arial, sans-serif", svg: "Segoe UI, Arial, sans-serif", titleWeight: 800, titleSize: 24, subSize: 15 },
    rounded: { family: "'Trebuchet MS', Verdana, sans-serif", svg: "Trebuchet MS, Verdana, sans-serif", titleWeight: 800, titleSize: 24, subSize: 15 },
    elegant: { family: "Georgia, 'Times New Roman', serif", svg: "Georgia, Times New Roman, serif", titleWeight: 700, titleSize: 25, subSize: 15 },
    mono: { family: "Consolas, 'Courier New', monospace", svg: "Consolas, Courier New, monospace", titleWeight: 700, titleSize: 23, subSize: 14 },
    playful: { family: "'Comic Sans MS', 'Trebuchet MS', cursive", svg: "Comic Sans MS, Trebuchet MS, cursive", titleWeight: 700, titleSize: 24, subSize: 15 },
    luxe: { family: "'Palatino Linotype', Georgia, serif", svg: "Palatino Linotype, Georgia, serif", titleWeight: 700, titleSize: 26, subSize: 15 },
    bold: { family: "Impact, Haettenschweiler, 'Arial Narrow Bold', sans-serif", svg: "Impact, Haettenschweiler, Arial Narrow Bold, sans-serif", titleWeight: 700, titleSize: 25, subSize: 14 },
  };
  const borders = {
    none: { className: "is-none", padding: 0, radius: 0 },
    clean: { className: "is-clean", padding: 18, radius: 22 },
    rounded: { className: "is-rounded", padding: 22, radius: 32 },
    dashed: { className: "is-dashed", padding: 20, radius: 26, dash: [10, 7] },
    double: { className: "is-double", padding: 24, radius: 28, innerGap: 10 },
    bubble: { className: "is-bubble", padding: 24, radius: 34 },
    ticket: { className: "is-ticket", padding: 24, radius: 18 },
    sticker: { className: "is-sticker", padding: 25, radius: 26 },
    neon: { className: "is-neon", padding: 24, radius: 30, glow: true },
    cloud: { className: "is-cloud", padding: 24, radius: 36 },
  };
  const state = { logoDataUrl: "", matrix: null, options: null };
  root.innerHTML = html`<div class="tool-form-grid">
    <label class="tool-field full"><span class="tool-label">Teks atau URL</span><textarea class="tool-textarea" id="qr-text">https://corechipertools.local</textarea></label>
    <label class="tool-field"><span class="tool-label">Style card</span><select class="tool-select" id="qr-theme"><option value="default">Clean white</option><option value="instagram">Instagram blast</option><option value="business">Business luxe</option><option value="dark">Dark glow</option><option value="aurora">Aurora tech</option><option value="candy">Candy pop</option><option value="forest">Forest fresh</option><option value="royal">Royal purple</option></select></label>
    <label class="tool-field"><span class="tool-label">Ukuran preview QR</span><input class="tool-input" id="qr-size" type="number" value="240" min="160" max="520"></label>
    <label class="tool-field"><span class="tool-label">Warna QR</span><input class="tool-input" id="qr-color" type="color" value="#182433"></label>
    <label class="tool-field"><span class="tool-label">Bentuk QR</span><select class="tool-select" id="qr-shape"><option value="square">Basic kotak</option><option value="rounded">Rounded soft</option><option value="dot">Dot</option><option value="diamond">Diamond</option><option value="hex">Hexagon</option><option value="sparkle">Sparkle</option><option value="squircle">Squircle</option></select></label>
    <label class="tool-field"><span class="tool-label">Preset background QR</span><select class="tool-select" id="qr-bg-preset"><option value="plain">Putih bersih</option><option value="sky">Sky blue</option><option value="mint">Soft mint</option><option value="peach">Soft peach</option><option value="lavender">Lavender glow</option><option value="lemonade">Lemonade pop</option><option value="noir">Midnight glow</option></select></label>
    <label class="tool-field"><span class="tool-label">Border style</span><select class="tool-select" id="qr-border-style"><option value="clean">Clean</option><option value="rounded">Rounded</option><option value="dashed">Dashed</option><option value="double">Double</option><option value="bubble">Bubble cute</option><option value="ticket">Ticket cut</option><option value="sticker">Sticker</option><option value="neon">Neon glow</option><option value="cloud">Cloud fun</option><option value="none">Tanpa border</option></select></label>
    <label class="tool-field"><span class="tool-label">Warna border</span><input class="tool-input" id="qr-border-color" type="color" value="#182433"></label>
    <label class="tool-field"><span class="tool-label">Ketebalan border</span><input class="tool-input" id="qr-border-width" type="range" min="0" max="18" value="6"></label>
    <label class="tool-field"><span class="tool-label">Font caption</span><select class="tool-select" id="qr-font"><option value="modern">Modern Sans</option><option value="rounded">Rounded</option><option value="elegant">Elegant Serif</option><option value="mono">Tech Mono</option><option value="playful">Playful</option><option value="luxe">Luxury</option><option value="bold">Bold Poster</option></select></label>
    <label class="tool-field"><span class="tool-label">Export HD</span><select class="tool-select" id="qr-export-scale"><option value="2">HD 2x</option><option value="3" selected>Ultra 3x</option><option value="4">Super HD 4x</option><option value="6">Print 6x</option></select></label>
    <label class="tool-field"><span class="tool-label">Ukuran logo tengah</span><input class="tool-input" id="qr-logo-size" type="range" min="12" max="22" value="18"></label>
    <label class="tool-field"><span class="tool-label">Teks bawah</span><input class="tool-input" id="qr-caption-title" type="text" value="Scan me"></label>
    <label class="tool-field full"><span class="tool-label">Subteks</span><input class="tool-input" id="qr-caption-subtitle" type="text" value="Arahkan kamera untuk membuka link"></label>
    <label class="tool-field full"><span class="tool-label">Logo tengah</span><input class="tool-input" id="qr-logo-file" type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml"></label>
    <div id="qr-logo-list" class="tool-dropzone" data-drop-input="qr-logo-file"><strong>Upload logo untuk tengah QR</strong><p class="small-note">Format PNG, JPG, WEBP, atau SVG. Gunakan logo sederhana agar tetap mudah discan.</p></div>
  </div>
  <div class="tool-preview" id="tool-preview"><div class="qr-output"><p class="small-note">QR code akan muncul di sini.</p></div></div>
  <div class="action-row"><button class="button button-primary" id="qr-run" type="button">Generate QR</button><button class="button secondary-button" id="qr-download" type="button">Unduh PNG HD</button><button class="button secondary-button" id="qr-download-svg" type="button">Unduh SVG Tajam</button></div>`;
  const $ = (selector) => root.querySelector(selector);
  const options = () => {
    const border = borders[$("#qr-border-style").value] || borders.clean;
    return {
      text: $("#qr-text").value.trim(),
      size: Number($("#qr-size").value) || 240,
      color: $("#qr-color").value,
      shape: $("#qr-shape").value,
      theme: themes[$("#qr-theme").value] || themes.default,
      background: backgrounds[$("#qr-bg-preset").value] || backgrounds.plain,
      border: { ...border, color: $("#qr-border-color").value, width: border.className === "is-none" ? 0 : Number($("#qr-border-width").value) || 0 },
      font: fonts[$("#qr-font").value] || fonts.modern,
      exportScale: Number($("#qr-export-scale").value) || 3,
      logoSize: Number($("#qr-logo-size").value) || 18,
      title: $("#qr-caption-title").value.trim(),
      subtitle: $("#qr-caption-subtitle").value.trim(),
    };
  };
  const rounded = (ctx, x, y, width, height, radius) => {
    const safe = Math.max(0, Math.min(radius, width / 2, height / 2));
    ctx.beginPath();
    ctx.moveTo(x + safe, y);
    ctx.arcTo(x + width, y, x + width, y + height, safe);
    ctx.arcTo(x + width, y + height, x, y + height, safe);
    ctx.arcTo(x, y + height, x, y, safe);
    ctx.arcTo(x, y, x + width, y, safe);
    ctx.closePath();
  };
  const modulePath = (x, y, size, shape) => {
    const right = x + size;
    const bottom = y + size;
    const midX = x + (size / 2);
    const midY = y + (size / 2);
    const cut = size * 0.2;
    if (shape === "rounded" || shape === "squircle") return `M ${x + size * 0.32} ${y} H ${right - size * 0.32} A ${size * 0.32} ${size * 0.32} 0 0 1 ${right} ${y + size * 0.32} V ${bottom - size * 0.32} A ${size * 0.32} ${size * 0.32} 0 0 1 ${right - size * 0.32} ${bottom} H ${x + size * 0.32} A ${size * 0.32} ${size * 0.32} 0 0 1 ${x} ${bottom - size * 0.32} V ${y + size * 0.32} A ${size * 0.32} ${size * 0.32} 0 0 1 ${x + size * 0.32} ${y} Z`;
    if (shape === "dot") return `M ${midX} ${midY - size * 0.38} A ${size * 0.38} ${size * 0.38} 0 1 1 ${midX} ${midY + size * 0.38} A ${size * 0.38} ${size * 0.38} 0 1 1 ${midX} ${midY - size * 0.38} Z`;
    if (shape === "diamond") return `M ${midX} ${y} L ${right} ${midY} L ${midX} ${bottom} L ${x} ${midY} Z`;
    if (shape === "hex") return `M ${x + cut} ${y} H ${right - cut} L ${right} ${midY} L ${right - cut} ${bottom} H ${x + cut} L ${x} ${midY} Z`;
    if (shape === "sparkle") return `M ${midX} ${y} L ${midX + cut * 0.35} ${midY - cut * 0.35} L ${right} ${midY} L ${midX + cut * 0.35} ${midY + cut * 0.35} L ${midX} ${bottom} L ${midX - cut * 0.35} ${midY + cut * 0.35} L ${x} ${midY} L ${midX - cut * 0.35} ${midY - cut * 0.35} Z`;
    return `M ${x} ${y} H ${right} V ${bottom} H ${x} Z`;
  };
  const finderZone = (row, col, total) => (row < 8 && col < 8) || (row < 8 && col >= total - 8) || (row >= total - 8 && col < 8);
  const paintBackground = (ctx, size, background) => {
    ctx.fillStyle = background.color;
    ctx.fillRect(0, 0, size, size);
    if (!background.alpha) return;
    ctx.save();
    ctx.globalAlpha = background.alpha;
    const top = ctx.createRadialGradient(size * 0.18, size * 0.18, size * 0.02, size * 0.18, size * 0.18, size * 0.34);
    top.addColorStop(0, background.accent);
    top.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = top;
    ctx.fillRect(0, 0, size, size);
    const bottom = ctx.createRadialGradient(size * 0.84, size * 0.84, size * 0.02, size * 0.84, size * 0.84, size * 0.3);
    bottom.addColorStop(0, background.accent);
    bottom.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = bottom;
    ctx.fillRect(0, 0, size, size);
    ctx.restore();
  };
  const drawLogo = async (ctx, size, percent) => {
    if (!state.logoDataUrl) return;
    const image = await loadImage(state.logoDataUrl);
    const logoSize = size * (Math.min(percent, 22) / 100);
    const padding = logoSize * 0.24;
    const badge = logoSize + (padding * 2);
    const x = (size - badge) / 2;
    const y = (size - badge) / 2;
    rounded(ctx, x, y, badge, badge, badge * 0.24);
    ctx.fillStyle = "rgba(255,255,255,.98)";
    ctx.fill();
    ctx.strokeStyle = "rgba(24,36,51,.08)";
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.drawImage(image, x + padding, y + padding, logoSize, logoSize);
  };
  const buildQrCanvas = async (matrix, opt, forcedSize) => {
    const size = forcedSize || opt.size;
    const quiet = 4;
    const total = matrix.length + (quiet * 2);
    const cell = size / total;
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");
    ctx.imageSmoothingEnabled = false;
    paintBackground(ctx, size, opt.background);
    ctx.fillStyle = opt.color;
    for (let row = 0; row < matrix.length; row += 1) {
      for (let col = 0; col < matrix.length; col += 1) {
        if (!matrix[row][col]) continue;
        const x = (col + quiet) * cell;
        const y = (row + quiet) * cell;
        const shape = finderZone(row, col, matrix.length) ? "square" : opt.shape;
        if (shape === "square") ctx.fillRect(x, y, cell, cell);
        else ctx.fill(new Path2D(modulePath(x, y, cell, shape)));
      }
    }
    await drawLogo(ctx, size, opt.logoSize);
    return canvas;
  };
  const buildExportCanvas = async (opt, scale) => {
    const qrSize = opt.size * scale;
    const qrCanvas = await buildQrCanvas(state.matrix, opt, qrSize);
    const inset = (opt.border.padding + opt.border.width) * scale;
    const hasCaption = Boolean(opt.title || opt.subtitle);
    const captionHeight = hasCaption ? Math.round(68 * scale) : 0;
    const width = qrCanvas.width + (inset * 2);
    const height = qrCanvas.height + (inset * 2) + captionHeight;
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    opt.theme.stops.forEach((color, index) => gradient.addColorStop(index / (Math.max(opt.theme.stops.length - 1, 1)), color));
    rounded(ctx, opt.border.width * scale / 2, opt.border.width * scale / 2, width - (opt.border.width * scale), height - (opt.border.width * scale), Math.max(opt.border.radius * scale, 18));
    ctx.fillStyle = gradient;
    ctx.fill();
    if (opt.border.glow && opt.border.width) {
      ctx.shadowColor = rgba(opt.border.color, 0.72);
      ctx.shadowBlur = opt.border.width * scale * 2;
    }
    if (opt.border.width) {
      ctx.lineWidth = opt.border.width * scale;
      ctx.strokeStyle = opt.border.color;
      if (opt.border.dash) ctx.setLineDash(opt.border.dash.map((item) => item * scale));
      rounded(ctx, opt.border.width * scale / 2, opt.border.width * scale / 2, width - (opt.border.width * scale), height - (opt.border.width * scale), Math.max(opt.border.radius * scale, 18));
      ctx.stroke();
      ctx.setLineDash([]);
      if (opt.border.innerGap) {
        ctx.lineWidth = Math.max((opt.border.width - 1) * scale, 1);
        rounded(ctx, (opt.border.innerGap + (opt.border.width / 2)) * scale, (opt.border.innerGap + (opt.border.width / 2)) * scale, width - (((opt.border.innerGap * 2) + opt.border.width) * scale), height - (((opt.border.innerGap * 2) + opt.border.width) * scale), Math.max((opt.border.radius - opt.border.innerGap) * scale, 12));
        ctx.stroke();
      }
    }
    ctx.drawImage(qrCanvas, inset, inset);
    if (hasCaption) {
      let cursorY = inset + qrCanvas.height + (28 * scale);
      ctx.textAlign = "center";
      if (opt.title) {
        ctx.fillStyle = opt.theme.text;
        ctx.font = `${opt.font.titleWeight} ${opt.font.titleSize * scale}px ${opt.font.family}`;
        ctx.fillText(opt.title, width / 2, cursorY);
        cursorY += (opt.font.subSize + 18) * scale;
      }
      if (opt.subtitle) {
        ctx.fillStyle = opt.theme.muted;
        ctx.font = `500 ${opt.font.subSize * scale}px ${opt.font.family}`;
        ctx.fillText(opt.subtitle, width / 2, cursorY);
      }
    }
    return canvas;
  };
  const buildExportSvg = (opt, scale) => {
    const qrSize = opt.size * scale;
    const inset = (opt.border.padding + opt.border.width) * scale;
    const captionHeight = opt.title || opt.subtitle ? Math.round(68 * scale) : 0;
    const width = qrSize + (inset * 2);
    const height = qrSize + (inset * 2) + captionHeight;
    const quiet = 4;
    const total = state.matrix.length + (quiet * 2);
    const cell = qrSize / total;
    let modules = "";
    for (let row = 0; row < state.matrix.length; row += 1) {
      for (let col = 0; col < state.matrix.length; col += 1) {
        if (!state.matrix[row][col]) continue;
        const x = inset + ((col + quiet) * cell);
        const y = inset + ((row + quiet) * cell);
        const shape = finderZone(row, col, state.matrix.length) ? "square" : opt.shape;
        modules += `<path d="${modulePath(x, y, cell, shape)}"/>`;
      }
    }
    const stops = opt.theme.stops.map((color, index) => `<stop offset="${(index / (Math.max(opt.theme.stops.length - 1, 1))) * 100}%" stop-color="${color}"/>`).join("");
    const dash = opt.border.dash ? ` stroke-dasharray="${opt.border.dash.map((item) => item * scale).join(" ")}"` : "";
    const logo = state.logoDataUrl ? (() => {
      const logoSize = qrSize * (Math.min(opt.logoSize, 22) / 100);
      const padding = logoSize * 0.24;
      const badge = logoSize + (padding * 2);
      const x = inset + ((qrSize - badge) / 2);
      const y = inset + ((qrSize - badge) / 2);
      return `<rect x="${x}" y="${y}" width="${badge}" height="${badge}" rx="${badge * 0.24}" fill="rgba(255,255,255,.98)"/><rect x="${x}" y="${y}" width="${badge}" height="${badge}" rx="${badge * 0.24}" fill="none" stroke="rgba(24,36,51,.08)" stroke-width="${Math.max(scale * 0.8, 1)}"/><image href="${state.logoDataUrl}" x="${x + padding}" y="${y + padding}" width="${logoSize}" height="${logoSize}" preserveAspectRatio="xMidYMid meet"/>`;
    })() : "";
    let text = "";
    let cursorY = inset + qrSize + (28 * scale);
    if (opt.title) {
      text += `<text x="${width / 2}" y="${cursorY}" text-anchor="middle" fill="${opt.theme.text}" font-family="${escapeXml(opt.font.svg)}" font-weight="${opt.font.titleWeight}" font-size="${opt.font.titleSize * scale}">${escapeXml(opt.title)}</text>`;
      cursorY += (opt.font.subSize + 18) * scale;
    }
    if (opt.subtitle) text += `<text x="${width / 2}" y="${cursorY}" text-anchor="middle" fill="${opt.theme.muted}" font-family="${escapeXml(opt.font.svg)}" font-weight="500" font-size="${opt.font.subSize * scale}">${escapeXml(opt.subtitle)}</text>`;
    return `<?xml version="1.0" encoding="UTF-8"?><svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"><defs><linearGradient id="qr-card-gradient" x1="0%" y1="0%" x2="100%" y2="100%">${stops}</linearGradient><radialGradient id="qr-bg-1" cx="18%" cy="18%" r="38%"><stop offset="0%" stop-color="${opt.background.accent}" stop-opacity="${opt.background.alpha}"/><stop offset="100%" stop-color="${opt.background.accent}" stop-opacity="0"/></radialGradient><radialGradient id="qr-bg-2" cx="84%" cy="84%" r="34%"><stop offset="0%" stop-color="${opt.background.accent}" stop-opacity="${opt.background.alpha}"/><stop offset="100%" stop-color="${opt.background.accent}" stop-opacity="0"/></radialGradient>${opt.border.glow ? `<filter id="qr-glow" x="-40%" y="-40%" width="180%" height="180%"><feDropShadow dx="0" dy="0" stdDeviation="${opt.border.width * scale}" flood-color="${opt.border.color}" flood-opacity=".65"/></filter>` : ""}</defs><rect x="${opt.border.width * scale / 2}" y="${opt.border.width * scale / 2}" width="${width - (opt.border.width * scale)}" height="${height - (opt.border.width * scale)}" rx="${Math.max(opt.border.radius * scale, 18)}" fill="url(#qr-card-gradient)" ${opt.border.glow ? 'filter="url(#qr-glow)"' : ""}/>${opt.border.width ? `<rect x="${opt.border.width * scale / 2}" y="${opt.border.width * scale / 2}" width="${width - (opt.border.width * scale)}" height="${height - (opt.border.width * scale)}" rx="${Math.max(opt.border.radius * scale, 18)}" fill="none" stroke="${opt.border.color}" stroke-width="${opt.border.width * scale}"${dash}/>` : ""}${opt.border.innerGap ? `<rect x="${(opt.border.innerGap + (opt.border.width / 2)) * scale}" y="${(opt.border.innerGap + (opt.border.width / 2)) * scale}" width="${width - (((opt.border.innerGap * 2) + opt.border.width) * scale)}" height="${height - (((opt.border.innerGap * 2) + opt.border.width) * scale)}" rx="${Math.max((opt.border.radius - opt.border.innerGap) * scale, 12)}" fill="none" stroke="${opt.border.color}" stroke-width="${Math.max((opt.border.width - 1) * scale, 1)}"/>` : ""}<rect x="${inset}" y="${inset}" width="${qrSize}" height="${qrSize}" rx="14" fill="${opt.background.color}"/><rect x="${inset}" y="${inset}" width="${qrSize}" height="${qrSize}" rx="14" fill="url(#qr-bg-1)"/><rect x="${inset}" y="${inset}" width="${qrSize}" height="${qrSize}" rx="14" fill="url(#qr-bg-2)"/><g fill="${opt.color}">${modules}</g>${logo}${text}</svg>`;
  };
  const applyPreview = (opt) => {
    const card = root.querySelector("#qr-card");
    const shell = root.querySelector("#qr-shell");
    if (!card || !shell) return;
    card.className = "qr-card";
    card.style.background = opt.theme.preview;
    card.style.setProperty("--qr-card-text", opt.theme.text);
    card.style.setProperty("--qr-card-muted", opt.theme.muted);
    card.style.setProperty("--qr-font-family", opt.font.family);
    shell.className = `qr-frame ${opt.border.className}`;
    shell.style.setProperty("--qr-frame-color", opt.border.color);
    shell.style.setProperty("--qr-frame-width", `${opt.border.width}px`);
    shell.style.setProperty("--qr-frame-radius", `${opt.border.radius}px`);
  };
  const render = async () => {
    const opt = options();
    if (!opt.text) throw new Error("Masukkan teks atau URL terlebih dahulu.");
    const QRCode = await ensureQr();
    const preview = root.querySelector("#tool-preview");
    preview.innerHTML = '<div class="qr-output"><div id="qr-card" class="qr-card"><div id="qr-shell" class="qr-frame"><div id="qr-stage" class="qr-stage"></div></div><div class="qr-copy"><strong id="qr-copy-title"></strong><span id="qr-copy-subtitle"></span></div></div></div>';
    applyPreview(opt);
    root.querySelector("#qr-copy-title").textContent = opt.title;
    root.querySelector("#qr-copy-subtitle").textContent = opt.subtitle;
    const host = document.createElement("div");
    const instance = new QRCode(host, {
      text: opt.text,
      width: opt.size,
      height: opt.size,
      colorDark: opt.color,
      colorLight: "#ffffff",
      correctLevel: QRCode.CorrectLevel?.H,
    });
    state.matrix = instance?._oQRCode?.modules;
    state.options = opt;
    if (!state.matrix?.length) throw new Error("Gagal membangun pola QR code.");
    root.querySelector("#qr-stage").append(await buildQrCanvas(state.matrix, opt));
    if (state.logoDataUrl && opt.logoSize >= 20) setStatus("QR dibuat dengan logo tengah besar. Jika masih sulit discan, kecilkan logo ke 16-18%.", "warn");
  };
  const rerender = async () => {
    try { await render(); } catch (error) { setStatus(error.message, "error"); }
  };
  root.querySelector("#qr-run").addEventListener("click", async () => {
    try { await render(); setStatus("QR code berhasil dibuat."); } catch (error) { setStatus(error.message, "error"); }
  });
  root.querySelector("#qr-download").addEventListener("click", async () => {
    try {
      if (!state.matrix || !state.options) await render();
      const canvas = await buildExportCanvas(state.options, state.options.exportScale);
      downloadBlob(await canvasToBlob(canvas, "image/png"), `corechiper-qr-hd-${state.options.exportScale}x.png`);
      setStatus(`QR PNG HD ${state.options.exportScale}x berhasil diunduh.`);
    } catch (error) {
      setStatus(error.message, "error");
    }
  });
  root.querySelector("#qr-download-svg").addEventListener("click", async () => {
    try {
      if (!state.matrix || !state.options) await render();
      downloadBlob(new Blob([buildExportSvg(state.options, state.options.exportScale)], { type: "image/svg+xml;charset=utf-8" }), `corechiper-qr-vector-${state.options.exportScale}x.svg`);
      setStatus("QR SVG tajam berhasil diunduh. Cocok untuk print dan resize tanpa blur.");
    } catch (error) {
      setStatus(error.message, "error");
    }
  });
  [
    ["#qr-theme", "change"],
    ["#qr-shape", "change"],
    ["#qr-bg-preset", "change"],
    ["#qr-logo-size", "input"],
    ["#qr-caption-title", "input"],
    ["#qr-caption-subtitle", "input"],
    ["#qr-border-style", "change"],
    ["#qr-border-color", "input"],
    ["#qr-border-width", "input"],
    ["#qr-font", "change"],
    ["#qr-size", "input"],
    ["#qr-color", "input"],
    ["#qr-text", "input"],
  ].forEach(([selector, eventName]) => root.querySelector(selector).addEventListener(eventName, rerender));
  root.querySelector("#qr-logo-file").addEventListener("change", async (event) => {
    const file = event.target.files?.[0];
    const list = root.querySelector("#qr-logo-list");
    if (!file) {
      state.logoDataUrl = "";
      list.innerHTML = "<strong>Upload logo untuk tengah QR</strong><p class=\"small-note\">Format PNG, JPG, WEBP, atau SVG. Gunakan logo sederhana agar tetap mudah discan.</p>";
      return rerender();
    }
    state.logoDataUrl = await readAsDataUrl(file);
    list.innerHTML = `<div class="file-list"><div class="file-chip"><strong>${file.name}</strong><div>${Math.round(file.size / 1024)} KB</div></div></div>`;
    await render();
    setStatus("Logo tengah berhasil ditambahkan ke preview QR.");
  });
  const drop = root.querySelector("#qr-logo-list");
  const input = root.querySelector("#qr-logo-file");
  drop.tabIndex = 0;
  drop.addEventListener("click", () => input.click());
  drop.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      input.click();
    }
  });
  render().catch((error) => setStatus(error.message, "error"));
}());
