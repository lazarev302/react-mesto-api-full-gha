const { NODE_ENV, SECRET_KEY } = process.env;

const CREATED_CODE = 201;

const INTERNAL_SERVER_ERROR = 500;

const URL = 'mongodb://127.0.0.1:27017/mestodb';

// Секретный ключ для разработки и отладки приложения:
const SECRET_KEY_DEV = 'dev-secret';

const emailPattern = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)/;

module.exports = {
  SECRET_KEY,
  SECRET_KEY_DEV,
  emailPattern,
  NODE_ENV,
  URL,
  CREATED_CODE,
  INTERNAL_SERVER_ERROR,
};
