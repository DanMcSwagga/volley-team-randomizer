export default class Player {
  constructor(name, att, def, com, tac, sta) {
    this.name = name
    this.att = att
    this.def = def
    this.com = com
    this.tac = tac
    this.sta = sta
  }

  toString() {
    return (
      this.name +
      ': att ' +
      this.att +
      ' | def ' +
      this.def +
      ' | com ' +
      this.com +
      ' | tac ' +
      this.tac +
      ' | sta ' +
      this.sta
    )
  }
}
