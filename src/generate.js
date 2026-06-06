import {stoOpGet, stoOpSet} from './opStorage.js';

// [Optimization 1] Introduce a debounce function to prevent triggering storage writes on every keystroke.
function debounce(func, wait) {
  let timeout;
  return function(...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}

/**
 * Generates HTML elements based on a user settings schema object.
 *
 * @param   {Object}                    userSettings
 * @param   {Function}                  radioItemClickCallback
 * @returns {Promise<DocumentFragment>}
 */
export async function generateHtmlByUserSettings(
    userSettings,
    radioItemClickCallback,
) {
  const elementsMap = {};

  // [Optimization 2] Use a DocumentFragment for off-screen DOM construction to improve rendering performance.
  const fragment = document.createDocumentFragment();

  const keys = Object.keys(userSettings);

  // [Optimization 3] Batch fetch all stored values.
  // Wait for all queries to complete to prevent async callbacks from interrupting the rendering pipeline.
  const valuesArray = await Promise.all(keys.map((key) => stoOpGet(key)));
  const storageData = {};
  keys.forEach((key, index) => {
    storageData[key] = valuesArray[index];
  });

  // First pass: Pre-create all container wrappers.
  // This ensures all target elements exist in the DOM references before executing triggerVisibility later.
  keys.forEach((storageKey) => {
    const eleWrap = document.createElement('fieldset');
    const eleTitle = document.createElement('legend');
    eleTitle.textContent = storageKey;
    eleWrap.append(eleTitle);

    elementsMap[storageKey] = eleWrap;
    fragment.append(eleWrap);
  });

  // Second pass: Synchronously populate form content and attach event listeners.
  keys.forEach((storageKey) => {
    const storageValue = userSettings[storageKey];
    const type = storageValue.type || 'text';
    const eleWrap = elementsMap[storageKey];

    // Retrieve pre-loaded value; fallback to the schema's default value if undefined.
    const storedValue = storageData[storageKey];
    const initialValue =
        storedValue !== undefined && storedValue !== null
            ? storedValue
            : storageValue.selected;

    // --- CONDITION 1: CHECKBOX & RADIO ---
    if (type === 'checkbox' || type === 'radio') {
      /** @type {string[]} */
      const options = storageValue.options || [];

      options.forEach((option) => {
        const eleLabel = document.createElement('label');
        eleLabel.textContent = option;
        const eleInput = document.createElement('input');
        eleInput.name = storageKey;
        eleInput.type = type;
        eleInput.value = option;

        if (type === 'checkbox') {
          const initialArray = Array.from(initialValue || []);
          const set = new Set(initialArray);
          eleInput.checked = set.has(option); // Apply state synchronously

          eleInput.addEventListener('change', async () => {
            // Derive state in real-time from the DOM (faster than reading from storage again)
            const allCheckboxes = eleWrap.querySelectorAll(
                'input[type="checkbox"]',
            );
            const valueNew = Array.from(allCheckboxes).
                filter((cb) => cb.checked).
                map((cb) => cb.value);

            await stoOpSet(storageKey, valueNew);
            triggerVisibility(storageKey, valueNew);
          });
        }
        else if (type === 'radio') {
          if (option === initialValue) {
            eleInput.checked = true; // Apply state synchronously
          }

          // It is recommended to bind the 'change' event to the input rather than 'onclick' to the label
          eleInput.addEventListener('change', () => {
            stoOpSet(storageKey, option).then(() => {
              if (typeof radioItemClickCallback === 'function') {
                radioItemClickCallback(storageKey, option);
              }
              triggerVisibility(storageKey, option);
            });
          });
        }

        // Fix: Native HTML typically places the input element before the text node inside a label.
        eleLabel.prepend(eleInput);
        eleWrap.append(eleLabel);
      });
    }

    // --- CONDITION 2: TOGGLE BUTTON ---
    else if (type === 'button') {
      const eleButton = document.createElement('button');
      eleButton.type = 'button';

      let currentStatus = initialValue === true || initialValue === 'true';
      eleButton.textContent = String(currentStatus); // Apply state synchronously

      eleButton.addEventListener('click', async () => {
        currentStatus = !currentStatus;
        eleButton.textContent = String(currentStatus);
        await stoOpSet(storageKey, currentStatus);
        triggerVisibility(storageKey, currentStatus);
      });

      eleWrap.append(eleButton);
    }

    // --- CONDITION 3: NUMBER & TEXT INPUTS ---
    else if (type === 'number' || type === 'text') {
      const eleInput = document.createElement('input');
      eleInput.type = type;
      eleInput.name = storageKey;
      eleInput.value = initialValue !== undefined ? initialValue : ''; // Apply state synchronously

      // [Optimization 4] Wrap the write operation with debounce, delaying storage writes by 500ms.
      // This eliminates UI freezing regardless of typing speed.
      const debouncedSave = debounce(async (val) => {
        const finalizedValue = type === 'number' ? Number(val) : val;
        await stoOpSet(storageKey, finalizedValue);
      }, 500);

      eleInput.addEventListener('input', () => {
        const rawValue = eleInput.value;
        debouncedSave(rawValue);
        triggerVisibility(storageKey, rawValue); // Visual UI updates do not require a delay
      });

      eleWrap.append(eleInput);
    }

    // --- CONDITION 4: SPAN / READ-ONLY TEXT ---
    else if (type === 'span') {
      const eleSpan = document.createElement('span');
      eleSpan.textContent = String(initialValue); // Apply state synchronously
      eleWrap.append(eleSpan);
    }
  });

  // [Optimization 5] Third pass: Globally trigger a single visibility check.
  // At this point, all DOM elements exist and all initialValues are fully derived,
  // preventing undefined errors or invalid target hiding.
  keys.forEach((storageKey) => {
    const storedValue = storageData[storageKey];
    const initialValue =
        storedValue !== undefined && storedValue !== null
            ? storedValue
            : userSettings[storageKey].selected;

    triggerVisibility(storageKey, initialValue);
  });

  /**
   * Evaluates the visibility rules for a given source key based on its current
   * value.
   */
  function triggerVisibility(sourceKey, currentValue) {
    const config = userSettings[sourceKey];
    if (config && config.visibilityControl) {
      const {targetField, expectedValue} = config.visibilityControl;
      const targetElement = elementsMap[targetField];

      if (targetElement) {
        const shouldBeVisible = String(currentValue) === String(expectedValue);
        targetElement.style.display = shouldBeVisible ? '' : 'none';
      }
    }
  }

  return fragment;
}

export function generateMkvScriptForSystemWindows({vid, title}) {
  let args = {vid, title};

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

export function generateMkvScriptForSystemFedora({vid, title}) {
  let args = {vid, title};

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
