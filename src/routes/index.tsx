import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useLang } from "@/lib/i18n";
import { HELPLINE_NUMBER } from "@/lib/config";
import { roundCoord, stepArea, isValidPhone, maxDigits, fullPhone, splitPhone, COUNTRY_CODES, UP_PLACES } from "@/lib/farm";
import {
  register, fetchCases, flushPending, updateDetails, deleteMe, store,
  type Case, type Registration,
} from "@/lib/api";
import { TopBar, Dots, Screen, SpeakButton, Icon, type IconName } from "@/components/ui-kit";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "कॉफ़ी हेल्पलाइन — Coffee Helpline" },
      { name: "description", content: "किसानों के लिए फ़सल सलाह हेल्पलाइन। Crop advice helpline for coffee farmers in India." },
      { property: "og:title", content: "कॉफ़ी हेल्पलाइन — Coffee Helpline" },
      { property: "og:description", content: "Register once, call the helpline, read your crop advice here." },
    ],
  }),
  component: App,
});

type View = "welcome" | "phone" | "loc" | "crop" | "area" | "consent" | "done" | "home" | "settings";
const STEPS: View[] = ["phone", "loc", "crop", "area", "consent"];
const CROPS: { id: "coffee" | "maize" | "beans" | "sugarcane" | "other"; icon: IconName }[] = [
  { id: "sugarcane", icon: "sugarcane" }, { id: "coffee", icon: "coffee" }, { id: "maize", icon: "maize" }, { id: "beans", icon: "beans" }, { id: "other", icon: "other" },
];
const telHref = `tel:${HELPLINE_NUMBER.replace(/[^\d+]/g, "")}`;

const empty: Registration = { phone: "", lat: null, lon: null, place: "", crops: [], area_acres: 1, consent: false };

