"use server";

import { Avatars, Client, TablesDB , Storage, Account } from "node-appwrite";
import { appwriteConfig } from "@/lib/appwrite/config";
import { cookies } from "next/headers";

export const createSessionClient = async () => {
  const client = new Client()
    .setEndpoint(appwriteConfig.endpoint)
    .setProject(appwriteConfig.projectId);

  const session = (await cookies()).get("appwrite-session");

  if (!session || !session.value) throw new Error("No session");

  client.setSession(session.value);

  return {
    get tablesDB() {
      return new TablesDB(client);
    },
    get account() {
      return new Account(client);
    }
  };
};

export const createAdminClient = async () => {
  const client = new Client()
    .setEndpoint(appwriteConfig.endpoint)
    .setProject(appwriteConfig.projectId)
    .setKey(appwriteConfig.secretKey);

  return {
    get tablesDB() {
      return new TablesDB(client);
    },
    get account() {
      return new Account(client);
    },
    get storage() {
      return new Storage(client);
    },
    get avatars() {
      return new Avatars(client);
    },
  };
};