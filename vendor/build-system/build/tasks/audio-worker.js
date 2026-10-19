"use strict";
const ffmpeg = require('ffmpeg-audio');
function audioProcess(data, sampleRatio, channel) {
    const result = ffmpeg({
        MEMFS: [
            {
                name: 'audiofile',
                data: Uint8Array.from(data),
            },
        ],
        arguments: [
            '-i',
            'audiofile',
            '-map',
            '0:a', // ignore cover
            '-ar',
            String(sampleRatio), // sample ratio(hz)
            '-ac',
            String(channel), // channels
            'out.mp3',
        ],
    });
    const out = result.MEMFS[0];
    if (!out || !out.data.length) {
        process.exit(1);
    }
    return out.data;
}
process.on('message', ([data, ratio, channel]) => {
    const result = audioProcess(Buffer.from(data), ratio, channel);
    process.send && process.send(result);
});
//# sourceMappingURL=audio-worker.js.map