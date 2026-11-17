"use client";
import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { setCurrentInvitation } from "@/lib/current-invitation";
import { SECTION_META, withAllSections, type EventItem, type Invitation, type SectionId } from "@/lib/types";
import { deleteMedia, uploadMedia } from "@/lib/upload";
import { cx, invitationLink, isoToLocal, localToIso, randomKey, slugify, timeAgo } from "@/lib/utils";
import { DESIGNS } from "@/components/designs";
import PhonePreview from "./PhonePreview";
import Toggle from "./Toggle";

type Status = "saved" | "dirty" | "saving" | "error";
const SAVE_DELAY = 900;
const GROUP_MS = 700; // keystrokes closer than this become one undo step

type History = { draft: Invitation; past: Invitation[]; future: Invitation[]; lastPush: number };
type Action = { type: "update"; patch: Partial<Invitation>; now: number } | { type: "undo" } | { type: "redo" };

function historyReducer(h: History, a: Action): History {
  switch (a.type) {
    case "update": {
      const grouped = a.now - h.lastPush < GROUP_MS;
      return {
        draft: { ...h.draft, ...a.patch },
        past: grouped ? h.past : [...h.past.slice(-49), h.draft],
        future: [],
        lastPush: a.now,
      };
    }
    case "undo":
      if (!h.past.length) return h;
      return { draft: h.past[h.past.length - 1], past: h.past.slice(0, -1), future: [h.draft, ...h.future], lastPush: 0 };
    case "redo":
      if (!h.future.length) return h;
      return { draft: h.future[0], past: [...h.past, h.draft], future: h.future.slice(1), lastPush: 0 };
  }
}

