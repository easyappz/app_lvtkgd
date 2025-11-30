import React from 'react';
import { useParams } from 'react-router-dom';

const Profile = () => {
  const { username } = useParams();

  return (
    <div data-easytag='id2-src/components/Profile/index.jsx'>
      <h1>Профиль пользователя: {username}</h1>
      <p>Информация о профиле, посты, друзья и настройки.</p>
    </div>
  );
};

export { Profile };
