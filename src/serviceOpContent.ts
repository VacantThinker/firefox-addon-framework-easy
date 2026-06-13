import {browserRuntimePlatformInfo} from './browserRuntime';
import {
  generateMkvScriptForSystemFedora,
  generateMkvScriptForSystemWindows,
  VideoInfo,
} from './generate';

/**
 * Maps file extensions to MIME types.
 */
const EXT_MIME_MAP: Record<string, string> = {
  txt: 'text/plain',
  json: 'application/json',
  js: 'application/javascript',
  sh: 'application/x-sh',
};

/**
 * Copies text content to the system clipboard.
 */
export async function serviceCopyContentToClipboard(data: string): Promise<void> {
  return await window.navigator.clipboard.writeText(data);
}

/**
 * Saves content to a local file.
 * @param content The content string.
 * @param filename The base filename.
 * @param ext The file extension.
 */
export function serviceSaveContentToLocal(
  content: string,
  filename: string,
  ext: string = 'txt'
): void {
  const mimeType = EXT_MIME_MAP[ext] || 'text/plain';
  const blob = new Blob(
    [content],
    {type: mimeType}
  );
  const url = URL.createObjectURL(blob);

  const eleA = document.createElement('a');
  eleA.href = url;
  eleA.download = `${filename}.${ext}`;

  // Programmatically trigger download
  eleA.click();

  // Cleanup
  URL.revokeObjectURL(url);
}

/**
 * Generates an MKVToolNix script based on the current OS.
 * @param videoInfo - The object containing vid and videoTitle.
 */
export async function serviceGenerateMkvToolNixScript(videoInfo: VideoInfo): Promise<void> {
  const platformInfo = await browserRuntimePlatformInfo();

  if (platformInfo.os === 'win') {
    const content = generateMkvScriptForSystemWindows(videoInfo);
    serviceSaveContentToLocal(
      content,
      videoInfo.videoTitle,
      'js'
    );
  } else if (platformInfo.os === 'linux') {
    const content = generateMkvScriptForSystemFedora(videoInfo);
    serviceSaveContentToLocal(
      content,
      videoInfo.videoTitle,
      'sh'
    );
  }
}

/**
 * Cleans a string to make it a valid filename.
 * @param value The raw string.
 * @returns A cleaned filename string.
 */
export function serviceRemoveIllegalWord(value: string): string {
  if (!value) return '';

  // Get the first line and trim whitespace
  let name = value.trim()
    .split(/\r?\n/)[0];

  // Replace punctuation, symbols, and control chars with space
  name = name.replace(
    /[\p{P}\p{S}\p{C}]/gu,
    ' '
  );

  // Replace specific legacy forbidden characters
  name = name.replace(
    /[~"#%&*:<>?/\\{|}]/g,
    ' '
  );

  // Normalize whitespaces
  name = name.replace(
    /[\s\u3000]+/g,
    ' '
  )
    .trim();

  // Remove leading/trailing dots or hyphens
  return name.replace(
    /^[-.]+|[-.]+$/g,
    ''
  );
}