import { vec3 } from 'gl-matrix';

const DEFAULT_COLOR = vec3.set(vec3.create(), 1, 1, 1);

export default function (regl) {
    const drawPoint = regl({
        frag: `
        precision mediump float;
        uniform lowp vec3 color;
        void main () {
            if (length(gl_PointCoord.xy - 0.5) > 0.45) {
                discard;
            }
            gl_FragColor = vec4(color, 1);
        }`,

        vert: `
        precision mediump float;
        uniform mat4 projection, view;
        attribute float p;
        uniform vec3 point;
        uniform float radius;
        void main () {
            gl_PointSize = radius;
            gl_Position = projection * view * vec4(point * p, 1);
        }`,

        uniforms: {
            'point': regl.prop('point'),
            'radius': ({ pixelRatio }, { radius }) => pixelRatio * radius,
            'color': regl.prop('color'),
        },

        attributes: {
            p: [ 1 ],
        },
        count: 1,
        primitive: 'points',
        offset: 0,
    });

    return function (point:vec3, radius?:number, color?:vec3) {
        drawPoint({
            point,
            radius: (radius || 8),
            color: color || DEFAULT_COLOR,
        });
    };
}