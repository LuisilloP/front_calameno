import Link from "next/link";
import { SidebarNavigation, SidebarNavigationProps } from "@/components/ui/SidebarNavigation";
import {
  ArrowUpDownIcon,
  CalendarIcon,
  CircleQuestionMarkIcon,
  FileTextIcon,
  FolderKanbanIcon,
  LandPlot,
  LandPlotIcon,
  LayoutDashboardIcon,
  PackageMinus,
  PackageMinusIcon,
  PackagePlus,
  PackagePlusIcon,
  PieChartIcon,
  User2Icon,
  Users2,
  WarehouseIcon,
} from "lucide-react";

export default function Home() {

    const sidebarDemoProps: SidebarNavigationProps = {
      variant: "dark",
      brand: {
        name: "Sistema de Gestión Cocina",
        tagline: "Angel Calameño",
        badge: "0.1 Beta",
        badgeHref: "#",
      },

      sections: [
        {
          title: "Funciones Principales",
          id: "main",
          items: [
            {
              id: "dashboard",
              label: "Panel",
              icon: LayoutDashboardIcon,
              href: "#",
            },
            {
              id: "inventory",
              label: "Inventario",
              icon: WarehouseIcon,
              href: "#",
            },
            {
              id: "locations",
              label: "Ubicaciones",
              icon: LandPlotIcon,
              href: "#",
            },
            { id: "person", label: "Personas", icon: Users2, href: "#" },
            {
              id: "help",
              label: "Ayuda",
              icon: CircleQuestionMarkIcon,
              href: "#",
            },
          ],
        },
        {
          title: "Acciones",
          id: "acions",
          items: [
            {
              id: "ingresarProductos",
              label: "Ingresar Productos",
              icon: PackagePlusIcon,
              href: "#",
            },
            {
              id: "egresarProductos",
              label: "Egresar Productos",
              icon: PackageMinusIcon,
              href: "#",
            },
            {
              id: "moverProductos",
              label: "Mover Productos",
              icon: ArrowUpDownIcon,
              href: "#",
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
  return (
    <main className="">
      <SidebarNavigation {...sidebarDemoProps}/>
    </main>
  );
}
