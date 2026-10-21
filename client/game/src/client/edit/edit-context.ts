import { getContext } from '../context';
import { EditClient } from './edit-client';

export const {
  Consumer: EditConsumer,
  Provider: EditProvider,
  useModel: useEdit,
  Context: EditContext,
} = getContext<EditClient>();
