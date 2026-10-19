"use strict"

var ndarray = require("ndarray")
var compileCWise = require("./modules/cwise-compiler/compiler")
var compileMesher = require("greedy-mesher")
var pool = require("./modules/typedarray-pool/pool")

var OPAQUE_BIT      = (1 << 15)
var VOXEL_MASK      = (1 << 16) - 1
var AO_SHIFT        = 16
var AO_BITS         = 2
var AO_MASK         = (1 << AO_BITS) - 1
var FLIP_BIT        = (1 << (AO_SHIFT + 4 * AO_BITS))
var TEXTURE_SHIFT   = 4
var TEXTURE_MASK    = (1<<TEXTURE_SHIFT)-1
var VERTEX_SIZE     = 8

//
// Vertex format:
//
//  x, y, z, ambient occlusion, normal_x, normal_y, normal_z, tex_id
//
//
// Voxel format:
//
//  * Max 16 bits per voxel
//  * Bit 15 is opacity flag  (set to 1 for voxel to be solid, otherwise rendererd transparent)
//  * Texture index is calculated by masking out lower order bits
//
//
// This stuff can be changed over time.  -Mik
//

//Retrieves the texture for a voxel
function voxelTexture(voxel, side, voxelSideTextureIDs) {
  return voxelSideTextureIDs ? voxelSideTextureIDs.get(voxel&0xff, side) : voxel&0xff
}

//Calculates ambient occlusion level for a vertex
function vertexAO(s1, s2, c) {
  if(s1 && s2) {
    return 1
  }
  return 3 - (s1 + s2 + c)
}

//Calculates the ambient occlusion bit mask for a facet
function facetAO(a00, a01, a02,
                 a10,      a12,
                 a20, a21, a22) {
  var s00 = (a00&OPAQUE_BIT) ? 1 : 0
    , s01 = (a01&OPAQUE_BIT) ? 1 : 0
    , s02 = (a02&OPAQUE_BIT) ? 1 : 0
    , s10 = (a10&OPAQUE_BIT) ? 1 : 0
    , s12 = (a12&OPAQUE_BIT) ? 1 : 0
    , s20 = (a20&OPAQUE_BIT) ? 1 : 0
    , s21 = (a21&OPAQUE_BIT) ? 1 : 0
    , s22 = (a22&OPAQUE_BIT) ? 1 : 0
  return (vertexAO(s10, s01, s00)<< AO_SHIFT) +
         (vertexAO(s01, s12, s02)<<(AO_SHIFT+AO_BITS)) +
         (vertexAO(s12, s21, s22)<<(AO_SHIFT+2*AO_BITS)) +
         (vertexAO(s21, s10, s20)<<(AO_SHIFT+3*AO_BITS))
}

//Generates a surface voxel, complete with ambient occlusion type
function generateSurfaceVoxel(
  v000, v001, v002,
  v010, v011, v012,
  v020, v021, v022,
  v100, v101, v102,
  v110, v111, v112,
  v120, v121, v122) {
  var t0 = !(v011 & OPAQUE_BIT)
    , t1 = !(v111 & OPAQUE_BIT)
  if(v111 && (!v011 || (t0 && !t1))) {
    return v111 | FLIP_BIT | facetAO(v000, v001, v002,
                                     v010,       v012,
                                     v020, v021, v022)
  } else if(v011 && (!v111 || (t1 && !t0))  ) {
    return v011 | facetAO(v100, v101, v102,
                          v110,       v112,
                          v120, v121, v122)
  }
}

