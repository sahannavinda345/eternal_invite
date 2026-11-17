"use client";
import { useEffect, useState } from "react";
import { TONES, type Tone } from "./tones";

function parts(target: number) {
  if (Number.isNaN(target)) return null;
  const s = Math.max(0, Math.floor((target - Date.now()) / 1000));
  return {
    Days: String(Math.floor(s / 86400)),
    Hours: String(Math.floor((s % 86400) / 3600)).padStart(2, "0"),
    Minutes: String(Math.floor((s % 3600) / 60)).padStart(2, "0"),
    Seconds: String(s % 60).padStart(2, "0"),
  };
}

export default function Countdown({ to, tone = "gold" }: { to: string; tone?: Tone }) {
  const t = TONES[tone];
  const target = new Date(to).getTime();
  const [p, setP] = useState<ReturnType<typeof parts>>(null);
  useEffect(() => {
    setP(parts(target));
    const id = setInterval(() => setP(parts(target)), 1000);
    return () => clearInterval(id);
  }, [target]);

  return (
    <div className="grid grid-cols-4 gap-2 text-center">
      {(["Days", "Hours", "Minutes", "Seconds"] as const).map((k) => (
        <div key={k} className={t.countBox}>
          <b className={t.countNum}>{p ? p[k] : "--"}</b>
          <span className={t.countLabel}>{k}</span>
        </div>
      ))}
    </div>
  );
}
