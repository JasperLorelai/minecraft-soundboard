const yaml = require("yaml");
const fs = require("fs");

module.exports = {
    loadYAMLasJSON(path) {
        return yaml.parse(fs.readFileSync(path).toString());
    },
    saveJSONasYAML(path, json) {
        fs.writeFileSync(path, yaml.stringify(json, {blockQuote: "folded", lineWidth: 0}));
    },
    createBaseMenu(prefixTitle) {
        return {
            "spell-class": ".MenuSpell",
            "helper-spell": true,
            tags: ["NotSilenceable"],
            delay: 1,
            "stay-open-non-option": true,
            title: "<blue>" + prefixTitle + " <aqua>Sounds",
            options: {}
        };
    }
}
