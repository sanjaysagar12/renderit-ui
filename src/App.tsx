import { RouteProvider, useRoute } from "./route";
import LoginPage from "@/page/login/LoginPage";
import DashboardPage from "@/page/dashboard/presentation/DashboardPage";

function AppContent() {
  const { page } = useRoute();
  if (page === "dashboard") return <DashboardPage />;
  return <LoginPage />;
}

function App() {
  return (
    <RouteProvider>
      <AppContent />
    </RouteProvider>
  );
}

export default App;