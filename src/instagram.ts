type Media = Record<string, any>;
type Image = { src: string; width: number; height: number; index: number };
type Extraction = { images: Image[]; skippedVideos: number };

class InstagramError extends Error {
  status: number;

  constructor(message: string, status = 502) {
    super(message);
    this.status = status;
  }
}

const shortcodePattern = /^[A-Za-z0-9_-]{1,64}$/;
const instagramHeaders = {
  "User-Agent": "Mozilla/5.0",
};

const jsonResponse = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" },
  });

const errorResponse = (error: unknown) =>
  jsonResponse({ error: error instanceof InstagramError ? error.message : "Could not reach Instagram. Please try again later." },
    error instanceof InstagramError ? error.status : 503);

export const parseInstagramShortcode = (input: string) => {
  const value = input.trim();
  if (shortcodePattern.test(value)) return value;
  try {
    const url = new URL(value.replace(/^(?=(?:www\.|m\.)?instagram\.com\/)/i, "https://"));
    // Posts opened from a profile include the username: /<username>/p/<shortcode>/.
    const match = url.pathname.match(/^\/(?:[A-Za-z0-9._]{1,30}\/)?(?:p|reel|tv)\/([A-Za-z0-9_-]{1,64})\/?$/);
    if (["https:", "http:"].includes(url.protocol) &&
        ["instagram.com", "www.instagram.com", "m.instagram.com"].includes(url.hostname) &&
        !url.username && !url.password && !url.port && match) return match[1];
  } catch {}
  throw new InstagramError("Enter an Instagram post URL (/p/, /reel/, or /tv/) or a bare shortcode.", 400);
};

const cdnUrl = (input: unknown) => {
  if (typeof input !== "string") return null;
  try {
    const url = new URL(input);
    if (url.protocol === "https:" && !url.username && !url.password && !url.port &&
        (url.hostname.endsWith(".cdninstagram.com") || url.hostname.endsWith(".fbcdn.net"))) return url;
  } catch {}
  return null;
};

const largestImage = (media: Media) => {
  const candidates = [
    ...(Array.isArray(media.display_resources) ? media.display_resources.map((item: Media) => ({
      src: item.src, width: item.config_width, height: item.config_height,
    })) : []),
    ...(Array.isArray(media.image_versions2?.candidates) ? media.image_versions2.candidates.map((item: Media) => ({
      src: item.url, width: item.width, height: item.height,
    })) : []),
    { src: media.display_url, width: media.dimensions?.width, height: media.dimensions?.height },
  ].filter((item) => cdnUrl(item.src)).map((item) => ({
    src: item.src as string,
    width: Number(item.width) > 0 ? Number(item.width) : 0,
    height: Number(item.height) > 0 ? Number(item.height) : 0,
  }));
  candidates.sort((a, b) => (b.width * b.height - a.width * a.height) || b.width - a.width);
  return candidates[0];
};

export const extractMedia = (media: Media): Extraction => {
  const sidecar = media.edge_sidecar_to_children;
  const children = sidecar?.edges?.map((edge: Media) => edge.node) ?? media.carousel_media;
  const isCarousel = /Sidecar$/.test(media.__typename ?? "") || Number(media.media_type) === 8 || children != null;
  if (isCarousel && (!Array.isArray(children) || !children.length || sidecar?.page_info?.has_next_page ||
      Number(media.carousel_media_count ?? sidecar?.count ?? children.length) > children.length)) {
    throw new InstagramError("Instagram did not expose every carousel slide. Please try again later.");
  }
  const images: Image[] = [];
  let skippedVideos = 0;
  for (const [offset, item] of (isCarousel ? children : [media]).entries()) {
    if (!item || typeof item !== "object") throw new InstagramError("Instagram returned incomplete media data.");
    if (item.is_video === true || Number(item.media_type) === 2 || /Video$/.test(item.__typename ?? "") ||
        item.video_url || item.video_versions?.length) {
      skippedVideos++;
      continue;
    }
    if (!(item.is_video === false || Number(item.media_type) === 1 || /Image$/.test(item.__typename ?? ""))) {
      throw new InstagramError("Instagram did not identify this slide as an image or a video.");
    }
    const image = largestImage(item);
    if (!image) throw new InstagramError("Instagram did not expose an original image for every photo. Please try again later.");
    images.push({ ...image, index: offset + 1 });
  }
  return { images, skippedVideos };
};

