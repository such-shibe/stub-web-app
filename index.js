const locator  = require.main.require("./lib/locator/locator");
const mode = process.env.NODE_ENV || "development";

console.log("starting in '" + mode  + "' mode.");

// provide a shorthand for getting inject modules for this context
global.provide = name => require.main.require(locator.get(name));

switch(mode) {
    case "live" :
          locator.register("config", "./lib/config/config-release");
          locator.register("cache", "./lib/cache/none"); // TODO replace with redis
          break;
    case "test" :
          locator.register("config", "./lib/config/config-test");
          locator.register("cache", "./lib/cache/memory"); // TODO replace with redis
          break;
    case "development":
    default:
          locator.register("config", "./lib/config/config-debug");
          locator.register("cache", "./lib/cache/memory");
          break;
}

const db = require("./lib/db/db")
db.sequelize.sync().then(e => {
    require("./lib/server");
});
