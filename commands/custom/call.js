const { MessageEmbed, MessageButton, MessageSelectMenu, MessageActionRow, Modal, TextInputComponent } = require('discord.js');
const timestamp = require("discord-timestamp");

const { Database, LocalStorage, JSONFormatter } = require("moonlifedb");
const adapter = new LocalStorage({ path: 'database' }) // Note #1
const db = new Database(adapter, { useTabulation: new JSONFormatter({ whitespace: "\t" }) })

module.exports.run = async(client, interaction) => {
    try {
        const emoji = db.read("system", { key: "emoji" });
        const color = db.read("system", { key: "color" });


    } catch (error) {
        console.log(error);
    }
}