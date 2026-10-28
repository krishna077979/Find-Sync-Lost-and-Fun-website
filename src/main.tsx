import {createRoot} from "react-dom/client";
import "leaflet/dist/leaflet.css";
import App from "./App.tsx";
import "./index.css";

// Check if current window was opened as OAuth callback
const isAuthCallback =
  typeof window !== 'undefined' &&
  window.location.pathname.startsWith('/auth/callback');

if (isAuthCallback) {
  try {
    const payload = {
      type: 'FINDSYNC_GOOGLE_AUTH_CALLBACK',
      hash: window.location.hash || '',
      search: window.location.search || '',
      href: window.location.href,
      origin: window.location.origin,
    };

    if (window.opener && !window.opener.closed) {
      // Notify parent window of OAuth result
      try {
        window.opener.postMessage(payload, window.location.origin);
      } catch (_) {}
      try {
        window.opener.postMessage(payload, '*');
      } catch (_) {}

      // Render a clean visual confirmation while popup terminates
      const rootElement = document.getElementById('root');
      if (rootElement) {
        rootElement.innerHTML = `
          <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100vh;font-family:system-ui,-apple-system,sans-serif;color:#012d1d;background-color:#fbf9f5;padding:24px;text-align:center;">
            <div style="width:36px;height:36px;border:3px solid #d5e7da;border-top-color:#012d1d;border-radius:50%;animation:spin 0.8s linear infinite;margin-bottom:16px;"></div>
            <style>@keyframes spin{to{transform:rotate(360deg);}}</style>
            <h2 style="margin:0 0 8px;font-size:18px;font-weight:700;">Google Authentication Verified</h2>
            <p style="margin:0;font-size:13px;color:#555;">Returning to FindSync and closing this window...</p>
          </div>
        `;
      }

      // Close popup window immediately with fallback timeout
      window.close();
      setTimeout(() => {
        window.close();
      }, 300);
    } else {
      // If navigated directly without an opener, redirect back to application root
      window.location.replace('/' + (window.location.hash || window.location.search));
    }
  } catch (err) {
    console.error('OAuth callback handling error:', err);
  }
} else {
  createRoot(document.getElementById('root')!).render(<App />);
}
