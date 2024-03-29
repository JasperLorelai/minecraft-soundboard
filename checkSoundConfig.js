const deepObjectDiff = require("deep-object-diff").detailedDiff;

const Util = require("./Util");
const Config = require("./Config");
const {version, versionCompared} = Config;

function getFile(version) {
    const fileName = "./soundConfig/" + version + ".yml";

    if (!Util.fileExists(fileName)) {
        console.log("sound config '" + fileName + "' does not exit.");
        return null;
    }

    return Util.loadYAMLasJSON(fileName);
}

const configFirst = getFile(version);
if (!configFirst) return;
const configSecond = getFile("copy-" + versionCompared);
if (!configSecond) return;

Util.saveJSONasYAML("./soundConfig/difference-" + version + "-" + versionCompared + ".yml", deepObjectDiff(configSecond, configFirst));
