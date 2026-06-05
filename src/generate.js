import { stoOpGet, stoOpSet } from "./opStorage.js";

/**
 * Generates HTML elements based on a user settings schema object.
 *
 * @param   {Object}                userSettings
 * @param   {Function}              radioItemClickCallback
 * @returns {HTMLFieldSetElement[]}
 */
export function generateHtmlByUserSettings(
	userSettings,
	radioItemClickCallback
) {
	// Keeps track of all generated fieldsets by their storageKey
	const elementsMap = {};

	const fieldsets = Object.keys(userSettings).map((storageKey) => {
		const storageValue = userSettings[storageKey];
		const type = storageValue.type || "text"; // Default to text if type is not specified

		// Common container wrapper for every configuration item
		const eleWrap = document.createElement("fieldset");
		const eleTitle = document.createElement("legend");
		eleTitle.textContent = storageKey;
		eleWrap.append(eleTitle);

		// Save a reference to the wrapper element for visibility switching
		elementsMap[storageKey] = eleWrap;

		// --- CONDITION 1: CHECKBOX & RADIO ---
		if (type === "checkbox" || type === "radio") {
			/** @type {string[]} */
			const options = storageValue.options || [];

			options
				.map((option) => {
					const eleLabel = document.createElement("label");
					eleLabel.textContent = option;

					const eleInput = document.createElement("input");
					eleInput.name = storageKey;
					eleInput.type = type;
					eleInput.value = option;

					if (type === "checkbox") {
						stoOpGet(storageKey).then((v) => {
							const initialArray = Array.from(v || storageValue.selected || []);
							const set = new Set(initialArray);
							eleInput.checked = set.has(option);

							// Initial visibility evaluation
							triggerVisibility(storageKey, initialArray);
						});

						eleInput.addEventListener("change", async () => {
							const optionsCurrent =
								(await stoOpGet(storageKey)) || storageValue.selected || [];
							const set = new Set(Array.from(optionsCurrent));

							if (eleInput.checked) {
								set.add(option);
							} else {
								set.delete(option);
							}

							const valueNew = Array.from(set);
							await stoOpSet(storageKey, valueNew);

							// Dynamic visibility update
							triggerVisibility(storageKey, valueNew);
						});
					} else if (type === "radio") {
						stoOpGet(storageKey).then((v) => {
							const currentSelected =
								v !== undefined && v !== null ? v : storageValue.selected;
							if (option === currentSelected) {
								eleInput.checked = true;
							}

							// Initial visibility evaluation
							triggerVisibility(storageKey, currentSelected);
						});

						eleLabel.onclick = function () {
							stoOpSet(storageKey, option).then(() => {
								if (typeof radioItemClickCallback === "function") {
									radioItemClickCallback(storageKey, option);
								}

								// Dynamic visibility update
								triggerVisibility(storageKey, option);
							});
						};
					}

					eleLabel.append(eleInput);
					return eleLabel;
				})
				.forEach((ele) => eleWrap.append(ele));
		}

		// --- CONDITION 2: TOGGLE BUTTON ---
		else if (type === "button") {
			const eleButton = document.createElement("button");
			eleButton.type = "button"; // Prevent accidental form submissions

			stoOpGet(storageKey).then((v) => {
				// Fallback to default schema configuration if no value is stored yet
				let currentStatus =
					v !== undefined && v !== null
						? v === true || v === "true"
						: storageValue.selected;
				eleButton.textContent = String(currentStatus);

				// Initial visibility evaluation
				triggerVisibility(storageKey, currentStatus);

				eleButton.addEventListener("click", async () => {
					currentStatus = !currentStatus; // Toggle state
					eleButton.textContent = String(currentStatus);
					await stoOpSet(storageKey, currentStatus);

					// Dynamic visibility update
					triggerVisibility(storageKey, currentStatus);
				});
			});

			eleWrap.append(eleButton);
		}

		// --- CONDITION 3: NUMBER & TEXT INPUTS ---
		else if (type === "number" || type === "text") {
			const eleInput = document.createElement("input");
			eleInput.type = type;
			eleInput.name = storageKey;

			stoOpGet(storageKey).then((v) => {
				const currentVal =
					v !== undefined && v !== null ? v : storageValue.selected;
				eleInput.value = currentVal;

				// Initial visibility evaluation
				triggerVisibility(storageKey, currentVal);
			});

			// Updates storage on every keystroke/change execution
			eleInput.addEventListener("input", async () => {
				const rawValue = eleInput.value;
				const finalizedValue = type === "number" ? Number(rawValue) : rawValue;

				await stoOpSet(storageKey, finalizedValue);

				// Dynamic visibility update
				triggerVisibility(storageKey, finalizedValue);
			});

			eleWrap.append(eleInput);
		}

		// --- CONDITION 4: SPAN / READ-ONLY TEXT ---
		else if (type === "span") {
			const eleSpan = document.createElement("span");
			// Optional: Add a class for styling read-only text differently
			// eleSpan.className = 'read-only-text';

			stoOpGet(storageKey).then((v) => {
				// Fallback to default schema configuration if no value is stored yet
				const currentVal =
					v !== undefined && v !== null ? v : storageValue.selected;

				// Render as plain text
				eleSpan.textContent = String(currentVal);

				// Initial visibility evaluation
				triggerVisibility(storageKey, currentVal);
			});

			eleWrap.append(eleSpan);
		}

		return eleWrap;
	});

	/**
	 * Evaluates the visibility rules for a given source key based on its current
	 * value.
	 */
	function triggerVisibility(sourceKey, currentValue) {
		const config = userSettings[sourceKey];
		if (config && config.visibilityControl) {
			const { targetField, expectedValue } = config.visibilityControl;
			const targetElement = elementsMap[targetField];

			if (targetElement) {
				// String conversion guarantees type safety (e.g., matching boolean true against string "true")
				const shouldBeVisible = String(currentValue) === String(expectedValue);
				targetElement.style.display = shouldBeVisible ? "" : "none";
			}
		}
	}

	return fieldsets;
}

