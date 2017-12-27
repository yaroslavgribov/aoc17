module.exports = prop => collection => {
  const grouped = collection.reduce((acc, item) => {
    const stringifiedItem = JSON.stringify({ [prop]: item[prop] })

    if (acc[stringifiedItem]) {
      acc[stringifiedItem] = acc[stringifiedItem].concat(item)
    } else {
      acc[stringifiedItem] = [item]
    }

    return acc
  }, {})

  return Object.keys(grouped).reduce((acc, key) => {
    if (grouped[key].length <= 1) acc = acc.concat(grouped[key])
    return acc
  }, [])
}
