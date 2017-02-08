const locator  = require.main.require("./lib/locator/locator");
const castBool = val => 
    Boolean(JSON.parse((val || false).toString().toLowerCase()));
const liveMode = castBool(process.env.DEBUG);
const testMode = castBool(process.env.RELEASE);

// provide a shorthand for getting inject modules for this context
global.provide = name => require.main.require(locator.get(name));

if(liveMode) {
    console.log("Live Mode\n");

    locator.register("config", "./lib/config/config-release");
    locator.register("cache", "./lib/cache/memory"); // TODO replace with redis
} else if(testMode) {
    console.log("Test Mode\n");
    
    locator.register("config", "./lib/config/config-test");
    locator.register("cache", "./lib/cache/memory"); // TODO replace with redis
} else {
    console.log("Dev Mode\n");
    
    locator.register("config", "./lib/config/config-debug");
    locator.register("cache", "./lib/cache/memory");
}

require("./lib/server");
