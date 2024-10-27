const Util = require("./Util");
const {version, versionCompared, soundboardVersion} = require("./Config");
const fs = require("fs");

const readline = require("node:readline").createInterface({
    input: process.stdin,
    output: process.stdout
});
const question = query => new Promise(resolve => readline.question(query, resolve));

function toFormalCase(string) {
    return string.length > 2 ? string.charAt(0).toUpperCase() + string.substring(1).toLowerCase() : string.toUpperCase();
}

function toTitleCase(string) {
    return string.replace(/_/g, " ").split(" ").map(e => toFormalCase(e)).join(" ");
}

(async () => {
    const soundFileName = `./sounds/${version}.txt`;
    if (!fs.existsSync(soundFileName)) {
        console.log(`Sound list for version '${version}' does not exit.`);
        return;
    }

    const previousFileName = `./soundConfig/${versionCompared}.yml`;
    if (!fs.existsSync(previousFileName)) {
        console.log(`Sound config for version '${versionCompared}' does not exit.`);
        return;
    }
    const previous = Util.loadYAMLasJSON(previousFileName);
    const unset = new Set();
    const soundConfig = fs.readFileSync(soundFileName).toString()
        .split("\r\n")
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
                    let icon = previous?.[path]?.icon;
                    if (icon && icon !== "purple_dye") config[path].icon = icon;
                    else unset.add(paths.slice(0, -1).join("."));
                }
                return {config: config[path], previous: previous?.[path]};
            }, {config, previous});
            return config;
        }, {});

    console.log("Input icons for the following categories (default: 'purple_dye'):")
    for (const sound of unset) {
        const icon = await question(`'${sound}': `);
        const config = sound.split(".").reduce((config, path) => config[path], soundConfig);
        config.icon = icon || "purple_dye";
    }
    readline.close();
    Util.saveJSONasYAML(`./soundConfig/${version}.yml`, soundConfig);

    const soundboard = Util.loadYAMLasJSON("./soundboards/base.yml");

    function getCategories(config) {
        return Object.keys(config).filter(key => !["icon", "sounds"].includes(key));
    }

    function createOption(options, categoryName, spell, item, slot) {
        const option = {spell, item};
        if (slot) option.slot = slot;
        options[categoryName.replace(/\s/g, "")] = option;
    }

    function paginateOptions(options, title, page = 0) {
        let keys = Object.keys(options);
        let spellName = title.substring(0, title.length - 1);
        const hasPages = keys.length > 45 || page > 0;
        if (hasPages) spellName += page + 1;
        let titleName = spellName.substring(spellName.lastIndexOf("-") + 1);
        if (hasPages) titleName = titleName.substring(0, titleName.length - 1);
        soundboard[spellName] = Util.createBaseMenu(toTitleCase(titleName), hasPages ? " - Page " + (page + 1) : "");

        for (let i = 0; i < Math.min(45, keys.length); i++) {
            const optionName = keys[i];
            const option = options[optionName];
            delete options[optionName];
            option.slot = i;
            soundboard[spellName].options[optionName] = option;
        }

        const hasNextPage = keys.length > 45;
        const lastRow = Math.ceil(Math.min(45, keys.length) / 9) * 9;
        const spellNamePageless = spellName.substring(0, spellName.length - 1);

        // Add previous page button.
        if (page > 0) createOption(soundboard[spellName].options, "Button_Previous_Page", spellNamePageless + (page ? page : ""), `arrow{name: "<gold>Previous Page"}`, lastRow + 2);

        // Add back button.
        let previousSpellName = spellName.substring(0, spellName.lastIndexOf("-"));
        const spellNames = Object.keys(soundboard);
        // If the back spell has pages, look for the paged version instead.
        if (previousSpellName && !spellNames.includes(previousSpellName)) previousSpellName = spellNames.find(spell => spell.startsWith(previousSpellName));
        if (previousSpellName) {
            if (hasNextPage) createOption(soundboard[spellName].options, "Button_Home", previousSpellName, `book{name: "<gold>Home"}`, lastRow + 4);
            else {
                createOption(soundboard[spellName].options, "Button_Back", previousSpellName, `book{name: "<gold>Back"}`, lastRow + 4);
                return;
            }
        }

        // Set up next page.
        if (!hasNextPage) return;
        createOption(soundboard[spellName].options, "Button_Next_Page", spellNamePageless + (page + 2), {type: "arrow", name: "<gold>Next Page"}, lastRow + 6);
        paginateOptions(options, title, page + 1);
    }

    function createCategorySpells(config, title, soundName) {
        const categories = getCategories(config);
        const {icon} = config;
        if (!icon && soundName) console.log("Missing icon configuration for key: " + soundName);
        const sounds = config.sounds || [];

        // Collect options.
        const options = {};

        sounds.forEach(sound => {
            const fullSound = (soundName ? soundName + "." : "") + sound;
            const categoryName = title.substring(3, title.length - 1).replace(/-/g, "_");
            const soundSpellName = `sb-prepare-sound(args=["${fullSound}", "${categoryName}"])`;
            createOption(options, "Sound_" + toTitleCase(sound), soundSpellName, `${icon}{name: "<yellow>${toTitleCase(sound)} <gold>Sound", lore: ["<grey><italic>${fullSound}"]}`);
        });

        categories.forEach(category => {
            const categoryConfig = config[category];
            const categoryName = toTitleCase(category);
            const optionSpellName = title + category + (getCategories(categoryConfig).length > 45 ? "1" : "");
            createOption(options, categoryName, optionSpellName, `${categoryConfig.icon}{name: "<gold>${categoryName} Sounds"}`);
            if (!categoryConfig.sounds) return;
            const menuName = (title + category).substring(3).replace(/-/g, "_");
            soundboard["sb-back-edit"].modifiers.push(`variablestringequals Menu:${menuName} cast ${optionSpellName}`);
        });

        paginateOptions(options, title);

        // Go deeper.
        categories.forEach(category => {
            if (!config.hasOwnProperty(category)) return;
            createCategorySpells(config[category], title + category + "-", (soundName ? soundName + "." : "") + category);
        });
    }

    createCategorySpells(soundConfig, "sb-", "");
    soundboard["sb"].title = "<blue>Soundboard";

    // Add all the sound spells at the end.
    const soundSpells = {};
    Object.keys(soundSpells).forEach(key => soundboard[key] = soundSpells[key]);
    Util.saveJSONasYAML(`./soundboards/spellSystem-Soundboard-${soundboardVersion}-by-JasperLorelai.yml`, soundboard);
})();
