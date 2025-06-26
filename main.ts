import { App, Modal, Notice, Plugin, Setting, requestUrl } from "obsidian";

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
	tweetUrls: string[] = [];

	async onload() {
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
	}

	openTweetUrlModal() {
		new TweetUrlModal(this.app, async (tweetUrl) => {
			if (tweetUrl.trim()) {
				this.tweetUrls.push(tweetUrl);
				new Notice(`Fetching tweet data...`);
				console.log("Tweet URL stored:", tweetUrl);

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

					new Notice(`Tweet data extracted successfully`);
				} catch (error) {
					console.error("Error fetching tweet data:", error);
					new Notice(`Error fetching tweet data: ${error.message}`);
				}

				console.log("All stored URLs:", this.tweetUrls);
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
				// Get the text content and clean it up
				let text = tweetParagraph.textContent || "";

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
}