//Compile surface stencil operator
var surfaceStencil = (function() {
  function arg(name, lv, rv, count) {
    return { name: name, lvalue: lv, rvalue: rv, count: count}
  }
  var empty_proc = { args:[], thisVars:[], localVars:[], body:"" }
  var cwise_args = [ "scalar", "array", "array", "array", "array" ]
  var cwise_arg_names = [
    arg("_func",false,true,3),
    arg("_o0",true,false,1),
    arg("_o1",true,false,1),
    arg("_o2",true,false,1) ]
  var cwise_body = [ ]
  for(var d=0; d<3; ++d) {
    var u = (d+1) % 3
    var v = (d+2) % 3
    var expr = []
    for(var dz=0; dz<2; ++dz)
    for(var dy=0; dy<=2; ++dy)
    for(var dx=0; dx<=2; ++dx) {
      var x = [dx,dy,dz]
      expr.push(["_a", x[v], x[u], x[d]].join(""))
    }
    cwise_body.push(["_o", d, "=_func(", expr.join(","), ")"].join(""))
  }
  var cwise_body_str = cwise_body.join("\n")
  for(var dx=-1; dx<=1; ++dx)
  for(var dy=-1; dy<=1; ++dy)
  for(var dz=-1; dz<=1; ++dz) {
    if(dx === 1 && dy === 1 && dz === 1) {
      continue
    }
    if(!(dx === -1 && dy === -1 && dz === -1)) {
      cwise_args.push({offset: [dx+1,dy+1,dz+1], array:3})
    }
    var carg_name = ["_a", dx+1, dy+1, dz+1].join("")
    cwise_arg_names.push(arg(carg_name, false, true, cwise_body_str.split(carg_name).length - 1))
  }
  return compileCWise({
    args: cwise_args,
    pre: empty_proc,
    body: {args: cwise_arg_names, body: cwise_body_str, thisVars: [], localVars: []},
    post: empty_proc,
    funcName: "calcAO"
  }).bind(undefined, generateSurfaceVoxel)
})();

function MeshBuilder() {
  this.buffer = pool.mallocUint8(1024)
  this.ptr = 0
  this.z = 0
  this.u = 0
  this.v = 0
  this.d = 0
}

var AO_TABLE = new Uint8Array([0, 153, 204, 255])

function normalCode (nx, ny, nz) {
  if (nx < 128) {
      return 0;
  } else if (nx > 128) {
      return 1;
  } else if (ny < 128) {
      return 2;
  } else if (ny > 128) {
      return 3;
  } else if (nz < 128) {
      return 4;
  } else if (nz > 128) {
      return 5;
  }
  return 0;
}

