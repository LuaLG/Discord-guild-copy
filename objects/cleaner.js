const { copyEmojis, copyBans } = require('../settings.json');
const Logger = require('./logger');

class Cleaner {
    /**
     * Cleaning the new guild.
     * Channels: All categories/text/voice channels
     * Roles: All roles except the 'guildcopy' role
     * Emojis: All emojis (only if enabled in the settings)
     * Bans: All banned users (only if enabled in the settings)
     * @param {Client} client Discord Client
     * @param {string} newGuildId New guild id
     * @param {string} newGuildAdminRoleId New guild Administrator role id
     * @param {Object} guildData Serialized guild data
     * @returns {Object} guildData
     */
    static cleanNewGuild(client, newGuildId, newGuildAdminRoleId, guildData) {
        return new Promise(async (resolve, reject) => {
            try {
                let newGuild = client.guilds.get(newGuildId);

                // Delete channel
                Logger.logMessage(`${guildData.step++}. Deleting channels`);
                let promises = [];
                newGuild.channels.forEach(channel => {
                    promises.push(channel.delete());
                });
                await Promise.all(promises);
                promises = [];
                

                // Delete roles
                let filter = role => role.id !== newGuildAdminRoleId && role.id !== newGuild.defaultRole.id;
                let rolesToDelete = newGuild.roles.filter(filter);
                Logger.logMessage(`${guildData.step++}. Deleting roles`);
                rolesToDelete.forEach(role => {
                    promises.push(role.delete());
                });
                await Promise.all(promises);
                promises = [];

                // Delete emojis
                if (copyEmojis) {
                    Logger.logMessage(`${guildData.step++}. Deleting emojis`);
                    newGuild.emojis.forEach(emoji => {
                        promises.push(emoji.delete());
                    });
                }
                await Promise.all(promises);
                promises = [];

                // Delete Bans
                if (copyBans) {
                    Logger.logMessage(`${guildData.step++}. Lifting bans`);
                    let bans = await newGuild.fetchBans();
                    let unbans = [];
                    bans.forEach(ban => unbans.push(newGuild.members.unban(ban.user.id)));
                    await Promise.all(unbans);
                }

                Logger.logMessage(`${guildData.step++}. New guild cleanup finished`);
                return resolve(guildData);
            } catch (err) {
                return reject(err);
            }
        });
    }
}

module.exports = Cleaner;
