const fs = require('fs')
const {
  prop,
  add,
  zipWith,
  nth,
  compose,
  split,
  replace,
  map
} = require('ramda')

const path = __dirname + '/resources/input.txt'

const velocityProp = prop('velocity')

const calculateVelocity = ({ velocity, acceleration }) =>
  zipWith(add, acceleration, velocity)

const nextVelocity = ({ position, velocity, acceleration }) => {
  return {
    position,
    velocity: calculateVelocity({ acceleration, velocity }),
    acceleration
  }
}

const nextTick = point => {
  const { acceleration, position } = point
  const velocity = velocityProp(nextVelocity(point))

  return {
    position: zipWith(add, velocity, position),
    velocity,
    acceleration
  }
}

const splitBuffer = map(line => line.split(', '))

const makeArray = compose(split(','), replace(/[pva=<>]/g, ''))

const parseProps = compose(map(parseInt), makeArray)

const getDistance = i => {
  return i.reduce((sum, t) => Math.abs(t) + sum, 0)
}

const tick = (times, array, fn) => {
  if (times === 0) {
    return array.map(fn)
  }

  return tick(times - 1, array.map(fn), fn)
}

const run = (e, file) => {
  if (e) throw e

  const buffer1 = compose(splitBuffer, split('\n'))(file)

  const numbersBuffer = buffer1.map(map(parseProps))

  const pointsArray = numbersBuffer.map(n => ({
    position: nth(0, n),
    velocity: nth(1, n),
    acceleration: nth(2, n)
  }))

  const results = tick(319, pointsArray, nextTick).reduce(
    ({ distance, min }, i, idx) => {
      if (getDistance(i.position) < distance) {
        return {
          min: idx,
          distance: getDistance(i.position)
        }
      }
      return { distance, min }
    },
    { min: 0, distance: Infinity }
  )

  console.log(results)
}

fs.readFile(path, 'utf8', run)
