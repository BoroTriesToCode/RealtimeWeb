import React, { useState } from 'react';
import { login } from '../services/authService';
import { Button, Form, Container, Row, Col, Alert } from 'react-bootstrap';

const Login = ({ setAuth, setUsername, setRoom }) => {
  const [username, setUsernameLocal] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setIsSuccess(false);
    const user = { username, password };
    const response = await login(user);
    console.log(response);
    if (response.message === 'User logged in') {
      console.log(`Logging in with username: ${username}`);
      setAuth(true);
      setUsername(username);
      setRoom('profile');
    } else {
      setMessage('Invalid credentials');
      setIsSuccess(false);
    }
  };

  return (
    <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
      <Row className="w-100">
        <Col xs={12} md={6} className="mx-auto">
          <h2>Login</h2>
          <Form onSubmit={handleSubmit}>
            <Form.Group controlId="formBasicUsername">
              <Form.Label>Username</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter username"
                value={username}
                onChange={(e) => setUsernameLocal(e.target.value)}
                required
              />
            </Form.Group>

            <Form.Group controlId="formBasicPassword">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </Form.Group>

            <Button variant="primary" type="submit">
              Login
            </Button>

            {message && (
              <Alert variant={isSuccess ? "success" : "danger"} className="mt-3">
                {message}
              </Alert>
            )}
          </Form>
        </Col>
      </Row>
    </Container>
  );
};

export default Login;
