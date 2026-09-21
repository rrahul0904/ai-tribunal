import Link from "next/link";
import { tribunalCases } from "@/lib/demo-data";

export default function Home() {
  return (
    <main className="shell">
      <header className="hero">
        <div className="eyebrow">AI TRIBUNAL / CLEAN-ROOM MVP</div>
        <h1>Investigate the case.<br />Question the system.<br />Make the call.</h1>
        <p className="lede">An evidence-first interactive ethics lab inspired by the mechanics of AIJail, rebuilt with explicit provenance, neutral framing, and auditable decision logic.</p>
        <div className="pillRow">
          <span>6-response hearing limit</span><span>Immutable credit ledger</span><span>Fiction labels in-product</span><span>Admin-ready model</span>
        </div>
      </header>

      <section className="section">
        <div className="sectionHeading">
          <div><div className="eyebrow">DOCKET</div><h2>Open cases</h2></div>
          <Link href="/admin" className="ghostButton">Admin preview</Link>
        </div>
        <div className="grid">
          {tribunalCases.map((item) => (
            <Link key={item.slug} href={`/cases/${item.slug}`} className="card">
              <div className="tag">{item.kind}</div>
              <h3>{item.title}</h3>
              <p>{item.summary}</p>
              <div className="cardFooter">Review dossier →</div>
            </Link>
          ))}
        </div>
      </section>

      <section className="section split">
        <div>
          <div className="eyebrow">WHY THIS VERSION</div>
          <h2>Pressure without deception.</h2>
        </div>
        <div className="prose">
          <p>Every fictional hearing states that the character is fictional and that no sentient entity is at risk. Documented incidents must carry sources and claim status.</p>
          <p>The hearing model limits AI output server-side and never lets the browser decide whether another model call is allowed.</p>
        </div>
      </section>
    </main>
  );
}
