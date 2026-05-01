import express from "express";
import pool from "../utils/db.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const { estado } = req.query;
    const params = [];
    let whereClause = "";
    if (estado) {
      whereClause = "WHERE COALESCE(estado, 'activo') = ?";
      params.push(estado);
    }
    const [rows] = await pool.query(`SELECT *, COALESCE(estado, 'activo') AS estado FROM aulas ${whereClause} ORDER BY nombre_aula`, params);
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener aulas" });
  }
});

router.post("/", async (req, res) => {
  try {
    const { nombre_aula, capacidad, estado = "activo" } = req.body;
    if (!["activo", "inactivo"].includes(estado)) {
      return res.status(400).json({ success: false, message: "Estado inválido" });
    }
    
    const [result] = await pool.query(
      "INSERT INTO aulas (nombre_aula, capacidad, estado) VALUES (?, ?, ?)",
      [nombre_aula, capacidad, estado]
    );
    
    res.status(201).json({ 
      success: true,
      message: "Aula creada exitosamente",
      id: result.insertId 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      success: false,
      message: "Error al crear aula" 
    });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const { nombre_aula, capacidad, estado = "activo" } = req.body;
    if (!["activo", "inactivo"].includes(estado)) {
      return res.status(400).json({ success: false, message: "Estado inválido" });
    }
    
    await pool.query(
      "UPDATE aulas SET nombre_aula = ?, capacidad = ?, estado = ? WHERE id_aula = ?",
      [nombre_aula, capacidad, estado, req.params.id]
    );
    
    res.json({ 
      success: true,
      message: "Aula actualizada exitosamente" 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      success: false,
      message: "Error al actualizar aula" 
    });
  }
});

router.patch("/:id/estado", async (req, res) => {
  try {
    const { estado } = req.body;
    if (!["activo", "inactivo"].includes(estado)) {
      return res.status(400).json({ success: false, message: "Estado inválido" });
    }

    const [result] = await pool.query(
      "UPDATE aulas SET estado = ? WHERE id_aula = ?",
      [estado, req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "Aula no encontrada" });
    }

    res.json({ success: true, message: "Estado actualizado", estado });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Error al actualizar estado" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Check for cursos using this aula
    const [cursos] = await pool.query('SELECT COUNT(*) as total FROM cursos WHERE id_aula = ?', [id]);
    if (cursos[0].total > 0) {
      return res.status(400).json({ 
        success: false,
        message: `No se puede eliminar: hay ${cursos[0].total} curso(s) usando esta aula` 
      });
    }

    const [result] = await pool.query("DELETE FROM aulas WHERE id_aula = ?", [id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "Aula no encontrada" });
    }

    res.json({ 
      success: true,
      message: "Aula eliminada exitosamente" 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      success: false,
      message: "Error al eliminar aula" 
    });
  }
});

export default router;


