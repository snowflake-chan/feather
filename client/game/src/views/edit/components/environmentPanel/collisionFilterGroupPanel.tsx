import React, { useEffect, useState, type JSX } from 'react';
import { ClientStateType } from 'src/client/edit/edit-schema';
import { InputPauseConsumer } from '../../../components/input-lock';
import { ClickPopup } from '../../../components/basic/click-popup';
import { Divider } from '../../../components/common/divider/index';
import { InputTextarea } from '../../../components/common/input/textarea';
import { Icon } from '../../../components/basic/icon';
import { Button } from '../../../components/edit/button';
import { Modal } from '../../../components/edit/modal';
import { useDebounce } from 'src/utils/react-hooks/common';
import { isMobile } from 'src/utils/mobile';
import { editor } from 'src/client/edit/edit-client';

import style from './index.module.css';
import { useIntl } from 'react-intl';

interface CollisionPanelProps {
  changeTitle: (title: string | JSX.Element) => void;
  goBack: () => void;
  project: ClientStateType['replica']['project'];
  updateDetailPanelHeight: (() => void) | undefined;
  setPhysicsPanel: () => void;
}
interface SelectorTextareaProps {
  onFocus: (ev: React.FocusEvent<HTMLTextAreaElement>) => void;
  onBlur: (ev: React.FocusEvent<HTMLTextAreaElement>) => void;
  value: string;
  onChange: (v: string) => void;
  showTips: boolean;
}

const SelectorTextarea: React.FC<SelectorTextareaProps> = (props) => {
  const intl = useIntl();
  const [value, setValue] = useState<string>('');
  useEffect(() => {
    setValue(props.value.trim());
  }, [props.value]);
  const delayOnChange = useDebounce((v) => {
    props.onChange(v);
  }, 700);
  const onChange = (v) => {
    setValue(v);
    delayOnChange(v);
  };

  return (
    <InputTextarea
      tips={props.showTips ? intl.formatMessage({ id: 'selectorTips' }) : ''}
      className={style.selectorInput}
      maxLine={4}
      onFocus={props.onFocus}
      onBlur={props.onBlur}
      allowResize
      minHeight="40px"
      placeholder={intl.formatMessage({ id: 'inputSelectorTag' })}
      value={value}
      onChange={onChange}
      onConfirm={(e) => e.preventDefault()}
    />
  );
};

