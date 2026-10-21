const URL_API = (typeof window === 'undefined') ? null : ((<any>window).URL || (<any>window).webkitURL || null);

export interface ScreenShotOptions {
    type:'png'|'jpeg'|'webp';
    sx?:number;
    sy?:number;
    sw?:number;
    sh?:number;
    scale?:number;
    quality?:number;
}

export interface ScreenRecOptions {
    frameRate?:number;
    type?:string;
}

export type VideoCapturer = {
    start:() => void,
    complete:(next:(url:string) => void) => void,
};

export function canvasToVideo (canvas:HTMLCanvasElement, _options?:ScreenRecOptions) : VideoCapturer {
    const options = Object.assign(
        {
            frameRate: 60,
        },
        _options || {});

    let recorder;
    let chunks:Blob[] = [];

    function start () {
        if (!window) { return; }
        const stream = (canvas as any).captureStream(options.frameRate);
        recorder = new (window as any).MediaRecorder(stream);
        recorder.start();

        recorder.ondataavailable = (e) => {
            chunks.push(e.data as Blob);
        };
    }

    function complete (next:(src:string) => void) {
        if (!recorder) { return; }
        const url = URL_API;
        if (url) {
            recorder.onstop = (e) => {
                const blob = new Blob(chunks, { type: 'video/webm' });
                chunks = [];
                next(url.createObjectURL(blob));
            };
        }
        recorder.stop();
    }

    return {
        start,
        complete,
    };
}

function _drawCanvas (source:HTMLCanvasElement, options:ScreenShotOptions) {
    const opt = {
        sx: 0, sy: 0,
        sw: 0, sh: 0,
        dw: 0, dh: 0,
    };

    const temp = document.createElement('canvas');
    const ctx = temp.getContext('2d');
    if (!ctx) { return void 0; }

    const scale = options.scale || 1;
    opt.sw = options.sw || source.width;
    opt.sh = options.sh || source.height;
    opt.sx = options.sx || (source.width - opt.sw) / 2;
    opt.sy = options.sy || (source.height - opt.sh) / 2;
    opt.dw = opt.sw * scale;
    opt.dh = opt.sh * scale;

    temp.width = opt.dw;
    temp.height = opt.dh;

    ctx.drawImage(source, opt.sx, opt.sy, opt.sw, opt.sh, 0, 0, opt.dw, opt.dh);
    return temp;
}

export function canvasToBase64 (source:HTMLCanvasElement, options:ScreenShotOptions) {
    const temp = _drawCanvas(source, options);
    if (!temp) { return void 0; }

    let q = options.quality || 1.0;
    q = q < 0 ? 0 : q;
    q = q > 1 ? 1 : q;

    return temp.toDataURL(`image/${options.type}`, q);
}

export function canvasToBlobSync (source:HTMLCanvasElement, options:ScreenShotOptions) {
    let data = canvasToBase64(source, options);
    if (!data) { return void 0; }
    data = data.replace(`data:image/${options.type};base64,`, '');
    const blob = b64ToBlob(data, `image/${options.type}`);
    return blob;
}

export function canvasToBlob (
    source:HTMLCanvasElement,
    options:ScreenShotOptions,
    ) {
    return new Promise<Blob>((resolve, reject) => {
        const temp = _drawCanvas(source, options);
        if (!temp) { return reject(new Error(`Error in canvasToBlob: cannot draw canvas with ${source}, ${JSON.stringify(options)}`)); }

        let q = options.quality || 1.0;
        q = q < 0 ? 0 : q;
        q = q > 1 ? 1 : q;

        temp.toBlob(
            (blob) => {
                if (blob) {
                    resolve(blob);
                } else {
                    reject(new Error(`Error in canvasToBlob: blob is null`));
                }
            },
            `image/${options.type}`,
            q,
        );
    });
}

export function b64ToBlob (data:string, _contentType?:string, _sliceSize?:number) {
    const contentType = _contentType || '';
    const sliceSize = _sliceSize || 512;

    const byteChars = atob(data);
    const byteArrays:Uint8Array[] = [];

    for (let offset = 0; offset < byteChars.length; offset += sliceSize) {
        const slice = byteChars.slice(offset, offset + sliceSize);
        const byteNums = new Array(slice.length);
        for (let i = 0; i < slice.length; i ++) {
            byteNums[i] = slice.charCodeAt(i);
        }

        const byteArray = new Uint8Array(byteNums);
        byteArrays.push(byteArray);
    }

    return new Blob(byteArrays, { type: contentType });
}