import axios from 'axios';
import { ARTICLE_API_KEY } from './config.js';

// --- Axios Instance for PandaScore API (via Vite proxy) ---
const pandaScoreApiClient = axios.create({
  baseURL: '/api', 
  headers: {
    'Authorization': `Bearer ${import.meta.env.VITE_PANDASCORE_TOKEN}`
  }
});

// --- Axios Instance for RAWG API ---
const rawgClient = axios.create({
  baseURL: 'https://api.rawg.io/api',
});

// --- Axios Instance for NewsAPI (via Vite proxy) ---
const newsApiClient = axios.create({
  baseURL: '/news-api/v2',
});

// --- PandaScore API Calls (using the proxied client) ---

export const fetchUpcomingMatches = () => {
  return pandaScoreApiClient.get('/matches/upcoming');
};

export const fetchMatchesByIds = (matchIds) => {
  if (!matchIds || matchIds.length === 0) {
    return Promise.resolve({ data: [] });
  }
  return pandaScoreApiClient.get(`/matches?filter[id]=${matchIds.join(',')}`);
};

export const fetchLeagues = () => {
  return pandaScoreApiClient.get('/leagues?sort=-modified_at&per_page=100');
};

export const fetchTeams = () => {
  return pandaScoreApiClient.get('/teams?sort=-modified_at&per_page=100');
};

export const fetchGameDetails = (gameId) => {
    return pandaScoreApiClient.get(`/videogames/${gameId}`);
};

// --- RAWG API Calls (using the direct RAWG client) ---

export const searchGameOnRawg = (gameName) => {
  return rawgClient.get('/games', {
    params: {
      key: import.meta.env.VITE_RAWG_API_KEY,
      search: gameName,
    }
  });
};

// --- NewsAPI Call ---
export const fetchArticles = (query = 'esports') => {
  const params = {
    q: query,
    sortBy: 'publishedAt',
    language: 'en',
    apiKey: ARTICLE_API_KEY,
  };

  return newsApiClient.get('/everything', { params });
};
