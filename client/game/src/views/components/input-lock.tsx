import * as React from 'react';
import {
  InputPauseChange,
  InputPauseFlags,
} from '@box/schema/input/input-schema';

export interface InputPauseProps {
  flags: InputPauseFlags;
  change: InputPauseChange;
}

export interface InputPauseState {}

export class InputPause extends React.Component<
  InputPauseProps,
  InputPauseState
> {
  private _flags: InputPauseFlags = 0;

  public componentWillUnmount() {
    this.props.change(this._flags, 0);
    this._flags = 0;
  }

  public render() {
    if (this._flags !== this.props.flags) {
      this.props.change(this._flags, this.props.flags);
      this._flags = this.props.flags;
    }
    return null;
  }
}

export type InputPauseCtxValue = {
  inputPauseChange: InputPauseChange;
};

export const InputPauseContext = React.createContext<InputPauseCtxValue>(
  {} as InputPauseCtxValue,
);

export const useInputPause = () => React.useContext(InputPauseContext);

type InputPauseProviderProps = {
  inputPauseChange: InputPauseChange;
  children: React.ReactNode;
};

type InputPauseConsumerProps = {
  flags?: InputPauseFlags;
  children?: React.ReactNode;
};

export const InputPauseProvider = (props: InputPauseProviderProps) => {
  return (
    <InputPauseContext.Provider
      value={{ inputPauseChange: props.inputPauseChange }}
    >
      {props.children}
    </InputPauseContext.Provider>
  );
};

export const InputPauseConsumer = (props: InputPauseConsumerProps) => {
  return (
    <InputPauseContext.Consumer>
      {({ inputPauseChange }) => (
        <>
          <InputPause
            flags={props.flags || InputPauseFlags.ALL}
            change={inputPauseChange}
          />
          {props.children}
        </>
      )}
    </InputPauseContext.Consumer>
  );
};
