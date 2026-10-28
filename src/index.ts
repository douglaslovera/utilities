import { homePageHtml } from "./pages/home";
import { page } from "./pages/layout";
import { waMeCreatorHtml } from "./pages/wa-me-creator";
import { instagramImageExtractorHtml } from "./pages/instagram-image-extractor";
import { instagramImageResponse, instagramImagesResponse } from "./instagram";

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

    if (path === "/instagram-image-extractor") {
      return htmlResponse(instagramImageExtractorHtml());
    }

    if (path === "/api/instagram-images" || path === "/api/instagram-image") {
      if (request.method !== "GET") {
        return new Response(JSON.stringify({ error: "Use GET for this endpoint." }), {
          status: 405,
          headers: { "content-type": "application/json; charset=utf-8", allow: "GET" },
        });
      }
      return path === "/api/instagram-images" ? instagramImagesResponse(url) : instagramImageResponse(url);
    }

    return htmlResponse(
      page({
        title: "Not Found",
        body: `
    <header class="intro">
      <h1>Page not found</h1>
      <p class="lede">That page doesn't exist. <a href="/" style="color: var(--ink);">Back to utilities</a></p>
    </header>`,
      }),
      404
    );
  },
};
