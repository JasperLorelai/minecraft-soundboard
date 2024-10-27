const Util = require("./Util");
const {version, versionCompared} = require("./Config");

const readline = require("node:readline").createInterface({
    input: process.stdin,
    output: process.stdout
});
const question = query => new Promise(resolve => readline.question(query, resolve));

(async () => {
    const soundFileName = `./sounds/${version}.txt`;
    if (!Util.fileExists(soundFileName)) {
        console.log(`Sound list for version '${version}' does not exit.`);
        return;
    }

    function configPath(version, prefix = "") {
        return `./soundConfig/${prefix}${version}.yml`;
    }

    const previousFileName = configPath(versionCompared, "final-");
    if (!Util.fileExists(previousFileName)) {
        console.log(`Sound config for version '${versionCompared}' does not exit.`);
        return;
    }
    const previous = Util.loadYAMLasJSON(previousFileName);
    const unset = new Set();
    const sounds = Util.loadYAML(soundFileName)
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
                    if (icon) config[path].icon = icon;
                    else unset.add(paths.slice(0, -1).join("."));
                }
                return {config: config[path], previous: previous?.[path]};
            }, {config, previous});
            return config;
        }, {});

    console.log("Input icons for the following categories (default: 'purple_dye'):")
    for (const sound of unset) {
        const icon = await question(`'${sound}': `);
        const config = sound.split(".").reduce((config, path) => config[path], sounds);
        config.icon = icon || "purple_dye";
    }
    readline.close();

    Util.saveJSONasYAML(configPath(version), sounds);
})();
