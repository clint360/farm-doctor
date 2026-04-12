"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Navbar, SubNavbar } from "@/components/Navbar";
import { SimpleFooter } from "@/components/Footer";
import { useI18n } from "@/lib/i18n";

const API = process.env.NEXT_PUBLIC_API_URL || "https://shon-unmonumented-nigel.ngrok-free.dev";

const apiHeaders: Record<string, string> = {
  "Content-Type": "application/json",
  Accept: "application/json",
  "ngrok-skip-browser-warning": "true",
};

// ─── Types ────────────────────────────────────────────────────────────────────
type Category = "all" | "pesticide" | "fertilizer" | "herbicide" | "fungicide" | "other";

export type Product = {
  id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  category: string;
  price: number | null;
  unit: string;
};

// ─── Design tokens (dark theme) ───────────────────────────────────────────────
export const CATEGORY_STYLE: Record<string, { bg: string; color: string; dot: string }> = {
  pesticide:  { bg: "rgba(239,68,68,.15)",   color: "#fca5a5", dot: "#ef4444" },
  fertilizer: { bg: "rgba(34,197,94,.15)",   color: "#86efac", dot: "#22c55e" },
  herbicide:  { bg: "rgba(234,179,8,.15)",   color: "#fde047", dot: "#eab308" },
  fungicide:  { bg: "rgba(168,85,247,.15)",  color: "#d8b4fe", dot: "#a855f7" },
  other:      { bg: "rgba(255,255,255,.08)", color: "rgba(255,255,255,.55)", dot: "rgba(255,255,255,.4)" },
};

const CATEGORIES: { value: Category; icon: string }[] = [
  { value: "all",        icon: "⊞" },
  { value: "pesticide",  icon: "🪲" },
  { value: "fertilizer", icon: "🌱" },
  { value: "herbicide",  icon: "🌿" },
  { value: "fungicide",  icon: "🍄" },
  { value: "other",      icon: "📦" },
];

