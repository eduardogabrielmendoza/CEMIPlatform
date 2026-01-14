import express from "express";
import pool from "../utils/db.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM niveles ORDER BY id_nivel');
    res.json(rows);
  } catch (error) {
    console.error("Error al obtener niveles:", error);
    res.status(500).json({ message: "Error al obtener niveles" });
  }
});

export default router;


