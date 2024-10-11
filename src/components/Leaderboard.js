import React, { useEffect, useState, useCallback } from 'react';
import { Table } from 'react-bootstrap';
import socket from '../socket';

const Leaderboard = ({ keyword }) => {
  const [leaderboard, setLeaderboard] = useState([]);

  const fetchLeaderboard = useCallback(async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/leaderboard/${keyword}`);
      if (!response.ok) {
        throw new Error('Failed to fetch data');
      }
      const data = await response.json();
      // Sort data in descending order based on points
      data.sort((a, b) => b.points - a.points);
      setLeaderboard(data);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    }
  }, [keyword]);

  useEffect(() => {
    fetchLeaderboard();

    socket.on('updateLeaderboard', (message) => {
      if (message.keyword === keyword) {
        fetchLeaderboard();
      }
    });

    return () => {
      socket.off('updateLeaderboard');
    };
  }, [fetchLeaderboard, keyword]);

  return (
    <div className="container">
      <h2>Leaderboard for {keyword}</h2>
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Rank</th>
            <th>Username</th>
            <th>Points</th>
          </tr>
        </thead>
        <tbody>
          {leaderboard.map((entry, index) => (
            <tr key={index}>
              <td>{index + 1}</td>
              <td>{entry.username}</td>
              <td>{entry.points}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
};

export default Leaderboard;
