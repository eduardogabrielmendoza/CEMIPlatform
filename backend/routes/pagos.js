import express from "express";
import pool from "../utils/db.js";
import { body, param, validationResult } from "express-validator";
import eventLogger from "../utils/eventLogger.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const { archivo } = req.query; // archivo=true para pagos archivados
    
    const filtroArchivo = archivo === 'true' 
      ? "AND pa.archivado = 1" 
      : "AND pa.archivado = 0";
    
    const filtroEstado = archivo === 'true'
      ? "AND pa.estado_pago = 'anulado'"
      : "";
    
    const [rows] = await pool.query(`
      SELECT 
        pa.id_pago,
        pa.id_alumno,
        CONCAT(p.nombre, ' ', p.apellido) AS alumno,
        a.legajo,
        cp.descripcion AS concepto,
        mp.descripcion AS medio_pago,
        pa.monto,
        pa.fecha_pago,
        pa.periodo,
        pa.fecha_vencimiento,
        pa.estado_pago,
        pa.archivado,
        ad.cargo AS administrativo,
        CASE
          WHEN pa.fecha_pago IS NULL AND pa.fecha_vencimiento < CURDATE() THEN 'mora'
          WHEN pa.fecha_pago IS NULL AND DATEDIFF(pa.fecha_vencimiento, CURDATE()) <= 5 THEN 'proximo_vencimiento'
          WHEN pa.fecha_pago IS NOT NULL THEN 'pagado'
          ELSE 'al_dia'
        END AS estado_visual
      FROM pagos pa
      JOIN alumnos a ON pa.id_alumno = a.id_alumno
      JOIN personas p ON a.id_persona = p.id_persona
      JOIN conceptos_pago cp ON pa.id_concepto = cp.id_concepto
      JOIN medios_pago mp ON pa.id_medio_pago = mp.id_medio_pago
      LEFT JOIN administrativos ad ON pa.id_administrativo = ad.id_administrativo
      WHERE 1=1 ${filtroArchivo} ${filtroEstado}
      ORDER BY pa.fecha_pago DESC, pa.fecha_vencimiento DESC
    `);

    const mesActual = new Date().toISOString().slice(0, 7); // Formato: YYYY-MM
    
    const [totalMes] = await pool.query(`
      SELECT COALESCE(SUM(monto), 0) AS total
      FROM pagos
      WHERE DATE_FORMAT(fecha_pago, '%Y-%m') = ?
        AND estado_pago = 'pagado'
        AND archivado = 0
    `, [mesActual]);

    const [cuotasCobradas] = await pool.query(`
      SELECT COUNT(*) AS total
      FROM pagos
      WHERE DATE_FORMAT(fecha_pago, '%Y-%m') = ?
        AND estado_pago = 'pagado'
        AND archivado = 0
    `, [mesActual]);

    const [cuotasPendientes] = await pool.query(`
      SELECT COUNT(*) AS total
      FROM pagos
      WHERE estado_pago = 'en_proceso'
        AND archivado = 0
    `);

    const [promedio] = await pool.query(`
      SELECT COALESCE(AVG(monto), 0) AS promedio
      FROM pagos
      WHERE estado_pago = 'pagado'
        AND archivado = 0
    `);

    const stats = {
      total_mes: totalMes[0].total,
      cuotas_cobradas: cuotasCobradas[0].total,
      cuotas_pendientes: cuotasPendientes[0].total,
      promedio_pago: promedio[0].promedio
    };

    res.json({
      pagos: rows,
      estadisticas: stats
    });
  } catch (error) {
    console.error("Error al obtener pagos:", error);
    console.error("Error completo:", error.message);
    console.error("Stack:", error.stack);
    res.status(500).json({ 
      message: "Error al obtener pagos",
      error: error.message,
      hint: "Si el error menciona 'archivado', ejecuta el script SQL: backend/sql/agregar_campo_archivado.sql"
    });
  }
});

