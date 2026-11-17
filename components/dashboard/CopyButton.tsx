"use client";
import { useState } from "react";

export default function CopyButton({ text, label = "Copy" }: { text: string; label?: string }) {
  const [state, setState] = useState(label);
  return (
    <button type="button" className="btn"
      onClick={async () => {
        try { await navigator.clipboard.writeText(text); setState("Copied"); }
        catch { setState("Copy failed"); }
        setTimeout(() => setState(label), 1800);
      }}>
      {state}
    </button>
  );
}
