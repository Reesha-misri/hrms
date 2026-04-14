const API_URL = process.env.REACT_APP_API_URL || (window.location.hostname === "localhost" ? "http://localhost:3001/api" : "/api");
export default API_URL;
