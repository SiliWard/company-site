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
  slug: string;
  name: string;
  version: string;
  tagName: string;
  date: string;
  releaseUrl: string;
  states: CharacterPackState[];
  file: {
    name: string;
    url: string;
    sizeLabel: string;
  };
}

export interface CharacterPackState {
  name: string;
  label: string;
  imageUrl: string;
}

const rawAssetsUrl = "https://raw.githubusercontent.com/SiliWard/friday-character-assets/main/packs";

const stateLabels = [
  ["Idle", "待机"],
  ["Talking", "对话"],
  ["Happy", "开心"],
  ["Thinking", "思考"],
  ["Reminder", "提醒"],
  ["Confused", "困惑"],
  ["Dragging", "拖拽"],
  ["Urgent", "紧急"],
  ["Rest", "休息"],
  ["Sleepy", "困倦"]
] as const;

const packMeta = {
  luko: {
    name: "Luko",
    folder: "Luko_state"
  },
  neru: {
    name: "Neru",
    folder: "Neru_state"
  }
} as const;

const fallbackCharacterPacks: CharacterPack[] = [
  {
    slug: "luko",
    name: "Luko",
    version: "0.1.1",
    tagName: "v0.1.1",
    date: "2026/05/12",
    releaseUrl: `${characterPacksUrl}/tag/v0.1.1`,
    states: statesForFolder("Luko_state"),
    file: {
      name: "Luko_state.zip",
      url: `${characterPacksUrl}/download/v0.1.1/Luko_state.zip`,
      sizeLabel: "6.5 MB"
    }
  },
  {
    slug: "neru",
    name: "Neru",
    version: "0.1.0",
    tagName: "v0.1.0",
    date: "2026/05/11",
    releaseUrl: `${characterPacksUrl}/tag/v0.1.0`,
    states: statesForFolder("Neru_state"),
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

function slugFromAsset(assetName: string): string {
  return assetName.replace(/_state\.zip$/i, "").replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "").toLowerCase() || "character-pack";
}

function statesForFolder(folder: string): CharacterPackState[] {
  return stateLabels.map(([name, label]) => ({
    name,
    label,
    imageUrl: `${rawAssetsUrl}/${folder}/_${name}_.png`
  }));
}

function metaForAsset(assetName: string): { slug: string; name: string; folder: string } {
  const slug = slugFromAsset(assetName);
  const meta = packMeta[slug as keyof typeof packMeta];
  const fallbackName = assetName.replace(/_state\.zip$/i, "").replace(/[-_]+/g, " ").trim() || "Character Pack";

  return {
    slug,
    name: meta?.name ?? fallbackName,
    folder: meta?.folder ?? assetName.replace(/\.zip$/i, "")
  };
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
        .map((asset) => {
          const meta = metaForAsset(asset.name);

          return {
            slug: meta.slug,
            name: meta.name,
            version: release.tag_name.replace(/^v/i, ""),
            tagName: release.tag_name,
            date: formatDate(release.published_at),
            releaseUrl: release.html_url,
            states: statesForFolder(meta.folder),
            file: {
              name: asset.name,
              url: asset.browser_download_url,
              sizeLabel: formatBytes(asset.size)
            }
          };
        });
    });

  return packs.length > 0 ? packs : fallbackCharacterPacks;
}
