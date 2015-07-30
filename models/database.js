var connectionString = process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/kacmaz';

module.exports = connectionString;