import './Footer.css';

const CONTACTS = {
  email: 'craftedcreationsstore@gmail.com',
  whatsapp: '8941022212',
  instagram: 'crafted_creations_hub',
};

function MailIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M3 7l9 6 9-6" />
    </svg>
  );
}

function WhatsAppIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <path d="M19.11 4.91A9.93 9.93 0 0 0 12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.74.46 3.43 1.32 4.93L2 22l5.31-1.39a9.9 9.9 0 0 0 4.73 1.2h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.85-7zM12.04 20.1h-.01a8.18 8.18 0 0 1-4.17-1.14l-.3-.18-3.15.83.84-3.07-.2-.32a8.2 8.2 0 0 1-1.26-4.31c0-4.54 3.7-8.23 8.25-8.23a8.2 8.2 0 0 1 5.83 2.42 8.2 8.2 0 0 1 2.41 5.82c0 4.54-3.69 8.23-8.24 8.23zm4.52-6.16c-.25-.13-1.47-.72-1.7-.81-.23-.08-.39-.13-.56.13-.16.25-.64.81-.78.97-.14.17-.29.19-.54.06-.25-.12-1.05-.39-2-1.23-.74-.66-1.24-1.48-1.39-1.73-.14-.25-.02-.39.11-.51.11-.11.25-.29.37-.43.13-.14.17-.25.25-.41.08-.17.04-.31-.02-.43-.06-.13-.56-1.34-.77-1.84-.2-.49-.41-.42-.56-.43h-.48c-.17 0-.43.06-.66.31s-.86.84-.86 2.05c0 1.21.88 2.38 1 2.55.13.17 1.74 2.66 4.21 3.73.59.25 1.05.4 1.41.51.59.19 1.13.16 1.55.1.47-.07 1.47-.6 1.67-1.18.21-.58.21-1.07.15-1.18-.06-.11-.23-.17-.48-.31z" />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.9" fill="currentColor" stroke="none" />
    </svg>
  );
}

function Footer() {
  const year = new Date().getFullYear();
  const whatsappLink = `https://wa.me/91${CONTACTS.whatsapp}`;
  const instagramLink = `https://instagram.com/${CONTACTS.instagram}`;
  const mailLink = `mailto:${CONTACTS.email}`;

  return (
    <footer className="cch-footer">
      <div className="cch-footer-inner">
        <div className="cch-footer-brand">
          <h3 className="cch-footer-title">Crafted Creations Hub</h3>
          <p className="cch-footer-tagline">Handmade decor &amp; customized gifts</p>
        </div>

        <ul className="cch-footer-contacts">
          <li className="cch-footer-item">
            <a href={mailLink} className="cch-footer-link">
              <span className="cch-footer-icon">
                <MailIcon />
              </span>
              <span className="cch-footer-text">
                <span className="cch-footer-label">Email</span>
                <span className="cch-footer-value">{CONTACTS.email}</span>
              </span>
            </a>
          </li>
          <li className="cch-footer-item">
            <a
              href={whatsappLink}
              className="cch-footer-link"
              target="_blank"
              rel="noopener noreferrer"
            >
              <span className="cch-footer-icon cch-footer-icon--whatsapp">
                <WhatsAppIcon />
              </span>
              <span className="cch-footer-text">
                <span className="cch-footer-label">WhatsApp</span>
                <span className="cch-footer-value">{CONTACTS.whatsapp}</span>
              </span>
            </a>
          </li>
          <li className="cch-footer-item">
            <a
              href={instagramLink}
              className="cch-footer-link"
              target="_blank"
              rel="noopener noreferrer"
            >
              <span className="cch-footer-icon">
                <InstagramIcon />
              </span>
              <span className="cch-footer-text">
                <span className="cch-footer-label">Instagram</span>
                <span className="cch-footer-value">@{CONTACTS.instagram}</span>
              </span>
            </a>
          </li>
        </ul>
      </div>
      <div className="cch-footer-bar">
        <span>&copy; {year} Crafted Creations Hub. All rights reserved.</span>
      </div>
    </footer>
  );
}

export default Footer;
