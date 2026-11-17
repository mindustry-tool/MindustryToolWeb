// (BigInt.prototype as any).toJSON = function () {
//     return this.toString();
// };

const config = () => ({
  discordToken: process.env.DISCORD_BOT_TOKEN as string,
  contentParser: {
    url: process.env.CONTENT_PARSER_URL as string,
  },
  apiV4: {
    url: process.env.API_V4_URL as string,
  },
  url: {
    frontend: process.env.FRONTEND_URL as string,
  },
});

export default config;

export interface AppConfig {
  discordToken: string;
}
