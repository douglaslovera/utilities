import { icon, page } from "../layout";

export const instagramImageExtractorHtml = () => page({
  title: "Instagram Image Extractor",
  crumb: "Instagram images",
  styles: `
    .lookup { display: grid; gap: 10px; }
    .combo {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 6px 6px 6px 14px;
      background: var(--surface);
      border: 1px solid var(--line-strong);
      border-radius: 14px;
      box-shadow: var(--shadow);
      transition: border-color 0.15s, box-shadow 0.15s;
    }
    .combo:focus-within { border-color: var(--ink); box-shadow: 0 0 0 3px var(--ring), var(--shadow); }
    .combo > svg { width: 18px; height: 18px; flex: none; color: var(--faint); }
    .combo input { flex: 1; padding: 8px 0; border: 0; background: transparent; }
    .combo input:focus { box-shadow: none; }
    .lookup .hint, .lookup .status { padding: 0 4px; }
    .lookup .status { min-height: 0; }
    .results { display: grid; gap: 16px; }
    .results-head { display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap; }
    .results-title { display: grid; gap: 2px; }
    .summary-extra { font-weight: 400; color: var(--muted); }
    .grid {
      display: grid;
      gap: 12px;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      align-items: start;
    }
    .grid.few { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    .tile {
      margin: 0;
      overflow: hidden;
      background: var(--surface);
      border: 1px solid var(--line);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow);
    }
    .tile img { display: block; width: 100%; height: auto; aspect-ratio: 4 / 5; object-fit: cover; background: var(--surface-2); }
    .tile figcaption {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 6px 6px 6px 12px;
      border-top: 1px solid var(--line);
      font-family: var(--mono);
      font-size: 12px;
    }
    .tile-index { flex: 1; color: var(--muted); }
    .tile-dims { color: var(--faint); }
    .skeleton {
      aspect-ratio: 4 / 5;
      border-radius: var(--radius-lg);
      background: linear-gradient(100deg, var(--surface-2) 30%, var(--line) 50%, var(--surface-2) 70%);
      background-size: 300% 100%;
      animation: shimmer 1.4s ease-in-out infinite;
    }
    @keyframes shimmer { from { background-position: 100% 0; } to { background-position: 0 0; } }
    @media (max-width: 560px) {
      .combo { flex-wrap: wrap; }
      .combo input { flex-basis: 0; min-width: 0; }
      .combo .btn { width: 100%; }
      .grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
      .results-head .btn { width: 100%; }
      .tile-dims { display: none; }
    }`,
  body: `
    <header class="intro">
      <h1>Instagram images</h1>
      <p class="lede">Paste a link to a public post to get every photo at full resolution. Video slides are skipped.</p>
    </header>

    <form class="lookup" id="form">
      <label class="visually-hidden" for="url">Instagram post URL or shortcode</label>
      <div class="combo">
        ${icon("link")}
        <input id="url" type="text" inputmode="url" autocomplete="off" spellcheck="false" placeholder="instagram.com/p/…" required aria-describedby="input-help" />
        <button class="btn btn-primary" id="extract" type="submit">Extract</button>
      </div>
      <div class="hint" id="input-help">Works with /p/, /reel/ and /tv/ links, including ones opened from a profile.</div>
      <div class="status" id="status" role="status" aria-live="polite"></div>
    </form>

    <div class="grid" id="loading" hidden aria-hidden="true">
      <div class="skeleton"></div>
      <div class="skeleton"></div>
      <div class="skeleton"></div>
    </div>

    <section class="results" id="results" hidden aria-label="Extracted images">
      <div class="results-head">
        <div class="results-title">
          <h2 id="summary"></h2>
          <p class="hint" id="multi-hint">Your browser may ask to allow multiple downloads.</p>
        </div>
        <button class="btn btn-secondary" id="download-all" type="button">${icon("download")}Download all</button>
      </div>
      <div class="grid" id="grid"></div>
    </section>

  <script>
    const form = document.getElementById('form');
    const urlInput = document.getElementById('url');
    const extractBtn = document.getElementById('extract');
    const statusEl = document.getElementById('status');
    const loadingEl = document.getElementById('loading');
    const resultsEl = document.getElementById('results');
    const summaryEl = document.getElementById('summary');
    const gridEl = document.getElementById('grid');
    const downloadAllBtn = document.getElementById('download-all');
    const multiHintEl = document.getElementById('multi-hint');
    const icons = { download: '${icon("download")}', external: '${icon("external")}' };
    let images = [];
    let downloading = false;

    const setStatus = (message, error = false) => {
      statusEl.textContent = message;
      statusEl.classList.toggle('error', error);
    };

    const downloadImage = async (image) => {
      const response = await fetch(image.downloadUrl);
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Download failed. Please try again.');
      }
      const blobUrl = URL.createObjectURL(await response.blob());
      const link = document.createElement('a');
      link.href = blobUrl;
      const filename = response.headers.get('content-disposition')?.match(/filename="([^"]+)"/);
      link.download = filename ? filename[1] : 'instagram-' + image.index + '.jpg';
      document.body.appendChild(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(blobUrl), 60000);
    };

    const iconButton = (tag, iconName, label) => {
      const el = document.createElement(tag);
      el.className = 'btn btn-icon';
      el.innerHTML = icons[iconName];
      el.title = label;
      el.setAttribute('aria-label', label);
      return el;
    };

    const renderImages = (data) => {
      images = data.images;
      const skipped = data.skippedVideos
        ? ' · ' + data.skippedVideos + (data.skippedVideos === 1 ? ' video skipped' : ' videos skipped')
        : '';
      summaryEl.textContent = images.length + (images.length === 1 ? ' image' : ' images');
      if (skipped) {
        const extra = document.createElement('span');
        extra.className = 'summary-extra';
        extra.textContent = skipped;
        summaryEl.appendChild(extra);
      }
      downloadAllBtn.hidden = multiHintEl.hidden = images.length < 2;
      gridEl.classList.toggle('few', images.length < 3);
      for (const image of images) {
        const tile = document.createElement('figure');
        tile.className = 'tile';
        const photo = document.createElement('img');
        photo.src = image.previewUrl;
        photo.alt = 'Post image ' + image.index;
        photo.loading = 'lazy';
        // Show the photo uncropped once its real proportions are known.
        if (image.width && image.height) photo.style.aspectRatio = image.width + ' / ' + image.height;
        photo.addEventListener('load', () => { photo.style.aspectRatio = photo.naturalWidth + ' / ' + photo.naturalHeight; });
        photo.addEventListener('error', () => setStatus('An image could not load. Extract the post again to refresh its link.', true));
        const caption = document.createElement('figcaption');
        const index = document.createElement('span');
        index.className = 'tile-index';
        index.textContent = String(image.index).padStart(2, '0');
        const dims = document.createElement('span');
        dims.className = 'tile-dims';
        dims.textContent = image.width ? image.width + (image.height ? '×' + image.height : 'w') : '';
        const download = iconButton('button', 'download', 'Download image ' + image.index);
        download.type = 'button';
        download.addEventListener('click', async () => {
          download.disabled = true;
          try {
            await downloadImage(image);
            setStatus('');
          } catch (error) { setStatus(error.message || 'Download failed. Please try again.', true); }
          finally { download.disabled = false; }
        });
        const original = iconButton('a', 'external', 'Open image ' + image.index + ' in a new tab');
        original.href = image.previewUrl;
        original.target = '_blank';
        original.rel = 'noopener';
        caption.append(index, dims, download, original);
        tile.append(photo, caption);
        gridEl.appendChild(tile);
      }
      resultsEl.hidden = false;
    };

    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      if (downloading || extractBtn.disabled) return;
      extractBtn.disabled = true;
      extractBtn.textContent = 'Extracting…';
      form.setAttribute('aria-busy', 'true');
      resultsEl.hidden = true;
      loadingEl.hidden = false;
      gridEl.replaceChildren();
      images = [];
      setStatus('');
      try {
        const response = await fetch('/api/instagram-images?url=' + encodeURIComponent(urlInput.value.trim()));
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Could not extract this post.');
        renderImages(data);
      } catch (error) {
        setStatus(error.message || 'Could not reach the server. Please try again.', true);
      } finally {
        loadingEl.hidden = true;
        extractBtn.disabled = false;
        extractBtn.textContent = 'Extract';
        form.removeAttribute('aria-busy');
      }
    });

    downloadAllBtn.addEventListener('click', async () => {
      if (downloading || !images.length) return;
      downloading = true;
      downloadAllBtn.disabled = true;
      extractBtn.disabled = true;
      let completed = 0;
      try {
        for (const image of images) {
          setStatus('Downloading ' + (completed + 1) + ' of ' + images.length + '…');
          await downloadImage(image);
          completed++;
        }
        setStatus('Started ' + completed + ' downloads.');
      } catch (error) {
        setStatus(completed + ' downloads started. ' + (error.message || 'Download failed. Please try again.'), true);
      } finally {
        downloading = false;
        downloadAllBtn.disabled = false;
        extractBtn.disabled = false;
      }
    });
  </script>`,
});
