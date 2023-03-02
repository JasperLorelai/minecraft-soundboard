const Util = require("./Util");
const Config = require("./Config");
const {version, versionCompared} = Config;

function makeName(prefix = "", v = version) {
    return "./soundConfig/" + prefix + v + ".yml";
}

let soundConfigFileName = makeName("copy-", versionCompared);
// Try copy first.
if (!Util.fileExists(soundConfigFileName)) {
    soundConfigFileName = makeName();
}
if (!Util.fileExists(soundConfigFileName)) {
    console.log("Sound config for version '" + version + "' does not exit.");
    return;
}

Util.rename(soundConfigFileName, makeName("final-"));
