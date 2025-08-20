const { Sequelize } = require('sequelize');
require('dotenv').config();

let sequelize;

// 检查是否在生产环境中（Railway 会设置 NODE_ENV='production'）
if (process.env.NODE_ENV === 'production') {
  // 使用 Railway 提供的 DATABASE_URL
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    protocol: 'postgres',
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false // 需要这个选项来连接 Railway 的 PostgreSQL
      }
    },
    logging: false,
  });
} else {
  // 开发环境使用本地数据库配置
  sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASS,
    {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      dialect: 'postgres',
      logging: false,
    }
  );
}

// 测试数据库连接
async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log('数据库连接成功');
  } catch (error) {
    console.error('无法连接到数据库:', error);
  }
}

testConnection();

module.exports = sequelize;
