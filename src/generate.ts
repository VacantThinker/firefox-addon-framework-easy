interface VideoInfo {
  vid: string;
  videoTitle: string;
}

/**
 * Common Node.js script template with interactive error handling.
 */
function getMkvMergeNodeScript(
  videoInfo: VideoInfo,
  mkvMergePath: string,
  openCommand: string
): string {

  return `
const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');
const readline = require('readline');

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

// Interactive helper to wait for user input before exiting
const waitAndExit = (msg, isError = true) => {
  if (isError) console.error('\\n[ERROR]: ' + msg);
  else console.log('\\n[INFO]: ' + msg);
  
  rl.question('\\nPress Enter to exit...', () => {
    rl.close();
    process.exit(isError ? 1 : 0);
  });
};

const { vid, videoTitle } = ${JSON.stringify(videoInfo)};
const pathDownload = __dirname;
const pathMKVOutput = path.join(pathDownload, \`\${videoTitle}.mkv\`);
const pathOutput = path.join(pathDownload, \`\${vid}.mkv\`);
const pathInputAudio = path.join(pathDownload, \`\${vid}.mp3\`);
const pathInputVideo = path.join(pathDownload, \`\${vid}.mp4\`);

if (fs.existsSync("${mkvMergePath}")) {
  console.log('Merging: ' + videoTitle);

  const cmd = [
    '"${mkvMergePath}"',
    '-o', '"' + pathOutput + '"',
    '--no-video', '"' + pathInputAudio + '"',
    '--no-audio', '"' + pathInputVideo + '"'
  ].join(' ');

  try {
    execSync(cmd, { stdio: 'inherit' });
    
    // Cleanup temporary files
    if (fs.existsSync(pathInputVideo)) fs.unlinkSync(pathInputVideo);
    if (fs.existsSync(pathInputAudio)) fs.unlinkSync(pathInputAudio);
    
    // Finalize
    fs.renameSync(pathOutput, pathMKVOutput);
    
    console.log('Merge complete.');
    // Optional: open the file
    if ("${openCommand}") {
      execSync(\`\${"${openCommand}"} "\${pathMKVOutput}"\`);
    }
    waitAndExit('Process completed successfully.', false);
  } catch (err) {
    waitAndExit('Processing failed: ' + err.message);
  }
} else {
  waitAndExit('mkvmerge not found at: ${mkvMergePath}. Please check installation.');
}
`;
}

/**
 * Generates an executable script for Windows.
 */
export function generateMkvScriptForSystemWindows(videoInfo: VideoInfo): string {
  const nodeScript = getMkvMergeNodeScript(
    videoInfo,
    'C:\\Program Files\\MKVToolNix\\mkvmerge.exe',
    ''
  );

  return `(function() {
  const fs = require('fs');
  ${nodeScript}
  
  // Cleanup script file after user presses enter
  // (Wait for process exit handled inside getMkvMergeNodeScript)
})();`;
}

/**
 * Generates a bash script for Fedora.
 */
export function generateMkvScriptForSystemFedora(videoInfo: VideoInfo): string {
  const nodeScript = getMkvMergeNodeScript(
    videoInfo,
    '/usr/bin/mkvmerge',
    'xdg-open'
  );

  return `#!/usr/bin/env bash

# Ensure execution in a visible terminal window
if [ -z "$VTE_VERSION" ] && [ -z "$ALACRITTY_WINDOW_ID" ] && [ -z "$KITTY_WINDOW_ID" ] && [ "$1" != "--child" ]; then
    gnome-terminal -- "$0" --child
    exit 0
fi

# Run Node.js logic
node << 'EOF'
${nodeScript}
EOF

rm -- "$0"
`;
}