router.get("/alumno/:id", async (req, res) => {
  try {
    const { id } = req.params;

    console.log(`[pagos] Consultando pagos para alumno ID: ${id}`);

    const [cursosActivos] = await pool.query(`
      SELECT 
        c.id_curso,
        c.nombre_curso,
        c.cuotas_habilitadas,
        i.nombre_idioma,
        n.descripcion AS nivel,
        CONCAT(prof_p.nombre, ' ', prof_p.apellido) AS profesor,
        15000 AS costo_mensual,
        insc.fecha_inscripcion
      FROM inscripciones insc
      JOIN cursos c ON insc.id_curso = c.id_curso
      JOIN idiomas i ON c.id_idioma = i.id_idioma
      JOIN niveles n ON c.id_nivel = n.id_nivel
      JOIN profesores prof ON c.id_profesor = prof.id_profesor
      JOIN personas prof_p ON prof.id_persona = prof_p.id_persona
      WHERE insc.id_alumno = ? AND insc.estado = 'activo'
      ORDER BY c.nombre_curso
    `, [id]);

    console.log(`[pagos] Cursos activos encontrados: ${cursosActivos.length}`);

    const todosMesesAcademicos = [
      'Matricula', 'Marzo', 'Abril', 'Mayo', 'Junio', 
      'Julio', 'Agosto', 'Septiembre', 
      'Octubre', 'Noviembre'
    ];

    const cursosPagos = await Promise.all(cursosActivos.map(async (curso) => {
      
      let cuotasHabilitadas;
      const rawCuotas = curso.cuotas_habilitadas;
      
      if (rawCuotas === null || rawCuotas === undefined) {
        cuotasHabilitadas = todosMesesAcademicos;
      } else if (typeof rawCuotas === 'object' && Array.isArray(rawCuotas)) {
        cuotasHabilitadas = rawCuotas;
      } else {
        try {
          cuotasHabilitadas = JSON.parse(rawCuotas);
        } catch (error) {
          try {
            const jsonString = rawCuotas.replace(/'/g, '"');
            cuotasHabilitadas = JSON.parse(jsonString);
          } catch (error2) {
            console.error('[pagos] Error parseando cuotas_habilitadas:', rawCuotas);
            cuotasHabilitadas = todosMesesAcademicos;
          }
        }
      }

      console.log(`[pagos] Curso ${curso.id_curso} - Cuotas habilitadas:`, cuotasHabilitadas);

      const mesesAcademicos = todosMesesAcademicos.filter(mes => 
        cuotasHabilitadas.includes(mes)
      );

      console.log(`[pagos] Meses disponibles para alumno:`, mesesAcademicos);
      
      const [pagosRealizados] = await pool.query(`
        SELECT 
          pa.id_pago,
          pa.mes_cuota,
          pa.monto,
          pa.fecha_pago,
          pa.detalle_pago
        FROM pagos pa
        WHERE pa.id_alumno = ? AND pa.id_curso = ? AND pa.estado_pago != 'anulado'
        ORDER BY pa.fecha_pago DESC
      `, [id, curso.id_curso]);

      console.log(`[GET PAGOS] Curso ${curso.id_curso} - Pagos encontrados:`, pagosRealizados.map(p => ({mes: p.mes_cuota, id: p.id_pago})));

      const estadoMeses = mesesAcademicos.map((mes, index) => {
        const pago = pagosRealizados.find(p => p.mes_cuota === mes);
        
        if (pago) {
          console.log(`[MATCH] Mes "${mes}" encontrado en pagos como "${pago.mes_cuota}"`);
          return {
            mes,
            estado: 'pagado',
            fecha_pago: pago.fecha_pago,
            monto: pago.monto,
            id_pago: pago.id_pago
          };
        } else {
          const hoy = new Date();
          const mesActual = hoy.getMonth(); // 0-11
          
          if (index === 0 && mes === 'Matricula') {
            return {
              mes,
              estado: 'impago',
              fecha_pago: null,
              monto: curso.costo_mensual,
              id_pago: null
            };
          }
          
          const mesAcademicoActual = mesActual - 2; // Marzo = 0, Abril = 1, etc.
          const indexMesReal = index - 1; // Ajustar por Matricula
          
          let estado = 'pendiente';
          if (indexMesReal < mesAcademicoActual) {
            estado = 'impago';
          } else if (indexMesReal === mesAcademicoActual) {
            estado = 'pendiente';
          } else {
            estado = 'proximo';
          }

          return {
            mes,
            estado,
            fecha_pago: null,
            monto: curso.costo_mensual,
            id_pago: null
          };
        }
      });

      const cuotasPagadas = estadoMeses.filter(m => m.estado === 'pagado').length;
      const cuotasImpagas = estadoMeses.filter(m => m.estado === 'impago').length;
      const cuotasPendientes = estadoMeses.filter(m => m.estado === 'pendiente').length;
      const totalPagado = pagosRealizados.reduce((sum, p) => sum + parseFloat(p.monto || 0), 0);

      return {
        id_curso: curso.id_curso,
        nombre_curso: `${curso.nombre_idioma} - ${curso.nivel}`,
        profesor: curso.profesor,
        costo_mensual: curso.costo_mensual,
        meses: estadoMeses,
        estadisticas: {
          cuotas_pagadas: cuotasPagadas,
          cuotas_impagas: cuotasImpagas,
          cuotas_pendientes: cuotasPendientes,
          total_pagado: totalPagado,
          total_pendiente: (10 - cuotasPagadas) * parseFloat(curso.costo_mensual) // 10 = Matricula + 9 meses
        }
      };
    }));

    const totalGlobalPagado = cursosPagos.reduce((sum, c) => sum + c.estadisticas.total_pagado, 0);
    const totalGlobalPendiente = cursosPagos.reduce((sum, c) => sum + c.estadisticas.total_pendiente, 0);
    const totalCuotasImpagas = cursosPagos.reduce((sum, c) => sum + c.estadisticas.cuotas_impagas, 0);

    res.json({
      cursos: cursosPagos,
      estadisticas_globales: {
        total_pagado: totalGlobalPagado,
        total_pendiente: totalGlobalPendiente,
        total_cursos: cursosPagos.length,
        cuotas_impagas: totalCuotasImpagas
      }
    });
  } catch (error) {
    console.error("Error al obtener pagos del alumno:", error);
    res.status(500).json({ 
      message: "Error al obtener pagos del alumno",
      error: error.message 
    });
  }
});

router.get("/alumno/:id/historial", async (req, res) => {
  try {
    const { id } = req.params;

    const [pagosRealizados] = await pool.query(`
      SELECT 
        pa.id_pago,
        pa.mes_cuota AS concepto,
        pa.monto,
        pa.fecha_pago,
        pa.periodo,
        mp.descripcion AS medio_pago,
        c.nombre_curso AS curso
      FROM pagos pa
      JOIN cursos c ON pa.id_curso = c.id_curso
      JOIN medios_pago mp ON pa.id_medio_pago = mp.id_medio_pago
      WHERE pa.id_alumno = ? AND pa.estado_pago != 'anulado'
      ORDER BY pa.fecha_pago DESC
    `, [id]);

    const totalPagado = pagosRealizados.reduce((sum, p) => sum + parseFloat(p.monto || 0), 0);
    const cantidadPagos = pagosRealizados.length;

    const [pagosPendientes] = await pool.query(`
      SELECT COUNT(*) as count
      FROM inscripciones insc
      JOIN cursos c ON insc.id_curso = c.id_curso
      WHERE insc.id_alumno = ? AND insc.estado = 'activo'
    `, [id]);

    res.json({
      pagos_realizados: pagosRealizados,
      estadisticas: {
        total_pagado: totalPagado,
        cantidad_pagos: cantidadPagos
      },
      pagos_pendientes: []
    });
  } catch (error) {
    console.error("Error al obtener historial de pagos:", error);
    res.status(500).json({ 
      message: "Error al obtener historial de pagos",
      error: error.message 
    });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await pool.query(`
      SELECT 
        pa.id_pago,
        pa.id_alumno,
        CONCAT(p.nombre, ' ', p.apellido) AS alumno,
        a.legajo,
        p.dni,
        cp.descripcion AS concepto,
        mp.descripcion AS medio_pago,
        pa.monto,
        pa.fecha_pago,
        pa.periodo,
        pa.mes_cuota,
        pa.fecha_vencimiento,
        pa.estado_pago,
        c.nombre_curso AS curso,
        ad.cargo AS administrativo
      FROM pagos pa
      JOIN alumnos a ON pa.id_alumno = a.id_alumno
      JOIN personas p ON a.id_persona = p.id_persona
      JOIN conceptos_pago cp ON pa.id_concepto = cp.id_concepto
      JOIN medios_pago mp ON pa.id_medio_pago = mp.id_medio_pago
      LEFT JOIN cursos c ON pa.id_curso = c.id_curso
      LEFT JOIN administrativos ad ON pa.id_administrativo = ad.id_administrativo
      WHERE pa.id_pago = ?
    `, [id]);

    if (rows.length === 0) {
      return res.status(404).json({ 
        message: "Pago no encontrado" 
      });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error("Error al obtener pago:", error);
    res.status(500).json({ 
      message: "Error al obtener pago",
      error: error.message 
    });
  }
});

router.post("/realizar",
  [
    body('id_alumno')
      .isInt({ min: 1 }).withMessage('ID de alumno inválido')
      .toInt(),
    body('id_curso')
      .isInt({ min: 1 }).withMessage('ID de curso inválido')
      .toInt(),
    body('mes_cuota')
      .isIn(['Matricula', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre'])
      .withMessage('Mes de cuota inválido'),
    body('monto')
      .isFloat({ min: 0.01 }).withMessage('Monto debe ser mayor a 0')
      .toFloat(),
    body('medio_pago')
      .isString().withMessage('Medio de pago inválido')
  ],
  async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      success: false, 
      message: errors.array()[0].msg 
    });
  }

  try {
    const { id_alumno, id_curso, mes_cuota, monto, medio_pago } = req.body;

    const [pagoExistente] = await pool.query(
      'SELECT id_pago FROM pagos WHERE id_alumno = ? AND id_curso = ? AND mes_cuota = ? AND estado_pago != ?',
      [id_alumno, id_curso, mes_cuota, 'anulado']
    );

    if (pagoExistente.length > 0) {
      return res.status(400).json({ 
        success: false,
        message: "Ya existe un pago registrado para este mes en este curso" 
      });
    }

    const [cursoInfo] = await pool.query(`
      SELECT c.nombre_curso, i.nombre_idioma AS idioma, n.descripcion AS nivel
      FROM cursos c
      JOIN idiomas i ON c.id_idioma = i.id_idioma
      JOIN niveles n ON c.id_nivel = n.id_nivel
      WHERE c.id_curso = ?
    `, [id_curso]);

    if (cursoInfo.length === 0) {
      return res.status(400).json({ 
        success: false,
        message: "Curso no encontrado" 
      });
    }

    const [medios] = await pool.query(
      'SELECT id_medio_pago FROM medios_pago WHERE descripcion = ?',
      [medio_pago]
    );

    if (medios.length === 0) {
      return res.status(400).json({ 
        success: false,
        message: "Medio de pago no válido" 
      });
    }

    const id_medio_pago = medios[0].id_medio_pago;

    const id_concepto = mes_cuota === 'Matricula' ? 1 : 2;

    const detalle_pago = mes_cuota === 'Matricula' 
      ? `Matricula - ${cursoInfo[0].idioma} ${cursoInfo[0].nivel}`
      : `Cuota ${mes_cuota} - ${cursoInfo[0].idioma} ${cursoInfo[0].nivel}`;

    const mesesMap = {
      'Matricula': '02', // Febrero para matricula
      'Marzo': '03', 'Abril': '04', 'Mayo': '05', 'Junio': '06',
      'Julio': '07', 'Agosto': '08', 'Septiembre': '09', 
      'Octubre': '10', 'Noviembre': '11'
    };
    const año = new Date().getFullYear();
    const periodo = `${año}-${mesesMap[mes_cuota]}`;

    console.log(`[PAGO] Registrando - mes_cuota: "${mes_cuota}", concepto ID: ${id_concepto}, detalle: "${detalle_pago}"`);

    const [result] = await pool.query(`
      INSERT INTO pagos 
      (id_alumno, id_curso, id_concepto, id_medio_pago, monto, periodo, detalle_pago, mes_cuota, estado_pago)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'en_proceso')
    `, [id_alumno, id_curso, id_concepto, id_medio_pago, monto, periodo, detalle_pago, mes_cuota]);

    console.log(`[PAGO] Guardado exitosamente con estado 'en_proceso' - ID: ${result.insertId}`);

    // Log del evento
    eventLogger.payments.created('Admin', `Alumno #${id_alumno}`, monto);

    res.json({
      success: true,
      message: "Pago registrado exitosamente",
      id_pago: result.insertId,
      comprobante: {
        numero: `COMP-${String(result.insertId).padStart(8, '0')}`,
        fecha: new Date().toISOString().split('T')[0],
        monto: monto,
        detalle: detalle_pago,
        mes_cuota: mes_cuota
      }
    });
  } catch (error) {
    console.error("Error al registrar pago:", error);
    res.status(500).json({ 
      success: false,
      message: "Error al procesar el pago",
      error: error.message 
    });
  }
});

