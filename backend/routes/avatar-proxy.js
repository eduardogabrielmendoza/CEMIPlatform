import express from "express";
import pool from "../utils/db.js";

const router = express.Router();

router.get("/:filename", async (req, res) => {
  try {
    const { filename } = req.params;
    
    const userId = filename.match(/avatar-u(\d+)/)?.[1];
    
    if (!userId) {
      return res.status(404).send("Avatar not found");
    }

    const [usuarios] = await pool.query(
      'SELECT p.avatar FROM usuarios u JOIN personas p ON u.id_persona = p.id_persona WHERE u.id_usuario = ?',
      [userId]
    );

    if (usuarios.length === 0 || !usuarios[0].avatar) {
      return res.status(404).send("Avatar not found");
    }

    const avatarPath = usuarios[0].avatar;
    
    res.redirect(avatarPath);

  } catch (error) {
    console.error("Error sirviendo avatar:", error);
    res.status(500).send("Server error");
  }
});

export default router;


