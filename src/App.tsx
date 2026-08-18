import { useEffect, useState, type CSSProperties } from "react";

const STORAGE_KEY = "aera:journey-started-at";
const TRACKING_NUMBER = "HZNEEE-2408-01";

const baseSteps = [
  { label: "Confirmée", note: "Commande bien enregistrée", art: "confirm" },
  { label: "Emballée", note: "Votre colis est prêt", art: "packing" },
  { label: "Expédiée", note: "Votre colis est sur la route", art: "shipping" },
  { label: "En transit", note: "Acheminement vers votre zone", art: "transit" },
  { label: "Livrée", note: "Remise à votre porte", art: "delivery" },
];

const stageThresholds = [0, 0, 2 * 60 * 60 * 1000, 24 * 60 * 60 * 1000, 5 * 24 * 60 * 60 * 1000];

function StepAnimation({ type }: { type: string }) {
  if (type === "confirm") return <div className="anim-scene confirm-scene" aria-hidden="true"><span className="paper"><i /><b>✓</b></span><span className="confirm-ring" /></div>;
  if (type === "packing") return <div className="anim-scene packing-scene" aria-hidden="true"><span className="mini-box"><i className="flap flap-left" /><i className="flap flap-right" /><b className="tape" /></span><span className="packing-star">✦</span></div>;
  if (type === "shipping") return <div className="anim-scene shipping-scene" aria-hidden="true"><span className="road"><i /><i /><i /></span><span className="truck"><b /><i /><em /><em /></span></div>;
  if (type === "transit") return <div className="anim-scene transit-scene" aria-hidden="true"><span className="route"><i className="route-line" /><i className="route-start" /><i className="route-end" /><b className="route-dot" /></span></div>;
  return <div className="anim-scene delivery-scene" aria-hidden="true"><span className="door"><i /><b /></span><span className="delivery-box" /><span className="knock">)))</span></div>;
}

function getStage(elapsed: number) {
  if (elapsed >= stageThresholds[4]) return 4;
  if (elapsed >= stageThresholds[3]) return 3;
  if (elapsed >= stageThresholds[2]) return 2;
  return 1;
}

function formatRemaining(milliseconds: number) {
  const totalMinutes = Math.max(1, Math.ceil(milliseconds / 60000));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  const days = Math.floor(hours / 24);
  const remainingHours = hours % 24;
  if (days) return remainingHours ? `${days} j ${remainingHours} h` : `${days} j`;
  if (!hours) return `${minutes} min`;
  if (!minutes) return `${hours} h`;
  return `${hours} h ${minutes} min`;
}

