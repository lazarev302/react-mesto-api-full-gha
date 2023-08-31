class Auth {
  constructor({ baseUrl, headers }) {
    this._baseUrl = baseUrl;
    this._headers = headers;
  }

  _checkResponce(res) {
    if (!res.ok) {
      return Promise.reject(`Ошибка: ${res.status}`);
    }
    return res.json();
  }

  registration(newUserData) {
    return fetch(`${this._baseUrl}/signup`, {
      method: "POST",
      headers: this._headers,
      body: JSON.stringify({
        email: newUserData.email,
        password: newUserData.password,
      }),
    }).then(this._checkResponce);
  }

  authorization(userData) {
    return fetch(`${this._baseUrl}/signin`, {
      method: "POST",
      headers: this._headers,
      body: JSON.stringify({
        email: userData.email,
        password: userData.password,
      }),
    }).then(this._checkResponce);
  }

  getToken(token) {
    return fetch(`${this._baseUrl}/users/me`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        authorization: `Bearer ${token}`,
      },
    }).then(this._checkResponce);
  }
}

const auth = new Auth({
  baseUrl: "https://api.roma.nomoredomainsicu.ru",
  headers: {
    "Content-Type": "application/json",
  },
});

export default auth;
