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

const makeMatrix = compose(
  map(split('')), 
  split('/')
)

const flip = matrix => (
  matrix[0].map((column, index) => (
    matrix.map(row => row[index])
  ))
)
const normal = makeMatrix
const flipVertical = compose(reverse, makeMatrix)
const flipHorizontal = compose(map(reverse), makeMatrix)
const rotateRight = compose(flip, flipVertical)
const rotateLeft = compose(reverse, flip, makeMatrix)

const transforms = juxt([normal, flipHorizontal, flipVertical, rotateLeft, rotateRight])

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
  [ // 90 deg left
    [ '.', '#', '#' ], 
    [ '#', '.', '#' ], 
    [ '.', '.', '#' ] 
  ],
  [
    // vertical flip 
    ['#', '#', '#'],
    ['.', '.', '#'],
    ['.', '#', '.']
  ],
  [ // horizontal flip
    [ '.', '#', '.' ], 
    [ '#', '.', '.' ], 
    [ '#', '#', '#' ] 
  ]
]

const size = length

const getArray = split('\r\n')

const getMap = compose(
  map(split(' => ')), 
  getArray
)

const getKey = compose(
  join('/'), 
  map(join(''))
)

const lookupList = compose(map(getKey), transforms)

const getPatternsMap = compose(
  reduce((acc, v) => {
    return Object.assign(acc, { [v[0]]: v[1]})
  }, {}), 
  getMap
)

const lookup = (picture, patterns) => {
  const variants = keys(patterns)

  const match = lookupList(picture).find(key => {
    return variants.indexOf(key) !== -1
  })

  const next = prop(match, patterns)
  return normal(next)
}

const grow = (times, next) => {
  if (size(next) % 2) {
    // not divisible by 2

  } else {
    // divisible by 2

  }
}

const splitBy2 = (array) => {
  /*
    [
      [1,2],
      [3,4]
    ]
    [[1,  2,  3,  4 ], [5,  6,  7,  8 ], [9,  10, 11, 12], [13, 14, 15, 16]]
  */
  if (array.length === 2) return array
  
  console.log(array.map(i => {
    return [i.slice(0, 2), i.slice(2, 4)]
  }))

}

console.log(splitBy2([[1,  2,  3,  4 ], [5,  6,  7,  8 ], [9,  10, 11, 12], [13, 14, 15, 16]]))

const run = (e, res) => {
  // catch possible errors
  if (e) return e

  const patterns = getPatternsMap(res)

  console.log(lookup(start, patterns))
}

fs.readFile(input, 'utf8', run)
