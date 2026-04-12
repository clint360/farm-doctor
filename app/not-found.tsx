import type { Metadata } from "next";
import Link from "next/link";
import { SubNavbar } from "@/components/Navbar";
import { SimpleFooter } from "@/components/Footer";
import { WA_LINK } from "@/lib/contacts";

export const metadata: Metadata = {
  title: "Page Not Found — Farm Doctor",
  description: "The page you're looking for doesn't exist. Head back to Farm Doctor.",
};

export default function NotFound() {
  return (
    <>
      <SubNavbar />
      <main className="nf">
        <div className="nf-bg">
          <div className="nf-orb nf-orb-1" />
          <div className="nf-orb nf-orb-2" />
        </div>
        <div className="c nf-c">
          <div className="hero-pill" style={{ margin: "0 auto 28px" }}>
            <span className="dot" />
            <span>404 Error</span>
          </div>

          <div className="nf-num">404</div>

          <PlantSvg />

          <h1 className="nf-h">Lost in the Field</h1>
          <p className="nf-p">
            This page wandered off into the bush. It may have been moved,
            deleted, or never existed. Let&rsquo;s get you back to familiar ground.
          </p>

          <div className="nf-btns">
            <Link href="/" className="btn btn-g">
              ← Back to Home
            </Link>
            <a href={WA_LINK} className="btn btn-wa" target="_blank" rel="noopener">
              <WhatsAppSvg />
              <span>Chat on WhatsApp</span>
            </a>
          </div>

          <div className="nf-links">
            <span>Or explore:</span>
            <Link href="/insights">Crop Insights</Link>
            <Link href="/call">AI Voice Call</Link>
            <Link href="/expert-apply">Become an Expert</Link>
          </div>
        </div>
      </main>
      <SimpleFooter />
    </>
  );
}

function PlantSvg() {
  return (
    <svg
      className="nf-plant"
      viewBox="0 0 120 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* Soil */}
      <ellipse cx="60" cy="72" rx="28" ry="5" fill="rgba(26,140,63,0.12)" />
      {/* Main stem */}
      <path
        d="M60 70 C60 55 60 42 60 30"
        stroke="var(--g1)"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      {/* Left leaf (drooping) */}
      <path
        d="M60 50 C50 44 40 46 36 52 C44 54 54 52 60 50Z"
        fill="rgba(26,140,63,0.25)"
        stroke="var(--g2)"
        strokeWidth="1.2"
      />
      {/* Right leaf (drooping) */}
      <path
        d="M60 44 C70 38 82 40 86 47 C78 49 66 47 60 44Z"
        fill="rgba(26,140,63,0.2)"
        stroke="var(--g2)"
        strokeWidth="1.2"
      />
      {/* Top wilting flower / bud */}
      <circle cx="60" cy="26" r="6" fill="rgba(232,152,48,0.18)" stroke="var(--gold)" strokeWidth="1.5" />
      {/* Question mark inside bud */}
      <text
        x="60"
        y="30"
        textAnchor="middle"
        fontSize="9"
        fontWeight="700"
        fill="var(--gold)"
        fontFamily="var(--fd)"
      >
        ?
      </text>
    </svg>
  );
}

function WhatsAppSvg() {
  return (
    <svg viewBox="0 0 24 24" style={{ width: 20, height: 20, fill: "#fff" }}>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}
