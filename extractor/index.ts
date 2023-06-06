import fs from 'fs/promises';
import simpleGit from 'simple-git';
import yaml from 'yaml';

const MSG_FILE = 'src/features/profile/l10n/messageIds.ts';
const PATH = process.argv[2];

import moduleAlias from 'module-alias';
import getFlatMessages from './lib/getFlatMessages';
import flattenObject from './lib/flattenObject';

moduleAlias.addPath('../mock-repo/src');

(async () => {
  const git = simpleGit({
    baseDir: PATH,
  });
  await git.checkout('main');
  const msgCommits = await git.log([MSG_FILE]);
  const msgHistory = msgCommits.all
    .concat()
    .sort(
      (left, right) =>
        new Date(left.date).getTime() - new Date(right.date).getTime()
    );

  for (const commit of msgHistory) {
    console.log('----------------------------------------');
    console.log('messages at', commit.date);
    await git.checkout(commit.hash);

    // Dynamically import message map
    const modulePath = PATH + MSG_FILE;
    const messageIdsImport = await import(modulePath);
    const messageIds = messageIdsImport.default;

    const messages = Array.from(getFlatMessages(messageIds));
    console.log(messages);
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
    console.log('----------------------------------------');
    console.log('translations at', commit.date);
    await git.checkout(commit.hash);

    const path = PATH + 'src/locale/nn.yml';
    const content = await fs.readFile(path, 'utf8');
    const data = yaml.parse(content);
    const flattened = flattenObject(data, '');
    console.log(flattened);
  }

  await git.checkout('main');
})();
