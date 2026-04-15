const isDev = import.meta.env.DEV;

export const BASE_URL = isDev
    ? (import.meta.env.VITE_BACKEND_URL || `http://localhost:5000`)
    : "https://backend.silentlab.work";
