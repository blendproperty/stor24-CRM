import { Boxes, ChartNoAxesCombined, Headphones, ShieldCheck } from "lucide-react";
import Image from "next/image";

export function PortalAuthLayout({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <main className="portal-entry">
      <section className="portal-brand-panel">
        <div className="portal-brand-glow" />
        <div className="portal-brand-lockup">
          <Image className="portal-official-logo" src="/brand/stor24-logo-white.svg" alt="Stor24" width={183} height={48} priority unoptimized />
          <span>Property operations cloud</span>
        </div>
        <div className="portal-brand-copy">
          <p>One platform. Every facility.</p>
          <h1>Storage operations, brought into focus.</h1>
          <p className="portal-brand-description">Run leasing, units, billing, collections and facility workflows from one secure command centre.</p>
        </div>
        <div className="portal-feature-row">
          <span><Boxes size={18} /> Live inventory</span>
          <span><ChartNoAxesCombined size={18} /> Portfolio insight</span>
          <span><Headphones size={18} /> Team workflows</span>
        </div>
        <div className="portal-security-note"><ShieldCheck size={18} /><span><strong>Protected workspace</strong>Encrypted session access with role-based permissions.</span></div>
      </section>
      <section className="portal-form-panel">
        <div className="portal-form-wrap">
          <div className="portal-mobile-brand"><Image className="portal-official-logo portal-official-logo-dark" src="/brand/stor24-logo-dark.svg" alt="Stor24" width={153} height={40} priority unoptimized /></div>
          <p className="portal-eyebrow">{eyebrow}</p>
          <h2>{title}</h2>
          <p className="portal-intro">{description}</p>
          {children}
          <p className="portal-support">Need help? Contact your Stor24 system administrator.</p>
        </div>
      </section>
    </main>
  );
}
