import axios from 'axios'
import { CURRENT_WEATHER } from '@/constants' // URL with queries and API key

const apiClient = axios.create({
  baseURL: CURRENT_WEATHER,
  withCredentials: false, // CORS
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json'
  }
})

export default {
  getWeather() {
    return apiClient.get()
  }
}
