const fs = require('fs')
const path = require('path')
const {
  split,
  toString,
  compose,
  map,
  replace,
  trim,
  reverse,
  pluck,
  length,
  zip,
  keys,
  join,
  converge,
  juxt,
  concat,
  prop,
  reduce,
  ifElse
} = require('ramda')

const input = path.join(__dirname, 'resources', 'example.txt')
const start = '.#./..#/###'

const makeMatrix = compose(map(split('')), split('/'))

const flip = matrix =>
  matrix[0].map((column, index) => matrix.map(row => row[index]))
const normal = makeMatrix
const flipVertical = compose(reverse, makeMatrix)
const flipHorizontal = compose(map(reverse), makeMatrix)
const rotateRight = compose(flip, flipVertical)
const rotateLeft = compose(reverse, flip, makeMatrix)

const transforms = juxt([
  normal,
  flipHorizontal,
  flipVertical,
  rotateLeft,
  rotateRight,
  compose(rotateLeft, flipVertical),
  compose(flipVertical, rotateRight),
  compose(flipHorizontal, rotateLeft),
  compose(flipHorizontal, rotateRight)
])

const possibleTransforms = [
  [
    // normal
    ['.', '#', '.'],
    ['.', '.', '#'],
    ['#', '#', '#']
  ],
  [
    // 90deg right
    ['#', '.', '.'],
    ['#', '.', '#'],
    ['#', '#', '.']
  ],
  [
    // 90 deg left
    ['.', '#', '#'],
    ['#', '.', '#'],
    ['.', '.', '#']
  ],
  [
    // vertical flip
    ['#', '#', '#'],
    ['.', '.', '#'],
    ['.', '#', '.']
  ],
  [ // vertical flip and 90 deg left
    ['#', '#', '.'],
    ['#', '.', '#'],
    ['#', '.', '.']
  ],
  [ // vertical flip and 90 deg right
    ['.', '.', '#'],
    ['#', '.', '#'],
    ['.', '#', '#']
  ],
  [
    // horizontal flip
    ['.', '#', '.'],
    ['#', '.', '.'],
    ['#', '#', '#']
  ]
]

const size = length

const getArray = split('\r\n')

const getMap = compose(map(split(' => ')), getArray)

const getKey = compose(join('/'), map(join('')))

const lookupList = pic => {
  const key = getKey(pic)
  return transforms(key)
}

const getPatternsMap = compose(
  reduce((acc, v) => {
    return Object.assign(acc, { [v[0]]: v[1] })
  }, {}),
  getMap
)

/*
  [1,2,3,4,5,6]
  [1,2] split(0, 2) 0, count * 1
  [3,4] split(2, 4) count * 1, count * 2
  [5,6] split(4, 6) count * 2, count * 3,
                    count * 3, count * 4
*/

const lookup = patternBook => {
  const patterns = patternBook
  return picture => {
    const variants = keys(patterns)
    const possibleMatches = lookupList(picture).map(getKey)
    const match = possibleMatches.find(key => {
      return variants.indexOf(key) !== -1
    })

    const exactMatch = compose(normal, prop(match))(patterns)

    return exactMatch
  }
}

// if (size % 3 === 0 ) { // eq 3, 6, 9, 12, 15
// break grid in squares 3x3
// } else {
// break grid in squares 2x2
// }
// squares.map(findMatchingPattern)
// concat
// start over again
// as many times as specified

function chop(grid) {
  let gridSize = grid.length // Size of a line *is* size of a *square* grid
  let divisor = gridSize % 2 === 0 ? 2 : 3
  let blocksPerRow = gridSize / divisor
  let blockRow = 0
  let blocks = []

  for (let y = 0; y < gridSize; y++) {
    blockRow = Math.floor(y / divisor)

    for (let x = 0, n = 0; x < gridSize; x += divisor, n++) {
      let idx = blockRow * blocksPerRow + n
      let chunk = grid[y].slice(x, x + divisor)

      blocks[idx] = blocks[idx] || []
      blocks[idx].push(chunk)
    }
  }

  return blocks
}

function recombine(blocks) {
  let grid = []
  let nrOfBlocksPerRow = Math.sqrt(blocks.length)

  for (let n = 0; n < blocks.length; n++) {
    for (let rowIdx = 0; rowIdx < blocks[n].length; rowIdx++) {
      for (let colIdx = 0; colIdx < blocks[n][rowIdx].length; colIdx++) {
        let blockRow = Math.floor(n / nrOfBlocksPerRow)
        let gridY = rowIdx + blockRow * blocks[n].length
        let gridX = colIdx + n * blocks[n][rowIdx].length

        grid[gridY] = grid[gridY] || []
        grid[gridY][gridX] = blocks[n][rowIdx][colIdx]
      }
    }
  }

  // workaround for bug (not sure where it is exactly!):
  grid = grid.map(row => row.filter(cell => cell === '#' || cell === '.'))

  return grid
}

const nextGrid = (grid, patterns) => {
  return recombine(chop(grid).map(lookup(patterns)))
}

const enhance = (times, grid, patterns) => {
  if (times <= 1) return grid

  const gridAux = nextGrid(grid, patterns)

  return enhance(times - 1, gridAux, patterns)
}

const run = (e, res) => {
  // catch possible errors
  if (e) return e

  const patterns = getPatternsMap(res)

  enhance(5, makeMatrix(start), patterns)
}

fs.readFile(input, 'utf8', run)
