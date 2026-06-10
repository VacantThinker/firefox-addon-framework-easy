// 新主题。

/**
 *
 * @param videoInfo
 * @param videoInfo.vid{string}
 * @param videoInfo.videoTitle{string}
 * @return {string}
 */
export function generateMkvScriptForSystemWindows(videoInfo) {
  return `if (true) {
  const path = require('path');
  const fs = require('fs');
  const {execSync, exec} = require('node:child_process');
  let pathDownload = path.join(__dirname);
  let dot = '.';
  let extMKV = 'mkv';

  let {vid, videoTitle} = ${JSON.stringify(videoInfo)};
  let playVideoAfterMerged = true;
  let pathToMkvmerge = 'C:\\\\Program Files\\\\MKVToolNix\\\\mkvmerge.exe';

  let pathMKVOutput = path.join(pathDownload, videoTitle.concat(dot, extMKV));
  let pathOutput = path.join(pathDownload, vid.concat(dot, extMKV));
  let pathInputAudio = path.join(pathDownload, vid.concat(dot, "mp3"));
  let pathInputVideo = path.join(pathDownload, vid.concat(dot, "mp4"));
  let pathJsFile = path.join(__filename);

  if (
    fs.existsSync(pathToMkvmerge)
  ) {

    console.log('');
    console.log(['file check ok!', videoTitle].join(' '));

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
      console.log(['merge finish!', videoTitle].join(' '));

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

/**
 *
 * @param videoInfo
 * @param videoInfo.vid{string}
 * @param videoInfo.videoTitle{string}
 * @return {string}
 */
export function generateMkvScriptForSystemFedora(videoInfo) {
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

let {vid, videoTitle} = ${JSON.stringify(videoInfo)};
let playVideoAfterMerged = true;
let pathToMkvmerge = '/usr/bin/mkvmerge';

let pathMKVOutput = path.join(pathDownload, videoTitle.concat(dot, extMKV));
let pathOutput = path.join(pathDownload, vid.concat(dot, extMKV));
let pathInputAudio = path.join(pathDownload, vid.concat(dot, "mp3"));
let pathInputVideo = path.join(pathDownload, vid.concat(dot, "mp4"));

if (fs.existsSync(pathToMkvmerge)) {
  console.log('\\nfile check ok! ' + videoTitle);

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
    console.log('merge finish! ' + videoTitle);

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