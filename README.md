# firefox-addon-framework-easy

[![License: AGPL v3](https://shields.io)](https://gnu.org)

## License

This project is licensed under the GNU Affero General Public License v3.0 - see the [LICENSE](LICENSE) file for details.


## Source Code Access

According to the terms of the AGPL-3.0, the source code for this network service must be made available to all users.

You can download, clone, or view the complete source code for this application here: [Insert your GitHub/GitLab URL].

## API Reference (Auto-Generated)

Below is a list of all public functions found inside the `src` directory:

### 📄 File: `src/BaseORM.js`
```javascript
export class BaseORM {  }

```

### 📄 File: `src/browserDownload.js`
```javascript
export async function browserDownloadByDownlink(
  {  }

```

### 📄 File: `src/browserNotification.js`
```javascript
export async function browserNotificationCreate(
  content,
  title = browserRuntimeManifestName(),
) {  }

```

### 📄 File: `src/browserRuntime.js`
```javascript
export function browserRuntimeReload() {  }

export async function browserRuntimeSetUninstallURL(
  url = '',
) {  }

export function browserRuntimeOnUpdateAvailable(doWhat = null) {  }

export function browserRuntimeGeckoId() {  }

export async function browserRuntimePlatformInfo() {  }

export function browserRuntimeManifestVersion() {  }

export function browserRuntimeManifestName() {  }

```

### 📄 File: `src/browserRuntimeOnMessageCommon.js`
```javascript
export function browserRuntimeOnMessageCommon(
  act,
  message,
  sendResponse
) {  }

```

### 📄 File: `src/browserTab.js`
```javascript
export async function browserTabSendMessage(tabId, message) {  }

export function browserTabWaitReloadThenSendMessageToContentJs(message) {  }

export async function browserTabCreateToDownload(message) {  }

export async function browserTabCreateNearSendMessageToContentJs(message) {  }

export function browserTabWaitReloadThenRemoveIt({  }

```

### 📄 File: `src/DomainORM.js`
```javascript
export class DomainORM extends BaseORM {  }

```

### 📄 File: `src/generate.js`
```javascript
export async function generateHtmlByUserSettings(
	userSettings,
	radioItemClickCallback
) {  }

export function generateMkvScriptForSystemWindows({  }

export function generateMkvScriptForSystemFedora({  }

```

### 📄 File: `src/opStorage.js`
```javascript
export async function stoOpCheck(k) {  }

export async function stoOpGet(k) {  }

export async function stoOpGetAll() {  }

export async function stoOpQueryStartWith(k) {  }

export async function stoOpSet(k, v) {  }

export async function stoOpRem(k) {  }

export async function stoOpSetNull(k) {  }

```

### 📄 File: `src/opTab.js`
```javascript
export async function tabOpEnhance(tab) {  }

export async function tabOpCreate(properties) {  }

export async function tabOpCreateNear(properties) {  }

export async function tabOpCreateActiveFalse(properties) {  }

export async function tabOpCreateByWindow(url) {  }

export async function tabOpGet(tabId) {  }

export async function tabOpQueryAll() {  }

export async function tabOpQueryUrl(urlQuery) {  }

export async function tabOpQueryUrlThenRemove(urlQuery) {  }

export async function tabOpReload(tabId) {  }

export async function tabOpRemove(tabId) {  }

export async function tabOpHide(tabId) {  }

export async function tabOpUpdate(tabId, updateProperties) {  }

export async function tabOpUpdateActiveFalse(tabId) {  }

export async function tabOpFocus(tabId) {  }

export async function tabOpInsertCssCode(tabId, code) {  }

export async function tabOpRemoveCssCode(tabId, code) {  }

```

### 📄 File: `src/serviceCommon.js`
```javascript
export async function serviceDownloadByDownlink(message) {  }

```

### 📄 File: `src/serviceFetch.js`
```javascript
export async function servicePostJson(
  serverUrl,
  message,
) {  }

export async function serviceSendDataToLocalAria2(message) {  }

```

### 📄 File: `src/serviceGet.js`
```javascript
export function serviceGetDomainByUrl(url) {  }

export function serviceGetCurrentDateYYYYMMDDHHMMSS() {  }

```

### 📄 File: `src/serviceOpContent.js`
```javascript
export async function serviceCopyContentToClipboard(data) {  }

export function serviceSaveContentToLocal(content, filename, ext = "txt") {  }

export async function serviceGenerateMkvToolNixScript({  }

export function serviceRemoveIllegalWord(value) {  }

```

### 📄 File: `src/serviceOpJavascript.js`
```javascript
export async function serviceTakeScreenshot(
  {  }

export async function serviceElementPicker(message) {  }

export async function serviceGetFullPageRectData(message) {  }

export async function serviceFindAllMagnetLink(message) {  }

export async function serviceDealWithMagnetLink(message) {  }

```

### 📄 File: `src/servicePureVideolink.js`
```javascript
export function servicePureVideolinkYTB(videolinkOrigin) {  }

```

### 📄 File: `src/serviceUpdateTabStyle.js`
```javascript
export async function serviceUpdataALLTextNodeColor(message) {  }

export async function serviceUpdataALLNodeBackgroundColor(message) {  }

```

### 📄 File: `src/serviceUserSettings.js`
```javascript
export async function serviceInitUserSettings(userSettings) {  }

export async function serviceGetUserSettings(userSettings) {  }

```

