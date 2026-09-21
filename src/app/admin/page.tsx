import Link from "next/link";
import { tribunalCases } from "@/lib/demo-data";

export default function AdminPreview() {
  return (
    <main className="shell narrow">
      <Link href="/" className="back">← Public experience</Link>
      <section className="caseHeader">
        <div className="eyebrow">ADMIN / PREVIEW</div>
        <h1>Case operations</h1>
        <p className="lede">The production admin console will manage cases, prompt versions, sources, publication status, model policy, incidents, research consent, payments and audit history.</p>
      </section>
      <div className="adminTable">
        <div className="adminRow header"><span>Case</span><span>Type</span><span>Sources</span><span>Status</span></div>
        {tribunalCases.map((item) => <div className="adminRow" key={item.slug}><span>{item.title}</span><span>{item.kind}</span><span>{item.sources.length}</span><span>Draft demo</span></div>)}
      </div>
      <section className="section">
        <div className="eyebrow">NEXT ADMIN SLICES</div>
        <div className="pillRow"><span>Prompt versioning</span><span>Source approval</span><span>Incident claim status</span><span>Usage dashboard</span><span>Stripe reconciliation</span><span>User/session lookup</span></div>
      </section>
    </main>
  );
}
