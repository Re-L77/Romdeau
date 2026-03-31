import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, TrendingDown, ShieldCheck, BarChart3, DollarSign, Loader2, Layers, Calendar } from 'lucide-react';
import { depreciacionApi } from '../../../services/api';

interface FinancialModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'acquisition' | 'bookValue' | 'depreciation' | 'warranties' | null;
  data: any; // summary data that contains totals
}

export function FinancialModal({ isOpen, onClose, type, data: summaryData }: FinancialModalProps) {
  const [detailData, setDetailData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'vigentes' | 'vencidas'>('vigentes');

  useEffect(() => {
    if (isOpen && type) {
      setLoading(true);
      depreciacionApi.getDetalleKpi(type)
        .then(res => {
          // Si axios retorna envoltorio data, usarlo, de lo contrario la respuesta directa
          const payload = res.data ? res.data : res;
          setDetailData(payload);
        })
        .catch(err => console.error("Error fetching detail:", err))
        .finally(() => setLoading(false));
    } else {
      setDetailData(null);
      setActiveTab('vigentes');
    }
  }, [isOpen, type]);

  if (!type || !summaryData) return null;

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(val);

  const configs = {
    acquisition: {
      title: 'Desglose de Adquisición',
      icon: DollarSign,
      color: 'text-blue-600',
      bg: 'bg-blue-50 dark:bg-blue-900/20',
      value: formatCurrency(summaryData.valorTotalAdquisicion),
      details: `${summaryData.totalActivos} activos en total.`
    },
    bookValue: {
      title: 'Desglose de Valor en Libros',
      icon: BarChart3,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50 dark:bg-emerald-900/20',
      value: formatCurrency(summaryData.valorEnLibros),
      details: 'Valor remanente pendiente por depreciar.'
    },
    depreciation: {
      title: 'Desglose de Depreciación',
      icon: TrendingDown,
      color: 'text-red-600',
      bg: 'bg-red-50 dark:bg-red-900/20',
      value: formatCurrency(summaryData.depreciacionAcumulada),
      details: `${summaryData.porcentajeDepreciado}% del valor total depreciado.`
    },
    warranties: {
      title: 'Desglose de Garantías',
      icon: ShieldCheck,
      color: 'text-amber-600',
      bg: 'bg-amber-50 dark:bg-amber-900/20',
      value: `${summaryData.garantias.vigentes} Vigentes`,
      details: `${summaryData.garantias.vencidas} Vencidas registradas.`
    }
  };

  const config = configs[type];

  const renderTableHead = (columns: string[]) => (
    <thead className="bg-gray-50 dark:bg-white/5 sticky top-0 z-10 shadow-sm border-b border-gray-100 dark:border-white/5">
      <tr>
        {columns.map((col, i) => (
          <th key={i} className={`px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 ${col.includes('Valor') || col.includes('Depreciación') || col.includes('%') ? 'text-right' : 'text-left'}`}>
            {col}
          </th>
        ))}
      </tr>
    </thead>
  );

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-4" />
          <p className="text-sm font-bold text-gray-500">Analizando base de datos en tiempo real...</p>
        </div>
      );
    }

    if (!detailData) {
      return (
        <div className="text-center py-20 text-gray-400 font-medium">
          Error al cargar los datos. Intente de nuevo.
        </div>
      );
    }

    if (type === 'acquisition') {
      return (
        <table className="w-full text-left border-collapse min-w-[700px]">
          {renderTableHead(['Código', 'Activo', 'Categoría', 'Fecha Adquisición', 'Valor Adquisición'])}
          <tbody className="divide-y divide-gray-100 dark:divide-white/5">
            {detailData.map((row: any, i: number) => (
              <tr key={i} className="hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors">
                <td className="px-6 py-4">
                  <span className="px-2 py-1 bg-gray-100 dark:bg-white/5 rounded-md text-[10px] font-black text-gray-500">{row.codigo}</span>
                </td>
                <td className="px-6 py-4 text-sm font-bold text-gray-900 dark:text-white">{row.nombre}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2 text-xs font-medium text-gray-500">
                    <Layers className="w-3 h-3 text-gray-400" />
                    {row.categoria}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2 text-xs font-medium text-gray-500">
                    <Calendar className="w-3 h-3 text-gray-400" />
                    {new Date(row.fechaAdquisicion).toLocaleDateString('es-MX')}
                  </div>
                </td>
                <td className="px-6 py-4 text-right text-sm font-bold bg-blue-50/30 dark:bg-blue-900/10 text-blue-700 dark:text-blue-300">
                  {formatCurrency(row.valorAdquisicion)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      );
    }

    if (type === 'bookValue') {
      return (
        <table className="w-full text-left border-collapse min-w-[900px]">
          {renderTableHead(['Activo', 'Valor Adquisición', 'Dep. Acumulada', 'Valor en Libros', '% Depreciado', 'Estado'])}
          <tbody className="divide-y divide-gray-100 dark:divide-white/5">
            {detailData.map((row: any, i: number) => (
              <tr key={i} className="hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors">
                <td className="px-6 py-4 text-sm font-bold text-gray-900 dark:text-white">{row.nombre}</td>
                <td className="px-6 py-4 text-right text-sm font-medium text-gray-600 dark:text-gray-400">
                  {formatCurrency(row.valorAdquisicion)}
                </td>
                <td className="px-6 py-4 text-right text-sm font-medium text-red-500">
                  -{formatCurrency(row.depreciacionAcumulada)}
                </td>
                <td className="px-6 py-4 text-right text-sm font-black bg-emerald-50/50 dark:bg-emerald-900/10 text-emerald-600 dark:text-emerald-400">
                  {formatCurrency(row.valorLibro)}
                </td>
                <td className="px-6 py-4 text-right">
                  <span className="text-xs font-bold text-gray-500">{row.porcentajeDepreciado}%</span>
                </td>
                <td className="px-6 py-4">
                  <span className="px-2 py-1 bg-gray-100 dark:bg-white/5 rounded-md text-[10px] font-black text-gray-500">{row.estado}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      );
    }

    if (type === 'depreciation') {
      return (
        <table className="w-full text-left border-collapse min-w-[800px]">
          {renderTableHead(['Activo', 'Dep. Anual', 'Años Transcurridos', 'Dep. Acumulada', '% Depreciado'])}
          <tbody className="divide-y divide-gray-100 dark:divide-white/5">
            {detailData.map((row: any, i: number) => (
              <tr key={i} className="hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors">
                <td className="px-6 py-4 text-sm font-bold text-gray-900 dark:text-white">{row.nombre}</td>
                <td className="px-6 py-4 text-right text-sm font-medium text-gray-600 dark:text-gray-400">
                  {formatCurrency(row.depreciacionAnual)}
                </td>
                <td className="px-6 py-4 text-right">
                  <span className="px-2 py-1 bg-gray-100 dark:bg-white/5 rounded-md text-[10px] font-black text-gray-500">{row.aniosTranscurridos}</span>
                </td>
                <td className="px-6 py-4 text-right text-sm font-black bg-red-50/30 dark:bg-red-900/10 text-red-600 dark:text-red-400">
                  {formatCurrency(row.depreciacionAcumulada)}
                </td>
                <td className="px-6 py-4 text-right">
                  <span className="text-xs font-bold text-gray-500">{row.porcentajeDepreciado}%</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      );
    }

    if (type === 'warranties') {
      const activeData = activeTab === 'vigentes' ? detailData.vigentes : detailData.vencidas;
      
      return (
        <div>
          <div className="flex items-center gap-2 p-4 bg-white dark:bg-[#1a1a1a] border-b border-gray-100 dark:border-white/5 sticky top-0 z-20">
            <button
              onClick={() => setActiveTab('vigentes')}
              className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-colors ${activeTab === 'vigentes' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400' : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-white/5'}`}
            >
              Vigentes ({detailData.vigentes?.length || 0})
            </button>
            <button
              onClick={() => setActiveTab('vencidas')}
              className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-colors ${activeTab === 'vencidas' ? 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400' : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-white/5'}`}
            >
              Vencidas ({detailData.vencidas?.length || 0})
            </button>
          </div>
          <table className="w-full text-left border-collapse min-w-[700px]">
            {renderTableHead(['Código', 'Activo', 'Categoría', 'Fin de Garantía', 'Estado'])}
            <tbody className="divide-y divide-gray-100 dark:divide-white/5">
              {activeData.map((row: any, i: number) => (
                <tr key={i} className="hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors">
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-gray-100 dark:bg-white/5 rounded-md text-[10px] font-black text-gray-500">{row.codigo}</span>
                  </td>
                  <td className="px-6 py-4 text-sm font-bold text-gray-900 dark:text-white">{row.nombre}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-xs font-medium text-gray-500">
                      <Layers className="w-3 h-3 text-gray-400" />
                      {row.categoria}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-xs font-medium text-gray-500">
                      <Calendar className="w-3 h-3 text-gray-400" />
                      {new Date(row.finGarantia).toLocaleDateString('es-MX')}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-widest ${row.estadoGarantia === 'Vigente' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400' : 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400'}`}>
                      {row.estadoGarantia}
                    </span>
                  </td>
                </tr>
              ))}
              {activeData.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-400 font-medium">
                    No hay activos en esta pestaña.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      );
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className={`relative w-full ${type === 'warranties' ? 'max-w-4xl' : 'max-w-5xl'} bg-white dark:bg-[#1a1a1a] rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]`}
          >
            {/* Modal Header */}
            <div className={`p-8 ${config.bg} border-b border-gray-100 dark:border-white/5 relative shrink-0`}>
              <button
                onClick={onClose}
                className="absolute top-6 right-6 p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
              >
                <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              </button>

              <div className="flex items-center gap-4 mb-4">
                <div className={`w-14 h-14 rounded-2xl bg-white dark:bg-black/20 flex items-center justify-center shadow-sm`}>
                  <config.icon className={`w-8 h-8 ${config.color}`} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{config.title}</h2>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{config.details}</p>
                </div>
              </div>

              <div className="mt-6 flex items-end justify-between">
                <div>
                  <p className="text-sm font-bold text-gray-500 mb-1 uppercase tracking-widest">Total Calculado</p>
                  <p className={`text-4xl font-black ${config.color} tracking-tight`}>
                    {config.value}
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Body / Table */}
            <div className="overflow-auto bg-white dark:bg-[#1a1a1a] grow">
              {renderContent()}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
