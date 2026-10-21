import REGL from 'regl';

export default function (regl:REGL.Regl) {
    const triangle = regl.vao({
        attributes: [
            [ [-4, 0], [4, -4], [4, 4] ],
        ],
        elements: null,
        count: 3,
        offset: 0,
        primitive: 'triangles',
    });

    regl.on('restore', () => {
        triangle({
            attributes: [
                [ [-4, 0], [4, -4], [4, 4] ],
            ],
            elements: null,
            count: 3,
            offset: 0,
            primitive: 'triangles',
        });
    });

    return triangle;
}