const findMedia = (value: unknown, shortcode: string, depth = 0): Media | null => {
  if (!value || typeof value !== "object" || depth > 30) return null;
  const object = value as Media;
  for (const key of ["shortcode_media", "xdt_shortcode_media"]) {
    const media = object[key];
    if (media && (!media.shortcode || media.shortcode === shortcode)) return media;
  }
  if ((object.shortcode === shortcode || object.code === shortcode) &&
      (object.media_type != null || object.is_video != null || /(?:Image|Video|Sidecar)$/.test(object.__typename ?? ""))) return object;
  for (const child of Object.values(object)) {
    const found = findMedia(child, shortcode, depth + 1);
    if (found) return found;
  }
  return null;
};

const decodeHtml = (value: string) => value.replace(/&(?:amp|quot|apos|lt|gt|#(?:\d+|x[\da-f]+));/gi, (entity) => {
  const named: Record<string, string> = { "&amp;": "&", "&quot;": '"', "&apos;": "'", "&lt;": "<", "&gt;": ">" };
  if (named[entity.toLowerCase()]) return named[entity.toLowerCase()];
  const hex = entity.toLowerCase().startsWith("&#x");
  const code = parseInt(entity.slice(hex ? 3 : 2, -1), hex ? 16 : 10);
  return code <= 0x10ffff ? String.fromCodePoint(code) : entity;
});

const attribute = (tag: string, name: string) => {
  const match = tag.match(new RegExp('\\s' + name + '\\s*=\\s*(?:"([^"]*)"|\'([^\']*)\')', "i"));
  return match ? decodeHtml(match[1] ?? match[2]) : "";
};

export const parseInstagramEmbed = (html: string, shortcode: string): Extraction | null => {
  for (const script of html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi)) {
    const text = script[1].trim();
    const payloads = [text];
    for (const match of text.matchAll(/"contextJSON"\s*:\s*("(?:\\.|[^"\\])*")/g)) {
      try { payloads.push(JSON.parse(match[1])); } catch {}
    }
    const legacy = text.match(/(?:window\._sharedData\s*=\s*|__additionalDataLoaded\s*\([^,]+,\s*)(\{[\s\S]*\})\s*\)?\s*;?\s*$/);
    if (legacy) payloads.push(legacy[1]);
    for (const payload of payloads) {
      let parsed: unknown;
      try { parsed = JSON.parse(payload); } catch { continue; }
      const media = findMedia(parsed, shortcode);
      if (media) return extractMedia(media);
    }
  }
  // Simple embeds have explicit media types; a sidecar's cover is never a complete result.
  const embed = Array.from(html.matchAll(/<div\b[^>]*>/gi)).map((match) => match[0])
    .find((tag) => attribute(tag, "class").split(/\s+/).includes("Embed"));
  if (!embed) return null;
  const type = attribute(embed, "data-media-type");
  if (type === "GraphVideo" || type === "XDTGraphVideo") return { images: [], skippedVideos: 1 };
  if (type !== "GraphImage" && type !== "XDTGraphImage") return null;
  const tag = Array.from(html.matchAll(/<img\b[^>]*>/gi)).map((match) => match[0])
    .find((item) => attribute(item, "class").split(/\s+/).includes("EmbeddedMediaImage"));
  if (!tag) return null;
  const candidates = attribute(tag, "srcset").split(",").map((part) => {
    const match = part.trim().match(/^(\S+)\s+(\d+)w$/);
    return match ? { src: match[1], config_width: Number(match[2]), config_height: 0 } : null;
  }).filter((item) => item !== null);
  return extractMedia({ __typename: type, display_url: attribute(tag, "src"), display_resources: candidates });
};

const fetchInstagram = async (url: string, extraHeaders: Record<string, string> = {}) => {
  const response = await fetch(url, {
    headers: { ...instagramHeaders, ...extraHeaders },
    redirect: "manual",
    signal: AbortSignal.timeout(15000),
  });
  if (response.status === 404 || response.status === 410) {
    throw new InstagramError("This post is private, missing, or unavailable to people who are not logged in.", 404);
  }
  if ([301, 302, 303, 307, 308, 401, 403, 429].includes(response.status)) {
    throw new InstagramError("Instagram is blocking anonymous requests or rate limiting this server. Please try again later.", 503);
  }
  if (!response.ok) throw new InstagramError("Instagram is temporarily unavailable. Please try again later.", 503);
  const text = await response.text();
  if (/"(?:require_login|login_required)"\s*:\s*true|"status"\s*:\s*"fail"|challenge_required|checkpoint_required|please wait a few minutes/i.test(text)) {
    throw new InstagramError("Instagram is blocking anonymous requests or rate limiting this server. Please try again later.", 503);
  }
  return text;
};

