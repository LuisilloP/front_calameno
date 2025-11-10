"use client";

import { useState, useEffect } from "react";
import {
  SidebarNavigation,
  SidebarNavigationProps,
} from "@/components/navigation/SidebarNavigation";
import {
  ArrowUpDownIcon,
  CircleQuestionMarkIcon,
  EyeIcon,
  LandPlotIcon,
  LayoutDashboardIcon,
  PackageMinusIcon,
  PackagePlusIcon,
  ClipboardListIcon,
  Users2,
  WarehouseIcon,
  TruckIcon,
  TagIcon,
} from "lucide-react";
import { useTheme } from "next-themes";

export default function TestBar() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  // Avoid hydration mismatch by not rendering until mounted
  if (!mounted) {
    return (
      <aside className="flex flex-col h-screen w-full overflow-hidden border lg:max-w-xs bg-slate-900">
        {/* Placeholder durante SSR */}
      </aside>
    );
  }

  const sidebarDemoProps: SidebarNavigationProps = {
    variant: theme === "dark" ? "dark" : "light",
    brand: {
      name: "Sistema de Gestión Cocina",
      tagline: "Angel Calameño",
      badge: "0.1 Beta",
      badgeHref: "#",
    },
    onThemeToggle: toggleTheme,
    currentTheme: theme === "dark" || theme === "light" ? theme : "light",
    sections: [
      {
        title: "Funciones Principales",
        id: "main",
        items: [
          {
            id: "dashboard",
            label: "Panel",
            icon: LayoutDashboardIcon,
            href: "/",
          },
          {
            id: "inventory",
            label: "Inventario",
            icon: WarehouseIcon,
            children: [
              {
                id: "new-product",
                label: "Nuevo Producto",
                href: "/products",
              },
              {
                id: "modify-product",
                label: "Modificar/Eliminar Producto",
                href: "/products/1",
              },
            ],
          },
          {
            id: "vistas",
            label: "Vistas",
            icon: EyeIcon,
            href: "/vistas",
          },
          {
            id: "locations",
            label: "Ubicaciones",
            icon: LandPlotIcon,
            href: "/locations",
          },
          {
            id: "person",
            label: "Personas",
            icon: Users2,
            href: "/users",
          },
          {
            id: "providers",
            label: "Proveedores",
            icon: TruckIcon,
            href: "/providers",
          },
          {
            id: "categories",
            label: "Categorías",
            icon: TagIcon,
            href: "/categories",
          },
          {
            id: "help",
            label: "Ayuda",
            icon: CircleQuestionMarkIcon,
            href: "/help",
          },
        ],
      },
      {
        title: "Acciones",
        id: "acions",
        items: [
          {
            id: "registroMovimientos",
            label: "Registrar movimiento",
            icon: ClipboardListIcon,
            href: "/acciones/movimientos",
          },
          {
            id: "ingresarProductos",
            label: "Ingresar Productos",
            icon: PackagePlusIcon,
            href: "/acciones/ingresar",
          },
          {
            id: "egresarProductos",
            label: "Egresar Productos",
            icon: PackageMinusIcon,
            href: "/acciones/egresar",
          },
          {
            id: "moverProductos",
            label: "Mover Productos",
            icon: ArrowUpDownIcon,
            href: "/acciones/mover",
          },
        ],
      },
    ],
    user: {
      name: "Tom Cook",
      avatarSrc: "https://i.pravatar.cc/160?img=5",
      caption: "View profile",
    },
  };
  return <SidebarNavigation {...sidebarDemoProps} />;
}
