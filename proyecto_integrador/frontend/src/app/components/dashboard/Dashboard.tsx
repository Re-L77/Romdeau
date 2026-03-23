import { FinancialWidgets } from "./FinancialWidgets";
import { AuditTimeline } from "../audits/AuditTimeline";
import { ControlCenter } from "./ControlCenter";
import { FinancialMetricCards } from "./FinancialMetricCards";
import { RecentAudits } from "../audits/RecentAudits";
import { useAuth } from "../../../contexts/AuthContext";

export function Dashboard() {
  const { user } = useAuth();

  return (
    <>
      <AuditTimeline />
      <main className="px-6 lg:pl-80 xl:pr-[440px] pt-6 lg:pt-8 pb-12">
        <div className="max-w-[1400px] mx-auto space-y-8">
          <div className="mb-8">
            <h1 className="text-2xl md:text-3xl font-bold mb-2 dark:text-white">
              Bienvenido,{" "}
              {user?.nombre_completo ||
                [user?.nombres, user?.apellido_paterno].filter(Boolean).join(" ") ||
                "Usuario"}
            </h1>
          </div>
          <FinancialMetricCards />
          <ControlCenter />
          <RecentAudits />
          <FinancialWidgets />
        </div>
      </main>
    </>
  );
}
