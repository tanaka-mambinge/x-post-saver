import { App, Modal, Plugin, Setting, Notice } from "obsidian";

export class TweetUrlModal extends Modal {
	constructor(app: App, onSubmit: (result: string) => void) {
		super(app);
		this.setTitle('Save Tweet');

		let tweetUrl = '';
		new Setting(this.contentEl)
			.setName('Tweet URL')
			.setDesc('Enter the URL of the tweet you want to save')
			.addText((text) =>
				text
					.setPlaceholder('https://twitter.com/username/status/...')
					.onChange((value) => {
						tweetUrl = value;
					})
			);

		new Setting(this.contentEl)
			.addButton((btn) =>
				btn
					.setButtonText('Save Tweet')
					.setCta()
					.onClick(() => {
						this.close();
						onSubmit(tweetUrl);
					})
			)
			.addButton((btn) =>
				btn
					.setButtonText('Cancel')
					.onClick(() => {
						this.close();
					})
			);
	}
}

export default class MyPlugin extends Plugin {
	async onload() {
		// Add Twitter icon to the ribbon
		this.addRibbonIcon("twitter", "Save Tweet", () => {
			this.openTweetUrlModal();
		});

		// Add command (accessible via Command Palette, no hotkey)
		this.addCommand({
			id: 'save-tweet',
			name: 'Save Tweet',
			callback: () => {
				this.openTweetUrlModal();
			},
		});
	}

	openTweetUrlModal() {
		new TweetUrlModal(this.app, (tweetUrl) => {
			if (tweetUrl.trim()) {
				new Notice(`Tweet URL saved: ${tweetUrl}`);
				// TODO: Add actual tweet saving functionality here
				console.log('Saving tweet from URL:', tweetUrl);
			} else {
				new Notice('Please enter a valid tweet URL');
			}
		}).open();
	}
}
