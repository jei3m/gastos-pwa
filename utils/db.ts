import mysql from 'mysql2/promise';

const getDbConfig = () => {
  const isProduction =
    process.env.NODE_ENV === 'production';

  if (isProduction) {
    return {
      host: process.env.MYSQL_HOST_PROD,
      port: Number(process.env.MYSQL_PORT_PROD),
      user: process.env.MYSQL_USER_PROD,
      password: process.env.MYSQL_PASSWORD_PROD,
      database: process.env.MYSQL_DATABASE_PROD,
    };
  } else {
    return {
      host: process.env.MYSQL_HOST,
      port: Number(process.env.MYSQL_PORT),
      user: process.env.MYSQL_USER,
      password: process.env.MYSQL_PASSWORD,
      database: process.env.MYSQL_DATABASE,
    };
  }
};

export const db = mysql.createPool({
  ...getDbConfig(),
  namedPlaceholders: true,
  multipleStatements: true,
  maxIdle: 10,
  idleTimeout: 60000,
});

export const connection = await db.getConnection();
