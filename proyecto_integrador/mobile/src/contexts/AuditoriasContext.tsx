import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  ReactNode,
} from "react";
import { AppState } from "react-native";
import { auditoriasApi, AuditoriaProgramada } from "@/api/auditorias";
import { supabase } from "@/config/supabase";
import { useAuth } from "./AuthContext";
import type { RealtimeChannel } from "@supabase/supabase-js";

interface AuditoriasContextType {
  auditorias: AuditoriaProgramada[];
  isLoading: boolean;
  refresh: () => Promise<void>;
}

const AuditoriasContext = createContext<AuditoriasContextType | undefined>(
  undefined,
);

export function AuditoriasProvider({ children }: { children: ReactNode }) {
  const { user, isAuthenticated } = useAuth();
  const [auditorias, setAuditorias] = useState<AuditoriaProgramada[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const refresh = useCallback(async () => {
    if (!isAuthenticated || !user) return;
    setIsLoading(true);
    try {
      const lista = await auditoriasApi.listarMias();
      setAuditorias(lista);
    } catch (error) {
      console.error("📋 Error cargando auditorías:", error);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, user]);

  // Suscripción a cambios en auditorías programadas
  useEffect(() => {
    if (!isAuthenticated || !user?.id) {
      setAuditorias([]);
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
      return;
    }

    // Cargar auditorías iniciales
    refresh();

    // Polling cada 30s (auditorías cambian menos frecuentemente)
    pollingRef.current = setInterval(() => {
      refresh();
    }, 30000);

    // Refrescar al volver de background
    const appStateListener = AppState.addEventListener("change", (state) => {
      if (state === "active") refresh();
    });

    // Suscribirse a cambios en tiempo real
    const channel = supabase
      .channel(`auditorias-programadas:auditor_id=${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "auditorias_programadas",
          filter: `auditor_id=eq.${user.id}`,
        },
        () => {
          refresh();
        },
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
      channelRef.current = null;
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
      appStateListener.remove();
    };
  }, [isAuthenticated, user?.id, refresh]);

  return (
    <AuditoriasContext.Provider value={{ auditorias, isLoading, refresh }}>
      {children}
    </AuditoriasContext.Provider>
  );
}

export function useAuditorias() {
  const context = useContext(AuditoriasContext);
  if (!context) {
    throw new Error("useAuditorias debe usarse dentro de AuditoriasProvider");
  }
  return context;
}