MeshBuilder.prototype.append = function(lo_x, lo_y, hi_x, hi_y, val) {
  var buffer = this.buffer
  var ptr = this.ptr>>>0
  var z = this.z|0
  var u = this.u|0
  var v = this.v|0
  var d = this.d|0

  //Grow buffer if we exceed capacity
  if(ptr + 6*VERTEX_SIZE > buffer.length) {
    var tmp = pool.mallocUint8(2*buffer.length);
    tmp.set(buffer)
    pool.freeUint8(buffer)
    buffer = tmp
    this.buffer = buffer
  }

  var flip = !!(val & FLIP_BIT)
  var side = d + (flip ? 3 : 0)
  
  var a00_idx = ((val>>>AO_SHIFT)&AO_MASK);
  var a10_idx = ((val>>>(AO_SHIFT+AO_BITS))&AO_MASK);
  var a11_idx = ((val>>>(AO_SHIFT+2*AO_BITS))&AO_MASK);
  var a01_idx = ((val>>>(AO_SHIFT+3*AO_BITS))&AO_MASK);

  var packedAO = (a01_idx << 6) + (a11_idx << 4) + (a10_idx << 2) + a00_idx;
  var packedUVD = (u << 4) + (v << 2) + d;
  var a00 = AO_TABLE[a00_idx]
  var a10 = AO_TABLE[a10_idx]
  var a11 = AO_TABLE[a11_idx]
  var a01 = AO_TABLE[a01_idx]
  
  var tex_id = voxelTexture(val&VOXEL_MASK, side, this.voxelSideTextureIDs)

  var nx=128, ny=128, nz=128
  var sign = flip ? 127 : 129
  if(d === 0) {
    nx = sign
  } else if(d === 1) {
    ny = sign
  } else if(d === 2) {
    nz = sign
  }
  
  var flipAO = a00 + a11 < a10 + a01
  
  if(a00 + a11 === a10 + a01) {
    flipAO = Math.max(a00,a11) < Math.max(a10,a01)
  }
  var normal_code = normalCode(nx, ny, nz);

  if(flipAO) {
    if(!flip) {
      buffer[ptr+u] = lo_x
      buffer[ptr+v] = lo_y
      buffer[ptr+d] = z
      buffer[ptr+3] = a00
      buffer[ptr+4] = packedUVD
      buffer[ptr+5] = normal_code
      buffer[ptr+6] = packedAO
      buffer[ptr+7] = tex_id
      ptr += 8
      
      buffer[ptr+u] = lo_x
      buffer[ptr+v] = hi_y
      buffer[ptr+d] = z
      buffer[ptr+3] = a01
      buffer[ptr+4] = packedUVD
      buffer[ptr+5] = normal_code
      buffer[ptr+6] = packedAO
      buffer[ptr+7] = tex_id
      ptr += 8

      buffer[ptr+u] = hi_x
      buffer[ptr+v] = lo_y
      buffer[ptr+d] = z
      buffer[ptr+3] = a10
      buffer[ptr+4] = packedUVD
      buffer[ptr+5] = normal_code
      buffer[ptr+6] = packedAO
      buffer[ptr+7] = tex_id  
      ptr += 8

      buffer[ptr+u] = hi_x
      buffer[ptr+v] = hi_y
      buffer[ptr+d] = z
      buffer[ptr+3] = a11
      buffer[ptr+4] = packedUVD
      buffer[ptr+5] = normal_code
      buffer[ptr+6] = packedAO
      buffer[ptr+7] = tex_id
      ptr += 8
      
      buffer[ptr+u] = hi_x
      buffer[ptr+v] = lo_y
      buffer[ptr+d] = z
      buffer[ptr+3] = a10
      buffer[ptr+4] = packedUVD
      buffer[ptr+5] = normal_code
      buffer[ptr+6] = packedAO
      buffer[ptr+7] = tex_id
      ptr += 8
      
      buffer[ptr+u] = lo_x
      buffer[ptr+v] = hi_y
      buffer[ptr+d] = z
      buffer[ptr+3] = a01
      buffer[ptr+4] = packedUVD
      buffer[ptr+5] = normal_code
      buffer[ptr+6] = packedAO
      buffer[ptr+7] = tex_id
      ptr += 8
      
    } else {
      buffer[ptr+u] = lo_x
      buffer[ptr+v] = lo_y
      buffer[ptr+d] = z
      buffer[ptr+3] = a00
      buffer[ptr+4] = packedUVD
      buffer[ptr+5] = normal_code
      buffer[ptr+6] = packedAO
      buffer[ptr+7] = tex_id

      ptr += 8
      
      buffer[ptr+u] = hi_x
      buffer[ptr+v] = lo_y
      buffer[ptr+d] = z
      buffer[ptr+3] = a10
      buffer[ptr+4] = packedUVD
      buffer[ptr+5] = normal_code
      buffer[ptr+6] = packedAO
      buffer[ptr+7] = tex_id
      
      ptr += 8
      
      buffer[ptr+u] = lo_x
      buffer[ptr+v] = hi_y
      buffer[ptr+d] = z
      buffer[ptr+3] = a01
      buffer[ptr+4] = packedUVD
      buffer[ptr+5] = normal_code
      buffer[ptr+6] = packedAO
      buffer[ptr+7] = tex_id
      
      ptr += 8

      buffer[ptr+u] = hi_x
      buffer[ptr+v] = hi_y
      buffer[ptr+d] = z
      buffer[ptr+3] = a11
      buffer[ptr+4] = packedUVD
      buffer[ptr+5] = normal_code
      buffer[ptr+6] = packedAO
      buffer[ptr+7] = tex_id

      ptr += 8
      
      buffer[ptr+u] = lo_x
      buffer[ptr+v] = hi_y
      buffer[ptr+d] = z
      buffer[ptr+3] = a01
      buffer[ptr+4] = packedUVD
      buffer[ptr+5] = normal_code
      buffer[ptr+6] = packedAO
      buffer[ptr+7] = tex_id
      
      ptr += 8
      
      buffer[ptr+u] = hi_x
      buffer[ptr+v] = lo_y
      buffer[ptr+d] = z
      buffer[ptr+3] = a10
      buffer[ptr+4] = packedUVD
      buffer[ptr+5] = normal_code
      buffer[ptr+6] = packedAO
      buffer[ptr+7] = tex_id
      
      ptr += 8
    }
  } else {
    //Check if flipped
    if(flip) {
      buffer[ptr+u] = lo_x
      buffer[ptr+v] = hi_y
      buffer[ptr+d] = z
      buffer[ptr+3] = a01
      buffer[ptr+4] = packedUVD
      buffer[ptr+5] = normal_code
      buffer[ptr+6] = packedAO
      buffer[ptr+7] = tex_id

      ptr += 8
      
      buffer[ptr+u] = lo_x
      buffer[ptr+v] = lo_y
      buffer[ptr+d] = z
      buffer[ptr+3] = a00
      buffer[ptr+4] = packedUVD
      buffer[ptr+5] = normal_code
      buffer[ptr+6] = packedAO
      buffer[ptr+7] = tex_id
      
      ptr += 8

      buffer[ptr+u] = hi_x
      buffer[ptr+v] = hi_y
      buffer[ptr+d] = z
      buffer[ptr+3] = a11
      buffer[ptr+4] = packedUVD
      buffer[ptr+5] = normal_code
      buffer[ptr+6] = packedAO
      buffer[ptr+7] = tex_id
      
      ptr += 8
      
      buffer[ptr+u] = hi_x
      buffer[ptr+v] = lo_y
      buffer[ptr+d] = z
      buffer[ptr+3] = a10
      buffer[ptr+4] = packedUVD
      buffer[ptr+5] = normal_code
      buffer[ptr+6] = packedAO
      buffer[ptr+7] = tex_id

      ptr += 8
      
      buffer[ptr+u] = hi_x
      buffer[ptr+v] = hi_y
      buffer[ptr+d] = z
      buffer[ptr+3] = a11
      buffer[ptr+4] = packedUVD
      buffer[ptr+5] = normal_code
      buffer[ptr+6] = packedAO
      buffer[ptr+7] = tex_id
      
      ptr += 8
      
      buffer[ptr+u] = lo_x
      buffer[ptr+v] = lo_y
      buffer[ptr+d] = z
      buffer[ptr+3] = a00
      buffer[ptr+4] = packedUVD
      buffer[ptr+5] = normal_code
      buffer[ptr+6] = packedAO
      buffer[ptr+7] = tex_id
      
      ptr += 8
    } else {
      buffer[ptr+u] = lo_x
      buffer[ptr+v] = lo_y
      buffer[ptr+d] = z
      buffer[ptr+3] = a00
      buffer[ptr+4] = packedUVD
      buffer[ptr+5] = normal_code
      buffer[ptr+6] = packedAO
      buffer[ptr+7] = tex_id
      
      ptr += 8
      
      buffer[ptr+u] = lo_x
      buffer[ptr+v] = hi_y
      buffer[ptr+d] = z
      buffer[ptr+3] = a01
      buffer[ptr+4] = packedUVD
      buffer[ptr+5] = normal_code
      buffer[ptr+6] = packedAO
      buffer[ptr+7] = tex_id

      ptr += 8
      
      buffer[ptr+u] = hi_x
      buffer[ptr+v] = hi_y
      buffer[ptr+d] = z
      buffer[ptr+3] = a11
      buffer[ptr+4] = packedUVD
      buffer[ptr+5] = normal_code
      buffer[ptr+6] = packedAO
      buffer[ptr+7] = tex_id
      
      ptr += 8
      
      buffer[ptr+u] = hi_x
      buffer[ptr+v] = hi_y
      buffer[ptr+d] = z
      buffer[ptr+3] = a11
      buffer[ptr+4] = packedUVD
      buffer[ptr+5] = normal_code
      buffer[ptr+6] = packedAO
      buffer[ptr+7] = tex_id
      
      ptr += 8

      buffer[ptr+u] = hi_x
      buffer[ptr+v] = lo_y
      buffer[ptr+d] = z
      buffer[ptr+3] = a10
      buffer[ptr+4] = packedUVD
      buffer[ptr+5] = normal_code
      buffer[ptr+6] = packedAO
      buffer[ptr+7] = tex_id

      ptr += 8
      
      buffer[ptr+u] = lo_x
      buffer[ptr+v] = lo_y
      buffer[ptr+d] = z
      buffer[ptr+3] = a00
      buffer[ptr+4] = packedUVD
      buffer[ptr+5] = normal_code
      buffer[ptr+6] = packedAO
      buffer[ptr+7] = tex_id
      
      ptr += 8
    }
  }
  this.ptr = ptr
}

