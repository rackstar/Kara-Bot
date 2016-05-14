import axios from 'axios';
axios.defaults.headers.common['Authorization'] = 'Bearer ' + localStorage.getItem('userToken');

export const FETCH_CHANNELS = 'FETCH_CHANNELS';
export const FETCH_CHAT = 'FETCH_CHAT';
export const BOT_ACTIVITY = 'BOT_ACTIVITY';

const ROOT_URL = '/api';

export function fetchChannels() {
  const request = axios.get(`${ROOT_URL}/channel`);

  return {
    type: FETCH_CHANNELS,
    payload: request
  };
}

export function fetchChat(id) {
  const request = axios.post(`${ROOT_URL}/channel/${id}`)

  return {
    type: FETCH_CHAT,
    payload: request
  };
}

export function botActivity() {
  const request = axios.get(`${ROOT_URL}/getbot`);

  return {
    type: BOT_ACTIVITY,
    payload: request
  };
}
