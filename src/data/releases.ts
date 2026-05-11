export const releasesUrl = "https://github.com/SiliWard/friday-desktop-pet/releases";
const releasesApi = "https://api.github.com/repos/SiliWard/friday-desktop-pet/releases";

interface GitHubAsset {
  name: string;
  browser_download_url: string;
  size: number;
}

interface GitHubRelease {
  tag_name: string;
  name: string | null;
  body: string | null;
  html_url: string;
  published_at: string;
  prerelease: boolean;
  assets: GitHubAsset[];
}

export interface WindowsRelease {
  version: string;
  tagName: string;
  name: string;
  date: string;
  releaseUrl: string;
  notes: string[];
  exe: {
    name: string;
    url: string;
    sizeLabel: string;
  };
}

const fallbackReleases: WindowsRelease[] = [
  {
    version: "0.1.0",
    tagName: "v0.1.0",
    name: "Friday 0.1.0",
    date: "2026/05/11",
    releaseUrl: `${releasesUrl}/tag/v0.1.0`,
    notes: ["Initial public Windows build for Friday."],
    exe: {
      name: "Friday.Setup.0.1.0.exe",
      url: `${releasesUrl}/download/v0.1.0/Friday.Setup.0.1.0.exe`,
      sizeLabel: "99.3 MB"
    }
  }
];

function formatBytes(bytes: number): string {
  const mib = bytes / 1024 / 1024;
  return `${mib.toFixed(1)} MB`;
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).format(new Date(value));
}

function extractNotes(body: string | null): string[] {
  if (!body) {
    return [];
  }

  return body
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.startsWith("- "))
    .map((line) => line.replace(/^- /, ""))
    .slice(0, 8);
}

export async function getWindowsReleases(): Promise<WindowsRelease[]> {
  const response = await fetch(releasesApi, {
    headers: {
      Accept: "application/vnd.github+json"
    }
  });

  if (!response.ok) {
    return fallbackReleases;
  }

  const releases = (await response.json()) as GitHubRelease[];

  const windowsReleases = releases
    .filter((release) => !release.prerelease)
    .map((release) => {
      const exe = release.assets.find((asset) => asset.name.toLowerCase().endsWith(".exe"));

      if (!exe) {
        return null;
      }

      return {
        version: release.tag_name.replace(/^v/i, ""),
        tagName: release.tag_name,
        name: release.name ?? release.tag_name,
        date: formatDate(release.published_at),
        releaseUrl: release.html_url,
        notes: extractNotes(release.body),
        exe: {
          name: exe.name,
          url: exe.browser_download_url,
          sizeLabel: formatBytes(exe.size)
        }
      };
    })
    .filter((release): release is WindowsRelease => release !== null);

  return windowsReleases.length > 0 ? windowsReleases : fallbackReleases;
}
