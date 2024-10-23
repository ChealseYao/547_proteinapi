require('dotenv').config();
const express = require('express');
const app = express(); 
const proteinRoutes = require('./routes/proteinRoutes'); 

// Middleware
app.use(express.json());
app.use(express.text());
app.use('/api/proteins', proteinRoutes);

const { errorHandler } = require('./utils/customErrors');
app.use(errorHandler);

module.exports = app;

if (process.env.NODE_ENV !== 'test') {
  const mongoose = require('mongoose');
  
  // MongoDB Connection
  mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('Connected to MongoDB successfully'))
    .catch(err => console.error('Failed to connect to MongoDB', err));

  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
  });
}
