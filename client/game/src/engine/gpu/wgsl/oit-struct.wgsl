struct FragmentData {
  color : u32,
  depth : f32,
}

struct StaticNode {
  data : FragmentData,
  next : u32,
}
