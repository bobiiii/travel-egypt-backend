const express = require('express');
const path = require('path');
const app = express();
const cors = require('cors');
const { startDB, startDBProduction } = require('../config/dbConnect');
const { environmentVariables } = require('../config');
const apiRoutes = require('../routes');
const adminRoutes = require('../routes/adminRoutes');

const {
  globalErrorHandler,
  ErrorHandler,
} = require('../utils/errohandler');
const { adminOnly } = require('../middlewares');

app.use(express.json({ limit: '5000mb' }));
app.use(express.urlencoded({ limit: '5000mb', extended: true }));
app.use(
  cors({
    origin: [
      'http://localhost:3000',
      'https://egypt-travel-frontend.vercel.app',
      // 'http://127.0.0.1:5500/index.html',
      "https://vps-650845.dogado-cloud.de"
    ],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
    allowedHeaders:
      'Origin, X-Requested-With, Content-Type, Accept, Authorization',
  }),
);

// app.options('*', cors());
app.use(cors())
if (process.env.NODE_ENV === 'development') {
  app.use(startDB);
  }

app.get('/', (req, res) => res.status(200).json({ message: 'Working fine' }));
app.use('/api', apiRoutes);
app.use('/admin', adminOnly, adminRoutes);
app.use('/images', express.static(path.resolve(__dirname, '../public/images')));

// app.use(express.static(path.resolve(__dirname, '../public')));


app.use(globalErrorHandler);

// handle invalid routes
app.all('*', (req, res, next) => {
  next(new ErrorHandler(`URL ${req.originalUrl} not found on the server`, 404));
});

if (environmentVariables.NODE_ENV === 'production') {
  app.listen(environmentVariables.PORT, () => {
  startDBProduction()
    console.log(
      `server is running on localhost:${environmentVariables.PORT}`,
    );
  });
}

module.exports = app;
