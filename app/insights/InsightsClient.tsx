"use client";
import { useState, useRef, useEffect } from "react";
import { Navbar, SubNavbar } from "@/components/Navbar";
import { SimpleFooter } from "@/components/Footer";
import { useI18n } from "@/lib/i18n";

const API = process.env.NEXT_PUBLIC_API_URL || "https://shon-unmonumented-nigel.ngrok-free.dev";

const apiHeaders: Record<string, string> = {
  "Content-Type": "application/json",
  Accept: "application/json",
};

// ─── Types ────────────────────────────────────────────────────────────────────
type InsightsData = {
  crop: string;
  location: string | null;
  adviceSummary: string;
  stepsToPlant: string[];
  stepsToMaintain: string[];
  riskAlerts: string[];
  weatherConsiderations: string;
  communitySignals: string;
  reportCount: number;
  generatedAt: string;
};

// ─── Parse query into crop + location ────────────────────────────────────────
function parseSearchQuery(q: string): { crop: string; location: string | undefined } {
  const trimmed = q.trim();
  const locationKeywords = [
    "yaounde", "douala", "bafoussam", "bamenda", "buea", "limbe",
    "kumba", "bertoua", "ngaoundere", "maroua", "garoua",
    "west region", "north west", "south west", "centre region", "adamawa",
    "rainy season", "dry season", "cameroon",
  ];

  const lower = trimmed.toLowerCase();
  let detectedLocation: string | undefined;

  for (const kw of locationKeywords) {
    if (lower.includes(kw)) {
      detectedLocation = kw;
      break;
    }
  }

  const words = trimmed.split(/\s+/);
  if (!detectedLocation && words.length >= 2) {
    const possibleLocation = words.slice(1).join(" ");
    if (possibleLocation.length > 2) detectedLocation = possibleLocation;
  }

  let crop = trimmed;
  if (detectedLocation && lower.endsWith(detectedLocation.toLowerCase())) {
    crop = trimmed.slice(0, trimmed.length - detectedLocation.length).trim();
  }
  if (!crop) crop = trimmed;

  return { crop, location: detectedLocation };
}

