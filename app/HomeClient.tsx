"use client";
import Image from "next/image";
import { useI18n } from "@/lib/i18n";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { FAQ } from "@/components/FAQ";
import { ScrollReveal } from "@/components/ScrollReveal";
import { WhatsAppIcon, TelegramIcon, PhoneIcon } from "@/components/icons";
import { WA_LINK, TG_LINK, WHATSAPP_DISPLAY, CALL_DISPLAY, TELEGRAM_BOT } from "@/lib/contacts";

export function HomeClient() {
  const { t } = useI18n();

  return (
    <>
      <ScrollReveal />
      <Navbar />

      {/* HERO */}
      <header className="hero">
        <div className="hero-bg">
          <div className="hero-noise" />
          <div className="hero-orb hero-orb-1" />
          <div className="hero-orb hero-orb-2" />
        </div>
        <div className="c">
          <div className="hero-content">
            <div className="hero-pill">
              <span className="dot" />
              <span>{t("hero.badge")}</span>
            </div>
            <h1>
              {t("hero.t1")} <em>{t("hero.t2")}</em>
            </h1>
            <p className="hero-p">{t("hero.sub")}</p>
            <div className="hero-btns">
              <a href={WA_LINK} className="btn btn-wa" target="_blank" rel="noopener">
                <WhatsAppSvgInline />
                <span>{t("hero.btn1")}</span>
              </a>
              <a href="/expert-apply" className="btn btn-o">{t("hero.btn2")}</a>
            </div>
            <div className="hero-ch">
              <span className="hero-ch-label">{t("hero.avail")}</span>
              <div className="ch-pills">
                <a href={WA_LINK} className="ch-pill" target="_blank">
                  <svg viewBox="0 0 24 24" fill="#25d366"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                  WhatsApp
                </a>
                <a href={TG_LINK} className="ch-pill" target="_blank">
                  <svg viewBox="0 0 24 24" fill="#2aabee"><path d="M11.944 0A12 12 0 000 12a12 12 0 0012 12 12 12 0 0012-12A12 12 0 0012 0 12 12 0 0011.944 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 01.171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.479.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>
                  Telegram
                </a>
                <a href="/call" className="ch-pill">
                  <svg viewBox="0 0 24 24" fill="var(--gold)"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>
                  <span>{t("hero.calls")}</span>
                </a>
              </div>
            </div>
          </div>
          <div className="hero-vis">
            <Image src="/fdlogo.png" alt="Farm Doctor AI" className="hero-img" width={380} height={380} priority />
            <div className="hero-card hc1">
              <div className="hcn">2K+</div>
              <div className="hcl">
                {/* Controlled content from i18n translations - safe for dangerouslySetInnerHTML */}
                <div dangerouslySetInnerHTML={{ __html: t("hero.s1") }} />
              </div>
            </div>
            <div className="hero-card hc2">
              <div className="hcn">95%</div>
              <div className="hcl">
                {/* Controlled content from i18n translations - safe for dangerouslySetInnerHTML */}
                <div dangerouslySetInnerHTML={{ __html: t("hero.s2") }} />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* MARQUEE */}
      <div className="mq" aria-hidden="true">
        <div className="mq-t">
          {["Cassava","Maize","Cocoa","Plantain","Tomato","Pepper","Groundnut","Rice","Palm Oil","Beans","Yam","Coffee",
            "Cassava","Maize","Cocoa","Plantain","Tomato","Pepper","Groundnut","Rice","Palm Oil","Beans","Yam","Coffee"].map((c, i) => (
            <span key={i}>{c}</span>
          ))}
        </div>
      </div>

      {/* PROOF */}
      <section className="proof rv">
        <div className="c">
          <div className="proof-i"><strong>3</strong><span>{t("proof.lang")}</span></div>
          <div className="proof-d" />
          <div className="proof-i"><strong>24/7</strong><span>{t("proof.avail")}</span></div>
          <div className="proof-d" />
          <div className="proof-i"><strong>&lt;30s</strong><span>{t("proof.speed")}</span></div>
          <div className="proof-d" />
          <div className="proof-i"><strong>50+</strong><span>{t("proof.crops")}</span></div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="how" id="how">
        <div className="c">
          <div className="how-h rv">
            <div className="tag">{t("how.tag")}</div>
            <h2 className="stl">{t("how.title")}</h2>
            <p className="sts">{t("how.sub")}</p>
          </div>
          <div className="steps sg">
            <div className="stp rv">
              <div className="stp-n">
                <svg viewBox="0 0 48 48" fill="none" stroke="var(--g3)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="12" y="6" width="24" height="36" rx="4" />
                  <circle cx="24" cy="38" r="1.5" />
                  <rect x="16" y="14" width="16" height="12" rx="2" />
                </svg>
              </div>
              <h3>{t("how.s1t")}</h3>
              <p>{t("how.s1d")}</p>
            </div>
            <div className="stp rv">
              <div className="stp-n">
                <svg viewBox="0 0 48 48" fill="none" stroke="var(--gold)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="24" cy="24" r="16" />
                  <path d="M24 14v10l7 5" />
                </svg>
              </div>
              <h3>{t("how.s2t")}</h3>
              <p>{t("how.s2d")}</p>
            </div>
            <div className="stp rv">
              <div className="stp-n">
                <svg viewBox="0 0 48 48" fill="none" stroke="var(--g3)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M8 28c0-8.837 7.163-16 16-16s16 7.163 16 16" />
                  <path d="M14 32l5-8 4 6 6-10 7 12" />
                </svg>
              </div>
              <h3>{t("how.s3t")}</h3>
              <p>{t("how.s3d")}</p>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="feat" id="features">
        <div className="c">
          <div className="feat-h rv">
            <div className="tag">{t("f.tag")}</div>
            <h2 className="stl">{t("f.title")}</h2>
            <p className="sts">{t("f.sub")}</p>
          </div>
          <div className="fg sg">
            <div className="fc rv">
              <div className="fc-i"><svg viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg></div>
              <h3>{t("f.1t")}</h3><p>{t("f.1d")}</p>
            </div>
            <div className="fc rv">
              <div className="fc-i"><svg viewBox="0 0 24 24"><path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z"/><path d="M19 10v2a7 7 0 01-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg></div>
              <h3>{t("f.2t")}</h3><p>{t("f.2d")}</p>
            </div>
            <div className="fc rv">
              <div className="fc-i"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></svg></div>
              <h3>{t("f.3t")}</h3><p>{t("f.3d")}</p>
            </div>
            <div className="fc rv">
              <div className="fc-i"><svg viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg></div>
              <h3>{t("f.4t")}</h3><p>{t("f.4d")}</p>
            </div>
            <div className="fc rv">
              <div className="fc-i"><svg viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg></div>
              <h3>{t("f.5t")}</h3><p>{t("f.5d")}</p>
            </div>
            <div className="fc rv">
              <div className="fc-i"><svg viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg></div>
              <h3>{t("f.6t")}</h3><p>{t("f.6d")}</p>
            </div>
          </div>
        </div>
      </section>

      {/* INSIGHTS PROMO */}
      <section className="insp" id="insights">
        <div className="c">
          <div className="insp-h rv">
            <div className="tag">{t("ins.lp.tag")}</div>
            <h2 className="stl">{t("ins.lp.title")}</h2>
            <p className="sts">{t("ins.lp.sub")}</p>
          </div>
          <div className="insp-g sg">
            <div className="insp-fc rv">
              <div className="insp-fc-i insp-fc-i-g">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M2 22v-5l5-5 5 5-5 5z"/><path d="M9.5 14.5 16 8"/><path d="m17 2 5 5-.5.5a3.53 3.53 0 0 1-5 0s0 0 0 0a3.53 3.53 0 0 1 0-5L17 2"/></svg>
              </div>
              <h3>{t("ins.lp.c1")}</h3>
            </div>
            <div className="insp-fc rv">
              <div className="insp-fc-i insp-fc-i-r">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
              </div>
              <h3>{t("ins.lp.c2")}</h3>
            </div>
            <div className="insp-fc rv">
              <div className="insp-fc-i insp-fc-i-b">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/></svg>
              </div>
              <h3>{t("ins.lp.c3")}</h3>
            </div>
            <div className="insp-fc rv">
              <div className="insp-fc-i insp-fc-i-o">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
              </div>
              <h3>{t("ins.lp.c4")}</h3>
            </div>
          </div>
          <div className="insp-cta rv">
            <a href="/insights" className="btn btn-g">{t("ins.lp.btn")}</a>
          </div>
        </div>
      </section>

      {/* CHANNELS */}
      <section className="chan" id="channels">
        <div className="c">
          <div className="chan-h rv">
            <div className="tag">{t("ch.tag")}</div>
            <h2 className="stl">{t("ch.title")}</h2>
            <p className="sts">{t("ch.sub")}</p>
          </div>
          <div className="cg sg">
            <div className="cc rv">
              <div className="cc-ic wa"><WhatsAppIcon /></div>
              <h3>WhatsApp</h3>
              <div className="cc-num">{WHATSAPP_DISPLAY}</div>
              <p>{t("ch.wa.d")}</p>
              <a href={WA_LINK} className="cc-link" target="_blank">{t("ch.wa.l")}</a>
            </div>
            <div className="cc rv">
              <div className="cc-ic tg"><TelegramIcon /></div>
              <h3>Telegram</h3>
              <div className="cc-num">@{TELEGRAM_BOT}</div>
              <p>{t("ch.tg.d")}</p>
              <a href={TG_LINK} className="cc-link" target="_blank">{t("ch.tg.l")}</a>
            </div>
            <div className="cc rv">
              <div className="cc-ic cl"><PhoneIcon /></div>
              <h3>{t("ch.cl.t")}</h3>
              <div className="cc-num">{CALL_DISPLAY}</div>
              <p>{t("ch.cl.d")}</p>
              <a href="/call" className="cc-link">{t("ch.cl.l")}</a>
            </div>
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section className="pri" id="pricing">
        <div className="c">
          <div className="pri-h rv">
            <div className="tag">{t("p.tag")}</div>
            <h2 className="stl">{t("p.title")}</h2>
            <p className="sts">{t("p.sub")}</p>
          </div>
          <div className="pg sg">
            <div className="pc rv">
              <h3>{t("p.1n")}</h3>
              <div className="pr">1,000 <span>XAF</span></div>
              <div className="pp">{t("p.per")}</div>
              <ul className="pf">
                <li>{t("p.1a")}</li>
                <li>{t("p.1b")}</li>
                <li>{t("p.1c")}</li>
                <li>{t("p.1d")}</li>
              </ul>
              <a href="/subscribe" className="btn btn-p btn-g">{t("p.btn")}</a>
            </div>
            <div className="pc pop rv">
              <div className="pc-badge">{t("p.pop")}</div>
              <h3>{t("p.2n")}</h3>
              <div className="pr">5,000 <span>XAF</span></div>
              <div className="pp">{t("p.per")}</div>
              <ul className="pf">
                <li>{t("p.2a")}</li>
                <li>{t("p.2b")}</li>
                <li>{t("p.2c")}</li>
                <li>{t("p.2d")}</li>
                <li>{t("p.2e")}</li>
              </ul>
              <a href="/subscribe" className="btn btn-p btn-gd">{t("p.btn")}</a>
            </div>
            <div className="pc rv">
              <h3>{t("p.3n")}</h3>
              <div className="pr">15,000 <span>XAF</span></div>
              <div className="pp">{t("p.per")}</div>
              <ul className="pf">
                <li>{t("p.3a")}</li>
                <li>{t("p.3b")}</li>
                <li>{t("p.3d")}</li>
                <li>{t("p.3e")}</li>
              </ul>
              <a href="/subscribe" className="btn btn-p btn-g">{t("p.btn")}</a>
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="tst">
        <div className="c">
          <div className="tst-h rv">
            <div className="tag">{t("t.tag")}</div>
            <h2 className="stl">{t("t.title")}</h2>
            <p className="sts">{t("t.sub")}</p>
          </div>
          <div className="tg2 sg">
            <div className="tc rv">
              <div className="tc-s">&#9733;&#9733;&#9733;&#9733;&#9733;</div>
              <p className="tc-t">{t("t.1t")}</p>
              <div className="tc-a">
                <div className="tc-av">MA</div>
                <div className="tc-ai"><h4>Mama Ad&egrave;le</h4><span>{t("t.1l")}</span></div>
              </div>
            </div>
            <div className="tc rv">
              <div className="tc-s">&#9733;&#9733;&#9733;&#9733;&#9733;</div>
              <p className="tc-t">{t("t.2t")}</p>
              <div className="tc-a">
                <div className="tc-av">PT</div>
                <div className="tc-ai"><h4>Pa Thomas</h4><span>{t("t.2l")}</span></div>
              </div>
            </div>
            <div className="tc rv">
              <div className="tc-s">&#9733;&#9733;&#9733;&#9733;&#9733;</div>
              <p className="tc-t">{t("t.3t")}</p>
              <div className="tc-a">
                <div className="tc-av">JN</div>
                <div className="tc-ai"><h4>Jean-No&euml;l</h4><span>{t("t.3l")}</span></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <FAQ />

      {/* CTA */}
      <section className="cta" id="cta">
        <div className="c">
          <div className="cta-c rv">
            <div className="tag">{t("cta.tag")}</div>
            <h2 className="stl" dangerouslySetInnerHTML={{ __html: t("cta.title") }} />
            <p className="sts">{t("cta.sub")}</p>
            <div className="cta-btns">
              <a href={WA_LINK} className="btn btn-wa" target="_blank">
                <WhatsAppSvgInline />
                <span>{t("cta.btn1")}</span>
              </a>
              <a href={TG_LINK} className="btn btn-o" target="_blank">{t("cta.btn2")}</a>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}

function WhatsAppSvgInline() {
  return (
    <svg viewBox="0 0 24 24" style={{ width: 20, height: 20, fill: "#fff" }}>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}
