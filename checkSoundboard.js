const deepObjectDiff = require("deep-object-diff").detailedDiff;

const Util = require("./Util");
const Config = require("./Config");
const {version, soundboardVersionCompared} = Config;

function getFile(version) {
    const fileName = "./soundboards/" + version + ".yml";

    if (!Util.fileExists(fileName)) {
        console.log("Final soundboard for version '" + version + "' does not exit.");
        return null;
    }

    return Util.loadYAMLasJSON(fileName);
}

const configFirst = getFile(version);
if (!configFirst) return;
const configSecond = getFile("spellSystem-Soundboard-" + soundboardVersionCompared + "-by-JasperLorelai");
if (!configSecond) return;

Util.saveJSONasYAML("./soundboards/difference-" + version + "-" + soundboardVersionCompared + ".yml", deepObjectDiff(configSecond, configFirst));
