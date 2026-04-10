"use client";
import { useState, useEffect, useCallback } from "react";
import { SubNavbar } from "@/components/Navbar";
import { SimpleFooter } from "@/components/Footer";
import { WA_LINK, PHONE_PLACEHOLDER } from "@/lib/contacts";

const API = process.env.NEXT_PUBLIC_API_URL || "https://shon-unmonumented-nigel.ngrok-free.dev";

type Plan = {
  name: string;
  price: number;
  limits: { voice_minutes: number; image_analyses: number; can_access_experts: boolean };
};

type SubInfo = {
  plan: string;
  status: string;
  expires_at: string;
  started_at: string;
} | null;

type Step = "phone" | "plans" | "checkout" | "polling" | "done";

export default function SubscribeClient() {
  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState("");
  const [plans, setPlans] = useState<Plan[]>([]);
  const [currentSub, setCurrentSub] = useState<SubInfo>(null);
  const [currentPlan, setCurrentPlan] = useState("free");
  const [isActive, setIsActive] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState("");
  const [momoNumber, setMomoNumber] = useState("");
  const [medium, setMedium] = useState<"mobile money" | "orange money">("mobile money");
  const [transId, setTransId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [pollStatus, setPollStatus] = useState("");
  const [pollMessage, setPollMessage] = useState("");
  const [pollStart, setPollStart] = useState(0);

  // ── Step 1: Lookup phone ──
  const lookupPhone = async () => {
    if (!phone || phone.length < 9) {
      setError(`Enter a valid phone number (e.g. ${PHONE_PLACEHOLDER})`);
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API}/api/subscription?phone=${encodeURIComponent(phone)}`);
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      setPlans(data.plans || []);
      setCurrentSub(data.subscription);
      setCurrentPlan(data.plan || "free");
      setIsActive(data.isActive || false);
      setStep("plans");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to check subscription");
    } finally {
      setLoading(false);
    }
  };

  // ── Step 3: Initiate payment ──
  const initiatePayment = async () => {
    if (!momoNumber || momoNumber.length < 9) {
      setError("Enter a valid MoMo number");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API}/api/subscription`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, plan: selectedPlan, momo_number: momoNumber, medium }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      setTransId(data.transId);
      setPollStart(Date.now());
      setStep("polling");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Payment initiation failed");
    } finally {
      setLoading(false);
    }
  };

  const POLL_TIMEOUT_MS = 1 * 60 * 1000; // 2 minutes

  // ── Step 4: Poll payment status ──
  const pollPayment = useCallback(async () => {
    if (!transId) return;

    // Timeout: if polling > 2 min, treat as failed
    if (pollStart && Date.now() - pollStart > POLL_TIMEOUT_MS) {
      setError("Payment timed out. Please try again or check your MoMo notifications.");
      setStep("checkout");
      return;
    }

    try {
      const res = await fetch(`${API}/api/subscription/status/${transId}`);
      const data = await res.json();
      setPollStatus(data.status);
      setPollMessage(data.message);
      if (data.activated) {
        setStep("done");
      } else if (data.status === "FAILED" || data.status === "EXPIRED") {
        setError(data.message || "Payment failed. Please try again.");
        setStep("checkout");
      }
    } catch {
      // silent retry
    }
  }, [transId, pollStart]);

  useEffect(() => {
    if (step !== "polling") return;
    pollPayment();
    const interval = setInterval(pollPayment, 4000);
    return () => clearInterval(interval);
  }, [step, pollPayment]);

  const planLabels: Record<string, string> = {
    starter: "Starter",
    pro: "Pro",
    cooperative: "Cooperative",
  };

  return (
    <>
      <SubNavbar />
      <section className="expert-hero">
        <div className="c">
          <h1 style={{ fontFamily: "var(--fd)", fontSize: "clamp(28px,5vw,44px)", fontWeight: 800, color: "var(--t1)", marginBottom: 12 }}>
            Subscribe to Farm Doctor
          </h1>
          <p style={{ color: "var(--t2)", maxWidth: 540, margin: "0 auto", fontSize: 16, lineHeight: 1.7 }}>
            Unlock more AI diagnoses, voice minutes, and expert access with a paid plan.
          </p>
        </div>
      </section>

      <section className="form-section">
        <div className="form-card">
          {/* ── STEP 1: Phone ── */}
          {step === "phone" && (
            <>
              <div className="form-group">
                <label>Your Phone Number <span className="req">*</span></label>
                <input
                  type="tel"
                  placeholder={`e.g. ${PHONE_PLACEHOLDER}`}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                  onKeyDown={(e) => e.key === "Enter" && lookupPhone()}
                />
                <div className="hint">Enter the phone number you use on WhatsApp or Telegram.</div>
              </div>
              {error && <div className="form-status error" style={{ display: "block" }}>{error}</div>}
              <button className={`btn-submit${loading ? " loading" : ""}`} onClick={lookupPhone} disabled={loading}>
                <span>Check My Subscription</span>
                <div className="spinner" />
              </button>
            </>
          )}

          {/* ── STEP 2: Plans ── */}
          {step === "plans" && (
            <>
              {isActive && currentSub && (
                <div className="payment-box" style={{ marginBottom: 28, borderColor: "var(--g1)" }}>
                  <h4 style={{ color: "var(--g3)" }}>Current Plan: {planLabels[currentPlan] || currentPlan}</h4>
                  <p>
                    Active until <strong style={{ color: "var(--gold2)" }}>{new Date(currentSub.expires_at).toLocaleDateString()}</strong>
                  </p>
                  <p style={{ marginTop: 8, fontSize: 12 }}>You can upgrade to a higher plan below.</p>
                </div>
              )}
              {!isActive && (
                <div style={{ marginBottom: 24, padding: "14px 18px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--r)", fontSize: 14, color: "var(--t2)" }}>
                  You&apos;re currently on the <strong style={{ color: "var(--t1)" }}>Free</strong> plan.
                </div>
              )}

              <div style={{ display: "grid", gap: 16 }}>
                {plans.map((p) => {
                  const isCurrent = isActive && currentPlan === p.name;
                  const isDowngrade = isActive && plans.findIndex((x) => x.name === currentPlan) >= plans.findIndex((x) => x.name === p.name);
                  return (
                    <div
                      key={p.name}
                      onClick={() => { if (!isCurrent && !isDowngrade) { setSelectedPlan(p.name); setMomoNumber(phone); setStep("checkout"); } }}
                      style={{
                        padding: "24px 20px",
                        background: isCurrent ? "rgba(26,140,63,.08)" : "var(--surface)",
                        border: `2px solid ${isCurrent ? "var(--g1)" : "var(--border)"}`,
                        borderRadius: "var(--r)",
                        cursor: isCurrent || isDowngrade ? "default" : "pointer",
                        opacity: isDowngrade && !isCurrent ? 0.4 : 1,
                        transition: "all .3s",
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                        <h3 style={{ fontFamily: "var(--fd)", fontSize: 20, fontWeight: 700, color: "var(--t1)" }}>
                          {planLabels[p.name]}
                          {isCurrent && <span style={{ fontSize: 12, color: "var(--g3)", marginLeft: 8, fontFamily: "var(--ff)" }}>CURRENT</span>}
                        </h3>
                        <div style={{ fontFamily: "var(--fd)", fontSize: 24, fontWeight: 800, color: "var(--gold2)" }}>
                          {p.price.toLocaleString()} <span style={{ fontSize: 12, fontWeight: 400, color: "var(--t3)" }}>XAF/mo</span>
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: 16, fontSize: 13, color: "var(--t3)", flexWrap: "wrap" }}>
                        <span>{p.limits.image_analyses} image diagnoses</span>
                        <span>{p.limits.voice_minutes} voice minutes</span>
                        {p.limits.can_access_experts && <span style={{ color: "var(--gold2)" }}>Expert access</span>}
                      </div>
                    </div>
                  );
                })}
              </div>

              <button
                onClick={() => { setStep("phone"); setError(""); }}
                style={{ marginTop: 20, background: "none", border: "none", color: "var(--t3)", cursor: "pointer", fontSize: 14, fontFamily: "var(--ff)" }}
              >
                ← Change phone number
              </button>
            </>
          )}

          {/* ── STEP 3: Checkout ── */}
          {step === "checkout" && (
            <>
              <div className="payment-box">
                <h4>{planLabels[selectedPlan]} Plan</h4>
                <div className="price">
                  {(plans.find((p) => p.name === selectedPlan)?.price || 0).toLocaleString()} XAF
                  <span> / month</span>
                </div>
                <p>Payment will be sent to your MoMo number. Confirm on your phone to activate.</p>
              </div>

              <div className="payment-methods">
                <div className={`pm${medium === "mobile money" ? " active" : ""}`} onClick={() => setMedium("mobile money")}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="3" width="20" height="18" rx="2"/><path d="M2 9h20"/></svg>
                  MTN MoMo
                </div>
                <div className={`pm${medium === "orange money" ? " active" : ""}`} onClick={() => setMedium("orange money")}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="3" width="20" height="18" rx="2"/><path d="M2 9h20"/></svg>
                  Orange Money
                </div>
              </div>

              <div className="form-group" style={{ marginTop: 20 }}>
                <label>MoMo Number <span className="req">*</span></label>
                <input
                  type="tel"
                  placeholder={`e.g. ${PHONE_PLACEHOLDER}`}
                  value={momoNumber}
                  onChange={(e) => setMomoNumber(e.target.value.replace(/\D/g, ""))}
                />
              </div>

              {error && <div className="form-status error" style={{ display: "block" }}>{error}</div>}

              <button className={`btn-submit${loading ? " loading" : ""}`} onClick={initiatePayment} disabled={loading}>
                <span>Pay {(plans.find((p) => p.name === selectedPlan)?.price || 0).toLocaleString()} XAF</span>
                <div className="spinner" />
              </button>

              <button
                onClick={() => { setStep("plans"); setError(""); }}
                style={{ marginTop: 16, background: "none", border: "none", color: "var(--t3)", cursor: "pointer", fontSize: 14, fontFamily: "var(--ff)", width: "100%", textAlign: "center" }}
              >
                ← Back to plans
              </button>
            </>
          )}

          {/* ── STEP 4: Polling ── */}
          {step === "polling" && (
            <div style={{ textAlign: "center", padding: "40px 0" }}>
              <div className="spinner" style={{ display: "block", width: 40, height: 40, border: "3px solid var(--border)", borderTopColor: "var(--g2)", margin: "0 auto 24px" }} />
              <h3 style={{ fontFamily: "var(--fd)", fontSize: 22, fontWeight: 700, color: "var(--t1)", marginBottom: 12 }}>
                Waiting for Payment
              </h3>
              <p style={{ color: "var(--t2)", fontSize: 15, lineHeight: 1.7, maxWidth: 360, margin: "0 auto" }}>
                A payment request has been sent to your phone. Please confirm on your device.
              </p>
              <div style={{ marginTop: 20, padding: "12px 18px", background: "var(--surface)", borderRadius: "var(--r)", display: "inline-block" }}>
                <span style={{ fontSize: 13, color: "var(--t3)" }}>Status: </span>
                <span style={{ fontSize: 13, fontWeight: 600, color: pollStatus === "PENDING" ? "var(--gold2)" : "var(--t2)" }}>
                  {pollStatus || "PENDING"}
                </span>
              </div>
              {pollMessage && <p style={{ marginTop: 12, fontSize: 13, color: "var(--t3)" }}>{pollMessage}</p>}
              <button
                onClick={() => { setError("Payment cancelled."); setStep("checkout"); }}
                style={{ marginTop: 24, background: "none", border: "1px solid var(--border)", borderRadius: "var(--r)", padding: "10px 24px", color: "var(--t3)", cursor: "pointer", fontSize: 14, fontFamily: "var(--ff)" }}
              >
                Cancel
              </button>
            </div>
          )}

          {/* ── STEP 5: Done ── */}
          {step === "done" && (
            <div style={{ textAlign: "center", padding: "40px 0" }}>
              <div style={{ width: 64, height: 64, borderRadius: "50%", background: "rgba(34,197,94,.12)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--g3)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 6L9 17l-5-5" />
                </svg>
              </div>
              <h3 style={{ fontFamily: "var(--fd)", fontSize: 24, fontWeight: 700, color: "var(--t1)", marginBottom: 12 }}>
                Subscription Active!
              </h3>
              <p style={{ color: "var(--t2)", fontSize: 15, lineHeight: 1.7, maxWidth: 400, margin: "0 auto" }}>
                Your <strong style={{ color: "var(--gold2)" }}>{planLabels[selectedPlan]}</strong> plan is now active.
                Start chatting on WhatsApp or Telegram to use your new benefits.
              </p>
              <div style={{ marginTop: 28, display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
                <a href={WA_LINK} className="btn btn-wa" target="_blank" rel="noopener" style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                  Open WhatsApp
                </a>
                <a href="/" className="btn btn-o">Back to Home</a>
              </div>
            </div>
          )}
        </div>
      </section>

      <SimpleFooter />
    </>
  );
}
