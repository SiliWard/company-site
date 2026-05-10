const base = import.meta.env.BASE_URL.replace(/\/$/, "");

const hasScheme = (href: string) => /^[a-z][a-z\d+\-.]*:/i.test(href);

export function withBase(href: string): string {
  if (!href.startsWith("/") || href.startsWith("//") || hasScheme(href)) {
    return href;
  }

  if (href === "/") {
    return `${base}/`;
  }

  return `${base}${href}`;
}

