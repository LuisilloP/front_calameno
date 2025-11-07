import Link from "next/link";
import {
  SidebarNavigation,
  SidebarNavigationProps,
} from "@/components/ui/SidebarNavigation";
import { BarChart } from "../components/graphics/Bar_one";

import { DoughnutChart } from "@/components/graphics/Bar_two";
import ProductsPage from "./products/page";
import ModifyProduct from "./products/[id]/page";
export default function Home() {
  return (
    <main className="bg-gray-900 w-full">
      <div className=" flex gap-2">
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
        <ModifyProduct></ModifyProduct>
      </div>
    </main>
  );
}
