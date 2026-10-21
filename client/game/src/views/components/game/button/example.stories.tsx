import React from 'react';
import { Story, Meta } from '@storybook/react/types-6-0';
import { Button } from '.';

export default {
  title: 'basic/Button',
  component: Button,
} as Meta;

type Props = React.ComponentProps<typeof Button>;
const Template: Story<Props> = (props) => (
  <Button {...props} value={'button'} />
);

export const Primary = Template.bind({});
Primary.args = {
  type: 'primary',
};

export const Blue = Template.bind({});
Blue.args = {
  type: 'blue',
};

export const Ghost = Template.bind({});
Ghost.args = {
  ghost: true,
};

export const Disabled = Template.bind({});
Disabled.args = {
  disabled: true,
};
