// landing/LandingPage.tsx
// Landing de pauta de ClubPlaza (/sumate). Mobile-first; en la compu se
// reacomoda en columnas. Objetivo único: que la persona se registre como socio.

import { useEffect, useRef, useState, type RefObject } from 'react';
import { useLandingData } from './useLandingData';
import { Hero } from './sections/Hero';
import { LocalesStrip } from './sections/LocalesStrip';
import { Benefits } from './sections/Benefits';
import { HowItWorks } from './sections/HowItWorks';
import { Faq } from './sections/Faq';
import { FinalCta } from './sections/FinalCta';
import { Footer } from './sections/Footer';
import { StickyCta } from './sections/StickyCta';

export function LandingPage() {
  const data = useLandingData();
  const heroCtaRef = useRef<HTMLAnchorElement>(null);
  const finalCtaRef = useRef<HTMLAnchorElement>(null);
  const stickyVisible = useStickyVisible(heroCtaRef, finalCtaRef);

  return (
    <div className="min-h-dvh bg-screen text-ink">
      <Hero data={data} ctaRef={heroCtaRef} />
      <main>
        <LocalesStrip data={data} />
        <Benefits data={data} />
        <HowItWorks />
        <Faq />
        <FinalCta ctaRef={finalCtaRef} />
      </main>
      <Footer />
      <StickyCta visible={stickyVisible} />
    </div>
  );
}

// La barra fija se muestra cuando NINGUNO de los dos botones grandes (portada y
// cierre) está a la vista.
function useStickyVisible(
  heroRef: RefObject<HTMLAnchorElement | null>,
  finalRef: RefObject<HTMLAnchorElement | null>,
) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const hero = heroRef.current;
    const final = finalRef.current;
    if (!hero || !final || !('IntersectionObserver' in window)) return;
    const enPantalla = new Map<Element, boolean>([
      [hero, true],
      [final, false],
    ]);
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) enPantalla.set(e.target, e.isIntersecting);
      setVisible(!enPantalla.get(hero) && !enPantalla.get(final));
    });
    io.observe(hero);
    io.observe(final);
    return () => io.disconnect();
  }, [heroRef, finalRef]);
  return visible;
}
