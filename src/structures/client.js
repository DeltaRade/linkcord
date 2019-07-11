const fs = require('fs');
const jndb=require('jndb')
const { AkairoClient, CommandHandler, ListenerHandler } = require('discord-akairo');

const LinkManager = require('./link-manager');

class LinkcordClient extends AkairoClient {

    constructor() {
        super({
            disabledEvents: ['TYPING_START'],
            disableEveryone: true
        });

        this.commandHandler = new CommandHandler(this, {
            directory: './src/commands/',
            prefix: process.env.BOT_PREFIX,
            commandUtil: true,
            allowMention: true,
            handleEdits: true
        });

        this.listenerHandler = new ListenerHandler(this, {
            directory: './src/listeners/'
        });

        this.db = new jndb.Connection();
        this.db.use('linked_channels')
        this.linkManager = new LinkManager(this);
    }

    login(token) {
        this.loadModules();
        super.login(token);
    }

    loadModules() {
        this.commandHandler.useListenerHandler(this.listenerHandler);
        this.commandHandler.loadAll();
        this.listenerHandler.loadAll();
    }

}

module.exports = LinkcordClient;