var meshBuilder = new MeshBuilder();

//Compile mesher
var meshSliceGreedy = compileMesher({
  order: [1, 0],
  append: MeshBuilder.prototype.append.bind(meshBuilder),
});

function generateMesher(append, mallocUint8, freeUint8) {
  'use strict';
  function mesher2d_ord1s0(array, aoMarks, d_axis, u_axis, v_axis) {
    var data = array.data,
        offset = array.offset,
        shape = array.shape,
        stride = array.stride
    var stride0 = stride[1] | 0,
        shape0 = shape[1] | 0
    var astep0 = stride0 | 0
    var i0 = 0,
        j0 = 0,
        k0 = 0
    var stride1 = stride[0] | 0,
        shape1 = shape[0] | 0
    var astep1 = (stride1 - stride0 * shape0) | 0

    var i1 = 0,
        j1 = 0,
        k1 = 0,
        ustep1 = shape0,
        bstep1 = astep1 | 0
    var a_ptr = offset >>> 0,
        b_ptr = 0,
        u_ptr = 0,
        v_ptr = 0,
        i = 0,
        d = 0,
        val = 0,
        oval = 0
    var count = shape0 * shape1
    var visited = mallocUint8(count)
    for (; i < count; ++i) {
      visited[i] = 0
    }
    for (i1 = 0; i1 < shape1; ++i1) {
        for (i0 = 0; i0 < shape0; ++i0) {
            if (!visited[v_ptr]) {
                val = data[a_ptr]
                if (val !== 0) {
                    oval = val
                    u_ptr = v_ptr + 1
                    b_ptr = a_ptr + stride0
                    j0_loop: for (j0 = 1 + i0; j0 < shape0; ++j0) {
                        if (visited[u_ptr] || (aoMarks[v_axis][j0] === 1)) {
                            break j0_loop;
                        }
                        val = data[b_ptr]
                        if (val === 0 || val !== oval || (aoMarks[v_axis][j0] === 1)) {
                            break j0_loop;
                        }
                        ++u_ptr
                        b_ptr += stride0
                    }
                    d = j0 - i0
                    ustep1 = (shape0 - d) | 0
                    bstep1 = (stride1 - stride0 * d) | 0
                    u_ptr = v_ptr + shape0
                    b_ptr = a_ptr + stride1
                    j1_loop: for (j1 = 1 + i1; j1 < shape1; ++j1) {
                        for (k0 = i0; k0 < j0; ++k0) {
                            if (visited[u_ptr] || (aoMarks[u_axis][j1] === 1)) {
                                break j1_loop;
                            }
                            val = data[b_ptr]
                            if (val === 0 || val !== oval || (aoMarks[u_axis][j1] === 1)) {
                                break j1_loop;
                            }
                            ++u_ptr
                            b_ptr += stride0
                        }
                        u_ptr += ustep1
                        b_ptr += bstep1
                    }
                    u_ptr = v_ptr
                    for (k1 = i1; k1 < j1; ++k1) {
                        for (k0 = i0; k0 < j0; ++k0) {
                            visited[u_ptr++] = 1
                        }
                        u_ptr += ustep1
                    }
                    append(i0, i1, j0, j1, oval)
                }
            }
            ++v_ptr
            a_ptr += astep0
        }
        a_ptr += astep1
    }
    freeUint8(visited)
  };
  return mesher2d_ord1s0
}

