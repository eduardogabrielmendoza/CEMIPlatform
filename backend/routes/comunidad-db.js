import express from "express";
import pool from "../utils/db.js";
import eventLogger from "../utils/eventLogger.js";
import { verificarToken, verificarRol } from "../utils/authMiddleware.js";

const router = express.Router();

// Función para generar IDs únicos
const generarId = () => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
};

// Función para parsear JSON de forma segura
const parseJsonSafe = (jsonString) => {
    if (!jsonString) return [];
    if (Array.isArray(jsonString)) return jsonString;
    if (typeof jsonString === 'string' && jsonString.length > 0) {
        try {
            return JSON.parse(jsonString);
        } catch (e) {
            console.error('Error parseando JSON:', e);
            return [];
        }
    }
    return [];
};

// =============================================
// PREGUNTAS
// =============================================

// Obtener todas las preguntas
router.get('/preguntas', async (req, res) => {
    try {
        const { categoria, destacado, estado } = req.query;
        
        let query = `
            SELECT 
                p.*,
                (SELECT COUNT(*) FROM comunidad_respuestas WHERE pregunta_id = p.id) as numRespuestas
            FROM comunidad_preguntas p
            WHERE 1=1
        `;
        const params = [];
        
        if (categoria && categoria !== 'all') {
            query += ' AND p.categoria = ?';
            params.push(categoria);
        }
        
        if (destacado === 'true') {
            query += ' AND (p.destacado = TRUE OR p.es_anuncio = TRUE)';
        }
        
        if (estado) {
            query += ' AND p.estado = ?';
            params.push(estado);
        }
        
        query += ' ORDER BY p.es_anuncio DESC, p.destacado DESC, p.fecha_creacion DESC';
        
        const [preguntas] = await pool.execute(query, params);
        
        // Obtener estadísticas
        const [[stats]] = await pool.execute(`
            SELECT 
                (SELECT COUNT(*) FROM comunidad_preguntas) as totalPreguntas,
                (SELECT COUNT(*) FROM comunidad_respuestas) as totalRespuestas,
                (SELECT COUNT(*) FROM comunidad_participantes) as totalParticipantes
        `);
        
        // Formatear preguntas para el frontend
        const preguntasFormateadas = preguntas.map(p => {
            let votantes = [];
            try {
                if (p.votantes && typeof p.votantes === 'string' && p.votantes.length > 0) {
                    votantes = JSON.parse(p.votantes);
                } else if (Array.isArray(p.votantes)) {
                    votantes = p.votantes;
                }
            } catch (e) {
                votantes = [];
            }
            
            return {
                id: p.id,
                titulo: p.titulo,
                descripcion: p.descripcion,
                categoria: p.categoria,
                autorTipo: p.autor_tipo,
                autorId: p.autor_id,
                autorNombre: p.autor_nombre,
                autorAvatar: p.autor_avatar,
                estado: p.estado,
                votos: p.votos,
                votantes: votantes,
                destacado: p.destacado === 1,
                esAnuncio: p.es_anuncio === 1,
                fechaCreacion: p.fecha_creacion,
                fechaActualizacion: p.fecha_actualizacion,
                numRespuestas: p.numRespuestas
            };
        });
        
        res.json({
            success: true,
            preguntas: preguntasFormateadas,
            stats: {
                preguntas: stats.totalPreguntas,
                respuestas: stats.totalRespuestas,
                participantes: stats.totalParticipantes
            }
        });
    } catch (error) {
        console.error('Error al obtener preguntas:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Obtener una pregunta por ID con sus respuestas
router.get('/preguntas/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        const [[pregunta]] = await pool.execute(
            'SELECT * FROM comunidad_preguntas WHERE id = ?',
            [id]
        );
        
        if (!pregunta) {
            return res.status(404).json({ success: false, error: 'Pregunta no encontrada' });
        }
        
        const [respuestas] = await pool.execute(
            `SELECT * FROM comunidad_respuestas 
             WHERE pregunta_id = ? 
             ORDER BY es_recomendada DESC, votos DESC, fecha_creacion ASC`,
            [id]
        );
        
        // Formatear pregunta
        const preguntaFormateada = {
            id: pregunta.id,
            titulo: pregunta.titulo,
            descripcion: pregunta.descripcion,
            categoria: pregunta.categoria,
            autorTipo: pregunta.autor_tipo,
            autorId: pregunta.autor_id,
            autorNombre: pregunta.autor_nombre,
            autorAvatar: pregunta.autor_avatar,
            estado: pregunta.estado,
            votos: pregunta.votos,
            votantes: parseJsonSafe(pregunta.votantes),
            destacado: pregunta.destacado === 1,
            esAnuncio: pregunta.es_anuncio === 1,
            fechaCreacion: pregunta.fecha_creacion,
            fechaActualizacion: pregunta.fecha_actualizacion
        };
        
        // Formatear respuestas
        const respuestasFormateadas = respuestas.map(r => ({
            id: r.id,
            contenido: r.contenido,
            autorTipo: r.autor_tipo,
            autorId: r.autor_id,
            autorNombre: r.autor_nombre,
            autorAvatar: r.autor_avatar,
            esRecomendada: r.es_recomendada === 1,
            votos: r.votos,
            votantes: parseJsonSafe(r.votantes),
            fechaCreacion: r.fecha_creacion
        }));
        
        res.json({ 
            success: true, 
            pregunta: preguntaFormateada,
            respuestas: respuestasFormateadas
        });
    } catch (error) {
        console.error('Error al obtener pregunta:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Crear nueva pregunta (requiere autenticación)
router.post('/preguntas', verificarToken, async (req, res) => {
    try {
        const { titulo, descripcion, categoria, autorTipo, autorId, autorNombre, autorAvatar } = req.body;
        
        if (!titulo || !descripcion || !categoria || !autorTipo || !autorId || !autorNombre) {
            return res.status(400).json({ success: false, error: 'Todos los campos son requeridos' });
        }
        
        const id = generarId();
        
        await pool.execute(
            `INSERT INTO comunidad_preguntas 
             (id, titulo, descripcion, categoria, autor_tipo, autor_id, autor_nombre, autor_avatar, votantes)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, '[]')`,
            [id, titulo, descripcion, categoria, autorTipo, parseInt(autorId), autorNombre, autorAvatar || null]
        );
        
        // Registrar participante
        await pool.execute(
            `INSERT IGNORE INTO comunidad_participantes (participante_tipo, participante_id) VALUES (?, ?)`,
            [autorTipo, parseInt(autorId)]
        );
        
        // Log del evento
        eventLogger.community.questionAsked(autorNombre, titulo.substring(0, 40));
        
        const nuevaPregunta = {
            id,
            titulo,
            descripcion,
            categoria,
            autorTipo,
            autorId: parseInt(autorId),
            autorNombre,
            autorAvatar: autorAvatar || null,
            votos: 0,
            votantes: [],
            destacado: false,
            esAnuncio: false,
            estado: 'abierta',
            fechaCreacion: new Date().toISOString(),
            fechaActualizacion: new Date().toISOString(),
            numRespuestas: 0
        };
        
        res.json({ 
            success: true, 
            message: 'Pregunta publicada exitosamente',
            pregunta: nuevaPregunta
        });
    } catch (error) {
        console.error('Error al crear pregunta:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// =============================================
// RESPUESTAS
// =============================================

// Agregar respuesta a una pregunta (requiere autenticación)
router.post('/preguntas/:id/respuestas', verificarToken, async (req, res) => {
    try {
        const { id: preguntaId } = req.params;
        const { contenido, autorTipo, autorId, autorNombre, autorAvatar } = req.body;
        
        if (!contenido || !autorTipo || !autorId || !autorNombre) {
            return res.status(400).json({ success: false, error: 'Todos los campos son requeridos' });
        }
        
        // Verificar que la pregunta existe
        const [[pregunta]] = await pool.execute(
            'SELECT id, autor_nombre, titulo FROM comunidad_preguntas WHERE id = ?',
            [preguntaId]
        );
        
        if (!pregunta) {
            return res.status(404).json({ success: false, error: 'Pregunta no encontrada' });
        }
        
        const respuestaId = generarId();
        
        await pool.execute(
            `INSERT INTO comunidad_respuestas 
             (id, pregunta_id, contenido, autor_tipo, autor_id, autor_nombre, autor_avatar, votantes)
             VALUES (?, ?, ?, ?, ?, ?, ?, '[]')`,
            [respuestaId, preguntaId, contenido, autorTipo, parseInt(autorId), autorNombre, autorAvatar || null]
        );
        
        // Registrar participante
        await pool.execute(
            `INSERT IGNORE INTO comunidad_participantes (participante_tipo, participante_id) VALUES (?, ?)`,
            [autorTipo, parseInt(autorId)]
        );
        
        // Log del evento
        eventLogger.community.questionAnswered(autorNombre, pregunta.titulo.substring(0, 40));
        
        const nuevaRespuesta = {
            id: respuestaId,
            contenido,
            autorTipo,
            autorId: parseInt(autorId),
            autorNombre,
            autorAvatar: autorAvatar || null,
            esRecomendada: false,
            votos: 0,
            votantes: [],
            fechaCreacion: new Date().toISOString()
        };
        
        res.json({ 
            success: true, 
            message: 'Respuesta publicada exitosamente',
            respuesta: nuevaRespuesta
        });
    } catch (error) {
        console.error('Error al crear respuesta:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// =============================================
// VOTOS
// =============================================

// Votar una pregunta
router.post('/preguntas/:id/votar', async (req, res) => {
    try {
        const { id } = req.params;
        const { votanteTipo, votanteId } = req.body;
        
        if (!votanteTipo || !votanteId) {
            return res.status(400).json({ success: false, error: 'Datos de votante requeridos' });
        }
        
        const votanteKey = `${votanteTipo}_${votanteId}`;
        
        const [[pregunta]] = await pool.execute(
            'SELECT votos, votantes FROM comunidad_preguntas WHERE id = ?',
            [id]
        );
        
        if (!pregunta) {
            return res.status(404).json({ success: false, error: 'Pregunta no encontrada' });
        }
        
        let votantes = parseJsonSafe(pregunta.votantes);
        let nuevoVotos = pregunta.votos;
        let action;
        
        if (votantes.includes(votanteKey)) {
            // Quitar voto
            votantes = votantes.filter(v => v !== votanteKey);
            nuevoVotos--;
            action = 'removed';
        } else {
            // Agregar voto
            votantes.push(votanteKey);
            nuevoVotos++;
            action = 'added';
        }
        
        await pool.execute(
            'UPDATE comunidad_preguntas SET votos = ?, votantes = ? WHERE id = ?',
            [nuevoVotos, JSON.stringify(votantes), id]
        );
        
        res.json({ success: true, votos: nuevoVotos, action });
    } catch (error) {
        console.error('Error al votar:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Votar una respuesta
router.post('/respuestas/:id/votar', async (req, res) => {
    try {
        const { id } = req.params;
        const { votanteTipo, votanteId } = req.body;
        
        if (!votanteTipo || !votanteId) {
            return res.status(400).json({ success: false, error: 'Datos de votante requeridos' });
        }
        
        const votanteKey = `${votanteTipo}_${votanteId}`;
        
        const [[respuesta]] = await pool.execute(
            'SELECT votos, votantes FROM comunidad_respuestas WHERE id = ?',
            [id]
        );
        
        if (!respuesta) {
            return res.status(404).json({ success: false, error: 'Respuesta no encontrada' });
        }
        
        let votantes = parseJsonSafe(respuesta.votantes);
        let nuevoVotos = respuesta.votos;
        let action;
        
        if (votantes.includes(votanteKey)) {
            votantes = votantes.filter(v => v !== votanteKey);
            nuevoVotos--;
            action = 'removed';
        } else {
            votantes.push(votanteKey);
            nuevoVotos++;
            action = 'added';
        }
        
        await pool.execute(
            'UPDATE comunidad_respuestas SET votos = ?, votantes = ? WHERE id = ?',
            [nuevoVotos, JSON.stringify(votantes), id]
        );
        
        res.json({ success: true, votos: nuevoVotos, action });
    } catch (error) {
        console.error('Error al votar:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// =============================================
// ACCIONES DE MODERACIÓN
// =============================================

// Marcar pregunta como resuelta
router.put('/preguntas/:id/resolver', async (req, res) => {
    try {
        const { id } = req.params;
        const { respuestaId } = req.body;
        
        await pool.execute(
            'UPDATE comunidad_preguntas SET estado = ? WHERE id = ?',
            ['resuelta', id]
        );
        
        if (respuestaId) {
            // Marcar la respuesta como recomendada
            await pool.execute(
                'UPDATE comunidad_respuestas SET es_recomendada = FALSE WHERE pregunta_id = ?',
                [id]
            );
            await pool.execute(
                'UPDATE comunidad_respuestas SET es_recomendada = TRUE WHERE id = ?',
                [respuestaId]
            );
        }
        
        res.json({ success: true, message: 'Pregunta marcada como resuelta' });
    } catch (error) {
        console.error('Error al resolver pregunta:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Destacar/Desdestacar pregunta (solo admin)
router.put('/preguntas/:id/destacar', verificarToken, verificarRol('admin', 'administrador'), async (req, res) => {
    try {
        const { id } = req.params;
        const { destacado } = req.body;
        
        await pool.execute(
            'UPDATE comunidad_preguntas SET destacado = ? WHERE id = ?',
            [destacado ? 1 : 0, id]
        );
        
        res.json({ success: true, message: destacado ? 'Pregunta destacada' : 'Pregunta removida de destacados' });
    } catch (error) {
        console.error('Error al destacar pregunta:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Eliminar pregunta (requiere ser el autor o admin)
router.delete('/preguntas/:id', verificarToken, async (req, res) => {
    try {
        const { id } = req.params;
        
        await pool.execute('DELETE FROM comunidad_preguntas WHERE id = ?', [id]);
        
        res.json({ success: true, message: 'Pregunta eliminada' });
    } catch (error) {
        console.error('Error al eliminar pregunta:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Eliminar respuesta (requiere ser el autor o admin)
router.delete('/respuestas/:id', verificarToken, async (req, res) => {
    try {
        const { id } = req.params;
        
        await pool.execute('DELETE FROM comunidad_respuestas WHERE id = ?', [id]);
        
        res.json({ success: true, message: 'Respuesta eliminada' });
    } catch (error) {
        console.error('Error al eliminar respuesta:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

export default router;
