export function uniqueBy<T>(a: Array<T>, key: (e: T) => unknown) {
  var seen = new Set()
  return a.filter(function (item) {
    var k = key(item)
    return seen.has(k) ? false : seen.add(k)
  })
}
