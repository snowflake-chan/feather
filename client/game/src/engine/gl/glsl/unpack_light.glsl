lowp vec4 scaleDist2 (const lowp vec4 l) {
    return l / (16. - 15. * l);
}

void unpackLight (mediump vec4 attrib, out lowp vec4 light0, out lowp vec4 light1) {
    attrib /= 16.;
    light0 = scaleDist2(fract(attrib).xzyw);
    light1 = scaleDist2(floor(attrib).xzyw / 16.);
}

#pragma glslify:export(unpackLight)