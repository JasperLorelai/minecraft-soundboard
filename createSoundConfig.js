const Util = require("./Util");
const Config = require("./Config");
const {version} = Config;

const soundFileName = "./sounds/" + version + ".txt";

if (!Util.fileExists(soundFileName)) {
    console.log("Sound list for version '" + version + "' does not exit.");
    return;
}

function createObject(sound) {
    let obj = {icon: ""};
    if (!sound.includes(".")) {
        // Store the singleton sound deep.
        if (sound) obj.sounds = [sound];
        return obj;
    }
    const index = sound.indexOf(".");
    const key = sound.substring(0, index);
    const value = sound.substr(index + 1);
    obj[key] = createObject(value);
    return obj;
}

const sounds = {};

const soundsTemp = Util.loadYAML(soundFileName)
    .split("\n")
    .sort()
    .map(sound => createObject(sound.trim()));

function mergeConfig(config, sound) {
    // We don't need to merge icons.
    const key = Object.keys(sound).find(key => key !== "icon");
    if (!key) return config;
    // Array merging - for sounds.
    if (key === "sounds" && config.sounds) config.sounds.push(sound.sounds[0]);
    // Object merging.
    else config[key] = config.hasOwnProperty(key) ? mergeConfig(config[key], sound[key]) : sound[key];
    return config;
}

soundsTemp.filter((sound, index) => {
        sound = JSON.stringify(sound);
        // noinspection JSIncompatibleTypesComparison
        return index === soundsTemp.findIndex(otherSound => JSON.stringify(otherSound) === sound);
    })
    .forEach(sound => mergeConfig(sounds, sound));

Util.saveJSONasYAML("./soundConfig/" + version + ".yml", sounds);
