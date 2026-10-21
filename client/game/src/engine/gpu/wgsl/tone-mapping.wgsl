fn toneMapping(_C : vec3f) -> vec3f {
  var c = (_C * (2.51 * _C + 0.03)) / (_C * (2.43 * _C + 0.59) + 0.14);
  return clamp(c, vec3f(0.), vec3f(1.));
}


fn revertToneMapping(color : vec3f) -> vec3f {
  var a = 2.43 * color - 2.51;
  var b = 0.59 * color - 0.03;
  var c = 0.14 * color;
  var det = sqrt(b * b - 4.0 * a * c);
  return (-b - det) / (2.0 * a);
}
