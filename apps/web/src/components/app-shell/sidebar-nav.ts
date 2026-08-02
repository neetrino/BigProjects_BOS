import {
  Building2,
  CalendarDays,
  Handshake,
  Map,
  Settings,
  Store,
  Users,
  type LucideIcon,
} from 'lucide-react';

export type NavKey =
  | 'builderSales'
  | 'partners'
  | 'venueMap'
  | 'cycles'
  | 'organizations'
  | 'settingsStaff'
  | 'settings';

export type NavItem = {
  key: NavKey;
  href?: string;
  soon?: boolean;
  icon: LucideIcon;
  preserveCycle?: boolean;
  adminOnly?: boolean;
};

export const NAV_ITEMS: NavItem[] = [
  { key: 'builderSales', href: '/builder-sales', icon: Store, preserveCycle: true },
  { key: 'partners', href: '/partners', icon: Handshake, preserveCycle: true },
  { key: 'venueMap', href: '/venue-map', icon: Map, preserveCycle: true },
  { key: 'cycles', href: '/cycles', icon: CalendarDays },
  { key: 'organizations', href: '/organizations', icon: Building2 },
  { key: 'settingsStaff', href: '/settings/staff', icon: Users, adminOnly: true },
  { key: 'settings', href: '/settings', icon: Settings },
];

export function resolveActiveNavId(pathname: string, isAdmin: boolean): string | null {
  let bestKey: string | null = null;
  let bestHrefLength = -1;

  for (const item of NAV_ITEMS) {
    if (!item.href || item.soon) {
      continue;
    }
    if (item.adminOnly && !isAdmin) {
      continue;
    }
    const matches = pathname === item.href || pathname.startsWith(`${item.href}/`);
    if (!matches) {
      continue;
    }
    if (item.href.length > bestHrefLength) {
      bestHrefLength = item.href.length;
      bestKey = item.key;
    }
  }

  return bestKey;
}

export function buildNavHref(item: NavItem, cycleId: string | null): string {
  if (!item.href) {
    return '#';
  }
  if (item.preserveCycle && cycleId) {
    return `${item.href}?cycle=${encodeURIComponent(cycleId)}`;
  }
  return item.href;
}
