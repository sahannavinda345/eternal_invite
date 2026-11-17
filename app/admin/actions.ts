"use server";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin";
import { siteUrl } from "@/lib/utils";

type Result = { ok: true; id?: string; message?: string } | { ok: false; error: string };

export type CoupleFields = {
  couple_name: string;
  phone: string;
  plan_id: string | null;
  max_invitations: number;
  allowed_designs: string[] | null;
  status: "active" | "suspended";
  paid_amount: number;
  expires_at: string | null;
  notes: string;
};

function clean(f: CoupleFields) {
  return {
    couple_name: f.couple_name.trim() || null,
    phone: f.phone.replace(/[^\d+]/g, "") || null,
    plan_id: f.plan_id || null,
    max_invitations: Math.max(0, Math.min(100, Math.round(f.max_invitations || 0))),
    allowed_designs: f.allowed_designs,
    status: f.status,
    paid_amount: Math.max(0, Number(f.paid_amount) || 0),
    expires_at: f.expires_at || null,
    notes: f.notes.trim() || null,
  };
}

/* ---------------- couples ---------------- */

export async function createCouple(input: { email: string; mode: "password" | "invite"; password?: string } & CoupleFields): Promise<Result> {
  const { db } = await requireAdmin();
  const email = input.email.trim().toLowerCase();
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return { ok: false, error: "Enter a valid email address." };

  let id: string | undefined;
  if (input.mode === "password") {
    if (!input.password || input.password.length < 8) return { ok: false, error: "Use a password of at least 8 characters." };
    const { data, error } = await db.auth.admin.createUser({ email, password: input.password, email_confirm: true });
    if (error) return { ok: false, error: error.message.includes("already") ? "An account with this email already exists." : error.message };
    id = data.user?.id;
  } else {
    const { data, error } = await db.auth.admin.inviteUserByEmail(email, { redirectTo: `${siteUrl()}/auth/confirm?next=/set-password` });
    if (error) return { ok: false, error: error.message.includes("already") ? "An account with this email already exists." : error.message };
    id = data.user?.id;
  }
  if (!id) return { ok: false, error: "The account was not created. Please try again." };

  // The database trigger has created the profile row; fill in the plan details.
  const { error } = await db.from("profiles").upsert({ id, email, role: "couple", ...clean(input) });
  if (error) return { ok: false, error: `Account created, but saving the plan failed: ${error.message}` };

  revalidatePath("/admin", "layout");
  return { ok: true, id, message: input.mode === "invite" ? "Invitation email sent." : "Account created." };
}

export async function updateCouple(id: string, fields: CoupleFields): Promise<Result> {
  const { db } = await requireAdmin();
  const { error } = await db.from("profiles").update(clean(fields)).eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin", "layout");
  return { ok: true, message: "Saved." };
}

export async function setCouplePassword(id: string, password: string): Promise<Result> {
  const { db } = await requireAdmin();
  if (password.length < 8) return { ok: false, error: "Use at least 8 characters." };
  const { error } = await db.auth.admin.updateUserById(id, { password });
  if (error) return { ok: false, error: error.message };
  return { ok: true, message: "Password changed. Send the new password to the couple." };
}

export async function sendPasswordReset(email: string): Promise<Result> {
  const { db } = await requireAdmin();
  const { error } = await db.auth.resetPasswordForEmail(email, { redirectTo: `${siteUrl()}/auth/confirm?next=/set-password` });
  if (error) return { ok: false, error: error.message };
  return { ok: true, message: `Reset email sent to ${email}.` };
}

/** Deletes the account, their invitations, guests, replies and uploaded files. Cannot be undone. */
export async function deleteCouple(id: string): Promise<Result> {
  const { db, user } = await requireAdmin();
  if (id === user.id) return { ok: false, error: "You can't delete your own admin account here." };

  // Remove uploaded photos and music (stored under <user id>/<invitation id>/…)
  const { data: folders } = await db.storage.from("media").list(id, { limit: 1000 });
  for (const folder of folders ?? []) {
    const { data: files } = await db.storage.from("media").list(`${id}/${folder.name}`, { limit: 1000 });
    const paths = (files ?? []).map((f) => `${id}/${folder.name}/${f.name}`);
    if (paths.length) await db.storage.from("media").remove(paths);
  }

  const { error } = await db.auth.admin.deleteUser(id); // invitations, guests, replies and profile go with it
  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin", "layout");
  return { ok: true, message: "Couple removed." };
}

/* ---------------- invitations ---------------- */

export async function setInvitationPublished(invitationId: string, published: boolean): Promise<Result> {
  const { db } = await requireAdmin();
  const { error } = await db.from("invitations").update({ published }).eq("id", invitationId);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin", "layout");
  return { ok: true };
}

export async function deleteInvitation(invitationId: string): Promise<Result> {
  const { db } = await requireAdmin();
  const { error } = await db.from("invitations").delete().eq("id", invitationId);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin", "layout");
  return { ok: true };
}

/* ---------------- plans ---------------- */

export async function savePlan(plan: { id: string; name: string; price: number; max_invitations: number; allowed_designs: string[] | null; sort: number }): Promise<Result> {
  const { db } = await requireAdmin();
  if (!/^[a-z0-9-]{2,40}$/.test(plan.id)) return { ok: false, error: "Plan code: 2–40 lowercase letters, numbers or dashes." };
  if (!plan.name.trim()) return { ok: false, error: "Give the plan a name." };
  const { error } = await db.from("plans").upsert({
    ...plan, name: plan.name.trim(),
    price: Math.max(0, Number(plan.price) || 0),
    max_invitations: Math.max(0, Math.min(100, Math.round(plan.max_invitations))),
  });
  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin", "layout");
  return { ok: true, message: "Plan saved." };
}

export async function deletePlan(id: string): Promise<Result> {
  const { db } = await requireAdmin();
  const { error } = await db.from("plans").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin", "layout");
  return { ok: true, message: "Plan deleted. Couples on it keep their current limits." };
}