// ─── Markdown renderer ────────────────────────────────────────────────────────
function parseInline(text: string): React.ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*\n]+\*|`[^`]+`)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**"))
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    if (part.startsWith("*") && part.endsWith("*"))
      return <em key={i}>{part.slice(1, -1)}</em>;
    if (part.startsWith("`") && part.endsWith("`"))
      return <code key={i} className="ins-code">{part.slice(1, -1)}</code>;
    return part;
  });
}

function MarkdownText({ text, inline = false }: { text: string; inline?: boolean }) {
  if (!text) return null;
  if (inline) return <>{parseInline(text)}</>;

  const blocks = text.split(/\n{2,}/);
  return (
    <>
      {blocks.map((block, bi) => {
        const lines = block.split("\n").filter(Boolean);
        const bulletLines = lines.filter((l) => /^[-•*]\s/.test(l.trim()));
        if (bulletLines.length > 0 && bulletLines.length === lines.length) {
          return (
            <ul key={bi} className="ins-md-list">
              {lines.map((l, li) => <li key={li}>{parseInline(l.replace(/^[-•*]\s+/, ""))}</li>)}
            </ul>
          );
        }
        if (/^#{1,3}\s/.test(lines[0])) {
          const headText = lines[0].replace(/^#{1,3}\s+/, "");
          return (
            <p key={bi} className="ins-md-heading">
              {parseInline(headText)}
              {lines.slice(1).map((l, li) => <span key={li}><br />{parseInline(l)}</span>)}
            </p>
          );
        }
        return (
          <p key={bi} className="ins-md-p">
            {lines.map((line, li) => (
              <span key={li}>{parseInline(line)}{li < lines.length - 1 && <br />}</span>
            ))}
          </p>
        );
      })}
    </>
  );
}

// ─── Section icons ────────────────────────────────────────────────────────────
function IconLeaf() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/></svg>;
}
function IconShovel() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M2 22v-5l5-5 5 5-5 5z"/><path d="M9.5 14.5 16 8"/><path d="m17 2 5 5-.5.5a3.53 3.53 0 0 1-5 0s0 0 0 0a3.53 3.53 0 0 1 0-5L17 2"/></svg>;
}
function IconDroplets() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M7 16.3c2.2 0 4-1.83 4-4.05 0-1.16-.57-2.26-1.71-3.19S7.29 6.75 7 5.3c-.29 1.45-1.14 2.84-2.29 3.76S3 11.1 3 12.25c0 2.22 1.8 4.05 4 4.05z"/><path d="M12.56 6.6A10.97 10.97 0 0 0 14 3.02c.5 2.5 2 4.9 4 6.5s3 3.5 3 5.5a6.98 6.98 0 0 1-11.91 4.97"/></svg>;
}
function IconAlertTriangle() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>;
}
function IconCloud() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/></svg>;
}
function IconUsers() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
}
function IconSearch() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 18, height: 18 }}><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>;
}

// ─── Rotating loading messages ────────────────────────────────────────────────
function LoadingMessages({ keys }: { keys: string[] }) {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setIdx((i) => (i + 1) % keys.length), 2500);
    return () => clearInterval(id);
  }, [keys.length]);
  return (
    <div className="ins-loading">
      <div className="ins-loading-orb">
        <span className="ins-loading-ring" />
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z"/>
          <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/>
        </svg>
      </div>
      <p className="ins-loading-msg" key={idx}>{keys[idx]}</p>
      <div className="ins-loading-dots"><span/><span/><span/></div>
    </div>
  );
}

// ─── Step + Alert lists ───────────────────────────────────────────────────────
function StepList({ steps }: { steps: string[] }) {
  if (!steps.length) return null;
  return (
    <ol className="ins-steps">
      {steps.map((step, i) => (
        <li key={i} className="ins-step">
          <span className="ins-step-n">{i + 1}</span>
          <span className="ins-step-t"><MarkdownText inline text={step} /></span>
        </li>
      ))}
    </ol>
  );
}

function AlertList({ alerts }: { alerts: string[] }) {
  if (!alerts.length) return null;
  return (
    <ul className="ins-alerts">
      {alerts.map((alert, i) => (
        <li key={i} className="ins-alert">
          <span className="ins-alert-dot" />
          <span><MarkdownText inline text={alert} /></span>
        </li>
      ))}
    </ul>
  );
}

// ─── Section card ─────────────────────────────────────────────────────────────
function SectionCard({ icon, title, accent = "green", children }: {
  icon: React.ReactNode; title: string; accent?: "green" | "gold" | "red" | "blue" | "purple"; children: React.ReactNode;
}) {
  return (
    <div className={`ins-card ins-card-${accent}`}>
      <div className="ins-card-hd">
        <div className={`ins-card-ic ins-card-ic-${accent}`}>{icon}</div>
        <h3 className="ins-card-title">{title}</h3>
      </div>
      <div className="ins-card-body">{children}</div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export function InsightsClient() {
  const { t, lang } = useI18n();
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<InsightsData | null>(null);
  const [error, setError] = useState("");
  const [notACrop, setNotACrop] = useState(false);
  const [remaining, setRemaining] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const loadingKeys = [
    t("ins.loading.1"), t("ins.loading.2"), t("ins.loading.3"),
    t("ins.loading.4"), t("ins.loading.5"),
  ];

  const handleSearch = async (e?: { preventDefault(): void }) => {
    e?.preventDefault();
    const q = query.trim();
    if (!q) return;
    setError("");
    setData(null);
    setNotACrop(false);
    setLoading(true);

    const { crop, location } = parseSearchQuery(q);

    try {
      const params = new URLSearchParams({ crop, locale: lang });
      if (location) params.set("location", location);

      const res = await fetch(`${API}/api/insights/search?${params}`, { headers: apiHeaders });

      const remainingHeader = res.headers.get("X-Insights-Remaining");
      if (remainingHeader !== null) setRemaining(Number(remainingHeader));

      const json = await res.json();

      if (res.status === 429) {
        setError(json.message ?? "Daily search limit reached. Try again tomorrow.");
        return;
      }
      if (res.status === 422 && json.notACrop) {
        setNotACrop(true);
        return;
      }
      if (!res.ok || !json.success) {
        setError(json.message ?? "Failed to load insights. Please try again.");
        return;
      }
      setData(json.data as InsightsData);
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleExampleClick = (example: string) => {
    setQuery(example);
    setTimeout(() => document.getElementById("ins-search-btn")?.click(), 50);
  };

  // Pluralise report count using the two i18n keys
  const reportLabel = (n: number) =>
    (n === 1 ? t("ins.reports") : t("ins.reportsN")).replace("{n}", String(n));

  const communityTag = (n: number) =>
    (n === 1 ? t("ins.community.tag") : t("ins.community.tagN")).replace("{n}", String(n));

  const remainingLabel = (n: number) =>
    (n === 1 ? t("ins.remaining") : t("ins.remainings")).replace("{n}", String(n));

  const exampleQueries = ["cassava", "maize bafoussam", "tomatoes rainy season", "cocoa southwest"];

  return (
    <>
      <style>{INSIGHTS_CSS}</style>
      <div className="ins-page">
        <Navbar />

        {/* ─── Hero ─────────────────────────────────────────────────────── */}
        <section className="ins-hero">
          <div className="ins-hero-bg">
            <div className="ins-orb ins-orb-1" />
            <div className="ins-orb ins-orb-2" />
          </div>
          <div className="c ins-hero-c">
            <div className="ins-badge">
              <span className="dot" />
              {t("ins.badge")}
            </div>
            <h1 className="ins-h1">
              {t("ins.h1a")} <em>{t("ins.h1em")}</em><br />
              {t("ins.h1b")} <span className="gr">{t("ins.h1gr")}</span>
            </h1>
            <p className="ins-sub">{t("ins.sub")}</p>

            <form ref={formRef} className="ins-form" onSubmit={handleSearch} autoComplete="off">
              <div className="ins-search-bar">
                <div className="ins-search-icon"><IconSearch /></div>
                <input
                  ref={inputRef}
                  className="ins-search-input"
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onFocus={() => formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })}
                  placeholder={t("ins.placeholder")}
                  autoComplete="off"
                  spellCheck={false}
                  disabled={loading}
                />
                <button
                  id="ins-search-btn"
                  type="submit"
                  className="ins-search-btn"
                  disabled={loading || !query.trim()}
                >
                  {loading ? <span className="ins-spinner" /> : t("ins.search")}
                </button>
              </div>
            </form>

            {!data && !loading && (
              <div className="ins-examples">
                <span className="ins-examples-label">{t("ins.try")}</span>
                {exampleQueries.map((ex) => (
                  <button key={ex} className="ins-example-pill" onClick={() => handleExampleClick(ex)} type="button">
                    {ex}
                  </button>
                ))}
              </div>
            )}

            {remaining !== null && (
              <p className="ins-remaining">{remainingLabel(remaining)}</p>
            )}
          </div>
        </section>

        {/* ─── Results ──────────────────────────────────────────────────── */}
        <section className="ins-results">
          <div className="c">
            {error && (
              <div className="ins-error">
                <span className="ins-error-icon">⚠</span>
                <span>{error}</span>
              </div>
            )}

            {loading && <LoadingMessages keys={loadingKeys} />}

            {notACrop && !loading && (
              <div className="ins-notcrop">
                <div className="ins-notcrop-ic">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
                    <path d="M11 8v4"/><path d="M11 16h.01"/>
                  </svg>
                </div>
                <p className="ins-notcrop-msg">{t("ins.notcrop")}</p>
                <div className="ins-examples" style={{ justifyContent: "center", marginTop: 16 }}>
                  {["cassava", "maize", "tomatoes", "cocoa", "plantain"].map((ex) => (
                    <button key={ex} className="ins-example-pill" onClick={() => { setNotACrop(false); setQuery(ex); setTimeout(() => document.getElementById("ins-search-btn")?.click(), 50); }} type="button">
                      {ex}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {data && !loading && (
              <div className="ins-data">
                <div className="ins-result-hd">
                  <div className="ins-result-meta">
                    <h2 className="ins-result-title">
                      <span className="ins-result-crop">{data.crop}</span>
                      {data.location && <span className="ins-result-loc"> · {data.location}</span>}
                    </h2>
                    <p className="ins-result-sub">
                      {reportLabel(data.reportCount)} · {t("ins.generated")} {new Date(data.generatedAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                    </p>
                  </div>
                  <button
                    className="ins-reset-btn"
                    onClick={() => { setData(null); setError(""); setQuery(""); setRemaining(null); setNotACrop(false); inputRef.current?.focus(); }}
                    type="button"
                  >
                    {t("ins.new")}
                  </button>
                </div>

                <div className="ins-grid">
                  <div className="ins-grid-full">
                    <SectionCard icon={<IconLeaf />} title={t("ins.s.advice")} accent="green">
                      <div className="ins-prose"><MarkdownText text={data.adviceSummary} /></div>
                    </SectionCard>
                  </div>

                  <SectionCard icon={<IconShovel />} title={t("ins.s.plant")} accent="green">
                    <StepList steps={data.stepsToPlant} />
                  </SectionCard>

                  <SectionCard icon={<IconDroplets />} title={t("ins.s.maintain")} accent="blue">
                    <StepList steps={data.stepsToMaintain} />
                  </SectionCard>

                  <SectionCard icon={<IconAlertTriangle />} title={t("ins.s.risk")} accent="red">
                    <AlertList alerts={data.riskAlerts} />
                  </SectionCard>

                  <SectionCard icon={<IconCloud />} title={t("ins.s.weather")} accent="blue">
                    <div className="ins-prose"><MarkdownText text={data.weatherConsiderations} /></div>
                  </SectionCard>

                  <div className="ins-grid-full">
                    <div className="ins-community">
                      <div className="ins-community-hd">
                        <div className="ins-community-ic"><IconUsers /></div>
                        <div>
                          <h3 className="ins-community-title">{t("ins.s.community")}</h3>
                          <span className="ins-community-tag">{communityTag(data.reportCount)}</span>
                        </div>
                      </div>
                      <div className="ins-community-body"><MarkdownText text={data.communitySignals} /></div>
                      {data.reportCount === 0 && (
                        <p className="ins-community-note">{t("ins.community.note")}</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="ins-cta">
                  <p className="ins-cta-t">{t("ins.cta.q")}</p>
                  <a
                    href={`https://wa.me/237682642553?text=${encodeURIComponent(`Hi Farm Doctor 👋 I have a question about ${data.crop}`)}`}
                    className="btn btn-wa ins-cta-btn"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <svg viewBox="0 0 24 24" fill="#fff" style={{ width: 18, height: 18, flexShrink: 0 }}>
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                    </svg>
                    {t("ins.cta.btn")}
                  </a>
                </div>
              </div>
            )}

            {!data && !loading && !error && (
              <div className="ins-empty">
                <div className="ins-empty-ic">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2a10 10 0 1 0 10 10"/><path d="M12 6v6l4 2"/><path d="M22 6l-4 4 4 4"/>
                  </svg>
                </div>
                <h3 className="ins-empty-t">{t("ins.empty.t")}</h3>
                <p className="ins-empty-s">{t("ins.empty.s")}</p>
                <div className="ins-feature-pills">
                  {(["ins.f.1","ins.f.2","ins.f.3","ins.f.4","ins.f.5"] as const).map((k) => (
                    <span key={k} className="ins-feature-pill">{t(k)}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>

        <SimpleFooter />
      </div>
    </>
  );
}

// ─── Scoped CSS ───────────────────────────────────────────────────────────────
const INSIGHTS_CSS = `
.ins-page{display:flex;flex-direction:column;min-height:100vh;background:var(--bg)}

/* ── Hero ── */
.ins-hero{padding:120px 0 64px;position:relative;background:var(--bg)}
.ins-hero-bg{position:absolute;inset:0;pointer-events:none;overflow:hidden}
.ins-orb{position:absolute;border-radius:50%;filter:blur(120px);animation:orb 14s ease-in-out infinite}
.ins-orb-1{width:500px;height:500px;background:var(--g1);opacity:.07;top:-20%;left:-10%}
.ins-orb-2{width:400px;height:400px;background:var(--gold);opacity:.05;bottom:-20%;right:-5%;animation-delay:-7s}
.ins-hero-c{position:relative;z-index:2;text-align:center}
.ins-badge{display:inline-flex;align-items:center;gap:8px;background:var(--surface);border:1px solid var(--border);padding:7px 16px 7px 10px;border-radius:100px;font-size:12px;font-weight:600;color:var(--g3);margin-bottom:20px;letter-spacing:.5px;text-transform:uppercase}
.ins-badge .dot{width:8px;height:8px;background:var(--g2);border-radius:50%;animation:blink 2s infinite;box-shadow:0 0 8px rgba(34,197,94,.5)}
.ins-h1{font-family:var(--fd);font-size:clamp(2.4rem,5vw,3.8rem);font-weight:800;line-height:1.08;color:var(--t1);margin-bottom:16px;letter-spacing:-.03em}
.ins-h1 em{font-style:normal;color:var(--gold)}
.ins-h1 .gr{color:var(--g3)}
.ins-sub{font-size:17px;color:var(--t2);max-width:520px;margin:0 auto 32px;line-height:1.75;font-weight:300}

/* ── Search bar ── */
.ins-form{max-width:640px;margin:0 auto 20px;scroll-margin-top:88px}
.ins-search-bar{display:flex;align-items:center;background:rgba(255,255,255,.05);border:1.5px solid var(--border);border-radius:100px;padding:6px 6px 6px 20px;transition:border-color .3s,box-shadow .3s;gap:8px}
.ins-search-bar:focus-within{border-color:var(--g2);box-shadow:0 0 0 3px rgba(34,197,94,.12)}
.ins-search-icon{color:var(--t3);display:flex;align-items:center;flex-shrink:0}
.ins-search-input{flex:1;background:transparent;border:none;outline:none;font-family:var(--ff);font-size:15px;color:var(--t1);min-width:0;padding:8px 4px}
.ins-search-input::placeholder{color:var(--t3)}
.ins-search-input:disabled{opacity:.5}
.ins-search-btn{background:var(--g1);color:#fff;border:none;border-radius:100px;padding:10px 28px;font-family:var(--ff);font-size:14px;font-weight:600;cursor:pointer;transition:all .3s var(--ease);white-space:nowrap;display:flex;align-items:center;gap:8px;flex-shrink:0}
.ins-search-btn:hover:not(:disabled){background:var(--g2);transform:translateY(-1px)}
.ins-search-btn:disabled{opacity:.5;cursor:not-allowed}
.ins-spinner{width:16px;height:16px;border:2px solid rgba(255,255,255,.3);border-top-color:#fff;border-radius:50%;animation:spin .7s linear infinite}
@keyframes spin{to{transform:rotate(360deg)}}

/* ── Example pills ── */
.ins-examples{display:flex;align-items:center;gap:8px;justify-content:center;flex-wrap:wrap;margin-bottom:12px}
.ins-examples-label{font-size:12px;color:var(--t3);font-weight:600;letter-spacing:.5px}
.ins-example-pill{background:var(--surface);border:1px solid var(--border);color:var(--t3);padding:6px 14px;border-radius:100px;font-family:var(--ff);font-size:13px;cursor:pointer;transition:all .25s;font-weight:500}
.ins-example-pill:hover{background:rgba(26,140,63,.1);border-color:var(--g1);color:var(--g3)}
.ins-remaining{font-size:12px;color:var(--t3);text-align:center}

/* ── Results ── */
.ins-results{flex:1;padding:30px 0 30px}

/* ── Error ── */
.ins-error{background:rgba(239,68,68,.08);border:1px solid rgba(239,68,68,.2);border-radius:16px;padding:20px 24px;display:flex;align-items:flex-start;gap:12px;color:#fca5a5;font-size:14px;line-height:1.6;max-width:640px;margin:0 auto}
.ins-error-icon{font-size:18px;flex-shrink:0;margin-top:1px}

/* ── Loading state ── */
.ins-loading{display:flex;flex-direction:column;align-items:center;justify-content:center;padding:80px 24px;gap:20px}
.ins-loading-orb{position:relative;width:80px;height:80px;display:flex;align-items:center;justify-content:center}
.ins-loading-orb svg{width:36px;height:36px;stroke:var(--g3);animation:leafPulse 2s ease-in-out infinite;position:relative;z-index:1}
.ins-loading-ring{position:absolute;inset:0;border-radius:50%;border:2px solid rgba(74,222,128,.2);border-top-color:var(--g3);animation:spin .9s linear infinite}
@keyframes leafPulse{0%,100%{transform:scale(1);opacity:.8}50%{transform:scale(1.15);opacity:1}}
.ins-loading-msg{font-size:16px;font-weight:500;color:var(--t2);text-align:center;max-width:360px;line-height:1.6;animation:fadeMsg .4s var(--ease)}
@keyframes fadeMsg{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}
.ins-loading-dots{display:flex;gap:6px;align-items:center}
.ins-loading-dots span{width:6px;height:6px;border-radius:50%;background:var(--g3);opacity:.3;animation:dotBounce 1.2s ease-in-out infinite}
.ins-loading-dots span:nth-child(2){animation-delay:.2s}
.ins-loading-dots span:nth-child(3){animation-delay:.4s}
@keyframes dotBounce{0%,100%{opacity:.3;transform:translateY(0)}50%{opacity:.9;transform:translateY(-5px)}}

/* ── Not-a-crop state ── */
.ins-notcrop{display:flex;flex-direction:column;align-items:center;text-align:center;padding:64px 24px}
.ins-notcrop-ic{width:72px;height:72px;border-radius:50%;background:rgba(232,152,48,.08);border:1px solid rgba(232,152,48,.18);display:flex;align-items:center;justify-content:center;margin-bottom:20px}
.ins-notcrop-ic svg{width:34px;height:34px;stroke:var(--gold2)}
.ins-notcrop-msg{font-size:15px;color:var(--t2);max-width:440px;line-height:1.75;margin-bottom:4px}

/* ── Skeleton ── */
.ins-skeleton{display:grid;grid-template-columns:1fr 1fr;gap:20px}
.ins-skel-card{background:var(--surface);border:1px solid var(--border);border-radius:var(--rl);padding:32px;animation:pulse 1.8s ease-in-out infinite}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}
.ins-skel-title{height:18px;width:40%;background:rgba(255,255,255,.07);border-radius:8px;margin-bottom:16px}
.ins-skel-line{height:12px;background:rgba(255,255,255,.05);border-radius:6px;margin-bottom:10px}
.ins-skel-short{width:65%}

/* ── Result header ── */
.ins-result-hd{display:flex;align-items:flex-start;justify-content:space-between;gap:16px;margin-bottom:32px;flex-wrap:wrap}
.ins-result-title{font-family:var(--fd);font-size:clamp(1.5rem,3vw,2.2rem);font-weight:800;color:var(--t1);line-height:1.2;margin-bottom:4px}
.ins-result-crop{color:var(--g3);text-transform:capitalize}
.ins-result-loc{color:var(--gold2);font-size:.75em;font-weight:600}
.ins-result-sub{font-size:13px;color:var(--t3)}
.ins-reset-btn{background:var(--surface);border:1px solid var(--border);color:var(--t3);padding:10px 20px;border-radius:100px;font-family:var(--ff);font-size:13px;font-weight:600;cursor:pointer;transition:all .3s;white-space:nowrap;flex-shrink:0}
.ins-reset-btn:hover{border-color:var(--t3);color:var(--t1)}

/* ── Grid ── */
.ins-grid{display:grid;grid-template-columns:1fr 1fr;gap:20px}
.ins-grid-full{grid-column:1/-1}

/* ── Section card ── */
.ins-card{background:var(--surface);border:1px solid var(--border);border-radius:var(--rl);padding:32px;transition:border-color .3s}
.ins-card-green{border-left:3px solid var(--g1)}
.ins-card-blue{border-left:3px solid #3b82f6}
.ins-card-red{border-left:3px solid #ef4444}
.ins-card-hd{display:flex;align-items:center;gap:12px;margin-bottom:20px}
.ins-card-ic{width:40px;height:40px;border-radius:10px;display:flex;align-items:center;justify-content:center;flex-shrink:0}
.ins-card-ic svg{width:20px;height:20px}
.ins-card-ic-green{background:rgba(26,140,63,.12)}
.ins-card-ic-green svg{stroke:var(--g3)}
.ins-card-ic-blue{background:rgba(59,130,246,.12)}
.ins-card-ic-blue svg{stroke:#60a5fa}
.ins-card-ic-red{background:rgba(239,68,68,.1)}
.ins-card-ic-red svg{stroke:#f87171}
.ins-card-title{font-family:var(--fd);font-size:17px;font-weight:700;color:var(--t1)}
.ins-card-body{font-size:14px;color:var(--t2);line-height:1.75}

/* ── Step list ── */
.ins-steps{list-style:none;display:flex;flex-direction:column;gap:12px}
.ins-step{display:flex;align-items:flex-start;gap:12px}
.ins-step-n{width:26px;height:26px;border-radius:50%;background:rgba(26,140,63,.12);color:var(--g3);display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;flex-shrink:0;margin-top:1px}
.ins-step-t{color:var(--t2);font-size:14px;line-height:1.65}
.ins-step-t strong{color:var(--t1)}

/* ── Alert list ── */
.ins-alerts{list-style:none;display:flex;flex-direction:column;gap:10px}
.ins-alert{display:flex;align-items:flex-start;gap:10px;font-size:14px;color:var(--t2);line-height:1.65}
.ins-alert-dot{width:8px;height:8px;border-radius:50%;background:#f87171;flex-shrink:0;margin-top:6px}
.ins-alert strong{color:var(--t1)}

/* ── Prose + markdown ── */
.ins-prose{font-size:15px;color:var(--t2);line-height:1.8}
.ins-prose .ins-md-p{margin:0 0 10px}
.ins-prose .ins-md-p:last-child{margin-bottom:0}
.ins-prose .ins-md-heading{font-weight:700;color:var(--t1);margin:0 0 6px;font-size:14px;text-transform:uppercase;letter-spacing:.4px}
.ins-prose .ins-md-list{margin:4px 0 10px;padding-left:18px;display:flex;flex-direction:column;gap:4px}
.ins-prose .ins-md-list li{list-style:disc;color:var(--t2);font-size:15px;line-height:1.7}
.ins-code{background:rgba(255,255,255,.07);border:1px solid var(--border);border-radius:4px;padding:1px 6px;font-family:monospace;font-size:13px;color:var(--g3)}

/* ── Community signals ── */
.ins-community{background:linear-gradient(135deg,rgba(26,140,63,.07),rgba(232,152,48,.04));border:1px solid rgba(26,140,63,.15);border-radius:var(--rl);padding:32px;position:relative;overflow:hidden}
.ins-community::before{content:'';position:absolute;top:-40px;right:-40px;width:180px;height:180px;background:rgba(26,140,63,.06);border-radius:50%;filter:blur(40px)}
.ins-community-hd{display:flex;align-items:center;gap:14px;margin-bottom:18px}
.ins-community-ic{width:48px;height:48px;border-radius:12px;background:rgba(26,140,63,.12);display:flex;align-items:center;justify-content:center;flex-shrink:0}
.ins-community-ic svg{width:24px;height:24px;stroke:var(--g3)}
.ins-community-title{font-family:var(--fd);font-size:19px;font-weight:700;color:var(--t1);margin-bottom:2px}
.ins-community-tag{font-size:12px;color:var(--g3);font-weight:600;letter-spacing:.3px}
.ins-community-body{font-size:15px;color:var(--t2);line-height:1.8}
.ins-community-body .ins-md-p{margin:0 0 10px}
.ins-community-body .ins-md-p:last-child{margin-bottom:0}
.ins-community-body .ins-md-list{padding-left:18px;display:flex;flex-direction:column;gap:4px}
.ins-community-body .ins-md-list li{list-style:disc;color:var(--t2);font-size:15px;line-height:1.7}
.ins-community-note{margin-top:16px;font-size:13px;color:var(--gold2);background:rgba(232,152,48,.06);border:1px solid rgba(232,152,48,.12);border-radius:10px;padding:12px 16px;line-height:1.6}

/* ── CTA ── */
.ins-cta{margin-top:40px;text-align:center;padding:40px;background:var(--bg2);border:1px solid var(--border);border-radius:var(--rl)}
.ins-cta-t{font-family:var(--fd);font-size:18px;font-weight:700;color:var(--t1);margin-bottom:20px}
.ins-cta-btn{margin:0 auto}

/* ── Empty state ── */
.ins-empty{text-align:center;padding:80px 24px}
.ins-empty-ic{width:80px;height:80px;border-radius:50%;background:rgba(26,140,63,.08);border:1px solid rgba(26,140,63,.15);display:flex;align-items:center;justify-content:center;margin:0 auto 24px}
.ins-empty-ic svg{width:40px;height:40px;stroke:var(--g3);opacity:.6}
.ins-empty-t{font-family:var(--fd);font-size:22px;font-weight:700;color:var(--t1);margin-bottom:10px}
.ins-empty-s{font-size:15px;color:var(--t3);max-width:440px;margin:0 auto 28px;line-height:1.75}
.ins-feature-pills{display:flex;flex-wrap:wrap;gap:8px;justify-content:center}
.ins-feature-pill{background:var(--surface);border:1px solid var(--border);color:var(--t3);padding:7px 16px;border-radius:100px;font-size:13px;font-weight:500}

/* ── Responsive ── */
@media(max-width:768px){
  .ins-hero{padding:100px 0 48px}
  .ins-grid{grid-template-columns:1fr}
  .ins-skeleton{grid-template-columns:1fr}
  .ins-result-hd{flex-direction:column;align-items:flex-start}
  .ins-search-btn{padding:10px 18px}
  .ins-card{padding:24px 20px}
  .ins-community{padding:24px 20px}
  .ins-cta{padding:28px 20px}
}
@media(max-width:480px){
  .ins-search-bar{border-radius:16px;padding:8px 12px}
  .ins-search-btn{border-radius:10px}
  .ins-h1{font-size:2rem}
}
`;
