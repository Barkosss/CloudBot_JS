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

client.commands = new Collection();
const commands = fs.readdirSync(__dirname + "/commands/").filter(file => file.endsWith(".js"));
let isConnected = false;
client.login(config.token).then(r => console.log(r));


client.once("ready", async() => {
    try {
        if (!commands.length) console.log("Commands not found");
        for(let file of commands) {
            const commandName = file.split(".")[0];
            const command = require(`./commands/${commandName}`);
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

        if (interaction.isButton()) {
            command = client.commands.get(interaction.customId.split('_')[0])
            return command.run(client, interaction, 'buttonUsed', interaction.customId)
        }
        else if (interaction.isSelectMenu()) {
            command = client.commands.get(interaction.customId.split('_')[0])
            return command.run(client, interaction, 'selectMenuUsed', interaction.customId)
        }
        else if (interaction.isModalSubmit()) {
            command = client.commands.get(interaction.customId.split('_')[0])
            return command.run(client, interaction, 'modalUsed', interaction.customId)
        }
        try {
            if (interaction.guild) command.run(client, interaction);
            else return;

        } catch (error) {
            interaction.reply({ content: 'Something went wrong', ephemeral: true });
            console.log(`${new Date().toLocaleString("en-GB", { timeZone: "Europe/Moscow" })} | ERROR | ${error}`)
        }


    } catch(err) {
        console.log(err);
    }
})