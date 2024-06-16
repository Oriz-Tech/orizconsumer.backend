const config = {
  user: 'dbadmin',
  password: 'CZX2HLgqsNk82lFgnLem',
  server: 'oriztech.database.windows.net',
  database: 'consumerdb',
  options: {
    encrypt: true,
    enableArithAbort: true
  },
  pool: {
    max: 10, // Maximum number of connections in the pool
    min: 0, // Minimum number of connections in the pool
    idleTimeoutMillis: 30000 // How long a connection is allowed to be idle before being released
  },
  port: 1433
};

module.exports = config;
