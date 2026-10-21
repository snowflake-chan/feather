import React from 'react';
import { Story, Meta } from '@storybook/react/types-6-0';
import { Dot } from '.';

export default {
  title: 'basic/Dot',
  component: Dot,
} as Meta;

type Props = React.ComponentProps<typeof Dot>;
const Template: Story<Props> = (props) => (
  <Dot {...props}>
    <div
      style={{
        width: '200px',
        height: '40px',
        backgroundColor: 'grey',
        borderRadius: '16px',
      }}
    >
      dot content
    </div>
  </Dot>
);

export const Default = Template.bind({});

export const Inside = Template.bind({});
Inside.args = { mode: 'inside' };

export const Vertical = Template.bind({});
Vertical.args = { mode: 'vertical' };

export const LeftSide = Template.bind({});
LeftSide.args = { mode: 'leftside' };
