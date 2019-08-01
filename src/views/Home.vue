<template>
  <div class="home">
    <h2>Выбери игроков (всего {{ playerNames.length }})</h2>
    <h3>
      Кол-во игроков за команду:
      <input v-model.number="playerPerTeam" type="number" />
    </h3>
    <!-- PlayerSelect component -->
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

    <h2>Выбранные игроки</h2>
    {{ checkedNames }}

    <!-- <h2>Статистика всех игроков</h2> -->
    <!-- <ul v-for="(row, index) in players" :key="`r${index}`">
      {{
        row.toString()
      }}
    </ul> -->

    <hr />

    <h2>Сформированные команды</h2>
    <button @click="formTeams">Сформировать</button>
    <button @click="getCurrentPlayers(players)">Текущие</button>
    <div class="team-wrapper">
      <!-- TeamCard component -->
      <ul class="team" v-for="(team, tindex) in teams" :key="`t${tindex}`">
        <h3 class="team-title">Команда {{ tindex + 1 }}</h3>
        <li class="player" v-for="(player, pindex) in team" :key="`p${pindex}`">
          <!-- {{ player.toString() }} -->
          {{ player.name }}
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import Player from '@/utils/Player.js'
import dataJSON from '@/utils/data.json'
import { shuffle, average } from '@/utils/utils.js'

export default {
  name: 'home',

  data: () => ({
    players: [],
    teams: [],
    avgs: [], // TODO: remove (?)
    checkedNames: [],

    playerPerTeam: 4
  }),

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
        att: average(averages.map(arr => arr[0])),
        def: average(averages.map(arr => arr[1])),
        com: average(averages.map(arr => arr[2])),
        tac: average(averages.map(arr => arr[3])),
        sta: average(averages.map(arr => arr[4]))
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
      // ~ Preparations ~
      let lambda = 1 // use later
      let averages = this.getAllAverages() // Needed ?

      let players = this.getCurrentPlayers(this.players),
        numOfTeams = Math.ceil(players.length / this.playerPerTeam),
        teams = new Array(numOfTeams)
      for (let i = 0; i < numOfTeams; i++) teams[i] = []

      let ti = 0, // team iterator
        pi // player iterator

      // ~ Algorithm ~
      while (players.length !== 0) {
        // Reset current player iterator
        pi = 0

        // If team is formed...
        if (teams[ti].length === this.playerPerTeam) {
          // Go to next team
          ti++
        }

        // TODO: Perform checks with current player
        console.log(players[pi])
        // while (pi < players.length) {
        // ...
        // }
        // change lambda here ?

        // Fill team with player
        teams[ti].push(players.splice(pi, 1)[0])
      }

      // Add extra, average players to finish forming teams

      this.teams = teams
      // or this.$forceUpdate()
    },

    getCurrentPlayers(allPlayers) {
      return shuffle(
        allPlayers.filter(
          pl => this.playerNames.indexOf(pl.name) !== -1 // TODO: checkedNames
        )
      )
    },

    // Needed ?
    applyCoef(pl) {
      pl.att *= 3
      pl.def *= 3
      pl.com *= 1
      pl.tac *= 1.5
      pl.sta *= 1.5
      return pl
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
