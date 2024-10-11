import React, { useState, useEffect } from 'react';
import { getProfile, updateProfile, deleteProfile, getFriendRequestsReceived, acceptFriendRequest, cancelFriendRequest } from '../services/profileService';
import Modal from './Modal';
import { Button, Form, Container, Row, Col, Table } from 'react-bootstrap';
import socket from '../socket';
import './custom.css';

const Profile = ({ username, setAuth, setRoom, setPoints }) => {
  const [profile, setProfile] = useState({
    age: '',
    country: '',
    languageLevel: '',
    bio: '',
    points: 0,
  });
  const [friendRequests, setFriendRequests] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [viewedProfile, setViewedProfile] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await getProfile(username);
        setProfile(data);
        setPoints(data.points);
      } catch (error) {
        console.error("Error fetching profile:", error);
      }
    };

    const fetchFriendRequests = async () => {
      try {
        const requests = await getFriendRequestsReceived(username);
        setFriendRequests(requests);
      } catch (error) {
        console.error("Error fetching friend requests:", error);
      }
    };

    fetchProfile();
    fetchFriendRequests();

    // Socket.IO event listeners
    socket.on('friendRequest', ({ fromUser, toUser }) => {
      if (toUser === username) {
        setFriendRequests(prev => [...prev, { from: fromUser }]);
      }
    });

    socket.on('friendRequestAccepted', ({ fromUser, toUser }) => {
      if (toUser === username) {
        setProfile(prev => ({
          ...prev,
          friends: [...prev.friends, fromUser]
        }));
        setFriendRequests(prev => prev.filter(request => request.from !== fromUser));
      }
    });

    socket.on('friendRequestCancelled', ({ fromUser, toUser }) => {
      if (toUser === username) {
        setFriendRequests(prev => prev.filter(request => request.from !== fromUser));
      }
    });

    socket.on('friendDeleted', ({ user, friendUsername }) => {
      if (friendUsername === username) {
        setProfile(prev => ({
          ...prev,
          friends: prev.friends.filter(friend => friend !== user)
        }));
      }
    });

    return () => {
      socket.off('friendRequest');
      socket.off('friendRequestAccepted');
      socket.off('friendRequestCancelled');
      socket.off('friendDeleted');
    };
  }, [username, setPoints]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const updatedProfile = await updateProfile(username, profile);
      setProfile(updatedProfile);
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteProfile(username);
      alert('Profile deleted');
      setAuth(false);
      setRoom(null);
    } catch (error) {
      console.error("Error deleting profile:", error);
    }
  };

  const handleLogout = () => {
    setAuth(false);
    setRoom(null);
  };

  const handleViewProfile = async (requestUsername) => {
    try {
      const data = await getProfile(requestUsername);
      setViewedProfile(data);
      setIsModalOpen(true);
    } catch (error) {
      console.error("Error viewing profile:", error);
    }
  };

  const handleAcceptRequest = async (fromUser) => {
    try {
      await acceptFriendRequest(username, fromUser);
      setFriendRequests(prev => prev.filter(request => request.from !== fromUser));
      setProfile(prev => ({ ...prev, friends: [...prev.friends, fromUser] }));
      socket.emit('acceptFriendRequest', { fromUser, toUser: username });
    } catch (error) {
      console.error("Error accepting friend request:", error);
    }
  };

  const handleDeclineRequest = async (fromUser) => {
    try {
      await cancelFriendRequest(fromUser, username);
      setFriendRequests(prev => prev.filter(request => request.from !== fromUser));
      socket.emit('cancelFriendRequest', { fromUser, toUser: username });
    } catch (error) {
      console.error("Error declining friend request:", error);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };
  return (
    <Container className="profile-container">
      <Row className="justify-content-center">
        <Col xs={12} md={8}>
          <h2>Profile</h2>
          {isEditing ? (
            <Form onSubmit={handleSubmit}>
              <Form.Group controlId="formAge">
                <Form.Label>Age</Form.Label>
                <Form.Control
                  type="number"
                  name="age"
                  value={profile.age}
                  onChange={(e) => setProfile({ ...profile, age: e.target.value })}
                />
              </Form.Group>
              <Form.Group controlId="formCountry">
                <Form.Label>Country</Form.Label>
                <Form.Control
                  type="text"
                  name="country"
                  value={profile.country}
                  onChange={(e) => setProfile({ ...profile, country: e.target.value })}
                />
              </Form.Group>
              <Form.Group controlId="formLanguageLevel">
                <Form.Label>Language Level</Form.Label>
                <Form.Control
                  type="text"
                  name="languageLevel"
                  value={profile.languageLevel}
                  onChange={(e) => setProfile({ ...profile, languageLevel: e.target.value })}
                />
              </Form.Group>
              <Form.Group controlId="formBio">
                <Form.Label>Bio</Form.Label>
                <Form.Control
                  as="textarea"
                  name="bio"
                  value={profile.bio}
                  onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                />
              </Form.Group>
              <Button variant="primary" type="submit">
                Save
              </Button>
              <Button variant="secondary" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
            </Form>
          ) : (
            <div>
              <p><strong>Username:</strong> {username}</p>
              <p><strong>Age:</strong> {profile.age}</p>
              <p><strong>Country:</strong> {profile.country}</p>
              <p><strong>Language Level:</strong> {profile.languageLevel}</p>
              <p><strong>Bio:</strong> {profile.bio}</p>
              <Button variant="secondary" onClick={() => setIsEditing(true)}>Edit Profile</Button>
            </div>
          )}
          <Button variant="danger" onClick={handleDelete}>Delete Profile</Button>
          <Button variant="dark" onClick={handleLogout}>Logout</Button>
        </Col>
      </Row>
      <Row className="justify-content-center">
        <Col xs={12} md={8}>
          <h3>Friend Requests</h3>
          {friendRequests.length > 0 ? (
            <Table striped bordered hover>
              <thead>
                <tr>
                  <th>Username</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {friendRequests.map((request, index) => (
                  <tr key={index}>
                    <td>{request.from}</td>
                    <td>
                      <Button variant="info" className="mr-2" onClick={() => handleViewProfile(request.from)}>View Profile</Button>
                      <Button variant="success" className="mr-2" onClick={() => handleAcceptRequest(request.from)}>Accept</Button>
                      <Button variant="danger" className="mr-2" onClick={() => handleDeclineRequest(request.from)}>Decline</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          ) : (
            <p>No friend requests</p>
          )}
        </Col>
      </Row>
      <Modal
        show={isModalOpen}
        onClose={handleCloseModal}
        profile={viewedProfile}
        onAccept={() => handleAcceptRequest(viewedProfile?.username)}
        onDecline={() => handleDeclineRequest(viewedProfile?.username)}
      />
    </Container>
  );
};

export default Profile;
