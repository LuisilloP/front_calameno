import Link from "next/link";
import {
  SidebarNavigation,
  SidebarNavigationProps,
} from "@/components/ui/SidebarNavigation";
import { BarChart } from "../components/graphics/Bar_one";
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
import { DoughnutChart } from "@/components/graphics/Bar_two";

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
    <main className="bg-gray-900">
      <div className=" flex gap-2">
        <SidebarNavigation {...sidebarDemoProps} />
        <div>
          <p></p>
        </div>
        <div className="grid grid-cols-2">
          <BarChart
            title="Top 10 productos"
            sortDirection="desc"
            limit={10}
            height={500}
            dataField={"id"}
          ></BarChart>
          <DoughnutChart
            title="Distribución por Stock Mínimo"
            dataField="minStock"
            sortDirection="desc"
            limit={10}
            height={400}
          />
        </div>
      </div>
    </main>
  );
}
