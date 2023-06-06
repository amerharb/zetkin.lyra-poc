
export type MessageID = {
  id: string;
  defaultText: string;
  updatedAt: Date;
  updatedByCommit: string;
  translations: Translation[];
}

export type Translation = {
  locale: string;
  createdAt: Date;
  createdByCommit: string;
  content: string;
};

export type InputMessage = {
  _defaultMessage: string;
  _id: string;
};

export interface MessageMap {
  [key: string]: MessageMap | InputMessage;
}