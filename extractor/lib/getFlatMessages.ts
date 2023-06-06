
type MessageID = {
  id: string;
  defaultText: string;
  updatedAt: Date;
  updatedByCommit: string;
}

type InputMessage = {
  _defaultMessage: string;
  _id: string;
};

interface MessageMap {
  [key: string]: MessageMap | InputMessage;
}
const messages: MessageID[] = [];

export default function* getFlatMessages(map: MessageMap): Iterable<InputMessage> {
  for (const key in map) {
    const val = map[key];
    if ('_id' in val) {
      yield val as InputMessage;
    } else {
      yield *getFlatMessages(val);
    }
  }
}
