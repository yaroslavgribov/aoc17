const fs = require('fs')
const path = require('path')
const {
  split,
  compose,
  map,
  reverse,
  length,
  keys,
  join,
  juxt,
  prop,
  reduce,
} = require('ramda')

const input = path.join(__dirname, 'resources', 'input.txt')
const start = '.#./..#/###'

const makeMatrix = compose(map(split('')), split('/'))

const flip = matrix =>
  matrix[0].map((column, index) => matrix.map(row => row[index]))

const normal = makeMatrix
const none = matrix => matrix
const flipVertical = reverse
const flipHorizontal = map(reverse)
const rotateRight = compose(flip, flipVertical)
const rotateLeft = compose(reverse, flip)

const transforms = juxt([
  none,
  flipHorizontal,
  flipVertical,
  rotateLeft,
  rotateRight,
  compose(rotateLeft, flipVertical),
  compose(flipVertical, rotateRight),
  compose(flipHorizontal, rotateLeft),
  compose(flipHorizontal, rotateRight)
])

const getKey = compose(join('/'), map(join('')))

const lookupList = compose(transforms, makeMatrix, getKey)

const lookup = patternBook => {
  const patterns = patternBook
  return picture => {
    const variants = keys(patterns)
    const possibleMatches = lookupList(picture).map(getKey)
    const match = possibleMatches.find(key => {
      return variants.indexOf(key) !== -1
    })

    return compose(normal, prop(match))(patterns)
  }
}

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
  if (times <= 0) return grid

  const gridAux = nextGrid(grid, patterns)
  return enhance(times - 1, gridAux, patterns)
}

const getMap = compose(map(split(' => ')), split('\n'))

const getPatternsMap = compose(
  reduce((acc, v) => {
    return Object.assign(acc, { [v[0]]: v[1] })
  }, {}),
  getMap
)

const run = (e, res) => {
  // catch possible errors
  if (e) return e

  const patterns = getPatternsMap(res)
  
  // Part 1
  // const fractal = enhance(5, makeMatrix(start), patterns) 
  // Part 2
  const fractal = enhance(5, makeMatrix(start), patterns)
  const on = fractal.reduce((count, row) => {
    return (
      count +
      row.reduce((rowCount, col) => {
        return col === '#' ? rowCount + 1 : rowCount
      }, 0)
    )
  }, 0)

  console.log(on)
}

fs.readFile(input, 'utf8', run)
