import express from "express";
import pool from "../utils/db.js";

const router = express.Router();

router.get("/general", async (req, res) => {
  try {
    const [alumnos] = await pool.query("SELECT COUNT(*) as total FROM Alumnos WHERE estado = 'activo'");
    
    const [profesores] = await pool.query("SELECT COUNT(*) as total FROM Profesores WHERE estado = 'activo'");
    
    const [cursos] = await pool.query("SELECT COUNT(*) as total FROM Cursos");
    
    const [pagos] = await pool.query(`
      SELECT COALESCE(SUM(monto), 0) as total 
      FROM Pagos 
      WHERE MONTH(fecha_pago) = MONTH(CURRENT_DATE()) 
      AND YEAR(fecha_pago) = YEAR(CURRENT_DATE())
      AND estado = 'pagado'
    `);

    res.json({
      totalAlumnos: alumnos[0].total,
      totalProfesores: profesores[0].total,
      totalCursos: cursos[0].total,
      ingresosMes: pagos[0].total || 0
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener estadísticas" });
  }
});

router.get("/ultimos-registros", async (req, res) => {
  try {
    const [rows] = await pool.query(`
      (SELECT 
        p.nombre, 
        p.apellido, 
        'Alumno' as tipo, 
        a.fecha_registro as fecha,
        a.legajo as identificador
      FROM Alumnos a
      JOIN Personas p ON a.id_alumno = p.id_persona
      ORDER BY a.fecha_registro DESC
      LIMIT 3)
      UNION ALL
      (SELECT 
        p.nombre, 
        p.apellido, 
        'Profesor' as tipo, 
        prof.fecha_contratacion as fecha,
        NULL as identificador
      FROM Profesores prof
      JOIN Personas p ON prof.id_profesor = p.id_persona
      ORDER BY prof.fecha_contratacion DESC
      LIMIT 2)
      ORDER BY fecha DESC
      LIMIT 5
    `);
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener últimos registros" });
  }
});

router.get("/ultimos-pagos", async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        pg.id_pago,
        CONCAT(p.nombre, ' ', p.apellido) as alumno,
        pg.monto,
        pg.fecha_pago,
        pg.estado,
        pg.metodo_pago
      FROM Pagos pg
      JOIN Alumnos a ON pg.id_alumno = a.id_alumno
      JOIN Personas p ON a.id_alumno = p.id_persona
      ORDER BY pg.fecha_pago DESC
      LIMIT 5
    `);
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener últimos pagos" });
  }
});

router.get("/ingresos-mensuales", async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        DATE_FORMAT(fecha_pago, '%Y-%m') as mes,
        SUM(monto) as total
      FROM Pagos
      WHERE fecha_pago >= DATE_SUB(CURRENT_DATE(), INTERVAL 6 MONTH)
      AND estado = 'pagado'
      GROUP BY DATE_FORMAT(fecha_pago, '%Y-%m')
      ORDER BY mes ASC
    `);
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener ingresos mensuales" });
  }
});

export default router;


