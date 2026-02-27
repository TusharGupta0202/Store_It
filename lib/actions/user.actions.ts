"use server";

import { getPostHogClient } from "@/lib/posthog-server";

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