router.put("/:id/anular",
  [
    param('id')
      .isInt({ min: 1 }).withMessage('ID de pago inválido')
      .toInt()
  ],
  async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      success: false, 
      message: errors.array()[0].msg 
    });
  }
  try {
    const { id } = req.params;

    console.log(`[pagos] Intentando anular pago ID: ${id}`);

    const [pago] = await pool.query('SELECT * FROM pagos WHERE id_pago = ?', [id]);
    
    if (pago.length === 0) {
      console.log(`[pagos] Pago ${id} no encontrado`);
      return res.status(404).json({ 
        success: false,
        message: "Pago no encontrado" 
      });
    }

    await pool.query('UPDATE pagos SET estado_pago = ? WHERE id_pago = ?', ['anulado', id]);

    console.log(`[pagos] Pago ${id} anulado exitosamente`);
    
    // Log del evento
    eventLogger.payments.deleted('Admin', `Pago #${id}`);
    
    res.json({ 
      success: true, 
      message: "Pago anulado correctamente" 
    });
  } catch (error) {
    console.error("Error al anular pago:", error);
    res.status(500).json({ 
      success: false,
      message: "Error al anular pago",
      error: error.message 
    });
  }
});

router.put("/:id/confirmar",
  [
    param('id')
      .isInt({ min: 1 }).withMessage('ID de pago inválido')
      .toInt()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        message: errors.array()[0].msg 
      });
    }

    try {
      const { id } = req.params;

      console.log(`[pagos] Confirmando pago ID: ${id}`);

      const [pago] = await pool.query('SELECT * FROM pagos WHERE id_pago = ?', [id]);
      
      if (pago.length === 0) {
        console.log(`[pagos] Pago ${id} no encontrado`);
        return res.status(404).json({ 
          success: false,
          message: "Pago no encontrado" 
        });
      }

      await pool.query(
        'UPDATE pagos SET estado_pago = ?, fecha_pago = CURDATE() WHERE id_pago = ?', 
        ['pagado', id]
      );

      console.log(`[pagos] Pago ${id} confirmado exitosamente`);
      
      // Log del evento
      eventLogger.payments.confirmed(`Pago #${id}`, pago[0].monto);
      
      res.json({ 
        success: true, 
        message: "Pago confirmado correctamente" 
      });
    } catch (error) {
      console.error("Error al confirmar pago:", error);
      res.status(500).json({ 
        success: false,
        message: "Error al confirmar pago",
        error: error.message 
      });
    }
});

