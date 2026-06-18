export type MessageActionOptions =
  | "actMarco"
  | "actRemoveCurrentTab"
  | "actFocusTargetTab"


export interface MessagePayloadAct {
  act: MessageActionOptions
}

export interface MessagePayloadFocusTargetTab extends MessagePayloadAct {
  targetTabId: number;
}