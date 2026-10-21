import React from 'react';
import { ReplicaClientStateSchema } from 'src/client/edit/replica/replica-client-schema';

type ArenaEditorUIContextType = {
  replica: typeof ReplicaClientStateSchema.identity;
};
export const ArenaEditorUIContext =
  React.createContext<ArenaEditorUIContextType>({
    replica: ReplicaClientStateSchema.identity,
  });
