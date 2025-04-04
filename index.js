const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Conexión a MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('✅ Conectado a MongoDB Atlas');
}).catch((err) => {
  console.error('❌ Error al conectar a MongoDB:', err);
});

// Modelos
const Usuario = mongoose.model('Usuario', {
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true }
});

const Puntaje = mongoose.model('Puntaje', {
  nombre: String,
  puntaje: Number,
  tiempo: String
});

// Ruta base
app.get('/', (req, res) => {
  res.send('Servidor funcionando correctamente 🚀');
});

// Registro
app.post('/register', async (req, res) => {
  const { username, password } = req.body;
  try {
    const yaExiste = await Usuario.findOne({ username });
    if (yaExiste) {
      return res.status(400).json({ message: '❌ El usuario ya está registrado' });
    }
    const nuevo = new Usuario({ username, password });
    await nuevo.save();
    res.status(201).json({ message: '✅ Usuario registrado correctamente' });
  } catch (err) {
    res.status(500).json({ message: '❌ Error del servidor' });
  }
});

// Login
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const usuario = await Usuario.findOne({ username });
    if (!usuario) {
      return res.status(400).json({ message: '❌ El usuario no existe' });
    }
    if (usuario.password !== password) {
      return res.status(401).json({ message: '❌ Contraseña incorrecta' });
    }
    res.status(200).json({ message: '✔️ Login exitoso' });
  } catch (err) {
    res.status(500).json({ message: '❌ Error del servidor' });
  }
});

// Obtener top 10
app.get('/api/puntajes', async (req, res) => {
  const puntajes = await Puntaje.find().sort({ puntaje: -1 }).limit(10);
  res.json(puntajes);
});

// Guardar o actualizar puntaje si es más alto
app.post('/api/puntajes', async (req, res) => {
  const { nombre, puntaje, tiempo } = req.body;
  try {
    const existente = await Puntaje.findOne({ nombre });
    if (existente) {
      if (puntaje > existente.puntaje) {
        existente.puntaje = puntaje;
        existente.tiempo = tiempo;
        await existente.save();
      }
      return res.json({ message: 'Puntaje actualizado o mantenido' });
    } else {
      const nuevo = new Puntaje({ nombre, puntaje, tiempo });
      await nuevo.save();
      return res.status(201).json({ message: 'Nuevo puntaje guardado' });
    }
  } catch (err) {
    res.status(500).json({ message: 'Error al guardar el puntaje' });
  }
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
});
