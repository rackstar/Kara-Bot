import axios from 'axios';
axios.defaults.headers.common['Authorization'] = 'Bearer ' + localStorage.getItem('userToken');

export const FETCH_CHAT = 'FETCH_CHAT';
export const BOT_ACTIVITY = 'BOT_ACTIVITY';
// export const DELETE_POST = 'DELETE_POST';

// const ROOT_URL = 'http://reduxblog.herokuapp.com/api';
const ROOT_URL = '/api';

export function fetchChat() {
  const request = axios.get(`${ROOT_URL}/getchat`)

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

// export function deletePost(id) {
//   const request = axios.delete(`${ROOT_URL}/posts/${id}${API_KEY}`);

//   return {
//     type: DELETE_POST,
//     payload: request
//   };
// }
