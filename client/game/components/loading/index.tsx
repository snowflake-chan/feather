import style from './index.module.css';

export const Loading = () => {
    return <div className={style.loading}>
        <div className={style['loading-img']}></div>
    </div>
};