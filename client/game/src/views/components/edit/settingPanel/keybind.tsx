import React, { type JSX } from 'react';
import { IntlShape, injectIntl } from 'react-intl';

import { GameKeys } from '@box/schema/input/input-schema';
import { InputController } from 'src/engine/input/input-controller';
import { loadSettings } from 'src/engine/settings/settings-controller';
import { calc_class_name } from 'src/utils/classname';
import { get_char_by_keycode } from './keycode';
import { InputPauseConsumer } from '../../input-lock';

import style from './index.module.css';
const ARROW_KEY = [38, 39, 40, 41];
const FORBIDDEN_KEY = [91, 93];
enum KeyBindType {
  NORMAL,
  KEY,
  PRIMARY_SECONDARY_KEY,
}

enum FocusInput {
  PRIMARY,
  SECONDARY,
}

type KeyBind = {
  type: KeyBindType;
  label: string;
  text: string | number | JSX.Element;
  value: GameKeys | number;
  key: string | string[];
};

type Props = {
  intl: IntlShape;
  inputController: InputController;
  isPlayMode?: boolean;
};

type State = {
  keyBindList: KeyBind[];
  modalType: KeyBindType | null;
  selectedKey: KeyBind | null;
  selectedKeyIndex: number;
  primaryKey: { keyName: string; keyCode: number };
  secondaryKey: { keyName: string; keyCode: number };
  disablePrimaryConfirm: boolean;
  disableSecondaryConfirm: boolean;
  isInputPause: boolean;
};

export class KeyBindingComponent extends React.Component<Props, State> {
  private isFocus = false;
  private keyBinding;
  private focusInput: FocusInput = FocusInput.PRIMARY;
  private NO_KEY = this.props.intl.formatMessage({ id: 'noKey' });
  constructor(props: Props) {
    super(props);
    this.setKeyBind();
    this.state = {
      keyBindList: [],
      modalType: null,
      selectedKey: null,
      primaryKey: { keyName: '', keyCode: 0 },
      secondaryKey: { keyName: '', keyCode: 0 },
      disablePrimaryConfirm: false,
      disableSecondaryConfirm: false,
      selectedKeyIndex: 0,
      isInputPause: false,
    };
  }

