<template>
  <div class="home">
    <button @click="load">LOAD</button>
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
      dataset: []
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
</style>
