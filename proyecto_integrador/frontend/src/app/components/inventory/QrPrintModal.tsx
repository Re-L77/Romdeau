import { motion, AnimatePresence } from "motion/react";
import { Printer, X, Smartphone, Monitor, Armchair, Factory } from "lucide-react";
import { useState, useMemo } from "react";

const QR_SIZES = [
  {
    id: "small",
    name: "Pequeño",
    mm: 30,
    description: "Activos móviles pequeños",
    usage: "Celulares, tablets, herramientas pequeñas, periféricos",
    scanDistance: "10–30 cm",
    icon: Smartphone,
  },
  {
    id: "medium",
    name: "Mediano",
    mm: 50,
    description: "Equipos de oficina",
    usage: "Laptops, impresoras, monitores, CPUs",
    scanDistance: "30–60 cm",
    icon: Monitor,
  },
  {
    id: "large",
    name: "Grande",
    mm: 80,
    description: "Mobiliario y activos fijos",
    usage: "Escritorios, sillas, archiveros, racks",
    scanDistance: "60–100 cm",
    icon: Armchair,
  },
  {
    id: "xlarge",
    name: "Extra Grande",
    mm: 100,
    description: "Maquinaria o activos industriales",
    usage: "Maquinaria, equipos pesados, activos en almacén",
    scanDistance: "~1 m",
    icon: Factory,
  },
] as const;

// Preview pixel sizes for the modal (visual only, not print)
const PREVIEW_PX: Record<string, number> = {
  small: 100,
  medium: 140,
  large: 180,
  xlarge: 210,
};

interface QrPrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  qrDataUrl: string;
  assetLabel: string;
  assetName: string;
}