var meshSliceReduceTJ = generateMesher(MeshBuilder.prototype.append.bind(meshBuilder), pool.mallocUint8, pool.freeUint8);
//Compute a mesh

function alloc0 (n) {
  var result = new Array(n);
  for (let i = 0; i < n; ++i) {
    result[i] = 0;
  }
  return result;
}

function computeMesh(array, voxelSideTextureIDs) {
  var shp = array.shape.slice(0)
  var nx = (shp[0]-2)|0
  var ny = (shp[1]-2)|0
  var nz = (shp[2]-2)|0
  var sz = nx * ny * nz
  var scratch0 = pool.mallocInt32(sz)
  var scratch1 = pool.mallocInt32(sz)
  var scratch2 = pool.mallocInt32(sz)
  var rshp = [nx, ny, nz]
  var ao0 = ndarray(scratch0, rshp)
  var ao1 = ndarray(scratch1, rshp)
  var ao2 = ndarray(scratch2, rshp)
  var x_ao_mark = alloc0(rshp[0] + 1);
  var y_ao_mark = alloc0(rshp[1] + 1);
  var z_ao_mark = alloc0(rshp[2] + 1);
  var aoMarks = [x_ao_mark, y_ao_mark, z_ao_mark];
  //Calculate ao fields
  surfaceStencil(ao0, ao1, ao2, array)
  var buffers = [ao0, ao1, ao2]
  // first round, find all the mark alone xyz axis
  for (var d=0; d<3; d++) {
    var u = (d + 1) % 3;
    var v = (d + 2) % 3;
    var x = [0, 0, 0];
    var q = [0, 0, 0];
    var st = buffers[d].transpose(d, u, v)
    var slice = st.pick(0);
    q[d] = 1;
    for (x[d] = 0; x[d] < rshp[d]; x[d]++) {
      var shape = slice.shape;
      for (x[v] = 0; x[v] < shape[1]; x[v]++) {
        for (x[u] = 0; x[u] < shape[0]; x[u]++, n++) {
          if (x[v] != 0 && (slice.get(x[u], x[v]) != slice.get(x[u], x[v] - 1))) {
            aoMarks[v][x[v]] = 1;
          }
          if (x[u] != 0 && (slice.get(x[u], x[v]) != slice.get(x[u] - 1, x[v]))) {
            aoMarks[u][x[u]] = 1;
          }
        }
      }
      slice.offset += st.stride[0];
    }
    slice.offset = 0;
  }
  //Build mesh slices
  meshBuilder.ptr = 0
  meshBuilder.voxelSideTextureIDs = voxelSideTextureIDs
  for(var d=0; d<3; ++d) {
    var u = (d+1)%3
    var v = (d+2)%3
    //Create slice
    var st = buffers[d].transpose(d, u, v)
    var slice = st.pick(0)
    var n = rshp[d]|0
    meshBuilder.d = d
    meshBuilder.u = v
    meshBuilder.v = u
    //Generate slices
    for(var i=0; i<n; ++i) {
      meshBuilder.z = i
      meshSliceReduceTJ(slice, aoMarks, d, u, v)
      slice.offset += st.stride[0]
    }
  }
  //Release buffers
  pool.freeInt32(scratch0)
  pool.freeInt32(scratch1)
  pool.freeInt32(scratch2)
  
  //Release uint8 array if no vertices were allocated
  if(meshBuilder.ptr === 0) {
    return null
  }
  //Slice out buffer
  var rbuffer = meshBuilder.buffer
  var rptr = meshBuilder.ptr
  meshBuilder.buffer = pool.mallocUint8(1024)
  meshBuilder.ptr = 0
  return rbuffer.subarray(0, rptr)
}

