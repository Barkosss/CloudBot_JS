const { MessageEmbed, MessageButton, MessageSelectMenu, MessageActionRow, Modal, TextInputComponent } = require('discord.js');
const timestamp = require("discord-timestamp");

const { Database, LocalStorage, JSONFormatter } = require("moonlifedb");
const adapter = new LocalStorage({ path: 'database' }) // Note #1
const db = new Database(adapter, { useTabulation: new JSONFormatter({ whitespace: "\t" }) })

module.exports.run = async(client, interaction, action, customId) => {
    try {
        const emoji = db.read("system", { key: "emoji" });
        const color = db.read("system", { key: "color" });
        const text = db.read("system", { key: "text" });

        const section = customId.split("_")[1];

        if (interaction.isButton()) {
            switch(section) {
                // Открыть сервер (Доступен Админам)
                case "openServer": {

                    if (!db.check("account", { key: `users.${interaction.user.id}.userAID` })) {
                        return await interaction.reply({ content: db.read("system", { key: `text.serverStatus.errorAccess` }), ephemeral: true });
                    }

                    const modal = new Modal()
                        .setCustomId("statusserver_openServer")
                        .setTitle("Запуск сервера")

                    const name = new TextInputComponent()
                        .setCustomId("name")
                        .setLabel("Укажите название сервера:")
                        .setValue(db.read("system", { key: `text.serverStatus.serverName` }))
                        .setStyle("SHORT")
                        .setMinLength(1)
                        .setMaxLength(64)
                        .setRequired(true)

                    const host = new TextInputComponent()
                        .setCustomId("hostAID")
                        .setLabel("Укажите AID администратора:")
                        .setValue(db.read("account", { key: `users.${interaction.user.id}.userAID` }))
                        .setStyle("SHORT")
                        .setMinLength(4)
                        .setMaxLength(8)
                        .setRequired(true)

                    const password = new TextInputComponent()
                        .setCustomId("password")
                        .setLabel("Укажите пароль:")
                        .setStyle("SHORT")
                        .setMaxLength(128)
                        .setRequired(true);

                    const info = new TextInputComponent()
                        .setCustomId("info")
                        .setLabel("Укажите информацию:")
                        .setPlaceholder("Ничего - Информация отсутствует")
                        .setStyle("PARAGRAPH")
                        .setMaxLength(128)
                        .setRequired(false);

                    const nameRow = new MessageActionRow().addComponents(name);
                    const hostRow = new MessageActionRow().addComponents(host);
                    const passwordRow = new MessageActionRow().addComponents(password);
                    const infoRow = new MessageActionRow().addComponents(info);
                    modal.addComponents(nameRow, hostRow, passwordRow, infoRow);

                    await interaction.showModal(modal);
                    break;
                }

                // Редактировать информацию
                case "editServer": {

                    if (!db.check("account", { key: `users.${interaction.user.id}.userAID` })) {
                        return await interaction.reply({ content: db.read("system", { key: `text.serverStatus.errorAccess` }), ephemeral: true });
                    }

                    const data = db.read("system", { key: `system.serverStatus` });

                    const modal = new Modal()
                        .setCustomId("statusserver_editServer")
                        .setTitle("Редактирование сервера")

                    const name = new TextInputComponent()
                        .setCustomId("name")
                        .setLabel("Укажите название сервера:")
                        .setValue(data.name)
                        .setStyle("SHORT")
                        .setMinLength(1)
                        .setMaxLength(64)
                        .setRequired(true)

                    const host = new TextInputComponent()
                        .setCustomId("hostAID")
                        .setLabel("Укажите AID администратора:")
                        .setValue(data.hostAID)
                        .setStyle("SHORT")
                        .setMinLength(4)
                        .setMaxLength(8)
                        .setRequired(true)

                    const password = new TextInputComponent()
                        .setCustomId("password")
                        .setLabel("Укажите пароль:")
                        .setValue(data.password)
                        .setStyle("SHORT")
                        .setMaxLength(128)
                        .setRequired(true);

                    const info = new TextInputComponent()
                        .setCustomId("info")
                        .setLabel("Укажите информацию:")
                        .setPlaceholder("Ничего - Информация отсутствует")
                        .setValue(data.info)
                        .setStyle("PARAGRAPH")
                        .setMaxLength(128)
                        .setRequired(false);

                    const nameRow = new MessageActionRow().addComponents(name);
                    const hostRow = new MessageActionRow().addComponents(host);
                    const passwordRow = new MessageActionRow().addComponents(password);
                    const infoRow = new MessageActionRow().addComponents(info);
                    modal.addComponents(nameRow, hostRow, passwordRow, infoRow);

                    await interaction.showModal(modal);
                    break;
                }

                // Закрыть сервер
                case "closeServer": {

                    if (!db.check("account", { key: `users.${interaction.user.id}.userAID` })) {
                        return await interaction.reply({ content: db.read("system", { key: `text.serverStatus.errorAccess` }), ephemeral: true });
                    }

                    db.edit("system", { key: `system.serverStatus.status`, value: true });

                    const embed = new MessageEmbed();
                    embed.setTitle(emoji.status + " | Активность сервера: Сервер закрыт");
                    embed.addFields([
                        { name: "Название сервера:", value: "```" + db.read("system", { key: "text.serverStatus.serverName" }) + "```" },
                        { name: "Запустил:", value: "```Никто```" },
                        { name: "Пароль:", value: "```Отсутствует```" },
                        { name: "Дополнительная информация:", value: "```" + "Отсутствует" + "```" },
                        { name: "Последнее действие:", value: "<t:" + timestamp(Date.now()) + ":R>"  }
                    ])
                    embed.setColor(color.green);

                    const button = new MessageActionRow()
                        .addComponents(
                            new MessageButton()
                                .setStyle("SUCCESS")
                                .setCustomId("statusserver_openServer")
                                .setLabel("| Открыть Сервер")
                                .setEmoji(emoji.open)
                        )
                        .addComponents(
                            new MessageButton()
                                .setStyle("SECONDARY")
                                .setCustomId("statusserver_getTiming")
                                .setLabel("| Расписание")
                                .setEmoji(emoji.timetable)
                        )

                    const buttonAnnounce = new MessageActionRow()
                        .addComponents(
                            new MessageButton()
                                .setStyle("PRIMARY")
                                .setCustomId("statusserver_setAnnouncement")
                                .setLabel("| Получать уведомления")
                                .setEmoji(emoji.bell)
                        )

                    await interaction.update({ embeds:[embed], components:[button, buttonAnnounce] });
                    await interaction.followUp({ content: `Success`, ephemeral: true });
                    break;
                }

                // Посмотреть расписание
                case "getTiming": {
                    const timing = db.read("system", { key: "text.serverStatus" });

                    const embed = new MessageEmbed();
                    embed.setTitle(emoji.timetable + " | Расписание запусков");
                    embed.setDescription(timing.description);
                    embed.addFields([
                        { name: "Понедельник:", value: timing.timetable.mon },
                        { name: "Вторник:", value: timing.timetable.tue },
                        { name: "Среда:", value: timing.timetable.wed },
                        { name: "Четверг:", value: timing.timetable.thu },
                        { name: "Пятница:", value: timing.timetable.fri },
                        { name: "Суббота:", value: timing.timetable.sat },
                        { name: "Воскресенье:", value: timing.timetable.sun },
                    ])
                    embed.setColor("#a2d2ff");

                    await interaction.reply({ embeds:[embed], ephemeral: true });
                    break;
                }

                // Управление доступом (К Role-Play функционалам)
                case "setAccess": {
                    if (!db.read("system", { key: `system.serverStatus.status` })) {
                        await interaction.reply({ content: text.serverStatus.error.serverIsNotStart, ephemeral: true });
                    }

                    // ...
                    break;
                }

                // Подписаться на уведомления
                case "setAnnouncement": {
                    if (interaction.member.roles.cache.has('1198700385473417358')) { // Если у пользователя Есть роль "Получать оповещения"
                        interaction.member.roles.remove('1198700385473417358')

                        await interaction.reply({ content: 'Вы успешно **отключили** уведомления!', ephemeral: true })

                    } else { // Если у пользователя Нет роли "Получать оповещения"
                        interaction.member.roles.add('1198700385473417358')
                        interaction.member.roles.add('1198700385473417358')

                        await interaction.reply({ content: 'Вы успешно **подключили** уведомления!', ephemeral: true })
                    }
                    break;
                }
            }

            return;
        }


        if (interaction.isModalSubmit()) {
            switch (section) {

                // Редактировать/Открыть сервер
                case "editServer": {};
                case "openServer": {

                    const serverName = interaction.fields.getTextInputValue('name');
                    const serverHostAID = interaction.fields.getTextInputValue('hostAID');
                    const serverHostID = db.read("account", { key: `moderation.admins.${serverHostAID}` });
                    const serverPassword = interaction.fields.getTextInputValue('password');
                    const serverInfo = interaction.fields.getTextInputValue('info');

                    if (!db.check("account", { key: `moderation.admins.${serverHostAID}` })) {
                        return await interaction.reply({ content: text.serverStatus.error.adminNotFound, ephemeral: true });
                    }

                    db.edit("system", { key: `system.serverStatus`, value: {
                        "name": serverName,
                        "hostAID": serverHostAID,
                        "hostID": serverHostID,
                        "password": serverPassword,
                        "info": serverInfo
                    }, newline: true });

                    const embed = new MessageEmbed();
                    embed.setTitle(emoji.status + " | Активность сервера: Сервер открыт");
                    embed.addFields([
                        { name: "Название сервера:", value: "```" + serverName + "```" },
                        { name: "Запустил:", value: `<@${serverHostID}> (\`${serverHostAID}\`)` },
                        { name: "Пароль:", value: "```" + serverPassword + "```" },
                        { name: "Дополнительная информация:", value: "```" + ((serverInfo) || ("Отсутствует")) + "```" },
                        { name: "Последнее действие:", value: "<t:" + timestamp(Date.now()) + ":R>"  }
                    ])
                    embed.setColor(color.green);

                    const button = new MessageActionRow()
                        .addComponents(
                            new MessageButton()
                                .setStyle("DANGER")
                                .setCustomId("statusserver_closeServer")
                                .setLabel("| Закрыть")
                                .setEmoji(emoji.close)
                        )
                        .addComponents(
                            new MessageButton()
                                .setStyle("SECONDARY")
                                .setCustomId("statusserver_editServer")
                                .setLabel("| Редактировать")
                                .setEmoji(emoji.edit)
                        )
                        .addComponents(
                            new MessageButton()
                                .setStyle("SECONDARY")
                                .setCustomId("statusserver_getTiming")
                                .setLabel("| Расписание")
                                .setEmoji(emoji.timetable)
                        )

                    const buttonAnnounce = new MessageActionRow()
                        .addComponents(
                            new MessageButton()
                                .setStyle("PRIMARY")
                                .setCustomId("statusserver_setAccess")
                                .setLabel("| Получить доступ")
                                .setEmoji(emoji.access)
                        )
                        .addComponents(
                            new MessageButton()
                                .setStyle("PRIMARY")
                                .setCustomId("statusserver_setAnnouncement")
                                .setLabel("| Получать уведомления")
                                .setEmoji(emoji.bell)
                        )

                    await interaction.update({ embeds:[embed], components:[button] });
                    if (section == "openServer") {
                        await interaction.channel.send({ content: `<@&${db.read("system", { key: `system.notifyRole` })}>` }).then((message) => { message.delete(1000); });
                    }
                    await interaction.followUp({ content: `Success`, ephemeral: true });
                    break;
                }
            }
        }


    } catch (error) {
        console.log(error);
    }
}