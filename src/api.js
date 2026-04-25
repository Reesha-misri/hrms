const hostname = window.location.hostname;
const isLocalNetwork = hostname === "localhost" || /^[0-9.]+$/.test(hostname);
const API_URL = process.env.REACT_APP_API_URL || (isLocalNetwork ? `http://${hostname}:3001/api` : "/api");

export default API_URL;
