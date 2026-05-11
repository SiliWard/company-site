export const characterPacksUrl = "https://github.com/SiliWard/friday-character-assets/releases";
const characterPacksApi = "https://api.github.com/repos/SiliWard/friday-character-assets/releases";

interface GitHubAsset {
  name: string;
  browser_download_url: string;
  size: number;
}

interface GitHubRelease {
  tag_name: string;
  name: string | null;
  html_url: string;
  published_at: string;
  prerelease: boolean;
  assets: GitHubAsset[];
}

export interface CharacterPack {
  name: string;
  version: string;
  tagName: string;
  date: string;
  releaseUrl: string;
  file: {
    name: string;
    url: string;
    sizeLabel: string;
  };
}

const fallbackCharacterPacks: CharacterPack[] = [
  {
    name: "Neru",
    version: "0.1.0",
    tagName: "v0.1.0",
    date: "2026/05/11",
    releaseUrl: `${characterPacksUrl}/tag/v0.1.0`,
    file: {
      name: "Neru_state.zip",
      url: `${characterPacksUrl}/download/v0.1.0/Neru_state.zip`,
      sizeLabel: "10.2 MB"
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

function packNameFromAsset(assetName: string): string {
  return assetName.replace(/_state\.zip$/i, "").replace(/[-_]+/g, " ").trim() || "Character Pack";
}

export async function getCharacterPacks(): Promise<CharacterPack[]> {
  const response = await fetch(characterPacksApi, {
    headers: {
      Accept: "application/vnd.github+json"
    }
  });

  if (!response.ok) {
    return fallbackCharacterPacks;
  }

  const releases = (await response.json()) as GitHubRelease[];

  const packs = releases
    .filter((release) => !release.prerelease)
    .flatMap((release) => {
      return release.assets
        .filter((asset) => asset.name.toLowerCase().endsWith(".zip"))
        .map((asset) => ({
          name: packNameFromAsset(asset.name),
          version: release.tag_name.replace(/^v/i, ""),
          tagName: release.tag_name,
          date: formatDate(release.published_at),
          releaseUrl: release.html_url,
          file: {
            name: asset.name,
            url: asset.browser_download_url,
            sizeLabel: formatBytes(asset.size)
          }
        }));
    });

  return packs.length > 0 ? packs : fallbackCharacterPacks;
}
