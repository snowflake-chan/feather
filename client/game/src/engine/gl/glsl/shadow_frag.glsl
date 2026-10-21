varying highp vec2 fShadow;

void main () {
    highp float d = fShadow.x / fShadow.y;
    gl_FragColor = vec4(d);
}
