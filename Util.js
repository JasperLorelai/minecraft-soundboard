const yaml = require("yaml");
const fs = require("fs");

module.exports = {
    fileExists(path) {
        return fs.existsSync(path);
    },
    loadYAML(path) {
        return fs.readFileSync(path).toString();
    },
    loadYAMLasJSON(path) {
        return yaml.parse(this.loadYAML(path));
    },
    saveJSONasYAML(path, json) {
        fs.writeFileSync(path, yaml.stringify(json));
    },
    rename(path, name) {
        fs.renameSync(path, name);
    },
    createBaseMenu(prefixTitle) {
        return {
            "spell-class": ".MenuSpell",
            "helper-spell": true,
            tags: ["NotSilenceable"],
            delay: 1,
            "stay-open-non-option": true,
            title: "&9" + prefixTitle + " Sounds",
            options: {}
        };
    },
    createSoundSpell(sound, category) {
        return {
            "spell-class": ".instant.DummySpell",
            "helper-spell": true,
            tags: ["NotSilenceable"],
            "variable-mods-cast": ["Sound =" + sound, "Menu =" + category],
            modifiers: ["chance 100 cast sb-selectsound"]
        };
    }
}
