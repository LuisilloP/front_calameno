"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  SidebarNavigation,
  SidebarNavigationProps,
} from "@/components/navigation/SidebarNavigation";
import {
  ArrowUpDownIcon,
  CircleQuestionMarkIcon,
  ClipboardListIcon,
  EyeIcon,
  LandPlotIcon,
  LayoutDashboardIcon,
  PackageMinusIcon,
  PackagePlusIcon,
  Settings2Icon,
  TagIcon,
  TruckIcon,
  Users2,
  WarehouseIcon,
} from "lucide-react";
import { useTheme } from "next-themes";

export default function ProductSidebar() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const resolvedTheme = theme === "dark" ? "dark" : "light";

  const handleThemeToggle = useCallback(() => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  }, [resolvedTheme, setTheme]);

  if (!mounted) {
    return (
      <aside className="flex h-screen w-full flex-col overflow-hidden border border-slate-800/60 bg-slate-950/80 lg:max-w-xs">
        <div className="flex flex-1 flex-col items-center justify-center gap-2 text-center text-slate-500">
          <span className="text-xs uppercase tracking-[0.3em] text-slate-600">
            Calameno
          </span>
          <p className="text-xs text-slate-500">Inicializando panel...</p>
        </div>
      </aside>
    );
  }

  const sidebarProps = useMemo<SidebarNavigationProps>(() => {
    const coreItems = [
      {
        id: "dashboard",
        label: "Panel principal",
        icon: LayoutDashboardIcon,
        href: "/",
      },
      {
        id: "inventory",
        label: "Inventario y stock",
        icon: WarehouseIcon,
        children: [
          {
            id: "inventory-products",
            label: "Catalogo de productos",
            href: "/products",
          },
          {
            id: "inventory-locations",
            label: "Ubicaciones y stock",
            href: "/locations",
          },
        ],
      },
      {
        id: "insights",
        label: "Vistas y reportes",
        icon: EyeIcon,
        href: "/vistas",
      },
      {
        id: "support",
        label: "Centro de ayuda",
        icon: CircleQuestionMarkIcon,
        href: "/help",
      },
    ];

    const operationsItems = [
      {
        id: "registro-movimientos",
        label: "Registro de movimientos",
        icon: ClipboardListIcon,
        href: "/acciones/movimientos",
      },
    ];

    const adminItems = [
      {
        id: "admin-locaciones",
        label: "Locaciones",
        icon: LandPlotIcon,
        href: "/admin/locaciones",
      },
      {
        id: "admin-categorias",
        label: "Categorias",
        icon: TagIcon,
        href: "/admin/categorias",
      },
      {
        id: "admin-marcas",
        label: "Marcas",
        icon: PackageMinusIcon,
        href: "/admin/marcas",
      },
      {
        id: "admin-proveedores",
        label: "Proveedores",
        icon: TruckIcon,
        href: "/admin/proveedores",
      },
      {
        id: "admin-personas",
        label: "Personas",
        icon: Users2,
        href: "/admin/personas",
      },
      {
        id: "admin-preferencias",
        label: "Preferencias",
        icon: Settings2Icon,
        href: "/settings",
      },
    ];

    return {
      variant: resolvedTheme,
      brand: {
        name: "Calameno Inventario",
        tagline: "Operaciones en tiempo real",
        badge: "MVP",
        badgeHref: "#",
      },
      onThemeToggle: handleThemeToggle,
      currentTheme: resolvedTheme,
      sections: [
        {
          title: "Funciones principales",
          id: "core",
          items: coreItems,
        },
        {
          title: "Operaciones",
          id: "ops",
          items: operationsItems,
        },
        {
          title: "Administracion",
          id: "admin",
          items: adminItems,
        },
      ],
      user: {
        name: "Equipo Calameno",
        avatarSrc: "https://i.pravatar.cc/160?img=5",
        caption: "Ver perfil",
      },
    };
  }, [handleThemeToggle, resolvedTheme]);

  return <SidebarNavigation {...sidebarProps} />;
}
