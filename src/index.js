const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());

// Ruta base para verificar si el servidor funciona
app.get('/', (req, res) => {
  res.send('Servidor funcionando correctamente 🚀');
});

// Conexión a MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('✅ Conectado a MongoDB Atlas');
}).catch((err) => {
  console.error('❌ Error al conectar a MongoDB:', err);
});

// Modelo de puntaje
const Puntaje = mongoose.model('Puntaje', {
  nombre: String,
  puntaje: Number
});

// Rutas API
app.get('/api/puntajes', async (req, res) => {
  const puntajes = await Puntaje.find().sort({ puntaje: -1 }).limit(10);
  res.json(puntajes);
});

app.post('/api/puntajes', async (req, res) => {
  const { nombre, puntaje } = req.body;
  const nuevoPuntaje = new Puntaje({ nombre, puntaje });
  await nuevoPuntaje.save();
  res.status(201).json(nuevoPuntaje);
});

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
});
