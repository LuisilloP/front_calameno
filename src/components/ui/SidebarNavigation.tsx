import Link from "next/link";
import type { ComponentType, ReactNode, SVGProps } from "react";

type IconComponent = ComponentType<SVGProps<SVGSVGElement>>;

type SidebarVariant = "light" | "dark";

type SidebarBreadcrumb = {
  id: string;
  label: string;
  href?: string;
};

type SidebarNavItem = {
  id: string;
  label: string;
  icon?: IconComponent;
  href?: string;
  onClick?: () => void;
  isActive?: boolean;
  badge?: string;
  ariaLabel?: string;
};

type SidebarSection = {
  id: string;
  title?: string;
  items: SidebarNavItem[];
};

type SidebarTeam = {
  id: string;
  name: string;
  initials: string;
  href?: string;
  onClick?: () => void;
  isActive?: boolean;
};

type SidebarUser = {
  name: string;
  caption?: string;
  avatarSrc?: string;
  initials?: string;
  href?: string;
  onClick?: () => void;
};

type SidebarBrand = {
  name: string;
  logo?: ReactNode;
  tagline?: string;
  badge?: string;
  badgeHref?: string;
  href?: string;
};

type VariantTokens = {
  container: string;
  header: string;
  badge: string;
  sectionLabel: string;
  navItem: string;
  navItemActive: string;
  navBadge: string;
  teamItem: string;
  teamItemActive: string;
  teamInitials: string;
  divider: string;
  avatarRing: string;
  avatarFallback: string;
  userCard: string;
};

const variantTokens: Record<SidebarVariant, VariantTokens> = {
  light: {
    container: "bg-white text-slate-900",
    header:
      "bg-slate-900 text-white shadow-md shadow-slate-900/5 border-b border-slate-800/40",
    badge:
      "bg-slate-800/60 text-slate-100 hover:bg-slate-700 transition-colors",
    sectionLabel: "text-slate-400",
    navItem:
      "text-slate-500 hover:text-slate-900 hover:bg-slate-100 focus-visible:ring-slate-400 focus-visible:ring-offset-white",
    navItemActive: "bg-slate-100 text-slate-900 shadow-inner shadow-slate-200",
    navBadge: "bg-slate-200 text-slate-700",
    teamItem:
      "text-slate-500 hover:text-slate-900 hover:bg-slate-100 focus-visible:ring-slate-400 focus-visible:ring-offset-white",
    teamItemActive: "bg-slate-100 text-slate-900 shadow-inner shadow-slate-200",
    teamInitials: "bg-slate-100 text-slate-600",
    divider: "border-slate-100",
    avatarRing: "ring-slate-200",
    avatarFallback: "bg-slate-200 text-slate-600",
    userCard:
      "hover:bg-slate-100 focus-visible:ring-slate-400 focus-visible:ring-offset-white",
  },
  dark: {
    container: "bg-slate-950 text-slate-50",
    header:
      "bg-slate-900 text-slate-50 shadow-md shadow-black/50 border-b border-slate-800",
    badge:
      "bg-indigo-500/20 text-indigo-200 hover:bg-indigo-500/30 transition-colors",
    sectionLabel: "text-slate-400",
    navItem:
      "text-slate-200 hover:text-white hover:bg-slate-800 focus-visible:ring-indigo-400 focus-visible:ring-offset-slate-900",
    navItemActive: "bg-slate-800 text-white shadow-inner shadow-black/40",
    navBadge: "bg-slate-800 text-slate-200",
    teamItem:
      "text-slate-200 hover:text-white hover:bg-slate-800 focus-visible:ring-indigo-400 focus-visible:ring-offset-slate-900",
    teamItemActive: "bg-slate-800 text-white shadow-inner shadow-black/40",
    teamInitials: "bg-slate-800 text-slate-200",
    divider: "border-slate-800",
    avatarRing: "ring-slate-700",
    avatarFallback: "bg-slate-800 text-slate-200",
    userCard:
      "hover:bg-slate-800 focus-visible:ring-indigo-400 focus-visible:ring-offset-slate-900",
  },
};

const mergeClassNames = (
  ...classes: Array<string | null | undefined | false>
) => classes.filter(Boolean).join(" ");

export type SidebarNavigationProps = {
  /** Visual tone for the component, defaults to the light variant inspired by the reference design. */
  variant?: SidebarVariant;
  /** Brand information rendered in the header area. */
  brand: SidebarBrand;
  /** Optional breadcrumb trail to communicate the current context. */
  breadcrumbs?: SidebarBreadcrumb[];
  /** Navigation sections displayed underneath the header. */
  sections: SidebarSection[];
  /** Optional team switcher area rendered after the navigation sections. */
  teamSection?: {
    title?: string;
    items: SidebarTeam[];
  };
  /** Optional user summary rendered at the bottom of the sidebar. */
  user?: SidebarUser;
  /** Accessible toggle handler for mobile layouts. */
  onMenuToggle?: () => void;
  /** Extend or override base Tailwind classes. */
  className?: string;
  /** Slot for extra content (e.g. footer links). */
  footer?: ReactNode;
};

