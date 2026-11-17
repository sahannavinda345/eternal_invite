"use client";
import { CURRENT_INVITATION_COOKIE } from "@/lib/utils";

/** Remember which invitation the dashboard is working on. */
export function setCurrentInvitation(id: string) {
  document.cookie = `${CURRENT_INVITATION_COOKIE}=${id}; path=/; max-age=31536000; samesite=lax`;
}
