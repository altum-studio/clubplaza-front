// components/panel/QrScanner.tsx
// Escáner de QR embebido en el recuadro (sin abrir otra pantalla). Muestra el
// stream de la cámara en un <video> y decodifica los frames con jsQR. Cuando
// detecta un QR llama onDetect(texto) una sola vez. Requiere contexto seguro
// (https o localhost) para getUserMedia.

import { useEffect, useRef, useState } from 'react';
import jsQR from 'jsqr';

type Status = 'idle' | 'starting' | 'on' | 'denied' | 'error';

export function QrScanner({
  active,
  onDetect,
}: {
  active: boolean;
  onDetect: (text: string) => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const detectedRef = useRef(false);
  const onDetectRef = useRef(onDetect);
  onDetectRef.current = onDetect;

  const [status, setStatus] = useState<Status>('idle');
  // Espejamos la preview SOLO si la cámara activa es frontal (selfie / webcam),
  // donde la vista sin espejar se siente invertida. La trasera (environment) que
  // se usa para escanear NO se espeja. El decode no se afecta en ningún caso
  // (jsQR lee el frame crudo del canvas, ajeno a las transformaciones CSS).
  const [mirrored, setMirrored] = useState(false);

  useEffect(() => {
    let cancelled = false;

    function stop() {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
      if (videoRef.current) videoRef.current.srcObject = null;
    }

    if (!active) {
      stop();
      setStatus('idle');
      return;
    }

    detectedRef.current = false;
    setStatus('starting');

    function tick() {
      const v = videoRef.current;
      const c = canvasRef.current;
      if (!v || !c || detectedRef.current) return;
      if (v.readyState >= 2 && v.videoWidth > 0) {
        const SIZE = 320;
        const vw = v.videoWidth;
        const vh = v.videoHeight;
        const s = Math.min(vw, vh); // recorte cuadrado centrado
        c.width = SIZE;
        c.height = SIZE;
        const ctx = c.getContext('2d', { willReadFrequently: true });
        if (ctx) {
          ctx.drawImage(v, (vw - s) / 2, (vh - s) / 2, s, s, 0, 0, SIZE, SIZE);
          const img = ctx.getImageData(0, 0, SIZE, SIZE);
          const res = jsQR(img.data, SIZE, SIZE, { inversionAttempts: 'dontInvert' });
          if (res && res.data) {
            detectedRef.current = true;
            onDetectRef.current(res.data);
            return;
          }
        }
      }
      rafRef.current = requestAnimationFrame(tick);
    }

    (async () => {
      if (!navigator.mediaDevices?.getUserMedia) {
        setStatus('error');
        return;
      }
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' },
          audio: false,
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        const v = videoRef.current;
        if (v) {
          v.srcObject = stream;
          await v.play().catch(() => {});
        }
        // Frontal (o webcam de escritorio, que suele reportar undefined) → espejar.
        const facing = stream.getVideoTracks()[0]?.getSettings().facingMode;
        setMirrored(facing !== 'environment');
        setStatus('on');
        tick();
      } catch (e) {
        if (cancelled) return;
        const denied =
          e instanceof DOMException && (e.name === 'NotAllowedError' || e.name === 'SecurityError');
        setStatus(denied ? 'denied' : 'error');
      }
    })();

    return () => {
      cancelled = true;
      stop();
    };
  }, [active]);

  const hint =
    status === 'denied'
      ? 'Permití el acceso a la cámara para escanear.'
      : status === 'error'
        ? 'No se pudo abrir la cámara. Usá el código manual.'
        : status === 'starting'
          ? 'Activando cámara…'
          : 'Apuntá la cámara al QR de la credencial';

  return (
    <div className="relative flex h-[260px] items-center justify-center overflow-hidden rounded-[14px] bg-brand-dark">
      <video
        ref={videoRef}
        muted
        playsInline
        autoPlay
        style={{ transform: mirrored ? 'scaleX(-1)' : undefined }}
        className={`absolute inset-0 h-full w-full object-cover transition-opacity ${
          status === 'on' ? 'opacity-100' : 'opacity-0'
        }`}
      />
      <canvas ref={canvasRef} className="hidden" />

      {/* Marco guía */}
      <div className="relative h-[160px] w-[160px]">
        <div className="absolute left-0 top-0 h-[32px] w-[32px] border-l-[3px] border-t-[3px] border-white" />
        <div className="absolute right-0 top-0 h-[32px] w-[32px] border-r-[3px] border-t-[3px] border-white" />
        <div className="absolute bottom-0 left-0 h-[32px] w-[32px] border-b-[3px] border-l-[3px] border-white" />
        <div className="absolute bottom-0 right-0 h-[32px] w-[32px] border-b-[3px] border-r-[3px] border-white" />
        {status === 'on' && (
          <div className="absolute left-2 right-2 top-1/2 h-[2px] animate-pulse bg-[#23d366] shadow-[0_0_12px_#23d366]" />
        )}
      </div>

      <div className="absolute inset-x-0 bottom-3.5 px-4 text-center text-[12.5px] text-white/85">
        {hint}
      </div>
    </div>
  );
}