const CollisionPanel: React.FC<CollisionPanelProps> = (props) => {
  const intl = useIntl();
  const collisionGroups = props.project.collisionFilter;
  const [groups, setGroups] = useState<typeof collisionGroups>(collisionGroups);
  const [showTips, setShowTips] = useState<string>('');
  const [showModal, setShowModal] = useState<boolean>(false);
  const [groupIndex, setGroupIndex] = useState<number>(0);
  const [inputPause, setInputPause] = useState<boolean>(false);
  const [showHelpModal, setShowHelpModal] = useState<boolean>(false);
  // first time change title
  useEffect(() => {
    props.updateDetailPanelHeight && props.updateDetailPanelHeight();
    props.changeTitle(renderTitle());
    return () => {
      props.changeTitle(intl.formatMessage({ id: 'physics' }));
      props.setPhysicsPanel();
    };
  }, []);
  useEffect(() => {
    props.updateDetailPanelHeight && props.updateDetailPanelHeight();
  }, [collisionGroups.length]);
  // add filter group
  const AddFilterGroupHandle = useDebounce(() => {
    editor.envController.addCollisionFilterGroup();
  }, 300);

  const SelectorTextareaHandle = (index: number, value) => {
    editor.envController.updateCollisionFilterGroup(index, value);
  };

  // when focus add tips
  const FocusHandle = (
    e: React.FocusEvent<HTMLTextAreaElement>,
    key: string,
  ) => {
    setInputPause(true);
    setShowTips(key);
  };
  // remove tips
  const BlurHandle = (e: React.FocusEvent<HTMLTextAreaElement>) => {
    setInputPause(false);
    setShowTips('');
  };

  const RemoveRuleCancelHandle = () => {
    setShowModal(false);
  };
  const RemoveRuleConfirmHandle = () => {
    setShowModal(false);
    editor.envController.removeCollisionFilterGroup(groupIndex);
  };

  /**
   * render
   */

  // panel title
  const renderTitle = () => {
    if (isMobile()) {
      return <div>{intl.formatMessage({ id: 'physics' })}</div>;
    } else {
      return (
        <div className={style.backIconWrapper}>
          <div onClick={() => props.goBack()} className={style.backIcon} />
          <Divider vertical />
          <div>{intl.formatMessage({ id: 'collisionFilter' })}</div>
        </div>
      );
    }
  };

  const renderFilterGroup = () => {
    if (groups.length <= 0) {
      return (
        <div className={style.notFilterGroup}>
          {intl.formatMessage({ id: 'notFilterGroup' })}
        </div>
      );
    } else {
      const removeHandle = (index: number) => {
        setShowModal(true);
        setGroupIndex(index);
      };
      return (
        <div className={style.collisionFilterGroup}>
          {groups.map((group, index) => (
            <div
              className={style.collisionFilterGroup}
              key={`collisionGroup${index}`}
            >
              <div className={style.groupMenu}>
                <div className={style.groupName}>
                  {intl.formatMessage({
                    id: 'group',
                  })}
                  {groups.length - index}
                </div>
                <ClickPopup
                  popup={
                    <div className={style.popupContainer}>
                      <div
                        className={style.popupSelection}
                        onClick={() => {
                          removeHandle(index);
                        }}
                      >
                        {intl.formatMessage({ id: 'remove' })}
                      </div>
                    </div>
                  }
                >
                  <Icon icon="more" size={16} />
                </ClickPopup>
              </div>
              <div>
                <div className={style.groupSelector}>
                  <SelectorTextarea
                    showTips={showTips === `${index}-selectorA`}
                    onFocus={(e) => {
                      FocusHandle(e, `${index}-selectorA`);
                    }}
                    onBlur={BlurHandle}
                    key={`${index}-selectorA`}
                    value={group.selectorA}
                    onChange={(v) => {
                      SelectorTextareaHandle(index, { selectorA: v.trim() });
                    }}
                  />
                </div>
                <div className={style.groupSelector}>
                  <SelectorTextarea
                    showTips={showTips === `${index}-selectorB`}
                    onFocus={(e) => {
                      FocusHandle(e, `${index}-selectorB`);
                    }}
                    onBlur={BlurHandle}
                    key={`${index}-selectorB`}
                    value={group.selectorB}
                    onChange={(v) => {
                      SelectorTextareaHandle(index, { selectorB: v.trim() });
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      );
    }
  };
  return (
    <div>
      {isMobile() && (
        <div className={style.backIconWrapper}>
          <div onClick={() => props.goBack()} className={style.backIcon} />
          <Divider vertical />
          <div>{intl.formatMessage({ id: 'collisionFilter' })}</div>
        </div>
      )}
      <div className={style.buttonGroup}>
        <Button
          onClick={AddFilterGroupHandle}
          value={intl.formatMessage({ id: 'addFilterGroup' })}
          fullWidth
        />
        <Icon
          className={style.questionIcon}
          icon="question"
          onClick={() => setShowHelpModal(true)}
          size={22}
        />
      </div>
      {renderFilterGroup()}
      {inputPause && <InputPauseConsumer />}
      <Modal
        title={intl.formatMessage({ id: 'RemoveFilterGroup' })}
        confirm={intl.formatMessage({ id: 'remove' })}
        cancel={intl.formatMessage({ id: 'cancel' })}
        handleCancel={RemoveRuleCancelHandle}
        handleConfirm={RemoveRuleConfirmHandle}
        visible={showModal}
        dangerToConfirm
        width={400}
        style={{ borderRadius: 16 }}
      >
        {intl.formatMessage(
          { id: 'ConfirmRemoveGroup' },
          {
            groupName:
              intl.formatMessage({ id: 'group' }) +
              (groups.length - groupIndex),
          },
        )}
      </Modal>
      <Modal
        title={intl.formatMessage({ id: 'help' })}
        visible={showHelpModal}
        width={400}
        cancel={intl.formatMessage({ id: 'understand' })}
        handleCancel={() => setShowHelpModal(false)}
        divider
        contentNoOverlay
      >
        <div className={style.helpMargin}>
          {intl.formatMessage({ id: 'collisionFilterTip' })}
        </div>
        <div className={style.tipMargin}>
          <span>{intl.formatMessage({ id: 'collisionFilterTag' })}</span>
          <span className={style.highlight}>.</span>
          <span>+</span>
          <span className={style.highlight}>
            {intl.formatMessage({ id: 'collisionFilterTagName' })}
          </span>
          <span>({intl.formatMessage({ id: 'suchAs' })},</span>
          <span className={style.highlight}>
            {intl.formatMessage({ id: 'collisionFilterTagEx' })}
          </span>
          <span>)</span>
        </div>
        <div className={style.tipMargin}>
          <span>{intl.formatMessage({ id: 'collisionFilterEntityId' })}</span>
          <span className={style.highlight}>#</span>
          <span>+</span>
          <span className={style.highlight}>
            {intl.formatMessage({ id: 'collisionFilterEntityIdName' })}
          </span>
          <span>({intl.formatMessage({ id: 'suchAs' })},</span>
          <span className={style.highlight}>
            {intl.formatMessage({ id: 'collisionFilterEntityIdEx' })}
          </span>
          <span>)</span>
        </div>
        <div className={style.tipMargin}>
          <span>{intl.formatMessage({ id: 'collisionFilterPlayer' })}</span>
          <span className={style.highlight}>player</span>
        </div>
        <div className={style.tipMargin}>
          <span>
            {intl.formatMessage({ id: 'collisionFilterPlayerAndEntity' })}
          </span>
          <span className={style.highlight}>*</span>
        </div>
      </Modal>
    </div>
  );
};

export default React.memo(CollisionPanel);
