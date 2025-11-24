import Link from "next/link";
import {
  SidebarNavigation,
  SidebarNavigationProps,
} from "@/components/ui/SidebarNavigation";
import { BarChart } from "../components/graphics/Bar_one";

import UsersPage from "./users/page";
import LocationsPage from "./locations/page";
import DashboardPage from "./dashboard/page";
export default function Home() {
  return (
    <main className="w-full min-h-screen">
      <div className="flex gap-2">
        <DashboardPage></DashboardPage>
      </div>
    </main>
  );
}
