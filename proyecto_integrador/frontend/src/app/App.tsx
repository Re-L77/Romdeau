import { lazy, Suspense, useEffect, useState } from "react";
import { LoginScreen } from "./components/auth/LoginScreen";
import { ResetPasswordScreen } from "./components/auth/ResetPasswordScreen";
import { FloatingSidebar } from "./components/layout/FloatingSidebar";
import { FloatingHeader } from "./components/layout/FloatingHeader";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AuthProvider, useAuth } from "../contexts/AuthContext";
import { Toaster } from "./components/ui/sonner";

// Lazy-loaded views — only downloaded when the user navigates to them
const Dashboard = lazy(() =>
  import("./components/dashboard/Dashboard").then((m) => ({
    default: m.Dashboard,
  })),
);
const ModuloInventario = lazy(() =>
  import("./components/inventory/ModuloInventario").then((m) => ({
    default: m.ModuloInventario,
  })),
);
const ModuloAuditorias = lazy(() =>
  import("./components/audits/ModuloAuditorias").then((m) => ({
    default: m.ModuloAuditorias,
  })),
);
const RegistroAuditorias = lazy(() =>
  import("./components/audits/RegistroAuditorias").then((m) => ({
    default: m.RegistroAuditorias,
  })),
);
const DepreciacionGarantias = lazy(() =>
  import("./components/alerts/Alertas").then((m) => ({ default: m.Alertas })),
);
const DirectorioProveedores = lazy(() =>
  import("./components/providers/DirectorioProveedores").then((m) => ({
    default: m.DirectorioProveedores,
  })),
);
const GestionUsuarios = lazy(() =>
  import("./components/users/GestionUsuarios").then((m) => ({
    default: m.GestionUsuarios,
  })),
);
const AssetDetail = lazy(() =>
  import("./components/inventory/AssetDetail").then((m) => ({
    default: m.AssetDetail,
  })),
);
const AuditDetail = lazy(() =>
  import("./components/audits/AuditDetail").then((m) => ({
    default: m.AuditDetail,
  })),
);
const CreateEditAsset = lazy(() =>
  import("./components/inventory/CreateEditAsset").then((m) => ({
    default: m.CreateEditAsset,
  })),
);
const AccountSettings = lazy(() =>
  import("./components/users/AccountSettings").then((m) => ({
    default: m.AccountSettings,
  })),
);
const UserDetail = lazy(() =>
  import("./components/users/UserDetail").then((m) => ({
    default: m.UserDetail,
  })),
);
const ProveedorDetail = lazy(() =>
  import("./components/providers/ProveedorDetail").then((m) => ({
    default: m.ProveedorDetail,
  })),
);

function ViewSpinner() {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-500" />
    </div>
  );
}

type ViewType =
  | "login"
  | "dashboard"
  | "inventario"
  | "auditorias"
  | "registro-auditorias"
  | "depreciacion-garantias"
  | "proveedores"
  | "usuarios"
  | "assetDetail"
  | "auditDetail"
  | "userDetail"
  | "proveedorDetail"
  | "settings";