  private setKeyBindList = () => {
    const keybind = [
      {
        type: KeyBindType.NORMAL,
        label: this.props.intl.formatMessage({ id: 'directionAdjust' }),
        text: (
          <div className={style.keyBindFlexText}>
            {this.props.isPlayMode ? (
              <>{this.props.intl.formatMessage({ id: 'mouseControl' })}</>
            ) : (
              <>
                {this.props.intl.formatMessage({ id: 'hold' })}
                <span className={style.boldLast}>
                  {this.props.intl.formatMessage({ id: 'rightButton' })}
                </span>
              </>
            )}
            {/* {this.props.intl.formatMessage({id:'or'})}
                        <span className={style.boldLast}>
                            {get_char_by_keycode(keyToCode['x'])}
                        </span> */}
          </div>
        ),
        value: -1,
        key: '',
      },
      {
        type: KeyBindType.NORMAL,
        label: this.props.intl.formatMessage({ id: 'forward' }),
        value: GameKeys.UP,
        text: this.transKeyCodeToText(this.keyBinding, GameKeys.UP, true),
        key: this.getSetKey(this.keyBinding, GameKeys.UP, true),
      },
      {
        type: KeyBindType.NORMAL,
        label: this.props.intl.formatMessage({ id: 'back' }),
        value: GameKeys.DOWN,
        text: this.transKeyCodeToText(this.keyBinding, GameKeys.DOWN),
        key: this.getSetKey(this.keyBinding, GameKeys.DOWN),
      },
      {
        type: KeyBindType.NORMAL,
        label: this.props.intl.formatMessage({ id: 'left' }),
        value: GameKeys.LEFT,
        text: this.transKeyCodeToText(this.keyBinding, GameKeys.LEFT, true),
        key: this.getSetKey(this.keyBinding, GameKeys.LEFT, true),
      },
      {
        type: KeyBindType.NORMAL,
        label: this.props.intl.formatMessage({ id: 'right' }),
        value: GameKeys.RIGHT,
        text: this.transKeyCodeToText(this.keyBinding, GameKeys.RIGHT),
        key: this.getSetKey(this.keyBinding, GameKeys.RIGHT),
      },
      {
        type: KeyBindType.NORMAL,
        label: this.props.intl.formatMessage({ id: 'dash' }),
        text: (
          <div>
            {this.props.intl.formatMessage({ id: 'doubleClick' })}
            <span className={style.boldLast}>
              {this.props.intl.formatMessage({ id: 'arrowKey' })}
            </span>
          </div>
        ),
        value: -1,
        key: '',
      },
      {
        type: KeyBindType.NORMAL,
        label: `${this.props.intl.formatMessage({
          id: 'jump',
        })}/${this.props.intl.formatMessage({ id: 'rise' })}`,
        value: GameKeys.JUMP,
        text: this.transKeyCodeToText(this.keyBinding, GameKeys.JUMP),
        key: this.getSetKey(this.keyBinding, GameKeys.JUMP),
      },
      {
        type: KeyBindType.NORMAL,
        label: `${this.props.intl.formatMessage({
          id: 'crouch',
        })}/${this.props.intl.formatMessage({ id: 'fall' })}`,
        value: GameKeys.CROUCH,
        text: this.transKeyCodeToText(this.keyBinding, GameKeys.CROUCH, true),
        key: this.getSetKey(this.keyBinding, GameKeys.CROUCH, true),
      },
      {
        type: KeyBindType.NORMAL,
        label: this.props.intl.formatMessage({ id: 'fly' }),
        text: (
          <div>
            {this.props.intl.formatMessage({ id: 'doubleClick' })}
            <span className={style.boldLast}>
              {this.props.intl.formatMessage({ id: 'jumpKey' })}
            </span>
          </div>
        ),
        value: -1,
        key: '',
      },
    ];
    this.setState({
      keyBindList: keybind,
    });
  };

  public componentDidMount() {
    document.addEventListener('keydown', this.handleKeyDown);
    this.setKeyBindList();
  }

  public componentWillUnmount() {
    document.removeEventListener('keydown', this.handleKeyDown);
  }

  private setKeyBind = () => {
    this.keyBinding = loadSettings().keyBindings;
  };

  public refresh = () => {
    this.setKeyBind();
    this.setKeyBindList();
    this.forceUpdate();
  };

  private handleKeyDown = (ev: KeyboardEvent) => {
    ev.preventDefault();
    const { selectedKey, primaryKey, secondaryKey } = this.state;
    if (!selectedKey || !this.isFocus) {
      return;
    }
    const { keyCode } = ev;
    const { key } = selectedKey;
    if (FORBIDDEN_KEY.indexOf(keyCode) !== -1) {
      return;
    }
    if (keyCode in this.keyBinding) {
      if (this.focusInput === FocusInput.PRIMARY) {
        if (keyCode === primaryKey.keyCode) {
          return;
        }
        this.setState({
          disablePrimaryConfirm: true,
          primaryKey: {
            keyName: get_char_by_keycode(keyCode),
            keyCode,
          },
        });
      } else {
        if (keyCode === secondaryKey.keyCode) {
          return;
        }
        this.setState({
          disableSecondaryConfirm: true,
          secondaryKey: {
            keyName: get_char_by_keycode(keyCode),
            keyCode,
          },
        });
      }
      return;
    }
    if (Array.isArray(key)) {
      if (this.focusInput === FocusInput.PRIMARY) {
        this.setState({
          primaryKey: {
            keyName: get_char_by_keycode(keyCode),
            keyCode,
          },
        });
        this.setState({
          disablePrimaryConfirm:
            secondaryKey.keyCode === keyCode ? true : false,
        });
      } else {
        this.setState({
          secondaryKey: {
            keyName: get_char_by_keycode(keyCode),
            keyCode,
          },
        });
        this.setState({
          disableSecondaryConfirm:
            primaryKey.keyCode === keyCode ? true : false,
        });
      }
    } else {
      this.setState({
        primaryKey: {
          keyName: get_char_by_keycode(keyCode),
          keyCode,
        },
        disablePrimaryConfirm: false,
      });
    }
  };

