<template>
  <div class="home">
    <h2>Выбери игроков (всего {{ playerNames.length }})</h2>
    <div class="player-select-wrapper">
      <div
        class="player-select"
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

    <button @click="avgs = getAllAverages()">getAverages</button>
    <span>{{ avgs }}</span>
    <hr />

    <h2>Выбранные игроки</h2>
    {{ checkedNames }}

    <hr />

    <h2>Статистика всех игроков</h2>
    <ul v-for="(row, index) in players" :key="`r${index}`">
      {{
        row.toString()
      }}
    </ul>

    <hr />

    <h2>Сформированные команды</h2>
    <button @click="formTeams">Сформировать</button>
    <div class="team-wrapper">
      <ul class="team" v-for="(team, index) in teams" :key="`t${index}`">
        <h3 class="team-title">Team {{ index + 1 }}</h3>
        <!-- {{ team.toString() }} -->
        <li class="player" v-for="(player, index) in team" :key="`p${index}`">
          {{ player.toString() }}
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import Player from '@/utils/Player.js'
import dataJSON from '@/utils/data.json'

const PLAYER_PER_TEAM = 4

export default {
  name: 'home',

  data: function() {
    return {
      players: [],
      teams: [],
      avgs: [], // TODO: remove (?)
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

      console.log(this.players)
    },

    getAllAverages() {
      let averages = this.players.map(pl => [
        Number.parseFloat(pl.att),
        Number.parseFloat(pl.def),
        Number.parseFloat(pl.com),
        Number.parseFloat(pl.tac),
        Number.parseFloat(pl.sta)
      ])

      // TODO: toFixed on all values (???)
      return {
        att: this.average(averages.map(arr => arr[0])),
        def: this.average(averages.map(arr => arr[1])),
        com: this.average(averages.map(arr => arr[2])),
        tac: this.average(averages.map(arr => arr[3])),
        sta: this.average(averages.map(arr => arr[4]))
      }
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

    /*
    players
    num of teams
    averages (att / def / ...)

    - wrap in lambda -
    while (players) {
      
    }
    
    take players best suited to fill out empty spaces
      and add them to not fully formed teams

    */

    formTeams() {
      console.log('Forming...')
      // let lambda = 1 // use later

      // Preparations
      let players = this.players
      let numOfTeams = Math.ceil(players.length / PLAYER_PER_TEAM) // needed ?
      this.teams.length = numOfTeams
      for (let i = 0; i < numOfTeams; i++) this.teams[i] = []
      debugger
      let averages = this.getAllAverages(averages)

      let ti = 0, // team iterator
        pi // player iterator

      // ~ Algorithm ~

      while (players.length !== 0) {
        // Reset player iterator
        pi = 0

        // If team is formed...
        if (this.teams[ti].length === PLAYER_PER_TEAM) {
          // Go to next team
          ti++
        }

        // TODO: PERFORM CHECKS WITH THE CURRENT PLAYER (via [pi])

        // Fill team with player
        this.teams[ti].push(players.splice(pi, 1))
      }
    },

    applyCoef(pl) {
      pl.att *= 3
      pl.def *= 3
      pl.com *= 1
      pl.tac *= 1.5
      pl.sta *= 1.5
      return pl
    },

    average: arr => arr.reduce((a, b) => a + b, 0) / arr.length,

    shuffle(array) {
      let i = array.length,
        temp,
        j

      console.log('Shuffling...')
      // While there remain elements to shuffle…
      while (i) {
        // Pick a remaining element…
        j = Math.floor(Math.random() * i--)

        // And swap it with the current element.
        temp = array[i]
        array[i] = array[j]
        array[j] = temp
      }

      return array
    },

    outputPlayers(players) {
      players.forEach(pl => console.log(pl.toString()))
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
  margin: 0 40px;
}
.player-select {
  display: flex;
  flex-direction: row;

  width: fit-content;
  padding: 8px;
  margin: 6px;
  border: 1px solid #5a5a5a;
}
.team-wrapper {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;

  width: 100%;
}
.team {
  width: calc(50% - 80px);
  margin: 20px;
  padding: 0 20px;

  list-style: inside;
}
.player {
  text-align: left;
  padding: 10px;
}
</style>
