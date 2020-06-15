<template>
  <div class="home">
    <AppHeader />

    <hr />

    <h2>Выбери игроков (всего {{ playerNames.length }})</h2>

    <div class="central-info-wrapper">
      <span>Кол-во игроков за команду:</span>
      <div>
        <span>
          <b>{{ playerPerTeam }}</b>
        </span>
        <input v-model.number="playerPerTeam" type="range" min="3" max="6" />
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
        <label :for="playerName">{{ playerName }}</label>
      </div>
    </div>

    <div class="central-info-wrapper">
      <button class="smaller-button reset-button" @click="checkedNames = []">
        Очистить всех
      </button>
      <button class="smaller-button" @click="checkedNames = [...playerNames]">
        Выбрать всех
      </button>
    </div>

    <div class="central-info-wrapper">
      <span>
        Выбрано
        <b>{{ checkedNames.length }}</b> игроков
      </span>
    </div>

    <div class="central-info-wrapper">
      <button class="form-teams-button" @click="formTeams">Сформировать</button>
    </div>

    <hr />

    <h2>Сформированные команды</h2>
    <span>
      <b>Точность: {{ lambda }}</b>
    </span>
    <p>
      <i
        >Точность формулирования команд (10-20 идеально, 30-40 хорошо, 50+
        плохо)</i
      >
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
          :style="[
            Boolean(player.isExtra)
              ? { 'background-color': player.isExtra }
              : { 'background-color': 'transparent' }
          ]"
          v-html="DEV_MODE ? player.toString() : player.name"
        ></li>
      </ul>
    </div>
  </div>
</template>

<script>
import AppHeader from '@/components/AppHeader.vue'

import Player from '@/utils/Player.js'
import Team from '@/utils/Team.js'

import dataJSON from '@/utils/data.json'
import dummies from '@/utils/dummies.json'
import {
  shuffle,
  getFormedScore,
  configAttributes,
  averages2d,
  getAllAverages,
  getRandomColor
} from '@/utils/utils.js'
import { DUMMY } from '@/constants.js'

