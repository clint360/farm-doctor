"use client";
import Link from "next/link";
import Image from "next/image";
import { useI18n } from "@/lib/i18n";
import { WhatsAppIcon, TelegramIcon, FacebookIcon } from "./icons";
import { WA_LINK, TG_LINK, FACEBOOK_URL, WHATSAPP_DISPLAY, CALL_NUMBER, CALL_DISPLAY, COMPANY_PHONE, COMPANY_DISPLAY, TELEGRAM_BOT } from "@/lib/contacts";

export function Footer() {
  const { t } = useI18n();
  return (
    <footer className="ft">
      <div className="c">
        <div className="ft-top">
          <div className="ft-brand">
            <Image src="/fdlogo.png" alt="Farm Doctor" className="ft-logo" width={100} height={100} />
            <p className="ft-desc">{t("ft.desc")}</p>
          </div>
          <div className="ft-col">
            <h4>{t("ft.contact")}</h4>
            <a href={WA_LINK} target="_blank" rel="noopener">WhatsApp: {WHATSAPP_DISPLAY}</a>
            <a href={TG_LINK} target="_blank" rel="noopener">Telegram: @{TELEGRAM_BOT}</a>
            <a href={`tel:+${CALL_NUMBER}`} className="ft-phone">Calls: {CALL_DISPLAY}</a>
            <a href={`tel:+${COMPANY_PHONE}`} className="ft-phone">Company: {COMPANY_DISPLAY}</a>
          </div>
          <div className="ft-col">
            <h4>{t("ft.links")}</h4>
            <a href="#how">{t("nav.how")}</a>
            <a href="#features">{t("nav.features")}</a>
            <a href="#pricing">{t("nav.pricing")}</a>
            <a href="#faq">{t("nav.faq")}</a>
            <Link href="/expert-apply">Become an Expert</Link>
            <Link href="/call">AI Voice Call</Link>
          </div>
        </div>
        <div className="ft-bar">
          <span className="ft-copy">&copy; 2026 Farm Doctor. {t("ft.rights")}</span>
          <div className="ft-socials">
            <a href={FACEBOOK_URL} target="_blank" rel="noopener" aria-label="Facebook"><FacebookIcon /></a>
            <a href={WA_LINK} target="_blank" rel="noopener" aria-label="WhatsApp"><WhatsAppIcon /></a>
            <a href={TG_LINK} target="_blank" rel="noopener" aria-label="Telegram"><TelegramIcon /></a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export function SimpleFooter() {
  return (
    <footer className="ft ft-simple">
      <div className="c">
        <div className="ft-bar">
          <span className="ft-copy">&copy; 2026 Farm Doctor. All rights reserved.</span>
          <Link href="/" style={{ fontSize: 13, color: "var(--g3)" }}>Back to Home</Link>
        </div>
      </div>
    </footer>
  );
}
