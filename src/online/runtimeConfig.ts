declare const __SHUANGLU_API_ORIGIN__: string | undefined;
declare const __SHUANGLU_WEB_ORIGIN__: string | undefined;

function configuredApiOrigin(): string {
  return typeof __SHUANGLU_API_ORIGIN__ === "string"
    ? __SHUANGLU_API_ORIGIN__.trim()
    : "";
}

function configuredWebOrigin(): string {
  return typeof __SHUANGLU_WEB_ORIGIN__ === "string"
    ? __SHUANGLU_WEB_ORIGIN__.trim()
    : "";
}

function withOrigin(path: string, origin: string): string {
  if (!origin) return path;
  return new URL(path, `${origin.replace(/\/$/, "")}/`).toString();
}

export function onlineApiUrl(path: string): string {
  return withOrigin(path, configuredApiOrigin());
}

export function roomShareUrl(roomId: string): string {
  const origin =
    configuredWebOrigin() ||
    (typeof window !== "undefined" ? window.location.origin : "");
  return withOrigin(`/?room=${encodeURIComponent(roomId)}`, origin);
}
