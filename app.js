require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const app = express();

const proteinRoutes = require('./routes/proteinRoutes');
const fragmentRoutes = require('./routes/fragmentRoutes');

const { errorHandler } = require('./utils/customErrors');

app.use(express.json());
app.use(express.text());

app.use('/api/proteins', proteinRoutes); 
app.use('/api/fragments', fragmentRoutes); 

app.use(errorHandler);

if (process.env.NODE_ENV !== 'test') {
    // MongoDB Connection
    mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('Connected to MongoDB successfully'))
    .catch(err => console.error('Failed to connect to MongoDB', err));

    const port = process.env.PORT || 3000;
    app.listen(port, () => {
        console.log(`Server running on http://localhost:${port}`);
    });
}


module.exports = app;
