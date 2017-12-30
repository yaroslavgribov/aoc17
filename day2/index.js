const fs = require('fs')
const path = __dirname + '/resources/input.txt'
const { split, map, add, head } = require('ramda')
const { combination } = require('js-combinatorics') // thank you kind man

const read = (e, res) => {
  const checksum = map(split('\t'), split('\n', res))
    .map(s => s.map(n => +n))
    .map(s => {
      return s.reduce((cur, i) => {
        return [Math.min(i, cur[0]), Math.max(i, cur[1])]
      }, [Number.MAX_VALUE, Number.MIN_VALUE])
    })
    .reduce((sum, s) => {
      return sum + (s[1] - s[0])
    }, 0)


  const checksumDivide = map(split('\t'), split('\n', res))
    .map(s => s.map(n => +n))
    .map(s => 
      head(
        combination(s, 2)
          .filter(([a, b]) => a % b === 0 || b % a === 0)
      )
    )
    .map(([a, b]) => a > b ? a / b : b / a) 
    .reduce(add)
    

    console.log(`Part 1 ${checksum}`)
    console.log(`Part 1 ${checksumDivide}`)
}

fs.readFile(path, 'utf8', read)
