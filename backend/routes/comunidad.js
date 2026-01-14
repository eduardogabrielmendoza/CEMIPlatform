import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import eventLogger from "../utils/eventLogger.js";

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dataPath = path.join(__dirname, "../../frontend/assets/data/comunidad-data.json");

const ensureDataFile = () => {
    const dir = path.dirname(dataPath);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
    if (!fs.existsSync(dataPath)) {
        const initialData = {
            preguntas: [],
            stats: {
                totalPreguntas: 0,
                totalRespuestas: 0,
                participantes: []
            }
        };
        fs.writeFileSync(dataPath, JSON.stringify(initialData, null, 2));
    }
};

const leerDatos = () => {
    ensureDataFile();
    try {
        const data = fs.readFileSync(dataPath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error leyendo comunidad-data.json:', error);
        return { preguntas: [], stats: { totalPreguntas: 0, totalRespuestas: 0, participantes: [] } };
    }
};

const guardarDatos = (data) => {
    try {
        fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
        return true;
    } catch (error) {
        console.error('Error guardando comunidad-data.json:', error);
        return false;
    }
};

const generarId = () => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
};

const agregarParticipante = (stats, participanteId) => {
    if (!stats.participantes.includes(participanteId)) {
        stats.participantes.push(participanteId);
    }
};


