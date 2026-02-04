export const waMeCreatorHtml = () => `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>WA.me Link Generator</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&display=swap');
    :root {
      --bg: #f7f7f2;
      --ink: #1c1c1c;
      --muted: #5a5a5a;
      --card: #ffffff;
      --accent: #0b7a3b;
      --accent-strong: #0a6a33;
      --border: #e3e3dd;
      --shadow: 0 12px 30px rgba(0, 0, 0, 0.08);
      --radius: 14px;
      --mono: "SFMono-Regular", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
      --sans: "Space Grotesk", "Inter", system-ui, -apple-system, Segoe UI, Roboto, "Helvetica Neue", Arial, sans-serif;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      font-family: var(--sans);
      color: var(--ink);
      background: radial-gradient(circle at top, #ffffff 0%, #f1f1eb 45%, #ebeae4 100%);
      min-height: 100vh;
      display: grid;
      place-items: center;
      padding: 32px 16px 64px;
      position: relative;
    }
    body::before {
      content: "";
      position: fixed;
      inset: -20% 10% auto auto;
      width: 420px;
      height: 420px;
      background: radial-gradient(circle, rgba(11, 122, 59, 0.18), rgba(11, 122, 59, 0));
      pointer-events: none;
      z-index: 0;
    }
    .shell {
      width: min(900px, 100%);
      display: grid;
      gap: 24px;
      position: relative;
      z-index: 1;
    }
    header {
      display: grid;
      gap: 12px;
    }
    h1 {
      margin: 0;
      font-size: clamp(2rem, 3.8vw, 3rem);
      letter-spacing: -0.02em;
    }
    p {
      margin: 0;
      color: var(--muted);
      font-size: 1rem;
    }
    .card {
      background: var(--card);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      padding: 24px;
      box-shadow: var(--shadow);
      backdrop-filter: blur(4px);
      display: grid;
      gap: 18px;
    }
    label {
      font-weight: 600;
      display: block;
      margin-bottom: 8px;
    }
    input, textarea {
      width: 100%;
      font: inherit;
      padding: 12px 14px;
      border-radius: 10px;
      border: 1px solid var(--border);
      background: #fafaf7;
      color: var(--ink);
    }
    textarea { min-height: 110px; resize: vertical; }
    .row {
      display: grid;
      gap: 16px;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      align-items: start;
    }
    .phone-group {
      display: grid;
      gap: 10px;
    }
    .phone-inputs {
      display: grid;
      gap: 12px;
      grid-template-columns: minmax(90px, 120px) minmax(160px, 1fr);
    }
    .sub-label {
      font-size: 0.8rem;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: var(--muted);
      margin-bottom: 6px;
      display: block;
    }
    .helper {
      font-size: 0.9rem;
      color: var(--muted);
      margin-top: 6px;
    }
    .output {
      padding: 14px;
      border-radius: 10px;
      background: #0d0d0d;
      color: #e6e6e6;
      font-family: var(--mono);
      font-size: 0.92rem;
      overflow-wrap: anywhere;
      min-height: 56px;
    }
    .actions {
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
    }
    button {
      font: inherit;
      border: none;
      padding: 12px 18px;
      border-radius: 999px;
      cursor: pointer;
      font-weight: 600;
    }
    .copy {
      background: var(--accent);
      color: #fff;
      box-shadow: 0 8px 18px rgba(11, 122, 59, 0.25);
    }
    .copy:hover { background: var(--accent-strong); }
    .open {
      background: #f3f3ef;
      color: var(--ink);
      border: 1px solid var(--border);
    }
    .status {
      font-size: 0.95rem;
      color: var(--muted);
      min-height: 20px;
    }
    .error { color: #c62828; }
    .back {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      color: var(--muted);
      text-decoration: none;
      font-size: 0.95rem;
    }
  </style>
</head>
<body>
  <div class="shell">
    <header>
      <a class="back" href="/">← Back to utilities</a>
      <h1>WhatsApp wa.me Link Generator</h1>
      <p>Enter the country/area code, phone number, and message. We will generate a wa.me link you can open or copy.</p>
    </header>

    <section class="card">
      <div class="row">
        <div class="phone-group">
          <label>Phone number</label>
          <div class="phone-inputs">
            <div>
              <label class="sub-label" for="area">Code</label>
              <input id="area" type="tel" inputmode="numeric" autocomplete="tel-country-code" placeholder="1" />
            </div>
            <div>
              <label class="sub-label" for="phone">Number</label>
              <input id="phone" type="tel" inputmode="numeric" autocomplete="tel" placeholder="555 123 4567" />
            </div>
          </div>
          <div class="helper">Saved on this device for quick reuse. Edit anytime.</div>
        </div>
        <div>
          <label for="message">Message</label>
          <textarea id="message" placeholder="I'm interested in your car for sale"></textarea>
          <div class="helper">This message is not stored.</div>
        </div>
      </div>

      <div>
        <label>Generated link</label>
        <div class="output" id="output"></div>
      </div>

      <div class="actions">
        <button class="copy" id="copy">Copy link 📋</button>
        <button class="open" id="open" type="button">Open in WhatsApp ↗️</button>
      </div>
      <div class="status" id="status"></div>
    </section>
  </div>

  <script>
    const areaInput = document.getElementById('area');
    const phoneInput = document.getElementById('phone');
    const messageInput = document.getElementById('message');
    const outputEl = document.getElementById('output');
    const statusEl = document.getElementById('status');
    const copyBtn = document.getElementById('copy');
    const openBtn = document.getElementById('open');

    const STORAGE_AREA_KEY = 'wa_me_area';
    const STORAGE_PHONE_KEY = 'wa_me_phone';

    const sanitizePhone = (value) => value.replace(/\D/g, '');

    const normalizePhone = (area, number) => {
      const areaDigits = sanitizePhone(area);
      const numberDigits = sanitizePhone(number);
      if (!areaDigits || !numberDigits) return null;
      const combined = areaDigits + numberDigits;
      if (combined.length < 8 || combined.length > 15) return null;
      return combined;
    };

    const updateLink = () => {
      const message = messageInput.value.trim();
      statusEl.textContent = '';
      statusEl.classList.remove('error');

      if (!areaInput.value && !phoneInput.value && !message) {
        outputEl.textContent = '';
        return '';
      }

      const normalized = normalizePhone(areaInput.value, phoneInput.value);
      if (!normalized || !message) {
        outputEl.textContent = '';
        return '';
      }

      const encoded = encodeURIComponent(message);
      const link = 'https://wa.me/' + normalized + '?text=' + encoded;
      outputEl.textContent = link;
      return link;
    };

    const loadPhone = () => {
      const savedArea = localStorage.getItem(STORAGE_AREA_KEY);
      const savedPhone = localStorage.getItem(STORAGE_PHONE_KEY);
      if (savedArea) areaInput.value = savedArea;
      if (savedPhone) phoneInput.value = savedPhone;
    };

    const savePhone = () => {
      const areaDigits = sanitizePhone(areaInput.value);
      const phoneDigits = sanitizePhone(phoneInput.value);
      if (areaDigits) {
        localStorage.setItem(STORAGE_AREA_KEY, areaDigits);
      } else {
        localStorage.removeItem(STORAGE_AREA_KEY);
      }
      if (phoneDigits) {
        localStorage.setItem(STORAGE_PHONE_KEY, phoneDigits);
      } else {
        localStorage.removeItem(STORAGE_PHONE_KEY);
      }
    };

    areaInput.addEventListener('input', () => {
      savePhone();
      updateLink();
    });

    phoneInput.addEventListener('input', () => {
      savePhone();
      updateLink();
    });

    messageInput.addEventListener('input', updateLink);

    copyBtn.addEventListener('click', async () => {
      const link = updateLink();
      if (!link) {
        statusEl.textContent = 'Add country/area code, phone number, and message before copying.';
        statusEl.classList.add('error');
        return;
      }
      try {
        await navigator.clipboard.writeText(link);
        statusEl.textContent = 'Copied to clipboard.';
      } catch (err) {
        statusEl.textContent = 'Copy failed. You can manually copy the link above.';
        statusEl.classList.add('error');
      }
    });

    openBtn.addEventListener('click', () => {
      const link = updateLink();
      if (!link) {
        statusEl.textContent = 'Add country/area code, phone number, and message before opening.';
        statusEl.classList.add('error');
        return;
      }
      window.open(link, '_blank', 'noopener');
    });

    loadPhone();
    updateLink();
  </script>
</body>
</html>`;
