import { vec3, mat4 } from 'gl-matrix';

export default function (regl) {
    const drawBox = regl({
        frag: `
        precision lowp float;
        uniform vec3 color;
        void main () {
            gl_FragColor = vec4(color, 1);
        }`,

        vert: `
        precision highp float;
        uniform mat4 projection, view, model;
        uniform vec3 bounds[2];
        attribute vec3 position;
        void main () {
            vec3 p = mix(bounds[0], bounds[1], position);
            gl_Position = projection * view * model * vec4(p, 1);
        }`,

        uniforms: {
            'bounds[0]': regl.prop('bounds[0]'),
            'bounds[1]': regl.prop('bounds[1]'),
            'color': regl.prop('color'),
            'model': (context, props) => props.model || context.model,
        },

        attributes: {
            position: [
                0, 0, 0,
                0, 0, 1,
                0, 1, 0,
                0, 1, 1,
                1, 0, 0,
                1, 0, 1,
                1, 1, 0,
                1, 1, 1,
            ],
        },

        elements: [
            [1, 0],
            [2, 0],
            [3, 1],
            [3, 2],
            [4, 0],
            [5, 1],
            [5, 4],
            [6, 2],
            [6, 4],
            [7, 3],
            [7, 5],
            [7, 6],
        ],
    });

    interface BoxT {
        bounds:(number[]|vec3)[];
        color:number[]|vec3;
        model?:number[]|mat4;
    }

    type DrawBoxT = (boxes:BoxT|BoxT[]) => void;

    return <DrawBoxT>drawBox;
}