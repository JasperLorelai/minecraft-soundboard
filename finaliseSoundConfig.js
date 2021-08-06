const Util = require("./Util");
const Config = require("./Config");
const {version} = Config;

function makeName(prefix = "") {
    return "./soundConfig/" + prefix + version + ".yml";
}

const soundConfigFileName = makeName();

if (!Util.fileExists(soundConfigFileName)) {
    console.log("Sound config for version '" + version + "' does not exit.");
    return;
}

Util.rename(soundConfigFileName, makeName("final-"));
