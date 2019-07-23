<template>
  <div class="home">
    <button @click="load">Load Players</button>

    <hr />

    <h1>Select players</h1>
    <p>
      (There are <b>{{ playerNames.length }}</b> players total)
    </p>
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
    <br />
    <span>Отмеченные имена: {{ checkedNames }}</span>

    <hr />

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
        // names.push(Object.keys(record)[0])
        names = [...names, Object.keys(record)[0]]
      }
      return names
    }
  },

  methods: {
    load() {
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