export default function InvitationEditor({ initial, invitations, allowedDesigns = null }: { initial: Invitation; invitations: Pick<Invitation, "id" | "title">[]; allowedDesigns?: string[] | null }) {
  const canUse = (id: string) => !allowedDesigns || allowedDesigns.includes(id);
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const [hist, dispatch] = useReducer(historyReducer, {
    draft: { ...initial, sections: withAllSections(initial.sections), gallery: initial.gallery ?? [] },
    past: [], future: [], lastPush: 0,
  });
  const { draft, past, future } = hist;
  const [status, setStatus] = useState<Status>("saved");
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [openId, setOpenId] = useState<SectionId | "settings" | "music" | null>("hero");
  const [uploading, setUploading] = useState<string | null>(null);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [showPhone, setShowPhone] = useState(false); // phones: toggle preview
  const savedJson = useRef(JSON.stringify(hist.draft));

  /* ---------- editing + undo/redo ---------- */
  const update = useCallback((patch: Partial<Invitation>) => dispatch({ type: "update", patch, now: Date.now() }), []);
  const undo = useCallback(() => dispatch({ type: "undo" }), []);
  const redo = useCallback(() => dispatch({ type: "redo" }), []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const t = e.target as HTMLElement;
      if (t.closest("input, textarea, select")) return; // let fields use their own undo
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z") { e.preventDefault(); if (e.shiftKey) redo(); else undo(); }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "y") { e.preventDefault(); redo(); }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [undo, redo]);

  /* ---------- autosave ---------- */
  const slugValid = /^[a-z0-9-]{3,60}$/.test(draft.slug);

  useEffect(() => {
    const json = JSON.stringify(draft);
    if (json === savedJson.current) return;
    setStatus("dirty");
    if (!slugValid) { setError("The link can only use lowercase letters, numbers and dashes (3–60 characters)."); return; }
    const timer = setTimeout(async () => {
      setStatus("saving");
      const { error } = await supabase.from("invitations").update({
        title: draft.title, slug: draft.slug, design: draft.design,
        partner1: draft.partner1, partner2: draft.partner2,
        families: draft.families || null, story: draft.story || null,
        events: draft.events, sections: draft.sections,
        rsvp_by: draft.rsvp_by || null, whatsapp: draft.whatsapp?.replace(/\D/g, "") || null,
        published: draft.published,
        cover_photo: draft.cover_photo || null, music_url: draft.music_url || null, gallery: draft.gallery ?? [],
      }).eq("id", draft.id);
      if (error) {
        setStatus("error");
        setError(error.code === "23505" ? "That link is already taken. Try another one." : error.message);
      } else {
        savedJson.current = json;
        setStatus("saved");
        setSavedAt(new Date().toISOString());
        setError("");
      }
    }, SAVE_DELAY);
    return () => clearTimeout(timer);
  }, [draft, slugValid, supabase]);

  // Warn before leaving with unsaved changes
  useEffect(() => {
    const h = (e: BeforeUnloadEvent) => { if (status === "dirty" || status === "saving") e.preventDefault(); };
    window.addEventListener("beforeunload", h);
    return () => window.removeEventListener("beforeunload", h);
  }, [status]);

  // Refresh the "saved x ago" label
  const [, tick] = useState(0);
  useEffect(() => { const id = setInterval(() => tick((n) => n + 1), 15000); return () => clearInterval(id); }, []);

  /* ---------- sections ---------- */
  function moveSection(from: number, to: number) {
    if (to < 0 || to >= draft.sections.length || from === to) return;
    const s = [...draft.sections];
    const [item] = s.splice(from, 1);
    s.splice(to, 0, item);
    update({ sections: s });
  }

  /* ---------- events ---------- */
  const setEvent = (i: number, patch: Partial<EventItem>) =>
    update({ events: draft.events.map((e, j) => (j === i ? { ...e, ...patch } : e)) });

  function switchInvitation(id: string) {
    setCurrentInvitation(id);
    router.refresh();
  }

  /* ---------- photos & music ---------- */
  async function upload(files: FileList | null, kind: "cover" | "gallery" | "music") {
    if (!files?.length) return;
    setError("");
    try {
      if (kind === "gallery") {
        const room = 24 - (draft.gallery?.length ?? 0);
        const list = Array.from(files).slice(0, room);
        if (!list.length) throw new Error("A gallery can hold up to 24 photos.");
        const urls: string[] = [];
        for (let i = 0; i < list.length; i++) {
          setUploading(`Uploading photo ${i + 1} of ${list.length}…`);
          urls.push(await uploadMedia(list[i], draft.id, "photo"));
        }
        update({ gallery: [...(draft.gallery ?? []), ...urls] });
      } else {
        setUploading(kind === "music" ? "Uploading song…" : "Uploading photo…");
        const url = await uploadMedia(files[0], draft.id, kind === "music" ? "music" : "photo");
        const old = kind === "music" ? draft.music_url : draft.cover_photo;
        update(kind === "music" ? { music_url: url } : { cover_photo: url });
        if (old) deleteMedia(old);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed. Please try again.");
    } finally {
      setUploading(null);
    }
  }

  function removeGalleryPhoto(url: string) {
    update({ gallery: (draft.gallery ?? []).filter((g) => g !== url) });
    deleteMedia(url);
  }

  function filePicker(id: string, label: string, accept: string, kind: "cover" | "gallery" | "music", multiple = false) {
    return (
      <label htmlFor={id} className={cx("btn cursor-pointer", uploading && "pointer-events-none opacity-40")}>
        {label}
        <input id={id} type="file" accept={accept} multiple={multiple} className="sr-only"
          onChange={(e) => { upload(e.target.files, kind); e.target.value = ""; }} />
      </label>
    );
  }

  const statusText =
    status === "saving" ? "Saving…" :
    status === "dirty" ? "Unsaved changes" :
    status === "error" ? "Not saved" :
    savedAt ? `Saved ${timeAgo(savedAt)} · autosave on` : "All changes saved · autosave on";

  /* ---------- panels ---------- */
  function panel(id: SectionId) {
    switch (id) {
      case "hero":
        return (
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="label" htmlFor="p1">Groom / partner 1
              <input id="p1" className="field normal-case tracking-normal" value={draft.partner1} onChange={(e) => update({ partner1: e.target.value })} />
            </label>
            <label className="label" htmlFor="p2">Bride / partner 2
              <input id="p2" className="field normal-case tracking-normal" value={draft.partner2} onChange={(e) => update({ partner2: e.target.value })} />
            </label>
            <div className="flex flex-wrap items-center gap-3 sm:col-span-2">
              {draft.cover_photo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={draft.cover_photo} alt="Couple photo" className="h-20 w-16 border border-line object-cover" />
              ) : (
                <div className="grid h-20 w-16 place-items-center border border-dashed border-line text-[0.6rem] text-muted">No photo</div>
              )}
              <div className="flex flex-col gap-2">
                <span className="text-[0.65rem] uppercase tracking-[0.2em] text-muted">Couple photo · opening screen &amp; intro</span>
                <div className="flex flex-wrap gap-2">
                  {filePicker("cover-upload", draft.cover_photo ? "Change photo" : "Upload photo", "image/*", "cover")}
                  {draft.cover_photo && (
                    <button type="button" className="btn" onClick={() => { const u = draft.cover_photo!; update({ cover_photo: null }); deleteMedia(u); }}>Remove</button>
                  )}
                </div>
              </div>
            </div>
            <label className="label sm:col-span-2" htmlFor="fam">Families line
              <textarea id="fam" className="field min-h-[70px] normal-case tracking-normal" value={draft.families ?? ""}
                placeholder="Mr. & Mrs. Sunil Jayawardena and Mr. & Mrs. Ranjith Perera request the pleasure of your company…"
                onChange={(e) => update({ families: e.target.value })} />
            </label>
          </div>
        );
      case "countdown":
        return <p className="text-sm text-muted">Counts down to the first event{draft.events[0] ? ` (${draft.events[0].label})` : ""}. Set its date under Events &amp; venues.</p>;
      case "story":
        return (
          <label className="label" htmlFor="story">Your story
            <textarea id="story" className="field min-h-[110px] normal-case tracking-normal" value={draft.story ?? ""}
              placeholder="We met at Peradeniya in 2018…" onChange={(e) => update({ story: e.target.value })} />
          </label>
        );
      case "gallery":
        return (
          <div className="flex flex-col gap-3">
            <div className="flex flex-wrap items-center gap-2">
              {filePicker("gallery-upload", "+ Add photos", "image/*", "gallery", true)}
              <span className="text-xs text-muted">{draft.gallery?.length ?? 0} / 24 · The first photo is shown large</span>
            </div>
            {!!draft.gallery?.length && (
              <ul className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                {draft.gallery.map((url, i) => (
                  <li key={url} className="group relative aspect-square overflow-hidden border border-line">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={url} alt={`Gallery photo ${i + 1}`} className="h-full w-full object-cover" />
                    <div className="absolute inset-x-0 bottom-0 flex justify-between bg-black/70 px-1.5 py-1 text-[0.6rem] uppercase tracking-wider">
                      <button type="button" disabled={i === 0} className="disabled:opacity-30"
                        onClick={() => { const g = [...draft.gallery]; [g[i - 1], g[i]] = [g[i], g[i - 1]]; update({ gallery: g }); }}>◀ Move</button>
                      <button type="button" className="text-red-300" onClick={() => removeGalleryPhoto(url)}>Remove</button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        );
      case "events":
        return (
          <div className="flex flex-col gap-4">
            {draft.events.map((ev, i) => (
              <div key={ev.key} className="grid gap-3 border border-line p-3 sm:grid-cols-2">
                <label className="label" htmlFor={`el-${i}`}>Event name
                  <input id={`el-${i}`} className="field normal-case tracking-normal" value={ev.label} onChange={(e) => setEvent(i, { label: e.target.value })} />
                </label>
                <label className="label" htmlFor={`et-${i}`}>Heading
                  <input id={`et-${i}`} className="field normal-case tracking-normal" value={ev.title} onChange={(e) => setEvent(i, { title: e.target.value })} />
                </label>
                <label className="label" htmlFor={`ew-${i}`}>Date &amp; time (Sri Lanka)
                  <input id={`ew-${i}`} type="datetime-local" className="field" value={isoToLocal(ev.starts_at)} onChange={(e) => setEvent(i, { starts_at: localToIso(e.target.value) })} />
                </label>
                <label className="label" htmlFor={`ev-${i}`}>Venue
                  <input id={`ev-${i}`} className="field normal-case tracking-normal" value={ev.venue} placeholder="Waters Edge, Battaramulla" onChange={(e) => setEvent(i, { venue: e.target.value })} />
                </label>
                <label className="label sm:col-span-2" htmlFor={`en-${i}`}>Note (optional)
                  <input id={`en-${i}`} className="field normal-case tracking-normal" value={ev.note ?? ""} placeholder="Poruwa nekatha 9:42 AM" onChange={(e) => setEvent(i, { note: e.target.value })} />
                </label>
                <div className="flex flex-wrap gap-3 text-[0.65rem] uppercase tracking-[0.2em] sm:col-span-2">
                  <button type="button" className="text-muted hover:text-white disabled:opacity-30" disabled={i === 0}
                    onClick={() => { const e = [...draft.events]; [e[i - 1], e[i]] = [e[i], e[i - 1]]; update({ events: e }); }}>Move up</button>
                  <button type="button" className="text-red-300 hover:text-red-200"
                    onClick={() => update({ events: draft.events.filter((_, j) => j !== i) })}>Remove</button>
                </div>
              </div>
            ))}
            <button type="button" className="btn self-start"
              onClick={() => update({ events: [...draft.events, { key: `e-${randomKey()}`, label: "New event", title: "", starts_at: "", venue: "" }] })}>
              + Add event
            </button>
            <p className="text-xs text-muted">Removing an event hides it for guests already invited to it.</p>
          </div>
        );
      case "rsvp":
        return (
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="label" htmlFor="rb">Reply by
              <input id="rb" type="date" className="field" value={draft.rsvp_by ?? ""} onChange={(e) => update({ rsvp_by: e.target.value })} />
            </label>
            <label className="label" htmlFor="wa">Couple&apos;s WhatsApp
              <input id="wa" inputMode="tel" className="field normal-case tracking-normal" value={draft.whatsapp ?? ""} placeholder="771234567"
                onChange={(e) => update({ whatsapp: e.target.value })} />
            </label>
          </div>
        );
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px] xl:grid-cols-[minmax(0,1fr)_380px]">
      {/* ---------- left: controls ---------- */}
      <div className="flex min-w-0 flex-col gap-4">
        <div className="card grid gap-3 p-4 sm:grid-cols-2">
          <label className="label" htmlFor="which">Invitation
            <select id="which" className="field normal-case tracking-normal" value={draft.id} onChange={(e) => switchInvitation(e.target.value)}>
              {invitations.map((i) => <option key={i.id} value={i.id}>{i.id === draft.id ? draft.title : i.title}</option>)}
            </select>
          </label>
          <label className="label" htmlFor="tpl">Template
            <select id="tpl" className="field normal-case tracking-normal" value={draft.design} onChange={(e) => update({ design: e.target.value })}>
              {DESIGNS.map((d) => <option key={d.id} value={d.id} disabled={!canUse(d.id)}>{d.name}{canUse(d.id) ? "" : " · upgrade"}</option>)}
            </select>
          </label>
          <div className="flex flex-wrap gap-2 sm:col-span-2">
            {DESIGNS.map((d) => (
              <button key={d.id} type="button" onClick={() => canUse(d.id) && update({ design: d.id })} disabled={!canUse(d.id)}
                title={canUse(d.id) ? undefined : "Not included in your plan – contact us to upgrade"}
                className={cx("flex items-center gap-2 border px-3 py-2 text-xs", draft.design === d.id ? "border-white text-white" : "border-line text-muted hover:border-white/40", !canUse(d.id) && "cursor-not-allowed opacity-40 hover:border-line")}>
                <span className="h-3.5 w-3.5 rounded-full border border-white/30" style={{ background: d.swatch }} />{d.name}{!canUse(d.id) && " · upgrade"}
              </button>
            ))}
          </div>
        </div>

        <p className="text-center text-[0.62rem] uppercase tracking-[0.24em] text-muted">Drag to reorder · Toggle to show or hide</p>

        <ul className="flex flex-col gap-2">
          {draft.sections.map((s, i) => {
            const meta = SECTION_META[s.id];
            const isOpen = openId === s.id;
            return (
              <li key={s.id}
                draggable
                onDragStart={() => setDragIndex(i)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => { if (dragIndex !== null) moveSection(dragIndex, i); setDragIndex(null); }}
                onDragEnd={() => setDragIndex(null)}
                className={cx("card transition", dragIndex === i && "opacity-40", !s.visible && "opacity-60")}>
                <div className="flex items-center gap-3 p-3">
                  <span className="cursor-grab select-none px-1 text-muted" title="Drag to reorder" aria-hidden="true">⋮⋮</span>
                  <button type="button" className="flex min-w-0 flex-1 flex-col text-left" aria-expanded={isOpen} onClick={() => setOpenId(isOpen ? null : s.id)}>
                    <span className="text-sm text-white">{meta.label}</span>
                    <span className="truncate text-xs text-muted">{meta.hint}</span>
                  </button>
                  <span className="flex flex-col">
                    <button type="button" aria-label={`Move ${meta.label} up`} className="px-1 text-xs leading-none text-muted hover:text-white disabled:opacity-20" disabled={i === 0} onClick={() => moveSection(i, i - 1)}>▲</button>
                    <button type="button" aria-label={`Move ${meta.label} down`} className="px-1 text-xs leading-none text-muted hover:text-white disabled:opacity-20" disabled={i === draft.sections.length - 1} onClick={() => moveSection(i, i + 1)}>▼</button>
                  </span>
                  <button type="button" aria-label={isOpen ? "Collapse" : "Expand"} className={cx("px-1 text-muted transition", isOpen && "rotate-180")} onClick={() => setOpenId(isOpen ? null : s.id)}>⌄</button>
                  <Toggle on={s.visible} label={`Show ${meta.label}`}
                    onChange={(v) => update({ sections: draft.sections.map((x) => (x.id === s.id ? { ...x, visible: v } : x)) })} />
                </div>
                {isOpen && <div className="border-t border-line p-4">{panel(s.id)}</div>}
              </li>
            );
          })}
        </ul>

        <div className="card">
          <button type="button" className="flex w-full items-center justify-between p-3 text-left" aria-expanded={openId === "music"}
            onClick={() => setOpenId(openId === "music" ? null : "music")}>
            <span><span className="block text-sm text-white">Background music</span><span className="text-xs text-muted">{draft.music_url ? "A song plays when guests open the invitation" : "Optional · plays when guests open the invitation"}</span></span>
            <span className={cx("px-1 text-muted", openId === "music" && "rotate-180")}>⌄</span>
          </button>
          {openId === "music" && (
            <div className="flex flex-col gap-3 border-t border-line p-4">
              {draft.music_url && <audio controls src={draft.music_url} className="w-full" preload="none" />}
              <div className="flex flex-wrap gap-2">
                {filePicker("music-upload", draft.music_url ? "Change song" : "Upload song (MP3/M4A)", "audio/mpeg,audio/mp4,audio/x-m4a,audio/aac,.mp3,.m4a", "music")}
                {draft.music_url && (
                  <button type="button" className="btn" onClick={() => { const u = draft.music_url!; update({ music_url: null }); deleteMedia(u); }}>Remove</button>
                )}
              </div>
              <p className="text-xs text-muted">Use a song you have the right to share, such as one you bought for personal use or royalty-free music. Max 12 MB.</p>
            </div>
          )}
        </div>

        <div className="card">
          <button type="button" className="flex w-full items-center justify-between p-3 text-left" aria-expanded={openId === "settings"}
            onClick={() => setOpenId(openId === "settings" ? null : "settings")}>
            <span><span className="block text-sm text-white">Name &amp; link</span><span className="text-xs text-muted">How it appears in your dashboard and its web address</span></span>
            <span className={cx("px-1 text-muted", openId === "settings" && "rotate-180")}>⌄</span>
          </button>
          {openId === "settings" && (
            <div className="grid gap-3 border-t border-line p-4 sm:grid-cols-2">
              <label className="label" htmlFor="title">Invitation name
                <input id="title" className="field normal-case tracking-normal" value={draft.title} onChange={(e) => update({ title: e.target.value })} />
              </label>
              <label className="label" htmlFor="slug">Link
                <div className="flex items-center border border-line bg-canvas text-sm normal-case tracking-normal">
                  <span className="pl-3 text-muted">/i/</span>
                  <input id="slug" className="min-w-0 flex-1 bg-transparent px-1 py-2 outline-none" value={draft.slug}
                    onChange={(e) => update({ slug: slugify(e.target.value) || e.target.value.toLowerCase() })} />
                </div>
              </label>
            </div>
          )}
        </div>

        {uploading && <p className="bg-white/5 p-3 text-sm text-white/80" aria-live="polite">{uploading}</p>}
        {error && <p className="bg-red-400/10 p-3 text-sm text-red-300">{error}</p>}
      </div>

      {/* ---------- right: live phone preview ---------- */}
      <div className="lg:sticky lg:top-5 lg:self-start">
        <div className="flex flex-col items-center gap-3">
          <div className="flex items-center gap-1.5">
            <button type="button" className="btn px-3" onClick={undo} disabled={!past.length} aria-label="Undo" title="Undo (Ctrl+Z)">↶</button>
            <button type="button" className="btn px-3" onClick={redo} disabled={!future.length} aria-label="Redo" title="Redo (Ctrl+Shift+Z)">↷</button>
            <a className="btn px-3" href={`/i/${draft.slug}`} target="_blank" rel="noopener" title="Open full preview">Open ↗</a>
            <button type="button" className="btn px-3 lg:hidden" onClick={() => setShowPhone((v) => !v)}>{showPhone ? "Hide preview" : "Show preview"}</button>
          </div>
          <p className={cx("text-[0.62rem] uppercase tracking-[0.2em]", status === "error" ? "text-red-300" : status === "saved" ? "text-emerald-300" : "text-muted")} aria-live="polite">
            {statusText}
          </p>
          <div className={cx(showPhone ? "block" : "hidden", "lg:block")}>
            <PhonePreview invitation={draft} />
          </div>
          <button type="button" className={cx(draft.published ? "btn" : "btn-primary", "w-[300px]")}
            onClick={() => update({ published: !draft.published })}>
            {draft.published ? "Unpublish" : "Publish"}
          </button>
          <p className="max-w-[300px] text-center text-xs text-muted">
            {draft.published ? <>Live at <span className="break-all text-white/80">{invitationLink(draft.slug)}</span></> : "Draft. Only you can see it until you publish."}
          </p>
        </div>
      </div>
    </div>
  );
}
