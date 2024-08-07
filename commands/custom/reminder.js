const { MessageEmbed, MessageButton, MessageSelectMenu, MessageActionRow, Modal, TextInputComponent } = require('discord.js');
const timestamp = require("discord-timestamp");

const { Database, LocalStorage, JSONFormatter } = require("moonlifedb");
const adapter = new LocalStorage({ path: 'database' }) // Note #1
const db = new Database(adapter, { useTabulation: new JSONFormatter({ whitespace: "\t" }) })

module.exports.run = async(client, interaction) => {
    try {
        const text = db.read("system", { key: "text.reminder" });
        const emoji = db.read("system", { key: "emoji" });
        const color = db.read("system", { key: "color" });

        if (interaction.isButton()) {
            switch(interaction.customId.split("_")[1]) {

                case "create": {
                    const modal = new Modal()
                        .setCustomId("reminder_create")
                        .setTitle("Создание напоминания")

                    const content = new TextInputComponent()
                        .setCustomId("content")
                        .setLabel("Укажите содержимое")
                        .setStyle("PARAGRAPH")
                        .setMaxLength(256)
                        .setRequired(true)

                    const duration = new TextInputComponent()
                        .setCustomId("duration")
                        .setLabel("Укажите время напоминания")
                        .setStyle("SHORT")
                        .setMinLength(2)
                        .setRequired(true)

                    const contentRow = new MessageActionRow().addComponents(content);
                    const durationRow = new MessageActionRow().addComponents(duration);
                    modal.addComponents(contentRow, durationRow);
                    await interaction.showModal(modal);
                    break;
                }
            }
            return;
        }

        if (interaction.isModalSubmit()) {

            return;
        }

        switch(interaction.options.getSubcommand()) {

            // Создать напоминание
            case "create": {
                const times = interaction.options.getString("duration").replace(/^\s\s*/, '').replace(/\s\s*$/, '');
                const content = interaction.options.getString("content");

                let timer = 0;
                if (times.split(' ').length === 2) { // Если время указано в формате - ЧЧ:ММ:СС ДД:ММ:ГГ (примерно)
                    const Data = new Date();
                    const date = (times.split(' ')[0]).split('.');
                    const year = date[2]; const month = date[1]; const day = date[0];
                    const time = (times.split(' ')[1]).split(':');
                    const hour = time[0]; const minute = time[1];

                    if ((1 > month || month > 12) || (1 > day || day > 31) || (0 > hour || hour > 24) || (0 > minute || minute > 60)) {
                        return await interaction.reply({ content: "Указан некорректный формат. `ДД.ММ.ГГГГ ЧЧ:ММ`", ephemeral: true });
                    }

                    if (year < Data.getFullYear() || month-1 < Data.getMonth() || day < Data.getDate()) {
                        return await interaction.reply({ content: "Дата напоминания должна быть в будущем", ephemeral: true });
                    }

                    timer = timestamp(new Date(year, month - 1, day, hour, minute));

                } else if (times.split(' ').length === 1) {

                    const map = {
                        1000: ['s', 'sec', 'secs', 'second', 'seconds', 'с', 'сек', 'секунда', 'секунду', 'секунды', 'секунд'],
                        60000: ['m', 'min', 'mins', 'minute', 'minutes', 'м', 'мин', 'минута', 'минуту', 'минуты', 'минут'],
                        3600000: ['h', 'hour', 'hours', 'ч', 'час', 'часа', 'часов'],
                        86400000: ['d', 'day', 'days', 'д', 'день', 'дня', 'дней'],
                        604800000: ['w', 'week', 'weeks', 'н', 'нед', 'неделя', 'недели', 'недель', 'неделю'],
                        2592000000: ['mo', 'mos', 'month', 'months', 'мес', 'месяц', 'месяца', 'месяцев'],
                        31536000000: ['y', 'year', 'years', 'г', 'год', 'года', 'лет']
                    }

                    const numbers = times.match(/\d+/g);
                    const words = times.match(/\D+/g);

                    let index = 0;
                    words.forEach(item => {
                        for (let key in map) {
                            let value = map[key];
                            if (value.includes(item)) {
                                timer = timer + key * (numbers[index]);
                                break;
                            }
                        }
                        index++;
                    });

                    timer = timestamp(Date.now()) + Math.ceil(timer / 1000);
                } else {

                    return await interaction.reply({ content: `Вы указали некорректный формат даты или длительности`, ephemeral: true });
                }

                const count = Object.keys(db.read("account", { key: `users.${interaction.user.id}.reminders` })).length + 1;
                db.edit("reminder", {
                    key: `reminders.${timer}.${interaction.user.id}.#${count}`, value: {
                        "content": content,
                        "timer": timer,
                        "createdAt": timestamp(Date.now()),
                        "lastUpdate": false
                    }, newline: true
                })

                db.edit("account", { key: `users.${interaction.user.id}.reminders.#${count}`, value: {
                        "content": content,
                        "timer": timer,
                    }, newline: true
                });

                const embed = new MessageEmbed();
                embed.setTitle(emoji.reminder + ` | Напоминание #${count}:`)
                embed.addFields([
                    { name: `Дата:`, value: `> <t:${timer}:d> (<t:${timer}:R>)` },
                    { name: `Содержание:`, value: "```" + content + "```" },
                ])
                embed.setFooter({ text: `Действие: Создание` })
                embed.setColor(color.main)


                await interaction.reply({ embeds:[embed], ephemeral: true });
                break;
            }

            // Редактировать напоминание
            case "edit": {
                await interaction.reply({ content: `*В разработке*`, ephemeral: true });
                break;
            }

            // Удалить напоминание
            case "remove": {
                const index = interaction.options.getNumber("index");

                if (!db.check("account", { key: `users.${interaction.user.id}.reminders.#${index}` })) {
                    return await interaction.reply({ content: text.error.notFound, ephemeral: true });
                }

                let time = db.read("account", { key: `users.${interaction.user.id}.reminders.#${index}.timer` });
                db.edit("account", { key: `users.${interaction.user.id}.reminders.#${index}`, value: undefined });
                db.edit("reminder", { key: `reminders.${time}.${interaction.user.id}.#${index}`, value: undefined });


                const embed = new MessageEmbed();
                embed.setTitle(emoji.reminder + " | Список напоминаний:");
                embed.setDescription(text.remove.description);
                embed.setFooter({ text: `Действие: Удаление` });
                embed.setColor(color.main)

                await interaction.reply({ embeds:[embed], ephemeral: true });
                break;
            }

            // Посмотреть список напоминаний
            case "list": {
                const data = db.read("account", { key: `users.${interaction.user.id}.reminders` });

                const embed = new MessageEmbed();
                embed.setTitle(emoji.reminder + " | Список напоминаний:");
                if (Object.keys(data).length) {

                    for(let count in data) {
                        const content = data[count].content;
                        const timer = data[count].timer;

                        embed.addFields([
                            { name: `${count}:`, value: `- Дата: <t:${timer}:d> (<t:${timer}:R>)\n- Содержимое: ${content}` }
                        ])
                    }

                } else {
                    embed.setDescription("```Напоминания отсутствуют```")
                }
                embed.setFooter({ text: `Действие: Просмотр` });
                embed.setColor(color.main)

                await interaction.reply({ embeds:[embed], ephemeral: true });
                break;
            }
        }

    } catch (error) {
        console.log(error);
    }
}