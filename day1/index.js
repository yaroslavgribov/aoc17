const fs = require('fs')
const path = __dirname + '/resources/input.txt'
const { split } = require('ramda')

const read = (e, res) => {
  const firstCaptcha = split('', res)
    .map(n => +n)
    .filter((cur, i, input) => cur === input[(i + 1) % input.length]) // % input.length lets us include the first digit as well
    .reduce((s, cur) => s + cur, 0)

  const nextCaptcha = res.split('')
    .map(n => +n)
    .filter((v, i, a) => v === a[(i + a.length / 2) % a.length])
    .reduce((s, v) => s + v, 0)
  
  console.log(firstCaptcha, nextCaptcha)
}

fs.readFile(path, 'utf8', read)
