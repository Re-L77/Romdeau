import { useState } from "react";
import { LoginScreen } from "./components/auth/LoginScreen";
import { FloatingSidebar } from "./components/layout/FloatingSidebar";
import { FloatingHeader } from "./components/layout/FloatingHeader";
import { Dashboard } from "./components/dashboard/Dashboard";
import { ModuloInventario } from "./components/inventory/ModuloInventario";
import { ModuloAuditorias } from "./components/audits/ModuloAuditorias";
import { RegistroAuditorias } from "./components/audits/RegistroAuditorias";
import { AlertasMantenimiento } from "./components/alerts/AlertasMantenimiento";
import { DirectorioProveedores } from "./components/providers/DirectorioProveedores";
import { GestionUsuarios } from "./components/users/GestionUsuarios";
import { AssetDetail } from "./components/inventory/AssetDetail";
import { AuditDetail } from "./components/audits/AuditDetail";
import { CreateEditAsset } from "./components/inventory/CreateEditAsset";
import { AccountSettings } from "./components/users/AccountSettings";
import { UserDetail } from "./components/users/UserDetail";
import { ProveedorDetail } from "./components/providers/ProveedorDetail";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AuthProvider, useAuth } from "../contexts/AuthContext";
import { Toaster } from "./components/ui/sonner";

type ViewType =
  | "login"
  | "dashboard"
  | "inventario"
  | "auditorias"
  | "registro-auditorias"
  | "alertas"
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

  const handleLogin = () => {
    setCurrentView("dashboard");
  };

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

  const handleAuditClick = (auditId: string) => {
    setSelectedAuditId(auditId);
    setAuditType("completed"); // Las auditorías clickeables son completadas
    setCurrentView("auditDetail");
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

        {/* View 2: Dashboard */}
        {currentView === "dashboard" && <Dashboard />}

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
          <RegistroAuditorias onAuditClick={handleAuditClick} />
        )}

        {/* View 5.5: Alertas y Mantenimiento */}
        {currentView === "alertas" && <AlertasMantenimiento />}

        {/* View 6: Directorio de Proveedores */}
        {currentView === "proveedores" && (
          <DirectorioProveedores onProveedorClick={handleProveedorClick} />
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
