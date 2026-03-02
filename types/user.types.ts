export interface UserRow {
  $id: string;
  fullName: string;
  email: string;
  avatar?: string;

  $sequence: number;
  $createdAt: string;
  $updatedAt: string;
  $permissions: string[];
  $databaseId: string;
  $tableId: string;
}