const express = require('express');
const app = express();
const userRoutes = require('./routes/user');

app.use(express.json());
app.use('/api', userRoutes);

app.listen(3000, () => {
  console.log('Servidor corriendo en puerto 3000');
});