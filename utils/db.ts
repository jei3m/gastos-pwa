import mysql from 'mysql2/promise';

const getDbConfig = () => {
  const isProduction =
    process.env.NODE_ENV === 'production';

  if (isProduction) {
    return {
      host: process.env.HOST_PROD,
      port: Number(process.env.PORT_PROD),
      user: process.env.USER_PROD,
      password: process.env.PASSWORD_PROD,
      database: process.env.DATABASE_PROD,
    };
  } else {
    return {
      host: process.env.HOST,
      user: process.env.USER,
      password: process.env.PASSWORD,
      database: process.env.DATABASE,
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