export const instagramImagesResponse = async (url: URL) => {
  try {
    const shortcode = parseInstagramShortcode(url.searchParams.get("url") ?? "");
    let result: Extraction | null = null;
    let embedError: unknown;
    try {
      const html = await fetchInstagram(`https://www.instagram.com/p/${shortcode}/embed/captioned/`);
      result = parseInstagramEmbed(html, shortcode);
      if (!result && /this (?:account|post) is private|private account|page not found|page (?:isn't|is not) available|post (?:is )?unavailable|content (?:isn't|is not) available|photo or video has been removed/i.test(html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, ""))) {
        embedError = new InstagramError("This post is private, missing, or unavailable to people who are not logged in.", 404);
      }
    } catch (error) { embedError = error; }
    if (!result) {
      // Instagram rotates this persisted query ID; keep the public embed as the primary source.
      const query = new URL("https://www.instagram.com/graphql/query");
      query.searchParams.set("doc_id", "8845758582119845");
      query.searchParams.set("variables", JSON.stringify({
        shortcode, fetch_tagged_user_count: null, hoisted_comment_id: null, hoisted_reply_id: null,
      }));
      try {
        const text = await fetchInstagram(query.href, { "X-IG-App-ID": "936619743392459" });
        let data: Media;
        try { data = JSON.parse(text); } catch {
          throw new InstagramError("Instagram requires a login or is blocking anonymous requests. Please try again later.", 503);
        }
        const media = findMedia(data, shortcode);
        if (media) result = extractMedia(media);
        else if (data.data && (data.data.xdt_shortcode_media === null || data.data.shortcode_media === null)) {
          throw new InstagramError("This post is private, missing, or unavailable to people who are not logged in.", 404);
        }
      } catch (error) {
        if (embedError instanceof InstagramError && embedError.status === 404) throw embedError;
        throw error;
      }
    }
    if (!result) throw embedError ?? new InstagramError("Instagram did not expose the complete post data. Please try again later.");
    if (!result.images.length) throw new InstagramError("This post contains only videos. There are no images to download.", 422);
    return jsonResponse({
      shortcode,
      postUrl: `https://www.instagram.com/p/${shortcode}/`,
      skippedVideos: result.skippedVideos,
      images: result.images.map(({ src, ...image }) => {
        const query = new URLSearchParams({ src, shortcode, n: String(image.index) });
        return { ...image, downloadUrl: `/api/instagram-image?${query}`, previewUrl: `/api/instagram-image?${query}&inline=1` };
      }),
    });
  } catch (error) { return errorResponse(error); }
};

export const instagramImageResponse = async (url: URL) => {
  try {
    const src = cdnUrl(url.searchParams.get("src"));
    const shortcode = url.searchParams.get("shortcode") ?? "";
    const index = url.searchParams.get("n") ?? "";
    if (!src || !shortcodePattern.test(shortcode) || !/^[1-9]\d{0,2}$/.test(index)) {
      throw new InstagramError("Invalid image URL. Only HTTPS Instagram and Facebook CDN images are allowed.", 400);
    }
    const response = await fetch(src.href, {
      headers: { "User-Agent": instagramHeaders["User-Agent"], Accept: "image/*" },
      redirect: "manual",
      signal: AbortSignal.timeout(20000),
    });
    const type = response.headers.get("content-type")?.split(";")[0].trim().toLowerCase() ?? "";
    const extensions: Record<string, string> = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "image/avif": "avif", "image/gif": "gif" };
    if (!response.ok || !extensions[type]) {
      await response.body?.cancel();
      throw new InstagramError("The image expired or Instagram blocked the download. Extract the post again and retry.");
    }
    return new Response(response.body, {
      headers: {
        "content-type": type,
        "content-disposition": `${url.searchParams.get("inline") === "1" ? "inline" : "attachment"}; filename="${shortcode}-${index}.${extensions[type]}"`,
        "cache-control": "private, max-age=300",
        "x-content-type-options": "nosniff",
        "content-security-policy": "default-src 'none'; sandbox",
      },
    });
  } catch (error) { return errorResponse(error); }
};
