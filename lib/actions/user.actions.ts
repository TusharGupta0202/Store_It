"use server";

import { createAdminClient, createSessionClient } from "@/lib/appwrite";
import { appwriteConfig } from "@/lib/appwrite/config";
import { Query, ID } from "appwrite";
import { parseStringify } from "@/lib/utils";
import { cookies } from "next/headers";
import { avatarPlaceholderUrl } from "@/constants";
import { redirect } from "next/navigation";
import { getPostHogClient } from "../posthog-server";


// PostHog server-side tracking for user authentication.
// These functions are called from existing (or future) Appwrite auth wrappers.
// Import and call them after the corresponding Appwrite operation succeeds.

/**
 * Track and identify a user on sign-in on the server side.
 */
export async function trackUserSignedIn({
  userId,
  email,
  fullName,
  isNewUser,
}: {
  userId: string;
  email: string;
  fullName: string;
  isNewUser: boolean;
}) {
  const posthog = getPostHogClient();

  // Identify the user so server-side events correlate with client-side session
  posthog.identify({
    distinctId: userId,
    properties: {
      email,
      name: fullName,
    },
  });

  posthog.capture({
    distinctId: userId,
    event: isNewUser ? "user_signed_up" : "user_signed_in",
    properties: {
      email,
      full_name: fullName,
      is_new_user: isNewUser,
      source: "server",
    },
  });
}

/**
 * Track a user sign-out on the server side.
 */
export async function trackUserSignedOut({ userId }: { userId: string }) {
  const posthog = getPostHogClient();
  posthog.capture({
    distinctId: userId,
    event: "user_signed_out",
    properties: {
      source: "server",
    },
  });
}


const getUserByEmail = async (email: string) => {
  const { tablesDB } = await createAdminClient();

  const result = await tablesDB.listRows({

    databaseId:appwriteConfig.databaseId,
    tableId:appwriteConfig.usersTableId,
    queries: [Query.equal("email", email)],
  }
  );

  return result.total > 0 ? result.rows[0] : null;
};

const handleError = (error: unknown, message: string) => {
  console.log(error, message);
  throw error;
};

export const sendEmailOTP = async ({ email }: { email: string }) => {
  const { account } = await createAdminClient();

  try {
    const session = await account.createEmailToken({
      userId: ID.unique(),
      email,
    });

    return session.userId;
  } catch (error) {
    handleError(error, "Failed to send email OTP");
  }
};

export const createAccount = async ({
  fullName,
  email,
}: {
  fullName: string;
  email: string;
}) => {
  const existingUser = await getUserByEmail(email);

  const accountId = await sendEmailOTP({ email });
  if (!accountId) throw new Error("Failed to send an OTP");

  if (!existingUser) {
    const { tablesDB } = await createAdminClient();

    await tablesDB.createRow({
      databaseId: appwriteConfig.databaseId,
      tableId: appwriteConfig.usersTableId,
      rowId: ID.unique(),
      data: {
        fullName,
        email,
        avatar: avatarPlaceholderUrl,
        accountId,
      },
    }
    );
  }

  return parseStringify({ accountId });
};

export const verifySecret = async ({
  accountId,
  password,
}: {
  accountId: string;
  password: string;
}) => {
  try {
    const { account } = await createAdminClient();

    const session = await account.createSession({
      userId: accountId,
      secret: password,
    });

    (await cookies()).set("appwrite-session", session.secret, {
      path: "/",
      httpOnly: true,
      sameSite: "strict",
      secure: true,
    });

    return parseStringify({ sessionId: session.$id });
  } catch (error) {
    handleError(error, "Failed to verify OTP");
  }
};

export const getCurrentUser = async () => {
  try {
    const { tablesDB, account } = await createSessionClient();

    const result = await account.get();

    const user = await tablesDB.listRows({
      databaseId: appwriteConfig.databaseId,
      tableId: appwriteConfig.usersTableId,
      queries: [Query.equal("accountId", result.$id)],
    });

    if (user.total <= 0) return null;

    return parseStringify(user.rows[0]);
  } catch (error) {
    console.log(error);
  }
};

export const signOutUser = async () => {
  const { account } = await createSessionClient();

  try {
    await account.deleteSession({
      sessionId: "current",
    });
    (await cookies()).delete("appwrite-session");
  } catch (error) {
    handleError(error, "Failed to sign out user");
  } finally {
    redirect("/sign-in");
  }
};

export const signInUser = async ({ email }: { email: string }) => {
  try {
    const existingUser = await getUserByEmail(email);

    // User exists, send OTP
    if (existingUser) {
      await sendEmailOTP({ email });
      return parseStringify({ accountId: existingUser.accountId });
    }

    return parseStringify({ accountId: null, error: "User not found" });
  } catch (error) {
    handleError(error, "Failed to sign in user");
  }
};