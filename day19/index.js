const fs = require('fs')
const readline = require('readline')

const input = __dirname + '/resources/input.txt'

const chars = {
  nextLine: '|',
  nextChar: '-',
  turn: '+'
}

const directions = {
  up: 'up',
  down: 'down',
  left: 'left',
  right: 'right'
}

// check for nextLine at the start
// start going down by rows
// keep checking by index until chars.turnRight
// check left and right
// if - is on the right - start increasing index, if not - start decrea
// start increasing index in row if '-'
// keep checking until '+'

const lineReader = readline.createInterface({
  input: fs.createReadStream(input)
})

let map = []

lineReader.on('line', line => {
  map.push(line)
})

lineReader.on('resume', () => {
  console.log('resumed')
})

lineReader.on('close', () => {
  const splitMap = map.map(b => b.split(''))
  const path = []

  const steps = {
    up: 0,
    down: 0,
    left: 0,
    right: 0
  }

  const startingChar = chars.nextLine

  let rowIndex = 0
  let colIndex = splitMap[rowIndex].indexOf(startingChar)

  let checking = true
  let direction = directions.down

  while (checking) {
    let currentRow = splitMap[rowIndex]
    let currentChar = currentRow[colIndex]

    let previousInRow =
      splitMap[rowIndex - 1] && splitMap[rowIndex - 1][colIndex]
    let nextInRow = splitMap[rowIndex + 1] && splitMap[rowIndex + 1][colIndex]

    let previousInCol =
      currentRow[colIndex - 1] && splitMap[rowIndex][colIndex - 1]
    let nextInCol = splitMap[rowIndex][colIndex + 1]

    if (currentChar === chars.nextLine) {
      if (direction === directions.right) {
        colIndex++
        steps.right = steps.right + 1
      } else if (direction === directions.left) {
        colIndex--
        steps.left = steps.left + 1
      } else if (direction === directions.up) {
        rowIndex--
        steps.up = steps.up + 1
      } else if (direction === directions.down) {
        rowIndex++
        steps.down = steps.down + 1
      }
    } else if (currentChar === chars.nextChar) {
      if (direction === directions.right) {
        colIndex++
        steps.right = steps.right + 1
      } else if (direction === directions.left) {
        colIndex--
        steps.left = steps.left + 1
      } else if (direction === directions.up) {
        rowIndex--
        steps.up = steps.up + 1
      } else if (direction === directions.down) {
        rowIndex++
        steps.down = steps.down + 1
      }
    } else if (currentChar === chars.turn) {
      if (direction === directions.up || direction === directions.down) {
        if (
          (nextInCol == ' ' || nextInCol === undefined) &&
          previousInCol !== ' '
        ) {
          colIndex--
          steps.left = steps.left + 1
          direction = directions.left
        } else {
          colIndex++
          steps.right = steps.right + 1
          direction = directions.right
        }
      } else if (
        direction === directions.right ||
        direction === directions.left
      ) {
        if (
          (nextInRow == ' ' || nextInRow === undefined) &&
          previousInRow !== ' '
        ) {
          direction = directions.up
          rowIndex--
          steps.up = steps.up + 1
        } else {
          direction = directions.down
          rowIndex++
          steps.down = steps.down + 1
        }
      }
    } else if (currentChar.match(/[A-Z]/)) {
      path.push(currentChar)
      if (direction === directions.right) {
        colIndex++
        steps.right = steps.right + 1
      } else if (direction === directions.left) {
        colIndex--
        steps.left = steps.left + 1
      } else if (direction === directions.up) {
        rowIndex--
        steps.up = steps.up + 1
      } else if (direction === directions.down) {
        rowIndex++
        steps.down = steps.down + 1
      }
    } else {
      checking = false
    }
    console.log(path.join(''))
    console.log(steps.left + steps.right + steps.down + steps.up)
  }
})
