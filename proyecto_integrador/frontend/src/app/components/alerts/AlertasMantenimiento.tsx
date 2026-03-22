import { motion } from 'motion/react';
import { AlertTriangle, Bell, Wrench, TrendingDown, CheckCircle, Clock, XCircle, FileText } from 'lucide-react';
import { mockDB } from '../../data/mockData';
import { TipoAlerta, EstadoTicket } from '../../data/types';

// Enriquecer alertas con relaciones
const alertasEnriquecidas = mockDB.alertasSistema.map(alerta => {
  const activo = mockDB.activos.find(a => a.id === alerta.activo_id);
  const usuario = mockDB.usuarios.find(u => u.id === alerta.usuario_destino_id);
  
  return {
    ...alerta,
    activo,
    usuario_destino: usuario,
  };
});

// Enriquecer mantenimientos con relaciones
const mantenimientosEnriquecidos = mockDB.mantenimientos.map(mant => {
  const activo = mockDB.activos.find(a => a.id === mant.activo_id);
  const solicitante = mockDB.usuarios.find(u => u.id === mant.solicitante_id);
  
  return {
    ...mant,
    activo,
    solicitante,
  };
});

export function AlertasMantenimiento() {
  const alertasNoLeidas = alertasEnriquecidas.filter(a => !a.leida);
  const mantenimientosPendientes = mantenimientosEnriquecidos.filter(
    m => m.estado_ticket === EstadoTicket.ABIERTO || m.estado_ticket === EstadoTicket.EN_PROGRESO
  );

  const getAlertIcon = (tipo: TipoAlerta) => {
    switch (tipo) {
      case TipoAlerta.VENCIMIENTO_GARANTIA:
        return <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400" />;
      case TipoAlerta.MANTENIMIENTO_PREVENTIVO:
        return <Wrench className="w-5 h-5 text-blue-600 dark:text-blue-400" />;
      case TipoAlerta.DEPRECIACION_CERO:
        return <TrendingDown className="w-5 h-5 text-red-600 dark:text-red-400" />;
      default:
        return <Bell className="w-5 h-5 text-gray-600 dark:text-gray-400" />;
    }
  };

  const getEstadoTicketColor = (estado: EstadoTicket) => {
    switch (estado) {
      case EstadoTicket.ABIERTO:
        return 'bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-700/30';
      case EstadoTicket.EN_PROGRESO:
        return 'bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-700/30';
      case EstadoTicket.RESUELTO:
        return 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-700/30';
      case EstadoTicket.CANCELADO:
        return 'bg-gray-100 dark:bg-gray-500/20 text-gray-700 dark:text-gray-400 border-gray-200 dark:border-gray-700/30';
      default:
        return 'bg-gray-100 dark:bg-gray-500/20 text-gray-700 dark:text-gray-400 border-gray-200 dark:border-gray-700/30';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <main className="pl-6 lg:pl-80 pt-24 pb-12 px-6 pr-6 lg:pr-12">
      <div className="max-w-[1400px] mx-auto">
        <div className="space-y-6">
          {/* Header */}
          <div>
            <h2 className="text-2xl font-bold mb-1 dark:text-white">Alertas y Mantenimiento</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Monitoreo de garantías, mantenimiento preventivo y estado de activos
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Alertas del Sistema */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-[#1a1a1a] rounded-2xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.5)] p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-amber-100 dark:bg-amber-500/20 rounded-2xl flex items-center justify-center">
                    <AlertTriangle className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white">Alertas Activas</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-500">
                      {alertasNoLeidas.length} sin leer
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                {alertasEnriquecidas.length === 0 ? (
                  <div className="text-center py-8">
                    <CheckCircle className="w-12 h-12 text-emerald-600 dark:text-emerald-400 mx-auto mb-3" />
                    <p className="text-gray-500 dark:text-gray-500">No hay alertas activas</p>
                  </div>
                ) : (
                  alertasEnriquecidas.map((alerta, index) => (
                    <motion.div
                      key={alerta.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={`p-4 rounded-xl border ${
                        alerta.leida
                          ? 'bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700'
                          : 'bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-700/30'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="mt-1">{getAlertIcon(alerta.tipo_alerta)}</div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-1">
                            <p className="font-medium text-gray-900 dark:text-white text-sm">
                              {alerta.tipo_alerta.replace(/_/g, ' ')}
                            </p>
                            <span className="text-xs text-gray-500 dark:text-gray-500">
                              {formatDate(alerta.fecha_disparo)}
                            </span>
                          </div>
                          <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                            {alerta.mensaje}
                          </p>
                          {alerta.activo && (
                            <div className="flex items-center gap-2">
                              <span className="text-xs px-3 py-1 bg-white dark:bg-gray-900 rounded-full border border-gray-200 dark:border-gray-700 font-mono">
                                {alerta.activo.codigo_etiqueta}
                              </span>
                              <span className="text-xs text-gray-500 dark:text-gray-500">
                                {alerta.activo.nombre}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </motion.div>

            {/* Órdenes de Mantenimiento */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white dark:bg-[#1a1a1a] rounded-2xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.5)] p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-500/20 rounded-2xl flex items-center justify-center">
                    <Wrench className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white">Mantenimiento</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-500">
                      {mantenimientosPendientes.length} tickets pendientes
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                {mantenimientosEnriquecidos.length === 0 ? (
                  <div className="text-center py-8">
                    <CheckCircle className="w-12 h-12 text-emerald-600 dark:text-emerald-400 mx-auto mb-3" />
                    <p className="text-gray-500 dark:text-gray-500">
                      No hay órdenes de mantenimiento
                    </p>
                  </div>
                ) : (
                  mantenimientosEnriquecidos.map((mant, index) => (
                    <motion.div
                      key={mant.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-medium border ${getEstadoTicketColor(
                                mant.estado_ticket
                              )}`}
                            >
                              {mant.estado_ticket.replace(/_/g, ' ')}
                            </span>
                            <span className="text-xs text-gray-500 dark:text-gray-500">
                              {formatDate(mant.fecha_solicitud)}
                            </span>
                          </div>
                          {mant.activo && (
                            <div className="mb-2">
                              <span className="text-xs px-3 py-1 bg-white dark:bg-gray-900 rounded-full border border-gray-200 dark:border-gray-700 font-mono">
                                {mant.activo.codigo_etiqueta}
                              </span>
                              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                                {mant.activo.nombre}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>

                      <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                        {mant.descripcion_falla}
                      </p>

                      <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-700">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                          <span className="text-xs text-gray-600 dark:text-gray-400">
                            {mant.tecnico_asignado || 'Sin técnico asignado'}
                          </span>
                        </div>
                        <div className="text-xs font-bold text-gray-900 dark:text-white">
                          ${mant.costo_reparacion.toLocaleString('es-MX', {
                            minimumFractionDigits: 2,
                          })}
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </motion.div>
          </div>

          {/* Estadísticas de Depreciación */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white dark:bg-[#1a1a1a] rounded-2xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.5)] p-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-500/20 rounded-2xl flex items-center justify-center">
                <TrendingDown className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white">Registro de Depreciación</h3>
                <p className="text-sm text-gray-500 dark:text-gray-500">
                  Últimos cálculos de depreciación lineal
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {mockDB.logsDepreciacion.map((log, index) => {
                const activo = mockDB.activos.find(a => a.id === log.activo_id);
                return (
                  <motion.div
                    key={log.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 + index * 0.05 }}
                    className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-mono px-3 py-1 bg-white dark:bg-gray-900 rounded-full border border-gray-200 dark:border-gray-700">
                        {activo?.codigo_etiqueta}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-500">
                        {formatDate(log.fecha_calculo)}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-500 mb-1">Anterior</p>
                        <p className="text-sm font-bold text-gray-900 dark:text-white">
                          ${log.valor_anterior.toLocaleString('es-MX')}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-red-600 dark:text-red-400 mb-1">Depreciado</p>
                        <p className="text-sm font-bold text-red-700 dark:text-red-400">
                          -${log.monto_depreciado.toLocaleString('es-MX')}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-500 mb-1">Nuevo</p>
                        <p className="text-sm font-bold text-emerald-700 dark:text-emerald-400">
                          ${log.valor_nuevo.toLocaleString('es-MX')}
                        </p>
                      </div>
                    </div>

                    <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        Método: {log.metodo_usado.replace(/_/g, ' ')}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </div>
      </div>
    </main>
  );
}