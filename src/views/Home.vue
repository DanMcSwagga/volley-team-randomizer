<template>
  <div class="home">
    <h2>Выбери игроков (всего {{ playerNames.length }})</h2>
    <div class="player-select-wrapper">
      <div
        class="player-wrapper"
        v-for="playerName in playerNames"
        :key="playerName"
      >
        <input
          type="checkbox"
          :id="playerName"
          :value="playerName"
          v-model="checkedNames"
        />
        <label for="playerName">{{ playerName }}</label>
      </div>
    </div>

    <hr />

    <h2>Выбранные игроки</h2>
    {{ checkedNames }}

    <hr />

    <h2>Статистика всех игроков</h2>
    <ul v-for="(row, index) in dataset" :key="`r${index}`">
      {{
        row.toString()
      }}
    </ul>
  </div>
</template>

<script>
import Player from '@/utils/Player.js'
import dataJSON from '@/utils/data.json'

export default {
  name: 'home',

  data: function() {
    return {
      dataset: [],
      checkedNames: []
    }
  },

  computed: {
    playerNames: () => {
      let names = []
      for (let record of dataJSON) {
        names.push(Object.keys(record)[0])
      }
      return names
    }
  },

  methods: {
    loadPlayers() {
      this.dataset = [] // reset

      for (let record of dataJSON) {
        let name = Object.keys(record)[0]
        let link = Object.values(record)[0]

        this.loadData(link, x => {
          this.dataset.push(
            new Player(name, ...x.data[x.data.length - 1].slice(1))
          )
        })
      }

      console.log(this.dataset)
    },

    loadData(url, callback) {
      this.$papa.parse(url, {
        download: true,
        skipEmptyLines: 'greedy',
        delimiter: ',',
        complete: function(results) {
          callback(results)
        }
      })
    }
  },

  created() {
    this.loadPlayers()
  }
}
</script>

<style lang="scss">
button {
  margin: 20px;
}
.player-select-wrapper {
  display: flex;
  flex-wrap: wrap;

  width: 100%;
}
.player-wrapper {
  display: flex;
  flex-direction: row;

  width: fit-content;
  padding: 8px;
  margin: 6px;
  border: 1px solid #5a5a5a;
}
</style>
