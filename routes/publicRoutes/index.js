const express = require('express');
const publicRoute = require('./publicRoutes');

const publicRoutes = express.Router();

publicRoutes.use(publicRoute);
publicRoutes.use('*', (req, res) => {
  res.status(404).send('Route not found');
});

module.exports = publicRoutes;
