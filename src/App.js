import React, { useState } from 'react';
import './App.css';
import Login from './components/Login';
import Register from './components/Register';
import ChatRoom from './components/ChatRoom';
import Home from './components/Home';
import NavBar from './components/NavBar';
import Profile from './components/Profile';
import Quiz from './components/Quiz';
import BrowseProfiles from './components/BrowseProfiles';
import ChatList from './components/ChatList';
import Topics from './components/Topics';
import Leaderboard from './components/Leaderboard'; 
import Dashboard from './components/Dashboard';
import TopicPage from './components/TopicPage'; 
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
  const [isAuth, setAuth] = useState(false);
  const [username, setUsername] = useState('');
  const [room, setRoom] = useState(null);
  const [points, setPoints] = useState(0);
  const [topicKeyword, setTopicKeyword] = useState(null);

  const renderAuthContent = () => {
    if (room && room.startsWith('chatroom/')) {
      return <ChatRoom username={username} room={room} />;
    }

    if (room && room.startsWith('topic/')) {
      const keyword = room.split('/')[1];
      return <TopicPage keyword={keyword} setSelectedKeyword={setTopicKeyword} setRoom={setRoom} username={username} />;
    }

    switch (room) {
      case 'profile':
        return <Profile username={username} setAuth={setAuth} setRoom={setRoom} setPoints={setPoints} />;
      case 'quiz':
        return <Quiz username={username} initialPoints={points} topicKeyword={topicKeyword} setRoom={setRoom} />;
      case 'browse':
        return <BrowseProfiles username={username} />;
      case 'chat':
        return <ChatList username={username} setRoom={setRoom} />;
      case 'topics':
        return <Topics username={username} setRoom={setRoom} />;
      case 'leaderboard':
        return <Leaderboard keyword={topicKeyword} />;
      case 'dashboard':
        return <Dashboard username={username} />;
      default:
        return <Home setRoom={setRoom} />;
    }
  };

  const renderUnauthContent = () => {
    switch (room) {
      case 'login':
        return <Login setAuth={setAuth} setUsername={setUsername} setRoom={setRoom} />;
      case 'register':
        return <Register setRoom={setRoom} />;
      default:
        return <Home setRoom={setRoom} />;
    }
  };

  return (
    <div className="App">
      <NavBar isAuth={isAuth} setAuth={setAuth} setRoom={setRoom} />
      <div className="container mt-4">
        {isAuth ? renderAuthContent() : renderUnauthContent()}
      </div>
    </div>
  );
}

export default App;
