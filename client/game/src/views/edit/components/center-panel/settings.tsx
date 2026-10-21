import { CenterPanelWarp } from '.';
import { SettingPanel } from '../settingPanel';
import { LangType } from 'src/apis/createra';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from 'src/redux/edit';
import { setCenterPanel } from 'src/redux/edit/creator';
import { CenterPanelEnum } from '../../defs';

type SettingModalProps = {
  setLocale: (locale: LangType) => void;
};
/**
 * 居中弹窗 - 设置
 */
export const Settings = (props: SettingModalProps) => {
  const { setLocale } = props;
  const dispatch = useDispatch();
  const centerPanel = useSelector(
    (state: RootState) => state.creator.centerPanel,
  );

  if (centerPanel === CenterPanelEnum.Setting) {
    return (
      <CenterPanelWarp>
        <SettingPanel
          closeModal={() => dispatch(setCenterPanel(CenterPanelEnum.None))}
          setLocale={setLocale}
        />
      </CenterPanelWarp>
    );
  }
  return null;
};
