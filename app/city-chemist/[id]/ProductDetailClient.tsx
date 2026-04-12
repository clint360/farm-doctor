"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { SubNavbar } from "@/components/Navbar";
import { SimpleFooter } from "@/components/Footer";
import { CATEGORY_STYLE } from "../CityChemistClient";

const API = process.env.NEXT_PUBLIC_API_URL || "https://shon-unmonumented-nigel.ngrok-free.dev";

const apiHeaders: Record<string, string> = {
  "Content-Type": "application/json",
  Accept: "application/json",
  "ngrok-skip-browser-warning": "true",
};

type Product = {
  id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  category: string;
  price: number | null;
  unit: string;
  in_stock: boolean;
};

type OrderForm = {
  farmer_name: string;
  phone: string;
  location: string;
  reason: string;
};

export default function ProductDetailClient({ id }: { id: string }) {
  const [product, setProduct]         = useState<Product | null>(null);
  const [loading, setLoading]         = useState(true);
  const [notFound, setNotFound]       = useState(false);

  const [form, setForm]               = useState<OrderForm>({ farmer_name: "", phone: "", location: "", reason: "" });
  const [submitting, setSubmitting]   = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitted, setSubmitted]     = useState(false);

  // ── Fetch ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    fetch(`${API}/api/chemist/products/${id}`, { headers: apiHeaders })
      .then((r) => {
        if (r.status === 404) { setNotFound(true); return null; }
        if (!r.ok) throw new Error();
        return r.json();
      })
      .then((json) => { if (json) setProduct(json.data); })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [id]);

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product) return;
    setSubmitting(true);
    setSubmitError(null);

    try {
      const res = await fetch(`${API}/api/chemist/orders`, {
        method: "POST",
        headers: apiHeaders,
        body: JSON.stringify({
          product_id:   product.id,
          product_name: product.name,
          farmer_name:  form.farmer_name,
          phone:        form.phone,
          location:     form.location,
          reason:       form.reason,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Order failed");
      setSubmitted(true);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // ── Loading ───────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <>
        <SubNavbar />
        <div className="pd-center" style={{ minHeight: "70vh" }}>
          <div className="pd-spinner" />
          <span style={{ color: "var(--t3)", fontSize: 14 }}>Loading…</span>
        </div>
        <SimpleFooter />
        <PDStyles />
      </>
    );
  }

  // ── Not found ─────────────────────────────────────────────────────────────
  if (notFound || !product) {
    return (
      <>
        <SubNavbar />
        <div className="pd-center" style={{ minHeight: "70vh", textAlign: "center", padding: "2rem", gap: "1rem" }}>
          <div style={{ fontSize: "3rem", opacity: .4 }}>🌿</div>
          <h1 style={{ fontFamily: "var(--fd)", fontSize: "1.6rem", color: "var(--t1)" }}>Product not found</h1>
          <p style={{ color: "var(--t3)", fontSize: 14 }}>This product may have been removed or is unavailable.</p>
          <Link href="/city-chemist" className="pd-back-link">← Back to City Chemist</Link>
        </div>
        <SimpleFooter />
        <PDStyles />
      </>
    );
  }

  const s = CATEGORY_STYLE[product.category] ?? CATEGORY_STYLE.other;

  // ── Thank-you ─────────────────────────────────────────────────────────────
  if (submitted) {
    return (
      <>
        <SubNavbar />
        <div className="pd-center" style={{ minHeight: "80vh", padding: "2rem" }}>
          <div className="pd-thankyou">
            {/* Glowing icon */}
            <div className="pd-ty-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                <polyline points="22 4 12 14.01 9 11.01"/>
              </svg>
            </div>
            <h2 className="pd-ty-h">Order Received!</h2>
            <p className="pd-ty-p">
              Thanks for ordering <strong style={{ color: "var(--t1)" }}>{product.name}</strong>.<br />
              Our team will reach out soon to confirm delivery. No payment required yet.
            </p>
            <Link href="/city-chemist" className="pd-btn-primary" style={{ display: "inline-block", textAlign: "center" }}>
              Browse more products
            </Link>
          </div>
        </div>
        <SimpleFooter />
        <PDStyles />
      </>
    );
  }

  // ── Detail page ───────────────────────────────────────────────────────────
  return (
    <>
      <SubNavbar />

      <main className="pd-main">
        {/* Breadcrumb */}
        <nav className="pd-breadcrumb">
          <Link href="/city-chemist" className="pd-back-link">← City Chemist</Link>
          <span className="pd-bc-sep">/</span>
          <span className="pd-bc-current">{product.name}</span>
        </nav>

        <div className="pd-grid">
          {/* ── Left: Image ── */}
          <div className="pd-image-wrap">
            {product.image_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={product.image_url} alt={product.name} className="pd-image" />
            ) : (
              <div className="pd-image-placeholder">🌾</div>
            )}
            {/* Category badge over image */}
            <span className="pd-image-badge" style={{ background: s.bg, color: s.color }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: s.dot, flexShrink: 0, display: "inline-block" }} />
              {product.category}
            </span>
          </div>

          {/* ── Right: Info + Form ── */}
          <div className="pd-info">
            <h1 className="pd-name">{product.name}</h1>

            {product.description && (
              <p className="pd-desc">{product.description}</p>
            )}

            <div className="pd-meta">
              {product.price != null && (
                <div className="pd-price">
                  {product.price.toLocaleString()}
                  <span className="pd-price-unit"> XAF / {product.unit}</span>
                </div>
              )}
              <div className="pd-stock" style={{ color: product.in_stock ? "var(--g3)" : "var(--t3)" }}>
                <span className="pd-stock-dot" style={{ background: product.in_stock ? "var(--g2)" : "rgba(255,255,255,.2)" }} />
                {product.in_stock ? "In Stock" : "Out of Stock"}
              </div>
            </div>

            {/* Divider */}
            <div className="pd-divider" />

            {/* ── Order Form ── */}
            <div className="pd-form-wrap">
              <div className="pd-form-header">
                <div className="pd-form-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                  </svg>
                </div>
                <div>
                  <div className="pd-form-title">Place an Order</div>
                  <div className="pd-form-subtitle">No payment now — we&apos;ll confirm delivery with you.</div>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="pd-form">
                <PField
                  label="Your Name"
                  value={form.farmer_name}
                  onChange={(v) => setForm((f) => ({ ...f, farmer_name: v }))}
                  placeholder="e.g. Jean-Pierre Kamga"
                  required
                />
                <PField
                  label="Phone Number"
                  value={form.phone}
                  type="tel"
                  onChange={(v) => setForm((f) => ({ ...f, phone: v }))}
                  placeholder="e.g. 6XXXXXXXX"
                  required
                />
                <PField
                  label="Location / Village"
                  value={form.location}
                  onChange={(v) => setForm((f) => ({ ...f, location: v }))}
                  placeholder="e.g. Bafoussam, West Region"
                  required
                />
                <div className="pf-group">
                  <label className="pf-label">Why do you need this?</label>
                  <textarea
                    required
                    rows={3}
                    value={form.reason}
                    onChange={(e) => setForm((f) => ({ ...f, reason: e.target.value }))}
                    placeholder="e.g. My maize has pest damage and I need to treat it quickly."
                    className="pf-textarea"
                  />
                </div>

                {submitError && (
                  <div className="pd-form-error">{submitError}</div>
                )}

                <button
                  type="submit"
                  disabled={submitting || !product.in_stock}
                  className="pd-btn-primary"
                >
                  {submitting ? (
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                      <span className="pd-btn-spinner" /> Submitting…
                    </span>
                  ) : product.in_stock ? "Place Order" : "Out of Stock"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </main>

      <SimpleFooter />
      <PDStyles />
    </>
  );
}

// ─── Field ────────────────────────────────────────────────────────────────────
function PField({
  label, value, onChange, placeholder, type = "text", required,
}: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; type?: string; required?: boolean;
}) {
  return (
    <div className="pf-group">
      <label className="pf-label">{label}</label>
      <input
        type={type}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="pf-input"
      />
    </div>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
function PDStyles() {
  return (
    <style>{`
      .pd-main {
        max-width: 1060px; margin: 0 auto;
        padding: 100px 24px 80px;
        background: var(--bg); min-height: 80vh;
      }
      .pd-center {
        display: flex; flex-direction: column;
        align-items: center; justify-content: center;
        background: var(--bg);
      }
      .pd-spinner {
        width: 34px; height: 34px;
        border: 2px solid rgba(34,197,94,.15);
        border-top-color: var(--g2);
        border-radius: 50%;
        animation: pdSpin .7s linear infinite;
        margin-bottom: 8px;
      }
      @keyframes pdSpin { to { transform: rotate(360deg); } }

      /* Breadcrumb */
      .pd-breadcrumb {
        display: flex; align-items: center; gap: 8px;
        margin-bottom: 32px; font-size: 13px; color: var(--t3);
      }
      .pd-back-link {
        color: var(--g3); font-weight: 500;
        text-decoration: none; transition: color .2s;
      }
      .pd-back-link:hover { color: var(--g2); }
      .pd-bc-sep { opacity: .3; }
      .pd-bc-current {
        color: var(--t2); white-space: nowrap;
        overflow: hidden; text-overflow: ellipsis; max-width: 260px;
      }

      /* Grid */
      .pd-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 48px;
        align-items: start;
      }

      /* Image */
      .pd-image-wrap {
        position: relative;
        border-radius: var(--rl);
        overflow: hidden;
        aspect-ratio: 1 / 1;
        background: rgba(255,255,255,.04);
        border: 1px solid var(--border);
        max-height: 480px;
      }
      .pd-image {
        width: 100%; height: 100%; object-fit: cover;
      }
      .pd-image-placeholder {
        width: 100%; height: 100%;
        display: flex; align-items: center; justify-content: center;
        font-size: 5rem; opacity: .15;
      }
      .pd-image-badge {
        position: absolute; bottom: 14px; left: 14px;
        display: inline-flex; align-items: center; gap: 6px;
        padding: 5px 12px; border-radius: 100px;
        font-size: 11px; font-weight: 700;
        text-transform: capitalize; letter-spacing: .4px;
        backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);
      }

      /* Info */
      .pd-info { display: flex; flex-direction: column; gap: 0; }
      .pd-name {
        font-family: var(--fd);
        font-size: clamp(1.6rem, 3vw, 2.4rem);
        font-weight: 800; line-height: 1.15;
        color: var(--t1); letter-spacing: -.02em;
        margin-bottom: 12px;
      }
      .pd-desc {
        font-size: 15px; color: var(--t2);
        line-height: 1.7; margin-bottom: 20px;
      }
      .pd-meta {
        display: flex; align-items: center;
        gap: 20px; margin-bottom: 20px; flex-wrap: wrap;
      }
      .pd-price {
        font-size: 1.8rem; font-weight: 800;
        color: var(--g3); letter-spacing: -.02em;
      }
      .pd-price-unit {
        font-size: .9rem; font-weight: 400;
        color: var(--t3); letter-spacing: 0;
      }
      .pd-stock {
        display: flex; align-items: center; gap: 6px;
        font-size: 12px; font-weight: 600; letter-spacing: .4px;
        text-transform: uppercase;
      }
      .pd-stock-dot {
        width: 7px; height: 7px; border-radius: 50%;
        box-shadow: 0 0 8px currentColor;
        display: inline-block;
      }
      .pd-divider {
        height: 1px; background: var(--border);
        margin: 20px 0 24px;
      }

      /* Form card */
      .pd-form-wrap {
        background: var(--surface);
        border: 1px solid var(--border);
        border-radius: var(--r);
        padding: 24px;
      }
      .pd-form-header {
        display: flex; align-items: flex-start; gap: 12px;
        margin-bottom: 20px;
      }
      .pd-form-icon {
        width: 36px; height: 36px; border-radius: 10px;
        background: rgba(26,140,63,.2);
        border: 1px solid rgba(26,140,63,.3);
        display: flex; align-items: center; justify-content: center;
        color: var(--g3); flex-shrink: 0;
      }
      .pd-form-title {
        font-size: 15px; font-weight: 700; color: var(--t1);
        margin-bottom: 2px;
      }
      .pd-form-subtitle {
        font-size: 12px; color: var(--t3); line-height: 1.4;
      }
      .pd-form { display: flex; flex-direction: column; gap: 0; }

      /* Field */
      .pf-group { margin-bottom: 14px; }
      .pf-label {
        display: block; font-size: 11px; font-weight: 700;
        color: var(--t3); text-transform: uppercase;
        letter-spacing: .6px; margin-bottom: 6px;
      }
      .pf-input, .pf-textarea {
        width: 100%;
        background: rgba(255,255,255,.05);
        border: 1px solid var(--border);
        border-radius: 10px;
        color: var(--t1);
        font-family: var(--ff);
        font-size: 14px;
        padding: 10px 14px;
        outline: none;
        transition: border-color .2s;
        box-sizing: border-box;
      }
      .pf-input::placeholder, .pf-textarea::placeholder { color: var(--t3); }
      .pf-input:focus, .pf-textarea:focus {
        border-color: rgba(74,222,128,.4);
        background: rgba(255,255,255,.07);
      }
      .pf-textarea { resize: vertical; min-height: 80px; }

      /* Error */
      .pd-form-error {
        padding: 10px 14px; border-radius: 8px;
        background: rgba(239,68,68,.1);
        border: 1px solid rgba(239,68,68,.25);
        color: #fca5a5; font-size: 13px;
        margin-bottom: 12px;
      }

      /* CTA button */
      .pd-btn-primary {
        width: 100%; padding: 13px;
        background: var(--g1); color: #fff;
        border: none; border-radius: 10px;
        font-family: var(--ff); font-size: 15px; font-weight: 700;
        cursor: pointer; letter-spacing: .3px;
        transition: background .2s, box-shadow .2s, transform .15s;
        text-decoration: none; display: block;
      }
      .pd-btn-primary:hover:not(:disabled) {
        background: #22c55e;
        box-shadow: 0 8px 28px rgba(26,140,63,.4);
        transform: translateY(-1px);
      }
      .pd-btn-primary:disabled {
        background: rgba(255,255,255,.1);
        color: var(--t3); cursor: not-allowed;
      }
      .pd-btn-spinner {
        width: 14px; height: 14px;
        border: 2px solid rgba(255,255,255,.3);
        border-top-color: #fff;
        border-radius: 50%;
        display: inline-block;
        animation: pdSpin .7s linear infinite;
      }

      /* Thank-you */
      .pd-thankyou {
        background: var(--surface);
        border: 1px solid var(--border);
        border-radius: var(--rl);
        padding: 48px 36px;
        max-width: 440px; width: 100%;
        text-align: center;
        display: flex; flex-direction: column;
        align-items: center; gap: 16px;
      }
      .pd-ty-icon {
        width: 64px; height: 64px; border-radius: 50%;
        background: rgba(34,197,94,.15);
        border: 1px solid rgba(34,197,94,.3);
        display: flex; align-items: center; justify-content: center;
        color: var(--g3);
        box-shadow: 0 0 32px rgba(34,197,94,.2);
      }
      .pd-ty-h {
        font-family: var(--fd);
        font-size: 1.8rem; font-weight: 800;
        color: var(--t1); letter-spacing: -.02em;
      }
      .pd-ty-p {
        font-size: 15px; color: var(--t2); line-height: 1.7;
        max-width: 320px;
      }

      /* Responsive */
      @media (max-width: 700px) {
        .pd-main { padding: 80px 16px 60px; }
        .pd-grid {
          grid-template-columns: 1fr !important;
          gap: 28px !important;
        }
        .pd-image-wrap { max-height: 300px; }
      }
    `}</style>
  );
}
