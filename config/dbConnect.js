const mongoose = require('mongoose');
const { environmentVariables } = require("./index")
require('dotenv').config();

if (!environmentVariables.MONGODB_URI) {
  throw new Error(`console error Invalid/Missing environment variable: "MONGODB_URI" ${environmentVariables.MONGODB_URI}   `);
}


const uri = environmentVariables.NODE_ENV === 'development' ? environmentVariables.MONGODB_URI_TEST :  environmentVariables.MONGODB_URI;
// const options = {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
// };

let isConnected = false;

const startDB = async (req, res, next) => {
  if (isConnected) {
    next();
    return;
  }

  if (environmentVariables.NODE_ENV === 'development') {
    // In development mode, use a global variable so that the value
    // is preserved across module reloads caused by HMR (Hot Module Replacement).
    if (!global.mongoose) {
      global.mongoose = { conn: null, promise: null };
    }

    if (!global.mongoose.conn) {
      global.mongoose.promise = mongoose.connect(uri).then((mongoose) => {
        console.log('connected to MongoDB (TEST) ');
        return mongoose;
      });
    }
    global.mongoose.conn = await global.mongoose.promise;
    isConnected = !!global.mongoose.conn;
    next();
  } else {
    // In production mode, create a new connection
    const connection = await mongoose.connect(uri);
    isConnected = !!connection.connections[0].readyState;
    console.log('connected to MongoDB (Production) ');
    next();
  }
};

const startDBProduction = async () => {
  if (environmentVariables.NODE_ENV === 'production') {
    try {
      const connect = await mongoose.connect(environmentVariables.MONGODB_URI);
      console.log('Database connected successfully:', connect.connection.host);
    } catch (error) {
      console.error('Database connection error:', error.message);
      // Optionally handle the error further (e.g., exit process)
      process.exit(1); // Exit the application if DB connection fails
    }
  } else {
    console.log('Not in production mode, skipping DB connection.');
  }
};
module.exports = { startDB, startDBProduction };