// components/panel/PanelShell.tsx
// Shell del panel web (Admin/Local). Variante de producción = "sidebar" (A).
// Responsive: en escritorio (lg+) sidebar oscura + topbar; en celular header
// verde + nav inferior. Reusa el isotipo de marca y los tokens del panel.

import { type ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { BrandIso } from '@/components/brand/Logo';
import { Icon, type IconName } from './Icon';
import { Avatar } from './kit';

export interface NavItem {
  icon: IconName;
  label: string;
  to: string;
}

function useActive(nav: NavItem[]) {
  const { pathname } = useLocation();
  // Item activo = el `to` más largo que sea prefijo del pathname (así
  // /admin/beneficios/cargar marca "Beneficios" y no el dashboard base).
  let best = '';
  for (const n of nav) {
    if ((pathname === n.to || pathname.startsWith(n.to + '/')) && n.to.length > best.length) best = n.to;
  }
  return best;
}

function Wordmark({ onGreen = true }: { onGreen?: boolean }) {
  return (
    <span className={cn('text-base tracking-[0.4px]', onGreen ? 'text-white' : 'text-ink')}>
      <span className="font-extrabold">CLUB</span>
      <span className="font-light">PLAZA</span>
    </span>
  );
}

export function PanelShell({
  role,
  nav,
  topbarTitle,
  topbarActions,
  userName,
  userRole,
  children,
}: {
  role: string;
  nav: NavItem[];
  topbarTitle: ReactNode;
  topbarActions?: ReactNode;
  userName: string;
  userRole: string;
  children: ReactNode;
}) {
  const active = useActive(nav);

  return (
    <div className="flex min-h-screen w-full bg-panel font-sans text-ink">
      {/* ── Sidebar (desktop) ── */}
      <aside className="hidden w-[232px] flex-shrink-0 flex-col bg-brand-dark px-4 py-5 text-white lg:flex">
        <div className="mb-6 flex items-center gap-[9px] px-1.5">
          <BrandIso size={30} onGreen />
          <Wordmark />
        </div>
        <div className="px-2 pb-2.5 text-[10px] font-bold uppercase tracking-[1px] text-white/40">
          Panel {role}
        </div>
        <nav className="flex flex-1 flex-col gap-[3px]">
          {nav.map((n) => {
            const on = active === n.to;
            return (
              <Link
                key={n.to}
                to={n.to}
                className={cn(
                  'flex items-center gap-[11px] rounded-[9px] px-3 py-2.5 transition-colors',
                  on ? 'bg-white/10' : 'hover:bg-white/5',
                )}
              >
                <Icon name={n.icon} size={19} strokeWidth={on ? 2 : 1.7} className={on ? 'text-white' : 'text-white/55'} />
                <span className={cn('text-[13.5px]', on ? 'font-bold text-white' : 'font-medium text-white/65')}>
                  {n.label}
                </span>
              </Link>
            );
          })}
        </nav>
        <div className="flex items-center gap-2.5 border-t border-white/10 pt-3.5">
          <Avatar name={userName} size={32} tone="mute" />
          <div className="min-w-0 flex-1">
            <div className="truncate text-[12.5px] font-bold text-white">{userName}</div>
            <div className="text-[11px] text-white/50">{userRole}</div>
          </div>
          <Icon name="logout" size={17} className="text-white/50" />
        </div>
      </aside>

      {/* ── Columna principal ── */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Header verde (mobile) */}
        <header className="flex items-center justify-between bg-brand-dark px-4 pb-3.5 pt-[max(env(safe-area-inset-top),14px)] text-white lg:hidden">
          <div className="flex items-center gap-2.5">
            <BrandIso size={24} onGreen />
            <div>
              <div className="text-[9.5px] font-bold uppercase tracking-[0.6px] text-white/60">
                {role}
              </div>
              <div className="text-[15px] font-extrabold leading-tight text-white">{topbarTitle}</div>
            </div>
          </div>
          <Icon name="bell" size={19} className="text-white" />
        </header>

        {/* Topbar (desktop) */}
        <div className="hidden h-16 flex-shrink-0 items-center justify-between border-b border-line bg-white px-7 lg:flex">
          <div className="text-[18px] font-extrabold tracking-[-0.3px]">{topbarTitle}</div>
          <div className="flex items-center gap-3.5">
            {topbarActions}
            <div className="relative flex h-[38px] w-[38px] items-center justify-center rounded-[9px] border border-line">
              <Icon name="bell" size={18} className="text-graytext" />
              <span className="absolute right-[9px] top-2 h-[7px] w-[7px] rounded-full border-[1.5px] border-white bg-bad" />
            </div>
          </div>
        </div>

        {/* Acciones (mobile) — debajo del header, si hay */}
        {topbarActions && (
          <div className="flex items-center gap-2 overflow-x-auto border-b border-line bg-white px-4 py-2.5 lg:hidden [&::-webkit-scrollbar]:hidden">
            {topbarActions}
          </div>
        )}

        <main className="flex-1 overflow-x-hidden p-4 pb-24 lg:p-7 lg:pb-7">{children}</main>

        {/* Nav inferior (mobile) */}
        <nav className="fixed inset-x-0 bottom-0 z-40 flex border-t border-line bg-white pb-[max(env(safe-area-inset-bottom),10px)] pt-2 lg:hidden">
          {nav.map((n) => {
            const on = active === n.to;
            return (
              <Link key={n.to} to={n.to} className="flex flex-1 flex-col items-center gap-1">
                <Icon name={n.icon} size={21} className={on ? 'text-brand' : 'text-mute'} />
                <span className={cn('text-[10px]', on ? 'font-bold text-brand' : 'font-medium text-mute')}>
                  {n.label}
                </span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
