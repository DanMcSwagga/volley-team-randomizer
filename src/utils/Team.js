export default class Team {
  constructor(players = [], score = 0) {
    this.players = players
    this.score = score
  }

  getPlayerByName(name) {
    return this.players.find(player => player.name === name)
  }

  addPlayer(player) {
    this.players.push(player)
    this.addScore(player.score)
  }

  removePlayer(position) {
    let player = this.players.splice(position, 1)[0]
    this.removeScore(player.score)
    return player
  }

  removeFirstPlayer() {
    let player = this.players.unshift()
    this.removeScore(player.score)
    return player
  }

  removeLastPlayer() {
    let player = this.players.pop()
    this.removeScore(player.score)
    return player
  }

  addScore(score) {
    this.score += score
  }

  removeScore(score) {
    this.score -= score
  }
}