export default {
  name: 'home',

  components: {
    AppHeader
  },

  data: () => ({
    players: [],
    teams: [],
    checkedNames: [],
    playerPerTeam: 4,
    lambda: 10, // allowance error
    lambdaStep: 5, // lambda increment per step

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
          const cleanMatrix = x.data
            .slice(1)
            .map(row => row.slice(1).map(el => +el))

          const averages = averages2d(cleanMatrix)

          if (this.DEV_MODE) {
            console.log(`>>> Player ${name}`)
            // console.log(cleanMatrix)
            console.log(averages.map(x => x.toFixed(0)).join(' - '))
          }

          this.players.push(new Player(name, configAttributes(averages)))
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
      console.clear()
      console.log('Forming teams...')
      if (!this.DEV_MODE && this.checkEmptyPlayers()) return

      // ~ Preparations ~
      this.lambda = 10 // reset lambda for consecutive generations

      let players = this.getCurrentPlayers(this.players)
      let playersCopy = [...players]
      let numOfTeams = Math.ceil(players.length / this.playerPerTeam)
      let teams = new Array(numOfTeams)
      for (let i = 0; i < numOfTeams; i++) teams[i] = new Team()

      let ti = 0, // team iterator
        pi = 0 // player iterator

      // const normalizedPlayers = normalizePlayersAttributes(players)
      const averages = getAllAverages(players)
      const scoreAverage = getFormedScore(averages)
      if (this.DEV_MODE) {
        console.log('>> Forming average score')
        console.log(averages)
        console.log(scoreAverage)
      }

      let extraPlayerRemovalFlag = false // N-1th player check

      players.forEach(player => {
        player.calculateScore()
        if (Boolean(player.isExtra) == true) {
          player.isExtra = false
        }
      })

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
                this.lambda += this.lambdaStep // Increase lambda -- allowance error
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

      // Add extra, average players to finish forming teams
      if (playersCopy.length % this.playerPerTeam !== 0) {
        // Remove already assigned players from copy-array
        let assignedPlayers = [...teams[ti].players]
        playersCopy = playersCopy.filter(
          copy => !assignedPlayers.includes(copy)
        )

        // And shuffle them
        playersCopy = shuffle(playersCopy)

        pi = 0 // Reset current player iterator

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
                  this.lambda += this.lambdaStep // Increase lambda -- allowance error
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
              break // end
            }
          }
        }

        // Discern extra players from regular ones
        this.discernExtraPlayers(teams[ti].players, assignedPlayers)
      }

      console.log(teams)

      this.teams = teams
      // or: this.$forceUpdate()
    },

    checkEmptyPlayers() {
      const selected = this.checkedNames.length
      const needed = this.playerPerTeam
      if (selected < needed) {
        alert(
          `Выбрано ${selected} игроков.\n` +
            `Отметьте хотя бы ${needed} игроков для формирования команд.`
        )
        return true
      }
      return false
    },

    discernExtraPlayers(extra, regular) {
      extra.forEach(player => {
        player.isExtra = getRandomColor()
      })
      regular.forEach(player => {
        player.isExtra = false
      })
    },

    teamDiff: (team, avg) => Math.abs(team.score / team.players.length - avg),

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
.central-info-wrapper {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  margin: 10px 0;
  span {
    min-width: 12px;
    margin: 0 5px;
  }
  div {
    display: flex;
    justify-content: center;
  }
  input {
    margin: 0 5px;
    cursor: pointer;
  }
}
.player-select-wrapper {
  display: flex;
  flex-wrap: wrap;
  margin: 0 40px;
  font-size: 14px;
}
.player-select {
  display: flex;
  flex-direction: row;
  width: fit-content;
  margin: 4px;
  line-height: 24px;
  input[type='checkbox'] {
    display: none;
  }
  label {
    position: relative;
    display: inline-block;
    padding: 8px 8px 8px 30px;
    border: 1px solid #5a5a5a;
    transition: all 0.2s;
    cursor: pointer;
  }
  label::before,
  label::after {
    position: absolute;
    content: '';
    display: inline-block;
  }
  label::before {
    height: 16px;
    width: 16px;
    border: 1px solid;
    left: 8px;
    top: 11px;
  }
  label::after {
    height: 5px;
    width: 9px;
    border-left: 2px solid;
    border-bottom: 2px solid;
    transform: rotate(-45deg);
    left: 11px;
    top: 15px;
  }
  input[type='checkbox']:checked + label {
    border: 1px solid rgba(59, 153, 252, 1);
    color: rgba(59, 153, 252, 1);
  }
  input[type='checkbox'] + label::after {
    content: none;
  }
  input[type='checkbox']:checked + label::after {
    content: '';
  }
  input[type='checkbox']:focus + label::before {
    outline: rgb(59, 153, 252) auto 5px;
  }
}

.team-wrapper {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  width: 100%;
  justify-content: space-between; //
}
.team {
  // width: calc(50% - 40px); //
  margin: 10px 20px; //
  padding: 0 10px;
  list-style: inside;
}
.player {
  text-align: left;
  padding: 10px;
  list-style-type: circle;
  // margin: 5px; //
}
.player-extra {
  background-color: red;
}
.smaller-button {
  line-height: 20px;
  padding: 11px 20px;
  margin: 11px 20px;
  font-size: 14px;
}
.reset-button {
  background-color: #fd7f79;
  &:hover {
    background-color: #ff6961;
  }
  &:active {
    background-color: #eb4f46;
  }
}

// Mobile media queries
@media (min-width: 320px) and (max-width: 480px) {
  .player-select {
    width: 100%;
    margin: 8px 0;
    label {
      width: 100%;
    }
  }
  .form-teams-button {
    width: 100%;
    margin: 10px 0;
    padding: 20px 0;
    border-right-width: 0px;
    border-left-width: 0px;
  }
  .team-wrapper {
    justify-content: center;
  }
  .team {
    width: 100%;
    margin: 10px 40px;
    padding: 0;
  }
}
</style>
