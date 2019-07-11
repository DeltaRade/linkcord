class LinkManager {
	/**
	 *
	 * @param {import('./client')} client
	 */
	constructor(client) {
		this.client = client;
	}

	/**
	 *
	 * @param {import('discord.js').Channel} channel
	 */
	async cacheChannelLinkData(channel) {
		const result = this.client.db.fetch(channel.id);

		if (result && result.length) {
			const linkedTo = this.client.channels.get(result[0]);
			const mirrorWebhook = await this.client.fetchWebhook(result[1]);
			channel.linkData = { linked: true, linkedTo, mirrorWebhook };
		} else {
			channel.linkData = { linked: false };
		}
	}

	/**
	 *
	 * @param {import('discord.js').Channel} channel
	 */
	createMirrorWebhook(channel) {
		return channel.createWebhook(`Linkcord Webhook for #${channel.name}`, {
			reason: `Linkcord: link channel #${channel.name}`,
		});
	}

	/**
	 *
	 * @param {import('discord.js').Channel} channel1
	 * @param {import('discord.js').Channel} channel2
	 */
	async linkChannels(channel1, channel2) {
		const webhook1 = await this.createMirrorWebhook(channel2);
		const webhook2 = await this.createMirrorWebhook(channel1);

		this.client.db.insert(channel1.id, [
			channel2.id,
			webhook1.id,
			webhook2.id,
		]);
		channel1.linkData = {
			linked: true,
			linkedTo: channel2,
			mirrorWebhook: webhook1,
		};
		channel2.linkData = {
			linked: true,
			linkedTo: channel1,
			mirrorWebhook: webhook2,
		};
	}

	async unlinkChannels(channel1, channel2) {
		for (const channel of [channel1, channel2]) {
			channel.linkData.mirrorWebhook.delete('Linkcord: unlinked channel');
			channel.linkData = { linked: false };
		}

		this.client.db.delete(channel1.id);
		this.client.db.delete(channel2.id);
	}
}

module.exports = LinkManager;
