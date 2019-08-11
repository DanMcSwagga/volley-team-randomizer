<template>
  <div class="header">
    <WeatherWidget />
  </div>
</template>

<script>
import WeatherWidget from '@/components/WeatherWidget.vue'

export default {
  name: 'app-header',

  components: {
    WeatherWidget
  }
}
</script>

<style lang="scss" scoped></style>
