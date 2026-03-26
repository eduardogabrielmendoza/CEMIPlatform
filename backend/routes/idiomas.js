import express from "express";
import pool from "../utils/db.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const { estado } = req.query;
    let where = [];
    let params = [];
    if (estado) { where.push('estado = ?'); params.push(estado); }
    const whereClause = where.length > 0 ? 'WHERE ' + where.join(' AND ') : '';
    const [rows] = await pool.query(`SELECT * FROM idiomas ${whereClause} ORDER BY nombre_idioma`, params);
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener idiomas" });
  }
});

router.patch("/:id/estado", async (req, res) => {
  try {
    const { estado } = req.body;
    if (!['activo', 'inactivo'].includes(estado)) {
      return res.status(400).json({ message: "Estado inválido" });
    }
    await pool.query("UPDATE idiomas SET estado = ? WHERE id_idioma = ?", [estado, req.params.id]);
    res.json({ success: true, message: "Estado actualizado" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al actualizar estado" });
  }
});

router.post("/", async (req, res) => {
  try {
    const { nombre_idioma } = req.body;
    
    const [result] = await pool.query(
      "INSERT INTO idiomas (nombre_idioma) VALUES (?)",
      [nombre_idioma]
    );
    
    res.status(201).json({ 
      success: true,
      message: "Idioma creado exitosamente",
      id: result.insertId 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      success: false,
      message: "Error al crear idioma" 
    });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const { nombre_idioma } = req.body;
    
    await pool.query(
      "UPDATE idiomas SET nombre_idioma = ? WHERE id_idioma = ?",
      [nombre_idioma, req.params.id]
    );
    
    res.json({ 
      success: true,
      message: "Idioma actualizado exitosamente" 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      success: false,
      message: "Error al actualizar idioma" 
    });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    await pool.query("DELETE FROM Idiomas WHERE id_idioma = ?", [req.params.id]);
    
    res.json({ 
      success: true,
      message: "Idioma eliminado exitosamente" 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      success: false,
      message: "Error al eliminar idioma" 
    });
  }
});

export default router;


