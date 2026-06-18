export type MessageActionOptions =
  | "actMarco"
  | "actRemoveCurrentTab"
  | "actFocusTargetTab"
  | "actReloadTargetTab"


export interface MessagePayloadAct {
  act: MessageActionOptions
}

export interface MessagePayloadTargetTab extends MessagePayloadAct {
  targetTabId: number;
}

export type MessagePayloadFocusTargetTab = MessagePayloadTargetTab;
export type MessagePayloadReloadTargetTab = MessagePayloadTargetTab;
