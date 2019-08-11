import Vue from 'vue'
import Vuex from 'vuex'

import service from '@/services/service.js' // service.js fetch data from API

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    weather: {},
    dataIsRecived: false
  },
  mutations: {
    UPDATE_WEATHER(state) {
      service
        .getWeather() // Service function that returns data from API
        .then(response => {
          state.weather = response.data.data[0] // Set weather obj in state to real weather obj
          state.dataIsRecived = true
        })
        .catch(error => {
          console.log('Error:', error.response)
          state.dataIsRecived = false
        })
    }
  },
  actions: {
    updateWeather(context) {
      context.commit('UPDATE_WEATHER')
    }
  }
})
