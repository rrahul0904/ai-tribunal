import Link from "next/link";
import { notFound } from "next/navigation";
import { getCase } from "@/lib/demo-data";
import HearingClient from "./hearing-client";

export default async function CasePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const caseFile = getCase(slug);
  if (!caseFile) notFound();

  return (
    <main className="shell narrow">
      <Link href="/" className="back">← Docket</Link>
      <section className="caseHeader">
        <div className="tag">{caseFile.kind}</div>
        <h1>{caseFile.title}</h1>
        <p className="lede">{caseFile.summary}</p>
        <div className="disclosure"><strong>Disclosure:</strong> {caseFile.disclosure}</div>
      </section>

      <section className="dossier">
        <div>
          <div className="eyebrow">ESTABLISHED RECORD</div>
          <ul>{caseFile.facts.map((fact) => <li key={fact}>{fact}</li>)}</ul>
        </div>
        <div>
          <div className="eyebrow">DISPUTED / UNRESOLVED</div>
          <ul>{caseFile.disputedFacts.map((fact) => <li key={fact}>{fact}</li>)}</ul>
        </div>
      </section>

      <HearingClient caseSlug={caseFile.slug} />
    </main>
  );
}
