const Util = require("./Util");
const Config = require("./Config");
const {version, soundboardVersion} = Config;

const soundboardFileName = "./soundboards/" + version + ".yml";

if (!Util.fileExists(soundboardFileName)) {
    console.log("Soundboard for version '" + version + "' does not exit.");
    return;
}

Util.rename(soundboardFileName, "./soundboards/spellSystem-Soundboard-" + soundboardVersion + "-by-JasperLorelai.yml");
