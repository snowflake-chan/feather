import { vec2 } from 'gl-matrix';

export default function (regl) {
    return <(props:{ lo:vec2|number[], hi:vec2|number[], texture:any }) => void>regl({
        vert: `
        precision mediump float;
        attribute vec2 uv;
        varying vec2 fuv;
        uniform vec2 lo, hi;
        void main () {
          fuv = uv;
          gl_Position = vec4(mix(lo, hi, uv), 0, 1);
        }
        `,

        frag: `
        precision mediump float;
        varying vec2 fuv;
        uniform sampler2D img;
        void main () {
          vec4 color = texture2D(img, fuv);
          gl_FragColor = vec4(color.rgb, 1);
        }
        `,

        uniforms: {
          lo: regl.prop('lo'),
          hi: regl.prop('hi'),
          img: regl.prop('texture'),
        },

        depth: {
            enable: false,
            mask: false,
        },

        attributes: {
          uv: [
            [0, 0],
            [1, 0],
            [0, 1],
            [0, 1],
            [1, 0],
            [1, 1],
          ],
        },

        count: 6,
      });
}