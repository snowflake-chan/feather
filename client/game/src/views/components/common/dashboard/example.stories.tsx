import React from 'react';
import { Story, Meta } from '@storybook/react/types-6-0';
import { Dashboard } from '.';

export default {
  title: 'basic/Dashboard',
  component: Dashboard,
  parameters: {
    layout: 'centered',
    backgrounds: {
      default: 'yellow',
    },
  },
  args: {
    color: 'white',
    width: '200px',
  },
} as Meta;

type Props = React.ComponentProps<typeof Dashboard>;
const Template: Story<Props> = (props) => <Dashboard {...props} />;

export const Percent55 = Template.bind({});
Percent55.args = {
  percent: 55,
};

export const Percent100 = Template.bind({});
Percent100.args = {
  percent: 100,
};
