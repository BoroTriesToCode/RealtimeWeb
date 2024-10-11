const API_URL = 'http://localhost:5000/api/users';

export const getFriendRequestsReceived = async (username) => {
  const response = await fetch(`${API_URL}/${username}/friend-requests/received`);
  if (!response.ok) {
    throw new Error('Error fetching friend requests received');
  }
  return response.json();
};

export const getFriendRequestsSent = async (username) => {
  const response = await fetch(`${API_URL}/${username}/friend-requests/sent`);
  if (!response.ok) {
    throw new Error('Error fetching friend requests sent');
  }
  return response.json();
};

export const getProfile = async (username) => {
  const response = await fetch(`${API_URL}/${username}`);
  return response.json();
};

export const updateProfile = async (username, profile) => {
  const response = await fetch(`${API_URL}/${username}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(profile),
  });
  return response.json();
};

export const deleteProfile = async (username) => {
  const response = await fetch(`${API_URL}/${username}`, {
    method: 'DELETE',
  });
  return response.json();
};

export const getUsers = async () => {
  const response = await fetch(API_URL);
  return response.json();
};

export const sendFriendRequest = async (fromUser, toUser) => {
  const response = await fetch(`${API_URL}/${fromUser}/friend-requests`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ toUser }),
  });
  if (!response.ok) {
    throw new Error(`Error sending friend request: ${response.statusText}`);
  }
  return response.json();
};


export const cancelFriendRequest = async (fromUser, toUser) => {
  const response = await fetch(`${API_URL}/${fromUser}/friend-requests/${toUser}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!response.ok) {
    throw new Error(`Error cancelling friend request: ${response.statusText}`);
  } else {
    console.log('Friend request cancelled successfully');
  }
  return response.json();
};

export const acceptFriendRequest = async (toUser, fromUser) => {
  const response = await fetch(`${API_URL}/${toUser}/friend-requests/${fromUser}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
  });
  return response.json();
};

export const deleteFriend = async (username, friendUsername) => {
  const response = await fetch(`${API_URL}/${username}/friends/${friendUsername}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!response.ok) {
    throw new Error(`Error deleting friend: ${response.statusText}`);
  }
  return response.json();
};

export const getFriends = async (username) => {
  try {
    const response = await fetch(`${API_URL}/${username}/friends`);
    if (!response.ok) {
      throw new Error(`Error fetching friends: ${response.statusText}`);
    }
    const friends = await response.json();
    return friends;
  } catch (error) {
    console.error('Error fetching friends:', error);
    throw error;
  }
};