router.get('/preguntas', (req, res) => {
    try {
        const { categoria, destacado, estado } = req.query;
        const data = leerDatos();
        
        let preguntas = [...data.preguntas];
        
        if (categoria && categoria !== 'all') {
            preguntas = preguntas.filter(p => p.categoria === categoria);
        }
        
        if (destacado === 'true') {
            preguntas = preguntas.filter(p => p.destacado || p.esAnuncio);
        }
        
        if (estado) {
            preguntas = preguntas.filter(p => p.estado === estado);
        }
        
        preguntas.sort((a, b) => {
            if (a.esAnuncio && !b.esAnuncio) return -1;
            if (!a.esAnuncio && b.esAnuncio) return 1;
            if (a.destacado && !b.destacado) return -1;
            if (!a.destacado && b.destacado) return 1;
            return new Date(b.fechaCreacion) - new Date(a.fechaCreacion);
        });
        
        preguntas = preguntas.map(p => ({
            ...p,
            numRespuestas: p.respuestas ? p.respuestas.length : 0
        }));
        
        res.json({
            success: true,
            preguntas,
            stats: {
                preguntas: data.stats.totalPreguntas,
                respuestas: data.stats.totalRespuestas,
                participantes: data.stats.participantes.length
            }
        });
    } catch (error) {
        console.error('Error al obtener preguntas:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

router.get('/preguntas/:id', (req, res) => {
    try {
        const { id } = req.params;
        const data = leerDatos();
        
        const pregunta = data.preguntas.find(p => p.id === id);
        
        if (!pregunta) {
            return res.status(404).json({ success: false, error: 'Pregunta no encontrada' });
        }
        
        const respuestas = (pregunta.respuestas || []).sort((a, b) => {
            if (a.esRecomendada && !b.esRecomendada) return -1;
            if (!a.esRecomendada && b.esRecomendada) return 1;
            return b.votos - a.votos;
        });
        
        res.json({ 
            success: true, 
            pregunta: { ...pregunta, respuestas: undefined },
            respuestas 
        });
    } catch (error) {
        console.error('Error al obtener pregunta:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

router.post('/preguntas', (req, res) => {
    try {
        const { titulo, descripcion, categoria, autorTipo, autorId, autorNombre, autorAvatar } = req.body;
        
        if (!titulo || !descripcion || !categoria || !autorTipo || !autorId || !autorNombre) {
            return res.status(400).json({ success: false, error: 'Todos los campos son requeridos' });
        }
        
        const data = leerDatos();
        
        const nuevaPregunta = {
            id: generarId(),
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
            respuestas: [],
            fechaCreacion: new Date().toISOString(),
            fechaActualizacion: new Date().toISOString()
        };
        
        data.preguntas.unshift(nuevaPregunta);
        data.stats.totalPreguntas++;
        agregarParticipante(data.stats, `${autorTipo}_${autorId}`);
        
        if (guardarDatos(data)) {
            // Log del evento
            eventLogger.community.questionAsked(autorNombre, titulo.substring(0, 40));
            
            res.json({ 
                success: true, 
                message: 'Pregunta publicada exitosamente',
                pregunta: nuevaPregunta
            });
        } else {
            res.status(500).json({ success: false, error: 'Error al guardar la pregunta' });
        }
    } catch (error) {
        console.error('Error al crear pregunta:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});


router.post('/preguntas/:id/respuestas', (req, res) => {
    try {
        const { id } = req.params;
        const { contenido, autorTipo, autorId, autorNombre, autorAvatar } = req.body;
        
        if (!contenido || !autorTipo || !autorId || !autorNombre) {
            return res.status(400).json({ success: false, error: 'Todos los campos son requeridos' });
        }
        
        const data = leerDatos();
        const preguntaIndex = data.preguntas.findIndex(p => p.id === id);
        
        if (preguntaIndex === -1) {
            return res.status(404).json({ success: false, error: 'Pregunta no encontrada' });
        }
        
        if (data.preguntas[preguntaIndex].estado === 'cerrada') {
            return res.status(400).json({ success: false, error: 'Esta pregunta está cerrada' });
        }
        
        const nuevaRespuesta = {
            id: generarId(),
            contenido,
            autorTipo,
            autorId: parseInt(autorId),
            autorNombre,
            autorAvatar: autorAvatar || null,
            autorRol: autorTipo === 'profesor' ? 'Profesor' : (autorTipo === 'admin' ? 'Administrador' : null),
            votos: 0,
            votantes: [],
            esRecomendada: false,
            fechaCreacion: new Date().toISOString()
        };
        
        if (!data.preguntas[preguntaIndex].respuestas) {
            data.preguntas[preguntaIndex].respuestas = [];
        }
        
        data.preguntas[preguntaIndex].respuestas.push(nuevaRespuesta);
        data.preguntas[preguntaIndex].fechaActualizacion = new Date().toISOString();
        data.stats.totalRespuestas++;
        agregarParticipante(data.stats, `${autorTipo}_${autorId}`);
        
        if (guardarDatos(data)) {
            // Log del evento
            eventLogger.community.questionAnswered(autorNombre, data.preguntas[preguntaIndex].titulo.substring(0, 40));
            
            res.json({ 
                success: true, 
                message: 'Respuesta publicada exitosamente',
                respuesta: nuevaRespuesta
            });
        } else {
            res.status(500).json({ success: false, error: 'Error al guardar la respuesta' });
        }
    } catch (error) {
        console.error('Error al crear respuesta:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});


router.post('/preguntas/:id/votar', (req, res) => {
    try {
        const { id } = req.params;
        const { votanteTipo, votanteId } = req.body;
        
        if (!votanteTipo || !votanteId) {
            return res.status(400).json({ success: false, error: 'Datos incompletos' });
        }
        
        const data = leerDatos();
        const preguntaIndex = data.preguntas.findIndex(p => p.id === id);
        
        if (preguntaIndex === -1) {
            return res.status(404).json({ success: false, error: 'Pregunta no encontrada' });
        }
        
        const votanteKey = `${votanteTipo}_${votanteId}`;
        const pregunta = data.preguntas[preguntaIndex];
        
        if (!pregunta.votantes) pregunta.votantes = [];
        
        const yaVoto = pregunta.votantes.includes(votanteKey);
        
        if (yaVoto) {
            pregunta.votantes = pregunta.votantes.filter(v => v !== votanteKey);
            pregunta.votos = Math.max(0, pregunta.votos - 1);
            guardarDatos(data);
            res.json({ success: true, action: 'removed', votos: pregunta.votos });
        } else {
            pregunta.votantes.push(votanteKey);
            pregunta.votos++;
            guardarDatos(data);
            res.json({ success: true, action: 'added', votos: pregunta.votos });
        }
    } catch (error) {
        console.error('Error al votar:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

router.post('/preguntas/:preguntaId/respuestas/:respuestaId/votar', (req, res) => {
    try {
        const { preguntaId, respuestaId } = req.params;
        const { votanteTipo, votanteId } = req.body;
        
        if (!votanteTipo || !votanteId) {
            return res.status(400).json({ success: false, error: 'Datos incompletos' });
        }
        
        const data = leerDatos();
        const preguntaIndex = data.preguntas.findIndex(p => p.id === preguntaId);
        
        if (preguntaIndex === -1) {
            return res.status(404).json({ success: false, error: 'Pregunta no encontrada' });
        }
        
        const respuestaIndex = data.preguntas[preguntaIndex].respuestas.findIndex(r => r.id === respuestaId);
        
        if (respuestaIndex === -1) {
            return res.status(404).json({ success: false, error: 'Respuesta no encontrada' });
        }
        
        const votanteKey = `${votanteTipo}_${votanteId}`;
        const respuesta = data.preguntas[preguntaIndex].respuestas[respuestaIndex];
        
        if (!respuesta.votantes) respuesta.votantes = [];
        
        const yaVoto = respuesta.votantes.includes(votanteKey);
        
        if (yaVoto) {
            respuesta.votantes = respuesta.votantes.filter(v => v !== votanteKey);
            respuesta.votos = Math.max(0, respuesta.votos - 1);
            guardarDatos(data);
            res.json({ success: true, action: 'removed', votos: respuesta.votos });
        } else {
            respuesta.votantes.push(votanteKey);
            respuesta.votos++;
            guardarDatos(data);
            res.json({ success: true, action: 'added', votos: respuesta.votos });
        }
    } catch (error) {
        console.error('Error al votar respuesta:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});


router.put('/preguntas/:preguntaId/respuestas/:respuestaId/recomendar', (req, res) => {
    try {
        const { preguntaId, respuestaId } = req.params;
        const { recomendar } = req.body;
        
        const data = leerDatos();
        const preguntaIndex = data.preguntas.findIndex(p => p.id === preguntaId);
        
        if (preguntaIndex === -1) {
            return res.status(404).json({ success: false, error: 'Pregunta no encontrada' });
        }
        
        const respuestaIndex = data.preguntas[preguntaIndex].respuestas.findIndex(r => r.id === respuestaId);
        
        if (respuestaIndex === -1) {
            return res.status(404).json({ success: false, error: 'Respuesta no encontrada' });
        }
        
        data.preguntas[preguntaIndex].respuestas[respuestaIndex].esRecomendada = recomendar;
        guardarDatos(data);
        
        res.json({ success: true, message: recomendar ? 'Respuesta marcada como recomendada' : 'Marca removida' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

router.put('/preguntas/:id/destacar', (req, res) => {
    try {
        const { id } = req.params;
        const { destacar } = req.body;
        
        const data = leerDatos();
        const preguntaIndex = data.preguntas.findIndex(p => p.id === id);
        
        if (preguntaIndex === -1) {
            return res.status(404).json({ success: false, error: 'Pregunta no encontrada' });
        }
        
        data.preguntas[preguntaIndex].destacado = destacar;
        guardarDatos(data);
        
        res.json({ success: true, message: destacar ? 'Pregunta destacada' : 'Pregunta ya no está destacada' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

router.put('/preguntas/:id/estado', (req, res) => {
    try {
        const { id } = req.params;
        const { estado } = req.body;
        
        if (!['abierta', 'resuelta', 'cerrada'].includes(estado)) {
            return res.status(400).json({ success: false, error: 'Estado inválido' });
        }
        
        const data = leerDatos();
        const preguntaIndex = data.preguntas.findIndex(p => p.id === id);
        
        if (preguntaIndex === -1) {
            return res.status(404).json({ success: false, error: 'Pregunta no encontrada' });
        }
        
        data.preguntas[preguntaIndex].estado = estado;
        guardarDatos(data);
        
        res.json({ success: true, message: `Pregunta marcada como ${estado}` });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

router.delete('/preguntas/:id', (req, res) => {
    try {
        const { id } = req.params;
        const { autorTipo, autorId } = req.body;
        
        const data = leerDatos();
        const preguntaIndex = data.preguntas.findIndex(p => p.id === id);
        
        if (preguntaIndex === -1) {
            return res.status(404).json({ success: false, error: 'Pregunta no encontrada' });
        }
        
        const pregunta = data.preguntas[preguntaIndex];
        
        if (autorTipo !== 'admin' && !(pregunta.autorTipo === autorTipo && pregunta.autorId === parseInt(autorId))) {
            return res.status(403).json({ success: false, error: 'No tienes permisos para eliminar esta pregunta' });
        }
        
        const numRespuestas = pregunta.respuestas ? pregunta.respuestas.length : 0;
        data.stats.totalRespuestas -= numRespuestas;
        data.stats.totalPreguntas--;
        
        data.preguntas.splice(preguntaIndex, 1);
        guardarDatos(data);
        
        res.json({ success: true, message: 'Pregunta eliminada' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

export default router;