function App() {
  const { t } = useLang();
  const [view, setView] = useState<View>("welcome");
  const [ready, setReady] = useState(false);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<Registration>(empty);
  const [msg, setMsg] = useState("");
  const [cc, setCc] = useState<string>("+91");
  const [busy, setBusy] = useState(false);
  const upd = (p: Partial<Registration>) => setForm((f) => ({ ...f, ...p }));

  useEffect(() => {
    if (store.isRegistered()) setView("home");
    setReady(true);
    flushPending();
    const on = () => flushPending();
    window.addEventListener("online", on);
    return () => window.removeEventListener("online", on);
  }, []);

  useEffect(() => { setMsg(""); window.scrollTo(0, 0); }, [view]);

  if (!ready) return <div className="min-h-dvh" />;

  const idx = STEPS.indexOf(view);
  const lastStep = editing ? 3 : 4;
  const go = (d: 1 | -1) => {
    if (d === -1 && idx === 0) return setView(editing ? "settings" : "welcome");
    if (d === -1) return setView(STEPS[idx - 1]!);
    if (editing && idx === lastStep) return saveEdit();
    setView(STEPS[idx + 1]!);
  };

  async function saveNew() {
    setBusy(true);
    try {
      const r = await register({ ...form, phone: fullPhone(cc, form.phone), consent: true });
      setView("done");
      if (r === "queued") setTimeout(() => setMsg(t.savedOffline), 0);
    } catch {
      setMsg(t.saveFail);
    } finally { setBusy(false); }
  }
  async function saveEdit() {
    setBusy(true);
    try {
      await updateDetails({ ...form, phone: fullPhone(cc, form.phone) });
      setEditing(false);
      setView("settings");
      setTimeout(() => setMsg(t.updated), 0);
    } catch { setMsg(t.saveFail); } finally { setBusy(false); }
  }

  const canNext =
    view === "phone" ? isValidPhone(form.phone, cc)
    : view === "loc" ? form.lat !== null || form.place.trim().length > 1
    : view === "crop" ? form.crops.length > 0 : true;

  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col">
      {view === "welcome" && (
        <>
          <TopBar />
          <Screen icon="leaf" text={t.welcome}>
            <div className="mt-auto flex flex-col gap-4">
              <button className="btn-primary" onClick={() => { setForm(empty); setView("phone"); }}>{t.start}</button>
              <Link to="/privacy" className="btn-link">{t.yourPrivacy}</Link>
            </div>
          </Screen>
        </>
      )}

      {idx >= 0 && (
        <>
          <TopBar onBack={() => go(-1)} />
          <Dots step={idx + 1} total={editing ? 4 : 5} />
          {view === "phone" && <PhoneStep value={form.phone} code={cc} onCode={(c) => { setCc(c); upd({ phone: form.phone.slice(0, maxDigits(c)) }); }} onChange={(phone) => upd({ phone })} />}
          {view === "loc" && <LocStep form={form} upd={upd} />}
          {view === "crop" && (
            <Screen icon="leaf" text={t.cropQ}>
              <div className="grid grid-cols-2 gap-3" role="group" aria-label={t.cropQ}>
                {CROPS.map((c) => {
                  const on = form.crops.includes(c.id);
                  return (
                    <button key={c.id} type="button" aria-pressed={on}
                      className={`tile ${on ? "tile-on" : ""}`}
                      onClick={() => upd({ crops: on ? form.crops.filter((x) => x !== c.id) : [...form.crops, c.id] })}>
                      <Icon name={c.icon} size={48} />
                      <span>{t.crops[c.id]}</span>
                      {on && <span className="absolute right-2 top-2"><Icon name="check" /></span>}
                    </button>
                  );
                })}
              </div>
            </Screen>
          )}
          {view === "area" && (
            <Screen icon="field" text={t.areaQ}>
              <div className="flex items-center justify-between gap-3">
                <button type="button" className="btn-round" aria-label={t.less} onClick={() => upd({ area_acres: stepArea(form.area_acres, -1) })}><Icon name="minus" size={32} /></button>
                <p className="text-center" aria-live="polite">
                  <span className="block text-5xl font-bold">{form.area_acres}</span>
                  <span className="text-xl">{t.acres}</span>
                </p>
                <button type="button" className="btn-round" aria-label={t.more} onClick={() => upd({ area_acres: stepArea(form.area_acres, 1) })}><Icon name="plus" size={32} /></button>
              </div>
            </Screen>
          )}
          {view === "consent" && (
            <Screen icon="shield" text={t.consentQ}>
              <ul className="flex flex-col gap-3 text-lg">
                {t.summary.map((s) => <li key={s} className="flex gap-3"><span className="text-primary"><Icon name="check" /></span>{s}</li>)}
              </ul>
              <div className="flex justify-center"><SpeakButton text={t.summary.join(" ")} /></div>
              <label className="flex min-h-14 cursor-pointer items-center gap-4 rounded-xl border-2 border-foreground p-4 text-xl font-bold">
                <input type="checkbox" className="h-8 w-8 accent-primary" checked={form.consent} onChange={(e) => upd({ consent: e.target.checked })} />
                {t.agree}
              </label>
              <Link to="/privacy" className="btn-link">{t.fullPolicy}</Link>
            </Screen>
          )}
          <div className="sticky bottom-0 border-t bg-background p-4">
            {msg && <p role="alert" className="mb-3 text-lg font-semibold text-destructive">{msg}</p>}
            {view === "consent" ? (
              <button className="btn-primary" disabled={!form.consent || busy} onClick={saveNew}>{busy ? t.saving : t.save}</button>
            ) : (
              <button className="btn-primary" disabled={!canNext || busy} onClick={() => go(1)}>
                {editing && idx === lastStep ? (busy ? t.saving : t.save) : t.next}
              </button>
            )}
          </div>
        </>
      )}

      {view === "done" && (
        <>
          <TopBar />
          <Screen icon="check" text={t.doneTitle}>
            {msg && <p role="status" className="note">{msg}</p>}
            <p className="text-center text-4xl font-bold tracking-wide">{HELPLINE_NUMBER}</p>
            <p className="text-center text-xl">{t.callFrom}</p>
            <div className="flex justify-center"><SpeakButton text={t.callFrom} /></div>
            <div className="mt-auto flex flex-col gap-3">
              <a href={telHref} className="btn-primary"><Icon name="phone" /> {t.callNow}</a>
              <button className="btn-secondary" onClick={() => setView("home")}>{t.goHome}</button>
            </div>
          </Screen>
        </>
      )}

      {view === "home" && <Home onSettings={() => setView("settings")} />}

      {view === "settings" && (
        <>
          <TopBar onBack={() => setView("home")} />
          <Settings
            msg={msg}
            onEdit={() => { const d = { ...empty, ...store.details(), consent: true }; const sp = splitPhone(d.phone); setCc(sp.code); setForm({ ...d, phone: sp.digits }); setEditing(true); setView("phone"); }}
            onDeleted={() => { setForm(empty); setView("welcome"); }}
          />
        </>
      )}
    </div>
  );
}

