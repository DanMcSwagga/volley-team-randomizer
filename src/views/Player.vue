<template>
  <div class="player">
    <h1>Игрок #{{ $route.params.id }}</h1>

    <button @click="setCurrentPlayer">Get Current</button>
    <button @click="goNext">Go Next</button>
    <div v-if="currentPlayer">
      <hr />
      <h2>Стата игрока: {{ currentPlayer.name }}</h2>

      <!-- Stats -->
      <svg width="220" height="220">
        <g>
          <polygon :points="points"></polygon>
          <circle cx="100" cy="100" r="80"></circle>
          <axis-label
            v-for="(stat, index) in stats"
            :key="index"
            :stat="stat"
            :index="index"
            :total="stats.length"
          />
        </g>
      </svg>
      <!-- controls -->
      <div v-for="(stat, index) in stats" :key="index">
        <label>{{ stat.label }}</label>
        <input type="range" v-model="stat.value" min="0" max="100" />
        <span>{{ stat.value }}</span>
      </div>
    </div>

    <hr />

    <!-- <h1>All players:</h1>

    <div v-for="player in players" :key="player.name">
      <span>{{ player.name }}</span>
    </div> -->
  </div>
</template>

<script>
import dataJSON from '@/utils/data.json'
import { valueToPoint } from '@/utils/utils.js'

import Player from '@/utils/Player.js'
import AxisLabel from '@/components/AxisLabel.vue'

const initialStats = [
  { label: 'att', value: 100 },
  { label: 'def', value: 100 },
  { label: 'com', value: 100 },
  { label: 'tac', value: 100 },
  { label: 'sta', value: 100 }
]

export default {
  name: 'home',

  data: () => ({
    players: [],
    currentPlayer: null,
    stats: initialStats
  }),

  components: {
    AxisLabel
  },

  computed: {
    // a computed property for the polygon's points
    points: function() {
      const total = this.stats.length
      return this.stats
        .map(function(stat, i) {
          const point = valueToPoint(stat.value, i, total)
          return point.x + ',' + point.y
        })
        .join(' ')
    }
  },

  methods: {
    loadData(url, callback) {
      this.$papa.parse(url, {
        download: true,
        skipEmptyLines: 'greedy',
        delimiter: ',',
        dynamicTyping: 'true',
        complete: function(results) {
          callback(results)
        }
      })
    },

    setCurrentPlayer() {
      this.currentPlayer = this.players[this.$route.params.id]

      const setPlayerAttributeStat = st =>
        (st.value = (this.currentPlayer[st.label] * 10).toFixed(2))

      this.stats.forEach(setPlayerAttributeStat)

      console.log(`${this.currentPlayer.name}:`)
      console.log(this.currentPlayer.toString())
    },

    loadPlayers() {
      this.players = [] // reset

      for (let record of dataJSON) {
        let name = Object.keys(record)[0]
        let link = Object.values(record)[0]

        this.loadData(link, x => {
          this.players.push(
            new Player(name, ...x.data[x.data.length - 1].slice(1))
          )
        })
      }
    },

    goNext() {
      this.currentPlayer = null
      this.$router.push(
        `/player/${(+this.$route.params.id + 1) % this.players.length}`
      )
    }
  },

  mounted() {
    this.loadPlayers()
  }
}
</script>

<style lang="scss" scoped>
polygon {
  fill: rgba(59, 153, 252, 1);
  opacity: 0.75;
}

circle {
  fill: transparent;
  stroke: #999;
}

label {
  display: inline-block;
  margin-left: 10px;
  width: 20px;
}

#raw {
  position: absolute;
  top: 0;
  left: 300px;
}
</style>
