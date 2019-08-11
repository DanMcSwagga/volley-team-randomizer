<template>
  <div>
    <div class="weather-widget" v-if="this.$store.state.dataIsRecived">
      <span class="weather-widget__date">{{ date }}</span>
      <span>|</span>
      <span class="weather-widget__city">Хотяновка,</span>
      <span class="weather-widget__temp">{{ weather.temp }}°C,</span>
      <span class="weather-widget__status">
        {{ weather.weather.description }}
      </span>
    </div>
    <div v-else class="weather-widget">
      <!-- <img src="spinner.svg" alt="Weather loading..." /> -->
      <span>Weather loading...</span>
    </div>
  </div>
</template>

<script>
export default {
  computed: {
    date() {
      const today = new Date()
      let month = today.toLocaleString('ru-ru', { month: 'short' }).slice(0, -1)
      return `${month} ${today.getDate()}`
    },
    weather() {
      return this.$store.state.weather
    }
  },

  created() {
    this.$store.dispatch('updateWeather')
  }
}
</script>

<style lang="scss" scoped>
.weather-widget {
  display: flex;
  justify-content: center;

  span {
    margin: 10px 5px;
    text-transform: capitalize;
  }
}
</style>