function AppContent() {
  const { isAuthenticated, isValidating, logout } = useAuth();
  const [currentView, setCurrentView] = useState<ViewType>("dashboard");
  const [recoveryRefreshToken, setRecoveryRefreshToken] = useState<
    string | null
  >(null);
  const [isRecoveryMode, setIsRecoveryMode] = useState(false);
  const [recoveryError, setRecoveryError] = useState<string | null>(null);
  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null);
  const [selectedAuditId, setSelectedAuditId] = useState<string | null>(null);
  const [auditType, setAuditType] = useState<"scheduled" | "completed">(
    "scheduled",
  );
  const [showCreateEditModal, setShowCreateEditModal] = useState(false);
  const [editingAssetId, setEditingAssetId] = useState<string | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedProveedorId, setSelectedProveedorId] = useState<string | null>(
    null,
  );
  // Incrementar este contador fuerza remount de DirectorioProveedores tras editar
  const [proveedoresRefreshKey, setProveedoresRefreshKey] = useState(0);

  const handleLogin = () => {
    setCurrentView("dashboard");
  };

  const clearRecoveryUrl = () => {
    const cleanUrl =
      window.location.pathname === "/reset-password"
        ? `${window.location.origin}/`
        : `${window.location.origin}${window.location.pathname}${window.location.search}`;
    window.history.replaceState(null, "", cleanUrl);
  };

  useEffect(() => {
    const handleRecoveryUrl = () => {
      const isRecoveryPath = window.location.pathname === "/reset-password";
      const hashValue = window.location.hash.startsWith("#")
        ? window.location.hash.slice(1)
        : window.location.hash;

      const params = new URLSearchParams(hashValue);
      const hashType = params.get("type");

      // Entrar en modo recovery si la ruta es /reset-password O si el hash dice type=recovery
      if (!isRecoveryPath && hashType !== "recovery") {
        setIsRecoveryMode(false);
        setRecoveryRefreshToken(null);
        setRecoveryError(null);
        return;
      }

      const refreshToken = params.get("refresh_token");
      setIsRecoveryMode(true);

      if (!refreshToken) {
        setRecoveryRefreshToken(null);
        setRecoveryError(
          "El enlace de recuperación es inválido o está incompleto.",
        );
        return;
      }

      setRecoveryRefreshToken(refreshToken);
      setRecoveryError(null);
    };

    handleRecoveryUrl();
    window.addEventListener("hashchange", handleRecoveryUrl);
    window.addEventListener("popstate", handleRecoveryUrl);

    return () => {
      window.removeEventListener("hashchange", handleRecoveryUrl);
      window.removeEventListener("popstate", handleRecoveryUrl);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  // Mostrar loading mientras se valida la sesión
  if (isValidating) {
    return (
      <ThemeProvider>
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black dark:from-black dark:via-gray-950 dark:to-gray-900 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white mx-auto mb-4"></div>
            <p className="text-white">Cargando sesión...</p>
          </div>
        </div>
      </ThemeProvider>
    );
  }

  if (isRecoveryMode) {
    return (
      <ThemeProvider>
        <ResetPasswordScreen
          refreshToken={recoveryRefreshToken}
          initialError={recoveryError}
          onBackToLogin={() => {
            setIsRecoveryMode(false);
            setRecoveryRefreshToken(null);
            setRecoveryError(null);
            clearRecoveryUrl();
          }}
        />
      </ThemeProvider>
    );
  }

  const handleNavigate = (view: string) => {
    setCurrentView(view as ViewType);
    setSelectedAssetId(null);
    setSelectedAuditId(null);
    setSelectedUserId(null);
    setSelectedProveedorId(null);
  };

  const handleAssetClick = (assetId: string) => {
    setSelectedAssetId(assetId);
    setCurrentView("assetDetail");
  };

  const handleScheduledAuditClick = (auditId: string) => {
    setSelectedAuditId(auditId);
    setAuditType("scheduled");
    setCurrentView("auditDetail");
  };

  const handleCompletedAuditClick = (auditId: string) => {
    setSelectedAuditId(auditId);
    setAuditType("completed");
    setCurrentView("auditDetail");
  };

  const handleCreateAsset = () => {
    setEditingAssetId(null);
    setShowCreateEditModal(true);
  };

  const handleEditAsset = () => {
    setEditingAssetId(selectedAssetId);
    setShowCreateEditModal(true);
  };

  const handleBackToInventory = () => {
    setCurrentView("inventario");
    setSelectedAssetId(null);
  };

  const handleSaveAsset = () => {
    setShowCreateEditModal(false);
    setEditingAssetId(null);
    alert("Activo guardado exitosamente");
  };

  const handleCloseModal = () => {
    setShowCreateEditModal(false);
    setEditingAssetId(null);
  };

  const handleSettingsClick = () => {
    setCurrentView("settings");
  };

  const handleUserClick = (userId: string) => {
    setSelectedUserId(userId);
    setCurrentView("userDetail");
  };

  const handleBackToUsers = () => {
    setCurrentView("usuarios");
    setSelectedUserId(null);
  };

  const handleProveedorClick = (proveedorId: string) => {
    setSelectedProveedorId(proveedorId);
    setCurrentView("proveedorDetail");
  };

  const handleBackToProveedores = () => {
    setCurrentView("proveedores");
    setSelectedProveedorId(null);
    // Fuerza remount -> nuevo fetch con datos actualizados
    setProveedoresRefreshKey((k) => k + 1);
  };

  // View 1: Login Screen
  if (!isAuthenticated) {
    return (
      <ThemeProvider>
        <LoginScreen onLogin={handleLogin} />
      </ThemeProvider>
    );
  }

  // Views 2-7: Dashboard Shell with Navigation
  return (
    <ThemeProvider>
      <div className="min-h-screen bg-[#F3F4F6] dark:bg-[#0a0a0a] relative transition-colors duration-300">
        <Toaster richColors position="top-right" />
        <FloatingSidebar
          activeView={
            currentView === "assetDetail"
              ? "inventario"
              : currentView === "auditDetail"
                ? "auditorias"
                : currentView === "userDetail"
                  ? "usuarios"
                  : currentView === "proveedorDetail"
                    ? "proveedores"
                    : currentView
          }
          onNavigate={handleNavigate}
        />
        <FloatingHeader
          onSettingsClick={handleSettingsClick}
          onLogout={handleLogout}
        />

        <Suspense fallback={<ViewSpinner />}>
          {/* View 2: Dashboard */}
          {currentView === "dashboard" && (
            <Dashboard onNavigate={handleNavigate} />
          )}

          {/* View 3: Módulo de Inventario */}
          {currentView === "inventario" && (
            <ModuloInventario
              onAssetClick={handleAssetClick}
              onCreateAsset={handleCreateAsset}
            />
          )}

          {/* View 4: Módulo de Auditorías */}
          {currentView === "auditorias" && (
            <ModuloAuditorias
              onScheduledAuditClick={handleScheduledAuditClick}
              onCompletedAuditClick={handleCompletedAuditClick}
            />
          )}

          {/* View 5: Registro de Auditorías */}
          {currentView === "registro-auditorias" && (
            <RegistroAuditorias onAssetClick={handleAssetClick} />
          )}

          {/* View 5.5: Depreciación y Garantías */}
          {currentView === "depreciacion-garantias" && (
            <DepreciacionGarantias />
          )}

          {/* View 6: Directorio de Proveedores */}
          {currentView === "proveedores" && (
            <DirectorioProveedores
              key={proveedoresRefreshKey}
              onProveedorClick={handleProveedorClick}
            />
          )}

          {/* View 7: Gestión de Usuarios */}
          {currentView === "usuarios" && (
            <GestionUsuarios onUserClick={handleUserClick} />
          )}

          {/* View 8: Asset Detail */}
          {currentView === "assetDetail" && selectedAssetId && (
            <AssetDetail
              assetId={selectedAssetId}
              onBack={handleBackToInventory}
              onEdit={handleEditAsset}
            />
          )}

          {/* View 9: Audit Detail */}
          {currentView === "auditDetail" && selectedAuditId && (
            <AuditDetail
              auditId={selectedAuditId}
              auditType={auditType}
              onBack={() => handleNavigate("auditorias")}
              onAssetClick={handleAssetClick}
            />
          )}

          {/* View 10: Account Settings */}
          {currentView === "settings" && <AccountSettings />}

          {/* View 11: User Detail */}
          {currentView === "userDetail" && selectedUserId && (
            <UserDetail userId={selectedUserId} onBack={handleBackToUsers} />
          )}

          {/* View 12: Proveedor Detail */}
          {currentView === "proveedorDetail" && selectedProveedorId && (
            <ProveedorDetail
              proveedorId={selectedProveedorId}
              onBack={handleBackToProveedores}
            />
          )}

          {/* Create/Edit Asset Modal */}
          {showCreateEditModal && (
            <CreateEditAsset
              assetId={editingAssetId || undefined}
              onClose={handleCloseModal}
              onSave={handleSaveAsset}
            />
          )}
        </Suspense>
      </div>
    </ThemeProvider>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
