require('dotenv').config();
const express = require('express');
const app = express(); 
const port = process.env.PORT || 3000;
const proteinRoutes = require('./routes/proteinRoutes'); 

app.use(express.json());
app.use(express.text());

app.use('/api/proteins', proteinRoutes);

const { errorHandler } = require('./utils/customErrors');
app.use(errorHandler);

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