function greedyComputeMesh(array, voxelSideTextureIDs) {
  var shp = array.shape.slice(0)
  var nx = (shp[0]-2)|0
  var ny = (shp[1]-2)|0
  var nz = (shp[2]-2)|0
  var sz = nx * ny * nz
  var scratch0 = pool.mallocInt32(sz)
  var scratch1 = pool.mallocInt32(sz)
  var scratch2 = pool.mallocInt32(sz)
  var rshp = [nx, ny, nz]
  var ao0 = ndarray(scratch0, rshp)
  var ao1 = ndarray(scratch1, rshp)
  var ao2 = ndarray(scratch2, rshp)
  //Calculate ao fields
  surfaceStencil(ao0, ao1, ao2, array)
  var buffers = [ao0, ao1, ao2]
  //Build mesh slices
  meshBuilder.ptr = 0
  meshBuilder.voxelSideTextureIDs = voxelSideTextureIDs
  for(var d=0; d<3; ++d) {
    var u = (d+1)%3
    var v = (d+2)%3
    //Create slice
    var st = buffers[d].transpose(d, u, v)
    var slice = st.pick(0)
    var n = rshp[d]|0
    meshBuilder.d = d
    meshBuilder.u = v
    meshBuilder.v = u
    //Generate slices
    for(var i=0; i<n; ++i) {
      meshBuilder.z = i
      meshSliceGreedy(slice)
      slice.offset += st.stride[0]
    }
  }
  //Release buffers
  pool.freeInt32(scratch0)
  pool.freeInt32(scratch1)
  pool.freeInt32(scratch2)
  //Release uint8 array if no vertices were allocated
  if(meshBuilder.ptr === 0) {
    return null
  }
  //Slice out buffer
  var rbuffer = meshBuilder.buffer
  var rptr = meshBuilder.ptr
  meshBuilder.buffer = pool.mallocUint8(1024)
  meshBuilder.ptr = 0
  return rbuffer.subarray(0, rptr)
}

module.exports = {
  computeMesh,
  greedyComputeMesh,
}
