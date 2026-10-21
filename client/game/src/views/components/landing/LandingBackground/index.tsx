import React from 'react';
import { Picture } from '../../picture';
import style from './index.module.css';
import { Image } from '../../../components/image';
import defaultGameCoverUniversal from 'src/assets/default_game_cover_universal.png';

export function GameEntryBackgroundImage(props: { imageHash: string }) {
  return (
    <div className={style.container}>
      {props.imageHash ? (
        <Picture hash={props.imageHash} width={1024} height={768} />
      ) : (
        <Image layout="fill" src={defaultGameCoverUniversal} />
      )}
    </div>
  );
}
