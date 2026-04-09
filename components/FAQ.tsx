"use client";
import { useState } from "react";
import { useI18n } from "@/lib/i18n";

const questions = [
  { q: "q.1q", a: "q.1a" },
  { q: "q.2q", a: "q.2a" },
  { q: "q.3q", a: "q.3a" },
  { q: "q.4q", a: "q.4a" },
  { q: "q.5q", a: "q.5a" },
];

export function FAQ() {
  const { t } = useI18n();
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  return (
    <section className="faq" id="faq">
      <div className="c">
        <div className="faq-h rv">
          <div className="tag">{t("q.tag")}</div>
          <h2 className="stl">{t("q.title")}</h2>
          <p className="sts">{t("q.sub")}</p>
        </div>
        <div className="fl">
          {questions.map((item, i) => (
            <div key={i} className={`fi rv${openIdx === i ? " open" : ""}`}>
              <button
                className="fq"
                onClick={() => setOpenIdx(openIdx === i ? null : i)}
              >
                <span>{t(item.q)}</span>
                <span className="fic">+</span>
              </button>
              <div className="fa">
                <p>{t(item.a)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
