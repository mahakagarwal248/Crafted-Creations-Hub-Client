import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Resets the scroll position to the top of the page on every route change.
 * The app uses the `.App` div as the scroll container (height: 100vh; overflow-y: scroll),
 * so we scroll that element instead of (or in addition to) window.
 *
 * Place this component inside <Router> and above <Routes>.
 */
function ScrollToTop() {
  const { pathname, search } = useLocation();

  useEffect(() => {
    const appEl = document.querySelector('.App');
    if (appEl) appEl.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    // Fallback for any other scrollable ancestor (e.g. when CSS changes).
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    }
  }, [pathname, search]);

  return null;
}

export default ScrollToTop;
