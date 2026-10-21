import React from 'react';
import { Meta } from '@storybook/react/types-6-0';
import { Loading } from '.';

export default {
  title: 'website/Loading',
  component: Loading,
  parameters: {
    layout: 'centered',
  },
} as Meta;

export const Basic = () => <Loading />;
