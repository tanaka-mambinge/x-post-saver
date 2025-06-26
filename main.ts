import {
	App,
	Modal,
	normalizePath,
	Notice,
	Plugin,
	PluginSettingTab,
	requestUrl,
	Setting,
	TFile,
} from "obsidian";

interface TweetSaverSettings {
	tweetsFolder: string;
	copyPathToClipboard: boolean;
}

const DEFAULT_SETTINGS: Partial<TweetSaverSettings> = {
	tweetsFolder: "Tweets",
	copyPathToClipboard: true,
};

export class TweetSaverSettingTab extends PluginSettingTab {
	plugin: MyPlugin;

	constructor(app: App, plugin: MyPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		new Setting(containerEl)
			.setName("Tweets folder")
			.setDesc(
				'Choose where to save your tweets. Leave empty to save in your vault\'s root folder, or specify a path like "Bookmarks/Tweets" to organize them in subfolders.'
			)
			.addText((text) =>
				text
					.setPlaceholder("Tweets")
					.setValue(this.plugin.settings.tweetsFolder)
					.onChange(async (value) => {
						this.plugin.settings.tweetsFolder = value;
						await this.plugin.saveSettings();
					})
			);

		new Setting(containerEl)
			.setName("Copy note path to clipboard")
			.setDesc(
				"Automatically copy the path to the saved tweet note to your clipboard after saving."
			)
			.addToggle((toggle) =>
				toggle
					.setValue(this.plugin.settings.copyPathToClipboard)
					.onChange(async (value) => {
						this.plugin.settings.copyPathToClipboard = value;
						await this.plugin.saveSettings();
					})
			);
	}
}

export class TweetUrlModal extends Modal {
	constructor(app: App, onSubmit: (result: string) => void) {
		super(app);
		this.setTitle("Save Tweet");

		let tweetUrl = "";
		new Setting(this.contentEl)
			.setName("Tweet URL")
			.setDesc("Enter the URL of the tweet you want to save")
			.addText((text) =>
				text
					.setPlaceholder("https://twitter.com/username/status/...")
					.onChange((value) => {
						tweetUrl = value;
					})
			);

		new Setting(this.contentEl)
			.addButton((btn) =>
				btn
					.setButtonText("Save Tweet")
					.setCta()
					.onClick(() => {
						this.close();
						onSubmit(tweetUrl);
					})
			)
			.addButton((btn) =>
				btn.setButtonText("Cancel").onClick(() => {
					this.close();
				})
			);
	}
}

export default class MyPlugin extends Plugin {
	settings: TweetSaverSettings;

	async onload() {
		await this.loadSettings();

		// Add Twitter icon to the ribbon
		this.addRibbonIcon("twitter", "Save Tweet", () => {
			this.openTweetUrlModal();
		});

		// Add command (accessible via Command Palette, no hotkey)
		this.addCommand({
			id: "save-tweet",
			name: "Save Tweet",
			callback: () => {
				this.openTweetUrlModal();
			},
		});

		// Add settings tab
		this.addSettingTab(new TweetSaverSettingTab(this.app, this));
	}

