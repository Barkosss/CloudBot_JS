const { MessageEmbed, MessageButton, MessageActionRow } = require('discord.js');
const timestamp = require("discord-timestamp");

const { Database, LocalStorage, JSONFormatter } = require("moonlifedb");
const adapter = new LocalStorage({ path: 'database' }) // Note #1
const db = new Database(adapter, { useTabulation: new JSONFormatter({ whitespace: "\t" }) })

module.exports.run = async(client) => {
    try {
        const emoji = db.read("system", { key: "emoji" });
        const color = db.read("system", { key: "color" });

        if (Object.keys(db.read("reminder", { key: `reminders` })).length) {
            const now = timestamp(Date.now());
            const reminders = db.read("reminder", { key: `reminders` });

            for(let time in reminders) {
                if (time > now) continue;

                for(let userID in reminders[time]) {
                    for(let reminder in reminders[time][userID]) {
                        const content = reminders[time][userID][reminder].content;
                        const lastUpdate = reminders[time][userID][reminder].lastUpdate;
                        const createdAt = reminders[time][userID][reminder].createdAt;

                        const embed = new MessageEmbed();
                        embed.setTitle(emoji.reminder + " | Напоминание:");
                        embed.addFields([{ name: `Содержимое:`, value: "```" + content + "```" }]);
                        if (lastUpdate) embed.addFields([{ name: `Последнее изменение:`, value: `- <t:${lastUpdate}:t> (<t:${lastUpdate}:R>)` }]);
                        embed.addFields([{ name: `Дата создания:`, value: `- <t:${createdAt}:t> (<t:${createdAt}:R>)` }]);
                        embed.setColor(color.main);

                        const button = new MessageActionRow()
                            .addComponents(
                                new MessageButton()
                                    .setStyle("PRIMARY")
                                    .setCustomId("reminder_create")
                                    .setEmoji(emoji.create)
                            )

                        await client.users.fetch(userID).then(user => {
                            user.createDM().then((userDM) => {

                                if (!Object.keys(db.read('account', { key: `users.${userID}.reminder` })).length)
                                    db.edit('account', { key: `users.${userID}.reminder`, value: undefined });

                                if (!Object.keys(db.read('reminder', { key: `reminders.${time}.${userID}` })).length)
                                    db.edit('reminder', { key: `reminders.${time}.${userID}`, value: undefined });

                                if (!Object.keys(db.read('reminder', { key: `reminders.${time}` })).length)
                                    db.edit('reminder', { key: `reminders.${time}`, value: undefined });

                                db.edit("reminder", { key: `reminders.${time}.${userID}.${reminder}`, value: undefined });
                                db.edit("account", { key: `users.${userID}.reminders.${reminder}`, value: undefined });
                                userDM.send({ embeds:[embed], components:[button] });
                            }).catch((error) => console.log(error));
                        }).catch((error) => console.log(error));
                    }
                }
            }
        }

    } catch (error) {
        console.log(error);
    }
}