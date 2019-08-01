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

    <!-- <hr /> -->

    <!-- <h2>Выбранные игроки</h2> -->
    <!-- {{ checkedNames }} -->

    <!-- <hr /> -->

    <!-- <h2>Статистика всех игроков</h2> -->
    <!-- <ul v-for="(row, index) in players" :key="`r${index}`">
      {{
        row.toString()
      }}
    </ul> -->

    <hr />

    <h2>Сформированные команды</h2>
    <span>Точность: {{ lambda }}</span>
    <button @click="formTeams">Сформировать</button>
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
import { shuffle, average, sum, passWithout } from '@/utils/utils.js'

const ATT_MIN = 4 // < than lowest possible attribute score
const ATT_MULT = [3, 3, 1, 2, 1] // attribute multipliers

export default {
  name: 'home',

  data: () => ({
    players: [],
    teams: [],
    checkedNames: [],
    playerPerTeam: 4,

    lambda: 2
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

    getCurrentPlayers(allPlayers) {
      return shuffle(
        allPlayers.filter(
          pl => this.checkedNames.indexOf(pl.name) !== -1 // TODO: playerNames | checkedNames
        )
      )
    },

    formTeams() {
      console.log('Forming...')
      // ~ Preparations ~
      this.lambda = 2

      let players = this.getCurrentPlayers(this.players)
      let numOfTeams = Math.ceil(players.length / this.playerPerTeam)
      let teams = new Array(numOfTeams)
      for (let i = 0; i < numOfTeams; i++) teams[i] = { players: [], score: 0 }

      let ti = 0, // team iterator
        pi = 0 // player iterator

      let averages = this.getAllAverages(players)
      let scoreAverage = this.formScore(averages)

      console.log('AVERAGE = ' + scoreAverage)
      // ~ Algorithm ~
      while (players.length !== 0) {
        let scorePlayer = this.formScore(passWithout(players[pi], 'name'))
        console.log(players[pi].name + ' = ' + scorePlayer)

        // Add player to team, increase team's score
        teams[ti].players.push(players.splice(pi, 1)[0])
        teams[ti].score += scorePlayer

        // If team is formed...
        if (teams[ti].players.length === this.playerPerTeam) {
          // If team average doesn't fit lambda
          if (this.teamDiff(teams[ti], scoreAverage) > this.lambda) {
            players.unshift(teams[ti].players.pop()) // Remove last player...
            teams[ti].score -= scorePlayer // and score
            pi++ // Then try next player

            // If there are no players left
            if (pi === players.length) {
              this.lambda *= 2 // Increase lambda - allowance error
              pi = 0 // Reset current player iterator
            }
          } else {
            ti++ // Go to next team
            pi = 0 // Reset current player iterator
          }
        }

        // if (fitsLambda(diff, lambda)) {
        //   // Fill team with player, increase team's score
        //   teams[ti].players.push(players.splice(pi, 1)[0])
        //   teams[ti].score += scorePlayer
        //   // Reset current player iterator
        //   pi = 0
        // } else {
        //   // If there are no players left
        //   if (pi >= players.length) {
        //     // Increase lambda - allowance error
        //     lambda *= 2
        //     // Reset current player iterator
        //     pi = 0
        //   } else {
        //     // Try next player
        //     pi++
        //   }
        // }
      }

      // Add extra, average players to finish forming teams

      this.teams = teams
      // or this.$forceUpdate()

      debugger
    },

    teamDiff: (team, avg) => team.score / team.players.length - avg,

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
