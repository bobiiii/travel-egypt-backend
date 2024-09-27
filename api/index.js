const express = require('express');

const app = express();
const cors = require('cors');
const { startDB } = require('../config/dbConnect');
const { environmentVariables } = require('../config');
const apiRoutes = require('../routes');
const adminRoutes = require('../routes/adminRoutes');

const {
  globalErrorHandler,
  ErrorHandler,
} = require('../utils/errohandler');

app.use(express.json({ limit: '5000mb' }));
app.use(express.urlencoded({ limit: '5000mb', extended: true }));
app.use(
  cors({
    origin: [
      'http://localhost:3000',
      'https://egypt-travel-frontend.vercel.app',
      'http://127.0.0.1:5500/index.html'
    ],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
    allowedHeaders:
      'Origin, X-Requested-With, Content-Type, Accept, Authorization',
  }),
);

// app.options('*', cors());
app.use(cors())
app.use(startDB);

app.get('/', (req, res) => res.status(200).json({ message: 'Working fine' }));
app.use('/api', apiRoutes);
app.use('/admin', adminRoutes);
app.use(globalErrorHandler);

// handle invalid routes
app.all('*', (req, res, next) => {
  next(new ErrorHandler(`URL ${req.originalUrl} not found on the server`, 404));
});

if (environmentVariables.NODE_ENV === 'development') {
  app.listen(environmentVariables.PORT, () => {
    console.log(
      `server is running on localhost:${environmentVariables.PORT}`,
    );
  });
}

module.exports = app;
