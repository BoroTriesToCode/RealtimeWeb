import React, { useEffect, useState } from 'react';

const Subscription = ({ userId }) => {
  const [subscriptions, setSubscriptions] = useState([]);
  
  useEffect(() => {
    const fetchSubscriptions = async () => {
      const response = await fetch(`/api/subscriptions/${userId}`);
      const data = await response.json();
      setSubscriptions(data);
    };
    fetchSubscriptions();
  }, [userId]);

  return (
    <div>
      <h1>Your Subscriptions</h1>
      {subscriptions.map(sub => (
        <div key={sub._id}>
          <h2>{sub.topicId.name}</h2>
          <p>Points: {sub.points}</p>
        </div>
      ))}
    </div>
  );
};

export default Subscription;
