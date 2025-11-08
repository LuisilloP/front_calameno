import Link from "next/link";
import {
  SidebarNavigation,
  SidebarNavigationProps,
} from "@/components/ui/SidebarNavigation";
import { BarChart } from "../components/graphics/Bar_one";

import { DoughnutChart } from "@/components/graphics/Bar_two";
import ProductsPage from "./products/page";
import ModifyProduct from "./products/[id]/page";
import AddStock from "./products/stock/add_stock/page";
import RemoveStock from "./products/stock/remove_stock/page";
import UsersPage from "./users/page";
import LocationsPage from "./locations/page";
import DashboardPage from "./dashboard/page";
export default function Home() {
  return (
    <main className="w-full min-h-screen">
      <div className="flex gap-2">
        {/* <div className="grid grid-cols-2">
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
        </div> */}
        {/* <ProductsPage></ProductsPage> */}
        {/* <ModifyProduct></ModifyProduct> */}
        {/* <AddStock></AddStock> */}
        {/* <RemoveStock></RemoveStock> */}
        {/* <UsersPage></UsersPage> */}
        <DashboardPage></DashboardPage>
      </div>
    </main>
  );
}
