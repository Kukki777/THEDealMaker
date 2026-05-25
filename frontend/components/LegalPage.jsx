import Link from "next/link";

export default function LegalPage({ eyebrow, title, intro, sections }) {
  return (
    <main className="interior-shell legal-shell">
      <section className="legal-hero">
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        <p>{intro}</p>
        <p className="legal-updated">Last updated: 26 May 2026</p>
      </section>
      <article className="legal-document">
        {sections.map((section) => (
          <section className="legal-section" key={section.heading}>
            <h2>{section.heading}</h2>
            {section.paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </section>
        ))}
      </article>
      <aside className="legal-help">
        <div>
          <p className="eyebrow">Need clarification?</p>
          <h2>Speak with our concierge team.</h2>
        </div>
        <Link className="gold-button link-button" href="/contact">Contact us</Link>
      </aside>
    </main>
  );
}
