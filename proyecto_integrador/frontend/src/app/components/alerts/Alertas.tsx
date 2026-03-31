import { motion } from 'motion/react';
import { AlertTriangle, Bell, TrendingDown, CheckCircle, Clock, Wrench } from 'lucide-react';
import { mockDB } from '../../data/mockData';
import { TipoAlerta } from '../../data/types';

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



export function Alertas() {
  const alertasNoLeidas = alertasEnriquecidas.filter(a => !a.leida);

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


  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <main className="pl-6 transition-[padding] duration-300 lg:pl-[var(--content-padding,20rem)] pt-6 lg:pt-8 pb-12 px-6 pr-6 lg:pr-12">
      <div className="max-w-[1400px] mx-auto">
        <div className="space-y-6">
          {/* Header */}
          <div className="mb-8 mt-6">
            <h1 className="text-3xl font-bold mb-2 dark:text-white">Alertas del Sistema</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Monitoreo del estatus y ciclo de vida de los activos
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6">
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