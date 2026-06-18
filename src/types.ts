import {DownloadParams} from "./browserDownload";

export type MessageActionBaseOptions =
  | "actDownloadFile"
  | "actNotification"
  | 'actInfo'
  | "actMarco"
  | "actRemoveCurrentTab"
  | "actFocusTargetTab"
  | "actReloadTargetTab"

export interface MessagePayloadAction {
  act: MessageActionBaseOptions
}

export interface MessagePayloadDownloadInfo extends MessagePayloadAction {
  downloadParams: DownloadParams;
}

export interface MessagePayloadNotification extends MessagePayloadAction {
  content: string;
  title?: string;
}

export interface MessagePayloadInfo extends MessagePayloadAction {
  info: string;
}

export interface MessagePayloadTargetTab extends MessagePayloadAction {
  targetTabId: number;
}

export type MessagePayloadFocusTargetTab = MessagePayloadTargetTab;
export type MessagePayloadReloadTargetTab = MessagePayloadTargetTab;
