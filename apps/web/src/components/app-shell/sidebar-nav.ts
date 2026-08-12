import {
  Building2,
  CalendarDays,
  ContactRound,
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
  | 'organizationsContacts'
  | 'settings'
  | 'settingsStaff';

export type NavChildLabelKey = 'organizationsContacts' | 'settingsStaff';

export type NavChildItem = {
  key: NavKey;
  href: string;
  labelKey: NavChildLabelKey;
  icon: LucideIcon;
  adminOnly?: boolean;
  preserveCycle?: boolean;
};

export type NavItem = {
  key: NavKey;
  href?: string;
  soon?: boolean;
  icon: LucideIcon;
  preserveCycle?: boolean;
  adminOnly?: boolean;
  children?: readonly NavChildItem[];
};

export const NAV_ITEMS: NavItem[] = [
  { key: 'builderSales', href: '/builder-sales', icon: Store, preserveCycle: true },
  { key: 'partners', href: '/partners', icon: Handshake, preserveCycle: true },
  { key: 'venueMap', href: '/venue-map', icon: Map, preserveCycle: true },
  { key: 'cycles', href: '/cycles', icon: CalendarDays, preserveCycle: true },
  {
    key: 'organizations',
    href: '/organizations',
    icon: Building2,
    preserveCycle: true,
    children: [
      {
        key: 'organizationsContacts',
        href: '/organizations/contacts',
        labelKey: 'organizationsContacts',
        icon: ContactRound,
        preserveCycle: true,
      },
    ],
  },
  {
    key: 'settings',
    href: '/settings',
    icon: Settings,
    preserveCycle: true,
    children: [
      {
        key: 'settingsStaff',
        href: '/settings/staff',
        labelKey: 'settingsStaff',
        icon: Users,
        adminOnly: true,
        preserveCycle: true,
      },
    ],
  },
];

function pathMatchesHref(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}

/** Longest child href wins, then parent. */
function resolveGroupActiveId(pathname: string, item: NavItem, isAdmin: boolean): string | null {
  if (!item.href || !item.children) {
    return null;
  }

  let bestChildKey: string | null = null;
  let bestChildHrefLength = -1;

  for (const child of item.children) {
    if (child.adminOnly && !isAdmin) {
      continue;
    }
    if (!pathMatchesHref(pathname, child.href)) {
      continue;
    }
    if (child.href.length > bestChildHrefLength) {
      bestChildHrefLength = child.href.length;
      bestChildKey = child.key;
    }
  }

  if (bestChildKey) {
    return bestChildKey;
  }

  if (pathMatchesHref(pathname, item.href)) {
    return item.key;
  }

  return null;
}

export function resolveActiveNavId(pathname: string, isAdmin: boolean): string | null {
  for (const item of NAV_ITEMS) {
    if (item.adminOnly && !isAdmin) {
      continue;
    }
    if (item.children) {
      const groupActive = resolveGroupActiveId(pathname, item, isAdmin);
      if (groupActive) {
        return groupActive;
      }
      continue;
    }
  }

  let bestKey: string | null = null;
  let bestHrefLength = -1;

  for (const item of NAV_ITEMS) {
    if (!item.href || item.soon || item.children) {
      continue;
    }
    if (item.adminOnly && !isAdmin) {
      continue;
    }
    if (!pathMatchesHref(pathname, item.href)) {
      continue;
    }
    if (item.href.length > bestHrefLength) {
      bestHrefLength = item.href.length;
      bestKey = item.key;
    }
  }

  return bestKey;
}

export function buildNavHref(
  item: Pick<NavItem, 'href' | 'preserveCycle'>,
  cycleId: string | null | undefined,
): string {
  if (!item.href) {
    return '#';
  }
  if (item.preserveCycle && cycleId) {
    return `${item.href}?cycle=${encodeURIComponent(cycleId)}`;
  }
  return item.href;
}

export function isNavGroupSectionActive(
  pathname: string,
  item: NavItem,
  isAdmin: boolean,
): boolean {
  return resolveGroupActiveId(pathname, item, isAdmin) !== null;
}

export function isNavGroupRootActive(pathname: string, item: NavItem, isAdmin: boolean): boolean {
  return resolveGroupActiveId(pathname, item, isAdmin) === item.key;
}

export function visibleNavChildren(item: NavItem, isAdmin: boolean): readonly NavChildItem[] {
  if (!item.children) {
    return [];
  }
  return item.children.filter((child) => !child.adminOnly || isAdmin);
}
