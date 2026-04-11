"use client";
import { useState, useEffect, useCallback, FormEvent } from "react";
import { SubNavbar } from "@/components/Navbar";
import { SimpleFooter } from "@/components/Footer";
import { PHONE_PLACEHOLDER } from "@/lib/contacts";
import { useI18n } from "@/lib/i18n";
import { validatePhone, validateName, validateText, validateLinkedInUrl } from "@/lib/security";

const API = process.env.NEXT_PUBLIC_API_URL || "https://shon-unmonumented-nigel.ngrok-free.dev";

const apiHeaders: Record<string, string> = {
  "Content-Type": "application/json",
  "Accept": "application/json",
};

type Step = "form" | "polling" | "done";

export function ExpertApplyClient() {
  const { t } = useI18n();
  const [step, setStep] = useState<Step>("form");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [coverLetter, setCoverLetter] = useState("");
  const [medium, setMedium] = useState<"mobile money" | "orange money">("mobile money");
  const [momoNumber, setMomoNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [transId, setTransId] = useState("");
  const [pollStatus, setPollStatus] = useState("");
  const [pollMessage, setPollMessage] = useState("");
  const [pollStart, setPollStart] = useState(0);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    // Validate all required fields
    if (!validateName(fullName)) {
      setError("Full name must be 2-100 characters without special characters");
      return;
    }
    if (!validatePhone(phone)) {
      setError("Invalid phone number (9-15 digits)");
      return;
    }
    if (!location || location.trim().length < 2 || location.length > 100) {
      setError("Location must be 2-100 characters");
      return;
    }
    if (!linkedin || !validateLinkedInUrl(linkedin)) {
      setError("Valid LinkedIn URL (https://linkedin.com/...) is required");
      return;
    }
    if (!validateText(coverLetter, 20, 2000)) {
      setError("Cover letter must be 20-2000 characters");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API}/api/expert-apply`, {
        method: "POST",
        headers: apiHeaders,
        body: JSON.stringify({
          full_name: fullName,
          phone,
          location,
          linkedin: linkedin || null,
          cover_letter: coverLetter,
          momo_number: momoNumber || phone,
          medium,
        }),
      });

      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      setTransId(data.transId);
      setPollStart(Date.now());
      setStep("polling");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : t("exp.error.submit"));
    } finally {
      setLoading(false);
    }
  };

  const POLL_TIMEOUT_MS = 1 * 60 * 1000; // 2 minutes

  const pollPayment = useCallback(async () => {
    if (!transId) return;

    if (pollStart && Date.now() - pollStart > POLL_TIMEOUT_MS) {
      setError(t("exp.poll.timeout"));
      setStep("form");
      return;
    }

    try {
      const res = await fetch(`${API}/api/expert-apply/status/${transId}`, {
        headers: apiHeaders,
      });
      const data = await res.json();
      setPollStatus(data.status);
      setPollMessage(data.message);
      if (data.activated) {
        setStep("done");
      } else if (data.status === "FAILED" || data.status === "EXPIRED") {
        setError(data.message || t("exp.error.failed"));
        setStep("form");
      }
    } catch (err) {
      console.error("[EXPERT] Application status check failed:", err);
    }
  }, [transId, pollStart]);

  useEffect(() => {
    if (step !== "polling") return;
    pollPayment();
    const interval = setInterval(pollPayment, 4000);
    return () => clearInterval(interval);
  }, [step, pollPayment]);

  return (
    <>
      <SubNavbar />

      <section className="expert-hero">
        <div className="c">
          <div className="tag">{t("exp.tag")}</div>
          <h2 className="stl">{t("exp.title")}</h2>
          <p className="sts text-center m-auto" style={{margin: "auto"}}>{t("exp.subtitle")}</p>

          <div className="benefits">
            <div className="benefit">
              <div className="benefit-icon">
                <svg viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>
              </div>
              <h4>{t("exp.b1.title")}</h4>
              <p>{t("exp.b1.desc")}</p>
            </div>
            <div className="benefit">
              <div className="benefit-icon">
                <svg viewBox="0 0 24 24"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>
              </div>
              <h4>{t("exp.b2.title")}</h4>
              <p>{t("exp.b2.desc")}</p>
            </div>
            <div className="benefit">
              <div className="benefit-icon">
                <svg viewBox="0 0 24 24"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
              </div>
              <h4>{t("exp.b3.title")}</h4>
              <p>{t("exp.b3.desc")}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="form-section">
        <div className="c">
          <div className="form-card">
            {/* ── FORM ── */}
            {step === "form" && (
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>{t("exp.form.name")} <span className="req">*</span></label>
                  <input type="text" placeholder="e.g. Dr. Amina Nkeng" required value={fullName} onChange={(e) => setFullName(e.target.value)} />
                </div>

                <div className="form-group">
                  <label>{t("exp.form.phone")} <span className="req">*</span></label>
                  <input type="tel" placeholder={`e.g. ${PHONE_PLACEHOLDER}`} required value={phone} onChange={(e) => setPhone(e.target.value)} />
                  <div className="hint">{t("exp.form.phoneHint")}</div>
                </div>

                <div className="form-group">
                  <label>{t("exp.form.location")} <span className="req">*</span></label>
                  <input type="text" placeholder="e.g. Bamenda, NW Region" required value={location} onChange={(e) => setLocation(e.target.value)} />
                  <div className="hint">{t("exp.form.locationHint")}</div>
                </div>

                <div className="form-group">
                  <label>{t("exp.form.linkedin")} <span className="req">*</span></label>
                  <input type="url" placeholder="https://linkedin.com/in/your-profile" value={linkedin} onChange={(e) => setLinkedin(e.target.value)} required />
                </div>

                <div className="form-group">
                  <label>{t("exp.form.cover")} <span className="req">*</span></label>
                  <textarea placeholder={t("exp.form.coverPlaceholder")} required value={coverLetter} onChange={(e) => setCoverLetter(e.target.value)} />
                </div>

                <div className="payment-box">
                  <h4>{t("exp.pay.title")}</h4>
                  <div className="price">{t("exp.pay.price")} <span>{t("exp.pay.unit")}</span></div>
                  <p>{t("exp.pay.desc")}</p>
                  <div className="payment-methods">
                    <div className={`pm${medium === "mobile money" ? " active" : ""}`} onClick={() => setMedium("mobile money")}>
                      <img src="/mobile-money.jpg" alt="Mobile Money" width={28} height={28} style={{ borderRadius: 6, objectFit: "cover" }} />
                      MTN MoMo
                    </div>
                    <div className={`pm${medium === "orange money" ? " active" : ""}`} onClick={() => setMedium("orange money")}>
                      <img src="/mobile-money.jpg" alt="Mobile Money" width={28} height={28} style={{ borderRadius: 6, objectFit: "cover" }} />
                      Orange Money
                    </div>
                  </div>
                  <div className="momo-input show">
                    <input
                      type="tel"
                      placeholder={`MoMo number (e.g. ${PHONE_PLACEHOLDER})`}
                      value={momoNumber}
                      onChange={(e) => setMomoNumber(e.target.value)}
                    />
                  </div>
                </div>

                {error && <div className="form-status error" style={{ display: "block" }}>{error}</div>}

                <button type="submit" className={`btn-submit${loading ? " loading" : ""}`} disabled={loading}>
                  <span>{t("exp.pay.btn")}</span>
                  <div className="spinner" />
                </button>
              </form>
            )}

            {/* ── POLLING ── */}
            {step === "polling" && (
              <div style={{ textAlign: "center", padding: "40px 0" }}>
                <div className="spinner" style={{ display: "block", width: 40, height: 40, border: "3px solid var(--border)", borderTopColor: "var(--g2)", margin: "0 auto 24px" }} />
                <h3 style={{ fontFamily: "var(--fd)", fontSize: 22, fontWeight: 700, color: "var(--t1)", marginBottom: 12 }}>
                  {t("exp.poll.title")}
                </h3>
                <p style={{ color: "var(--t2)", fontSize: 15, lineHeight: 1.7, maxWidth: 360, margin: "0 auto" }}>
                  {t("exp.poll.desc")}
                </p>
                <div style={{ marginTop: 20, padding: "12px 18px", background: "var(--surface)", borderRadius: "var(--r)", display: "inline-block" }}>
                  <span style={{ fontSize: 13, color: "var(--t3)" }}>{t("exp.poll.status")}: </span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: pollStatus === "PENDING" ? "var(--gold2)" : "var(--t2)" }}>
                    {pollStatus || "PENDING"}
                  </span>
                </div>
                {pollMessage && <p style={{ marginTop: 12, fontSize: 13, color: "var(--t3)" }}>{pollMessage}</p>}
                <button
                  onClick={() => { setError(t("exp.poll.cancelled")); setStep("form"); }}
                  style={{ marginTop: 24, background: "none", border: "1px solid var(--border)", borderRadius: "var(--r)", padding: "10px 24px", color: "var(--t3)", cursor: "pointer", fontSize: 14, fontFamily: "var(--ff)" }}
                >
                  {t("exp.poll.cancel")}
                </button>
              </div>
            )}

            {/* ── DONE ── */}
            {step === "done" && (
              <div style={{ textAlign: "center", padding: "40px 0" }}>
                <div style={{ width: 64, height: 64, borderRadius: "50%", background: "rgba(34,197,94,.12)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--g3)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                </div>
                <h3 style={{ fontFamily: "var(--fd)", fontSize: 24, fontWeight: 700, color: "var(--t1)", marginBottom: 12 }}>
                  {t("exp.done.title")}
                </h3>
                <p style={{ color: "var(--t2)", fontSize: 15, lineHeight: 1.7, maxWidth: 400, margin: "0 auto" }}>
                  {t("exp.done.desc1")} <strong style={{ color: "var(--gold2)" }}>{t("exp.done.desc2")}</strong>. {t("exp.done.desc3")} <strong>{location}</strong> {t("exp.done.desc4")}
                </p>
                <div style={{ marginTop: 28 }}>
                  <a href="/" className="btn btn-o">{t("exp.done.home")}</a>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      <SimpleFooter />
    </>
  );
}
