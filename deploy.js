const { SlashCommandBuilder, ContextMenuCommandBuilder } = require("@discordjs/builders");
const config = require("./config.json");
const { REST } = require("@discordjs/rest");
const { Routes, ApplicationCommandType, PermissionFlagsBits } = require("discord-api-types/v10");

const commands = [

    new SlashCommandBuilder()
        .setName("embed")
        .setDMPermission(false)
        .setDescription("Отправить системный эмбед")
        .addStringOption((option) =>
            option
                .setName("section")
                .setDescription("Выберите раздел")
                .addChoices(
                    { name: "Верификация", value: "verify" },
                    { name: "Регистрация", value: "registration" },
                    { name: "Статус сервера", value: "status" },
                )
                .setRequired(true)
        ),
].map(command => command.toJSON());

const rest = new REST({ version: "10" }).setToken(config.token);
(async() => {
    try {
        console.log("Reloading");

        await rest.put(
            Routes.applicationCommands("1226072189871063063"),
            {
                body: commands
            }
        );

        console.log("Reloaded");

    } catch(error) {
        console.log(error);
    }
})();