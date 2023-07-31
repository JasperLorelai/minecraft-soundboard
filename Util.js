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
        fs.writeFileSync(path, yaml.stringify(json, {blockQuote: "folded", lineWidth: 0}));
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
            title: "&9" + prefixTitle + " &3Sounds",
            options: {}
        };
    }
}
