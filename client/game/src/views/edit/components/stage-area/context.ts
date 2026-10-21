import { createContext } from 'react';
import type { EditorUIEvent } from 'src/client/edit/schema';
import { LoadingSeed } from 'src/views/edit/components/stage-area/seeds';

export type StageAreaContextType = {
  showMusicLibrary: (param: [EditorUIEvent, string[]]) => void;
  addLoadingSeed: (seed: LoadingSeed) => void;
  removeLoadingSeed: (seed: LoadingSeed) => void;
  loadingSeeds: LoadingSeed[];
};

export const StageAreaContext = createContext<StageAreaContextType>({
  showMusicLibrary: () => undefined,
  addLoadingSeed: () => {},
  removeLoadingSeed: () => {},
  loadingSeeds: [],
});
