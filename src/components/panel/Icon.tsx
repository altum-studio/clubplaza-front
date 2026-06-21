// components/panel/Icon.tsx
// Mapea el set de iconos del panel-kit (pkGlyph) a lucide-react, así las
// pantallas del panel referencian iconos por nombre (igual que en las refs).

import {
  ArrowDown,
  ArrowUp,
  BarChart3,
  Bell,
  Calendar,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock,
  Download,
  Eye,
  Filter,
  LayoutDashboard,
  LogOut,
  Mail,
  MapPin,
  MessageCircle,
  MoreHorizontal,
  Pencil,
  Plus,
  QrCode,
  Search,
  Send,
  Settings,
  SlidersHorizontal,
  Store,
  Tag,
  Ticket,
  Trash2,
  Upload,
  User,
  Users,
  X,
  Zap,
  type LucideIcon,
} from 'lucide-react';

const ICONS = {
  dash: LayoutDashboard,
  store: Store,
  tag: Tag,
  chart: BarChart3,
  clock: Clock,
  send: Send,
  wa: MessageCircle,
  download: Download,
  upload: Upload,
  check: Check,
  x: X,
  search: Search,
  bell: Bell,
  gear: Settings,
  users: Users,
  user: User,
  qr: QrCode,
  chevD: ChevronDown,
  chevR: ChevronRight,
  chevL: ChevronLeft,
  plus: Plus,
  filter: Filter,
  dots: MoreHorizontal,
  eye: Eye,
  edit: Pencil,
  trash: Trash2,
  logout: LogOut,
  up: ArrowUp,
  down: ArrowDown,
  pin: MapPin,
  mail: Mail,
  cal: Calendar,
  ticket: Ticket,
  sliders: SlidersHorizontal,
  flash: Zap,
} satisfies Record<string, LucideIcon>;

export type IconName = keyof typeof ICONS;

export function Icon({
  name,
  size = 20,
  strokeWidth = 1.7,
  className,
}: {
  name: IconName;
  size?: number;
  strokeWidth?: number;
  className?: string;
}) {
  const C = ICONS[name];
  return <C size={size} strokeWidth={strokeWidth} className={className} />;
}
