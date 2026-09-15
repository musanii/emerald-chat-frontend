import Echo from "laravel-echo";
import Pusher from "pusher-js";

window.Pusher = Pusher;

export const echo = new Echo({
  broadcaster: "reverb",
  key: import.meta.env.VITE_REVERB_APP_KEY || "emerald_reverb_key",
  wsHost: import.meta.env.VITE_REVERB_HOST || "127.0.0.1",
  wsPort: import.meta.env.VITE_REVERB_PORT || 8080,
  forceTLS: (import.meta.env.VITE_REVERB_SCHEME || "http") == "https",
  enabledTransports: ["ws", "wss"],
  authEndpoint: "http://localhost:8000/api/v1/broadcasting/auth",
  auth: {
    headers: {
      authorization: `Bearer ${localStorage.getItem("emerald_token")}`,
      Accept: "application/json",
    },
  },
});
