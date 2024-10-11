import React, { useState, useEffect } from 'react';
import { getUsers, getProfile, sendFriendRequest, cancelFriendRequest, deleteFriend, acceptFriendRequest, getFriendRequestsReceived, getFriendRequestsSent } from '../services/profileService';
import socket from '../socket';
import './custom.css';

const BrowseProfiles = ({ username }) => {
  const [users, setUsers] = useState([]);
  const [sentRequests, setSentRequests] = useState({});
  const [receivedRequests, setReceivedRequests] = useState({});
  const [friends, setFriends] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getUsers();
        const filteredUsers = data.filter(user => user.username !== username);
        setUsers(filteredUsers);

        const profileData = await getProfile(username);
        const friendsMap = {};
        profileData.friends.forEach(friend => {
          friendsMap[friend] = true;
        });
        setFriends(friendsMap);

        const receivedRequests = await getFriendRequestsReceived(username);
        const receivedRequestsMap = {};
        receivedRequests.forEach(request => {
          receivedRequestsMap[request.from] = true;
        });

        const sentRequests = await getFriendRequestsSent(username);
        const sentRequestsMap = {};
        sentRequests.forEach(request => {
          sentRequestsMap[request.to] = true;
        });

        setReceivedRequests(receivedRequestsMap);
        setSentRequests(sentRequestsMap);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();

    // Socket.IO event listeners
    socket.on('friendRequest', ({ fromUser, toUser }) => {
      console.log('friendRequest received:', { fromUser, toUser });
      if (toUser === username) {
        setReceivedRequests(prev => ({ ...prev, [fromUser]: true }));
      }
    });

    socket.on('friendRequestAccepted', ({ fromUser, toUser }) => {
      console.log('friendRequestAccepted received:', { fromUser, toUser });
      if (toUser === username) {
        setFriends(prev => ({ ...prev, [fromUser]: true }));
        setReceivedRequests(prev => {
          const updated = { ...prev };
          delete updated[fromUser];
          return updated;
        });
      }
      if (fromUser === username) {
        setFriends(prev => ({ ...prev, [toUser]: true }));
        setSentRequests(prev => {
          const updated = { ...prev };
          delete updated[toUser];
          return updated;
        });
      }
    });

    socket.on('friendRequestCancelled', ({ fromUser, toUser }) => {
      console.log('friendRequestCancelled received:', { fromUser, toUser });
      if (toUser === username) {
        setReceivedRequests(prev => {
          const updated = { ...prev };
          delete updated[fromUser];
          return updated;
        });
      }
      if (fromUser === username) {
        setSentRequests(prev => {
          const updated = { ...prev };
          delete updated[toUser];
          return updated;
        });
      }
    });

    socket.on('friendDeleted', ({ user, friendUsername }) => {
      console.log('friendDeleted received:', { user, friendUsername });
      if (user === username || friendUsername === username) {
        setFriends(prev => {
          const updated = { ...prev };
          delete updated[user === username ? friendUsername : user];
          return updated;
        });
      }
    });

    return () => {
      socket.off('friendRequest');
      socket.off('friendRequestAccepted');
      socket.off('friendRequestCancelled');
      socket.off('friendDeleted');
    };
  }, [username]);

  const handleSendRequest = async (toUser) => {
    try {
      if (sentRequests[toUser]) {
        await cancelFriendRequest(username, toUser);
        setSentRequests(prevState => {
          const updated = { ...prevState };
          delete updated[toUser];
          return updated;
        });
        console.log('Emitting cancelFriendRequest event');
        socket.emit('cancelFriendRequest', { fromUser: username, toUser });
      } else {
        await sendFriendRequest(username, toUser);
        setSentRequests(prevState => ({ ...prevState, [toUser]: true }));
        console.log('Emitting sendFriendRequest event');
        socket.emit('sendFriendRequest', { fromUser: username, toUser });
      }
    } catch (error) {
      console.error("Error handling friend request:", error);
    }
  };

  const handleAcceptRequest = async (fromUser) => {
    try {
      await acceptFriendRequest(username, fromUser);
      setReceivedRequests(prevRequests => {
        const updatedRequests = { ...prevRequests };
        delete updatedRequests[fromUser];
        return updatedRequests;
      });
      setFriends(prevFriends => ({ ...prevFriends, [fromUser]: true }));
      console.log('Emitting acceptFriendRequest event');
      socket.emit('acceptFriendRequest', { fromUser, toUser: username });
    } catch (error) {
      console.error("Error accepting friend request:", error);
    }
  };

  const handleDeclineRequest = async (fromUser) => {
    try {
      await cancelFriendRequest(fromUser, username);
      setReceivedRequests(prevRequests => {
        const updatedRequests = { ...prevRequests };
        delete updatedRequests[fromUser];
        return updatedRequests;
      });
      console.log('Emitting cancelFriendRequest event');
      socket.emit('cancelFriendRequest', { fromUser, toUser: username });
    } catch (error) {
      console.error("Error declining friend request:", error);
    }
  };

  const handleDeleteFriend = async (friendUsername) => {
    try {
      await deleteFriend(username, friendUsername);
      setFriends(prevState => {
        const updated = { ...prevState };
        delete updated[friendUsername];
        return updated;
      });
      console.log('Emitting deleteFriend event');
      socket.emit('deleteFriend', { user: username, friendUsername });
    } catch (error) {
      console.error("Error deleting friend:", error);
    }
  };

  return (
    <div className="container">
      <h2>Browse Profiles</h2>
      <div className="profile-grid">
        {users.map((user) => (
          <div key={user.username} className="profile-card">
            <p><strong>Username:</strong> {user.username}</p>
            <p><strong>Age:</strong> {user.age}</p>
            <p><strong>Country:</strong> {user.country}</p>
            <p><strong>Language Level:</strong> {user.languageLevel}</p>
            <p><strong>Bio:</strong> {user.bio}</p>
            {friends[user.username] ? (
              <>
                <span>Friends</span>
                <button 
                  className="btn btn-secondary" 
                  onClick={() => handleDeleteFriend(user.username)}
                >
                  Delete Friend
                </button>
              </>
            ) : receivedRequests[user.username] ? (
              <>
                <button 
                  className="btn btn-success ml-2" 
                  onClick={() => handleAcceptRequest(user.username)}
                >
                  Accept
                </button>
                <button 
                  className="btn btn-danger ml-2" 
                  onClick={() => handleDeclineRequest(user.username)}
                >
                  Decline
                </button>
              </>
            ) : (
              <button 
                className="btn btn-primary" 
                onClick={() => handleSendRequest(user.username)}
              >
                {sentRequests[user.username] ? 'Request Sent' : 'Send Friend Request'}
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default BrowseProfiles;
