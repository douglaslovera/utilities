import { homePageHtml } from "./pages/home";
import { waMeCreatorHtml } from "./pages/wa-me-creator";

const htmlResponse = (body: string, status = 200) =>
  new Response(body, {
    status,
    headers: {
      "content-type": "text/html; charset=utf-8",
    },
  });

const normalizePath = (path: string) => {
  if (path !== "/" && path.endsWith("/")) {
    return path.slice(0, -1);
  }
  return path;
};

export default {
  fetch(request: Request) {
    const url = new URL(request.url);
    const path = normalizePath(url.pathname);

    if (path === "/") {
      return htmlResponse(homePageHtml());
    }

    if (path === "/wa-me-creator") {
      return htmlResponse(waMeCreatorHtml());
    }

    return htmlResponse(
      `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Not Found</title>
  <style>
    body { margin: 0; font-family: system-ui, sans-serif; display: grid; place-items: center; min-height: 100vh; background: #f6f4ef; color: #1c1c1c; }
    a { color: #0b7a3b; text-decoration: none; font-weight: 600; }
  </style>
</head>
<body>
  <div>
    <h1>404</h1>
    <p>That page doesn't exist. <a href="/">Back to utilities</a></p>
  </div>
</body>
</html>`,
      404
    );
  },
};
