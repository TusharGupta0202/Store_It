"use server";

import { getPostHogClient } from "@/lib/posthog-server";

import { createAdminClient, createSessionClient } from "@/lib/appwrite";
import { InputFile } from "node-appwrite/file";
import { appwriteConfig } from "@/lib/appwrite/config";
import { ID, Models, Query } from "node-appwrite";
import { constructFileUrl, getFileType, parseStringify } from "@/lib/utils";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/actions/user.actions";

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


const handleError = (error: unknown, message: string) => {
  console.log(error, message);
  throw error;
};

export const uploadFile = async ({
  file,
  ownerId,
  accountId,
  path,
}: UploadFileProps) => {
  const { storage, tablesDB } = await createAdminClient();

  try {
    const inputFile = InputFile.fromBuffer(file, file.name);

    const bucketFile = await storage.createFile({

      bucketId: appwriteConfig.bucketId,
      fileId: ID.unique(),
      file: inputFile,
    }
    );

    const fileDocument = {
      type: getFileType(bucketFile.name).type,
      name: bucketFile.name,
      url: constructFileUrl(bucketFile.$id),
      extension: getFileType(bucketFile.name).extension,
      size: bucketFile.sizeOriginal,
      owner: ownerId,
      accountId,
      users: [],
      bucketFileId: bucketFile.$id,
    };

    const newFile = await tablesDB
      .createRow({
        databaseId: appwriteConfig.databaseId,
        tableId: appwriteConfig.filesTableId,
        rowId: ID.unique(),
        data: fileDocument,
      })
      .catch(async (error: unknown) => {
        await storage.deleteFile({
          bucketId: appwriteConfig.bucketId,
          fileId: bucketFile.$id,
        });
        handleError(error, "Failed to create file document");
      });

    revalidatePath(path);
    return parseStringify(newFile);
  } catch (error) {
    handleError(error, "Failed to upload file");
  }
};

const createQueries = (
  currentUser: Models.Document,
  types: string[],
  searchText: string,
  sort: string,
  limit?: number,
) => {
  const queries = [
    Query.or([
      Query.equal("owner", [currentUser.$id]),
      // Query.contains("users", [currentUser.email]),
    ]),
  ];

  if (types.length > 0) queries.push(Query.equal("type", types));
  if (searchText) queries.push(Query.contains("name", searchText));
  if (limit) queries.push(Query.limit(limit));

  if (sort) {
    const [sortBy, orderBy] = sort.split("-");

    queries.push(
      orderBy === "asc" ? Query.orderAsc(sortBy) : Query.orderDesc(sortBy),
    );
  }

  return queries;
};

export const getFiles = async ({
  types = [],
  searchText = "",
  sort = "$createdAt-desc",
  limit,
}: GetFilesProps) => {
  const { tablesDB } = await createAdminClient();

  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) throw new Error("User not found");

    const queries = createQueries(currentUser, types, searchText, sort, limit);

    const files = await tablesDB.listRows({
      databaseId: appwriteConfig.databaseId,
      tableId: appwriteConfig.filesTableId,
      queries,
    });

    console.log({ files });
    return parseStringify(files);
  } catch (error) {
    handleError(error, "Failed to get files");
  }
};

export const renameFile = async ({
  fileId,
  name,
  extension,
  path,
}: RenameFileProps) => {
  const { tablesDB } = await createAdminClient();

  try {
    const newName = `${name}.${extension}`;
    const updatedFile = await tablesDB.updateRow({
      databaseId: appwriteConfig.databaseId,
      tableId: appwriteConfig.filesTableId,
      rowId: fileId,
      data: {
        name: newName,
      },
    });

    revalidatePath(path);
    return parseStringify(updatedFile);
  } catch (error) {
    handleError(error, "Failed to rename file");
  }
};

export const updateFileUsers = async ({
  fileId,
  emails,
  path,
}: UpdateFileUsersProps) => {
  const { tablesDB } = await createAdminClient();

  try {
    const updatedFile = await tablesDB.updateRow({
      databaseId: appwriteConfig.databaseId,
      tableId: appwriteConfig.filesTableId,
      rowId: fileId,
      data: {
        users: emails,
      },
    });

    revalidatePath(path);
    return parseStringify(updatedFile);
  } catch (error) {
    handleError(error, "Failed to update file users");
  }
};

export const deleteFile = async ({
  fileId,
  bucketFileId,
  path,
}: DeleteFileProps) => {
  const { tablesDB, storage } = await createAdminClient();

  try {
    const deletedFile = await tablesDB.deleteRow({
      databaseId: appwriteConfig.databaseId,
      tableId: appwriteConfig.filesTableId,
      rowId: fileId,
    });

    if (deletedFile) {
      await storage.deleteFile({
        bucketId: appwriteConfig.bucketId,
        fileId: bucketFileId,
      });
    }

    revalidatePath(path);
    return parseStringify({ status: "success" });
  } catch (error) {
    handleError(error, "Failed to delete file");
  }
};

// ============================== TOTAL FILE SPACE USED
export async function getTotalSpaceUsed() {
  try {
    const { tablesDB } = await createSessionClient();
    const currentUser = await getCurrentUser();
    if (!currentUser) throw new Error("User is not authenticated.");

    const files = await tablesDB.listRows({
      databaseId: appwriteConfig.databaseId,
      tableId: appwriteConfig.filesTableId,
      queries: [Query.equal("owner", [currentUser.$id])],
    });


    const totalSpace = {
      image: { size: 0, latestDate: "" },
      document: { size: 0, latestDate: "" },
      video: { size: 0, latestDate: "" },
      audio: { size: 0, latestDate: "" },
      other: { size: 0, latestDate: "" },
      used: 0,
      all: 2 * 1024 * 1024 * 1024 /* 2GB available bucket storage */,
    };

    files.rows.forEach((file) => {
      const fileType = file.type as FileType;
      totalSpace[fileType].size += file.size;
      totalSpace.used += file.size;

      if (
        !totalSpace[fileType].latestDate ||
        new Date(file.$updatedAt) > new Date(totalSpace[fileType].latestDate)
      ) {
        totalSpace[fileType].latestDate = file.$updatedAt;
      }
    });

    return parseStringify(totalSpace);
  } catch (error) {
    handleError(error, "Error calculating total space used:, ");
  }
}