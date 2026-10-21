import * as React from 'react';
import {
  NumberProperty,
  RadioProperty,
} from '../../../components/edit/property';

import style from './index.module.scss';
import { IntlShape, injectIntl } from 'react-intl';

type Props = {
  intl: IntlShape;
  rigidbody: boolean;
  collides: boolean;
  gravity: boolean;
  mass: number;
  friction: number;
  restitution: number;
  enableDamge: boolean;
  hp: number;
  maxHp: number;
  setRigidBody: (enable: boolean) => void;
  setCollides: (enable: boolean) => void;
  setGravity: (enable: boolean) => void;
  setMass: (m: number) => void;
  setFriction: (m: number) => void;
  setEnableDamage: (enable: boolean) => void;
  setHp: (hp: number) => void;
  setMaxHp: (maxHp: number) => void;
  setRestitution: (m: number) => void;
};

type State = {
  genericCollapsed: boolean;
  hpCollapsed: boolean;

  gravityValue: number;
  mass: number;
  friction: number;
  restitution: number;
};

class PhysicsSettingContainer extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      genericCollapsed: false,
      hpCollapsed: false,
      gravityValue: 10,
      mass: 1,
      friction: 0,
      restitution: 0,
    };
  }

  private _handleGenericTabClick = () => {
    this.setState({
      genericCollapsed: !this.state.genericCollapsed,
    });
  };

  private _setRigidbody = (rigidbody: boolean) => {
    this.props.setRigidBody(rigidbody);
  };

  private _setCollides = (collides: boolean) => {
    this.props.setCollides(collides);
  };

  private _setGravity = (gravity: boolean) => {
    this.props.setGravity(gravity);
  };

  public render() {
    return (
      <div className={style.container}>
        <div className={style.propertyContainer}>
          <div
            className={
              this.state.genericCollapsed
                ? style.collapsibleWrap + ' ' + style.collapsed
                : style.collapsibleWrap
            }
          >
            <div
              className={style.collapsibleTitle}
              onClick={this._handleGenericTabClick}
            >
              <span className={style.collapseIcon} />
              {this.props.intl.formatMessage({ id: 'generic' })}
            </div>
            <RadioProperty
              name={this.props.intl.formatMessage({ id: 'collides' })}
              value={this.props.collides}
              onChange={(e) => this._setCollides(!!e)}
            />
            {this.props.collides && (
              <RadioProperty
                name={this.props.intl.formatMessage({ id: 'rigidbody' })}
                value={this.props.rigidbody}
                onChange={(e) => this._setRigidbody(!!e)}
              />
            )}
            <RadioProperty
              name={this.props.intl.formatMessage({ id: 'gravity' })}
              value={this.props.gravity}
              onChange={(e) => this._setGravity(!!e)}
            />
            <NumberProperty
              name={this.props.intl.formatMessage({ id: 'mass' })}
              value={this.props.mass}
              numberFixed={2}
              onChange={(v: number) => {
                this.props.setMass(v);
              }}
              slider={[0.01, 100]}
            />
            <NumberProperty
              name={this.props.intl.formatMessage({ id: 'friction' })}
              value={this.props.friction}
              numberFixed={2}
              onChange={(v: number) => {
                this.props.setFriction(v);
              }}
              slider={[0, 1]}
            />
            <NumberProperty
              name={this.props.intl.formatMessage({ id: 'restitution' })}
              value={this.props.restitution}
              numberFixed={2}
              onChange={(v: number) => {
                this.props.setRestitution(v);
              }}
              slider={[0, 1]}
            />
          </div>

          <div
            className={
              this.state.hpCollapsed
                ? style.collapsibleWrap + ' ' + style.collapsed
                : style.collapsibleWrap
            }
          >
            <div
              className={style.collapsibleTitle}
              onClick={() => {
                this.setState({ hpCollapsed: !this.state.hpCollapsed });
              }}
            >
              <span className={style.collapseIcon} />
              {this.props.intl.formatMessage({ id: 'hp' })}
            </div>
            <RadioProperty
              name={this.props.intl.formatMessage({ id: 'enableDamage' })}
              value={this.props.enableDamge}
              onChange={(e) => this.props.setEnableDamage(!!e)}
            />
            <NumberProperty
              disabled={!this.props.enableDamge}
              name={this.props.intl.formatMessage({ id: 'initialHp' })}
              value={this.props.hp}
              onChange={(v: number) => {
                this.props.setHp(v);
              }}
              slider={[0, 1000]}
              formatValue={(v) => Math.round(v)}
            />
            <NumberProperty
              disabled={!this.props.enableDamge}
              name={this.props.intl.formatMessage({ id: 'maxHp' })}
              value={this.props.maxHp}
              onChange={(v: number) => {
                this.props.setMaxHp(v);
              }}
              slider={[0, 1000]}
              formatValue={(v) => Math.round(v)}
            />
          </div>
        </div>
      </div>
    );
  }
}

export const PhysicsSetting = injectIntl(PhysicsSettingContainer);
