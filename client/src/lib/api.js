import axios from 'axios';

export const api = axios.create({ baseURL: '/api' });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('ehub_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const GAMES = [
  { slug: '', label: 'All games' },
  { slug: 'lol', label: 'League of Legends' },
  { slug: 'csgo', label: 'CS2' },
  { slug: 'dota2', label: 'Dota 2' },
  { slug: 'valorant', label: 'Valorant' },
  { slug: 'ow', label: 'Overwatch' },
  { slug: 'r6-siege', label: 'R6 Siege' },
  { slug: 'rl', label: 'Rocket League' },
  { slug: 'pubg', label: 'PUBG' },
  { slug: 'mlbb', label: 'Mobile Legends' },
  { slug: 'kog', label: 'King of Glory' },
  { slug: 'starcraft-2', label: 'StarCraft 2' },
  { slug: 'codmw', label: 'Call of Duty' },
];

export function gameLabel(slug) {
  return GAMES.find((g) => g.slug === slug)?.label ?? slug;
}
