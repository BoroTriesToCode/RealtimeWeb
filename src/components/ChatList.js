import React, { useEffect, useState } from 'react';
import { Button, ListGroup } from 'react-bootstrap';

const ChatList = ({ username, setRoom }) => {
  const [friends, setFriends] = useState([]);

  useEffect(() => {
    const fetchFriends = async () => {
      if (username) {
        try {
          console.log(`Fetching friends for user: ${username}`);
          const response = await fetch(`/api/users/${username}/friends`);
          const textResponse = await response.text();
          console.log('Response text:', textResponse);

          if (!response.ok) {
            throw new Error('Error at network response');
          }
          const friendsList = JSON.parse(textResponse);
          console.log(`Fetched friends: ${JSON.stringify(friendsList)}`);
          setFriends(friendsList);
        } catch (error) {
          console.error('Error fetching friends:', error);
        }
      }
    };

    fetchFriends();
  }, [username]);

  return (
    <div className="chat-list-container">
      <h2>Your Friends</h2>
      <ListGroup>
        {friends.length > 0 ? (
          friends.map((friend, index) => (
            <ListGroup.Item key={index} className="d-flex justify-content-between align-items-center">
              {friend}
              <Button variant="primary" onClick={() => setRoom(`chatroom/${friend}`)}>Chat</Button>
            </ListGroup.Item>
          ))
        ) : (
          <ListGroup.Item>No friends found</ListGroup.Item>
        )}
      </ListGroup>
    </div>
  );
};

export default ChatList;
