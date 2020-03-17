<template>
  <div>
    <div class="weather-widget" v-if="this.$store.state.dataIsRecived">
      <span class="weather-widget__date">{{ date }}</span>
      <span>|</span>

      <span class="weather-widget__city"
        ><router-link to="/player/1">Хотяновка,</router-link></span
      >

      <span class="weather-widget__temp">{{ weather.temp }}°C,</span>
      <span class="weather-widget__status">
        <router-link to="/players">
          {{ weather.weather.description }}
        </router-link>
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
  flex-wrap: wrap;
  margin: 10px 0;
  span {
    margin: 2px 5px;
    text-transform: capitalize;
  }
  &__status,
  &__city {
    a {
      color: #000;
      text-decoration: none;
    }
  }
}
</style>
