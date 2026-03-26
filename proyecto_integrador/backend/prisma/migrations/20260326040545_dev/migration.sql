-- CreateTable
CREATE TABLE "estados_auditoria_programada" (
    "id" SERIAL NOT NULL,
    "nombre" VARCHAR(50) NOT NULL,
    "descripcion" TEXT,

    CONSTRAINT "estados_auditoria_programada_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "auditorias_programadas" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "titulo" VARCHAR(255) NOT NULL,
    "descripcion" TEXT,
    "fecha_programada" TIMESTAMPTZ(6) NOT NULL,
    "fecha_inicio" TIMESTAMPTZ(6),
    "fecha_fin" TIMESTAMPTZ(6),
    "estado_id" SMALLINT NOT NULL,
    "auditor_id" UUID NOT NULL,
    "oficina_id" UUID,
    "estante_id" UUID,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "auditorias_programadas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "activos" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "codigo_etiqueta" TEXT,
    "categoria_id" UUID NOT NULL,
    "custodio_actual_id" UUID,
    "oficina_id" UUID,
    "estante_id" UUID,
    "especificaciones" JSONB DEFAULT '{}',
    "estado_operativo_id" SMALLINT NOT NULL DEFAULT 1,
    "foto_principal_url" TEXT,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "nombre" VARCHAR(255),

    CONSTRAINT "activos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "almacenes" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "nombre" VARCHAR(100) NOT NULL,
    "sede_id" UUID NOT NULL,

    CONSTRAINT "almacenes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bajas_activos" (
    "activo_id" UUID NOT NULL,
    "usuario_autoriza_id" UUID NOT NULL,
    "motivo_baja" VARCHAR(50) NOT NULL,
    "fecha_baja" DATE NOT NULL DEFAULT CURRENT_DATE,
    "monto_recuperado" DECIMAL(12,2) DEFAULT 0.00,
    "documento_respaldo_url" TEXT,
    "comentarios" TEXT,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "bajas_activos_pkey" PRIMARY KEY ("activo_id")
);

-- CreateTable
CREATE TABLE "calles" (
    "id" SERIAL NOT NULL,
    "nombre" VARCHAR(150) NOT NULL,
    "colonia_id" INTEGER NOT NULL,

    CONSTRAINT "calles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "categorias" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "nombre" TEXT NOT NULL,
    "tipo_rastreo" VARCHAR(20) NOT NULL DEFAULT 'FIJO',
    "vida_util_anios" INTEGER NOT NULL,
    "porcentaje_depreciacion" DECIMAL(5,2),

    CONSTRAINT "categorias_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "colonias" (
    "id" SERIAL NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,
    "codigo_postal" VARCHAR(10),
    "municipio_id" INTEGER NOT NULL,

    CONSTRAINT "colonias_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "datos_financieros" (
    "activo_id" UUID NOT NULL,
    "proveedor_id" UUID,
    "costo_adquisicion" DECIMAL(12,2) NOT NULL,
    "valor_libro_actual" DECIMAL(12,2) NOT NULL,
    "fecha_compra" DATE NOT NULL,
    "fin_garantia" DATE,

    CONSTRAINT "datos_financieros_pkey" PRIMARY KEY ("activo_id")
);

-- CreateTable
CREATE TABLE "direcciones" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "numero_exterior" VARCHAR(20) NOT NULL,
    "numero_interior" VARCHAR(20),
    "calle_id" INTEGER NOT NULL,

    CONSTRAINT "direcciones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "edificios" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "nombre" VARCHAR(100) NOT NULL,
    "sede_id" UUID NOT NULL,

    CONSTRAINT "edificios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "estados_activo" (
    "id" SMALLINT NOT NULL,
    "nombre" VARCHAR(50) NOT NULL,
    "descripcion" TEXT NOT NULL,

    CONSTRAINT "estados_activo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "estados_auditoria" (
    "id" SMALLINT NOT NULL,
    "nombre" VARCHAR(50) NOT NULL,
    "descripcion" TEXT NOT NULL,

    CONSTRAINT "estados_auditoria_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "estados_rep" (
    "id" SERIAL NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,
    "pais_id" SMALLINT NOT NULL,

    CONSTRAINT "estados_rep_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "estantes" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "nombre" VARCHAR(50) NOT NULL,
    "pasillo_id" UUID NOT NULL,

    CONSTRAINT "estantes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "logs_auditoria" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "activo_id" UUID NOT NULL,
    "auditor_id" UUID NOT NULL,
    "fecha_hora" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "coordenadas_gps" geography,
    "estado_reportado_id" SMALLINT NOT NULL,
    "comentarios" TEXT,

    CONSTRAINT "logs_auditoria_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "logs_depreciacion" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "activo_id" UUID NOT NULL,
    "fecha_calculo" DATE NOT NULL DEFAULT CURRENT_DATE,
    "valor_anterior" DECIMAL(12,2) NOT NULL,
    "monto_depreciado" DECIMAL(12,2) NOT NULL,
    "valor_nuevo" DECIMAL(12,2) NOT NULL,
    "metodo_usado" VARCHAR(50) DEFAULT 'LINEA_RECTA',

    CONSTRAINT "logs_depreciacion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "movimientos_activos" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "activo_id" UUID NOT NULL,
    "custodio_anterior_id" UUID,
    "oficina_anterior_id" UUID,
    "estante_anterior_id" UUID,
    "custodio_nuevo_id" UUID,
    "oficina_nueva_id" UUID,
    "estante_nuevo_id" UUID,
    "fecha_movimiento" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "estado_anterior_id" SMALLINT,
    "estado_nuevo_id" SMALLINT,

    CONSTRAINT "movimientos_activos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "municipios" (
    "id" SERIAL NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,
    "estado_id" INTEGER NOT NULL,

    CONSTRAINT "municipios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "oficinas" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "nombre" VARCHAR(100) NOT NULL,
    "piso_id" UUID NOT NULL,

    CONSTRAINT "oficinas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "paises" (
    "id" SMALLSERIAL NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,

    CONSTRAINT "paises_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pasillos" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "nombre" VARCHAR(50) NOT NULL,
    "almacen_id" UUID NOT NULL,

    CONSTRAINT "pasillos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pisos" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "nombre" VARCHAR(50) NOT NULL,
    "edificio_id" UUID NOT NULL,

    CONSTRAINT "pisos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "proveedores" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "razon_social" TEXT NOT NULL,
    "rfc_tax_id" TEXT,
    "contacto_soporte" TEXT,
    "direccion_fiscal" TEXT,
    "sitio_web" VARCHAR(255),
    "estado" BOOLEAN NOT NULL,

    CONSTRAINT "proveedores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "roles_usuario" (
    "id" SMALLINT NOT NULL,
    "nombre" VARCHAR(50) NOT NULL,
    "descripcion" TEXT NOT NULL,

    CONSTRAINT "roles_usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sedes" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "nombre" VARCHAR(100) NOT NULL,
    "direccion_id" UUID,

    CONSTRAINT "sedes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "usuarios" (
    "id" UUID NOT NULL DEFAULT auth.uid(),
    "nombres" TEXT NOT NULL,
    "apellido_paterno" TEXT NOT NULL,
    "apellido_materno" TEXT,
    "nombre_completo" TEXT DEFAULT TRIM(BOTH FROM (((nombres || ' '::text) || apellido_paterno) || COALESCE((' '::text || apellido_materno), ''::text))),
    "email" TEXT NOT NULL,
    "rol_id" SMALLINT NOT NULL DEFAULT 3,
    "activo" BOOLEAN DEFAULT true,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "foto_perfil_url" VARCHAR(500),
    "departamento_id" SMALLINT,
    "telefono" VARCHAR(20),

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notificaciones" (
    "id" TEXT NOT NULL,
    "usuario_id" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "mensaje" TEXT NOT NULL,
    "leida" BOOLEAN NOT NULL DEFAULT false,
    "accion_url" TEXT,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notificaciones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "departamentos" (
    "id" SMALLSERIAL NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,
    "descripcion" TEXT,

    CONSTRAINT "departamentos_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "estados_auditoria_programada_nombre_key" ON "estados_auditoria_programada"("nombre");

-- CreateIndex
CREATE INDEX "idx_auditorias_estado" ON "auditorias_programadas"("estado_id");

-- CreateIndex
CREATE INDEX "idx_auditorias_auditor" ON "auditorias_programadas"("auditor_id");

-- CreateIndex
CREATE INDEX "idx_auditorias_oficina" ON "auditorias_programadas"("oficina_id");

-- CreateIndex
CREATE INDEX "idx_auditorias_estante" ON "auditorias_programadas"("estante_id");

-- CreateIndex
CREATE UNIQUE INDEX "activos_codigo_etiqueta_key" ON "activos"("codigo_etiqueta");

-- CreateIndex
CREATE INDEX "idx_activos_custodio" ON "activos"("custodio_actual_id");

-- CreateIndex
CREATE INDEX "idx_activos_estante" ON "activos"("estante_id");

-- CreateIndex
CREATE INDEX "idx_activos_etiqueta" ON "activos"("codigo_etiqueta");

-- CreateIndex
CREATE INDEX "idx_activos_oficina" ON "activos"("oficina_id");

-- CreateIndex
CREATE INDEX "idx_activos_specs" ON "activos" USING GIN ("especificaciones");

-- CreateIndex
CREATE UNIQUE INDEX "estados_activo_nombre_key" ON "estados_activo"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "estados_auditoria_nombre_key" ON "estados_auditoria"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "logs_depreciacion_activo_id_fecha_calculo_key" ON "logs_depreciacion"("activo_id", "fecha_calculo");

-- CreateIndex
CREATE INDEX "idx_movimientos_activo" ON "movimientos_activos"("activo_id");

-- CreateIndex
CREATE UNIQUE INDEX "paises_nombre_key" ON "paises"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "roles_usuario_nombre_key" ON "roles_usuario"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_email_key" ON "usuarios"("email");

-- CreateIndex
CREATE UNIQUE INDEX "departamentos_nombre_key" ON "departamentos"("nombre");

-- AddForeignKey
ALTER TABLE "auditorias_programadas" ADD CONSTRAINT "auditorias_programadas_estado_id_fkey" FOREIGN KEY ("estado_id") REFERENCES "estados_auditoria_programada"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "auditorias_programadas" ADD CONSTRAINT "auditorias_programadas_auditor_id_fkey" FOREIGN KEY ("auditor_id") REFERENCES "usuarios"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "auditorias_programadas" ADD CONSTRAINT "auditorias_programadas_oficina_id_fkey" FOREIGN KEY ("oficina_id") REFERENCES "oficinas"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "auditorias_programadas" ADD CONSTRAINT "auditorias_programadas_estante_id_fkey" FOREIGN KEY ("estante_id") REFERENCES "estantes"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "activos" ADD CONSTRAINT "activos_categoria_id_fkey" FOREIGN KEY ("categoria_id") REFERENCES "categorias"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "activos" ADD CONSTRAINT "activos_custodio_actual_id_fkey" FOREIGN KEY ("custodio_actual_id") REFERENCES "usuarios"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "activos" ADD CONSTRAINT "activos_estado_operativo_id_fkey" FOREIGN KEY ("estado_operativo_id") REFERENCES "estados_activo"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "activos" ADD CONSTRAINT "activos_estante_id_fkey" FOREIGN KEY ("estante_id") REFERENCES "estantes"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "activos" ADD CONSTRAINT "activos_oficina_id_fkey" FOREIGN KEY ("oficina_id") REFERENCES "oficinas"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "almacenes" ADD CONSTRAINT "almacenes_sede_id_fkey" FOREIGN KEY ("sede_id") REFERENCES "sedes"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "bajas_activos" ADD CONSTRAINT "bajas_activos_activo_id_fkey" FOREIGN KEY ("activo_id") REFERENCES "activos"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "bajas_activos" ADD CONSTRAINT "bajas_activos_usuario_autoriza_id_fkey" FOREIGN KEY ("usuario_autoriza_id") REFERENCES "usuarios"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "calles" ADD CONSTRAINT "calles_colonia_id_fkey" FOREIGN KEY ("colonia_id") REFERENCES "colonias"("id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "colonias" ADD CONSTRAINT "colonias_municipio_id_fkey" FOREIGN KEY ("municipio_id") REFERENCES "municipios"("id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "datos_financieros" ADD CONSTRAINT "datos_financieros_activo_id_fkey" FOREIGN KEY ("activo_id") REFERENCES "activos"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "datos_financieros" ADD CONSTRAINT "datos_financieros_proveedor_id_fkey" FOREIGN KEY ("proveedor_id") REFERENCES "proveedores"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "direcciones" ADD CONSTRAINT "direcciones_calle_id_fkey" FOREIGN KEY ("calle_id") REFERENCES "calles"("id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "edificios" ADD CONSTRAINT "edificios_sede_id_fkey" FOREIGN KEY ("sede_id") REFERENCES "sedes"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "estados_rep" ADD CONSTRAINT "estados_rep_pais_id_fkey" FOREIGN KEY ("pais_id") REFERENCES "paises"("id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "estantes" ADD CONSTRAINT "estantes_pasillo_id_fkey" FOREIGN KEY ("pasillo_id") REFERENCES "pasillos"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "logs_auditoria" ADD CONSTRAINT "logs_auditoria_activo_id_fkey" FOREIGN KEY ("activo_id") REFERENCES "activos"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "logs_auditoria" ADD CONSTRAINT "logs_auditoria_auditor_id_fkey" FOREIGN KEY ("auditor_id") REFERENCES "usuarios"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "logs_auditoria" ADD CONSTRAINT "logs_auditoria_estado_reportado_id_fkey" FOREIGN KEY ("estado_reportado_id") REFERENCES "estados_auditoria"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "logs_depreciacion" ADD CONSTRAINT "logs_depreciacion_activo_id_fkey" FOREIGN KEY ("activo_id") REFERENCES "activos"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "movimientos_activos" ADD CONSTRAINT "movimientos_activos_activo_id_fkey" FOREIGN KEY ("activo_id") REFERENCES "activos"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "movimientos_activos" ADD CONSTRAINT "movimientos_activos_custodio_anterior_id_fkey" FOREIGN KEY ("custodio_anterior_id") REFERENCES "usuarios"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "movimientos_activos" ADD CONSTRAINT "movimientos_activos_custodio_nuevo_id_fkey" FOREIGN KEY ("custodio_nuevo_id") REFERENCES "usuarios"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "movimientos_activos" ADD CONSTRAINT "movimientos_activos_estado_anterior_id_fkey" FOREIGN KEY ("estado_anterior_id") REFERENCES "estados_activo"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "movimientos_activos" ADD CONSTRAINT "movimientos_activos_estado_nuevo_id_fkey" FOREIGN KEY ("estado_nuevo_id") REFERENCES "estados_activo"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "movimientos_activos" ADD CONSTRAINT "movimientos_activos_estante_anterior_id_fkey" FOREIGN KEY ("estante_anterior_id") REFERENCES "estantes"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "movimientos_activos" ADD CONSTRAINT "movimientos_activos_estante_nuevo_id_fkey" FOREIGN KEY ("estante_nuevo_id") REFERENCES "estantes"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "movimientos_activos" ADD CONSTRAINT "movimientos_activos_oficina_anterior_id_fkey" FOREIGN KEY ("oficina_anterior_id") REFERENCES "oficinas"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "movimientos_activos" ADD CONSTRAINT "movimientos_activos_oficina_nueva_id_fkey" FOREIGN KEY ("oficina_nueva_id") REFERENCES "oficinas"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "municipios" ADD CONSTRAINT "municipios_estado_id_fkey" FOREIGN KEY ("estado_id") REFERENCES "estados_rep"("id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "oficinas" ADD CONSTRAINT "oficinas_piso_id_fkey" FOREIGN KEY ("piso_id") REFERENCES "pisos"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "pasillos" ADD CONSTRAINT "pasillos_almacen_id_fkey" FOREIGN KEY ("almacen_id") REFERENCES "almacenes"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "pisos" ADD CONSTRAINT "pisos_edificio_id_fkey" FOREIGN KEY ("edificio_id") REFERENCES "edificios"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "sedes" ADD CONSTRAINT "sedes_direccion_id_fkey" FOREIGN KEY ("direccion_id") REFERENCES "direcciones"("id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "usuarios" ADD CONSTRAINT "usuarios_departamento_id_fkey" FOREIGN KEY ("departamento_id") REFERENCES "departamentos"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "usuarios" ADD CONSTRAINT "usuarios_rol_id_fkey" FOREIGN KEY ("rol_id") REFERENCES "roles_usuario"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
