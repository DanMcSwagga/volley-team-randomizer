<template>
  <div class="home">
    <WeatherWidget />

    <hr />

    <h2>Выбери игроков (всего {{ playerNames.length }})</h2>

    <div class="player-per-team-wrapper">
      <span>Кол-во игроков за команду:</span>
      <div>
        <input v-model.number="playerPerTeam" type="range" min="3" max="6" />
        <span>{{ playerPerTeam }}</span>
      </div>
    </div>
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

    <button @click="formTeams">Сформировать</button>

    <hr />

    <h2>Сформированные команды</h2>
    <span>
      <b>Точность: {{ lambda }}</b>
    </span>
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
          {{ team.score.toFixed(2) }} /
          {{ (team.score / team.players.length).toFixed(2) }}
        </h3>
        <li
          class="player"
          v-for="(player, pindex) in team.players"
          :key="`p${pindex}`"
          v-html="DEV_MODE ? player.toString() : player.name"
        ></li>
      </ul>
    </div>
  </div>
</template>

<script>
import WeatherWidget from '@/components/WeatherWidget.vue'

import Player from '@/utils/Player.js'
import Team from '@/utils/Team.js'

import dataJSON from '@/utils/data.json'
import dummies from '@/utils/dummies.json'
import { shuffle, average, getFormedScore } from '@/utils/utils.js'
import { DUMMY } from '@/constants.js'

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

    DEV_MODE: true // mode for development
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
      let playersCopy = [...players]
      let numOfTeams = Math.ceil(players.length / this.playerPerTeam)
      let teams = new Array(numOfTeams)
      for (let i = 0; i < numOfTeams; i++) teams[i] = new Team()

      let ti = 0, // team iterator
        pi = 0 // player iterator

      let averages = this.getAllAverages(players)
      let scoreAverage = getFormedScore(averages)

      let extraPlayerRemovalFlag = false // N-1th player check

      players.forEach(player => player.calculateScore())

      console.log('>> Average score = ' + scoreAverage)

      // ~ Algorithm ~
      while (players.length !== 0) {
        console.log(players[pi].name + ' = ' + players[pi].score)

        // Add player to team, increase team score
        teams[ti].addPlayer(players.splice(pi, 1)[0])

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
            players.unshift(teams[ti].removeLastPlayer()) // Remove Nth player to start
            pi++ // Then try next player

            // If there are no players left...
            if (pi === players.length) {
              // If already tried removing N-1th player from team...
              if (extraPlayerRemovalFlag) {
                this.lambda += 1 // Increase lambda -- allowance error | *= 2
                extraPlayerRemovalFlag = false // Reset N-1th player check
              } else {
                players.unshift(teams[ti].removeLastPlayer()) // Remove N-1th player to end
                extraPlayerRemovalFlag = true // Set flag to know when N-1th was removed
              }
              pi = 0 // Reset current player iterator
            }
          } else {
            console.log('>> Team formed successfully')
            console.log(`>> Avg ${teams[ti].score / 4} | ${scoreAverage}`)
            pi = 0 // Reset current player iterator
            ti++ // Go to next team
          }
        }
      }

      // Remove already assigned players from copy-array
      playersCopy.splice(
        playersCopy.length - teams[ti].players.length,
        teams[ti].players.length
      )
      pi = 0 // Reset current player iterator

      // Add extra, average players to finish forming teams
      while (playersCopy.length !== 0) {
        console.log(playersCopy[pi].name + ' = ' + playersCopy[pi].score)

        // Add player to team, increase team score
        teams[ti].addPlayer(playersCopy.splice(pi, 1)[0])

        // If team is formed...
        if (teams[ti].players.length === this.playerPerTeam) {
          // If team average doesn't fit lambda
          if (this.teamDiff(teams[ti], scoreAverage) > this.lambda) {
            playersCopy.unshift(teams[ti].removeLastPlayer()) // Remove Nth player to start
            pi++ // Then try next player

            // If there are no players left...
            if (pi === playersCopy.length) {
              // If already tried removing N-1th player from team...
              if (extraPlayerRemovalFlag) {
                this.lambda += 1 // Increase lambda -- allowance error | *= 2
                extraPlayerRemovalFlag = false // Reset N-1th player check
              } else {
                playersCopy.unshift(teams[ti].removeLastPlayer()) // Remove N-1th player to end
                extraPlayerRemovalFlag = true // Set flag to know when N-1th was removed
              }
              pi = 0 // Reset current player iterator
            }
          } else {
            console.log('>> Team formed successfully')
            console.log(`>> Avg ${teams[ti].score / 4} | ${scoreAverage}`)
            pi = 0 // Reset current player iterator
            break // ti++ // Go to next team
          }
        }
      }

      // debugger

      this.teams = teams
      // or: this.$forceUpdate()
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
.player-per-team-wrapper {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  margin: 10px 0;
  span {
    margin: 0 5px;
  }
  div {
    display: flex;
    justify-content: center;
  }
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
