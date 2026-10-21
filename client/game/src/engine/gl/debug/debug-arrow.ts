import { vec3 } from 'gl-matrix';

const DEFAULT_COLOR = vec3.set(vec3.create(), 1, 1, 1);

export default function (regl) {
    const drawArrow = regl({
        frag: `
        precision mediump float;
        uniform lowp vec3 color;
        void main () {
            gl_FragColor = vec4(color, 1);
        }`,

        vert: `
        precision mediump float;
        uniform mat4 projection, view;
        attribute float p;
        uniform vec3 origin, direction;
        void main () {
            gl_Position = projection * view * vec4(origin + p * direction, 1);
        }`,

        uniforms: {
            'origin': regl.prop('origin'),
            'direction': regl.prop('direction'),
            'color': (_, {color}) => color || DEFAULT_COLOR,
        },

        attributes: {
            p: [ 0, 1 ],
        },

        count: 2,
        primitive: 'line',
        offset: 0,
    });

    interface ArrowConfig {
        origin:vec3 | number[];
        direction:vec3 | number[];
        color:vec3 | number[];
    }

    type DrawArrowT = (arrow:ArrowConfig|ArrowConfig[]) => void;

    return <DrawArrowT>drawArrow;
}