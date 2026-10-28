import { icon, page } from "./layout";

const tools = [
  { href: "/wa-me-creator", icon: "chat", name: "WhatsApp link", description: "Generate wa.me links with a prefilled message." },
  { href: "/instagram-image-extractor", icon: "image", name: "Instagram images", description: "Download every photo from a public post." },
];

export const homePageHtml = () => page({
  title: "Utilities",
  styles: `
    .tools {
      display: grid;
      overflow: hidden;
      background: var(--surface);
      border: 1px solid var(--line);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow);
    }
    .tool {
      display: grid;
      grid-template-columns: auto 1fr auto;
      gap: 14px;
      align-items: center;
      padding: 16px 18px;
      color: inherit;
      text-decoration: none;
      transition: background 0.15s;
    }
    .tool + .tool { border-top: 1px solid var(--line); }
    .tool:hover { background: var(--surface-2); }
    .tool-icon {
      width: 38px;
      height: 38px;
      display: grid;
      place-items: center;
      border-radius: var(--radius);
      background: var(--surface-2);
      border: 1px solid var(--line);
      color: var(--ink);
    }
    .tool-icon svg { width: 18px; height: 18px; }
    .tool-text { display: grid; gap: 2px; min-width: 0; }
    .tool-name { font-weight: 500; }
    .tool-desc { font-size: 14px; color: var(--muted); }
    .tool-arrow { width: 16px; height: 16px; color: var(--faint); transition: transform 0.15s, color 0.15s; }
    .tool-arrow svg { width: 16px; height: 16px; display: block; }
    .tool:hover .tool-arrow { transform: translateX(3px); color: var(--ink); }`,
  body: `
    <header class="intro">
      <h1>Utilities</h1>
      <p class="lede">Small tools for friends and family. More coming soon.</p>
    </header>

    <nav class="tools" aria-label="Tools">${tools.map((tool) => `
      <a class="tool" href="${tool.href}">
        <span class="tool-icon">${icon(tool.icon)}</span>
        <span class="tool-text">
          <span class="tool-name">${tool.name}</span>
          <span class="tool-desc">${tool.description}</span>
        </span>
        <span class="tool-arrow">${icon("arrow")}</span>
      </a>`).join("")}
    </nav>`,
});
