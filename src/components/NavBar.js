import React from 'react';
import { Navbar, Nav, Button } from 'react-bootstrap';
import './custom.css';


const NavBar = ({ isAuth, setAuth, setRoom }) => {
  const handleLogout = () => {
    setAuth(false);
    setRoom(null);
  };

  return (
    <Navbar bg="dark" variant="dark" expand="lg">
      <Navbar.Brand href="#home" onClick={() => setRoom(null)}>Liao Lingo</Navbar.Brand>
      <Navbar.Toggle aria-controls="basic-navbar-nav" />
      <Navbar.Collapse id="basic-navbar-nav">
        <Nav className="mr-auto">
          <Nav.Link href="#home" onClick={() => setRoom(null)}>Home</Nav.Link>
          {isAuth ? (
            <>
              <Nav.Link href="#profile" onClick={() => setRoom('profile')}>Profile</Nav.Link>
              <Nav.Link href="#browse" onClick={() => setRoom('browse')}>Browse Profiles</Nav.Link>
              <Nav.Link href="#chat" onClick={() => setRoom('chat')}>Chat</Nav.Link>
              <Nav.Link href="#topics" onClick={() => setRoom('topics')}>Topics</Nav.Link>
              <Nav.Link href="#dashboard" onClick={() => setRoom('dashboard')}>Dashboard</Nav.Link>
            </>
          ) : (
            <>
              <Nav.Link href="#login" onClick={() => setRoom('login')}>Login</Nav.Link>
              <Nav.Link href="#register" onClick={() => setRoom('register')}>Register</Nav.Link>
            </>
          )}
        </Nav>
        {isAuth && (
          <Button variant="light" onClick={handleLogout} style={{ marginLeft: 'auto' }}>
            Logout
          </Button>
        )}
      </Navbar.Collapse>
    </Navbar>
  );
};

export default NavBar;
