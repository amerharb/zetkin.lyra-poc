import simpleGit from 'simple-git';

const MSG_FILE = 'src/features/profile/l10n/messageIds.ts';
const PATH = process.argv[2];

import moduleAlias from 'module-alias';
import getFlatMessages from './lib/getFlatMessages';


moduleAlias.addPath('../mock-repo/src');

(async () => {
  const git = simpleGit({
    baseDir: PATH,
  });
  await git.checkout('main');
  const commits = await git.log([MSG_FILE]);
  const history = commits.all
    .concat()
    .sort(
      (left, right) =>
        new Date(left.date).getTime() - new Date(right.date).getTime()
    );

  for (const commit of history) {
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
})();
