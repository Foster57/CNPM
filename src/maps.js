export const maps = {
  meadow: {
    id: 'meadow',
    name: 'Meadow',
    difficulty: 'Easy',
    speed: 150, // ms per tick
    themeColor: '#2ecc71', // light green
    obstacles: [] // no obstacles
  },
  desert: {
    id: 'desert',
    name: 'Desert',
    difficulty: 'Medium',
    speed: 120,
    themeColor: '#f1c40f', // yellow
    obstacles: [
      { x: 5, y: 5 }, { x: 14, y: 5 },
      { x: 5, y: 14 }, { x: 14, y: 14 }
    ]
  },
  ocean: {
    id: 'ocean',
    name: 'Ocean',
    difficulty: 'Hard',
    speed: 90,
    themeColor: '#3498db', // blue
    obstacles: [
      { x: 9, y: 9 }, { x: 10, y: 9 }, { x: 9, y: 10 }, { x: 10, y: 10 },
      { x: 2, y: 2 }, { x: 17, y: 17 }, { x: 2, y: 17 }, { x: 17, y: 2 }
    ]
  },
  cave: {
    id: 'cave',
    name: 'Cave',
    difficulty: 'Very Hard',
    speed: 60,
    themeColor: '#7f8c8d', // gray
    obstacles: [
      { x: 4, y: 9 }, { x: 5, y: 9 }, { x: 6, y: 9 }, { x: 7, y: 9 },
      { x: 12, y: 10 }, { x: 13, y: 10 }, { x: 14, y: 10 }, { x: 15, y: 10 },
      { x: 9, y: 4 }, { x: 9, y: 5 }, { x: 9, y: 6 }, { x: 9, y: 7 },
      { x: 10, y: 12 }, { x: 10, y: 13 }, { x: 10, y: 14 }, { x: 10, y: 15 }
    ]
  },
  space: {
    id: 'space',
    name: 'Space',
    difficulty: 'Expert',
    speed: 40,
    themeColor: '#9b59b6', // purple
    obstacles: [
      // Frame around the center
      { x: 6, y: 6 }, { x: 7, y: 6 }, { x: 8, y: 6 }, { x: 11, y: 6 }, { x: 12, y: 6 }, { x: 13, y: 6 },
      { x: 6, y: 13 }, { x: 7, y: 13 }, { x: 8, y: 13 }, { x: 11, y: 13 }, { x: 12, y: 13 }, { x: 13, y: 13 },
      { x: 6, y: 7 }, { x: 6, y: 8 }, { x: 6, y: 11 }, { x: 6, y: 12 },
      { x: 13, y: 7 }, { x: 13, y: 8 }, { x: 13, y: 11 }, { x: 13, y: 12 }
    ]
  }
};
