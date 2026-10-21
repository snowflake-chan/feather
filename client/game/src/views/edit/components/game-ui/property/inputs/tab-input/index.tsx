import { memo, useMemo } from 'react';
import { TabPanel, Tabs, TabPanelOptions } from '@box/box-design';
import styles from './style.module.scss';
import { InlineNamedInput } from '../inline-named-input';

export type TabInputProps = {
  name: string;
  mixed: boolean;
  items: Pick<TabPanelOptions, 'id' | 'tab'>[];
  value: string | number;
  onChange: (value: string | number) => void;
};

function TabInputView(props: TabInputProps) {
  const { name, mixed, value, items, onChange } = props;

  const children = useMemo(
    () =>
      items.map(({ id, tab }) => (
        <TabPanel type="icon" key={id} id={id} tab={tab} />
      )),
    [items],
  );

  const activeId = mixed ? '' : value;

  return (
    <InlineNamedInput name={name}>
      <Tabs
        className={styles.tabInput}
        defaultActiveId=""
        activeId={activeId}
        onChange={onChange}
      >
        {children}
      </Tabs>
    </InlineNamedInput>
  );
}

export const TabInput = memo(TabInputView);
