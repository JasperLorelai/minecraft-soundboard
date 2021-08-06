const fs = require("fs");

const path = "./soundConfig/";

for (const file of fs.readdirSync(path)) {
    if (file.startsWith("final")) continue;
    fs.rmSync(path + file);
}
