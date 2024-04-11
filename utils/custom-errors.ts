export class InfoMessage extends Error {
  constructor(message) {
    super(message)
    this.name = 'InfoMessage'
  }
}
