import axios from 'axios';

const apiClient = axios.create({
  baseURL: '/api',
  headers: {
    'Authorization': `Bearer ${import.meta.env.VITE_PANDASCORE_TOKEN}`
  }
});

export const fetchUpcomingMatches = () => {
  return apiClient.get('/matches/upcoming');
};

export const fetchLeagues = () => {
  return apiClient.get('/leagues?sort=-modified_at&per_page=100');
};

export const fetchTeams = () => {
  return apiClient.get('/teams?sort=-modified_at&per_page=100');
};

export const fetchArticles = () => {
    return apiClient.get('/articles');
  };
