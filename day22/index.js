const fs = require('fs')
const path = __dirname + '/resources/input.txt'
const { split, length, modulo, flatten, compose, map } = require('ramda')

const action = {
  weaken: 'W',
  flag: 'F',
  infect: '#',
  clean: '.'
}

const infected = v => v === action.infect
const weakened = v => v === action.weaken
const clean = v => v === action.clean
const flagged = v => v === action.flag
/* 
  NOTES: 
  parse the grid to coordinate system with [0, 0] being center of the grid
  then we can get each element by calling get on the grid
  first we need to find initial size of the grid
*/

const nextDirection = (prevDirection, turn) => {
  if (turn === 'none') {
    return prevDirection
  } else if (turn === 'backwards') {
    switch (prevDirection) {
      case 'up':
        return 'down'
      case 'down':
        return 'up'
      case 'left':
        return 'right'
      case 'right':
        return 'left'
    }
  } else {
    switch (prevDirection) {
      case 'up':
        if (turn === 'left') {
          return 'left'
        } else {
          return 'right'
        }
      case 'down':
        if (turn === 'left') {
          return 'right'
        } else {
          return 'left'
        }
      case 'left':
        if (turn === 'left') {
          return 'down'
        } else {
          return 'up'
        }
      case 'right':
        if (turn === 'left') {
          return 'up'
        } else {
          return 'down'
        }
    }
  }
}

const move = ({ x, y, direction }) => {
  switch (direction) {
    case 'up':
      return { x, y: y + 1 }
    case 'down':
      return { x, y: y - 1 }
    case 'left':
      return { x: x - 1, y }
    case 'right':
      return { x: x + 1, y }
  }
}

const burst = (times, grid, { x, y }, direction, timesInfected) => {
  let cellsInfected = timesInfected
  const gridAux = grid
  const get = gettify(gridAux)
  const set = settify(gridAux)

  let nextGrid, nextDir
  const isInfected = infected(get(x, y))
  const isClean = clean(get(x, y))
  const isFlagged = flagged(get(x, y))
  const isWeakened = weakened(get(x, y))
  if (isClean) {
    nextGrid = set(x, y, action.weaken)
    nextDir = nextDirection(direction, 'left')
  } else if (isWeakened) {
    nextGrid = set(x, y, action.infect)
    cellsInfected = cellsInfected + 1
    nextDir = nextDirection(direction, 'none')
  } else if (isInfected) {
    nextGrid = set(x, y, action.flag)
    nextDir = nextDirection(direction, 'right')
  } else if (isFlagged) {
    nextGrid = set(x, y, action.clean)
    nextDir = nextDirection(direction, 'backwards')
  }

  const nextCoords = move({ x, y, direction: nextDir })

  return {
    grid: nextGrid,
    coords: nextCoords,
    direction: nextDir,
    cellsInfected: cellsInfected
  }
}

const keyify = (x, y) => `${x}, ${y}`

const gettify = grid => {
  const gridAux = grid
  // returns value in x, y
  return (x, y) => {
    return gridAux[keyify(x, y)] || '.'
  }
}

const settify = grid => {
  const gridAux = grid
  // return grid after value was set
  return (x, y, value) => {
    return Object.assign(gridAux, { [keyify(x, y)]: value })
  }
}

/*
                       x, y         |  real index
    [ . , . , # ],    [-1, 1  0, 1  1, 1] | 1,1 1,2 1,3
    [ # , . , . ], => [-1, 0  0, 0  1, 0] | 2,1 2,2 2,3
    [ . , . , . ]     [-1,-1  0,-1  1,-1] | 3,1 3,2 3,3
                                    |
*/
const griddify = cluster => {
  const sizeY = length(cluster)
  const sizeX = length(cluster[0])

  const yCenter = Math.floor(sizeY / 2)
  const xCenter = Math.floor(sizeX / 2)

  return [].concat(
    ...cluster.map((row, rowId) => {
      return row.map((col, colId) => {
        return [`${colId - xCenter}, ${yCenter - rowId}`, col]
      })
    })
  )
}

const clusterize = compose(map(split('')), split('\n'))

const allYourBaseAreBelongToUs = (_, file) => {
  const rows = split('\n', file)
  const cluster = clusterize(file)
  const grid = griddify(cluster).reduce((reduction, item) => {
    return Object.assign(reduction, { [item[0]]: item[1] })
  }, {})

  let result = burst(0, grid, { x: 0, y: 0 }, 'up', 0),
    i = 10000000

  while (i !== 1) {
    result = burst(
      0,
      result.grid,
      result.coords,
      result.direction,
      result.cellsInfected
    )
    i--
  }

  console.log(result.cellsInfected)
}

fs.readFile(path, 'utf8', allYourBaseAreBelongToUs)
