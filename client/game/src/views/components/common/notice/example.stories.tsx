import React from 'react';
import { Meta } from '@storybook/react/types-6-0';
import { notice } from '.';

export default {
  title: 'basic/notice',
} as Meta;

export const Basic = () => {
  return (
    <div>
      <button onClick={() => notice.pending('sample message')}>pending</button>
      <br />
      <button onClick={() => notice.error('sample message')}>Error</button>
      <br />
      <button onClick={() => notice.info('sample message')}>Info</button>
      <br />
      <button onClick={() => notice.warning('sample message')}>Warning</button>
      <br />
      <button onClick={() => notice.success('sample message')}>Success</button>
      <br />
      <button
        onClick={() =>
          notice.success({ title: 'title', detail: 'sample message' })
        }
      >
        Success with detail
      </button>
    </div>
  );
};
