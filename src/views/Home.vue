<template>
  <div class="home">
    <WeatherWidget />

    <hr />

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

    <h2>Сформированные команды</h2>
    <span>
      <b>Точность: {{ lambda }}</b>
    </span>
    <button @click="formTeams">Сформировать</button>
    <p>
      <i>
        Точность формулирования команд (1 отлично, 2-3 хорошо, 4+ плохо)
      </i>
    </p>

    <div class="team-wrapper">
      <!-- TeamCard component -->
      <ul class="team" v-for="(team, tindex) in teams" :key="`t${tindex}`">
        <h3 class="team-title">Команда {{ tindex + 1 }}</h3>
        <h3>
          {{ team.score.toFixed(2) }} >
          {{ (team.score / team.players.length).toFixed(2) }}
        </h3>
        <li
          class="player"
          v-for="(player, pindex) in team.players"
          :key="`p${pindex}`"
        >
          {{ DEV_MODE ? player.toString() : player.name }}
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import WeatherWidget from '@/components/WeatherWidget.vue'

import Player from '@/utils/Player.js'
import dataJSON from '@/utils/data.json'
import dummies from '@/utils/dummies.json'
import { shuffle, average, sum, passWithout } from '@/utils/utils.js'

const ATT_MIN = 4 // < than lowest possible attribute score
const ATT_MULT = [4, 4, 1, 3, 2] // attribute multipliers
const DUMMY = true // condition to include dummies

export default {
  name: 'home',

  components: {
    WeatherWidget
  },

  data: () => ({
    players: [],
    teams: [],
    checkedNames: [],
    playerPerTeam: 4,
    lambda: 1, // allowance error

    DEV_MODE: false // mode for development
  }),

  computed: {
    playerNames: () => {
      let names = []
      for (let record of dataJSON) {
        names.push(Object.keys(record)[0]) // adding actual players
      }
      if (DUMMY)
        for (let dummy of dummies) {
          names.push(dummy['name']) // adding dummies
        }
      return names
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

      if (DUMMY) this.addDummies()
    },

    addDummies() {
      for (let dummy of dummies) {
        let pl = new Player('', 0, 0, 0, 0, 0)
        Object.assign(pl, dummy)
        this.players.push(pl)
      }
    },

    getCurrentPlayers(allPlayers) {
      return shuffle(
        allPlayers.filter(pl =>
          this.DEV_MODE
            ? this.playerNames
            : this.checkedNames.indexOf(pl.name) !== -1
        )
      )
    },

    formTeams() {
      console.log('Forming teams...')
      // ~ Preparations ~
      this.lambda = 1

      let players = this.getCurrentPlayers(this.players)
      let numOfTeams = Math.ceil(players.length / this.playerPerTeam)
      let teams = new Array(numOfTeams)
      for (let i = 0; i < numOfTeams; i++) teams[i] = { players: [], score: 0 }

      let ti = 0, // team iterator
        pi = 0 // player iterator

      let averages = this.getAllAverages(players)
      let scoreAverage = this.formScore(averages)

      let extraPlayerRemovalFlag = false // N-1th player check

      console.log('AVERAGE = ' + scoreAverage)
      // ~ Algorithm ~
      while (players.length !== 0) {
        let scorePlayer = this.formScore(passWithout(players[pi], 'name'))
        console.log(players[pi].name + ' = ' + scorePlayer)

        // Add player to team, increase team score
        teams[ti].players.push(players.splice(pi, 1)[0])
        teams[ti].score += scorePlayer

        // debugger

        // TODO: reformat to: handleFormedTeam(...)
        // and use some recursive function
        // to get rid of players in a team until the first member
        // so that we eliminate the need of multiple formTeam presses
        // + change extraPlayerRemovalFlag to stack-array of T/f (?)
        // + use same function later to fill the last unformed team

        // If team is formed...
        if (teams[ti].players.length === this.playerPerTeam) {
          // If team average doesn't fit lambda
          if (this.teamDiff(teams[ti], scoreAverage) > this.lambda) {
            players.unshift(teams[ti].players.pop()) // Remove Nth player to start
            teams[ti].score -= scorePlayer // Remove score
            pi++ // Then try next player

            // If there are no players left...
            if (pi === players.length) {
              // If already tried removing N-1th player from team...
              if (extraPlayerRemovalFlag) {
                this.lambda += 1 // Increase lambda - allowance error | *= 2
                extraPlayerRemovalFlag = false // Reset N-1th player check
              } else {
                players.push(teams[ti].players.pop()) // Remove N-1th player to end
                teams[ti].score -= scorePlayer // Remove score
                extraPlayerRemovalFlag = true // Set flag to know when N-1th was removed
              }
              pi = 0 // Reset current player iterator
            }
          } else {
            ti++ // Go to next team
            pi = 0 // Reset current player iterator
          }
        }
      }

      // Add extra, average players to finish forming teams

      this.teams = teams
      // or this.$forceUpdate()
    },

    teamDiff: (team, avg) => Math.abs(team.score / team.players.length - avg),

    getAllAverages(players) {
      // TODO: think of a way to utilize passWithout()
      let averages = players.map(pl => [
        Number.parseFloat(pl.att),
        Number.parseFloat(pl.def),
        Number.parseFloat(pl.com),
        Number.parseFloat(pl.tac),
        Number.parseFloat(pl.sta)
      ])

      return {
        att: average(averages.map(arr => arr[0])),
        def: average(averages.map(arr => arr[1])),
        com: average(averages.map(arr => arr[2])),
        tac: average(averages.map(arr => arr[3])),
        sta: average(averages.map(arr => arr[4]))
      }
    },

    formScore(pl) {
      this.adjustScore(pl)
      return sum(Object.values(pl))
    },

    adjustScore(pl) {
      // TODO: simplify code if possible ?
      // for (let attr of Object.values(pl)) {}

      pl.att = (pl.att - ATT_MIN) * ATT_MULT[0]
      pl.def = (pl.def - ATT_MIN) * ATT_MULT[1]
      pl.com = (pl.com - ATT_MIN) * ATT_MULT[2]
      pl.tac = (pl.tac - ATT_MIN) * ATT_MULT[3]
      pl.sta = (pl.sta - ATT_MIN) * ATT_MULT[4]
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
  margin: 10px 20px;
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
