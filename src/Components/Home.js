import { Link } from 'react-router-dom';
import logo from '../logo.jpeg';
import Navbar from './Navbar';
import './Catalogue.css';
import './Home.css';

function Home() {
  return (
    <div className="catalogue-page home-page" style={{ display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      <div className="home-hero">
        <div className="home-hero-inner catalogue-inner">
          <div className="home-hero-card">
            <div className="home-logo-wrap">
              <img src={logo} className="home-logo" alt="Crafted Creations Hub" />
            </div>
            <p className="home-kicker">Handmade · curated</p>
            <h1 className="home-title">
              Welcome to <span className="home-title-accent">Crafted Creations Hub</span>
            </h1>
            <p className="home-subtitle">
              Discover unique pieces, browse by category, and find something special — start with the
              catalogue.
            </p>
            <div className="home-actions">
              <Link to="/catalogue" className="home-cta-primary">
                View catalogue
              </Link>
              <Link to="/cart" className="home-cta-ghost">
                Go to cart
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
export default Home;
