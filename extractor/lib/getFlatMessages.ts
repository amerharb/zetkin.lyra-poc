import { InputMessage, MessageMap } from "./types";

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
