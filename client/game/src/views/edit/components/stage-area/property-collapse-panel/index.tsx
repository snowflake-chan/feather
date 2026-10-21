import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useIntl } from 'react-intl';
import { CollapsePanel } from '@box/box-design';
import type { RootState } from 'src/redux/edit';
import { SeedDetailPanel } from '../../seedDetailPanel';
import { PANEL_IDS } from '../right-sidebar/content-panel';
import { GameUIProperties } from '../../game-ui/property/container';
import style from './index.module.scss';
import { HierarchyPanelEnum } from 'src/views/edit/defs';

type PropertyCollapsePanelProps = {
  panelId: PANEL_IDS;
  height: string;
};

export const PropertyCollapsePanel = (props: PropertyCollapsePanelProps) => {
  const intl = useIntl();

  const {
    hierarchyPanel,
    selectedScreenId,
    allSelectedSeeds: { length: allSelectedSeedsLength },
  } = useSelector((state: RootState) => ({
    hierarchyPanel: state.creator.hierarchyPanel,
    selectedScreenId: state.gameUI.screen.selectedScreenId,
    allSelectedSeeds: state.seeds.allSelectedSeeds,
  }));

  const panel = useMemo(() => {
    if (allSelectedSeedsLength === 1) {
      return <SeedDetailPanel />;
    }

    if (allSelectedSeedsLength > 1) {
      return (
        <div className={style.noObjectTips}>
          {intl.formatMessage({ id: 'noBatchModification' })}
        </div>
      );
    }

    if (hierarchyPanel === HierarchyPanelEnum.GameUI && selectedScreenId) {
      return <GameUIProperties />;
    }
    return <></>;
  }, [allSelectedSeedsLength, hierarchyPanel, intl, selectedScreenId]);

  return (
    <CollapsePanel
      showDivider={false}
      header={intl.formatMessage({ id: 'property' })}
      id={props.panelId}
      style={{ height: '100%' }}
    >
      <div style={{ height: props.height }}>{panel}</div>
    </CollapsePanel>
  );
};
