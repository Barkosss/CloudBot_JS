const { MessageEmbed, MessageButton, MessageSelectMenu, MessageActionRow, Modal, TextInputComponent } = require('discord.js');
const timestamp = require("discord-timestamp");

const { Database, LocalStorage } = require("moonlifedb");
const adapter = new LocalStorage({ path: 'database' }) // Note #1
const db = new Database(adapter)

module.exports.run = async(client, interaction) => {
    try {
        const emoji = db.read("system", { key: "emoji" });
        const section = interaction.options.getString("section");
        switch(section) {

            case "verify": {
                const embed = new MessageEmbed();
                embed.setTitle(emoji.verify + " | Верификация пользователя");
                embed.setDescription("Чтобы подать заявку на вступление, необходимо для начала пройти верификацию");
                embed.setColor("#cee0dc");

                const button = new MessageActionRow()
                    .addComponents(
                        new MessageButton()
                            .setStyle("SUCCESS")
                            .setCustomId("auth_verify")
                            .setLabel("| Верифицироваться")
                            //.setEmoji(emoji.verify)
                    )

                await interaction.channel.send({ embeds:[embed], components:[button] });
                await interaction.reply({ content: `Success!`, ephemeral: true });
                break;
            }

            case "registration": {
                const embed = new MessageEmbed();
                embed.setTitle(emoji.registration + " | Регистрация");
                embed.setDescription("Чтобы получить полноценный доступ, необходимо пройти регистрацию. Она состоит их пяти простых вопросов.");
                embed.addFields("График рассмотрения заявок:", "С <t:1722409200:t> до <t:1722438000:t>", false);
                embed.setColor("#cee0dc");

                const button = new MessageActionRow()
                    .addComponents(
                        new MessageButton()
                            .setStyle("SUCCESS")
                            .setCustomId("auth_register")
                            .setLabel("| Подать заявку")
                            .setEmoji(emoji.registration)
                    )

                await interaction.channel.send({ embeds:[embed], components:[button] });
                await interaction.reply({ content: `Success!`, ephemeral: true });
                break;
            }

            case "status": {
                const embed = new MessageEmbed();
                embed.setTitle(emoji.status + " | Активность сервера");
                embed.setDescription("");
                embed.addFields([
                    { name: "Название сервера:", value: "```" + "```" },
                    { name: "Запустил:", value: "`Никто`" },
                    { name: "Пароль:", value: "`Отсутствует`" },
                    { name: "Дополнительная информация:", value: "```" + "Отсутствует" + "```" },
                    { name: "Последнее действие:", value: "<t:" + timestamp(Date.now()) + ":R>"  }
                ])
                embed.setColor("#b7cece");

                await interaction.channel.send({ embeds:[embed] });
                await interaction.reply({ content: `Success!`, ephemeral: true });
                break;
            }
        }

    } catch(err) {
        console.log(err);
    }
}