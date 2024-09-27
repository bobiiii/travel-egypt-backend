const express = require('express');
const publicRoute = require('./publicRoutes');
// const categoryRoute = require('./tourRoutes');

const apiRoutes = express.Router();

apiRoutes.use('/public', publicRoute);
// apiRoutes.use('/category', categoryRoute);

apiRoutes.use('/*', (req, res) => {
  res.status(404).json({ message: 'Route Not Found' });
});

module.exports = apiRoutes;
