import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
export const parseStringify = (value: unknown) =>
  JSON.parse(JSON.stringify(value));

export const convertFileToUrl = (file: File) => URL.createObjectURL(file);

const KB = 1024;
const MB = KB * KB;
const GB = MB * KB;

export const convertFileSize = (sizeInBytes: number, digits: number = 1) => {
  if (sizeInBytes < KB) return `${sizeInBytes} Bytes`;
  if (sizeInBytes < MB) return `${(sizeInBytes / KB).toFixed(digits)} KB`;
  if (sizeInBytes < GB) return `${(sizeInBytes / MB).toFixed(digits)} MB`;
  return `${(sizeInBytes / GB).toFixed(digits)} GB`;
};

export const calculatePercentage = (sizeInBytes: number) => {
  const totalSizeInBytes = 2 * 1024 * 1024 * 1024; // 2GB in bytes
  const percentage = (sizeInBytes / totalSizeInBytes) * 100;
  return Number(percentage.toFixed(2));
};

// Optimized with Set for O(1) lookups instead of O(n) array.includes()
const FILE_TYPE_SETS = {
  document: new Set([
    "pdf", "doc", "docx", "txt", "xls", "xlsx", "csv", "rtf", "ods",
    "ppt", "odp", "md", "html", "htm", "epub", "pages", "fig", "psd",
    "ai", "indd", "xd", "sketch", "afdesign", "afphoto"
  ]),
  image: new Set(["jpg", "jpeg", "png", "gif", "bmp", "svg", "webp"]),
  video: new Set(["mp4", "avi", "mov", "mkv", "webm"]),
  audio: new Set(["mp3", "wav", "ogg", "flac"])
};

export const getFileType = (fileName: string): { type: string; extension: string } => {
  const lastDotIndex = fileName.lastIndexOf('.');
  if (lastDotIndex === -1) return { type: "other", extension: "" };
  
  const extension = fileName.slice(lastDotIndex + 1).toLowerCase();
  if (!extension) return { type: "other", extension: "" };

  for (const [type, extensions] of Object.entries(FILE_TYPE_SETS)) {
    if (extensions.has(extension)) {
      return { type, extension };
    }
  }

  return { type: "other", extension };
};

const MONTH_NAMES = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];

export const formatDateTime = (isoString: string | null | undefined): string => {
  if (!isoString) return "—";

  const date = new Date(isoString);
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const period = hours >= 12 ? "pm" : "am";
  const formattedHours = hours % 12 || 12;
  const formattedMinutes = minutes.toString().padStart(2, "0");
  const day = date.getDate();
  const month = MONTH_NAMES[date.getMonth()];

  return `${formattedHours}:${formattedMinutes}${period}, ${day} ${month}`;
};

// Optimized with Map for O(1) icon lookups
const FILE_ICON_MAP = new Map<string, string>([
  // Documents
  ["pdf", "/assets/icons/file-pdf.svg"],
  ["doc", "/assets/icons/file-doc.svg"],
  ["docx", "/assets/icons/file-docx.svg"],
  ["csv", "/assets/icons/file-csv.svg"],
  ["txt", "/assets/icons/file-txt.svg"],
  ["xls", "/assets/icons/file-document.svg"],
  ["xlsx", "/assets/icons/file-document.svg"],
  // Image
  ["svg", "/assets/icons/file-image.svg"],
  // Video
  ["mkv", "/assets/icons/file-video.svg"],
  ["mov", "/assets/icons/file-video.svg"],
  ["avi", "/assets/icons/file-video.svg"],
  ["wmv", "/assets/icons/file-video.svg"],
  ["mp4", "/assets/icons/file-video.svg"],
  ["flv", "/assets/icons/file-video.svg"],
  ["webm", "/assets/icons/file-video.svg"],
  ["m4v", "/assets/icons/file-video.svg"],
  ["3gp", "/assets/icons/file-video.svg"],
  // Audio
  ["mp3", "/assets/icons/file-audio.svg"],
  ["mpeg", "/assets/icons/file-audio.svg"],
  ["wav", "/assets/icons/file-audio.svg"],
  ["aac", "/assets/icons/file-audio.svg"],
  ["flac", "/assets/icons/file-audio.svg"],
  ["ogg", "/assets/icons/file-audio.svg"],
  ["wma", "/assets/icons/file-audio.svg"],
  ["m4a", "/assets/icons/file-audio.svg"],
  ["aiff", "/assets/icons/file-audio.svg"],
  ["alac", "/assets/icons/file-audio.svg"],
]);

