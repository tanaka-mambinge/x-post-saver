# X Post Saver

An Obsidian plugin that saves X (formerly Twitter) posts' text data to new notes or inside a specific directory in your vault.

This project uses TypeScript to provide type checking and documentation.
The repo depends on the latest plugin API (obsidian.d.ts) in TypeScript Definition format, which contains TSDoc comments describing what it does.

## Features

- **Save X Posts**: Extract and save tweet text content to Obsidian notes
- **Flexible Storage**: Choose to create new notes or save to a specific directory
- **Desktop & Mobile**: Works on both desktop and mobile versions of Obsidian
- **Customizable**: Configure default save locations and note formats through settings
- **Quick Access**: Easy-to-use commands and interface for saving posts

## Installation

### From Obsidian Community Plugins

1. Open Obsidian Settings
2. Go to Community Plugins and turn off Restricted Mode
3. Click Browse and search for "X Post Saver"
4. Install and enable the plugin

### Manual Installation

1. Download the latest release from the [releases page](https://github.com/your-username/x-post-saver/releases)
2. Extract the files to your vault's `.obsidian/plugins/x-post-saver/` folder
3. Reload Obsidian and enable the plugin in settings

## Usage

1. Copy an X post URL or text
2. Use the command palette (Ctrl/Cmd + P) and search for "Save X Post"
3. Choose your preferred save location
4. The post content will be saved as a new note in your vault

## Development

### Development Setup

Quick starting guide for developers:

- Make sure your NodeJS is at least v16 (`node --version`)
- Clone this repository to your local development folder
- For convenience, you can place this folder in your `.obsidian/plugins/x-post-saver` folder
- Install dependencies: `npm i`
- Run `npm run dev` to compile your plugin from `main.ts` to `main.js`
- Make changes to `main.ts` (or create new `.ts` files). Those changes should be automatically compiled into `main.js`
- Reload Obsidian to load the new version of your plugin
- Enable plugin in settings window
- For updates to the Obsidian API run `npm update`

## Publishing Releases

- Update your `manifest.json` with your new version number, such as `1.0.1`, and the minimum Obsidian version required for your latest release
- Update your `versions.json` file with `"new-plugin-version": "minimum-obsidian-version"` so older versions of Obsidian can download an older version of your plugin that's compatible
- Create new GitHub release using your new version number as the "Tag version". Use the exact version number, don't include a prefix `v`. See the [sample plugin releases](https://github.com/obsidianmd/obsidian-sample-plugin/releases) for an example
- Upload the files `manifest.json`, `main.js`, `styles.css` as binary attachments. Note: The manifest.json file must be in two places, first the root path of your repository and also in the release
- Publish the release

> You can simplify the version bump process by running `npm version patch`, `npm version minor` or `npm version major` after updating `minAppVersion` manually in `manifest.json`.
> The command will bump version in `manifest.json` and `package.json`, and add the entry for the new version to `versions.json`

## Adding to Community Plugin List

- Check the [plugin guidelines](https://docs.obsidian.md/Plugins/Releasing/Plugin+guidelines)
- Publish an initial version
- Make sure you have a `README.md` file in the root of your repo
- Make a pull request at the [obsidian-releases repository](https://github.com/obsidianmd/obsidian-releases) to add your plugin

## Build Commands

- `npm run dev` to start compilation in watch mode
- `npm run build` to build for production

## Manual Plugin Installation

- Copy over `main.js`, `styles.css`, `manifest.json` to your vault `VaultFolder/.obsidian/plugins/x-post-saver/`

## Code Quality

### Improve code quality with eslint (optional)

[ESLint](https://eslint.org/) is a tool that analyzes your code to quickly find problems. You can run ESLint against your plugin to find common bugs and ways to improve your code.

To use eslint with this project, make sure to install eslint from terminal:

- `npm install -g eslint`

To use eslint to analyze this project use this command:

- `eslint main.ts`
- eslint will then create a report with suggestions for code improvement by file and line number

If your source code is in a folder, such as `src`, you can use eslint with this command to analyze all files in that folder:

- `eslint .\src\`

## API Documentation

See the [Obsidian API documentation](https://github.com/obsidianmd/obsidian-api) for detailed information about plugin development.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

If you find this plugin helpful, consider supporting its development through the funding options in the plugin settings.
