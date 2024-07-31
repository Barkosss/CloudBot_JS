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
            // Открыть сервер (Доступен Админам)
            case "openServer": {

                const modal = new Modal()
                const name = new TextInputComponent()
                const host = new TextInputComponent()
                const password = new TextInputComponent()
                const info = new TextInputComponent()

                await interaction.update();
                const announceId = await interaction.reply({ content: "" });
                break;
            }

            // Посмотреть расписание
            case "getTiming": {

                break;
            }

            // Управление доступом (К Role-Play функционалам)
            case "setAccess": {

                break;
            }

            // Подписаться на уведомления
            case "setAnnouncement": {

                break;
            }
        }

    } catch (error) {
        console.log(error);
    }
}