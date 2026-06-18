export type MessageActionBaseOptions =
  | 'actInfo'
  | "actMarco"
  | "actRemoveCurrentTab"
  | "actFocusTargetTab"
  | "actReloadTargetTab"

export interface MessagePayloadAct {
  act: MessageActionBaseOptions
}

export interface MessagePayloadTargetTab extends MessagePayloadAct {
  targetTabId: number;
}

export type MessagePayloadFocusTargetTab = MessagePayloadTargetTab;
export type MessagePayloadReloadTargetTab = MessagePayloadTargetTab;
