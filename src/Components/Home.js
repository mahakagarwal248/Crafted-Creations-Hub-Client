import '../App.css';
import logo from '../logo.jpeg'

import Navbar from './Navbar';
import Button from 'react-bootstrap/Button';
import { useNavigate } from 'react-router-dom';

function Home() {
    let navigate = useNavigate()
  return (
    <div
      style={{
        background: "black",
        color: "white",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Navbar />
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "2rem",
        }}
      >
        <img src={logo} className="App-logo" alt="logo" />
        <p style={{ fontSize: "32px", textAlign: "center", marginTop: "1rem" }}>
          Welcome to Crafted Creations Hub!
        </p>
        <Button
          variant="outline-light"
          onClick={() => navigate("/catalogue")}
          style={{ marginTop: "1rem" }}
        >
          View Catalogue
        </Button>
      </div>
    </div>
  );
}

export default Home;
