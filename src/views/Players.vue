<template>
  <div class="players-page">
    <h1>Displaying all players</h1>
    <button @click="setPlayers">Get All</button>
    <hr />

    <div class="players-wrapper" v-if="stats !== null">
      <div class="player" v-for="(player, pi) in players" :key="pi">
        <h2>{{ player.name }}:</h2>
        <!-- Stats -->
        <svg width="220" height="220">
          <g>
            <polygon :points="getPoints(pi)"></polygon>
            <circle cx="100" cy="100" r="75"></circle>
            <circle cx="100" cy="100" r="60"></circle>
            <circle cx="100" cy="100" r="45"></circle>
            <circle cx="100" cy="100" r="30"></circle>
            <circle cx="100" cy="100" r="15"></circle>
            <circle cx="100" cy="100" r="1"></circle>
            <axis-label
              v-for="(stat, index) in stats[pi]"
              :key="index"
              :stat="stat"
              :index="index"
              :total="stats[pi].length"
            />
          </g>
        </svg>
      </div>
    </div>
  </div>
</template>

<script>
import dataJSON from '@/utils/data.json'
import { averages2d, configAttributes, valueToPoint } from '@/utils/utils.js'

import Player from '@/utils/Player.js'
import AxisLabel from '@/components/AxisLabel.vue'
import { ATTS } from '@/constants.js'

const initialStats = ATTS.map(x => {
  return { label: x, value: 100 }
})

export default {
  name: 'home',

  data: () => ({
    players: null,
    currentPlayer: null,
    stats: null
  }),

  components: {
    AxisLabel
  },

  methods: {
    getPoints: function(pi) {
      const total = this.stats[pi].length
      return this.stats[pi]
        .map(function(stat, i) {
          const point = valueToPoint(stat.value, i, total)
          return point.x + ',' + point.y
        })
        .join(' ')
    },

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

    setPlayers() {
      this.stats = []
      this.players.forEach((player, pi) => {
        this.stats[pi] = initialStats

        this.stats[pi].forEach(st =>
          (st.value = player[st.label] * 10).toFixed(2)
        )
      })
    },

    loadPlayers() {
      this.players = [] // reset

      for (let record of dataJSON) {
        let name = Object.keys(record)[0]
        let link = Object.values(record)[0]

        this.loadData(link, x => {
          const cleanMatrix = x.data
            .slice(1)
            .map(row => row.slice(1).map(el => +el))

          const averages = averages2d(cleanMatrix)

          this.players.push(new Player(name, configAttributes(averages)))
        })
      }
    },

    goNext() {
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
  stroke: #ccc;
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

.players-wrapper {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
}
.player {
  width: 30%;
  text-align: center;
}
</style>
