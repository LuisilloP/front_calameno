import { withAuth } from "../../components/withAuth";
import { useAuth } from "../../context/AuthContext";
import { SidebarNavigation, SidebarNavigationProps } from "@/components/ui/SidebarNavigation";
import {
  CalendarIcon,
  FileTextIcon,
  FolderKanbanIcon,
  PieChartIcon,
} from "lucide-react";

function DashboardPage() {
  const { user, logout } = useAuth();
  const sidebarDemoProps: SidebarNavigationProps = {
    variant: "light",
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

  return (
    <div>
      <h1>Dashboard</h1>
      
<SidebarNavigation {...sidebarDemoProps} className="max-w-xs" />;
      <p>Bienvenido, {user?.name}!</p>
      <button onClick={logout}>Cerrar Sesión</button>
    </div>
  );
}


export default withAuth(DashboardPage);
