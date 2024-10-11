import React, { useEffect, useState } from 'react';
import { Button } from 'react-bootstrap';

const Topics = ({ setRoom, username }) => {
  const [topics, setTopics] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);

  useEffect(() => {
    const fetchTopics = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/topics');
        const data = await response.json();
        setTopics(data);
      } catch (error) {
        console.error('Error fetching topics:', error);
      }
    };

    const fetchSubscriptions = async () => {
      if (!username) {
        console.error('No username provided');
        return;
      }
      try {
        const response = await fetch(`http://localhost:5000/api/subscriptions/${username}`);
        const data = await response.json();
        setSubscriptions(data);
      } catch (error) {
        console.error('Error fetching subscriptions:', error);
      }
    };

    fetchTopics();
    fetchSubscriptions();
  }, [username]);

  const isSubscribed = (topicId) => 
    Array.isArray(subscriptions) && subscriptions.some(sub => sub.topicKeyword === topicId);

  const handleJoin = async (topicId, keyword) => {
    try {
      const response = await fetch('http://localhost:5000/api/subscriptions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, topicKeyword: keyword }),
      });

      if (response.ok) {
        const newSubscription = await response.json();
        setSubscriptions([...subscriptions, newSubscription]);
        setRoom(`topic/${keyword}`);
      } else {
        console.error('Failed to join topic');
      }
    } catch (error) {
      console.error('Error joining topic:', error);
    }
  };

  return (
    <div className="container">
      <h2>Topics</h2>
      <div className="row">
        {topics.map((topic) => (
          <div key={topic._id} className="col-md-4">
            <div className="card mb-4">
              <div className="card-body">
                <h5 className="card-title">{topic.name}</h5>
                <p className="card-text">{topic.description}</p>
                {isSubscribed(topic.keyword) ? (
                  <>
                    <p>Member</p>
                    <Button variant="success" onClick={() => setRoom(`topic/${topic.keyword}`)}>View</Button>
                  </>
                ) : (
                  <Button variant="primary" onClick={() => handleJoin(topic._id, topic.keyword)}>Join</Button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Topics;
