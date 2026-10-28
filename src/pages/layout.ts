const icons: Record<string, string> = {
  arrow: '<path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>',
  chat: '<path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/>',
  copy: '<rect width="14" height="14" x="8" y="8" rx="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>',
  download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m7 10 5 5 5-5"/><path d="M12 15V3"/>',
  external: '<path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>',
  image: '<rect width="18" height="18" x="3" y="3" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>',
  link: '<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>',
};

export const icon = (name: string) =>
  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[name]}</svg>`;

const baseStyles = `
    :root {
      --bg: #f7f6f3;
      --surface: #ffffff;
      --surface-2: #f1efea;
      --ink: #18181a;
      --muted: #6b6a66;
      --faint: #9a9893;
      --line: #e6e3dc;
      --line-strong: #d6d2c9;
      --accent: #18181a;
      --on-accent: #ffffff;
      --ring: rgba(24, 24, 26, 0.08);
      --danger: #b42318;
      --shadow: 0 1px 2px rgba(20, 20, 15, 0.04), 0 8px 24px -12px rgba(20, 20, 15, 0.12);
      --radius: 10px;
      --radius-lg: 16px;
      --sans: "Geist", ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
      --mono: "Geist Mono", ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
    }
    @media (prefers-color-scheme: dark) {
      :root {
        --bg: #111110;
        --surface: #191918;
        --surface-2: #222220;
        --ink: #ededec;
        --muted: #a1a09a;
        --faint: #6f6e69;
        --line: #2a2a28;
        --line-strong: #3a3a37;
        --accent: #ededec;
        --on-accent: #111110;
        --ring: rgba(237, 237, 236, 0.12);
        --danger: #f97066;
        --shadow: 0 1px 2px rgba(0, 0, 0, 0.3), 0 8px 24px -12px rgba(0, 0, 0, 0.6);
      }
    }
    * { box-sizing: border-box; }
    [hidden] { display: none !important; }
    body {
      margin: 0;
      min-height: 100vh;
      font-family: var(--sans);
      font-size: 15px;
      line-height: 1.5;
      color: var(--ink);
      background: var(--bg);
      -webkit-font-smoothing: antialiased;
    }
    .shell {
      width: min(720px, 100% - 40px);
      margin: 0 auto;
      padding: 24px 0 96px;
      display: grid;
      gap: 40px;
    }
    .topbar {
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 14px;
      min-height: 32px;
    }
    .brand {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      color: var(--ink);
      font-weight: 600;
      text-decoration: none;
      letter-spacing: -0.01em;
    }
    .brand-mark {
      width: 24px;
      height: 24px;
      border-radius: 7px;
      display: grid;
      place-items: center;
      background: var(--ink);
      color: var(--bg);
    }
    .brand-mark svg { width: 14px; height: 14px; }
    .crumb-sep { color: var(--line-strong); }
    .crumb { color: var(--muted); }
    .intro { display: grid; gap: 10px; }
    h1 {
      margin: 0;
      font-size: clamp(28px, 5vw, 38px);
      line-height: 1.1;
      font-weight: 600;
      letter-spacing: -0.03em;
      text-wrap: balance;
    }
    h2 { margin: 0; font-size: 15px; font-weight: 600; }
    p { margin: 0; color: var(--muted); text-wrap: pretty; }
    .lede { font-size: 16px; max-width: 56ch; }
    .panel {
      display: grid;
      gap: 20px;
      padding: 20px;
      background: var(--surface);
      border: 1px solid var(--line);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow);
    }
    .field { display: grid; gap: 8px; align-content: start; min-width: 0; }
    .label { font-size: 13px; font-weight: 500; color: var(--ink); }
    .hint { font-size: 13px; color: var(--muted); }
    input, textarea {
      width: 100%;
      min-width: 0;
      font: inherit;
      color: var(--ink);
      background: var(--surface);
      border: 1px solid var(--line-strong);
      border-radius: var(--radius);
      padding: 9px 12px;
      transition: border-color 0.15s, box-shadow 0.15s;
    }
    input::placeholder, textarea::placeholder { color: var(--faint); }
    input:focus, textarea:focus { outline: none; border-color: var(--ink); box-shadow: 0 0 0 3px var(--ring); }
    textarea { min-height: 104px; resize: vertical; }
    .btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      height: 40px;
      padding: 0 16px;
      font: inherit;
      font-size: 14px;
      font-weight: 500;
      white-space: nowrap;
      text-decoration: none;
      border: 1px solid transparent;
      border-radius: var(--radius);
      cursor: pointer;
      transition: background 0.15s, border-color 0.15s, color 0.15s, opacity 0.15s;
    }
    .btn svg { width: 16px; height: 16px; flex: none; }
    .btn:active:not(:disabled) { transform: translateY(1px); }
    .btn:disabled { opacity: 0.5; cursor: default; }
    .btn-primary { background: var(--accent); color: var(--on-accent); }
    .btn-primary:hover:not(:disabled) { opacity: 0.86; }
    .btn-secondary { background: var(--surface); color: var(--ink); border-color: var(--line-strong); }
    .btn-secondary:hover:not(:disabled) { background: var(--surface-2); }
    .btn-icon { width: 32px; height: 32px; padding: 0; border-radius: 8px; background: transparent; color: var(--muted); }
    .btn-icon:hover:not(:disabled) { background: var(--surface-2); color: var(--ink); }
    .visually-hidden {
      position: absolute;
      width: 1px;
      height: 1px;
      overflow: hidden;
      clip: rect(0 0 0 0);
      white-space: nowrap;
    }
    .status { min-height: 20px; font-size: 13px; color: var(--muted); }
    .status.error { color: var(--danger); }
    :focus-visible { outline: 2px solid var(--ink); outline-offset: 2px; }
    input:focus-visible, textarea:focus-visible { outline: none; }
    @media (prefers-reduced-motion: reduce) {
      *, *::before, *::after { transition: none !important; animation: none !important; }
    }`;

type PageOptions = { title: string; crumb?: string; styles?: string; body: string };

export const page = ({ title, crumb, styles = "", body }: PageOptions) => `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="color-scheme" content="light dark" />
  <title>${title}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600&family=Geist+Mono:wght@400;500&display=swap" />
  <style>${baseStyles}${styles}
  </style>
</head>
<body>
  <div class="shell">
    <nav class="topbar" aria-label="Breadcrumb">
      <a class="brand" href="/">
        <span class="brand-mark"><svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><rect x="2" y="2" width="5" height="5" rx="1.5"/><rect x="9" y="2" width="5" height="5" rx="1.5" opacity="0.45"/><rect x="2" y="9" width="5" height="5" rx="1.5" opacity="0.45"/><rect x="9" y="9" width="5" height="5" rx="1.5"/></svg></span>
        Utilities
      </a>${crumb ? `
      <span class="crumb-sep" aria-hidden="true">/</span>
      <span class="crumb" aria-current="page">${crumb}</span>` : ""}
    </nav>
${body}
  </div>
</body>
</html>`;
