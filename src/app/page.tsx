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
