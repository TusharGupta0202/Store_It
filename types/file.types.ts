import { UserRow } from "./user.types";

export interface FileRow {
  $id: string;
  name: string;
  url: string;
  type: string;
  extension: string;
  size: number;

  owner: string; // relation ID

  bucketFileId: string;
  accountId: string;
  users: string[];

  $sequence: number;
  $createdAt: string;
  $updatedAt: string;
  $permissions: string[];
  $databaseId: string;
  $tableId: string;
}

export type FileDoc = Omit<FileRow, "owner"> & {
  owner: UserRow;
};