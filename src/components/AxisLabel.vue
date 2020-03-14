<template>
  <text :x="point.x" :y="point.y">{{ stat.label.toUpperCase() }}</text>
</template>

<script>
import { valueToPoint } from '@/utils/utils.js'

export default {
  props: {
    stat: Object,
    index: Number,
    total: Number
  },

  name: 'axis-label',

  computed: {
    point: function() {
      return valueToPoint(+this.stat.value + 15, this.index, this.total)
    }
  }
}
</script>

<style lang="scss" scoped>
text {
  font-size: 12px;
  fill: #333;
  transform: translateX(-10px) translateY(5px);
}
</style>
