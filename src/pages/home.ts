export const homePageHtml = () => `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Utilities</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&display=swap');
    :root {
      --bg: #f6f4ef;
      --ink: #1c1c1c;
      --muted: #5a5a5a;
      --card: #ffffff;
      --accent: #0b7a3b;
      --border: #e4e1da;
      --shadow: 0 12px 30px rgba(0, 0, 0, 0.08);
      --radius: 16px;
      --sans: "Space Grotesk", "Inter", system-ui, -apple-system, Segoe UI, Roboto, "Helvetica Neue", Arial, sans-serif;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      font-family: var(--sans);
      color: var(--ink);
      background: radial-gradient(circle at top, #ffffff 0%, #f0eee7 45%, #e9e6df 100%);
      min-height: 100vh;
      padding: 40px 20px 80px;
    }
    .shell {
      max-width: 1100px;
      margin: 0 auto;
      display: grid;
      gap: 28px;
    }
    header {
      display: grid;
      gap: 10px;
    }
    h1 {
      margin: 0;
      font-size: clamp(2.4rem, 4vw, 3.4rem);
      letter-spacing: -0.02em;
    }
    p {
      margin: 0;
      color: var(--muted);
      font-size: 1rem;
    }
    .grid {
      display: grid;
      gap: 18px;
      grid-template-columns: repeat(3, minmax(0, 1fr));
    }
    .card {
      display: grid;
      gap: 12px;
      padding: 20px;
      border-radius: var(--radius);
      border: 1px solid var(--border);
      background: var(--card);
      box-shadow: var(--shadow);
      text-decoration: none;
      color: inherit;
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    }
    .card:hover {
      transform: translateY(-4px);
      box-shadow: 0 18px 40px rgba(0, 0, 0, 0.12);
    }
    .card h2 {
      margin: 0;
      font-size: 1.4rem;
    }
    .card span {
      color: var(--muted);
    }
    @media (max-width: 900px) {
      .grid {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }
    }
    @media (max-width: 640px) {
      .grid {
        grid-template-columns: 1fr;
      }
    }
  </style>
</head>
<body>
  <div class="shell">
    <header>
      <h1>Utilities</h1>
      <p>Small tools for friends and family. More coming soon.</p>
    </header>

    <section class="grid">
      <a class="card" href="/wa-me-creator">
        <h2>WA.me Creator</h2>
        <span>Generate WhatsApp links fast.</span>
      </a>
    </section>
  </div>
</body>
</html>`;
