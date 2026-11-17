"use client";
import type { Invitation } from "@/lib/types";
import { getDesign } from "@/components/designs";
import { sampleGuest } from "@/components/designs/types";

/**
 * Renders an invitation inside a phone frame.
 * `scale` shrinks the whole phone (for dashboard thumbnails); thumbnails are not interactive.
 */
export default function PhonePreview({ invitation, scale = 1, interactive = true }: { invitation: Invitation; scale?: number; interactive?: boolean }) {
  const { Component } = getDesign(invitation.design);
  const W = 300, H = 620;
  const phone = (
    <div className="relative overflow-hidden rounded-[44px] border-[10px] border-[#1d1d1d] bg-black shadow-[0_20px_60px_rgba(0,0,0,.6)]"
      style={{ width: W, height: H }}>
      <div className="pointer-events-none absolute left-1/2 top-2 z-10 h-6 w-24 -translate-x-1/2 rounded-full bg-black" aria-hidden="true" />
      <div className={`h-full overflow-y-auto overscroll-contain [scrollbar-width:none] ${interactive ? "" : "pointer-events-none"}`}>
        <Component invitation={invitation} guest={sampleGuest(invitation)} token={null} preview />
      </div>
    </div>
  );
  if (scale === 1) return phone;
  return (
    <div style={{ width: W * scale, height: H * scale }} aria-hidden="true">
      <div style={{ transform: `scale(${scale})`, transformOrigin: "top left", width: W, height: H }}>{phone}</div>
    </div>
  );
}