/**
 * SidebarNavigation encapsulates a branded, responsive sidebar with hierarchy-aware navigation,
 * team switcher and user summary. It is designed to mirror the provided UI reference while
 * remaining reusable by accepting typed props for copy, icons and actions.
 *
 * It supports light/dark variants, offers structural slots (sections, teams, footer) and exposes
 * `className` for custom styling so it can adapt to diverse product shells.
 */
export function SidebarNavigation({
  variant = "light",
  brand,
  breadcrumbs = [],
  sections,
  teamSection,
  user,
  onMenuToggle,
  className,
  footer,
}: SidebarNavigationProps) {
  const tokens = variantTokens[variant];

  return (
    <aside
      className={mergeClassNames(
        "flex flex-col h-screen w-full overflow-hidden  border lg:max-w-xs",
        tokens.container,
        tokens.divider,
        className,
      )}
      aria-label="Secondary navigation"
    >
      <header className={mergeClassNames("flex flex-col gap-6 p-6", tokens.header)}>
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {brand.logo ? (
              <span aria-hidden className="flex h-10 w-10 items-center justify-center">
                {brand.logo}
              </span>
            ) : null}
            {renderBrandName(brand)}
          </div>
          {onMenuToggle ? (
            <button
              type="button"
              onClick={onMenuToggle}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
              aria-label="Collapse sidebar"
            >
              <span aria-hidden className="block h-0.5 w-6 rounded-full bg-current" />
            </button>
          ) : null}
        </div>
        <div className="flex items-center justify-between gap-3 text-sm">
          {brand.tagline ? <p className="text-slate-300">{brand.tagline}</p> : <span />}
          {brand.badge ? (
            <Badge href={brand.badgeHref} className={tokens.badge}>
              {brand.badge}
            </Badge>
          ) : null}
        </div>
        {breadcrumbs.length ? (
          <nav aria-label="Breadcrumb">
            <ol className="flex flex-wrap items-center gap-2 text-xs font-medium text-slate-300">
              {breadcrumbs.map((crumb, index) => {
                const isLast = index === breadcrumbs.length - 1;
                return (
                  <li key={crumb.id} className="flex items-center gap-2">
                    {crumb.href && !isLast ? (
                      <Link
                        href={crumb.href}
                        className="hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 focus-visible:ring-white"
                      >
                        {crumb.label}
                      </Link>
                    ) : (
                      <span aria-current={isLast ? "page" : undefined}>{crumb.label}</span>
                    )}
                    {!isLast ? (
                      <span aria-hidden className="text-slate-500">
                        &gt;
                      </span>
                    ) : null}
                  </li>
                );
              })}
            </ol>
          </nav>
        ) : null}
      </header>

      <div className="flex-1 overflow-y-auto px-6 py-8">
        <div className="flex flex-col gap-10">
          {sections.map((section) => (
            <section key={section.id} className="space-y-3">
              {section.title ? (
                <h2 className={mergeClassNames("text-xs font-semibold uppercase tracking-wide", tokens.sectionLabel)}>
                  {section.title}
                </h2>
              ) : null}
              <ul className="space-y-1" role="list">
                {section.items.map((item) => (
                  <li key={item.id}>{renderNavItem(item, tokens)}</li>
                ))}
              </ul>
            </section>
          ))}

          {teamSection ? (
            <section className="space-y-3" aria-label={teamSection.title ?? "Teams"}>
              {teamSection.title ? (
                <h2 className={mergeClassNames("text-xs font-semibold uppercase tracking-wide", tokens.sectionLabel)}>
                  {teamSection.title}
                </h2>
              ) : null}
              <ul className="space-y-1" role="list">
                {teamSection.items.map((team) => (
                  <li key={team.id}>{renderTeamItem(team, tokens)}</li>
                ))}
              </ul>
            </section>
          ) : null}
        </div>
      </div>

      {(user || footer) && (
        <footer
          className={mergeClassNames(
            "mt-auto space-y-4 border-t px-6 py-6",
            tokens.divider,
          )}
          aria-label="Sidebar footer"
        >
          {user ? renderUserCard(user, tokens) : null}
          {footer}
        </footer>
      )}
    </aside>
  );
}

/**
 * Wraps interactive content with `Link` or `button` elements depending on provided props.
 * This avoids repeating accessibility attributes across navigation items and teams.
 */
function InteractiveWrapper({
  href,
  onClick,
  className,
  children,
  ariaLabel,
}: {
  href?: string;
  onClick?: () => void;
  className?: string;
  children: ReactNode;
  ariaLabel?: string;
}) {
  if (href) {
    return (
      <Link href={href} className={className} aria-label={ariaLabel}>
        {children}
      </Link>
    );
  }

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={mergeClassNames(className, "text-left")}
        aria-label={ariaLabel}
      >
        {children}
      </button>
    );
  }

  return (
    <span className={className} aria-label={ariaLabel}>
      {children}
    </span>
  );
}

