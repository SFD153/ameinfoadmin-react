import { AbilityBuilder } from '@casl/ability';

/**
 * Defines how to detect object's type: https://stalniy.github.io/casl/abilities/2017/07/20/define-abilities.html
 */
export const listRole = [
  { administrator: 'administrator' },
  { editor: 'editor' },
  { author: 'author' },
  { contributor: 'contributor' },
  { subscriber: 'subscriber' },
];

function subjectName(item) {
  if (!item || typeof item === 'string') {
    return item;
  }

  return item.__type;
}

export default AbilityBuilder.define({ subjectName }, can => {
  // ADMIN
  can(['manage'], 'ADMIN', { assignee: 'administrator' });

  // EDITOR
  can(['manage', 'privatePost', 'otherPost'], 'EDITOR', {
    assignee: { $in: ['administrator', 'editor'] },
  });

  // AUTHOR
  can(['manage', 'publishPost'], 'AUTHOR', {
    assignee: {
      $in: ['administrator', 'editor', 'author'],
    },
  });

  // CONTRIBUTOR
  can(['manage'], 'CONTRIBUTOR', {
    assignee: {
      $in: ['administrator', 'editor', 'author', 'contributor'],
    },
  });
});
