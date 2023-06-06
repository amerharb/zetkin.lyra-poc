import fs from 'fs/promises';
import simpleGit from 'simple-git';
import yaml from 'yaml';

const MSG_FILE = 'src/features/smartSearch/l10n/messageIds.ts';
const PATH = process.argv[2];

import moduleAlias from 'module-alias';
import flattenObject from './lib/flattenObject';
import loadMessages from './lib/loadMessages';
import { MessageID } from './lib/types';

moduleAlias.addPath('../mock-repo/src');

(async () => {
  const git = simpleGit({
    baseDir: PATH,
  });
  await git.checkout('main');
  const msgCommits = await git.log([MSG_FILE]);
  const msgHistory = msgCommits.all;

  const modulePath = '../' + PATH + MSG_FILE;

  // First get current set of messages
  const messageIds: Record<string, MessageID> = {};
  const messages = await loadMessages(modulePath);
  messages.forEach((msg) => {
    messageIds[msg._id] = {
      defaultText: msg._defaultMessage,
      id: msg._id,
      translations: [],
      updatedAt: new Date(),
      updatedByCommit: '',
    };
  });

  for (const commit of msgHistory) {
    await git.checkout(commit.hash);

    const messages = await loadMessages(modulePath);
    messages.forEach((olderMsg) => {
      const existingMessage = messageIds[olderMsg._id];
      if (existingMessage) {
        // If message has not changed, update must have been earlier
        if (olderMsg._defaultMessage == existingMessage.defaultText) {
          existingMessage.updatedAt = new Date(commit.date);
          existingMessage.updatedByCommit = commit.hash;
        }
      }
    });
  }

  await git.checkout('main');

  const transCommits = await git.log(['src/locale/nn.yml']);
  const transHistory = transCommits.all
    .concat()
    .sort(
      (left, right) =>
        new Date(left.date).getTime() - new Date(right.date).getTime()
    );

  for (const commit of transHistory) {
    await git.checkout(commit.hash);

    const path = PATH + 'src/locale/nn.yml';
    const content = await fs.readFile(path, 'utf8');
    const data = yaml.parse(content);
    const flattened = flattenObject(data, '');

    Object.entries(flattened).forEach(([id, content]) => {
      const msg = messageIds[id];
      if (msg) {
        const lastTranslation = msg.translations[msg.translations.length - 1];

        if (content != lastTranslation?.content) {
          msg.translations.push({
            content,
            createdAt: new Date(commit.date),
            createdByCommit: commit.hash,
            locale: 'nn',
          });
        }
      }
    });
  }

  console.log(JSON.stringify(Object.values(messageIds).filter(mid => mid.translations.length > 1), null, ' '));

  await git.checkout('main');
})();
