require('dotenv').config();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User = require('../models/user');

const {
  NODE_ENV,
  SECRET_KEY,
  SECRET_KEY_DEV,
} = require('../utils/constants');

const CustomAuthenticationError = require('../errors/CustomAuthenticationError');

const CustomNotFoundCode = require('../errors/CustomNotFoundCode');

const CustomDuplicateDataError = require('../errors/CustomDuplicateDataError');

const CustomInvalidDataError = require('../errors/CustomInvalidDataError');

function registrationUser(req, res, next) {
  const {
    email, password, name, about, avatar,
  } = req.body;

  bcrypt
    .hash(password, 10)
    .then((hash) => User.create({
      email,
      password: hash,
      name,
      about,
      avatar,
    }))
    .then((user) => {
      const { _id } = user;

      return res.status(201).send({
        email,
        name,
        about,
        avatar,
        _id,
      });
    })
    .catch((err) => {
      if (err.code === 11000) {
        next(
          new CustomDuplicateDataError(
            'Пользователь с данным электронным адресом уже зарегистрирован',
          ),
        );
      } else if (err.name === 'ValidationError') {
        next(
          new CustomInvalidDataError(
            'Передача некорректных данные при регистрации пользователя',
          ),
        );
      } else {
        next(err);
      }
    });
}

function loginUser(req, res, next) {
  const { email, password } = req.body;

  User.findUserByCredentials(email, password)
    .then(({ _id: userId }) => {
      if (userId) {
        const token = jwt.sign(
          { userId },
          NODE_ENV === 'production' ? SECRET_KEY : SECRET_KEY_DEV,
          { expiresIn: '7d' },
        );

        return res.send({ token });
      }

      throw new CustomAuthenticationError('Неправильные почта или пароль');
    })
    .catch(next);
}

function getUsersInfo(_, res, next) {
  User.find({})
    .then((users) => res.send({ users }))
    .catch(next);
}

function getUserId(req, res, next) {
  const { id } = req.params;

  User.findById(id)

    .then((user) => {
      if (user) return res.send(user);

      throw new CustomNotFoundCode('Пользователь c указанным id не найден');
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        next(new CustomInvalidDataError('Передача некорректного id'));
      } else {
        next(err);
      }
    });
}

function getUserInfo(req, res, next) {
  const { userId } = req.user;

  User.findById(userId)
    .then((user) => {
      if (user) return res.send(user);

      throw new CustomNotFoundCode('Пользователь c указанным id не найден');
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        next(new CustomInvalidDataError('Передача некорректного id'));
      } else {
        next(err);
      }
    });
}

function setUserInfo(req, res, next) {
  const { name, about } = req.body;
  const { userId } = req.user;

  User.findByIdAndUpdate(
    userId,
    {
      name,
      about,
    },
    {
      new: true,
      runValidators: true,
    },
  )
    .then((user) => {
      if (user) return res.send(user);

      throw new CustomNotFoundCode('Пользователь c указанным id не найден');
    })
    .catch((err) => {
      if (err.name === 'ValidationError' || err.name === 'CastError') {
        next(
          new CustomInvalidDataError(
            'Передача некорректных данных при попытке обновления профиля',
          ),
        );
      } else {
        next(err);
      }
    });
}

function setNewAvatar(req, res, next) {
  const { avatar } = req.body;
  const { userId } = req.user;

  User.findByIdAndUpdate(
    userId,
    {
      avatar,
    },
    {
      new: true,
      runValidators: true,
    },
  )
    .then((user) => {
      if (user) return res.send(user);

      throw new CustomNotFoundCode('Пользователь c указанным id не найден');
    })
    .catch((err) => {
      if (err.name === 'ValidationError' || err.name === 'CastError') {
        next(
          new CustomInvalidDataError(
            'Передача некорректных данных при попытке обновления аватара',
          ),
        );
      } else {
        next(err);
      }
    });
}

module.exports = {
  registrationUser,
  loginUser,
  getUsersInfo,
  getUserId,
  getUserInfo,
  setUserInfo,
  setNewAvatar,
};
