import axios from "axios";

const api = axios.create({
  baseURL: "http://31.97.93.193:3001",
});

export default api;