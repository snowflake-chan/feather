const DL = 2.399963229728653;
const EULER = 2.718281828459045;

const samples = 8;
const noiseAmount = 0.0003;
const radius = 7.6306692;
const diffArea = 0.0391316;
const gDisplace = 0.0397193;
const aoClamp = 0.8251521;
const zNear = 1.;
const zFar = 100.;

struct CompareRes {
  far : u32,
  gauss : f32,
}
