import { icon, page } from "../layout";

export const waMeCreatorHtml = () => page({
  title: "WhatsApp Link Generator",
  crumb: "WhatsApp link",
  styles: `
    fieldset { margin: 0; padding: 0; border: 0; min-width: 0; }
    legend { padding: 0; margin-bottom: 8px; }
    .phone { display: grid; gap: 8px; grid-template-columns: 96px minmax(0, 1fr); }
    .prefixed { position: relative; }
    .prefixed::before {
      content: "+";
      position: absolute;
      left: 12px;
      top: 50%;
      transform: translateY(-50%);
      color: var(--faint);
      pointer-events: none;
    }
    .prefixed input { padding-left: 24px; }
    .result {
      display: grid;
      gap: 14px;
      padding-top: 20px;
      border-top: 1px solid var(--line);
    }
    .output {
      min-height: 46px;
      padding: 12px 14px;
      font-family: var(--mono);
      font-size: 13px;
      line-height: 1.6;
      overflow-wrap: anywhere;
      background: var(--surface-2);
      border: 1px solid var(--line);
      border-radius: var(--radius);
    }
    .output:empty::before { content: "Your link will appear here"; color: var(--faint); }
    .actions { display: flex; gap: 8px 12px; flex-wrap: wrap; align-items: center; }
    .actions .status { min-height: 0; }
    @media (max-width: 560px) {
      .actions .btn { flex: 1; }
      .actions .status { flex-basis: 100%; }
    }`,
  body: `
    <header class="intro">
      <h1>WhatsApp link generator</h1>
      <p class="lede">Enter a phone number and a message to get a wa.me link you can share or open.</p>
    </header>

    <section class="panel">
      <fieldset class="field">
        <legend class="label">Phone number</legend>
        <div class="phone">
          <div class="prefixed">
            <label class="visually-hidden" for="area">Country code</label>
            <input id="area" type="tel" inputmode="numeric" autocomplete="tel-country-code" placeholder="1" />
          </div>
          <div>
            <label class="visually-hidden" for="phone">Number</label>
            <input id="phone" type="tel" inputmode="numeric" autocomplete="tel-national" placeholder="555 123 4567" />
          </div>
        </div>
        <div class="hint">Country code, then the number. Saved on this device for next time.</div>
      </fieldset>

      <div class="field">
        <label class="label" for="message">Message</label>
        <textarea id="message" placeholder="Hi! I'm interested in your car for sale."></textarea>
        <div class="hint">Messages are never stored.</div>
      </div>

      <div class="result">
        <div class="field">
          <span class="label">Link</span>
          <div class="output" id="output"></div>
        </div>
        <div class="actions">
          <button class="btn btn-primary" id="copy" type="button">${icon("copy")}Copy link</button>
          <button class="btn btn-secondary" id="open" type="button">${icon("external")}Open in WhatsApp</button>
          <div class="status" id="status" role="status" aria-live="polite"></div>
        </div>
      </div>
    </section>

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

    const sanitizePhone = (value) => value.replace(/\\D/g, '');

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
        statusEl.textContent = 'Add a country code, phone number, and message before copying.';
        statusEl.classList.add('error');
        return;
      }
      try {
        await navigator.clipboard.writeText(link);
        statusEl.textContent = 'Copied to clipboard.';
      } catch (err) {
        statusEl.textContent = 'Copy failed. You can copy the link above manually.';
        statusEl.classList.add('error');
      }
    });

    openBtn.addEventListener('click', () => {
      const link = updateLink();
      if (!link) {
        statusEl.textContent = 'Add a country code, phone number, and message before opening.';
        statusEl.classList.add('error');
        return;
      }
      window.open(link, '_blank', 'noopener');
    });

    loadPhone();
    updateLink();
  </script>`,
});
