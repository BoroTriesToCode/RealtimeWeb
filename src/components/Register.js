import React, { useState } from 'react';
import { register } from '../services/authService';  
import { Button, Form, Container, Row, Col, Alert } from 'react-bootstrap';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    age: '',
    country: '',
    languageLevel: '',
    bio: '',
    name: '',
  });

  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setIsSuccess(false);
    const response = await register(formData);
    console.log(response.message);
    if (response.message === 'User registered successfully') {
      setMessage('User registered successfully');
      setIsSuccess(true);
    } else if (response.message === 'Username is already taken' || (response.error && response.error.includes('E11000 duplicate key error'))) {
      setMessage('Username is already taken. Please choose another one!');
      setIsSuccess(false);
    } else {
      console.log("Response: ", response);
      setMessage('Registration failed');
      setIsSuccess(false);
    }
  };
  

  return (
    <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
      <Row className="w-100">
        <Col xs={12} md={6} className="mx-auto">
          <h2>Register</h2>
          <Form onSubmit={handleSubmit}>
            <Form.Group controlId="formBasicUsername">
              <Form.Label>Username</Form.Label>
              <Form.Control
                type="text"
                name="username"
                placeholder="Enter username"
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Form.Group controlId="formBasicPassword">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                name="password"
                placeholder="Enter password"
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Form.Group controlId="formBasicName">
              <Form.Label>Name</Form.Label>
              <Form.Control
                type="text"
                name="name"
                placeholder="Enter your name"
                onChange={handleChange}
              />
            </Form.Group>

            <Form.Group controlId="formBasicAge">
              <Form.Label>Age</Form.Label>
              <Form.Control
                type="number"
                name="age"
                placeholder="Enter age"
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Form.Group controlId="formBasicCountry">
              <Form.Label>Country</Form.Label>
              <Form.Control
                type="text"
                name="country"
                placeholder="Enter country"
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Form.Group controlId="formBasicLanguageLevel">
              <Form.Label>Language Level</Form.Label>
              <Form.Control
                type="text"
                name="languageLevel"
                placeholder="Enter language level"
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Form.Group controlId="formBasicBio">
              <Form.Label>Bio</Form.Label>
              <Form.Control
                as="textarea"
                name="bio"
                placeholder="Enter bio"
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Button variant="primary" type="submit">
              Register
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

export default Register;
