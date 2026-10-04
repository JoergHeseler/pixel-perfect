import { useEffect, useState, type ReactNode } from "react";
import { useLang } from "@/lib/i18n";

export function useHindiVoice() {
  const [voice, setVoice] = useState<SpeechSynthesisVoice | null>(null);
  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    const pick = () => setVoice(speechSynthesis.getVoices().find((v) => v.lang.toLowerCase().startsWith("hi")) ?? null);
    pick();
    speechSynthesis.addEventListener("voiceschanged", pick);
    return () => speechSynthesis.removeEventListener("voiceschanged", pick);
  }, []);
  return voice;
}

/** Reads text aloud in Hindi. Hidden when no Hindi voice exists. */
export function SpeakButton({ text }: { text: string }) {
  const voice = useHindiVoice();
  const { t } = useLang();
  if (!voice) return null;
  return (
    <button
      type="button"
      aria-label={t.listen}
      className="btn-secondary w-auto px-5"
      onClick={() => {
        speechSynthesis.cancel();
        const u = new SpeechSynthesisUtterance(text);
        u.voice = voice;
        u.lang = voice.lang;
        u.rate = 0.9;
        speechSynthesis.speak(u);
      }}
    >
      <Icon name="speaker" /> {t.listen}
    </button>
  );
}

export function Dots({ step, total }: { step: number; total: number }) {
  const { t } = useLang();
  return (
    <div className="flex justify-center gap-2 py-2" role="img" aria-label={t.stepOf(step, total)}>
      {Array.from({ length: total }, (_, i) => (
        <span key={i} className={`h-3 w-3 rounded-full ${i < step ? "bg-primary" : "bg-border"}`} />
      ))}
    </div>
  );
}

export function TopBar({ onBack, right }: { onBack?: () => void; right?: ReactNode }) {
  const { lang, setLang, t } = useLang();
  return (
    <header className="flex items-center justify-between gap-2 px-4 pt-3">
      {onBack ? (
        <button type="button" onClick={onBack} className="btn-ghost" aria-label={t.back}>
          <Icon name="back" /> {t.back}
        </button>
      ) : (
        <span className="text-lg font-bold">{t.appName}</span>
      )}
      <div className="flex items-center gap-2">
        {right}
        <button
          type="button"
          className="btn-ghost text-base"
          onClick={() => setLang(lang === "hi" ? "en" : "hi")}
          lang={lang === "hi" ? "en" : "hi"}
        >
          {lang === "hi" ? t.english : t.hindi}
        </button>
      </div>
    </header>
  );
}

export function Screen({ icon, text, children }: { icon: IconName; text: string; children?: ReactNode }) {
  return (
    <section className="flex flex-1 flex-col gap-5 px-5 pb-6 pt-4">
      <div className="mx-auto flex h-28 w-28 items-center justify-center rounded-full bg-secondary text-primary">
        <Icon name={icon} size={64} />
      </div>
      <h1 className="text-center text-2xl font-bold leading-snug">{text}</h1>
      <div className="flex justify-center">
        <SpeakButton text={text} />
      </div>
      {children}
    </section>
  );
}

export type IconName =
  | "coffee" | "maize" | "beans" | "sugarcane" | "other" | "phone" | "pin" | "field" | "shield" | "check"
  | "speaker" | "back" | "gear" | "leaf" | "refresh" | "plus" | "minus";

export function Icon({ name, size = 24 }: { name: IconName; size?: number }) {
  const p = {
    width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor",
    strokeWidth: 2, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true,
  };
  switch (name) {
    case "coffee": return <svg {...p}><ellipse cx="12" cy="12" rx="6" ry="9" /><path d="M12 3c-2 4 2 14 0 18" /></svg>;
    case "sugarcane": return <svg {...p}><path d="M9 21V3M15 21V3M9 8h0M9 14h0M15 6h0M15 12h0" /><path d="M7 8h4M7 14h4M13 6h4M13 12h4M15 3c2 0 4 1 5 3M9 3C7 3 5 4 4 6" /></svg>;
    case "maize": return <svg {...p}><path d="M12 21V8" /><ellipse cx="12" cy="8" rx="3" ry="6" /><path d="M12 21c-4-2-6-6-6-9M12 21c4-2 6-6 6-9" /></svg>;
    case "beans": return <svg {...p}><path d="M8 4c3 0 4 3 3 6s-1 6-4 6-4-4-3-7 1-5 4-5z" /><path d="M17 8c2 0 3 2 2 5s-1 5-3 5-3-3-2-6 1-4 3-4z" /></svg>;
    case "other": return <svg {...p}><circle cx="6" cy="12" r="1.5" /><circle cx="12" cy="12" r="1.5" /><circle cx="18" cy="12" r="1.5" /></svg>;
    case "phone": return <svg {...p}><path d="M5 3h4l2 5-3 2a12 12 0 0 0 6 6l2-3 5 2v4a2 2 0 0 1-2 2A18 18 0 0 1 3 5a2 2 0 0 1 2-2z" /></svg>;
    case "pin": return <svg {...p}><path d="M12 21s-7-6-7-12a7 7 0 0 1 14 0c0 6-7 12-7 12z" /><circle cx="12" cy="9" r="2.5" /></svg>;
    case "field": return <svg {...p}><path d="M3 20h18M5 20l3-8h8l3 8M12 12v8M8 16h8" /><circle cx="17" cy="6" r="2" /></svg>;
    case "shield": return <svg {...p}><path d="M12 3l8 3v6c0 5-4 8-8 9-4-1-8-4-8-9V6z" /><path d="M9 12l2 2 4-4" /></svg>;
    case "check": return <svg {...p}><circle cx="12" cy="12" r="9" /><path d="M8 12l3 3 5-6" /></svg>;
    case "speaker": return <svg {...p}><path d="M4 9v6h4l5 4V5L8 9z" /><path d="M16 9a4 4 0 0 1 0 6M19 6a8 8 0 0 1 0 12" /></svg>;
    case "back": return <svg {...p}><path d="M15 5l-7 7 7 7" /></svg>;
    case "gear": return <svg {...p}><circle cx="12" cy="12" r="3" /><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M5 19l2-2M17 7l2-2" /></svg>;
    case "leaf": return <svg {...p}><path d="M5 19c0-9 6-14 15-14 0 9-5 15-14 15" /><path d="M5 19l8-8" /></svg>;
    case "refresh": return <svg {...p}><path d="M20 12a8 8 0 1 1-3-6.2M20 4v5h-5" /></svg>;
    case "plus": return <svg {...p}><path d="M12 5v14M5 12h14" /></svg>;
    case "minus": return <svg {...p}><path d="M5 12h14" /></svg>;
  }
}
