import axios from 'axios'

export const api = axios.create({
  baseURL: '',
  withCredentials: true,
  headers: {
    'Accept': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  },
})

export default api

