const { MessageEmbed, MessageButton, MessageSelectMenu, MessageActionRow, Modal, TextInputComponent } = require('discord.js');
const timestamp = require("discord-timestamp");

const { Database, LocalStorage } = require("moonlifedb");
const adapter = new LocalStorage({ path: 'database' }) // Note #1
const db = new Database(adapter)

module.exports.run = async(client, interaction) => {
    try {
        const emoji = db.read("system", { key: "emoji" });
        const section = interaction.customId.split("_")[1];

        switch(section) {
            // Верификация
            case "verify": {

                break;
            }

            // Регистрация
            case "registration": {

                break;
            }
        }

    } catch (error) {
        console.log(error);
    }
}