export function formatPath(path: string, params?: Record<string, any>) {
  if (!params) return path;
  return Object.keys(params).reduce((p, key) => {
    const val = params[key];
    if (val === undefined || val === null) return p;
    return p.replace(new RegExp(`:${key}(?=/|$)`, "g"), encodeURIComponent(String(val)));
  }, path);
}