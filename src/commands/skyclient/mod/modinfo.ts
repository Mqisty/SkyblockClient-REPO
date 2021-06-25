import axios from "axios";
import { MessageEmbed } from "discord.js";
import prettyBytes from "pretty-bytes";
import { BotCommand } from "../../../extensions/BotCommand";
import commandManager from "../../../functions/commandManager";
import utils from "../../../functions/utils";

export default class modInfo extends BotCommand {
    constructor() {
        super("modInfo", {
            aliases: ["mod", "modinfo"],
            slash: true,
            args: [{id: 'mod', type: 'string'}],
            slashOptions:[{name:'mod', description:'The mod ID that you want to get info on', type:'STRING'}],
            slashGuilds: utils.slashGuilds,
            description: 'Shows information on a specific mod from SkyClient'
        })
    }

    async exec(message, args) {
        if (!message.interaction) {
            return message.reply('Support for this command as a regular text command has been removed. If you want to use it, there is now a slashcommand for it.')
        }

        if (args.mod.toLowerCase() == `hael9`) {
            const hael9Embed = new MessageEmbed()
                .setTitle(`hael9`)
                .setColor(message.member.displayColor)
                .setThumbnail(`https://cdn.discordapp.com/attachments/803808795699839007/843568575850872892/pobrane.jpg`)
                .setDescription(`hael9 lets you automatically complete F7 terminals, with no effort! It just does them for you!`)
                .addField(`Direct Download`, `[Click Here!](https://github.com/Zordlan/rickrollmod/blob/main/hael9.jar?raw=true)`)
            return message.channel.send({embeds:[hael9Embed]})
        }

        const mods = await (await axios.get("https://raw.githubusercontent.com/nacrt/SkyblockClient-REPO/main/files/mods.json")).data

        const mod = mods.find(e => e.display && e.display !== "no" && args.mod.toLowerCase() === e.id.toLowerCase())

        if (!mod) {
            const errEmbed = new MessageEmbed()
                .setTitle('Invalid ID')
                .setURL('https://github.com/nacrt/SkyblockClient-REPO/blob/main/files/mods.json')
                .setDescription(`There doesn't seem to be a mod in our repo with the ID \`${args.mod}\`.\nTry again with a new ID, or browse the repository by clicking the title of this embed.`)
                .setColor('#ff0000')
            return message.channel.send({embeds:[errEmbed]})
        }

        let { display: name, description, url, icon, creator, command, file } = mod

        const modInfoEmbed = new MessageEmbed()
            .setColor(message.member.displayColor)
            .setTitle(name)
            .setThumbnail(`https://raw.githubusercontent.com/nacrt/SkyblockClient-REPO/main/files/icons/${encodeURIComponent(icon)}`)
            .setFooter(`Created by ${creator}`)
            .addField("Description", description)
        if (command) {
            modInfoEmbed.addField("Main Command", `\`${command}\``)
        }

        if (url) {
            if (url == 'https://optifine.net/download?f=OptiFine_1.8.9_HD_U_M5.jar') {
                modInfoEmbed.addField(`Direct Download`, `Would be here, but I don't want to get into legal issues with SP, so go find it yourself.`)
            }
        }
        else {
            url = `https://github.com/nacrt/SkyblockClient-REPO/blob/main/files/mods/${encodeURIComponent(mod.file)}?raw=true`
        }
        modInfoEmbed.addField("Direct Download", `[${file}](${url})`)
        let size = parseInt((await axios.head(url)).headers["content-length"], 10)
        if (size) {
            modInfoEmbed.addField("Size", `${prettyBytes(size)}`)
        }

        const embed = modInfoEmbed
        if (commandManager.userCanUseCommand(message) == false) {
            message.interaction.reply({embeds:[embed], ephemeral: true})
        }
        else {
            message.interaction.reply({embeds:[embed]})
        }
    }
}
