const jwt = require('jsonwebtoken');
const {
  NODE_ENV,
  SECRET_KEY,
  SECRET_KEY_DEV,
} = require('../utils/constants');

const CustomAuthenticationError = require('../errors/CustomAuthenticationError');

module.exports = (req, res, next) => {
  const { authorization } = req.headers;
  const bearer = 'Bearer ';
  const errorMessage = 'Неправильные почта или пароль';

  if (!authorization || !authorization.startsWith(bearer)) {
    return next(new CustomAuthenticationError(`${errorMessage}(${authorization})!`));
  }

  const token = authorization.replace(bearer, '');

  let payload;

  try {
    payload = jwt.verify(token, NODE_ENV === 'production' ? SECRET_KEY : SECRET_KEY_DEV);
  } catch (err) {
    return next(new CustomAuthenticationError(`${errorMessage}!`));
  }

  req.user = payload;

  return next();
};
