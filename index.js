const { Client, GatewayIntentBits, Collection } = require('discord.js');
require('dotenv').config();
const fs = require('fs');

const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent],
});

client.commands = new Collection();
client.buttons = new Collection();

const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    client.commands.set(command.name, command);
}

const buttonFiles = fs.readdirSync('./buttons').filter(file => file.endsWith('.js'));
for (const file of buttonFiles) {
    const button = require(`./buttons/${file}`);
    client.buttons.set(button.customId, button);
}

client.once('ready', () => {
    console.log('Bot está online!');
});

client.on('messageCreate', message => {
    if (!message.content.startsWith('!')) return;
    const args = message.content.slice(1).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();

    if (client.commands.has(commandName)) {
        client.commands.get(commandName).execute(message, client);
    }
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isButton()) return;
    const button = client.buttons.get(interaction.customId);
    if (button) button.execute(interaction, client);
});

//mensagensconsole
const channelID = process.env.CHANNEL_ID;
client.on('ready', () => {
    console.log(`Sistema de mensagens carregado!`);

    process.stdin.on('data', (data) => {
        const message = data.toString().trim();
        if (message) {
            const channel = client.channels.cache.get(channelID);
            if (channel) {
                channel.send(message)
                    .then(() => console.log(`Mensagem enviada: ${message}`))
                    .catch(console.error);
            } else {
                console.error('Canal não encontrado!');
            }
        }
    });
});

client.login(process.env.TOKEN);