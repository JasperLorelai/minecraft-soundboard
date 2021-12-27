const fs = require("fs");

let path = "./soundConfig/";

for (const file of fs.readdirSync(path)) {
    if (file.startsWith("final")) continue;
    fs.rmSync(path + file);
}

path = "./soundboards/";

for (const file of fs.readdirSync(path)) {
    if (file.startsWith("spellSystem") || file.startsWith("base")) continue;
    fs.rmSync(path + file);
}
