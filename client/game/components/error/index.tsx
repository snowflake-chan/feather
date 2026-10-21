import React from 'react';
import style from './index.module.css';

export type ErrorProps = {
    code:number;
    info:string;
};
export function Error(props:ErrorProps) {
    const { code, info } = props;
    return <div className={style.wrapper}>
        <h1>
            {`An error ${code} occurred. Details: ${info}`}
        </h1>
    </div>
}