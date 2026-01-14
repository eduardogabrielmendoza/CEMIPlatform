import express from "express";
import pool from "../utils/db.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM aulas ORDER BY nombre_aula");
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener aulas" });
  }
});

router.post("/", async (req, res) => {
  try {
    const { nombre_aula, capacidad } = req.body;
    
    const [result] = await pool.query(
      "INSERT INTO aulas (nombre_aula, capacidad) VALUES (?, ?)",
      [nombre_aula, capacidad]
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
    const { nombre_aula, capacidad } = req.body;
    
    await pool.query(
      "UPDATE aulas SET nombre_aula = ?, capacidad = ? WHERE id_aula = ?",
      [nombre_aula, capacidad, req.params.id]
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

router.delete("/:id", async (req, res) => {
  try {
    await pool.query("DELETE FROM Aulas WHERE id_aula = ?", [req.params.id]);
    
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


