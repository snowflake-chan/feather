import { Context, createContext, useContext } from 'react';

import type { GameClient } from 'src/engine/game-client';

export const getContext = <T>() => {
  const Context = createContext<T>(null as any);
  const { Consumer, Provider } = Context;

  const useModel = () => {
    const model = useContext(Context);
    return model;
  };

  return {
    Context,
    Consumer,
    Provider,
    useModel,
  };
};

export const GameContext = createContext<GameClient>(undefined as never);
export const useGame = useContext.bind<
  undefined,
  Context<GameClient>,
  GameClient
>(undefined, GameContext);
