import React, { useState, useEffect } from 'react';
import socket from '../socket';
import { Table, Button } from 'react-bootstrap';
import './custom.css';


const Dashboard = ({ username }) => {
  const [subscriptions, setSubscriptions] = useState([]);
  const [leaderboards, setLeaderboards] = useState({});

  useEffect(() => {
    const fetchSubscriptions = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/users/${username}/subscriptions`);
        const data = await response.json();
        setSubscriptions(data);
      } catch (error) {
        console.error('Error fetching subscriptions:', error);
      }
    };

    fetchSubscriptions();

    socket.on('updateLeaderboard', (message) => {
      setLeaderboards((prev) => {
        const updatedLeaderboard = [...(prev[message.keyword] || [])];
        const userIndex = updatedLeaderboard.findIndex(sub => sub.username === message.username);

        if (userIndex > -1) {
          updatedLeaderboard[userIndex].points = message.points;
        } else {
          updatedLeaderboard.push({ username: message.username, points: message.points });
        }

        // Sorting leaderboard in descending order
        updatedLeaderboard.sort((a, b) => b.points - a.points);

        // Remove users with 0 points
        const filteredLeaderboard = updatedLeaderboard.filter(user => user.points > 0);

        return {
          ...prev,
          [message.keyword]: filteredLeaderboard,
        };
      });
    });

    socket.on('removeUserFromLeaderboard', (message) => {
      setLeaderboards((prev) => {
        const updatedLeaderboard = (prev[message.topicKeyword] || []).filter(sub => sub.username !== message.username);

        return {
          ...prev,
          [message.topicKeyword]: updatedLeaderboard,
        };
      });
    });

    return () => {
      socket.off('updateLeaderboard');
      socket.off('removeUserFromLeaderboard');
    };
  }, [username]);

  useEffect(() => {
    subscriptions.forEach(async (sub) => {
      try {
        const response = await fetch(`http://localhost:5000/api/leaderboard/${sub.topicKeyword}`);
        const data = await response.json();
        
        // Sort the leaderboard in descending order based on points
        data.sort((a, b) => b.points - a.points);

        // Filter out users with 0 points
        const filteredData = data.filter(user => user.points > 0);

        setLeaderboards((prev) => ({ ...prev, [sub.topicKeyword]: filteredData }));
      } catch (error) {
        console.error(`Error fetching leaderboard for ${sub.topicKeyword}:`, error);
      }
    });
  }, [subscriptions]);

  const handleUnsubscribe = async (topicKeyword) => {
    try {
      const response = await fetch(`http://localhost:5000/api/subscriptions/${username}/${topicKeyword}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to unsubscribe');
      }

      // Update subscriptions state
      setSubscriptions((prev) => prev.filter(sub => sub.topicKeyword !== topicKeyword));

      // Remove leaderboard of topic when user unsubscribes
      setLeaderboards((prev) => {
        const updated = { ...prev };
        delete updated[topicKeyword];
        return updated;
      });
    } catch (error) {
      console.error('Error unsubscribing from topic:', error);
    }
  };

  return (
    <div className="container">
      <h2>Dashboard</h2>
      {subscriptions.map((sub) => (
        <div key={sub._id} className="mb-4">
          <div className="d-flex justify-content-between align-items-center">
            <h3>Leaderboard for {sub.topicKeyword}</h3>
            <Button variant="secondary" onClick={() => handleUnsubscribe(sub.topicKeyword)}>Unsubscribe</Button>
          </div>
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>Rank</th>
                <th>Username</th>
                <th>Points</th>
              </tr>
            </thead>
            <tbody>
              {(leaderboards[sub.topicKeyword] || []).map((entry, index) => (
                <tr key={entry.username}>
                  <td>{index + 1}</td>
                  <td>{entry.username}</td>
                  <td>{entry.points}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      ))}
    </div>
  );
};

export default Dashboard;
