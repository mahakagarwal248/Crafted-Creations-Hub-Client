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
        // paddingTop: "25px",
        // paddingBottom: "25px",
      }}
    >
        <Navbar/>
        <img src={logo} className="App-logo" alt="logo" />
        <p style={{ fontSize: "32px" }}>Welcome to Crafted Creations Hub!</p>
        <Button variant="outline-light" onClick={()=> navigate("/catalogue")}>View Catalogue</Button>
    </div>
  );
}

export default Home;
