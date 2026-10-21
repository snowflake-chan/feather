import { getContext } from '../context';
import { PlayClient } from './play-client';

export const {
  Consumer: PlayConsumer,
  Provider: PlayProvider,
  useModel: usePlayer,
  Context: PlayContext,
} = getContext<PlayClient>();