export function QrPrintModal({
  isOpen,
  onClose,
  qrDataUrl,
  assetLabel,
  assetName,
}: QrPrintModalProps) {
  const [selectedSize, setSelectedSize] = useState<string>("medium");

  const selected = useMemo(
    () => QR_SIZES.find((s) => s.id === selectedSize) ?? QR_SIZES[1],
    [selectedSize],
  );

  const previewPx = PREVIEW_PX[selectedSize] ?? 140;

  // At 300 DPI: 1 mm ≈ 11.81 px
  const printPx = Math.round(selected.mm * 11.81);

  const qrHighRes = useMemo(
    () =>
      qrDataUrl.replace(
        /size=\d+x\d+/,
        `size=${printPx}x${printPx}`,
      ),
    [qrDataUrl, printPx],
  );

  const handlePrint = () => {
    const printWindow = window.open("", "_blank", "width=700,height=900");
    if (!printWindow) return;

    // Print size in mm
    const sizeMM = selected.mm;

    printWindow.document.write(`
      <html>
        <head>
          <title>Etiqueta ${assetLabel}</title>
          <style>
            @page {
              size: A4;
              margin: 10mm;
            }
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body {
              font-family: 'Segoe UI', Arial, sans-serif;
              display: flex;
              justify-content: center;
              align-items: flex-start;
              padding: 12mm;
            }
            .label-container {
              width: ${sizeMM}mm;
              text-align: center;
              border: 0.3mm dashed #ccc;
              padding: 2mm;
            }
            .qr-img {
              width: ${sizeMM - 4}mm;
              height: ${sizeMM - 4}mm;
              image-rendering: pixelated;
            }
            .code {
              margin-top: 1.5mm;
              font-size: ${Math.max(6, Math.round(sizeMM * 0.09))}pt;
              font-weight: bold;
              word-break: break-all;
              line-height: 1.2;
            }
            .name {
              margin-top: 0.8mm;
              font-size: ${Math.max(5, Math.round(sizeMM * 0.07))}pt;
              color: #444;
              line-height: 1.2;
            }
            @media print {
              .label-container { border: none; }
            }
          </style>
        </head>
        <body>
          <div class="label-container">
            <img class="qr-img" src="${qrHighRes}" alt="QR activo" />
            <div class="code">${assetLabel}</div>
            <div class="name">${assetName}</div>
          </div>
        </body>
      </html>
    `);

    printWindow.document.close();

    // Wait for the high-res QR image to load before printing
    const img = printWindow.document.querySelector("img");
    if (img) {
      img.onload = () => {
        printWindow.focus();
        printWindow.print();
      };
      img.onerror = () => {
        printWindow.focus();
        printWindow.print();
      };
    } else {
      printWindow.focus();
      printWindow.print();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="relative bg-white dark:bg-[#1a1a1a] rounded-3xl shadow-2xl dark:shadow-[0_20px_60px_rgb(0,0,0,0.7)] max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center">
                  <Printer className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                </div>
                <div>
                  <h2 className="text-lg font-bold dark:text-white">
                    Imprimir Etiqueta QR
                  </h2>
                  <p className="text-xs text-gray-500 dark:text-gray-500">
                    Selecciona el tamaño de impresión
                  </p>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                <X className="w-4 h-4 dark:text-gray-300" />
              </motion.button>
            </div>

            {/* Body */}
            <div className="p-6">
              {/* Size Selector */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                {QR_SIZES.map((size) => {
                  const SizeIcon = size.icon;
                  const isActive = selectedSize === size.id;
                  return (
                    <motion.button
                      key={size.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setSelectedSize(size.id)}
                      className={`p-4 rounded-2xl border-2 text-left transition-all ${
                        isActive
                          ? "border-black dark:border-white bg-gray-50 dark:bg-gray-800"
                          : "border-gray-200 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-500"
                      }`}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <div
                          className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors ${
                            isActive
                              ? "bg-black dark:bg-white text-white dark:text-black"
                              : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
                          }`}
                        >
                          <SizeIcon className="w-4 h-4" />
                        </div>
                        <div>
                          <p
                            className={`text-sm font-bold ${
                              isActive
                                ? "text-black dark:text-white"
                                : "text-gray-700 dark:text-gray-300"
                            }`}
                          >
                            {size.name}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-500">
                            {size.mm}mm × {size.mm}mm
                          </p>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-500 leading-relaxed">
                        {size.usage}
                      </p>
                      <p className="text-[10px] text-gray-400 dark:text-gray-600 mt-1">
                        Escaneo: {size.scanDistance}
                      </p>
                    </motion.button>
                  );
                })}
              </div>

              {/* Preview */}
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-6 mb-6">
                <p className="text-xs text-gray-500 dark:text-gray-500 mb-4 text-center font-medium uppercase tracking-wide">
                  Vista previa — {selected.name} ({selected.mm}mm × {selected.mm}mm)
                </p>
                <div className="flex justify-center">
                  <motion.div
                    layout
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    className="bg-white p-3 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 text-center"
                    style={{ width: previewPx + 24, minHeight: previewPx + 60 }}
                  >
                    <motion.img
                      layout
                      src={qrDataUrl}
                      alt="QR preview"
                      className="object-contain mx-auto"
                      style={{ width: previewPx, height: previewPx }}
                    />
                    <p
                      className="mt-2 font-bold text-gray-900 break-all leading-tight"
                      style={{ fontSize: Math.max(9, previewPx * 0.08) }}
                    >
                      {assetLabel}
                    </p>
                    <p
                      className="mt-0.5 text-gray-500 leading-tight"
                      style={{ fontSize: Math.max(8, previewPx * 0.065) }}
                    >
                      {assetName}
                    </p>
                  </motion.div>
                </div>
              </div>

              {/* Info bar */}
              <div className="bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-700/30 rounded-2xl p-4 mb-6">
                <p className="text-xs text-blue-700 dark:text-blue-400 leading-relaxed">
                  <span className="font-bold">Resolución de impresión:</span>{" "}
                  {printPx}×{printPx}px a 300 DPI • Formato A4 con márgenes
                  adecuados • Proporción 1:1 garantizada
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center gap-3 p-6 border-t border-gray-100 dark:border-gray-800">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onClose}
                className="flex-1 px-6 py-3 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                Cancelar
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handlePrint}
                className="flex-1 px-6 py-3 bg-black dark:bg-white text-white dark:text-black rounded-full font-medium hover:bg-gray-900 dark:hover:bg-gray-100 transition-colors flex items-center justify-center gap-2"
              >
                <Printer className="w-4 h-4" />
                Imprimir {selected.name} ({selected.mm}mm)
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
