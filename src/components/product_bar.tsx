"use client";

import { useCallback, useMemo } from "react";
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
  const { theme, setTheme, resolvedTheme: nextResolvedTheme } = useTheme();
  const resolvedTheme = (nextResolvedTheme ?? theme) === "dark" ? "dark" : "light";

  const handleThemeToggle = useCallback(() => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  }, [resolvedTheme, setTheme]);

  const sidebarProps = useMemo<SidebarNavigationProps>(() => {
    const coreItems = [
      {
        id: "dashboard",
        label: "Panel principal",
        icon: LayoutDashboardIcon,
        href: "/",
      },
      {
        id: "inventory-weekly",
        label: "Inventario semanal",
        icon: WarehouseIcon,
        href: "/inventory-weekly",
      },
      {
        id: "insights",
        label: "Vistas y reportes",
        icon: EyeIcon,
        href: "/vistas",
      },
      // {
      //   id: "support",
      //   label: "Centro de ayuda",
      //   icon: CircleQuestionMarkIcon,
      //   href: "/help",
      // },
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
        id: "admin-productos",
        label: "Productos",
        icon: PackagePlusIcon,
        href: "/admin/productos",
      },
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
