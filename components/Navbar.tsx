"use client";
import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useI18n, Lang } from "@/lib/i18n";
import { WA_LINK } from "@/lib/contacts";

const LANGS: { code: Lang; label: string }[] = [
  { code: "en", label: "English" },
  { code: "fr", label: "Français" },
  { code: "pid", label: "Pidgin" },
];

export function Navbar() {
  const { t, lang, setLang } = useI18n();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const langRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Lock body scroll when mobile menu is open (iOS-safe)
  const scrollYRef = useRef(0);
  useEffect(() => {
    if (menuOpen) {
      scrollYRef.current = window.scrollY;
      document.documentElement.classList.add("menu-open");
      document.body.style.top = `-${scrollYRef.current}px`;
    } else {
      document.documentElement.classList.remove("menu-open");
      document.body.style.top = "";
      window.scrollTo(0, scrollYRef.current);
    }
    return () => {
      document.documentElement.classList.remove("menu-open");
      document.body.style.top = "";
    };
  }, [menuOpen]);

  // Close lang dropdown on outside click
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(e.target as Node)) setLangOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    setMenuOpen(false);
    setLangOpen(false);

    if (href.startsWith("#")) {
      // Delay scroll until after scroll-lock is released and layout restores
      setTimeout(() => {
        const el = document.querySelector(href);
        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 50);
    }
  };

  const selectLang = (code: Lang) => {
    setLang(code);
    setLangOpen(false);
  };

  return (
    <nav className={`nav${scrolled ? " sk" : ""}`}>
      <div className="c">
        <Image src="/fdlogo.png" alt="Farm Doctor" className="nav-logo" width={60} height={60} style={{ width: 'auto' }} priority />
        <ul className={`nl${menuOpen ? " open" : ""}`} id="nl">
          <li><a href="#how" onClick={(e) => handleNavClick(e, "#how")}>{t("nav.how")}</a></li>
          <li><a href="#features" onClick={(e) => handleNavClick(e, "#features")}>{t("nav.features")}</a></li>
          <li><a href="#channels" onClick={(e) => handleNavClick(e, "#channels")}>{t("nav.channels")}</a></li>
          <li><a href="#pricing" onClick={(e) => handleNavClick(e, "#pricing")}>{t("nav.pricing")}</a></li>
          <li><Link href="/insights" style={{ color: "var(--gold)" }}>Insights</Link></li>
          <li>
            <Link href="/city-chemist" style={{ display: "inline-flex", alignItems: "center", gap: "0.3rem" }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
              </svg>
              City Chemist
            </Link>
          </li>
          <li>
            <div className="lang-drop" ref={langRef}>
              <button className="ls" onClick={() => setLangOpen(!langOpen)}>
                {lang.toUpperCase()} <span className={`ls-arrow${langOpen ? " open" : ""}`}>▾</span>
              </button>
              {langOpen && (
                <ul className="lang-menu">
                  {LANGS.map((l) => (
                    <li key={l.code}>
                      <button
                        className={`lang-opt${l.code === lang ? " active" : ""}`}
                        onClick={() => selectLang(l.code)}
                      >
                        {l.label}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </li>
          <li>
            <a href={WA_LINK} className="nav-cta" target="_blank" rel="noopener">
              {t("nav.cta")}
            </a>
          </li>
        </ul>
        <button className={`hb${menuOpen ? " open" : ""}`} aria-label="Menu" onClick={() => setMenuOpen(!menuOpen)}>
          <span /><span /><span />
        </button>
      </div>
    </nav>
  );
}

export function SubNavbar() {
  return (
    <nav className="nav sk">
      <div className="c">
        <Link href="/"><Image src="/fdlogo.png" alt="Farm Doctor" className="nav-logo" width={60} height={60} style={{ width: 'auto' }} /></Link>
        <Link href="/" className="nav-back">&larr; Back to Home</Link>
      </div>
    </nav>
  );
}