// ─── Component ────────────────────────────────────────────────────────────────
export default function CityChemistClient() {
  const { t } = useI18n();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState<string | null>(null);
  const [category, setCategory] = useState<Category>("all");

  useEffect(() => {
    setLoading(true);
    setError(null);
    const url = category === "all"
      ? `${API}/api/chemist/products`
      : `${API}/api/chemist/products?category=${category}`;

    fetch(url, { headers: apiHeaders })
      .then((r) => { if (!r.ok) throw new Error(); return r.json(); })
      .then((json) => setProducts(json.data ?? []))
      .catch(() => setError("Could not load products. Please try again."))
      .finally(() => setLoading(false));
  }, [category]);

  return (
    <>
      <Navbar />

      {/* ── Hero section ─────────────────────────────────────────────────── */}
      <section className="cc-hero">
        {/* Background orbs */}
        <div className="cc-orb cc-orb-1" />
        <div className="cc-orb cc-orb-2" />

        <div className="cc-hero-inner">
          <span className="cc-pill">
            <span className="cc-pill-dot" />
            {t("cc.hero.badge")}
          </span>
          <h1 className="cc-h1">
            {t("cc.hero.h1a")}<br />
            <em>{t("cc.hero.h1b")}</em>
          </h1>
          <p className="cc-sub">{t("cc.hero.sub")}</p>
        </div>
      </section>

      {/* ── Catalogue ────────────────────────────────────────────────────── */}
      <main className="cc-main">
        {/* Category filter */}
        <div className="cc-filters">
          {CATEGORIES.map((cat) => {
            const active = category === cat.value;
            return (
              <button
                key={cat.value}
                onClick={() => setCategory(cat.value)}
                className={`cc-filter${active ? " cc-filter-active" : ""}`}
              >
                <span className="cc-filter-icon">{cat.icon}</span>
                {t(`cc.cat.${cat.value}`)}
              </button>
            );
          })}
        </div>

        {/* States */}
        {loading && (
          <div className="cc-state">
            <div className="cc-spinner" />
            <span>{t("cc.loading")}</span>
          </div>
        )}

        {!loading && error && (
          <div className="cc-error">{t("cc.error")}</div>
        )}

        {!loading && !error && products.length === 0 && (
          <div className="cc-state">
            <span style={{ fontSize: "2.5rem" }}>🌾</span>
            <span>{t("cc.empty")}</span>
          </div>
        )}

        {/* Grid */}
        {!loading && !error && products.length > 0 && (
          <div className="cc-grid">
            {products.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </main>

      <SimpleFooter />

      {/* ── Styles ─────────────────────────────────────────────────────────── */}
      <style>{`
        /* Hero */
        .cc-hero {
          position: relative;
          overflow: hidden;
          padding: 160px 24px 100px;
          text-align: center;
          background-image:
            linear-gradient(
              to bottom,
              rgba(8,14,10,0.76) 0%,
              rgba(10,35,18,0.88) 40%,
              rgba(8,14,10,0.88) 100%
            ),
            url('/city-chemist.jpg');
          background-size: cover;
          background-position: center;
          background-color: var(--bg);
        }
        .cc-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(100px);
          pointer-events: none;
        }
        .cc-orb-1 {
          width: 480px; height: 480px;
          background: var(--g1); opacity: .12;
          top: -100px; left: -80px;
          animation: ccOrb 16s ease-in-out infinite;
        }
        .cc-orb-2 {
          width: 360px; height: 360px;
          background: var(--gold); opacity: .08;
          bottom: -60px; right: -40px;
          animation: ccOrb 16s ease-in-out infinite reverse;
          animation-delay: -8s;
        }
        @keyframes ccOrb {
          0%,100% { transform: translate(0,0) scale(1); }
          50%      { transform: translate(24px,-24px) scale(1.06); }
        }
        .cc-hero-inner {
          position: relative; z-index: 2;
          max-width: 560px; margin: 0 auto;
        }
        .cc-pill {
          display: inline-flex; align-items: center; gap: 8px;
          background: var(--surface); border: 1px solid var(--border);
          padding: 6px 16px 6px 10px; border-radius: 100px;
          font-size: 11px; font-weight: 600; color: var(--g3);
          letter-spacing: .5px; text-transform: uppercase; margin-bottom: 20px;
        }
        .cc-pill-dot {
          width: 7px; height: 7px;
          background: var(--g2); border-radius: 50%;
          box-shadow: 0 0 8px rgba(34,197,94,.5);
          animation: ccBlink 2s infinite;
        }
        @keyframes ccBlink { 0%,100%{opacity:1} 50%{opacity:.2} }
        .cc-h1 {
          font-family: var(--fd);
          font-size: clamp(3rem, 7vw, 5.5rem);
          font-weight: 800; line-height: 1.0;
          color: var(--t1); letter-spacing: -.03em;
          margin-bottom: 16px;
        }
        .cc-h1 em { font-style: normal; color: var(--g3); }
        .cc-sub {
          font-size: 16px; color: var(--t2);
          line-height: 1.7; max-width: 420px; margin: 0 auto;
          font-weight: 300;
        }

        /* Catalogue area */
        .cc-main {
          max-width: 1160px; margin: 0 auto;
          padding: 48px 24px 80px;
          background: var(--bg);
        }

        /* Filters */
        .cc-filters {
          display: flex; gap: 8px; flex-wrap: wrap;
          margin-bottom: 40px;
        }
        .cc-filter {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 8px 18px; border-radius: 100px;
          background: var(--surface);
          border: 1px solid var(--border);
          color: var(--t3); font-size: 13px; font-weight: 600;
          cursor: pointer; letter-spacing: .2px;
          transition: all .2s; font-family: var(--ff);
        }
        .cc-filter:hover { color: var(--t1); border-color: rgba(255,255,255,.2); background: rgba(255,255,255,.06); }
        .cc-filter-active {
          background: var(--g1); border-color: var(--g1);
          color: #fff; box-shadow: 0 4px 16px rgba(26,140,63,.35);
        }
        .cc-filter-active:hover { background: var(--g1); border-color: var(--g1); color: #fff; }
        .cc-filter-icon { font-size: 14px; }

        /* States */
        .cc-state {
          min-height: 300px; display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          gap: 12px; color: var(--t3); font-size: 15px;
        }
        .cc-spinner {
          width: 36px; height: 36px;
          border: 2px solid rgba(34,197,94,.2);
          border-top-color: var(--g2);
          border-radius: 50%;
          animation: ccSpin .7s linear infinite;
        }
        @keyframes ccSpin { to { transform: rotate(360deg); } }
        .cc-error {
          padding: 20px 24px; border-radius: 12px;
          background: rgba(239,68,68,.1); border: 1px solid rgba(239,68,68,.25);
          color: #fca5a5; font-size: 14px; text-align: center;
        }

        /* Grid */
        .cc-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 20px;
        }

        /* Card */
        .cc-card {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: var(--rl);
          overflow: hidden;
          display: flex; flex-direction: column;
          text-decoration: none; color: inherit;
        }
        .cc-card-img {
          width: 100%; height: 200px;
          background: rgba(255,255,255,.03);
          overflow: hidden; position: relative; flex-shrink: 0;
        }
        .cc-card-img img {
          width: 100%; height: 100%; object-fit: cover;
        }
        .cc-card-img-placeholder {
          width: 100%; height: 100%;
          display: flex; align-items: center; justify-content: center;
          font-size: 3rem; opacity: .25;
        }
        .cc-cat-badge {
          position: absolute; bottom: 10px; left: 12px;
          display: inline-flex; align-items: center; gap: 5px;
          padding: 4px 10px; border-radius: 100px;
          font-size: 10px; font-weight: 700;
          text-transform: capitalize; letter-spacing: .4px;
          backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px);
        }
        .cc-cat-dot { width: 5px; height: 5px; border-radius: 50%; flex-shrink: 0; }
        .cc-card-body {
          padding: 18px 20px 20px;
          flex: 1; display: flex; flex-direction: column; gap: 6px;
        }
        .cc-card-name {
          font-family: var(--fd);
          font-size: 1.1rem; font-weight: 700;
          color: var(--t1); line-height: 1.25;
        }
        /* Fixed two-line slot — always occupies the same space */
        .cc-card-desc {
          font-size: 13px; color: var(--t3);
          line-height: 1.5;
          height: calc(13px * 1.5 * 2); /* exactly 2 lines */
          overflow: hidden;
          display: -webkit-box; -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
        }
        .cc-card-price {
          font-size: 1rem; font-weight: 700; color: var(--g3);
          margin-top: 4px;
        }
        .cc-card-price span { font-size: .8rem; color: var(--t3); font-weight: 400; margin-left: 3px; }
        .cc-card-btn {
          margin-top: 8px;
          padding: 10px 0;
          background: rgba(26,140,63,.2);
          border: 1px solid rgba(26,140,63,.35);
          color: var(--g3);
          border-radius: 10px;
          font-size: 13px; font-weight: 700;
          text-align: center; letter-spacing: .3px;
        }
        /* Hover only on pointer devices (no touch/mobile) */
        @media (hover: hover) {
          .cc-card {
            transition: border-color .25s, box-shadow .25s, transform .25s;
          }
          .cc-card:hover {
            border-color: rgba(74,222,128,.25);
            box-shadow: 0 8px 40px rgba(26,140,63,.15);
            transform: translateY(-3px);
          }
          .cc-card-img img { transition: transform .4s; }
          .cc-card:hover .cc-card-img img { transform: scale(1.04); }
          .cc-card-btn { transition: background .2s, border-color .2s, color .2s; }
          .cc-card:hover .cc-card-btn {
            background: var(--g1);
            border-color: var(--g1);
            color: #fff;
          }
        }

        @media (max-width: 600px) {
          .cc-hero { padding: 120px 20px 60px; }
          .cc-main { padding: 32px 16px 64px; }
          .cc-grid { grid-template-columns: 1fr 1fr; gap: 12px; }
        }
        @media (max-width: 400px) {
          .cc-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </>
  );
}

// ─── Product Card ─────────────────────────────────────────────────────────────
export function ProductCard({ product }: { product: Product }) {
  const { t } = useI18n();
  const s = CATEGORY_STYLE[product.category] ?? CATEGORY_STYLE.other;

  return (
    <Link href={`/city-chemist/${product.id}`} className="cc-card">
      {/* Image */}
      <div className="cc-card-img">
        {product.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={product.image_url} alt={product.name} />
        ) : (
          <div className="cc-card-img-placeholder">🌾</div>
        )}
        {/* Category badge on image */}
        <span className="cc-cat-badge" style={{ background: s.bg, color: s.color }}>
          <span className="cc-cat-dot" style={{ background: s.dot }} />
          {product.category}
        </span>
      </div>

      {/* Body */}
      <div className="cc-card-body">
        <div className="cc-card-name">{product.name}</div>
        <div className="cc-card-desc">{product.description ?? ""}</div>
        {product.price != null && (
          <div className="cc-card-price">
            {product.price.toLocaleString()} XAF
            <span>/ {product.unit}</span>
          </div>
        )}
        <div className="cc-card-btn">{t("cc.card.btn")}</div>
      </div>
    </Link>
  );
}
