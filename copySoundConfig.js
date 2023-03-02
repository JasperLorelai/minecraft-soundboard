const fs = require("fs");
const Util = require("./Util");
const Config = require("./Config");
const {versionCompared} = Config;

function makeName(prefix = "") {
    return "./soundConfig/" + prefix + versionCompared + ".yml";
}

const soundConfigFileName = makeName("final-");

if (!Util.fileExists(soundConfigFileName)) {
    console.log("Sound config for version '" + versionCompared + "' does not exit.");
    return;
}

fs.copyFileSync(soundConfigFileName, makeName("copy-"));