export default function Home() {
  const [now, setNow] = useState(Date.now());
  const [startedAt, setStartedAt] = useState(0);
  const [returning, setReturning] = useState(false);
  const [showTracking, setShowTracking] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const saved = Number(window.localStorage.getItem(STORAGE_KEY));
    if (Number.isFinite(saved) && saved > 0 && saved <= Date.now()) {
      setStartedAt(saved);
      setReturning(true);
    } else {
      const firstVisit = Date.now();
      window.localStorage.setItem(STORAGE_KEY, String(firstVisit));
      setStartedAt(firstVisit);
    }
    const timer = window.setInterval(() => setNow(Date.now()), 60000);
    return () => window.clearInterval(timer);
  }, []);

  function openTracking() {
    setShowTracking(true);
    window.setTimeout(() => document.getElementById("result")?.scrollIntoView({ behavior: "smooth", block: "start" }), 80);
  }

  function resetJourney() {
    const restart = Date.now();
    window.localStorage.setItem(STORAGE_KEY, String(restart));
    setStartedAt(restart);
    setNow(restart);
    setReturning(false);
  }

  async function copyTrackingNumber() {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(TRACKING_NUMBER);
    } else {
      const field = document.createElement("textarea");
      field.value = TRACKING_NUMBER;
      field.style.position = "fixed";
      field.style.opacity = "0";
      document.body.appendChild(field);
      field.select();
      document.execCommand("copy");
      field.remove();
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  const elapsed = startedAt ? Math.max(0, now - startedAt) : 0;
  const activeIndex = getStage(elapsed);
  const steps = baseSteps.map((step, index) => ({ ...step, state: index < activeIndex ? "done" : index === activeIndex ? "current" : "next" }));
  const dateFormatter = new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "long" });
  const journeyStart = startedAt || now;
  const arrival = `entre le ${dateFormatter.format(new Date(journeyStart + 3 * 24 * 60 * 60 * 1000))} et le ${dateFormatter.format(new Date(journeyStart + 5 * 24 * 60 * 60 * 1000))}`;
  const nextThreshold = activeIndex < 4 ? stageThresholds[activeIndex + 1] : null;
  const remaining = nextThreshold === null ? "" : formatRemaining(nextThreshold - elapsed);
  const statusCopy = [
    null,
    { title: "Votre colis prend son élan.", body: "Emballé avec soin, il quittera notre atelier dans environ", emphasis: remaining, next: `Expédition dans ${remaining}` },
    { title: "Votre colis est sur la route.", body: "L’expédition a commencé. Prochaine étape :", emphasis: "le transit local", next: `Transit dans ${remaining}` },
    { title: "Votre colis se rapproche.", body: "Il est en transit vers", emphasis: "votre zone de livraison", next: `Livraison estimée dans ${remaining}` },
    { title: "Votre colis est arrivé.", body: "Le trajet est terminé :", emphasis: "livraison effectuée", next: "Colis livré" },
  ][activeIndex]!;

  return (
    <main>
      <div className="ambient ambient-one" /><div className="ambient ambient-two" />
      <nav className="nav wrap">
        <a className="brand" href="#top" aria-label="AERA, accueil"><span className="brand-mark"><i /><i /><i /></span><span>AERA</span></a>
        <button className={`tracking-chip ${copied ? "copied" : ""}`} type="button" onClick={copyTrackingNumber} aria-label="Copier le numéro de suivi"><span>NUMÉRO DE SUIVI</span><strong>{TRACKING_NUMBER}</strong><i>{copied ? "✓ Copié" : "Copier"}</i></button>
        <a className="help" href="mailto:support@example.com">Besoin d’aide <span>↗</span></a>
      </nav>

      <section className="hero wrap" id="top">
        <div className="eyebrow"><span className="pulse" /> {returning ? "Votre trajet continue" : "Votre colis avance"}</div>
        <h1>{returning ? <>Bon retour.<br /><em>Votre colis avance.</em></> : <>Suivez l’essentiel.<br /><em>Ressentez l’arrivée.</em></>}</h1>
        <p className="intro">Une expérience simple et vivante — de notre atelier jusqu’à votre porte.</p>

        <div className="journey-entry">
          <div className="entry-status"><span className="entry-dot" /><div><small>STATUT ACTUEL</small><strong>{baseSteps[activeIndex].label}</strong></div></div>
          <button type="button" onClick={openTracking}>{returning ? "Reprendre mon suivi" : "Voir l’avancée de mon colis"}<span>→</span></button>
          <p>{returning ? "Votre progression a été conservée sur cet appareil." : "Votre parcours démarre automatiquement sur cet appareil."}</p>
        </div>

        <div className="journey-art" aria-hidden="true"><div className="orbit orbit-a" /><div className="orbit orbit-b" /><div className="parcel"><div className="parcel-top"><span /></div><div className="parcel-front"><b>AERA</b><small>WITH CARE</small></div><div className="parcel-side" /></div><div className="spark s1">✦</div><div className="spark s2">✦</div><div className="spark s3">·</div></div>
      </section>

      {showTracking && <section className="result wrap" id="result" aria-live="polite">
        <div className="result-head"><div><span className="mini-label">SUIVI · {TRACKING_NUMBER}</span><h2>{statusCopy.title}</h2><p>{statusCopy.body} <strong>{statusCopy.emphasis}</strong>.</p></div><div className="eta"><span>Livraison estimée</span><strong>{arrival}</strong></div></div>
        <div className="timeline"><div className="progress-line"><span style={{ width: `${activeIndex * 25}%` }} /></div>{steps.map((step,index)=><article className={`step ${step.state}`} key={step.label} style={{"--delay":`${index * .24}s`} as CSSProperties}><div className="dot">{step.state === "done" ? "✓" : index + 1}</div><StepAnimation type={step.art}/><span className="step-kicker">ÉTAPE 0{index + 1}</span><h3>{step.label}</h3><p>{step.note}</p>{step.state === "current" && <span className="current-label"><i /> Maintenant</span>}</article>)}</div>
        <div className="status-card"><div className="status-icon"><span>↗</span></div><div><span className="mini-label">{activeIndex === 4 ? "STATUT FINAL" : "PROCHAINE ÉTAPE"}</span><h3>{statusCopy.next}</h3><p>{activeIndex === 4 ? "Merci de nous avoir fait confiance." : "Revenez sur cette page pour suivre la suite du trajet."}</p></div><span className="live-badge"><i /> {activeIndex === 4 ? "Terminé" : "En évolution"}</span></div>
        <button type="button" className="reset-journey" onClick={resetJourney}>Recommencer cette démonstration</button>
      </section>}
      <footer className="wrap"><p>Chaque trajet mérite d’être suivi avec attention.</p><span>© {new Date(now).getFullYear()} AERA · Expérience confidentielle</span></footer>
    </main>
  );
}
