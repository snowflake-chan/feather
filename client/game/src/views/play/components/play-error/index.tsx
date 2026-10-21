import React from 'react';
import { useIntl } from 'react-intl';

import { CloseType } from 'src/engine/game-client-schema';
import { CreateraConnectError } from 'src/views/components/connect-error/createra';

type PlayConnectErrorProps = {
  errorType: CloseType;
};

export const PlayConnectError = React.memo((props: PlayConnectErrorProps) => {
  const intl = useIntl();
  return <CreateraConnectError intl={intl} errorType={props.errorType} />;
});

PlayConnectError.displayName = 'PlayConnectError';
