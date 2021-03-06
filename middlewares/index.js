const { createMiddleware } = require("signalbox");
const cameras = require("./cameras").default;
const cells = require("./cells").default;
const hexagons = require("./hexagons").default;
const journeys = require("./journeys").default;
const robots = require("./robots").default;
const stations = require("./stations").default;
const terrains = require("./terrains").default;
const viewport = require("./viewport").default;

export default createMiddleware([
  cameras,
  cells,
  hexagons,
  journeys,
  robots,
  stations,
  terrains,
  viewport,
]);

