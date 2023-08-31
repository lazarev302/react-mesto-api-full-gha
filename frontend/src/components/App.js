import React, { useState, useEffect, useCallback } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";

import Main from "./Main";
import Footer from "./Footer";
import CurrentUserContext from "../contexts/CurrentUserContext";
import EditProfilePopup from "./EditProfilePopup";
import EditAvatarPopup from "./EditAvatarPopup";
import AddPlacePopup from "./AddPlacePopup";
import PopupDeleteCard from "./PopupDeleteCard";
import ImagePopup from "./ImagePopup";
import api from "../utils/Api";
import ProtectedRoute from "./ProtectedRoute";
import InfoTooltip from "./InfoTooltip";
import auth from "../utils/token";
import Login from "./Login";
import Register from "./Register";

function App() {
  const [isEditProfilePopupOpen, setIsEditProfilePopupOpen] = useState(false);
  const [isEditAvatarPopupOpen, setIsEditAvatarPopupOpen] = useState(false);
  const [isAddPlacePopupOpen, setIsAddPlacePopupOpen] = useState(false);
  const [isPopupDeleteCardOpen, setIsPopupDeleteCardOpen] = useState(false);
  const [deletedCard, setDeletedCard] = useState({});
  const [selectedCard, setSelectedCard] = useState({});
  const [currentUser, setCurrentUser] = useState({});
  const [cards, setCards] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [isInfoTooltipOpen, setIsInfoTooltipOpen] = useState(false);
  const [isInfoTooltipMessage, setIsInfoTooltipMessage] = useState("");
  const [isRegistrationSuccess, setIsRegistrationSuccess] = useState(false);
  const [email, setEmail] = useState("");
  const navigate = useNavigate();

  const tokenCheck = useCallback(() => {
    const token = localStorage.getItem("token");
    console.log(token);
    if (token && !loggedIn) {
      auth
        .getToken(token)
        .then((res) => {
          if (res) {
            setLoggedIn(true);
            setEmail(res.email);
            navigate("/", { replace: true });
          }
        })
        .catch((err) => console.log(err));
    }
  }, [loggedIn, navigate]);

  function closeAllPopups() {
    setIsEditProfilePopupOpen(false);
    setIsAddPlacePopupOpen(false);
    setIsEditAvatarPopupOpen(false);
    setIsPopupDeleteCardOpen(false);
    setIsInfoTooltipOpen(false);
    setDeletedCard({});
    setSelectedCard({});
  }

  function closeByOverlay(evt) {
    if (evt.target === evt.currentTarget) {
      console.log("asd");
      closeAllPopups();
    }
  }

  const isOpen =
    isEditAvatarPopupOpen ||
    isEditProfilePopupOpen ||
    isAddPlacePopupOpen ||
    isPopupDeleteCardOpen ||
    selectedCard.link;

  useEffect(() => {
    function closeByEscape(evt) {
      if (evt.key === "Escape") {
        closeAllPopups();
      }
    }
    if (isOpen) {
      document.addEventListener("keydown", closeByEscape);
      return () => {
        document.removeEventListener("keydown", closeByEscape);
      };
    }
  }, [isOpen]);

  useEffect(() => {
    tokenCheck();
    loggedIn &&
      Promise.all([api.getInfo(), api.getCards()])
        .then(([userRes, cards]) => {
          setCurrentUser(userRes);
          setCards(cards.data.reverse());
        })
        .catch((err) => console.log(err));
  }, [loggedIn, tokenCheck]);

  function handleSignup(message) {
    setIsInfoTooltipMessage(message);
    setIsInfoTooltipOpen(true);
  }

  function handleDeleteSubmit(card) {
    setIsLoading(true);
    api
      .deleteCard(card._id)
      .then(() => {
        setCards((state) => state.filter((item) => item._id !== card._id));
        closeAllPopups();
      })
      .catch((error) => console.log(`Ошибка: ${error}`))
      .finally(() => setIsLoading(false));
  }

  function handleLike(card) {
    const isLiked = card.likes.some((user) => user === currentUser._id);
    (isLiked ? api.deleteLike(card._id) : api.addLike(card._id, true))
      .then((newCard) => {
        setCards((state) =>
          state.map((c) => (c._id === newCard.data._id ? newCard.data : c))
        );
      })
      .catch((err) => console.log(err));
  }

  function handleUpdateUser(newUserInfo) {
    setIsLoading(true);
    api
      .setUserInfo(newUserInfo)
      .then((data) => {
        setCurrentUser(data);
        closeAllPopups();
      })
      .catch((error) => console.log(`Ошибка: ${error}`))
      .finally(() => setIsLoading(false));
  }

  function handleUpdateAvatar(newAvatar) {
    setIsLoading(true);
    api
      .setNewAvatar(newAvatar)
      .then((data) => {
        setCurrentUser(data);
        closeAllPopups();
      })
      .catch((error) => console.log(`Ошибка: ${error}`))
      .finally(() => setIsLoading(false));
  }

  function handleAddPlaceSubmit(data) {
    setIsLoading(true);
    api
      .addCard(data)
      .then((newCard) => {
        setCards([newCard.data, ...cards]);
        closeAllPopups();
        console.log(cards);
      })
      .catch((error) => console.log(`Ошибка: ${error}`))
      .finally(() => setIsLoading(false));
  }

  

  function handleLogin(userData) {
    auth
      .authorization(userData)
      .then((res) => {
        if (res.token) {
          localStorage.setItem("token", res.token);
          setLoggedIn(true);
          setEmail(userData.email);
          navigate("/main", { replace: true });
        }
      })
      .catch((err) => {
        console.log(err);
        setIsRegistrationSuccess(false);
        handleSignup("Что-то пошло не так! Попробуйте еще раз.");
      });
  }

  function handleRegister(regUserData) {
    auth
      .registration(regUserData)
      .then(() => {
        navigate("/sign-in", { replace: true });
        setIsRegistrationSuccess(true);
        handleSignup("Вы успешно зарегистрировались!");
      })
      .catch((err) => {
        console.log(err);
        setIsRegistrationSuccess(false);
        handleSignup(`Ошибка при регистрации ${err}`);
      });
  }

  function handleLogout() {
    setLoggedIn(false);
    localStorage.removeItem("token");
    navigate("/sign-in", { replace: true });
  }

  return (
    <div className="page">
      <div className="page__container">
        <CurrentUserContext.Provider value={currentUser}>
          <Routes>
            <Route
              path="/"
              element={
                loggedIn ? (
                  <Navigate to="/main" replace />
                ) : (
                  <Navigate to="/sign-up" replace />
                )
              }
            />
            <Route
              path="/sign-in"
              element={
                <Login onLogin={handleLogin} title="Вход" buttonText="Войти" />
              }
            />
            <Route
              path="/sign-up"
              element={
                <Register
                  onRegister={handleRegister}
                  title="Регистрация"
                  buttonText="Зарегистрироваться"
                />
              }
            />
            <Route
              path="/main"
              element={
                <ProtectedRoute
                  element={Main}
                  onEditProfile={setIsEditProfilePopupOpen}
                  onEditAvatar={setIsEditAvatarPopupOpen}
                  onAddPlace={setIsAddPlacePopupOpen}
                  onPopupDeleteCard={setIsPopupDeleteCardOpen}
                  onCardClick={setSelectedCard}
                  onCardLike={handleLike}
                  onDeletedCard={setDeletedCard}
                  cards={cards}
                  loggedIn={loggedIn}
                  email={email}
                  onSignout={handleLogout}
                />
              }
            />
          </Routes>

          <Footer />
          <AddPlacePopup
            onAddPlace={handleAddPlaceSubmit}
            isOpen={isAddPlacePopupOpen}
            onClose={closeAllPopups}
            onLoading={isLoading}
            onCloseOverlay={closeByOverlay}
          />
          <EditProfilePopup
            isOpen={isEditProfilePopupOpen}
            onUpdateUser={handleUpdateUser}
            onClose={closeAllPopups}
            onLoading={isLoading}
            onCloseOverlay={closeByOverlay}
          />
          <EditAvatarPopup
            onUpdateAvatar={handleUpdateAvatar}
            isOpen={isEditAvatarPopupOpen}
            onClose={closeAllPopups}
            onLoading={isLoading}
            onCloseOverlay={closeByOverlay}
          />
          <PopupDeleteCard
            onClose={closeAllPopups}
            isOpen={isPopupDeleteCardOpen}
            onCardDelete={handleDeleteSubmit}
            onLoading={isLoading}
            card={deletedCard}
            onCloseOverlay={closeByOverlay}
          />
          <ImagePopup
            card={selectedCard}
            onClose={closeAllPopups}
            onCloseOverlay={closeByOverlay}
          />
          <InfoTooltip
            isOpen={isInfoTooltipOpen}
            message={isInfoTooltipMessage}
            isSuccess={isRegistrationSuccess}
            onClose={closeAllPopups}
            onCloseOverlay={closeByOverlay}
          />
        </CurrentUserContext.Provider>
      </div>
    </div>
  );
}

export default App;