router.put("/:id/archivar", 
  param("id").isInt().withMessage("ID inválido"),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false,
        errors: errors.array() 
      });
    }

    try {
      const { id } = req.params;

      const [pago] = await pool.query(
        'SELECT id_pago, estado_pago FROM pagos WHERE id_pago = ?',
        [id]
      );

      if (pago.length === 0) {
        return res.status(404).json({ 
          success: false,
          message: "Pago no encontrado" 
        });
      }

      if (pago[0].estado_pago !== 'anulado') {
        return res.status(400).json({ 
          success: false,
          message: "Solo se pueden archivar pagos anulados" 
        });
      }

      await pool.query(
        'UPDATE pagos SET archivado = 1 WHERE id_pago = ?', 
        [id]
      );

      console.log(`[pagos] Pago ${id} archivado exitosamente`);
      res.json({ 
        success: true, 
        message: "Pago archivado correctamente" 
      });
    } catch (error) {
      console.error("Error al archivar pago:", error);
      res.status(500).json({ 
        success: false,
        message: "Error al archivar pago",
        error: error.message 
      });
    }
});

router.put("/:id/desarchivar", 
  param("id").isInt().withMessage("ID inválido"),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false,
        errors: errors.array() 
      });
    }

    try {
      const { id } = req.params;

      const [pago] = await pool.query(
        'SELECT id_pago, archivado FROM pagos WHERE id_pago = ?',
        [id]
      );

      if (pago.length === 0) {
        return res.status(404).json({ 
          success: false,
          message: "Pago no encontrado" 
        });
      }

      if (pago[0].archivado !== 1) {
        return res.status(400).json({ 
          success: false,
          message: "Solo se pueden desarchivar pagos archivados" 
        });
      }

      await pool.query(
        'UPDATE pagos SET archivado = 0 WHERE id_pago = ?', 
        [id]
      );

      console.log(`[pagos] Pago ${id} desarchivado exitosamente`);
      res.json({ 
        success: true, 
        message: "Pago devuelto a pagos activos correctamente" 
      });
    } catch (error) {
      console.error("Error al desarchivar pago:", error);
      res.status(500).json({ 
        success: false,
        message: "Error al desarchivar pago",
        error: error.message 
      });
    }
});

router.delete("/:id", 
  param("id").isInt().withMessage("ID inválido"),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false,
        errors: errors.array() 
      });
    }

    try {
      const { id } = req.params;

      const [pago] = await pool.query(
        'SELECT id_pago FROM pagos WHERE id_pago = ?',
        [id]
      );

      if (pago.length === 0) {
        return res.status(404).json({ 
          success: false,
          message: "Pago no encontrado" 
        });
      }

      const [result] = await pool.query('DELETE FROM pagos WHERE id_pago = ?', [id]);

      console.log(`[pagos] Pago ${id} eliminado permanentemente. Rows affected:`, result.affectedRows);
      
      if (result.affectedRows === 0) {
        return res.status(500).json({ 
          success: false,
          message: "No se pudo eliminar el pago" 
        });
      }

      res.json({ 
        success: true, 
        message: "Pago eliminado permanentemente" 
      });
    } catch (error) {
      console.error("Error al eliminar pago:", error);
      res.status(500).json({ 
        success: false,
        message: "Error al eliminar pago",
        error: error.message 
      });
    }
});

export default router;




