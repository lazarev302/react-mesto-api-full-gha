import React, { useState, useEffect } from "react";
import CurrentUserContext from "../contexts/CurrentUserContext";
import PopupWithForm from "./PopupWithForm";

function EditProfilePopup(props) {
  const currentUser = React.useContext(CurrentUserContext);
  const [about, setAbout] = useState("");
  const [name, setName] = useState("");

  useEffect(() => {
    setName(currentUser.name);
    setAbout(currentUser.about);
  }, [currentUser, props.isOpen]);

  function handleSubmit(evt) {
    evt.preventDefault();
    props.onUpdateUser({
      name: name,
      about: about,
    });
  }

  function handleChangeName(evt) {
    setName(evt.target.value);
  }

  function handleChangeAbout(evt) {
    setAbout(evt.target.value);
  }

  return (
    <PopupWithForm
      name="popupEditProfile"
      title="Редактировать профиль"
      buttonText={props.onLoading ? `Сохранение` : `Сохранить`}
      onSubmit={handleSubmit}
      onClose={props.onClose}
      isOpen={props.isOpen}
      onCloseOverlay={props.onCloseOverlay}
    >
      <input
        name="name"
        type="text"
        placeholder="Имя"
        minLength="2"
        maxLength="40"
        required
        className="popup__input popup__input_form-name"
        id="username"
        value={name || ""}
        onChange={handleChangeName}
      />
      <span className="username-error popup__input-error" />

      <input
        name="about"
        type="text"
        placeholder="Вид деятельности"
        minLength="2"
        maxLength="200"
        required
        className="popup__input popup__input_form-about"
        id="about"
        value={about || ""}
        onChange={handleChangeAbout}
      />
      <span className="about-error popup__input-error" />
    </PopupWithForm>
  );
}

export default EditProfilePopup;
