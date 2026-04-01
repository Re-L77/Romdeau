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
import { notificacionesApi, Notificacion } from "@/api/notificaciones";
import { supabase } from "@/config/supabase";
import { useAuth } from "./AuthContext";
import type { RealtimeChannel } from "@supabase/supabase-js";

interface NotificacionesContextType {
  notificaciones: Notificacion[];
  noLeidasCount: number;
  isLoading: boolean;
  refresh: () => Promise<void>;
  marcarLeida: (id: string) => Promise<void>;
  marcarTodasLeidas: () => Promise<void>;
}

const NotificacionesContext = createContext<
  NotificacionesContextType | undefined
>(undefined);

export function NotificacionesProvider({ children }: { children: ReactNode }) {
  const { user, isAuthenticated } = useAuth();
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([]);
  const [noLeidasCount, setNoLeidasCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const refresh = useCallback(async () => {
    if (!isAuthenticated || !user) return;
    setIsLoading(true);
    try {
      const [lista, count] = await Promise.all([
        notificacionesApi.listar(),
        notificacionesApi.contarNoLeidas(),
      ]);
      setNotificaciones(lista);
      setNoLeidasCount(count);
    } catch (error) {
      console.error("Error cargando notificaciones:", error);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, user]);

  // Suscripción a Supabase Realtime + polling fallback
  useEffect(() => {
    if (!isAuthenticated || !user?.id) {
      setNotificaciones([]);
      setNoLeidasCount(0);
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

    // Cargar notificaciones iniciales
    refresh();

    // Polling cada 15s como fallback (funciona siempre)
    pollingRef.current = setInterval(() => {
      refresh();
    }, 15000);

    // Refrescar al volver de background
    const appStateListener = AppState.addEventListener("change", (state) => {
      if (state === "active") refresh();
    });

    // Suscribirse a inserts en tiempo real (si Realtime está habilitado)
    const channel = supabase
      .channel(`notificaciones:${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notificaciones",
          filter: `usuario_id=eq.${user.id}`,
        },
        (payload) => {
          const nueva = payload.new as Notificacion;
          setNotificaciones((prev) => {
            if (prev.some((n) => n.id === nueva.id)) return prev;
            return [nueva, ...prev];
          });
          setNoLeidasCount((prev) => prev + 1);
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
  }, [isAuthenticated, user?.id]);

  const marcarLeida = useCallback(async (id: string) => {
    await notificacionesApi.marcarLeida(id);
    setNotificaciones((prev) =>
      prev.map((n) => (n.id === id ? { ...n, leida: true } : n)),
    );
    setNoLeidasCount((prev) => Math.max(0, prev - 1));
  }, []);

  const marcarTodasLeidas = useCallback(async () => {
    await notificacionesApi.marcarTodasLeidas();
    setNotificaciones((prev) => prev.map((n) => ({ ...n, leida: true })));
    setNoLeidasCount(0);
  }, []);

  return (
    <NotificacionesContext.Provider
      value={{
        notificaciones,
        noLeidasCount,
        isLoading,
        refresh,
        marcarLeida,
        marcarTodasLeidas,
      }}
    >
      {children}
    </NotificacionesContext.Provider>
  );
}

export function useNotificaciones() {
  const context = useContext(NotificacionesContext);
  if (!context) {
    throw new Error(
      "useNotificaciones debe usarse dentro de NotificacionesProvider",
    );
  }
  return context;
}
