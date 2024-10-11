import React, { useEffect, useState } from 'react';
import { Button, Table, Form } from 'react-bootstrap';

const TopicPage = ({ keyword, setSelectedKeyword, setRoom, username }) => {
  const [words, setWords] = useState([]);
  const [filteredWords, setFilteredWords] = useState([]);
  const [filterLevel, setFilterLevel] = useState('');
  const [topic, setTopic] = useState(null);

  useEffect(() => {
    const fetchWordsAndTopic = async () => {
      if (!keyword || !username) {
        console.error('No keyword or username provided');
        return;
      }
      console.log(`Fetching words for keyword: ${keyword}`);
      try {
        const wordsResponse = await fetch(`http://localhost:5000/api/topics/${keyword}/words`);
        const topicResponse = await fetch(`http://localhost:5000/api/topics/${keyword}`);
        const subscriptionResponse = await fetch(`http://localhost:5000/api/subscriptions/${username}/${keyword}`);

        if (!wordsResponse.ok || !topicResponse.ok || !subscriptionResponse.ok) {
          throw new Error('Failed to fetch data');
        }

        console.log(`Words response status: ${wordsResponse.status}`);
        console.log(`Topic response status: ${topicResponse.status}`);
        console.log(`Subscription response status: ${subscriptionResponse.status}`);

        const wordsData = await wordsResponse.json();
        const topicData = await topicResponse.json();
        await subscriptionResponse.json();

        setWords(wordsData);
        setFilteredWords(wordsData);
        setTopic(topicData);
      } catch (error) {
        console.error('Error fetching words, topic, or subscription:', error);
      }
    };

    fetchWordsAndTopic();
  }, [keyword, username]);

  useEffect(() => {
    console.log('Filtering words by level:', filterLevel);
    setFilteredWords(
      words.filter((word) => (filterLevel ? word.level === filterLevel : true))
    );
  }, [filterLevel, words]);

  const navigateToQuiz = () => {
    setSelectedKeyword(keyword);
    setRoom('quiz');
  };


  return (
    <div className="container">
      <h2>{topic ? topic.name : "Name loading"}</h2>
      <p>{topic ? topic.description : "Description loading"}</p>
      <div className="mb-3">
        <Button variant="primary" onClick={navigateToQuiz}>Quiz</Button>
      </div>
      <h3>Vocabulary</h3>
      <Form.Group controlId="levelFilter">
        <Form.Label>Filter by Level</Form.Label>
        <Form.Control as="select" value={filterLevel} onChange={(e) => setFilterLevel(e.target.value)}>
          <option value="">All Levels</option>
          <option value="HSK1">HSK1</option>
          <option value="HSK2">HSK2</option>
          <option value="HSK3">HSK3</option>
        </Form.Control>
      </Form.Group>
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Chinese Character</th>
            <th>Pinyin</th>
            <th>English</th>
            <th>Level</th>
          </tr>
        </thead>
        <tbody>
          {filteredWords.map((word) => (
            <tr key={word._id}>
              <td>{word.chineseCharacter}</td>
              <td>{word.pinyin}</td>
              <td>{word.english}</td>
              <td>{word.level}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
};

export default TopicPage;
