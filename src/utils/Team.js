export default class Team {
  constructor(players = [], score = 0) {
    this.players = players
    this.score = score
  }

  addPlayer(player) {
    this.players.push(player)
    this.addScore(player.score)
  }

  removePlayer(position) {
    let player = this.players.splice(position, 1)
    this.removeScore(player.score)
    return player
  }

  removeFirstPlayer() {
    // this.removePlayer(0)
    let player = this.players.unshift()
    this.removeScore(player.score)
    return player
  }

  removeLastPlayer() {
    // this.removePlayer(this.players.length - 1)
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