function renderNavItem(item: SidebarNavItem, tokens: VariantTokens) {
  const Icon = item.icon;
  const baseClasses =
    "flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2";

  return (
    <InteractiveWrapper
      href={item.href}
      onClick={item.onClick}
      ariaLabel={item.ariaLabel ?? item.label}
      className={mergeClassNames(
        baseClasses,
        tokens.navItem,
        item.isActive && tokens.navItemActive,
      )}
    >
      {Icon ? (
        <Icon
          className="h-5 w-5 shrink-0"
          focusable="false"
          aria-hidden
        />
      ) : null}
      <span className="flex-1 truncate">{item.label}</span>
      {item.badge ? (
        <span
          className={mergeClassNames(
            "rounded-full px-2 py-0.5 text-xs font-semibold",
            tokens.navBadge,
          )}
        >
          {item.badge}
        </span>
      ) : null}
    </InteractiveWrapper>
  );
}

function renderTeamItem(team: SidebarTeam, tokens: VariantTokens) {
  const baseClasses =
    "flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2";

  return (
    <InteractiveWrapper
      href={team.href}
      onClick={team.onClick}
      ariaLabel={team.name}
      className={mergeClassNames(baseClasses, tokens.teamItem, team.isActive && tokens.teamItemActive)}
    >
      <span
        className={mergeClassNames(
          "flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold",
          tokens.teamInitials,
        )}
      >
        {team.initials}
      </span>
      <span className="flex-1 truncate">{team.name}</span>
    </InteractiveWrapper>
  );
}

function renderUserCard(user: SidebarUser, tokens: VariantTokens) {
  return (
    <InteractiveWrapper
      href={user.href}
      onClick={user.onClick}
      ariaLabel={user.name}
      className={mergeClassNames(
        "flex items-center gap-3 rounded-2xl px-3 py-2 text-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
        tokens.userCard,
      )}
    >
      <span
        className={mergeClassNames(
          "relative inline-flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full text-sm font-semibold uppercase ring-4",
          tokens.avatarFallback,
          tokens.avatarRing,
        )}
      >
        {user.avatarSrc ? (
          // eslint-disable-next-line @next/next/no-img-element -- Using native img to keep dependencies minimal.
          <img
            src={user.avatarSrc}
            alt={user.name}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        ) : (
          user.initials?.slice(0, 2) ?? user.name.slice(0, 2).toUpperCase()
        )}
      </span>
      <div className="flex min-w-0 flex-1 flex-col text-sm">
        <span className="truncate font-semibold">{user.name}</span>
        {user.caption ? (
          <span className="truncate text-xs text-slate-400">{user.caption}</span>
        ) : null}
      </div>
    </InteractiveWrapper>
  );
}

function renderBrandName(brand: SidebarBrand) {
  const content = (
    <div className="flex flex-col">
      <span className="text-lg font-semibold leading-tight">{brand.name}</span>
    </div>
  );

  if (brand.href) {
    return (
      <Link
        href={brand.href}
        className="flex flex-col focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 focus-visible:ring-white"
      >
        {content}
      </Link>
    );
  }

  return content;
}

function Badge({
  href,
  className,
  children,
}: {
  href?: string;
  className?: string;
  children: ReactNode;
}) {
  const baseClass =
    "inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold";

  if (href) {
    return (
      <Link href={href} className={mergeClassNames(baseClass, className)}>
        {children}
      </Link>
    );
  }

  return <span className={mergeClassNames(baseClass, className)}>{children}</span>;
}

/* Example usage:

import { SidebarNavigation, SidebarNavigationProps } from "@/components/ui/SidebarNavigation";
import {
  CalendarIcon,
  FileTextIcon,
  FolderKanbanIcon,
  PieChartIcon,
} from "lucide-react";

const sidebarDemoProps: SidebarNavigationProps = {
  brand: {
    name: "tailwindPLUS",
    tagline: "UI Blocks › Application UI",
    badge: "Now with AI",
    badgeHref: "#",
  },
  breadcrumbs: [
    { id: "ui-blocks", label: "UI Blocks", href: "#" },
    { id: "application-ui", label: "Application UI", href: "#" },
    { id: "sidebar", label: "Sidebar" },
  ],
  sections: [
    {
      id: "main",
      items: [
        { id: "projects", label: "Projects", icon: FolderKanbanIcon, href: "#", isActive: true },
        { id: "calendar", label: "Calendar", icon: CalendarIcon, href: "#" },
        { id: "documents", label: "Documents", icon: FileTextIcon, href: "#" },
        { id: "reports", label: "Reports", icon: PieChartIcon, href: "#" },
      ],
    },
  ],
  teamSection: {
    title: "Your teams",
    items: [
      { id: "heroicons", name: "Heroicons", initials: "H", href: "#" },
      { id: "tailwind", name: "Tailwind Labs", initials: "T", href: "#", isActive: true },
      { id: "workcation", name: "Workcation", initials: "W", href: "#" },
    ],
  },
  user: {
    name: "Tom Cook",
    avatarSrc: "https://i.pravatar.cc/160?img=5",
    caption: "View profile",
  },
};

<SidebarNavigation {...sidebarDemoProps} className="max-w-xs" />;

*/
