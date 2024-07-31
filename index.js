const { Client, Intents, Collection } = require("discord.js");
const client = new Client(
    {
        intents: [
            Intents.FLAGS.GUILDS,
            Intents.FLAGS.GUILD_MEMBERS,
        ],
        partials: [
            "CHANNEL",
            "GUILD_MEMBER",
            "MESSAGE",
            "USER"
        ]
    }
)

const config = require("./config.json");
const fs = require("fs");
const timestamp = require("discord-timestamp");

const { Database, LocalStorage } = require("moonlifedb");
const adapter = new LocalStorage({ path: 'database' }) // Note #1
const db = new Database(adapter)


client.commands = new Collection();
const utilityCommands = fs.readdirSync(__dirname + "/commands/utility/").filter(file => file.endsWith(".js"));
let isConnected = false;
client.login(config.token);


client.once("ready", async() => {
    try {
        for(let file of utilityCommands) {
            const commandName = file.split(".")[0];
            const command = require(`./commands/utility/${commandName}`);
            client.commands.set(commandName, command);
        }
        isConnected = true;
        console.log(`${client.user.username} is ready!`);

    } catch(err) {
        console.log(err);
    }
});


client.on("interactionCreate", async(interaction) => {
    try {
        if (!isConnected) return;
        let command = client.commands.get(interaction.commandName);

        try {
            if (interaction.guild) return command.run(client, interaction, 'modalUsed', interaction.customId);
            else return;

        } catch (error) {
            interaction.reply({ content: 'Something went wrong', ephemeral: true });
            console.log(`${new Date().toLocaleString("en-GB", { timeZone: "Europe/Moscow" })} | ERROR | ${error}`)
        }


    } catch(err) {
        console.log(err);
    }
})