	async loadSettings() {
		this.settings = Object.assign(
			{},
			DEFAULT_SETTINGS,
			await this.loadData()
		);
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

	openTweetUrlModal() {
		new TweetUrlModal(this.app, async (tweetUrl) => {
			if (tweetUrl.trim()) {
				new Notice(`Fetching tweet data...`);
				console.log("Tweet URL:", tweetUrl);

				try {
					// Encode the tweet URL for the API request
					const encodedUrl = encodeURIComponent(tweetUrl);
					const apiUrl = `https://publish.twitter.com/oembed?url=${encodedUrl}`;

					console.log("Making request to:", apiUrl);

					// Make GET request to Twitter publish API
					const response = await requestUrl({
						url: apiUrl,
						method: "GET",
					});

					console.log("Full Response JSON:", response.json);

					// Extract the required fields
					const { url, author_name, author_url, html } =
						response.json;

					// Extract tweet text from HTML
					const tweetText = this.extractTweetText(html);

					// Log extracted data
					console.log("Extracted data:", {
						url,
						author_name,
						author_url,
						tweet_text: tweetText,
					});

					// Save tweet as note
					await this.saveTweetAsNote({
						url,
						author_name,
						author_url,
						tweet_text: tweetText,
					});

					new Notice(`Tweet saved successfully!`);
				} catch (error) {
					console.error("Error fetching tweet data:", error);
					new Notice(`Error fetching tweet data`);
				}
			} else {
				new Notice("Please enter a valid tweet URL");
			}
		}).open();
	}

	extractTweetText(html: string): string {
		try {
			// Create a temporary DOM element to parse the HTML
			const parser = new DOMParser();
			const doc = parser.parseFromString(html, "text/html");

			// Find the tweet text paragraph
			const tweetParagraph = doc.querySelector(
				'blockquote.twitter-tweet p[lang="en"]'
			);

			if (tweetParagraph) {
				// Replace <br> tags with newlines before extracting text
				const htmlWithNewlines = tweetParagraph.innerHTML.replace(
					/<br\s*\/?>/gi,
					"\n"
				);

				// Create a temporary element to extract clean text
				const tempDiv = document.createElement("div");
				tempDiv.innerHTML = htmlWithNewlines;
				let text = tempDiv.textContent || "";

				// Remove any trailing URLs (t.co links)
				text = text.replace(/https:\/\/t\.co\/\w+$/, "").trim();

				return text;
			}

			return "Could not extract tweet text";
		} catch (error) {
			console.error("Error extracting tweet text:", error);
			return "Error extracting tweet text";
		}
	}

	async saveTweetAsNote(tweetData: {
		url: string;
		author_name: string;
		author_url: string;
		tweet_text: string;
	}) {
		try {
			const { vault } = this.app;

			// Determine the folder path
			const folderPath = this.settings.tweetsFolder.trim() || "";

			// Create folders if they don't exist
			if (folderPath) {
				const normalizedPath = normalizePath(folderPath);
				const folder = vault.getAbstractFileByPath(normalizedPath);

				if (!folder) {
					await vault.createFolder(normalizedPath);
					console.log(`Created folder: ${normalizedPath}`);
				}
			}

			// Generate filename from author name and first 20 chars of tweet
			const sanitizedAuthor = tweetData.author_name
				.replace(/[^a-zA-Z0-9\s]/g, "")
				.trim();
			const first20Chars = tweetData.tweet_text
				.substring(0, 20)
				.replace(/[^a-zA-Z0-9\s]/g, "")
				.trim();
			const filename = `${sanitizedAuthor} - ${first20Chars}....md`;

			// Create full file path
			const fullPath = folderPath
				? normalizePath(`${folderPath}/${filename}`)
				: filename;

			// Create markdown content
			const markdownContent = this.createMarkdownContent(tweetData);

			// Check if file already exists and handle accordingly
			const existingFile = vault.getAbstractFileByPath(fullPath);
			if (existingFile && existingFile instanceof TFile) {
				// File exists, overwrite it
				await vault.modify(existingFile, markdownContent);
				console.log(`Tweet overwritten at: ${fullPath}`);
			} else {
				// File doesn't exist, create new one
				await vault.create(fullPath, markdownContent);
				console.log(`Tweet saved as: ${fullPath}`);
			}

			// Copy path to clipboard if setting is enabled
			if (this.settings.copyPathToClipboard) {
				await navigator.clipboard.writeText(`[[${filename}]]`);
				console.log(`Filename copied to clipboard: ${filename}`);
			}
		} catch (error) {
			console.error("Error saving tweet as note:", error);
			throw error;
		}
	}

	createMarkdownContent(tweetData: {
		url: string;
		author_name: string;
		author_url: string;
		tweet_text: string;
	}): string {
		const { url, author_name, author_url, tweet_text } = tweetData;
		const now = new Date();
		const currentDateTime =
			now.toLocaleDateString("en-US", {
				year: "numeric",
				month: "long",
				day: "numeric",
			}) +
			" at " +
			now.toLocaleTimeString("en-US", {
				hour12: false,
				hour: "2-digit",
				minute: "2-digit",
			});

		// Format date for YAML (ISO format for date & time properties)
		const yamlDateTime = now.toISOString();

		return `---
author: "${author_name}"
author_url: "${author_url}"
tweet_url: "${url}"
date_saved: ${yamlDateTime}
---
# Tweet by ${author_name}

**Author:** [${author_name}](${author_url})
**Original Tweet:** [View on Twitter](${url})
**Saved:** ${currentDateTime}

---

${tweet_text}
`;
	}
}
