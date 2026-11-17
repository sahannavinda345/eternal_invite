"use client";
import { mapEmbedUrl, mapsUrl } from "@/lib/utils";

/** Embedded Google map of the venue with an "Open in Maps" button. Static placeholder in the editor preview. */
export default function VenueMap({ venue, preview = false, frame = "", button = "" }: { venue: string; preview?: boolean; frame?: string; button?: string }) {
  if (!venue) return null;
  return (
    <div className="flex flex-col items-center gap-3">
      <div className={`relative aspect-[4/3] w-full overflow-hidden ${frame}`}>
        {preview ? (
          <div className="grid h-full w-full place-items-center bg-[#e9efe6] text-xs text-[#4c5a48]"
            style={{ backgroundImage: "linear-gradient(90deg,rgba(0,0,0,.05) 1px,transparent 1px),linear-gradient(rgba(0,0,0,.05) 1px,transparent 1px)", backgroundSize: "24px 24px" }}>
            Map of {venue}
          </div>
        ) : (
          <iframe title={`Map of ${venue}`} src={mapEmbedUrl(venue)} loading="lazy" referrerPolicy="no-referrer-when-downgrade" className="h-full w-full border-0" />
        )}
      </div>
      <a href={mapsUrl(venue)} target="_blank" rel="noopener" className={button}>Open in Google Maps ↗</a>
    </div>
  );
}
