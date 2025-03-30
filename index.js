const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

mongoose.connect('mongodb+srv://elisfer11:AI931NcNE5ieNPFs@cluster0.1laieuy.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('✅ Conectado a MongoDB'))
.catch(err => console.error('❌ Error de conexión:', err));

const PuntajeSchema = new mongoose.Schema({
  nombre: String,
  puntaje: Number,
  fecha: {
    type: Date,
    default: Date.now
  }
});

const Puntaje = mongoose.model('Puntaje', PuntajeSchema);

app.post('/api/puntajes', async (req, res) => {
  const { nombre, puntaje } = req.body;
  if (!nombre || typeof puntaje !== 'number') {
    return res.status(400).json({ error: 'Datos inválidos' });
  }

  try {
    const nuevo = new Puntaje({ nombre, puntaje });
    await nuevo.save();
    res.status(201).json({ mensaje: 'Puntaje guardado' });
  } catch (err) {
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

app.get('/api/puntajes', async (req, res) => {
  try {
    const top = await Puntaje.find().sort({ puntaje: -1, fecha: 1 }).limit(10);
    res.json(top);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener el ranking' });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Servidor corriendo en http://localhost:${PORT}`);
});
