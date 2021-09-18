// Aggregate objects which overlap, based on start/end into a an array
// of objects with non overlapping start/end times, and the items that
// were overlapping in the original dataset. Overlapping items will
// exist in multiple blocks
function sweepline(data, {
  p1Key = 'start',
  p2Key = 'end'
} = {}) {
  // array of unique points ascending order
  const timeline = data
    .flatMap((x) => [x[p1Key], x[p2Key]])
    .sort((x1, x2) => x1 - x2)
    .filter((x, i, self) => self.indexOf(x) === i)

  // array of objects with start/end attributes
  // created from the timeline of points, each block:
  // - starts on the point in the timeline
  // - ends on next point in the timeline minus 1
  // eg: [1, 5, 10] => {s: 1, e: 4}, {s: 5, e: 9}, {s: 10, e: 10}
  const timelineBlocks = timeline
    .reduce((acc, point) => {
      // get the previous point (p2), and entries from the accumulator
      let [p1, entries] = (Array.isArray(acc)) ? acc : [acc, []];
      let p2 = point && point - 1;

      // p2 needs to be defined, and cannot be before start
      if (!p2 || p2 < p1) p2 = p1;

      return [point, entries.concat({[p1Key]: p1, [p2Key]: p2})]
    })[1]

  // array of objects with start, end, items attributes
  // items array is populated with entries from the original
  // data array, where the originating data start/end, is overlapping
  // the timelineBlocks start/end
  const timelineBlocksWithItems = timelineBlocks
    .map((block) => {
      const items = data
        .filter((item) => item[p1Key] <= block[p1Key] && item[p2Key] >= block[p2Key])

      return {
        ...block,
        [p1Key]: block[p1Key],
        [p2Key]: block[p2Key],
        items
      }
    })

  return timelineBlocksWithItems;
}

// Run

const data = [
  {key: 'a', taste: 'citrus', start: 1, end: 10, val: 1},
  {key: 'b', feel: 'crunchy', start: 4, end: 14, val: 2},
  {key: 'c', color: 'cyan', start: 8, end: 18, val: 1},
  {key: 'd', start: 12, end: 22, val: 1},
  {key: 'e', start: 16, end: 26, val: 3},
  {key: 'f', start: 4, end: 14, val: 3},
  {key: 'g', start: 32, end: 42, val: 1},
];

console.log(JSON.stringify(sweepline(data), null, 2))