  private getSetKey = (keyBind, value: GameKeys, findAll: boolean = false) => {
    if (findAll) {
      const res: string[] = [];
      Object.keys(keyBind).forEach((key) => {
        if (keyBind[key] === value && ARROW_KEY.indexOf(+key) === -1) {
          res.push(key);
        }
      });
      return res;
    }
    const keyArr = Object.keys(keyBind);
    for (let i = 0; i < keyArr.length; i++) {
      const key = keyArr[i];
      if (keyBind[key] === value && ARROW_KEY.indexOf(+key) === -1) {
        return key;
      }
    }
    return '';
  };

  private transKeyCodeToText = (
    keyBinding,
    value: GameKeys,
    findAll: boolean = false,
  ) => {
    const key = this.getSetKey(keyBinding, value, findAll);
    if (!key || !key.length) {
      return this.NO_KEY;
    } else if (Array.isArray(key)) {
      let keyStr = '';
      for (let i = 0; i < key.length; i++) {
        if (i === key.length - 1) {
          keyStr +=
            key[i] !== '' ? `${get_char_by_keycode(+key[i])} ` : this.NO_KEY;
        } else {
          keyStr +=
            key[i] !== '' ? `${get_char_by_keycode(+key[i])} / ` : this.NO_KEY;
        }
      }
      return keyStr;
    } else {
      return `${get_char_by_keycode(+key)}`;
    }
  };

  private _onKeyClick = (index) => {
    const { keyBindList } = this.state;
    const selectedKey = keyBindList[index];
    this.setState({
      isInputPause: true,
    });
    if (selectedKey.type === KeyBindType.KEY) {
      if (selectedKey.key === null) {
        return;
      }
      let keyName;
      if (selectedKey.key === '') {
        keyName = '';
      } else {
        keyName = get_char_by_keycode(+selectedKey.key);
      }
      this.setState({
        selectedKey,
        selectedKeyIndex: index,
        primaryKey: {
          keyName,
          keyCode: +selectedKey.key,
        },
      });
    } else {
      if (!selectedKey.key.length) {
        return;
      }
      const [primary, secondary] = selectedKey.key;
      let primaryName = '';
      let secondaryName = '';
      if (primary !== '') {
        primaryName = get_char_by_keycode(+primary);
      }
      if (secondary !== '') {
        secondaryName = get_char_by_keycode(+secondary);
      }
      this.setState({
        selectedKey,
        selectedKeyIndex: index,
        primaryKey: {
          keyName: primaryName,
          keyCode: +primary,
        },
        secondaryKey: {
          keyName: secondaryName,
          keyCode: +secondary,
        },
      });
    }
  };

  public render() {
    const { keyBindList, isInputPause } = this.state;
    return (
      <div>
        {isInputPause && <InputPauseConsumer />}
        {keyBindList.length &&
          keyBindList.map((key: KeyBind, index) => {
            switch (key.type) {
              case KeyBindType.NORMAL: {
                return (
                  <div key={key.label} className={style.keyBindContainer}>
                    <div className={style.keyBindLabel}>{key.label}</div>
                    <div className={style.keyBindText}>{key.text}</div>
                  </div>
                );
              }
              case KeyBindType.PRIMARY_SECONDARY_KEY:
              case KeyBindType.KEY: {
                return (
                  <div key={key.label} className={style.keyBindContainer}>
                    <div className={style.keyBindLabel}>{key.label}</div>
                    <div
                      className={calc_class_name(
                        style.keyBindText,
                        style.keyInputable,
                      )}
                      onClick={() => this._onKeyClick(index)}
                    >
                      {key.text}
                    </div>
                  </div>
                );
              }
            }
          })}
      </div>
    );
  }
}
export const KeyBinding = injectIntl(KeyBindingComponent);
