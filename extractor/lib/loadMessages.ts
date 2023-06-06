import getFlatMessages from './getFlatMessages';
import { InputMessage } from './types';

export default async function loadMessages(
  modulePath: string
): Promise<InputMessage[]> {
  const messageIdsImport = await import(modulePath);
  const messageIds = messageIdsImport.default;

  return Array.from(getFlatMessages(messageIds));
}
