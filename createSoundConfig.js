const Util = require("./Util");
const {version, versionCompared} = require("./Config");

const deepObjectDiff = require("deep-object-diff").detailedDiff;

const soundFileName = "./sounds/" + version + ".txt";
if (!Util.fileExists(soundFileName)) {
    console.log("Sound list for version '" + version + "' does not exit.");
    return;
}

function configPath(version, prefix = "") {
    return "./soundConfig/" + prefix + version + ".yml";
}

const previousFileName = configPath(versionCompared, "final-");
if (!Util.fileExists(previousFileName)) {
    console.log("Sound config for version '" + versionCompared + "' does not exit.");
    return;
}
const previous = Util.loadYAMLasJSON(previousFileName);
const sounds = Util.loadYAML(soundFileName)
    .split("\n")
    .sort()
    .reduce((config, sound) => {
        if (!sound) return config;
        const paths = sound.trim().split(".");
        const lastIndex = paths.length - 1;
        paths.reduce(({config, previous}, path, index) => {
            if (index === lastIndex) {
                if (path !== "intentionally_empty") {
                    config.sounds ??= [];
                    config.sounds.push(path);
                }
            } else {
                config[path] ??= {};
                config[path].icon = previous?.[path]?.icon || "";
            }
            return {config: config[path], previous: previous?.[path]};
        }, {config, previous});
        return config;
    }, {});

Util.saveJSONasYAML(configPath(version), sounds);
Util.saveJSONasYAML(configPath(version + "-" + versionCompared, "difference-"), deepObjectDiff(previous, sounds));
