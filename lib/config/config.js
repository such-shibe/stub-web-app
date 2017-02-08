const assert = require("assert");
const config = global.provide("config");

for(const key in config) {
    assert(typeof config[key] === "string", 
           "envorinment variable '" + key + "' is not set");
}

module.exports = config;
