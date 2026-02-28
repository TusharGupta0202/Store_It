"use server";

import { getPostHogClient } from "@/lib/posthog-server";

// PostHog server-side tracking for file operations.
// These functions are called from existing (or future) Appwrite action wrappers.
// Import and call them after the corresponding Appwrite operation succeeds.

/**
 * Track a successful file upload on the server side.
 */
export async function trackFileUploaded({
  ownerId,
  accountId,
  fileName,
  fileType,
  fileSize,
  path,
}: {
  ownerId: string;
  accountId: string;
  fileName: string;
  fileType: FileType;
  fileSize: number;
  path: string;
}) {
  const posthog = getPostHogClient();
  posthog.capture({
    distinctId: ownerId,
    event: "file_uploaded",
    properties: {
      accountId: accountId,
      file_name: fileName,
      file_type: fileType,
      file_size_bytes: fileSize,
      path,
      source: "server",
    },
  });
}

/**
 * Track a successful file deletion on the server side.
 */
export async function trackFileDeleted({
  ownerId,
  fileId,
  bucketFileId,
  path,
}: {
  ownerId: string;
  fileId: string;
  bucketFileId: string;
  path: string;
}) {
  const posthog = getPostHogClient();
  posthog.capture({
    distinctId: ownerId,
    event: "file_deleted",
    properties: {
      file_id: fileId,
      bucket_file_id: bucketFileId,
      path,
      source: "server",
    },
  });
}

/**
 * Track a successful file rename on the server side.
 */
export async function trackFileRenamed({
  ownerId,
  fileId,
  newName,
  extension,
  path,
}: {
  ownerId: string;
  fileId: string;
  newName: string;
  extension: string;
  path: string;
}) {
  const posthog = getPostHogClient();
  posthog.capture({
    distinctId: ownerId,
    event: "file_renamed",
    properties: {
      file_id: fileId,
      new_name: newName,
      extension,
      path,
      source: "server",
    },
  });
}

/**
 * Track a successful file share on the server side.
 */
export async function trackFileShared({
  ownerId,
  fileId,
  sharedWithCount,
  path,
}: {
  ownerId: string;
  fileId: string;
  sharedWithCount: number;
  path: string;
}) {
  const posthog = getPostHogClient();
  posthog.capture({
    distinctId: ownerId,
    event: "file_shared",
    properties: {
      file_id: fileId,
      shared_with_count: sharedWithCount,
      path,
      source: "server",
    },
  });
}

/**
 * Track a file download action on the server side.
 */
export async function trackFileDownloaded({
  ownerId,
  fileId,
  fileName,
  fileType,
  path,
}: {
  ownerId: string;
  fileId: string;
  fileName: string;
  fileType: FileType;
  path: string;
}) {
  const posthog = getPostHogClient();
  posthog.capture({
    distinctId: ownerId,
    event: "file_download_clicked",
    properties: {
      file_id: fileId,
      file_name: fileName,
      file_type: fileType,
      path,
      source: "server",
    },
  });
}
