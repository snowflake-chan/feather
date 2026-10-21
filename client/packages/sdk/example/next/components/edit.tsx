import React, { useEffect, useRef } from 'react';
import { create } from '../../../index'

export default () => {
    const iframeRef = useRef();

    useEffect(() => {
        const editor = create({
            type: 'edit',
            url: 'https://xxx.createra.fun:3000/p/ec3e4fd22de4f5df34bf',
        });
        editor.init({
            dom: iframeRef.current,
            eventsOn: (event) => {
                if (event.type === 'ready') {
                    editor.emitEvent({ type: '', value: '' });
                }
            },
        });
    }, []);
    return <div ref={iframeRef}></div>
}