const TYPE_ICON_MAP = new Map<string, string>([
  ["image", "/assets/icons/file-image.svg"],
  ["document", "/assets/icons/file-document.svg"],
  ["video", "/assets/icons/file-video.svg"],
  ["audio", "/assets/icons/file-audio.svg"],
]);

export const getFileIcon = (
  extension: string | undefined,
  type: FileType | string,
): string => {
  if (extension) {
    const icon = FILE_ICON_MAP.get(extension);
    if (icon) return icon;
  }
  
  return TYPE_ICON_MAP.get(type) || "/assets/icons/file-other.svg";
};

// APPWRITE URL UTILS
// Memoized base URL construction to avoid repeated string concatenation
const getBaseUrl = (): string => {
  const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT;
  const bucket = process.env.NEXT_PUBLIC_APPWRITE_BUCKET;
  const project = process.env.NEXT_PUBLIC_APPWRITE_PROJECT;
  return `${endpoint}/storage/buckets/${bucket}/files`;
};

let cachedBaseUrl: string | null = null;

const getBaseUrlCached = (): string => {
  if (!cachedBaseUrl) {
    cachedBaseUrl = getBaseUrl();
  }
  return cachedBaseUrl;
};

export const constructFileUrl = (bucketFileId: string): string => {
  const baseUrl = getBaseUrlCached();
  const project = process.env.NEXT_PUBLIC_APPWRITE_PROJECT;
  return `${baseUrl}/${bucketFileId}/view?project=${project}`;
};

export const constructDownloadUrl = (bucketFileId: string): string => {
  const baseUrl = getBaseUrlCached();
  const project = process.env.NEXT_PUBLIC_APPWRITE_PROJECT;
  return `${baseUrl}/${bucketFileId}/download?project=${project}`;
};



// DASHBOARD UTILS
interface SpaceData {
  size: number;
  latestDate: string;
}

interface TotalSpace {
  document: SpaceData;
  image: SpaceData;
  video: SpaceData;
  audio: SpaceData;
  other: SpaceData;
}

export const getUsageSummary = (totalSpace: TotalSpace) => {
  return [
    {
      title: "Documents",
      size: totalSpace.document.size,
      latestDate: totalSpace.document.latestDate,
      icon: "/assets/icons/file-document-light.svg",
      url: "/documents",
    },
    {
      title: "Images",
      size: totalSpace.image.size,
      latestDate: totalSpace.image.latestDate,
      icon: "/assets/icons/file-image-light.svg",
      url: "/images",
    },
    {
      title: "Media",
      size: totalSpace.video.size + totalSpace.audio.size,
      latestDate:
        totalSpace.video.latestDate > totalSpace.audio.latestDate
          ? totalSpace.video.latestDate
          : totalSpace.audio.latestDate,
      icon: "/assets/icons/file-video-light.svg",
      url: "/media",
    },
    {
      title: "Others",
      size: totalSpace.other.size,
      latestDate: totalSpace.other.latestDate,
      icon: "/assets/icons/file-other-light.svg",
      url: "/others",
    },
  ];
};

export const getFileTypesParams = (type: string) => {
  switch (type) {
    case "documents":
      return ["document"];
    case "images":
      return ["image"];
    case "media":
      return ["video", "audio"];
    case "others":
      return ["other"];
    default:
      return ["document"];
  }
};