function PhoneStep({ value, code, onCode, onChange }: { value: string; code: string; onCode: (c: string) => void; onChange: (v: string) => void }) {
  const { t } = useLang();
  const max = maxDigits(code);
  const bad = code === "+91" ? value.length === 10 && !isValidPhone(value, code) : value.length >= 7 && !isValidPhone(value, code);
  return (
    <Screen icon="phone" text={t.phoneQ}>
      <p className="text-center text-lg">{t.phoneHint}</p>
      <label className="flex items-center rounded-xl border-2 border-foreground text-2xl font-bold">
        <select aria-label={t.countryCode} value={code} onChange={(e) => onCode(e.target.value)}
          className="min-h-14 rounded-l-xl border-r-2 border-foreground bg-transparent px-2 text-xl font-bold">
          {COUNTRY_CODES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <span className="sr-only">{t.phoneQ}</span>
        <input
          inputMode="numeric" autoComplete="tel-national" maxLength={max}
          className="min-h-14 w-full rounded-r-xl bg-transparent px-2 tracking-widest outline-none"
          value={value} onChange={(e) => onChange(e.target.value.replace(/\D/g, "").slice(0, max))}
        />
      </label>
      {bad && <p role="alert" className="text-lg font-semibold text-destructive">{t.phoneBad}</p>}
      <div className="grid grid-cols-3 gap-2" aria-hidden="false">
        {["1","2","3","4","5","6","7","8","9","","0","del"].map((k) =>
          k === "" ? <span key="blank" /> : (
            <button key={k} type="button" className="key"
              aria-label={k === "del" ? t.delete : k}
              onClick={() => onChange(k === "del" ? value.slice(0, -1) : (value + k).slice(0, max))}>
              {k === "del" ? "⌫" : k}
            </button>
          ))}
      </div>
    </Screen>
  );
}

function LocStep({ form, upd }: { form: Registration; upd: (p: Partial<Registration>) => void }) {
  const { t } = useLang();
  const [state, setState] = useState<"idle" | "wait" | "ok" | "fail">(form.lat !== null ? "ok" : "idle");
  const ask = () => {
    if (!navigator.geolocation) return setState("fail");
    setState("wait");
    navigator.geolocation.getCurrentPosition(
      (p) => { upd({ lat: roundCoord(p.coords.latitude), lon: roundCoord(p.coords.longitude) }); setState("ok"); },
      () => setState("fail"),
      { timeout: 15000, maximumAge: 600000 },
    );
  };
  return (
    <Screen icon="pin" text={t.locQ}>
      {state !== "fail" && (
        <button className="btn-primary" onClick={ask} disabled={state === "wait"}>
          <Icon name="pin" /> {state === "wait" ? t.locWait : t.useLoc}
        </button>
      )}
      {state === "ok" && <p role="status" className="note-ok"><Icon name="check" /> {t.locGot}</p>}
      {state === "fail" && <p role="alert" className="note">{t.locFail}</p>}
      <label className="flex flex-col gap-2 text-lg font-semibold">
        {t.pickPlace}
        <select className="min-h-14 rounded-xl border-2 border-foreground bg-background px-4 text-xl"
          value={UP_PLACES.some((p) => p.name === form.place) ? form.place : ""}
          onChange={(e) => { const p = UP_PLACES.find((x) => x.name === e.target.value); if (p) { upd({ place: p.name, lat: p.lat, lon: p.lon }); setState("ok"); } }}>
          <option value="" disabled>—</option>
          {UP_PLACES.map((p) => <option key={p.name} value={p.name}>{p.name}, Uttar Pradesh</option>)}
        </select>
      </label>
      {(state === "fail" || form.place) && (
        <label className="flex flex-col gap-2 text-lg font-semibold">
          {t.village}
          <input className="min-h-14 rounded-xl border-2 border-foreground bg-background px-4 text-xl"
            value={form.place} onChange={(e) => upd({ place: e.target.value })} />
        </label>
      )}
    </Screen>
  );
}

function Home({ onSettings }: { onSettings: () => void }) {
  const { t, lang } = useLang();
  const [cases, setCases] = useState<Case[]>(() => store.cases());
  const [open, setOpen] = useState<Case | null>(null);
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [pull, setPull] = useState(0);
  const startY = useRef<number | null>(null);
  const pending = !store.token();

  const load = async () => {
    if (!store.token()) { await flushPending(); if (!store.token()) return; }
    if (!navigator.onLine) return setNote(t.offlineNote);
    setLoading(true);
    try { setCases(await fetchCases()); setNote(""); } catch { setNote(t.loadFail); } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const fmt = (d: string) => new Date(d).toLocaleDateString(lang === "hi" ? "hi-IN" : "en-IN", { day: "numeric", month: "long", year: "numeric" });

  if (open) {
    return (
      <>
        <TopBar onBack={() => setOpen(null)} />
        <article className="flex flex-col gap-4 px-5 pb-8 pt-4">
          <p className="text-lg text-muted-foreground">{fmt(open.created_at)}</p>
          <Badge status={open.status} />
          <h1 className="text-2xl font-bold">{open.result_title}</h1>
          <SpeakButton text={`${open.result_title}. ${open.advice_text}`} />
          <h2 className="text-xl font-bold">{t.advice}</h2>
          <p className="whitespace-pre-line text-xl leading-relaxed">{open.advice_text}</p>
          {open.weather_summary && (<><h2 className="text-xl font-bold">{t.weather}</h2><p className="text-lg">{open.weather_summary}</p></>)}
        </article>
      </>
    );
  }

  return (
    <>
      <TopBar right={<button className="btn-ghost" aria-label={t.settings} onClick={onSettings}><Icon name="gear" /></button>} />
      <div
        className="flex flex-1 flex-col gap-4 px-4 pb-28 pt-3"
        onTouchStart={(e) => { if (window.scrollY === 0) startY.current = e.touches[0]!.clientY; }}
        onTouchMove={(e) => { if (startY.current !== null) setPull(Math.min(100, Math.max(0, e.touches[0]!.clientY - startY.current))); }}
        onTouchEnd={() => { if (pull > 70) load(); setPull(0); startY.current = null; }}
      >
        <div style={{ height: pull / 2 }} aria-hidden="true" />
        <div className="flex items-center justify-between gap-2">
          <h1 className="text-2xl font-bold">{t.homeTitle}</h1>
          <button className="btn-ghost" onClick={load} disabled={loading} aria-label={t.refresh}>
            <Icon name="refresh" /> <span className="text-base">{t.refresh}</span>
          </button>
        </div>
        {pending && <p role="status" className="note">{t.pendingNote}</p>}
        {note && <p role="status" className="note">{note}</p>}
        {cases.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-10 text-center">
            <Icon name="phone" size={56} />
            <p className="text-xl">{t.noCalls}</p>
            <SpeakButton text={t.noCalls} />
          </div>
        ) : (
          <ul className="flex flex-col gap-3">
            {cases.map((c) => (
              <li key={c.id}>
                <button className="card" onClick={() => setOpen(c)}>
                  <span className="text-base text-muted-foreground">{fmt(c.created_at)}</span>
                  <span className="text-xl font-bold">{c.result_title}</span>
                  <span className="line-clamp-2 text-lg">{c.advice_text}</span>
                  <Badge status={c.status} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="fixed inset-x-0 bottom-0 mx-auto max-w-md border-t bg-background p-4">
        <a href={telHref} className="btn-primary"><Icon name="phone" /> {t.callHelpline}</a>
      </div>
    </>
  );
}

function Badge({ status }: { status: Case["status"] }) {
  const { t } = useLang();
  return status === "answered"
    ? <span className="badge badge-ok">{t.answered}</span>
    : <span className="badge badge-wait">{t.inReview}</span>;
}

function Settings({ msg, onEdit, onDeleted }: { msg: string; onEdit: () => void; onDeleted: () => void }) {
  const { t } = useLang();
  const [confirm, setConfirm] = useState(false);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  return (
    <section className="flex flex-col gap-4 px-5 pb-8 pt-4">
      <h1 className="text-2xl font-bold">{t.settings}</h1>
      {msg && <p role="status" className="note-ok">{msg}</p>}
      <button className="btn-secondary" onClick={onEdit}>{t.changeDetails}</button>
      <Link to="/privacy" className="btn-secondary">{t.readPolicy}</Link>
      {!confirm ? (
        <button className="btn-danger mt-6" onClick={() => setConfirm(true)}>{t.deleteData}</button>
      ) : (
        <div role="alertdialog" aria-labelledby="del-q" className="mt-6 flex flex-col gap-3 rounded-xl border-2 border-destructive p-4">
          <p id="del-q" className="text-xl font-bold">{t.confirmDelete}</p>
          {err && <p role="alert" className="text-lg text-destructive">{err}</p>}
          <button className="btn-danger" disabled={busy} onClick={async () => {
            setBusy(true);
            try { await deleteMe(); onDeleted(); } catch { setErr(t.deleteFail); } finally { setBusy(false); }
          }}>{t.yesDelete}</button>
          <button className="btn-secondary" onClick={() => setConfirm(false)}>{t.cancel}</button>
        </div>
      )}
    </section>
  );
}