export function generateMkvScriptForSystemWindows({ vid, title }) {
	let args = { vid, title };

	return `if (true) {
  const path = require('path');
  const fs = require('fs');
  const {execSync, exec} = require('node:child_process');
  let pathDownload = path.join(__dirname);
  let dot = '.';
  let extMKV = 'mkv';

  let {vid, title} = ${JSON.stringify(args)};
  let playVideoAfterMerged = true;
  let pathToMkvmerge = 'C:\\\\Program Files\\\\MKVToolNix\\\\mkvmerge.exe';

  let pathMKVOutput = path.join(pathDownload, title.concat(dot, extMKV));
  let pathOutput = path.join(pathDownload, vid.concat(dot, extMKV));
  let pathInputAudio = path.join(pathDownload, vid.concat(dot, "mp3"));
  let pathInputVideo = path.join(pathDownload, vid.concat(dot, "mp4"));
  let pathJsFile = path.join(__filename);

  if (
    fs.existsSync(pathToMkvmerge)
  ) {

    console.log('');
    console.log(['file check ok!', title].join(' '));

    let cmd_merge = [
      [pathToMkvmerge].map(v => '"' + v + '"').join(''),

      '-o',
      [pathOutput]
        .map(value => '"' + value + '"')
        .join(' '),

      '--no-video',
      [pathInputAudio]
        .map(value => '"' + value + '"')
        .join(' '),

      '--no-audio',
      [pathInputVideo]
        .map(value => '"' + value + '"')
        .join(' '),
    ].join(' ');

    console.log('execute script merge ...')
    console.log(cmd_merge);

    let exec_merge = exec(cmd_merge);
    exec_merge.stdout.on('data', (data) => {
      console.log(data);
    });
    exec_merge.stderr.on('data', (data) => {
      console.log('error', data);
    });
    exec_merge.stdout.on('close', (data) => {
      console.log(['merge finish!', title].join(' '));

      if (true) {
        console.log('remove inputFile');
        fs.unlinkSync(pathInputVideo);
        fs.unlinkSync(pathInputAudio);
      }

      console.log('rename output mkv video...');
      fs.renameSync(pathOutput, pathMKVOutput);

      if (playVideoAfterMerged) {
        console.log('play mkv video...');
        execSync('"' + pathMKVOutput + '"');
      }

      if (true) {
        console.log('remove script file');
        fs.unlinkSync(pathJsFile);
      }
    });

  } else {
    console.log('pathToMkvmerge error')

  }
}
  `;
}

export function generateMkvScriptForSystemFedora({ vid, title }) {
	let args = { vid, title };

	// We wrap the Node.js script inside a Linux Shell script block
	return `#!/usr/bin/env bash
# This header tells Fedora to treat this file as a runnable bash script

# Open a terminal window if not already running inside one
if [ -z "$VTE_VERSION" ] && [ -z "$ALACRITTY_WINDOW_ID" ] && [ -z "$KITTY_WINDOW_ID" ] && [ "$1" != "--child" ]; then
    # Re-run this same script inside a visible terminal window so the user sees progress
    gnome-terminal -- "$0" --child
    exit 0
fi

# Run the embedded Node.js code below
node << 'EOF'
const path = require('path');
const fs = require('fs');
const { execSync } = require('node:child_process');

let pathDownload = path.join(__dirname);
let dot = '.';
let extMKV = 'mkv';

let {vid, title} = ${JSON.stringify(args)};
let playVideoAfterMerged = true;
let pathToMkvmerge = '/usr/bin/mkvmerge';

let pathMKVOutput = path.join(pathDownload, title.concat(dot, extMKV));
let pathOutput = path.join(pathDownload, vid.concat(dot, extMKV));
let pathInputAudio = path.join(pathDownload, vid.concat(dot, "mp3"));
let pathInputVideo = path.join(pathDownload, vid.concat(dot, "mp4"));

if (fs.existsSync(pathToMkvmerge)) {
  console.log('\\nfile check ok! ' + title);

  let cmd_merge = [
    '"' + pathToMkvmerge + '"',
    '-o', '"' + pathOutput + '"',
    '--no-video', '"' + pathInputAudio + '"',
    '--no-audio', '"' + pathInputVideo + '"',
  ].join(' ');

  console.log('execute script merge ...\\n' + cmd_merge);

  try {
    // Run merge synchronously so stdout pipes directly to the terminal
    execSync(cmd_merge, { stdio: 'inherit' });
    console.log('merge finish! ' + title);

    console.log('remove inputFile');
    if (fs.existsSync(pathInputVideo)) fs.unlinkSync(pathInputVideo);
    if (fs.existsSync(pathInputAudio)) fs.unlinkSync(pathInputAudio);

    console.log('rename output mkv video...');
    fs.renameSync(pathOutput, pathMKVOutput);

    if (playVideoAfterMerged) {
      console.log('play mkv video...');
      // xdg-open usually hands off to the player and exits immediately
      execSync('xdg-open "' + pathMKVOutput + '"');
    }
  } catch (err) {
    console.error('An error occurred during processing:', err.message);
  }
} else {
  console.log('pathToMkvmerge error. run: sudo dnf install mkvtoolnix')
}
EOF

# Prevent the terminal window from closing instantly so the user can read messages
echo ""
echo "Press Enter to exit and automatically delete this script..."
read unused_input

# Deletes the shell script file itself after completion
rm -- "$0"
`;
}
