"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useI18n } from "@/lib/i18n";

export function Navbar() {
  const { t, lang, toggleLang } = useI18n();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href.startsWith("#")) {
      e.preventDefault();
      const el = document.querySelector(href);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    setMenuOpen(false);
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
          <li><a href="#faq" onClick={(e) => handleNavClick(e, "#faq")}>{t("nav.faq")}</a></li>
          <li><button className="ls" onClick={toggleLang}>{lang === "en" ? "FR" : "EN"}</button></li>
          <li>
            <a href="https://wa.me/237693477577" className="nav-cta" target="_blank" rel="noopener">
              {t("nav.cta")}
            </a>
          </li>
        </ul>
        <button className="hb" aria-label="Menu" onClick={() => setMenuOpen(!menuOpen)}>
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
