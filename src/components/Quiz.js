import React, { useState, useEffect, useCallback } from 'react';
import socket from '../socket';
import './custom.css';


const Quiz = ({ username, initialPoints, topicKeyword, setRoom }) => {
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [currentPoints, setCurrentPoints] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  const getRandomOptions = (words, correctWord) => {
    const options = words.map(word => `${word.chineseCharacter} (${word.pinyin})`);
    const correctOption = `${correctWord.chineseCharacter} (${correctWord.pinyin})`;
    const shuffled = options.sort(() => 0.5 - Math.random()).filter(opt => opt !== correctOption);
    return [correctOption, ...shuffled.slice(0, 3)].sort(() => 0.5 - Math.random());
  };

  const fetchQuestions = useCallback(async () => {
    const getRandomQuestions = (words, num) => {
      const questions = words.map(word => ({
        question: `What's the Chinese word for "${word.english}"?`,
        options: getRandomOptions(words, word),
        answer: `${word.chineseCharacter} (${word.pinyin})`
      }));
      const shuffled = questions.sort(() => 0.5 - Math.random());
      return shuffled.slice(0, num);
    };

    console.log(`Fetching words for topic keyword: ${topicKeyword}`);
    try {
      const response = await fetch(`http://localhost:5000/api/topics/${topicKeyword}/words`);
      console.log(`Response status: ${response.status}`);
      const data = await response.json();
      const questions = getRandomQuestions(data, 10);
      setQuestions(questions);
    } catch (error) {
      console.error('Error fetching words:', error);
    }
  }, [topicKeyword]);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  const updateSubscriptionPoints = async (points) => {
    try {
      const response = await fetch(`http://localhost:5000/api/subscriptions/${username}/${topicKeyword}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ points })
      });

      if (!response.ok) {
        throw new Error('Failed to update subscription points');
      }

      console.log('Subscription points updated successfully');
      // Emit a socket message when the game is over
      socket.emit('gameOver', { username, topicKeyword, points });
    } catch (error) {
      console.error('Error updating subscription points:', error);
    }
  };

  const handleOptionClick = (option) => {
    if (selectedOption === null) {
      setSelectedOption(option);
      const correct = option === questions[currentQuestion].answer;

      if (correct) {
        setCurrentPoints(currentPoints + 1);
      } else {
        setGameOver(true);
        updateSubscriptionPoints(currentPoints); 
      }
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setSelectedOption(null);
      setCurrentQuestion((prev) => prev + 1);
    } else {
      setGameOver(true);
      updateSubscriptionPoints(currentPoints);
    }
  };

  const handleNewGame = () => {
    setCurrentQuestion(0);
    setSelectedOption(null);
    setCurrentPoints(0);
    setGameOver(false);
    fetchQuestions();
  };

  const handleGoBack = () => {
    setRoom(`topic/${topicKeyword}`);
  };

  return (
    <div className="container">
      <h2>Quiz</h2>
      <div style={{ position: 'fixed', top: '100px', right: '10px' }}>
        Points: {currentPoints}
      </div>
      {gameOver ? (
        <div>
          <h3>Game Over!</h3>
          <button className="btn btn-success" onClick={handleNewGame}>New Game</button>
          <button className="btn btn-secondary" onClick={handleGoBack}>Go Back to Topic Page</button>
        </div>
      ) : (
        questions.length > 0 && currentQuestion < questions.length ? (
          <div>
            <h3>{questions[currentQuestion].question}</h3>
            <ul className="list-group">
              {questions[currentQuestion].options.map((option, index) => {
                let optionClass = '';
                if (selectedOption !== null) {
                  if (option === questions[currentQuestion].answer) {
                    optionClass = 'list-group-item-success';
                  } else if (option === selectedOption) {
                    optionClass = 'list-group-item-danger';
                  }
                }
                return (
                  <li
                    key={index}
                    onClick={() => handleOptionClick(option)}
                    className={`list-group-item ${selectedOption !== null ? optionClass : ''}`}
                    style={{ cursor: 'pointer' }}
                  >
                    {option}
                  </li>
                );
              })}
            </ul>
            {selectedOption !== null && (
              <button className="btn btn-primary mt-3" onClick={handleNextQuestion}>Next Question</button>
            )}
          </div>
        ) : (
          <div>
            <h3>Quiz Completed!</h3>
            <button className="btn btn-success" onClick={handleNewGame}>Finish Quiz</button>
          </div>
        )
      )}
    </div>
  );
};

export default Quiz;
