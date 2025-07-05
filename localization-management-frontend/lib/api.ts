import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ||
  (typeof window !== 'undefined'
    ? '/api' // For client-side in production (relative path to Next.js API routes)
    : 'http://localhost:8000'); // For server-side (SSR/SSG) or development (direct backend)

const API = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

export default API;