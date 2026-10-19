import require$$2 from 'buffer';
import crypto from 'crypto';

var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

function getDefaultExportFromCjs (x) {
	return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
}

function getAugmentedNamespace(n) {
  if (Object.prototype.hasOwnProperty.call(n, '__esModule')) return n;
  var f = n.default;
	if (typeof f == "function") {
		var a = function a () {
			if (this instanceof a) {
        return Reflect.construct(f, arguments, this.constructor);
			}
			return f.apply(this, arguments);
		};
		a.prototype = f.prototype;
  } else a = {};
  Object.defineProperty(a, '__esModule', {value: true});
	Object.keys(n).forEach(function (k) {
		var d = Object.getOwnPropertyDescriptor(n, k);
		Object.defineProperty(a, k, d.get ? d : {
			enumerable: true,
			get: function () {
				return n[k];
			}
		});
	});
	return a;
}

var iota_1;
var hasRequiredIota;

function requireIota () {
	if (hasRequiredIota) return iota_1;
	hasRequiredIota = 1;

	function iota(n) {
	  var result = new Array(n);
	  for(var i=0; i<n; ++i) {
	    result[i] = i;
	  }
	  return result
	}

	iota_1 = iota;
	return iota_1;
}

/*!
 * Determine if an object is a Buffer
 *
 * @author   Feross Aboukhadijeh <https://feross.org>
 * @license  MIT
 */

var isBuffer_1;
var hasRequiredIsBuffer;

function requireIsBuffer () {
	if (hasRequiredIsBuffer) return isBuffer_1;
	hasRequiredIsBuffer = 1;
	// The _isBuffer check is for Safari 5-7 support, because it's missing
	// Object.prototype.constructor. Remove this eventually
	isBuffer_1 = function (obj) {
	  return obj != null && (isBuffer(obj) || isSlowBuffer(obj) || !!obj._isBuffer)
	};

	function isBuffer (obj) {
	  return !!obj.constructor && typeof obj.constructor.isBuffer === 'function' && obj.constructor.isBuffer(obj)
	}

	// For Node v0.10 support. Remove this eventually.
	function isSlowBuffer (obj) {
	  return typeof obj.readFloatLE === 'function' && typeof obj.slice === 'function' && isBuffer(obj.slice(0, 0))
	}
	return isBuffer_1;
}

var ndarray$1;
var hasRequiredNdarray;

function requireNdarray () {
	if (hasRequiredNdarray) return ndarray$1;
	hasRequiredNdarray = 1;
	var iota = requireIota();
	var isBuffer = requireIsBuffer();

	var hasTypedArrays  = ((typeof Float64Array) !== "undefined");

	function compare1st(a, b) {
	  return a[0] - b[0]
	}

	function order() {
	  var stride = this.stride;
	  var terms = new Array(stride.length);
	  var i;
	  for(i=0; i<terms.length; ++i) {
	    terms[i] = [Math.abs(stride[i]), i];
	  }
	  terms.sort(compare1st);
	  var result = new Array(terms.length);
	  for(i=0; i<result.length; ++i) {
	    result[i] = terms[i][1];
	  }
	  return result
	}

	function compileConstructor(dtype, dimension) {
	  var className = ["View", dimension, "d", dtype].join("");
	  if(dimension < 0) {
	    className = "View_Nil" + dtype;
	  }
	  var useGetters = (dtype === "generic");

	  if(dimension === -1) {
	    //Special case for trivial arrays
	    var code =
	      "function "+className+"(a){this.data=a;};\
	var proto="+className+".prototype;\
	proto.dtype='"+dtype+"';\
	proto.index=function(){return -1};\
	proto.size=0;\
	proto.dimension=-1;\
	proto.shape=proto.stride=proto.order=[];\
	proto.lo=proto.hi=proto.transpose=proto.step=\
	function(){return new "+className+"(this.data);};\
	proto.get=proto.set=function(){};\
	proto.pick=function(){return null};\
	return function construct_"+className+"(a){return new "+className+"(a);}";
	    var procedure = new Function(code);
	    return procedure()
	  } else if(dimension === 0) {
	    //Special case for 0d arrays
	    var code =
	      "function "+className+"(a,d) {\
	this.data = a;\
	this.offset = d\
	};\
	var proto="+className+".prototype;\
	proto.dtype='"+dtype+"';\
	proto.index=function(){return this.offset};\
	proto.dimension=0;\
	proto.size=1;\
	proto.shape=\
	proto.stride=\
	proto.order=[];\
	proto.lo=\
	proto.hi=\
	proto.transpose=\
	proto.step=function "+className+"_copy() {\
	return new "+className+"(this.data,this.offset)\
	};\
	proto.pick=function "+className+"_pick(){\
	return TrivialArray(this.data);\
	};\
	proto.valueOf=proto.get=function "+className+"_get(){\
	return "+(useGetters ? "this.data.get(this.offset)" : "this.data[this.offset]")+
	"};\
	proto.set=function "+className+"_set(v){\
	return "+(useGetters ? "this.data.set(this.offset,v)" : "this.data[this.offset]=v")+"\
	};\
	return function construct_"+className+"(a,b,c,d){return new "+className+"(a,d)}";
	    var procedure = new Function("TrivialArray", code);
	    return procedure(CACHED_CONSTRUCTORS[dtype][0])
	  }

	  var code = ["'use strict'"];

	  //Create constructor for view
	  var indices = iota(dimension);
	  var args = indices.map(function(i) { return "i"+i });
	  var index_str = "this.offset+" + indices.map(function(i) {
	        return "this.stride[" + i + "]*i" + i
	      }).join("+");
	  var shapeArg = indices.map(function(i) {
	      return "b"+i
	    }).join(",");
	  var strideArg = indices.map(function(i) {
	      return "c"+i
	    }).join(",");
	  code.push(
	    "function "+className+"(a," + shapeArg + "," + strideArg + ",d){this.data=a",
	      "this.shape=[" + shapeArg + "]",
	      "this.stride=[" + strideArg + "]",
	      "this.offset=d|0}",
	    "var proto="+className+".prototype",
	    "proto.dtype='"+dtype+"'",
	    "proto.dimension="+dimension);

	  //view.size:
	  code.push("Object.defineProperty(proto,'size',{get:function "+className+"_size(){\
	return "+indices.map(function(i) { return "this.shape["+i+"]" }).join("*"),
	"}})");

	  //view.order:
	  if(dimension === 1) {
	    code.push("proto.order=[0]");
	  } else {
	    code.push("Object.defineProperty(proto,'order',{get:");
	    if(dimension < 4) {
	      code.push("function "+className+"_order(){");
	      if(dimension === 2) {
	        code.push("return (Math.abs(this.stride[0])>Math.abs(this.stride[1]))?[1,0]:[0,1]}})");
	      } else if(dimension === 3) {
	        code.push(
	"var s0=Math.abs(this.stride[0]),s1=Math.abs(this.stride[1]),s2=Math.abs(this.stride[2]);\
	if(s0>s1){\
	if(s1>s2){\
	return [2,1,0];\
	}else if(s0>s2){\
	return [1,2,0];\
	}else{\
	return [1,0,2];\
	}\
	}else if(s0>s2){\
	return [2,0,1];\
	}else if(s2>s1){\
	return [0,1,2];\
	}else{\
	return [0,2,1];\
	}}})");
	      }
	    } else {
	      code.push("ORDER})");
	    }
	  }

	  //view.set(i0, ..., v):
	  code.push(
	"proto.set=function "+className+"_set("+args.join(",")+",v){");
	  if(useGetters) {
	    code.push("return this.data.set("+index_str+",v)}");
	  } else {
	    code.push("return this.data["+index_str+"]=v}");
	  }

	  //view.get(i0, ...):
	  code.push("proto.get=function "+className+"_get("+args.join(",")+"){");
	  if(useGetters) {
	    code.push("return this.data.get("+index_str+")}");
	  } else {
	    code.push("return this.data["+index_str+"]}");
	  }

	  //view.index:
	  code.push(
	    "proto.index=function "+className+"_index(", args.join(), "){return "+index_str+"}");

	  //view.hi():
	  code.push("proto.hi=function "+className+"_hi("+args.join(",")+"){return new "+className+"(this.data,"+
	    indices.map(function(i) {
	      return ["(typeof i",i,"!=='number'||i",i,"<0)?this.shape[", i, "]:i", i,"|0"].join("")
	    }).join(",")+","+
	    indices.map(function(i) {
	      return "this.stride["+i + "]"
	    }).join(",")+",this.offset)}");

	  //view.lo():
	  var a_vars = indices.map(function(i) { return "a"+i+"=this.shape["+i+"]" });
	  var c_vars = indices.map(function(i) { return "c"+i+"=this.stride["+i+"]" });
	  code.push("proto.lo=function "+className+"_lo("+args.join(",")+"){var b=this.offset,d=0,"+a_vars.join(",")+","+c_vars.join(","));
	  for(var i=0; i<dimension; ++i) {
	    code.push(
	"if(typeof i"+i+"==='number'&&i"+i+">=0){\
	d=i"+i+"|0;\
	b+=c"+i+"*d;\
	a"+i+"-=d}");
	  }
	  code.push("return new "+className+"(this.data,"+
	    indices.map(function(i) {
	      return "a"+i
	    }).join(",")+","+
	    indices.map(function(i) {
	      return "c"+i
	    }).join(",")+",b)}");

	  //view.step():
	  code.push("proto.step=function "+className+"_step("+args.join(",")+"){var "+
	    indices.map(function(i) {
	      return "a"+i+"=this.shape["+i+"]"
	    }).join(",")+","+
	    indices.map(function(i) {
	      return "b"+i+"=this.stride["+i+"]"
	    }).join(",")+",c=this.offset,d=0,ceil=Math.ceil");
	  for(var i=0; i<dimension; ++i) {
	    code.push(
	"if(typeof i"+i+"==='number'){\
	d=i"+i+"|0;\
	if(d<0){\
	c+=b"+i+"*(a"+i+"-1);\
	a"+i+"=ceil(-a"+i+"/d)\
	}else{\
	a"+i+"=ceil(a"+i+"/d)\
	}\
	b"+i+"*=d\
	}");
	  }
	  code.push("return new "+className+"(this.data,"+
	    indices.map(function(i) {
	      return "a" + i
	    }).join(",")+","+
	    indices.map(function(i) {
	      return "b" + i
	    }).join(",")+",c)}");

	  //view.transpose():
	  var tShape = new Array(dimension);
	  var tStride = new Array(dimension);
	  for(var i=0; i<dimension; ++i) {
	    tShape[i] = "a[i"+i+"]";
	    tStride[i] = "b[i"+i+"]";
	  }
	  code.push("proto.transpose=function "+className+"_transpose("+args+"){"+
	    args.map(function(n,idx) { return n + "=(" + n + "===undefined?" + idx + ":" + n + "|0)"}).join(";"),
	    "var a=this.shape,b=this.stride;return new "+className+"(this.data,"+tShape.join(",")+","+tStride.join(",")+",this.offset)}");

	  //view.pick():
	  code.push("proto.pick=function "+className+"_pick("+args+"){var a=[],b=[],c=this.offset");
	  for(var i=0; i<dimension; ++i) {
	    code.push("if(typeof i"+i+"==='number'&&i"+i+">=0){c=(c+this.stride["+i+"]*i"+i+")|0}else{a.push(this.shape["+i+"]);b.push(this.stride["+i+"])}");
	  }
	  code.push("var ctor=CTOR_LIST[a.length+1];return ctor(this.data,a,b,c)}");

	  //Add return statement
	  code.push("return function construct_"+className+"(data,shape,stride,offset){return new "+className+"(data,"+
	    indices.map(function(i) {
	      return "shape["+i+"]"
	    }).join(",")+","+
	    indices.map(function(i) {
	      return "stride["+i+"]"
	    }).join(",")+",offset)}");

	  //Compile procedure
	  var procedure = new Function("CTOR_LIST", "ORDER", code.join("\n"));
	  return procedure(CACHED_CONSTRUCTORS[dtype], order)
	}

	function arrayDType(data) {
	  if(isBuffer(data)) {
	    return "buffer"
	  }
	  if(hasTypedArrays) {
	    switch(Object.prototype.toString.call(data)) {
	      case "[object Float64Array]":
	        return "float64"
	      case "[object Float32Array]":
	        return "float32"
	      case "[object Int8Array]":
	        return "int8"
	      case "[object Int16Array]":
	        return "int16"
	      case "[object Int32Array]":
	        return "int32"
	      case "[object Uint8Array]":
	        return "uint8"
	      case "[object Uint16Array]":
	        return "uint16"
	      case "[object Uint32Array]":
	        return "uint32"
	      case "[object Uint8ClampedArray]":
	        return "uint8_clamped"
	      case "[object BigInt64Array]":
	        return "bigint64"
	      case "[object BigUint64Array]":
	        return "biguint64"
	    }
	  }
	  if(Array.isArray(data)) {
	    return "array"
	  }
	  return "generic"
	}

	var CACHED_CONSTRUCTORS = {
	  "float32":[],
	  "float64":[],
	  "int8":[],
	  "int16":[],
	  "int32":[],
	  "uint8":[],
	  "uint16":[],
	  "uint32":[],
	  "array":[],
	  "uint8_clamped":[],
	  "bigint64": [],
	  "biguint64": [],
	  "buffer":[],
	  "generic":[]
	}

	;
	function wrappedNDArrayCtor(data, shape, stride, offset) {
	  if(data === undefined) {
	    var ctor = CACHED_CONSTRUCTORS.array[0];
	    return ctor([])
	  } else if(typeof data === "number") {
	    data = [data];
	  }
	  if(shape === undefined) {
	    shape = [ data.length ];
	  }
	  var d = shape.length;
	  if(stride === undefined) {
	    stride = new Array(d);
	    for(var i=d-1, sz=1; i>=0; --i) {
	      stride[i] = sz;
	      sz *= shape[i];
	    }
	  }
	  if(offset === undefined) {
	    offset = 0;
	    for(var i=0; i<d; ++i) {
	      if(stride[i] < 0) {
	        offset -= (shape[i]-1)*stride[i];
	      }
	    }
	  }
	  var dtype = arrayDType(data);
	  var ctor_list = CACHED_CONSTRUCTORS[dtype];
	  while(ctor_list.length <= d+1) {
	    ctor_list.push(compileConstructor(dtype, ctor_list.length-1));
	  }
	  var ctor = ctor_list[d+1];
	  return ctor(data, shape, stride, offset)
	}

	ndarray$1 = wrappedNDArrayCtor;
	return ndarray$1;
}

var uniq;
var hasRequiredUniq;

function requireUniq () {
	if (hasRequiredUniq) return uniq;
	hasRequiredUniq = 1;

	function unique_pred(list, compare) {
	  var ptr = 1
	    , len = list.length
	    , a=list[0], b=list[0];
	  for(var i=1; i<len; ++i) {
	    b = a;
	    a = list[i];
	    if(compare(a, b)) {
	      if(i === ptr) {
	        ptr++;
	        continue
	      }
	      list[ptr++] = a;
	    }
	  }
	  list.length = ptr;
	  return list
	}

	function unique_eq(list) {
	  var ptr = 1
	    , len = list.length
	    , a=list[0], b = list[0];
	  for(var i=1; i<len; ++i, b=a) {
	    b = a;
	    a = list[i];
	    if(a !== b) {
	      if(i === ptr) {
	        ptr++;
	        continue
	      }
	      list[ptr++] = a;
	    }
	  }
	  list.length = ptr;
	  return list
	}

	function unique(list, compare, sorted) {
	  if(list.length === 0) {
	    return list
	  }
	  if(compare) {
	    if(!sorted) {
	      list.sort(compare);
	    }
	    return unique_pred(list, compare)
	  }
	  if(!sorted) {
	    list.sort();
	  }
	  return unique_eq(list)
	}

	uniq = unique;
	return uniq;
}

var compile;
var hasRequiredCompile;

function requireCompile () {
	if (hasRequiredCompile) return compile;
	hasRequiredCompile = 1;

	var uniq = requireUniq();

	function innerFill(order, proc, body) {
	  var dimension = order.length
	    , nargs = proc.arrayArgs.length
	    , has_index = proc.indexArgs.length>0
	    , code = []
	    , vars = []
	    , idx=0, pidx=0, i, j;
	  for(i=0; i<dimension; ++i) {
	    vars.push(["i",i,"=0"].join(""));
	  }
	  //Compute scan deltas
	  for(j=0; j<nargs; ++j) {
	    for(i=0; i<dimension; ++i) {
	      pidx = idx;
	      idx = order[i];
	      if(i === 0) {
	        vars.push(["d",j,"s",i,"=t",j,"[",idx,"]"].join(""));
	      } else {
	        vars.push(["d",j,"s",i,"=(t",j,"[",idx,"]-s",pidx,"*t",j,"[",pidx,"])"].join(""));
	      }
	    }
	  }
	  code.push("var " + vars.join(","));
	  //Scan loop
	  for(i=dimension-1; i>=0; --i) {
	    idx = order[i];
	    code.push(["for(i",i,"=0;i",i,"<s",idx,";++i",i,"){"].join(""));
	  }
	  //Push body of inner loop
	  code.push(body);
	  //Advance scan pointers
	  for(i=0; i<dimension; ++i) {
	    pidx = idx;
	    idx = order[i];
	    for(j=0; j<nargs; ++j) {
	      code.push(["p",j,"+=d",j,"s",i].join(""));
	    }
	    if(has_index) {
	      if(i > 0) {
	        code.push(["index[",pidx,"]-=s",pidx].join(""));
	      }
	      code.push(["++index[",idx,"]"].join(""));
	    }
	    code.push("}");
	  }
	  return code.join("\n")
	}

	function outerFill(matched, order, proc, body) {
	  var dimension = order.length
	    , nargs = proc.arrayArgs.length
	    , blockSize = proc.blockSize
	    , has_index = proc.indexArgs.length > 0
	    , code = [];
	  for(var i=0; i<nargs; ++i) {
	    code.push(["var offset",i,"=p",i].join(""));
	  }
	  //Generate matched loops
	  for(var i=matched; i<dimension; ++i) {
	    code.push(["for(var j"+i+"=SS[", order[i], "]|0;j", i, ">0;){"].join(""));
	    code.push(["if(j",i,"<",blockSize,"){"].join(""));
	    code.push(["s",order[i],"=j",i].join(""));
	    code.push(["j",i,"=0"].join(""));
	    code.push(["}else{s",order[i],"=",blockSize].join(""));
	    code.push(["j",i,"-=",blockSize,"}"].join(""));
	    if(has_index) {
	      code.push(["index[",order[i],"]=j",i].join(""));
	    }
	  }
	  for(var i=0; i<nargs; ++i) {
	    var indexStr = ["offset"+i];
	    for(var j=matched; j<dimension; ++j) {
	      indexStr.push(["j",j,"*t",i,"[",order[j],"]"].join(""));
	    }
	    code.push(["p",i,"=(",indexStr.join("+"),")"].join(""));
	  }
	  code.push(innerFill(order, proc, body));
	  for(var i=matched; i<dimension; ++i) {
	    code.push("}");
	  }
	  return code.join("\n")
	}

	//Count the number of compatible inner orders
	function countMatches(orders) {
	  var matched = 0, dimension = orders[0].length;
	  while(matched < dimension) {
	    for(var j=1; j<orders.length; ++j) {
	      if(orders[j][matched] !== orders[0][matched]) {
	        return matched
	      }
	    }
	    ++matched;
	  }
	  return matched
	}

	//Processes a block according to the given data types
	function processBlock(block, proc, dtypes) {
	  var code = block.body;
	  var pre = [];
	  var post = [];
	  for(var i=0; i<block.args.length; ++i) {
	    var carg = block.args[i];
	    if(carg.count <= 0) {
	      continue
	    }
	    var re = new RegExp(carg.name, "g");
	    var ptrStr = "";
	    var arrNum = proc.arrayArgs.indexOf(i);
	    switch(proc.argTypes[i]) {
	      case "offset":
	        var offArgIndex = proc.offsetArgIndex.indexOf(i);
	        var offArg = proc.offsetArgs[offArgIndex];
	        arrNum = offArg.array;
	        ptrStr = "+q" + offArgIndex;
	      case "array":
	        ptrStr = "p" + arrNum + ptrStr;
	        var localStr = "l" + i;
	        var arrStr = "a" + arrNum;
	        if(carg.count === 1) {
	          if(dtypes[arrNum] === "generic") {
	            if(carg.lvalue) {
	              pre.push(["var ", localStr, "=", arrStr, ".get(", ptrStr, ")"].join(""));
	              code = code.replace(re, localStr);
	              post.push([arrStr, ".set(", ptrStr, ",", localStr,")"].join(""));
	            } else {
	              code = code.replace(re, [arrStr, ".get(", ptrStr, ")"].join(""));
	            }
	          } else {
	            code = code.replace(re, [arrStr, "[", ptrStr, "]"].join(""));
	          }
	        } else if(dtypes[arrNum] === "generic") {
	          pre.push(["var ", localStr, "=", arrStr, ".get(", ptrStr, ")"].join(""));
	          code = code.replace(re, localStr);
	          if(carg.lvalue) {
	            post.push([arrStr, ".set(", ptrStr, ",", localStr,")"].join(""));
	          }
	        } else {
	          pre.push(["var ", localStr, "=", arrStr, "[", ptrStr, "]"].join(""));
	          code = code.replace(re, localStr);
	          if(carg.lvalue) {
	            post.push([arrStr, "[", ptrStr, "]=", localStr].join(""));
	          }
	        }
	      break
	      case "scalar":
	        code = code.replace(re, "Y" + proc.scalarArgs.indexOf(i));
	      break
	      case "index":
	        code = code.replace(re, "index");
	      break
	      case "shape":
	        code = code.replace(re, "shape");
	      break
	    }
	  }
	  return [pre.join("\n"), code, post.join("\n")].join("\n").trim()
	}

	function typeSummary(dtypes) {
	  var summary = new Array(dtypes.length);
	  var allEqual = true;
	  for(var i=0; i<dtypes.length; ++i) {
	    var t = dtypes[i];
	    var digits = t.match(/\d+/);
	    if(!digits) {
	      digits = "";
	    } else {
	      digits = digits[0];
	    }
	    if(t.charAt(0) === 0) {
	      summary[i] = "u" + t.charAt(1) + digits;
	    } else {
	      summary[i] = t.charAt(0) + digits;
	    }
	    if(i > 0) {
	      allEqual = allEqual && summary[i] === summary[i-1];
	    }
	  }
	  if(allEqual) {
	    return summary[0]
	  }
	  return summary.join("")
	}

	//Generates a cwise operator
	function generateCWiseOp(proc, typesig) {

	  //Compute dimension
	  var dimension = typesig[1].length|0;
	  var orders = new Array(proc.arrayArgs.length);
	  var dtypes = new Array(proc.arrayArgs.length);

	  //First create arguments for procedure
	  var arglist = ["SS"];
	  var code = ["'use strict'"];
	  var vars = [];
	  
	  for(var j=0; j<dimension; ++j) {
	    vars.push(["s", j, "=SS[", j, "]"].join(""));
	  }
	  for(var i=0; i<proc.arrayArgs.length; ++i) {
	    arglist.push("a"+i);
	    arglist.push("t"+i);
	    arglist.push("p"+i);
	    dtypes[i] = typesig[2*i];
	    orders[i] = typesig[2*i+1];
	  }
	  for(var i=0; i<proc.scalarArgs.length; ++i) {
	    arglist.push("Y" + i);
	  }
	  if(proc.shapeArgs.length > 0) {
	    vars.push("shape=SS.slice(0)");
	  }
	  if(proc.indexArgs.length > 0) {
	    var zeros = new Array(dimension);
	    for(var i=0; i<dimension; ++i) {
	      zeros[i] = "0";
	    }
	    vars.push(["index=[", zeros.join(","), "]"].join(""));
	  }
	  for(var i=0; i<proc.offsetArgs.length; ++i) {
	    var off_arg = proc.offsetArgs[i];
	    var init_string = [];
	    for(var j=0; j<off_arg.offset.length; ++j) {
	      if(off_arg.offset[j] === 0) {
	        continue
	      } else if(off_arg.offset[j] === 1) {
	        init_string.push(["t", off_arg.array, "[", j, "]"].join(""));      
	      } else {
	        init_string.push([off_arg.offset[j], "*t", off_arg.array, "[", j, "]"].join(""));
	      }
	    }
	    if(init_string.length === 0) {
	      vars.push("q" + i + "=0");
	    } else {
	      vars.push(["q", i, "=(", init_string.join("+"),")|0"].join(""));
	    }
	  }

	  //Prepare this variables
	  var thisVars = uniq([].concat(proc.pre.thisVars)
	                      .concat(proc.body.thisVars)
	                      .concat(proc.post.thisVars));
	  vars = vars.concat(thisVars);
	  code.push("var " + vars.join(","));
	  for(var i=0; i<proc.arrayArgs.length; ++i) {
	    code.push("p"+i+"|=0");
	  }
	  
	  //Inline prelude
	  if(proc.pre.body.length > 3) {
	    code.push(processBlock(proc.pre, proc, dtypes));
	  }

	  //Process body
	  var body = processBlock(proc.body, proc, dtypes);
	  var matched = countMatches(orders);
	  if(matched < dimension) {
	    code.push(outerFill(matched, orders[0], proc, body));
	  } else {
	    code.push(innerFill(orders[0], proc, body));
	  }

	  //Inline epilog
	  if(proc.post.body.length > 3) {
	    code.push(processBlock(proc.post, proc, dtypes));
	  }
	  
	  if(proc.debug) {
	    console.log("Generated cwise routine for ", typesig, ":\n\n", code.join("\n"));
	  }
	  
	  var loopName = [(proc.funcName||"unnamed"), "_cwise_loop_", orders[0].join("s"),"m",matched,typeSummary(dtypes)].join("");
	  var f = new Function(["function ",loopName,"(", arglist.join(","),"){", code.join("\n"),"} return ", loopName].join(""));
	  return f()
	}
	compile = generateCWiseOp;
	return compile;
}

var thunk;
var hasRequiredThunk;

function requireThunk () {
	if (hasRequiredThunk) return thunk;
	hasRequiredThunk = 1;

	var compile = requireCompile();

	function createThunk(proc) {
	  var code = ["'use strict'", "var CACHED={}"];
	  var vars = [];
	  var thunkName = proc.funcName + "_cwise_thunk";
	  
	  //Build thunk
	  code.push(["return function ", thunkName, "(", proc.shimArgs.join(","), "){"].join(""));
	  var typesig = [];
	  var string_typesig = [];
	  var proc_args = [["array",proc.arrayArgs[0],".shape"].join("")];
	  for(var i=0; i<proc.arrayArgs.length; ++i) {
	    var j = proc.arrayArgs[i];
	    vars.push(["t", j, "=array", j, ".dtype,",
	               "r", j, "=array", j, ".order"].join(""));
	    typesig.push("t" + j);
	    typesig.push("r" + j);
	    string_typesig.push("t"+j);
	    string_typesig.push("r"+j+".join()");
	    proc_args.push("array" + j + ".data");
	    proc_args.push("array" + j + ".stride");
	    proc_args.push("array" + j + ".offset|0");
	  }
	  for(var i=0; i<proc.scalarArgs.length; ++i) {
	    proc_args.push("scalar" + proc.scalarArgs[i]);
	  }
	  vars.push(["type=[", string_typesig.join(","), "].join()"].join(""));
	  vars.push("proc=CACHED[type]");
	  code.push("var " + vars.join(","));
	  
	  code.push(["if(!proc){",
	             "CACHED[type]=proc=compile([", typesig.join(","), "])}",
	             "return proc(", proc_args.join(","), ")}"].join(""));

	  if(proc.debug) {
	    console.log("Generated thunk:", code.join("\n"));
	  }
	  
	  //Compile thunk
	  var thunk = new Function("compile", code.join("\n"));
	  return thunk(compile.bind(undefined, proc))
	}

	thunk = createThunk;
	return thunk;
}

var compiler;
var hasRequiredCompiler;

function requireCompiler () {
	if (hasRequiredCompiler) return compiler;
	hasRequiredCompiler = 1;

	var createThunk = requireThunk();

	function Procedure() {
	  this.argTypes = [];
	  this.shimArgs = [];
	  this.arrayArgs = [];
	  this.scalarArgs = [];
	  this.offsetArgs = [];
	  this.offsetArgIndex = [];
	  this.indexArgs = [];
	  this.shapeArgs = [];
	  this.funcName = "";
	  this.pre = null;
	  this.body = null;
	  this.post = null;
	  this.debug = false;
	}

	function compileCwise(user_args) {
	  //Create procedure
	  var proc = new Procedure();
	  
	  //Parse blocks
	  proc.pre    = user_args.pre;
	  proc.body   = user_args.body;
	  proc.post   = user_args.post;

	  //Parse arguments
	  var proc_args = user_args.args.slice(0);
	  proc.argTypes = proc_args.slice(0);
	  for(var i=0; i<proc_args.length; ++i) {
	    var arg_type = proc_args[i];
	    if(arg_type === "array") {
	      proc.arrayArgs.push(i);
	      proc.shimArgs.push("array" + i);
	      if(i < proc.pre.args.length && proc.pre.args[i].count>0) {
	        throw new Error("cwise: pre() block may not reference array args")
	      }
	      if(i < proc.post.args.length && proc.post.args[i].count>0) {
	        throw new Error("cwise: post() block may not reference array args")
	      }
	    } else if(arg_type === "scalar") {
	      proc.scalarArgs.push(i);
	      proc.shimArgs.push("scalar" + i);
	    } else if(arg_type === "index") {
	      proc.indexArgs.push(i);
	      if(i < proc.pre.args.length && proc.pre.args[i].count > 0) {
	        throw new Error("cwise: pre() block may not reference array index")
	      }
	      if(i < proc.body.args.length && proc.body.args[i].lvalue) {
	        throw new Error("cwise: body() block may not write to array index")
	      }
	      if(i < proc.post.args.length && proc.post.args[i].count > 0) {
	        throw new Error("cwise: post() block may not reference array index")
	      }
	    } else if(arg_type === "shape") {
	      proc.shapeArgs.push(i);
	      if(i < proc.pre.args.length && proc.pre.args[i].lvalue) {
	        throw new Error("cwise: pre() block may not write to array shape")
	      }
	      if(i < proc.body.args.length && proc.body.args[i].lvalue) {
	        throw new Error("cwise: body() block may not write to array shape")
	      }
	      if(i < proc.post.args.length && proc.post.args[i].lvalue) {
	        throw new Error("cwise: post() block may not write to array shape")
	      }
	    } else if(typeof arg_type === "object" && arg_type.offset) {
	      proc.argTypes[i] = "offset";
	      proc.offsetArgs.push({ array: arg_type.array, offset:arg_type.offset });
	      proc.offsetArgIndex.push(i);
	    } else {
	      throw new Error("cwise: Unknown argument type " + proc_args[i])
	    }
	  }
	  
	  //Make sure at least one array argument was specified
	  if(proc.arrayArgs.length <= 0) {
	    throw new Error("cwise: No array arguments specified")
	  }
	  
	  //Make sure arguments are correct
	  if(proc.pre.args.length > proc_args.length) {
	    throw new Error("cwise: Too many arguments in pre() block")
	  }
	  if(proc.body.args.length > proc_args.length) {
	    throw new Error("cwise: Too many arguments in body() block")
	  }
	  if(proc.post.args.length > proc_args.length) {
	    throw new Error("cwise: Too many arguments in post() block")
	  }

	  //Check debug flag
	  proc.debug = !!user_args.printCode || !!user_args.debug;
	  
	  //Retrieve name
	  proc.funcName = user_args.funcName || "cwise";
	  
	  //Read in block size
	  proc.blockSize = user_args.blockSize || 64;

	  return createThunk(proc)
	}

	compiler = compileCwise;
	return compiler;
}

var pool$3 = {};

var twiddle$1 = {};

/**
 * Bit twiddling hacks for JavaScript.
 *
 * Author: Mikola Lysenko
 *
 * Ported from Stanford bit twiddling hack library:
 *    http://graphics.stanford.edu/~seander/bithacks.html
 */

var hasRequiredTwiddle$1;

function requireTwiddle$1 () {
	if (hasRequiredTwiddle$1) return twiddle$1;
	hasRequiredTwiddle$1 = 1;

	//Number of bits in an integer
	var INT_BITS = 32;

	//Constants
	twiddle$1.INT_BITS  = INT_BITS;
	twiddle$1.INT_MAX   =  0x7fffffff;
	twiddle$1.INT_MIN   = -1<<(INT_BITS-1);

	//Returns -1, 0, +1 depending on sign of x
	twiddle$1.sign = function(v) {
	  return (v > 0) - (v < 0);
	};

	//Computes absolute value of integer
	twiddle$1.abs = function(v) {
	  var mask = v >> (INT_BITS-1);
	  return (v ^ mask) - mask;
	};

	//Computes minimum of integers x and y
	twiddle$1.min = function(x, y) {
	  return y ^ ((x ^ y) & -(x < y));
	};

	//Computes maximum of integers x and y
	twiddle$1.max = function(x, y) {
	  return x ^ ((x ^ y) & -(x < y));
	};

	//Checks if a number is a power of two
	twiddle$1.isPow2 = function(v) {
	  return !(v & (v-1)) && (!!v);
	};

	//Computes log base 2 of v
	twiddle$1.log2 = function(v) {
	  var r, shift;
	  r =     (v > 0xFFFF) << 4; v >>>= r;
	  shift = (v > 0xFF  ) << 3; v >>>= shift; r |= shift;
	  shift = (v > 0xF   ) << 2; v >>>= shift; r |= shift;
	  shift = (v > 0x3   ) << 1; v >>>= shift; r |= shift;
	  return r | (v >> 1);
	};

	//Computes log base 10 of v
	twiddle$1.log10 = function(v) {
	  return  (v >= 1000000000) ? 9 : (v >= 100000000) ? 8 : (v >= 10000000) ? 7 :
	          (v >= 1000000) ? 6 : (v >= 100000) ? 5 : (v >= 10000) ? 4 :
	          (v >= 1000) ? 3 : (v >= 100) ? 2 : (v >= 10) ? 1 : 0;
	};

	//Counts number of bits
	twiddle$1.popCount = function(v) {
	  v = v - ((v >>> 1) & 0x55555555);
	  v = (v & 0x33333333) + ((v >>> 2) & 0x33333333);
	  return ((v + (v >>> 4) & 0xF0F0F0F) * 0x1010101) >>> 24;
	};

	//Counts number of trailing zeros
	function countTrailingZeros(v) {
	  var c = 32;
	  v &= -v;
	  if (v) c--;
	  if (v & 0x0000FFFF) c -= 16;
	  if (v & 0x00FF00FF) c -= 8;
	  if (v & 0x0F0F0F0F) c -= 4;
	  if (v & 0x33333333) c -= 2;
	  if (v & 0x55555555) c -= 1;
	  return c;
	}
	twiddle$1.countTrailingZeros = countTrailingZeros;

	//Rounds to next power of 2
	twiddle$1.nextPow2 = function(v) {
	  v += v === 0;
	  --v;
	  v |= v >>> 1;
	  v |= v >>> 2;
	  v |= v >>> 4;
	  v |= v >>> 8;
	  v |= v >>> 16;
	  return v + 1;
	};

	//Rounds down to previous power of 2
	twiddle$1.prevPow2 = function(v) {
	  v |= v >>> 1;
	  v |= v >>> 2;
	  v |= v >>> 4;
	  v |= v >>> 8;
	  v |= v >>> 16;
	  return v - (v>>>1);
	};

	//Computes parity of word
	twiddle$1.parity = function(v) {
	  v ^= v >>> 16;
	  v ^= v >>> 8;
	  v ^= v >>> 4;
	  v &= 0xf;
	  return (0x6996 >>> v) & 1;
	};

	var REVERSE_TABLE = new Array(256);

	(function(tab) {
	  for(var i=0; i<256; ++i) {
	    var v = i, r = i, s = 7;
	    for (v >>>= 1; v; v >>>= 1) {
	      r <<= 1;
	      r |= v & 1;
	      --s;
	    }
	    tab[i] = (r << s) & 0xff;
	  }
	})(REVERSE_TABLE);

	//Reverse bits in a 32 bit word
	twiddle$1.reverse = function(v) {
	  return  (REVERSE_TABLE[ v         & 0xff] << 24) |
	          (REVERSE_TABLE[(v >>> 8)  & 0xff] << 16) |
	          (REVERSE_TABLE[(v >>> 16) & 0xff] << 8)  |
	           REVERSE_TABLE[(v >>> 24) & 0xff];
	};

	//Interleave bits of 2 coordinates with 16 bits.  Useful for fast quadtree codes
	twiddle$1.interleave2 = function(x, y) {
	  x &= 0xFFFF;
	  x = (x | (x << 8)) & 0x00FF00FF;
	  x = (x | (x << 4)) & 0x0F0F0F0F;
	  x = (x | (x << 2)) & 0x33333333;
	  x = (x | (x << 1)) & 0x55555555;

	  y &= 0xFFFF;
	  y = (y | (y << 8)) & 0x00FF00FF;
	  y = (y | (y << 4)) & 0x0F0F0F0F;
	  y = (y | (y << 2)) & 0x33333333;
	  y = (y | (y << 1)) & 0x55555555;

	  return x | (y << 1);
	};

	//Extracts the nth interleaved component
	twiddle$1.deinterleave2 = function(v, n) {
	  v = (v >>> n) & 0x55555555;
	  v = (v | (v >>> 1))  & 0x33333333;
	  v = (v | (v >>> 2))  & 0x0F0F0F0F;
	  v = (v | (v >>> 4))  & 0x00FF00FF;
	  v = (v | (v >>> 16)) & 0x000FFFF;
	  return (v << 16) >> 16;
	};


	//Interleave bits of 3 coordinates, each with 10 bits.  Useful for fast octree codes
	twiddle$1.interleave3 = function(x, y, z) {
	  x &= 0x3FF;
	  x  = (x | (x<<16)) & 4278190335;
	  x  = (x | (x<<8))  & 251719695;
	  x  = (x | (x<<4))  & 3272356035;
	  x  = (x | (x<<2))  & 1227133513;

	  y &= 0x3FF;
	  y  = (y | (y<<16)) & 4278190335;
	  y  = (y | (y<<8))  & 251719695;
	  y  = (y | (y<<4))  & 3272356035;
	  y  = (y | (y<<2))  & 1227133513;
	  x |= (y << 1);
	  
	  z &= 0x3FF;
	  z  = (z | (z<<16)) & 4278190335;
	  z  = (z | (z<<8))  & 251719695;
	  z  = (z | (z<<4))  & 3272356035;
	  z  = (z | (z<<2))  & 1227133513;
	  
	  return x | (z << 2);
	};

	//Extracts nth interleaved component of a 3-tuple
	twiddle$1.deinterleave3 = function(v, n) {
	  v = (v >>> n)       & 1227133513;
	  v = (v | (v>>>2))   & 3272356035;
	  v = (v | (v>>>4))   & 251719695;
	  v = (v | (v>>>8))   & 4278190335;
	  v = (v | (v>>>16))  & 0x3FF;
	  return (v<<22)>>22;
	};

	//Computes next combination in colexicographic order (this is mistakenly called nextPermutation on the bit twiddling hacks page)
	twiddle$1.nextCombination = function(v) {
	  var t = v | (v - 1);
	  return (t + 1) | (((~t & -~t) - 1) >>> (countTrailingZeros(v) + 1));
	};
	return twiddle$1;
}

var dup$1;
var hasRequiredDup$1;

function requireDup$1 () {
	if (hasRequiredDup$1) return dup$1;
	hasRequiredDup$1 = 1;

	function dupe_array(count, value, i) {
	  var c = count[i]|0;
	  if(c <= 0) {
	    return []
	  }
	  var result = new Array(c), j;
	  if(i === count.length-1) {
	    for(j=0; j<c; ++j) {
	      result[j] = value;
	    }
	  } else {
	    for(j=0; j<c; ++j) {
	      result[j] = dupe_array(count, value, i+1);
	    }
	  }
	  return result
	}

	function dupe_number(count, value) {
	  var result, i;
	  result = new Array(count);
	  for(i=0; i<count; ++i) {
	    result[i] = value;
	  }
	  return result
	}

	function dupe(count, value) {
	  if(typeof value === "undefined") {
	    value = 0;
	  }
	  switch(typeof count) {
	    case "number":
	      if(count > 0) {
	        return dupe_number(count|0, value)
	      }
	    break
	    case "object":
	      if(typeof (count.length) === "number") {
	        return dupe_array(count, value, 0)
	      }
	    break
	  }
	  return []
	}

	dup$1 = dupe;
	return dup$1;
}

var hasRequiredPool$2;

function requirePool$2 () {
	if (hasRequiredPool$2) return pool$3;
	hasRequiredPool$2 = 1;

	var bits = requireTwiddle$1();
	var dup = requireDup$1();
	var Buffer = require$$2.Buffer;

	//Legacy pool support
	if(!commonjsGlobal.__TYPEDARRAY_POOL) {
	  commonjsGlobal.__TYPEDARRAY_POOL = {
	      UINT8     : dup([32, 0])
	    , UINT16    : dup([32, 0])
	    , UINT32    : dup([32, 0])
	    , BIGUINT64 : dup([32, 0])
	    , INT8      : dup([32, 0])
	    , INT16     : dup([32, 0])
	    , INT32     : dup([32, 0])
	    , BIGINT64  : dup([32, 0])
	    , FLOAT     : dup([32, 0])
	    , DOUBLE    : dup([32, 0])
	    , DATA      : dup([32, 0])
	    , UINT8C    : dup([32, 0])
	    , BUFFER    : dup([32, 0])
	  };
	}

	var hasUint8C = (typeof Uint8ClampedArray) !== 'undefined';
	var hasBigUint64 = (typeof BigUint64Array) !== 'undefined';
	var hasBigInt64 = (typeof BigInt64Array) !== 'undefined';
	var POOL = commonjsGlobal.__TYPEDARRAY_POOL;

	//Upgrade pool
	if(!POOL.UINT8C) {
	  POOL.UINT8C = dup([32, 0]);
	}
	if(!POOL.BIGUINT64) {
	  POOL.BIGUINT64 = dup([32, 0]);
	}
	if(!POOL.BIGINT64) {
	  POOL.BIGINT64 = dup([32, 0]);
	}
	if(!POOL.BUFFER) {
	  POOL.BUFFER = dup([32, 0]);
	}

	//New technique: Only allocate from ArrayBufferView and Buffer
	var DATA    = POOL.DATA
	  , BUFFER  = POOL.BUFFER;

	pool$3.free = function free(array) {
	  if(Buffer.isBuffer(array)) {
	    BUFFER[bits.log2(array.length)].push(array);
	  } else {
	    if(Object.prototype.toString.call(array) !== '[object ArrayBuffer]') {
	      array = array.buffer;
	    }
	    if(!array) {
	      return
	    }
	    var n = array.length || array.byteLength;
	    var log_n = bits.log2(n)|0;
	    DATA[log_n].push(array);
	  }
	};

	function freeArrayBuffer(buffer) {
	  if(!buffer) {
	    return
	  }
	  var n = buffer.length || buffer.byteLength;
	  var log_n = bits.log2(n);
	  DATA[log_n].push(buffer);
	}

	function freeTypedArray(array) {
	  freeArrayBuffer(array.buffer);
	}

	pool$3.freeUint8 =
	pool$3.freeUint16 =
	pool$3.freeUint32 =
	pool$3.freeBigUint64 =
	pool$3.freeInt8 =
	pool$3.freeInt16 =
	pool$3.freeInt32 =
	pool$3.freeBigInt64 =
	pool$3.freeFloat32 = 
	pool$3.freeFloat =
	pool$3.freeFloat64 = 
	pool$3.freeDouble = 
	pool$3.freeUint8Clamped = 
	pool$3.freeDataView = freeTypedArray;

	pool$3.freeArrayBuffer = freeArrayBuffer;

	pool$3.freeBuffer = function freeBuffer(array) {
	  BUFFER[bits.log2(array.length)].push(array);
	};

	pool$3.malloc = function malloc(n, dtype) {
	  if(dtype === undefined || dtype === 'arraybuffer') {
	    return mallocArrayBuffer(n)
	  } else {
	    switch(dtype) {
	      case 'uint8':
	        return mallocUint8(n)
	      case 'uint16':
	        return mallocUint16(n)
	      case 'uint32':
	        return mallocUint32(n)
	      case 'int8':
	        return mallocInt8(n)
	      case 'int16':
	        return mallocInt16(n)
	      case 'int32':
	        return mallocInt32(n)
	      case 'float':
	      case 'float32':
	        return mallocFloat(n)
	      case 'double':
	      case 'float64':
	        return mallocDouble(n)
	      case 'uint8_clamped':
	        return mallocUint8Clamped(n)
	      case 'bigint64':
	        return mallocBigInt64(n)
	      case 'biguint64':
	        return mallocBigUint64(n)
	      case 'buffer':
	        return mallocBuffer(n)
	      case 'data':
	      case 'dataview':
	        return mallocDataView(n)

	      default:
	        return null
	    }
	  }
	  return null
	};

	function mallocArrayBuffer(n) {
	  var n = bits.nextPow2(n);
	  var log_n = bits.log2(n);
	  var d = DATA[log_n];
	  if(d.length > 0) {
	    return d.pop()
	  }
	  return new ArrayBuffer(n)
	}
	pool$3.mallocArrayBuffer = mallocArrayBuffer;

	function mallocUint8(n) {
	  return new Uint8Array(mallocArrayBuffer(n), 0, n)
	}
	pool$3.mallocUint8 = mallocUint8;

	function mallocUint16(n) {
	  return new Uint16Array(mallocArrayBuffer(2*n), 0, n)
	}
	pool$3.mallocUint16 = mallocUint16;

	function mallocUint32(n) {
	  return new Uint32Array(mallocArrayBuffer(4*n), 0, n)
	}
	pool$3.mallocUint32 = mallocUint32;

	function mallocInt8(n) {
	  return new Int8Array(mallocArrayBuffer(n), 0, n)
	}
	pool$3.mallocInt8 = mallocInt8;

	function mallocInt16(n) {
	  return new Int16Array(mallocArrayBuffer(2*n), 0, n)
	}
	pool$3.mallocInt16 = mallocInt16;

	function mallocInt32(n) {
	  return new Int32Array(mallocArrayBuffer(4*n), 0, n)
	}
	pool$3.mallocInt32 = mallocInt32;

	function mallocFloat(n) {
	  return new Float32Array(mallocArrayBuffer(4*n), 0, n)
	}
	pool$3.mallocFloat32 = pool$3.mallocFloat = mallocFloat;

	function mallocDouble(n) {
	  return new Float64Array(mallocArrayBuffer(8*n), 0, n)
	}
	pool$3.mallocFloat64 = pool$3.mallocDouble = mallocDouble;

	function mallocUint8Clamped(n) {
	  if(hasUint8C) {
	    return new Uint8ClampedArray(mallocArrayBuffer(n), 0, n)
	  } else {
	    return mallocUint8(n)
	  }
	}
	pool$3.mallocUint8Clamped = mallocUint8Clamped;

	function mallocBigUint64(n) {
	  if(hasBigUint64) {
	    return new BigUint64Array(mallocArrayBuffer(8*n), 0, n)
	  } else {
	    return null;
	  }
	}
	pool$3.mallocBigUint64 = mallocBigUint64;

	function mallocBigInt64(n) {
	  if (hasBigInt64) {
	    return new BigInt64Array(mallocArrayBuffer(8*n), 0, n)
	  } else {
	    return null;
	  }
	}
	pool$3.mallocBigInt64 = mallocBigInt64;

	function mallocDataView(n) {
	  return new DataView(mallocArrayBuffer(n), 0, n)
	}
	pool$3.mallocDataView = mallocDataView;

	function mallocBuffer(n) {
	  n = bits.nextPow2(n);
	  var log_n = bits.log2(n);
	  var cache = BUFFER[log_n];
	  if(cache.length > 0) {
	    return cache.pop()
	  }
	  return new Buffer(n)
	}
	pool$3.mallocBuffer = mallocBuffer;

	pool$3.clearCache = function clearCache() {
	  for(var i=0; i<32; ++i) {
	    POOL.UINT8[i].length = 0;
	    POOL.UINT16[i].length = 0;
	    POOL.UINT32[i].length = 0;
	    POOL.INT8[i].length = 0;
	    POOL.INT16[i].length = 0;
	    POOL.INT32[i].length = 0;
	    POOL.FLOAT[i].length = 0;
	    POOL.DOUBLE[i].length = 0;
	    POOL.BIGUINT64[i].length = 0;
	    POOL.BIGINT64[i].length = 0;
	    POOL.UINT8C[i].length = 0;
	    DATA[i].length = 0;
	    BUFFER[i].length = 0;
	  }
	};
	return pool$3;
}

var greedy;
var hasRequiredGreedy;

function requireGreedy () {
	if (hasRequiredGreedy) return greedy;
	hasRequiredGreedy = 1;

	var pool = requirePool$2();
	requireUniq();
	var iota = requireIota();

	function generateMesher(order, skip, merge, append, num_options, options, useGetter) {
	  var code = [];
	  var d = order.length;
	  var i, j;
	  
	  //Build arguments for append macro
	  var append_args = new Array(2*d+1+num_options);
	  for(i=0; i<d; ++i) {
	    append_args[i] = "i"+i;
	  }
	  for(i=0; i<d; ++i) {
	    append_args[i+d] = "j"+i;
	  }
	  append_args[2*d] = "oval";
	  
	  var opt_args = new Array(num_options);
	  for(i=0; i<num_options; ++i) {
	    opt_args[i] = "opt"+i;
	    append_args[2*d+1+i] = "opt"+i;
	  }

	  //Unpack stride and shape arrays into variables
	  code.push("var data=array.data,offset=array.offset,shape=array.shape,stride=array.stride");
	  for(var i=0; i<d; ++i) {
	    code.push(["var stride",i,"=stride[",order[i],"]|0,shape",i,"=shape[",order[i],"]|0"].join(""));
	    if(i > 0) {
	      code.push(["var astep",i,"=(stride",i,"-stride",i-1,"*shape",i-1,")|0"].join(""));
	    } else {
	      code.push(["var astep",i,"=stride",i,"|0"].join(""));
	    }
	    if(i > 0) {
	      code.push(["var vstep",i,"=(vstep",i-1,"*shape",i-1,")|0"].join(""));
	    } else {
	      code.push(["var vstep",i,"=1"].join(""));
	    }
	    code.push(["var i",i,"=0,j",i,"=0,k",i,"=0,ustep",i,"=vstep",i,"|0,bstep",i,"=astep",i,"|0"].join(""));
	  }
	  
	  //Initialize pointers
	  code.push("var a_ptr=offset>>>0,b_ptr=0,u_ptr=0,v_ptr=0,i=0,d=0,val=0,oval=0");
	  
	  //Initialize count
	  code.push("var count=" + iota(d).map(function(i) { return "shape"+i}).join("*"));
	  code.push("var visited=mallocUint8(count)");
	  
	  //Zero out visited map
	  code.push("for(;i<count;++i){visited[i]=0}");
	  
	  //Begin traversal
	  for(i=d-1; i>=0; --i) {
	    code.push(["for(i",i,"=0;i",i,"<shape",i,";++i",i,"){"].join(""));
	  }
	  code.push("if(!visited[v_ptr]){");
	  
	    if(useGetter) {
	      code.push("val=data.get(a_ptr)");
	    } else {
	      code.push("val=data[a_ptr]");
	    }
	  
	    if(skip) {
	      code.push("if(!skip(val)){");
	    } else {
	      code.push("if(val!==0){");
	    }
	  
	      //Save val to oval
	      code.push("oval = val");
	  
	      //Generate merging code
	      for(i=0; i<d; ++i) {
	        code.push("u_ptr=v_ptr+vstep"+i);
	        code.push("b_ptr=a_ptr+stride"+i);
	        code.push(["j",i,"_loop: for(j",i,"=1+i",i,";j",i,"<shape",i,";++j",i,"){"].join(""));
	        for(j=i-1; j>=0; --j) {
	          code.push(["for(k",j,"=i",j,";k",j,"<j",j,";++k",j,"){"].join(""));
	        }
	        
	          //Check if we can merge this voxel
	          code.push("if(visited[u_ptr]) { break j"+i+"_loop; }");
	        
	          if(useGetter) {
	            code.push("val=data.get(b_ptr)");
	          } else {
	            code.push("val=data[b_ptr]");
	          }
	        
	          if(skip && merge) {
	            code.push("if(skip(val) || !merge(oval,val)){ break j"+i+"_loop; }");
	          } else if(skip) {
	            code.push("if(skip(val) || val !== oval){ break j"+i+"_loop; }");
	          } else if(merge) {
	            code.push("if(val === 0 || !merge(oval,val)){ break j"+i+"_loop; }");
	          } else {
	            code.push("if(val === 0 || val !== oval){ break j"+i+"_loop; }");
	          }
	          
	          //Close off loop bodies
	          code.push("++u_ptr");
	          code.push("b_ptr+=stride0");
	        code.push("}");
	        
	        for(j=1; j<=i; ++j) {
	          code.push("u_ptr+=ustep"+j);
	          code.push("b_ptr+=bstep"+j);
	          code.push("}");
	        }
	        if(i < d-1) {
	          code.push("d=j"+i+"-i"+i);
	          code.push(["ustep",i+1,"=(vstep",i+1,"-vstep",i,"*d)|0"].join(""));
	          code.push(["bstep",i+1,"=(stride",i+1,"-stride",i,"*d)|0"].join(""));
	        }
	      }
	  
	      //Mark off visited table
	      code.push("u_ptr=v_ptr");
	      for(i=d-1; i>=0; --i) {
	        code.push(["for(k",i,"=i",i,";k",i,"<j",i,";++k",i,"){"].join(""));
	      }
	      code.push("visited[u_ptr++]=1");
	      code.push("}");
	      for(i=1; i<d; ++i) {
	        code.push("u_ptr+=ustep"+i);
	        code.push("}");
	      }
	  
	      //Append chunk to mesh
	      code.push("append("+ append_args.join(",")+ ")");
	    
	    code.push("}");
	  code.push("}");
	  code.push("++v_ptr");
	  for(var i=0; i<d; ++i) {
	    code.push("a_ptr+=astep"+i);
	    code.push("}");
	  }
	  
	  code.push("freeUint8(visited)");
	  
	  if(options.debug) {
	    console.log("GENERATING MESHER:");
	    console.log(code.join("\n"));
	  }
	  
	  //Compile procedure
	  var args = ["append", "mallocUint8", "freeUint8"];
	  if(merge) {
	    args.unshift("merge");
	  }
	  if(skip) {
	    args.unshift("skip");
	  }
	  
	  //Build wrapper
	  var local_args = ["array"].concat(opt_args);
	  var funcName = ["greedyMesher", d, "d_ord", order.join("s") , (skip ? "skip" : "") , (merge ? "merge" : "")].join("");
	  var gen_body = ["'use strict';function ", funcName, "(", local_args.join(","), "){", code.join("\n"), "};return ", funcName].join("");
	  args.push(gen_body);
	  var proc = Function.apply(undefined, args);
	  
	  if(skip && merge) {
	    return proc(skip, merge, append, pool.mallocUint8, pool.freeUint8)
	  } else if(skip) {
	    return proc(skip, append, pool.mallocUint8, pool.freeUint8)
	  } else if(merge) {
	    return proc(merge, append, pool.mallocUint8, pool.freeUint8)
	  } else {
	    return proc(append, pool.mallocUint8, pool.freeUint8)
	  }
	}

	//The actual mesh compiler
	function compileMesher(options) {
	  options = options || {};
	  if(!options.order) {
	    throw new Error("greedy-mesher: Missing order field")
	  }
	  if(!options.append) {
	    throw new Error("greedy-mesher: Missing append field")
	  }
	  return generateMesher(
	    options.order,
	    options.skip,
	    options.merge,
	    options.append,
	    options.extraArgs|0,
	    options,
	    !!options.useGetter
	  )
	}
	greedy = compileMesher;
	return greedy;
}

var pool$2 = {};

var twiddle = {};

/**
 * Bit twiddling hacks for JavaScript.
 *
 * Author: Mikola Lysenko
 *
 * Ported from Stanford bit twiddling hack library:
 *    http://graphics.stanford.edu/~seander/bithacks.html
 */

var hasRequiredTwiddle;

function requireTwiddle () {
	if (hasRequiredTwiddle) return twiddle;
	hasRequiredTwiddle = 1;

	//Number of bits in an integer
	var INT_BITS = 32;

	//Constants
	twiddle.INT_BITS  = INT_BITS;
	twiddle.INT_MAX   =  0x7fffffff;
	twiddle.INT_MIN   = -1<<(INT_BITS-1);

	//Returns -1, 0, +1 depending on sign of x
	twiddle.sign = function(v) {
	  return (v > 0) - (v < 0);
	};

	//Computes absolute value of integer
	twiddle.abs = function(v) {
	  var mask = v >> (INT_BITS-1);
	  return (v ^ mask) - mask;
	};

	//Computes minimum of integers x and y
	twiddle.min = function(x, y) {
	  return y ^ ((x ^ y) & -(x < y));
	};

	//Computes maximum of integers x and y
	twiddle.max = function(x, y) {
	  return x ^ ((x ^ y) & -(x < y));
	};

	//Checks if a number is a power of two
	twiddle.isPow2 = function(v) {
	  return !(v & (v-1)) && (!!v);
	};

	//Computes log base 2 of v
	twiddle.log2 = function(v) {
	  var r, shift;
	  r =     (v > 0xFFFF) << 4; v >>>= r;
	  shift = (v > 0xFF  ) << 3; v >>>= shift; r |= shift;
	  shift = (v > 0xF   ) << 2; v >>>= shift; r |= shift;
	  shift = (v > 0x3   ) << 1; v >>>= shift; r |= shift;
	  return r | (v >> 1);
	};

	//Computes log base 10 of v
	twiddle.log10 = function(v) {
	  return  (v >= 1000000000) ? 9 : (v >= 100000000) ? 8 : (v >= 10000000) ? 7 :
	          (v >= 1000000) ? 6 : (v >= 100000) ? 5 : (v >= 10000) ? 4 :
	          (v >= 1000) ? 3 : (v >= 100) ? 2 : (v >= 10) ? 1 : 0;
	};

	//Counts number of bits
	twiddle.popCount = function(v) {
	  v = v - ((v >>> 1) & 0x55555555);
	  v = (v & 0x33333333) + ((v >>> 2) & 0x33333333);
	  return ((v + (v >>> 4) & 0xF0F0F0F) * 0x1010101) >>> 24;
	};

	//Counts number of trailing zeros
	function countTrailingZeros(v) {
	  var c = 32;
	  v &= -v;
	  if (v) c--;
	  if (v & 0x0000FFFF) c -= 16;
	  if (v & 0x00FF00FF) c -= 8;
	  if (v & 0x0F0F0F0F) c -= 4;
	  if (v & 0x33333333) c -= 2;
	  if (v & 0x55555555) c -= 1;
	  return c;
	}
	twiddle.countTrailingZeros = countTrailingZeros;

	//Rounds to next power of 2
	twiddle.nextPow2 = function(v) {
	  v += v === 0;
	  --v;
	  v |= v >>> 1;
	  v |= v >>> 2;
	  v |= v >>> 4;
	  v |= v >>> 8;
	  v |= v >>> 16;
	  return v + 1;
	};

	//Rounds down to previous power of 2
	twiddle.prevPow2 = function(v) {
	  v |= v >>> 1;
	  v |= v >>> 2;
	  v |= v >>> 4;
	  v |= v >>> 8;
	  v |= v >>> 16;
	  return v - (v>>>1);
	};

	//Computes parity of word
	twiddle.parity = function(v) {
	  v ^= v >>> 16;
	  v ^= v >>> 8;
	  v ^= v >>> 4;
	  v &= 0xf;
	  return (0x6996 >>> v) & 1;
	};

	var REVERSE_TABLE = new Array(256);

	(function(tab) {
	  for(var i=0; i<256; ++i) {
	    var v = i, r = i, s = 7;
	    for (v >>>= 1; v; v >>>= 1) {
	      r <<= 1;
	      r |= v & 1;
	      --s;
	    }
	    tab[i] = (r << s) & 0xff;
	  }
	})(REVERSE_TABLE);

	//Reverse bits in a 32 bit word
	twiddle.reverse = function(v) {
	  return  (REVERSE_TABLE[ v         & 0xff] << 24) |
	          (REVERSE_TABLE[(v >>> 8)  & 0xff] << 16) |
	          (REVERSE_TABLE[(v >>> 16) & 0xff] << 8)  |
	           REVERSE_TABLE[(v >>> 24) & 0xff];
	};

	//Interleave bits of 2 coordinates with 16 bits.  Useful for fast quadtree codes
	twiddle.interleave2 = function(x, y) {
	  x &= 0xFFFF;
	  x = (x | (x << 8)) & 0x00FF00FF;
	  x = (x | (x << 4)) & 0x0F0F0F0F;
	  x = (x | (x << 2)) & 0x33333333;
	  x = (x | (x << 1)) & 0x55555555;

	  y &= 0xFFFF;
	  y = (y | (y << 8)) & 0x00FF00FF;
	  y = (y | (y << 4)) & 0x0F0F0F0F;
	  y = (y | (y << 2)) & 0x33333333;
	  y = (y | (y << 1)) & 0x55555555;

	  return x | (y << 1);
	};

	//Extracts the nth interleaved component
	twiddle.deinterleave2 = function(v, n) {
	  v = (v >>> n) & 0x55555555;
	  v = (v | (v >>> 1))  & 0x33333333;
	  v = (v | (v >>> 2))  & 0x0F0F0F0F;
	  v = (v | (v >>> 4))  & 0x00FF00FF;
	  v = (v | (v >>> 16)) & 0x000FFFF;
	  return (v << 16) >> 16;
	};


	//Interleave bits of 3 coordinates, each with 10 bits.  Useful for fast octree codes
	twiddle.interleave3 = function(x, y, z) {
	  x &= 0x3FF;
	  x  = (x | (x<<16)) & 4278190335;
	  x  = (x | (x<<8))  & 251719695;
	  x  = (x | (x<<4))  & 3272356035;
	  x  = (x | (x<<2))  & 1227133513;

	  y &= 0x3FF;
	  y  = (y | (y<<16)) & 4278190335;
	  y  = (y | (y<<8))  & 251719695;
	  y  = (y | (y<<4))  & 3272356035;
	  y  = (y | (y<<2))  & 1227133513;
	  x |= (y << 1);
	  
	  z &= 0x3FF;
	  z  = (z | (z<<16)) & 4278190335;
	  z  = (z | (z<<8))  & 251719695;
	  z  = (z | (z<<4))  & 3272356035;
	  z  = (z | (z<<2))  & 1227133513;
	  
	  return x | (z << 2);
	};

	//Extracts nth interleaved component of a 3-tuple
	twiddle.deinterleave3 = function(v, n) {
	  v = (v >>> n)       & 1227133513;
	  v = (v | (v>>>2))   & 3272356035;
	  v = (v | (v>>>4))   & 251719695;
	  v = (v | (v>>>8))   & 4278190335;
	  v = (v | (v>>>16))  & 0x3FF;
	  return (v<<22)>>22;
	};

	//Computes next combination in colexicographic order (this is mistakenly called nextPermutation on the bit twiddling hacks page)
	twiddle.nextCombination = function(v) {
	  var t = v | (v - 1);
	  return (t + 1) | (((~t & -~t) - 1) >>> (countTrailingZeros(v) + 1));
	};
	return twiddle;
}

var dup;
var hasRequiredDup;

function requireDup () {
	if (hasRequiredDup) return dup;
	hasRequiredDup = 1;

	function dupe_array(count, value, i) {
	  var c = count[i]|0;
	  if(c <= 0) {
	    return []
	  }
	  var result = new Array(c), j;
	  if(i === count.length-1) {
	    for(j=0; j<c; ++j) {
	      result[j] = value;
	    }
	  } else {
	    for(j=0; j<c; ++j) {
	      result[j] = dupe_array(count, value, i+1);
	    }
	  }
	  return result
	}

	function dupe_number(count, value) {
	  var result, i;
	  result = new Array(count);
	  for(i=0; i<count; ++i) {
	    result[i] = value;
	  }
	  return result
	}

	function dupe(count, value) {
	  if(typeof value === "undefined") {
	    value = 0;
	  }
	  switch(typeof count) {
	    case "number":
	      if(count > 0) {
	        return dupe_number(count|0, value)
	      }
	    break
	    case "object":
	      if(typeof (count.length) === "number") {
	        return dupe_array(count, value, 0)
	      }
	    break
	  }
	  return []
	}

	dup = dupe;
	return dup;
}

var hasRequiredPool$1;

function requirePool$1 () {
	if (hasRequiredPool$1) return pool$2;
	hasRequiredPool$1 = 1;

	var bits = requireTwiddle();
	var dup = requireDup();
	if(!commonjsGlobal.__TYPEDARRAY_POOL) {
	  commonjsGlobal.__TYPEDARRAY_POOL = {
	      UINT8   : dup([32, 0])
	    , UINT16  : dup([32, 0])
	    , UINT32  : dup([32, 0])
	    , INT8    : dup([32, 0])
	    , INT16   : dup([32, 0])
	    , INT32   : dup([32, 0])
	    , FLOAT   : dup([32, 0])
	    , DOUBLE  : dup([32, 0])
	    , DATA    : dup([32, 0])
	  };
	}
	var POOL = commonjsGlobal.__TYPEDARRAY_POOL;
	var UINT8   = POOL.UINT8
	  , UINT16  = POOL.UINT16
	  , UINT32  = POOL.UINT32
	  , INT8    = POOL.INT8
	  , INT16   = POOL.INT16
	  , INT32   = POOL.INT32
	  , FLOAT   = POOL.FLOAT
	  , DOUBLE  = POOL.DOUBLE
	  , DATA    = POOL.DATA;

	pool$2.free = function free(array) {
	  if(array instanceof ArrayBuffer) {
	    var n = array.byteLength|0
	      , log_n = bits.log2(n);
	    DATA[log_n].push(array);
	  } else {
	    var n = array.length|0
	      , log_n = bits.log2(n);
	    if(array instanceof Uint8Array) {
	      UINT8[log_n].push(array);
	    } else if(array instanceof Uint16Array) {
	      UINT16[log_n].push(array);
	    } else if(array instanceof Uint32Array) {
	      UINT32[log_n].push(array);
	    } else if(array instanceof Int8Array) {
	      INT8[log_n].push(array);
	    } else if(array instanceof Int16Array) {
	      INT16[log_n].push(array);
	    } else if(array instanceof Int32Array) {
	      INT32[log_n].push(array);
	    } else if(array instanceof Float32Array) {
	      FLOAT[log_n].push(array);
	    } else if(array instanceof Float64Array) {
	      DOUBLE[log_n].push(array);
	    }
	  }
	};

	pool$2.freeUint8 = function freeUint8(array) {
	  UINT8[bits.log2(array.length)].push(array);
	};

	pool$2.freeUint16 = function freeUint16(array) {
	  UINT16[bits.log2(array.length)].push(array);
	};

	pool$2.freeUint32 = function freeUint32(array) {
	  UINT32[bits.log2(array.length)].push(array);
	};

	pool$2.freeInt8 = function freeInt8(array) {
	  INT8[bits.log2(array.length)].push(array);
	};

	pool$2.freeInt16 = function freeInt16(array) {
	  INT16[bits.log2(array.length)].push(array);
	};

	pool$2.freeInt32 = function freeInt32(array) {
	  INT32[bits.log2(array.length)].push(array);
	};

	pool$2.freeFloat32 = pool$2.freeFloat = function freeFloat(array) {
	  FLOAT[bits.log2(array.length)].push(array);
	};

	pool$2.freeFloat64 = pool$2.freeDouble = function freeDouble(array) {
	  DOUBLE[bits.log2(array.length)].push(array);
	};

	pool$2.freeArrayBuffer = function freeArrayBuffer(array) {
	  DATA[bits.log2(array.length)].push(array);
	};

	pool$2.malloc = function malloc(n, dtype) {
	  n = bits.nextPow2(n);
	  var log_n = bits.log2(n);
	  if(dtype === undefined) {
	    var d = DATA[log_n];
	    if(d.length > 0) {
	      var r = d[d.length-1];
	      d.pop();
	      return r
	    }
	    return new ArrayBuffer(n)
	  } else {
	    switch(dtype) {
	      case "uint8":
	        var u8 = UINT8[log_n];
	        if(u8.length > 0) {
	          return u8.pop()
	        }
	        return new Uint8Array(n)

	      case "uint16":
	        var u16 = UINT16[log_n];
	        if(u16.length > 0) {
	          return u16.pop()
	        }
	        return new Uint16Array(n)

	      case "uint32":
	        var u32 = UINT32[log_n];
	        if(u32.length > 0) {
	          return u32.pop()
	        }
	        return new Uint32Array(n)

	      case "int8":
	        var i8 = INT8[log_n];
	        if(i8.length > 0) {
	          return i8.pop()
	        }
	        return new Int8Array(n)

	      case "int16":
	        var i16 = INT16[log_n];
	        if(i16.length > 0) {
	          return i16.pop()
	        }
	        return new Int16Array(n)

	      case "int32":
	        var i32 = INT32[log_n];
	        if(i32.length > 0) {
	          return i32.pop()
	        }
	        return new Int32Array(n)

	      case "float":
	      case "float32":
	        var f = FLOAT[log_n];
	        if(f.length > 0) {
	          return f.pop()
	        }
	        return new Float32Array(n)

	      case "double":
	      case "float64":
	        var dd = DOUBLE[log_n];
	        if(dd.length > 0) {
	          return dd.pop()
	        }
	        return new Float64Array(n)

	      default:
	        return null
	    }
	  }
	  return null
	};

	pool$2.mallocUint8 = function mallocUint8(n) {
	  n = bits.nextPow2(n);
	  var log_n = bits.log2(n);
	  var cache = UINT8[log_n];
	  if(cache.length > 0) {
	    return cache.pop()
	  }
	  return new Uint8Array(n)
	};

	pool$2.mallocUint16 = function mallocUint16(n) {
	  n = bits.nextPow2(n);
	  var log_n = bits.log2(n);
	  var cache = UINT16[log_n];
	  if(cache.length > 0) {
	    return cache.pop()
	  }
	  return new Uint16Array(n)
	};

	pool$2.mallocUint32 = function mallocUint32(n) {
	  n = bits.nextPow2(n);
	  var log_n = bits.log2(n);
	  var cache = UINT32[log_n];
	  if(cache.length > 0) {
	    return cache.pop()
	  }
	  return new Uint32Array(n)
	};

	pool$2.mallocInt8 = function mallocInt8(n) {
	  n = bits.nextPow2(n);
	  var log_n = bits.log2(n);
	  var cache = INT8[log_n];
	  if(cache.length > 0) {
	    return cache.pop()
	  }
	  return new Int8Array(n)
	};

	pool$2.mallocInt16 = function mallocInt16(n) {
	  n = bits.nextPow2(n);
	  var log_n = bits.log2(n);
	  var cache = INT16[log_n];
	  if(cache.length > 0) {
	    return cache.pop()
	  }
	  return new Int16Array(n)
	};

	pool$2.mallocInt32 = function mallocInt32(n) {
	  n = bits.nextPow2(n);
	  var log_n = bits.log2(n);
	  var cache = INT32[log_n];
	  if(cache.length > 0) {
	    return cache.pop()
	  }
	  return new Int32Array(n)
	};

	pool$2.mallocFloat32 = pool$2.mallocFloat = function mallocFloat(n) {
	  n = bits.nextPow2(n);
	  var log_n = bits.log2(n);
	  var cache = FLOAT[log_n];
	  if(cache.length > 0) {
	    return cache.pop()
	  }
	  return new Float32Array(n)
	};

	pool$2.mallocFloat64 = pool$2.mallocDouble = function mallocDouble(n) {
	  n = bits.nextPow2(n);
	  var log_n = bits.log2(n);
	  var cache = DOUBLE[log_n];
	  if(cache.length > 0) {
	    return cache.pop()
	  }
	  return new Float64Array(n)
	};

	pool$2.mallocArrayBuffer = function mallocArrayBuffer(n) {
	  n = bits.nextPow2(n);
	  var log_n = bits.log2(n);
	  var cache = DATA[log_n];
	  if(cache.length > 0) {
	    return cache.pop()
	  }
	  return new ArrayBuffer(n)
	};

	pool$2.clearCache = function clearCache() {
	  for(var i=0; i<32; ++i) {
	    UINT8[i].length = 0;
	    UINT16[i].length = 0;
	    UINT32[i].length = 0;
	    INT8[i].length = 0;
	    INT16[i].length = 0;
	    INT32[i].length = 0;
	    FLOAT[i].length = 0;
	    DOUBLE[i].length = 0;
	    DATA[i].length = 0;
	  }
	};
	return pool$2;
}

var mesh;
var hasRequiredMesh;

function requireMesh () {
	if (hasRequiredMesh) return mesh;
	hasRequiredMesh = 1;

	var ndarray = requireNdarray();
	var compileCWise = requireCompiler();
	var compileMesher = requireGreedy();
	var pool = requirePool$1();

	var OPAQUE_BIT      = (1 << 15);
	var VOXEL_MASK      = (1 << 16) - 1;
	var AO_SHIFT        = 16;
	var AO_BITS         = 2;
	var AO_MASK         = (1 << AO_BITS) - 1;
	var FLIP_BIT        = (1 << (AO_SHIFT + 4 * AO_BITS));
	var VERTEX_SIZE     = 8;

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
	    , s22 = (a22&OPAQUE_BIT) ? 1 : 0;
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
	    , t1 = !(v111 & OPAQUE_BIT);
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
	  var empty_proc = { args:[], thisVars:[], localVars:[], body:"" };
	  var cwise_args = [ "scalar", "array", "array", "array", "array" ];
	  var cwise_arg_names = [
	    arg("_func",false,true,3),
	    arg("_o0",true,false,1),
	    arg("_o1",true,false,1),
	    arg("_o2",true,false,1) ];
	  var cwise_body = [ ];
	  for(var d=0; d<3; ++d) {
	    var u = (d+1) % 3;
	    var v = (d+2) % 3;
	    var expr = [];
	    for(var dz=0; dz<2; ++dz)
	    for(var dy=0; dy<=2; ++dy)
	    for(var dx=0; dx<=2; ++dx) {
	      var x = [dx,dy,dz];
	      expr.push(["_a", x[v], x[u], x[d]].join(""));
	    }
	    cwise_body.push(["_o", d, "=_func(", expr.join(","), ")"].join(""));
	  }
	  var cwise_body_str = cwise_body.join("\n");
	  for(var dx=-1; dx<=1; ++dx)
	  for(var dy=-1; dy<=1; ++dy)
	  for(var dz=-1; dz<=1; ++dz) {
	    if(dx === 1 && dy === 1 && dz === 1) {
	      continue
	    }
	    if(!(dx === -1 && dy === -1 && dz === -1)) {
	      cwise_args.push({offset: [dx+1,dy+1,dz+1], array:3});
	    }
	    var carg_name = ["_a", dx+1, dy+1, dz+1].join("");
	    cwise_arg_names.push(arg(carg_name, false, true, cwise_body_str.split(carg_name).length - 1));
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
	  this.buffer = pool.mallocUint8(1024);
	  this.ptr = 0;
	  this.z = 0;
	  this.u = 0;
	  this.v = 0;
	  this.d = 0;
	}

	var AO_TABLE = new Uint8Array([0, 153, 204, 255]);

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
	  var buffer = this.buffer;
	  var ptr = this.ptr>>>0;
	  var z = this.z|0;
	  var u = this.u|0;
	  var v = this.v|0;
	  var d = this.d|0;

	  //Grow buffer if we exceed capacity
	  if(ptr + 6*VERTEX_SIZE > buffer.length) {
	    var tmp = pool.mallocUint8(2*buffer.length);
	    tmp.set(buffer);
	    pool.freeUint8(buffer);
	    buffer = tmp;
	    this.buffer = buffer;
	  }

	  var flip = !!(val & FLIP_BIT);
	  var side = d + (flip ? 3 : 0);
	  
	  var a00_idx = ((val>>>AO_SHIFT)&AO_MASK);
	  var a10_idx = ((val>>>(AO_SHIFT+AO_BITS))&AO_MASK);
	  var a11_idx = ((val>>>(AO_SHIFT+2*AO_BITS))&AO_MASK);
	  var a01_idx = ((val>>>(AO_SHIFT+3*AO_BITS))&AO_MASK);

	  var packedAO = (a01_idx << 6) + (a11_idx << 4) + (a10_idx << 2) + a00_idx;
	  var packedUVD = (u << 4) + (v << 2) + d;
	  var a00 = AO_TABLE[a00_idx];
	  var a10 = AO_TABLE[a10_idx];
	  var a11 = AO_TABLE[a11_idx];
	  var a01 = AO_TABLE[a01_idx];
	  
	  var tex_id = voxelTexture(val&VOXEL_MASK, side, this.voxelSideTextureIDs);

	  var nx=128, ny=128, nz=128;
	  var sign = flip ? 127 : 129;
	  if(d === 0) {
	    nx = sign;
	  } else if(d === 1) {
	    ny = sign;
	  } else if(d === 2) {
	    nz = sign;
	  }
	  
	  var flipAO = a00 + a11 < a10 + a01;
	  
	  if(a00 + a11 === a10 + a01) {
	    flipAO = Math.max(a00,a11) < Math.max(a10,a01);
	  }
	  var normal_code = normalCode(nx, ny, nz);

	  if(flipAO) {
	    if(!flip) {
	      buffer[ptr+u] = lo_x;
	      buffer[ptr+v] = lo_y;
	      buffer[ptr+d] = z;
	      buffer[ptr+3] = a00;
	      buffer[ptr+4] = packedUVD;
	      buffer[ptr+5] = normal_code;
	      buffer[ptr+6] = packedAO;
	      buffer[ptr+7] = tex_id;
	      ptr += 8;
	      
	      buffer[ptr+u] = lo_x;
	      buffer[ptr+v] = hi_y;
	      buffer[ptr+d] = z;
	      buffer[ptr+3] = a01;
	      buffer[ptr+4] = packedUVD;
	      buffer[ptr+5] = normal_code;
	      buffer[ptr+6] = packedAO;
	      buffer[ptr+7] = tex_id;
	      ptr += 8;

	      buffer[ptr+u] = hi_x;
	      buffer[ptr+v] = lo_y;
	      buffer[ptr+d] = z;
	      buffer[ptr+3] = a10;
	      buffer[ptr+4] = packedUVD;
	      buffer[ptr+5] = normal_code;
	      buffer[ptr+6] = packedAO;
	      buffer[ptr+7] = tex_id;  
	      ptr += 8;

	      buffer[ptr+u] = hi_x;
	      buffer[ptr+v] = hi_y;
	      buffer[ptr+d] = z;
	      buffer[ptr+3] = a11;
	      buffer[ptr+4] = packedUVD;
	      buffer[ptr+5] = normal_code;
	      buffer[ptr+6] = packedAO;
	      buffer[ptr+7] = tex_id;
	      ptr += 8;
	      
	      buffer[ptr+u] = hi_x;
	      buffer[ptr+v] = lo_y;
	      buffer[ptr+d] = z;
	      buffer[ptr+3] = a10;
	      buffer[ptr+4] = packedUVD;
	      buffer[ptr+5] = normal_code;
	      buffer[ptr+6] = packedAO;
	      buffer[ptr+7] = tex_id;
	      ptr += 8;
	      
	      buffer[ptr+u] = lo_x;
	      buffer[ptr+v] = hi_y;
	      buffer[ptr+d] = z;
	      buffer[ptr+3] = a01;
	      buffer[ptr+4] = packedUVD;
	      buffer[ptr+5] = normal_code;
	      buffer[ptr+6] = packedAO;
	      buffer[ptr+7] = tex_id;
	      ptr += 8;
	      
	    } else {
	      buffer[ptr+u] = lo_x;
	      buffer[ptr+v] = lo_y;
	      buffer[ptr+d] = z;
	      buffer[ptr+3] = a00;
	      buffer[ptr+4] = packedUVD;
	      buffer[ptr+5] = normal_code;
	      buffer[ptr+6] = packedAO;
	      buffer[ptr+7] = tex_id;

	      ptr += 8;
	      
	      buffer[ptr+u] = hi_x;
	      buffer[ptr+v] = lo_y;
	      buffer[ptr+d] = z;
	      buffer[ptr+3] = a10;
	      buffer[ptr+4] = packedUVD;
	      buffer[ptr+5] = normal_code;
	      buffer[ptr+6] = packedAO;
	      buffer[ptr+7] = tex_id;
	      
	      ptr += 8;
	      
	      buffer[ptr+u] = lo_x;
	      buffer[ptr+v] = hi_y;
	      buffer[ptr+d] = z;
	      buffer[ptr+3] = a01;
	      buffer[ptr+4] = packedUVD;
	      buffer[ptr+5] = normal_code;
	      buffer[ptr+6] = packedAO;
	      buffer[ptr+7] = tex_id;
	      
	      ptr += 8;

	      buffer[ptr+u] = hi_x;
	      buffer[ptr+v] = hi_y;
	      buffer[ptr+d] = z;
	      buffer[ptr+3] = a11;
	      buffer[ptr+4] = packedUVD;
	      buffer[ptr+5] = normal_code;
	      buffer[ptr+6] = packedAO;
	      buffer[ptr+7] = tex_id;

	      ptr += 8;
	      
	      buffer[ptr+u] = lo_x;
	      buffer[ptr+v] = hi_y;
	      buffer[ptr+d] = z;
	      buffer[ptr+3] = a01;
	      buffer[ptr+4] = packedUVD;
	      buffer[ptr+5] = normal_code;
	      buffer[ptr+6] = packedAO;
	      buffer[ptr+7] = tex_id;
	      
	      ptr += 8;
	      
	      buffer[ptr+u] = hi_x;
	      buffer[ptr+v] = lo_y;
	      buffer[ptr+d] = z;
	      buffer[ptr+3] = a10;
	      buffer[ptr+4] = packedUVD;
	      buffer[ptr+5] = normal_code;
	      buffer[ptr+6] = packedAO;
	      buffer[ptr+7] = tex_id;
	      
	      ptr += 8;
	    }
	  } else {
	    //Check if flipped
	    if(flip) {
	      buffer[ptr+u] = lo_x;
	      buffer[ptr+v] = hi_y;
	      buffer[ptr+d] = z;
	      buffer[ptr+3] = a01;
	      buffer[ptr+4] = packedUVD;
	      buffer[ptr+5] = normal_code;
	      buffer[ptr+6] = packedAO;
	      buffer[ptr+7] = tex_id;

	      ptr += 8;
	      
	      buffer[ptr+u] = lo_x;
	      buffer[ptr+v] = lo_y;
	      buffer[ptr+d] = z;
	      buffer[ptr+3] = a00;
	      buffer[ptr+4] = packedUVD;
	      buffer[ptr+5] = normal_code;
	      buffer[ptr+6] = packedAO;
	      buffer[ptr+7] = tex_id;
	      
	      ptr += 8;

	      buffer[ptr+u] = hi_x;
	      buffer[ptr+v] = hi_y;
	      buffer[ptr+d] = z;
	      buffer[ptr+3] = a11;
	      buffer[ptr+4] = packedUVD;
	      buffer[ptr+5] = normal_code;
	      buffer[ptr+6] = packedAO;
	      buffer[ptr+7] = tex_id;
	      
	      ptr += 8;
	      
	      buffer[ptr+u] = hi_x;
	      buffer[ptr+v] = lo_y;
	      buffer[ptr+d] = z;
	      buffer[ptr+3] = a10;
	      buffer[ptr+4] = packedUVD;
	      buffer[ptr+5] = normal_code;
	      buffer[ptr+6] = packedAO;
	      buffer[ptr+7] = tex_id;

	      ptr += 8;
	      
	      buffer[ptr+u] = hi_x;
	      buffer[ptr+v] = hi_y;
	      buffer[ptr+d] = z;
	      buffer[ptr+3] = a11;
	      buffer[ptr+4] = packedUVD;
	      buffer[ptr+5] = normal_code;
	      buffer[ptr+6] = packedAO;
	      buffer[ptr+7] = tex_id;
	      
	      ptr += 8;
	      
	      buffer[ptr+u] = lo_x;
	      buffer[ptr+v] = lo_y;
	      buffer[ptr+d] = z;
	      buffer[ptr+3] = a00;
	      buffer[ptr+4] = packedUVD;
	      buffer[ptr+5] = normal_code;
	      buffer[ptr+6] = packedAO;
	      buffer[ptr+7] = tex_id;
	      
	      ptr += 8;
	    } else {
	      buffer[ptr+u] = lo_x;
	      buffer[ptr+v] = lo_y;
	      buffer[ptr+d] = z;
	      buffer[ptr+3] = a00;
	      buffer[ptr+4] = packedUVD;
	      buffer[ptr+5] = normal_code;
	      buffer[ptr+6] = packedAO;
	      buffer[ptr+7] = tex_id;
	      
	      ptr += 8;
	      
	      buffer[ptr+u] = lo_x;
	      buffer[ptr+v] = hi_y;
	      buffer[ptr+d] = z;
	      buffer[ptr+3] = a01;
	      buffer[ptr+4] = packedUVD;
	      buffer[ptr+5] = normal_code;
	      buffer[ptr+6] = packedAO;
	      buffer[ptr+7] = tex_id;

	      ptr += 8;
	      
	      buffer[ptr+u] = hi_x;
	      buffer[ptr+v] = hi_y;
	      buffer[ptr+d] = z;
	      buffer[ptr+3] = a11;
	      buffer[ptr+4] = packedUVD;
	      buffer[ptr+5] = normal_code;
	      buffer[ptr+6] = packedAO;
	      buffer[ptr+7] = tex_id;
	      
	      ptr += 8;
	      
	      buffer[ptr+u] = hi_x;
	      buffer[ptr+v] = hi_y;
	      buffer[ptr+d] = z;
	      buffer[ptr+3] = a11;
	      buffer[ptr+4] = packedUVD;
	      buffer[ptr+5] = normal_code;
	      buffer[ptr+6] = packedAO;
	      buffer[ptr+7] = tex_id;
	      
	      ptr += 8;

	      buffer[ptr+u] = hi_x;
	      buffer[ptr+v] = lo_y;
	      buffer[ptr+d] = z;
	      buffer[ptr+3] = a10;
	      buffer[ptr+4] = packedUVD;
	      buffer[ptr+5] = normal_code;
	      buffer[ptr+6] = packedAO;
	      buffer[ptr+7] = tex_id;

	      ptr += 8;
	      
	      buffer[ptr+u] = lo_x;
	      buffer[ptr+v] = lo_y;
	      buffer[ptr+d] = z;
	      buffer[ptr+3] = a00;
	      buffer[ptr+4] = packedUVD;
	      buffer[ptr+5] = normal_code;
	      buffer[ptr+6] = packedAO;
	      buffer[ptr+7] = tex_id;
	      
	      ptr += 8;
	    }
	  }
	  this.ptr = ptr;
	};

	var meshBuilder = new MeshBuilder();

	//Compile mesher
	var meshSliceGreedy = compileMesher({
	  order: [1, 0],
	  append: MeshBuilder.prototype.append.bind(meshBuilder),
	});

	function generateMesher(append, mallocUint8, freeUint8) {
	  function mesher2d_ord1s0(array, aoMarks, d_axis, u_axis, v_axis) {
	    var data = array.data,
	        offset = array.offset,
	        shape = array.shape,
	        stride = array.stride;
	    var stride0 = stride[1] | 0,
	        shape0 = shape[1] | 0;
	    var astep0 = stride0 | 0;
	    var i0 = 0,
	        j0 = 0,
	        k0 = 0;
	    var stride1 = stride[0] | 0,
	        shape1 = shape[0] | 0;
	    var astep1 = (stride1 - stride0 * shape0) | 0;

	    var i1 = 0,
	        j1 = 0,
	        k1 = 0,
	        ustep1 = shape0,
	        bstep1 = astep1 | 0;
	    var a_ptr = offset >>> 0,
	        b_ptr = 0,
	        u_ptr = 0,
	        v_ptr = 0,
	        i = 0,
	        d = 0,
	        val = 0,
	        oval = 0;
	    var count = shape0 * shape1;
	    var visited = mallocUint8(count);
	    for (; i < count; ++i) {
	      visited[i] = 0;
	    }
	    for (i1 = 0; i1 < shape1; ++i1) {
	        for (i0 = 0; i0 < shape0; ++i0) {
	            if (!visited[v_ptr]) {
	                val = data[a_ptr];
	                if (val !== 0) {
	                    oval = val;
	                    u_ptr = v_ptr + 1;
	                    b_ptr = a_ptr + stride0;
	                    j0_loop: for (j0 = 1 + i0; j0 < shape0; ++j0) {
	                        if (visited[u_ptr] || (aoMarks[v_axis][j0] === 1)) {
	                            break j0_loop;
	                        }
	                        val = data[b_ptr];
	                        if (val === 0 || val !== oval || (aoMarks[v_axis][j0] === 1)) {
	                            break j0_loop;
	                        }
	                        ++u_ptr;
	                        b_ptr += stride0;
	                    }
	                    d = j0 - i0;
	                    ustep1 = (shape0 - d) | 0;
	                    bstep1 = (stride1 - stride0 * d) | 0;
	                    u_ptr = v_ptr + shape0;
	                    b_ptr = a_ptr + stride1;
	                    j1_loop: for (j1 = 1 + i1; j1 < shape1; ++j1) {
	                        for (k0 = i0; k0 < j0; ++k0) {
	                            if (visited[u_ptr] || (aoMarks[u_axis][j1] === 1)) {
	                                break j1_loop;
	                            }
	                            val = data[b_ptr];
	                            if (val === 0 || val !== oval || (aoMarks[u_axis][j1] === 1)) {
	                                break j1_loop;
	                            }
	                            ++u_ptr;
	                            b_ptr += stride0;
	                        }
	                        u_ptr += ustep1;
	                        b_ptr += bstep1;
	                    }
	                    u_ptr = v_ptr;
	                    for (k1 = i1; k1 < j1; ++k1) {
	                        for (k0 = i0; k0 < j0; ++k0) {
	                            visited[u_ptr++] = 1;
	                        }
	                        u_ptr += ustep1;
	                    }
	                    append(i0, i1, j0, j1, oval);
	                }
	            }
	            ++v_ptr;
	            a_ptr += astep0;
	        }
	        a_ptr += astep1;
	    }
	    freeUint8(visited);
	  }	  return mesher2d_ord1s0
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
	  var shp = array.shape.slice(0);
	  var nx = (shp[0]-2)|0;
	  var ny = (shp[1]-2)|0;
	  var nz = (shp[2]-2)|0;
	  var sz = nx * ny * nz;
	  var scratch0 = pool.mallocInt32(sz);
	  var scratch1 = pool.mallocInt32(sz);
	  var scratch2 = pool.mallocInt32(sz);
	  var rshp = [nx, ny, nz];
	  var ao0 = ndarray(scratch0, rshp);
	  var ao1 = ndarray(scratch1, rshp);
	  var ao2 = ndarray(scratch2, rshp);
	  var x_ao_mark = alloc0(rshp[0] + 1);
	  var y_ao_mark = alloc0(rshp[1] + 1);
	  var z_ao_mark = alloc0(rshp[2] + 1);
	  var aoMarks = [x_ao_mark, y_ao_mark, z_ao_mark];
	  //Calculate ao fields
	  surfaceStencil(ao0, ao1, ao2, array);
	  var buffers = [ao0, ao1, ao2];
	  // first round, find all the mark alone xyz axis
	  for (var d=0; d<3; d++) {
	    var u = (d + 1) % 3;
	    var v = (d + 2) % 3;
	    var x = [0, 0, 0];
	    var q = [0, 0, 0];
	    var st = buffers[d].transpose(d, u, v);
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
	  meshBuilder.ptr = 0;
	  meshBuilder.voxelSideTextureIDs = voxelSideTextureIDs;
	  for(var d=0; d<3; ++d) {
	    var u = (d+1)%3;
	    var v = (d+2)%3;
	    //Create slice
	    var st = buffers[d].transpose(d, u, v);
	    var slice = st.pick(0);
	    var n = rshp[d]|0;
	    meshBuilder.d = d;
	    meshBuilder.u = v;
	    meshBuilder.v = u;
	    //Generate slices
	    for(var i=0; i<n; ++i) {
	      meshBuilder.z = i;
	      meshSliceReduceTJ(slice, aoMarks, d, u, v);
	      slice.offset += st.stride[0];
	    }
	  }
	  //Release buffers
	  pool.freeInt32(scratch0);
	  pool.freeInt32(scratch1);
	  pool.freeInt32(scratch2);
	  
	  //Release uint8 array if no vertices were allocated
	  if(meshBuilder.ptr === 0) {
	    return null
	  }
	  //Slice out buffer
	  var rbuffer = meshBuilder.buffer;
	  var rptr = meshBuilder.ptr;
	  meshBuilder.buffer = pool.mallocUint8(1024);
	  meshBuilder.ptr = 0;
	  return rbuffer.subarray(0, rptr)
	}

	function greedyComputeMesh(array, voxelSideTextureIDs) {
	  var shp = array.shape.slice(0);
	  var nx = (shp[0]-2)|0;
	  var ny = (shp[1]-2)|0;
	  var nz = (shp[2]-2)|0;
	  var sz = nx * ny * nz;
	  var scratch0 = pool.mallocInt32(sz);
	  var scratch1 = pool.mallocInt32(sz);
	  var scratch2 = pool.mallocInt32(sz);
	  var rshp = [nx, ny, nz];
	  var ao0 = ndarray(scratch0, rshp);
	  var ao1 = ndarray(scratch1, rshp);
	  var ao2 = ndarray(scratch2, rshp);
	  //Calculate ao fields
	  surfaceStencil(ao0, ao1, ao2, array);
	  var buffers = [ao0, ao1, ao2];
	  //Build mesh slices
	  meshBuilder.ptr = 0;
	  meshBuilder.voxelSideTextureIDs = voxelSideTextureIDs;
	  for(var d=0; d<3; ++d) {
	    var u = (d+1)%3;
	    var v = (d+2)%3;
	    //Create slice
	    var st = buffers[d].transpose(d, u, v);
	    var slice = st.pick(0);
	    var n = rshp[d]|0;
	    meshBuilder.d = d;
	    meshBuilder.u = v;
	    meshBuilder.v = u;
	    //Generate slices
	    for(var i=0; i<n; ++i) {
	      meshBuilder.z = i;
	      meshSliceGreedy(slice);
	      slice.offset += st.stride[0];
	    }
	  }
	  //Release buffers
	  pool.freeInt32(scratch0);
	  pool.freeInt32(scratch1);
	  pool.freeInt32(scratch2);
	  //Release uint8 array if no vertices were allocated
	  if(meshBuilder.ptr === 0) {
	    return null
	  }
	  //Slice out buffer
	  var rbuffer = meshBuilder.buffer;
	  var rptr = meshBuilder.ptr;
	  meshBuilder.buffer = pool.mallocUint8(1024);
	  meshBuilder.ptr = 0;
	  return rbuffer.subarray(0, rptr)
	}

	mesh = {
	  computeMesh,
	  greedyComputeMesh,
	};
	return mesh;
}

var meshExports = requireMesh();

var stream = {};

var codec = {};

var hasRequiredCodec;

function requireCodec () {
	if (hasRequiredCodec) return codec;
	hasRequiredCodec = 1;
	Object.defineProperty(codec, "__esModule", { value: true });
	codec.encode = encode;
	codec.decode = decode;
	function utf8ToBytes(str) {
	    let codePoint;
	    const strLength = str.length;
	    let leadSurrogate;
	    const bytes = [];
	    for (let i = 0; i < strLength; ++i) {
	        codePoint = str.charCodeAt(i);
	        if (codePoint > 0xD7FF && codePoint < 0xE000) {
	            if (!leadSurrogate) {
	                if (codePoint > 0xDBFF) {
	                    bytes.push(0xEF, 0xBF, 0xBD);
	                    continue;
	                }
	                else if (i + 1 === strLength) {
	                    bytes.push(0xEF, 0xBF, 0xBD);
	                    continue;
	                }
	                leadSurrogate = codePoint;
	                continue;
	            }
	            if (codePoint < 0xDC00) {
	                bytes.push(0xEF, 0xBF, 0xBD);
	                leadSurrogate = codePoint;
	                continue;
	            }
	            codePoint = (leadSurrogate - 0xD800 << 10 | codePoint - 0xDC00) + 0x10000;
	        }
	        else if (leadSurrogate) {
	            bytes.push(0xEF, 0xBF, 0xBD);
	        }
	        leadSurrogate = undefined;
	        if (codePoint < 0x80) {
	            bytes.push(codePoint);
	        }
	        else if (codePoint < 0x800) {
	            bytes.push(codePoint >> 0x6 | 0xC0, codePoint & 0x3F | 0x80);
	        }
	        else if (codePoint < 0x10000) {
	            bytes.push(codePoint >> 0xC | 0xE0, codePoint >> 0x6 & 0x3F | 0x80, codePoint & 0x3F | 0x80);
	        }
	        else if (codePoint < 0x110000) {
	            bytes.push(codePoint >> 0x12 | 0xF0, codePoint >> 0xC & 0x3F | 0x80, codePoint >> 0x6 & 0x3F | 0x80, codePoint & 0x3F | 0x80);
	        }
	        else {
	            throw new Error('mudb/stream: invalid code point');
	        }
	    }
	    return bytes;
	}
	function encode(str) {
	    return new Uint8Array(utf8ToBytes(str));
	}
	function decodeCodePointsArray(codePoints) {
	    const MAX_ARGUMENTS_LENGTH = 0x1000;
	    const len = codePoints.length;
	    if (len <= MAX_ARGUMENTS_LENGTH) {
	        return String.fromCharCode.apply(String, codePoints);
	    }
	    let res = '';
	    let i = 0;
	    while (i < len) {
	        res += String.fromCharCode.apply(String, codePoints.slice(i, i += MAX_ARGUMENTS_LENGTH));
	    }
	    return res;
	}
	function decode(bytes) {
	    const { byteLength } = bytes;
	    const res = [];
	    let i = 0;
	    while (i < byteLength) {
	        const firstByte = bytes[i];
	        let codePoint;
	        let bytesPerSequence = (firstByte > 0xEF) ? 4
	            : (firstByte > 0xDF) ? 3
	                : (firstByte > 0xBF) ? 2
	                    : 1;
	        if (i + bytesPerSequence <= byteLength) {
	            let secondByte;
	            let thirdByte;
	            let fourthByte;
	            let tempCodePoint;
	            switch (bytesPerSequence) {
	                case 1:
	                    if (firstByte < 0x80) {
	                        codePoint = firstByte;
	                    }
	                    break;
	                case 2:
	                    secondByte = bytes[i + 1];
	                    if ((secondByte & 0xC0) === 0x80) {
	                        tempCodePoint = (firstByte & 0x1F) << 0x6 | (secondByte & 0x3F);
	                        if (tempCodePoint > 0x7F) {
	                            codePoint = tempCodePoint;
	                        }
	                    }
	                    break;
	                case 3:
	                    secondByte = bytes[i + 1];
	                    thirdByte = bytes[i + 2];
	                    if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80) {
	                        tempCodePoint = (firstByte & 0xF) << 0xC | (secondByte & 0x3F) << 0x6 | (thirdByte & 0x3F);
	                        if (tempCodePoint > 0x7FF && (tempCodePoint < 0xD800 || tempCodePoint > 0xDFFF)) {
	                            codePoint = tempCodePoint;
	                        }
	                    }
	                    break;
	                case 4:
	                    secondByte = bytes[i + 1];
	                    thirdByte = bytes[i + 2];
	                    fourthByte = bytes[i + 3];
	                    if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80 && (fourthByte & 0xC0) === 0x80) {
	                        tempCodePoint = (firstByte & 0xF) << 0x12 | (secondByte & 0x3F) << 0xC | (thirdByte & 0x3F) << 0x6 | (fourthByte & 0x3F);
	                        if (tempCodePoint > 0xFFFF && tempCodePoint < 0x110000) {
	                            codePoint = tempCodePoint;
	                        }
	                    }
	            }
	        }
	        if (codePoint == undefined) {
	            codePoint = 0xFFFD;
	            bytesPerSequence = 1;
	        }
	        else if (codePoint > 0xFFFF) {
	            codePoint -= 0x10000;
	            res.push(codePoint >>> 10 & 0x3FF | 0xD800);
	            codePoint = 0xDC00 | codePoint & 0x3FF;
	        }
	        res.push(codePoint);
	        i += bytesPerSequence;
	    }
	    return decodeCodePointsArray(res);
	}
	
	return codec;
}

var hasRequiredStream;

function requireStream () {
	if (hasRequiredStream) return stream;
	hasRequiredStream = 1;
	(function (exports$1) {
		Object.defineProperty(exports$1, "__esModule", { value: true });
		exports$1.MuReadStream = exports$1.MuWriteStream = exports$1.MuBuffer = exports$1.decodeUTF8 = exports$1.encodeUTF8 = void 0;
		exports$1.allocBuffer = allocBuffer;
		exports$1.freeBuffer = freeBuffer;
		const root = (typeof self == 'object' && self['Object'] == Object && self)
		    || (typeof commonjsGlobal == 'object' && commonjsGlobal['Object'] == Object && commonjsGlobal);
		if (typeof root === 'object' && 'TextEncoder' in root) {
		    const encoder = new TextEncoder();
		    exports$1.encodeUTF8 = (str) => encoder.encode(str);
		    const decoder = new TextDecoder();
		    exports$1.decodeUTF8 = (bytes) => decoder.decode(bytes);
		}
		else {
		    const codec = requireCodec();
		    exports$1.encodeUTF8 = codec.encode;
		    exports$1.decodeUTF8 = codec.decode;
		}
		function ceilLog2(v_) {
		    let v = v_ - 1;
		    let r = (v > 0xFFFF) ? 1 << 4 : 0;
		    v >>>= r;
		    let shift = (v > 0xFF) ? 1 << 3 : 0;
		    v >>>= shift;
		    r |= shift;
		    shift = (v > 0xF) ? 1 << 2 : 0;
		    v >>>= shift;
		    r |= shift;
		    shift = (v > 0x3) ? 1 << 1 : 0;
		    v >>>= shift;
		    r |= shift;
		    return (r | (v >> 1)) + 1;
		}
		class MuBuffer {
		    constructor(buffer) {
		        this.buffer = buffer;
		        this.dataView = new DataView(buffer);
		        this.uint8 = new Uint8Array(buffer);
		    }
		}
		exports$1.MuBuffer = MuBuffer;
		const bufferPool = new Array(31);
		for (let i = 0; i < 31; ++i) {
		    bufferPool[i] = [];
		}
		function allocBuffer(size) {
		    if (size > 0x40000000 || size < 0) {
		        throw new RangeError(`size out of range: ${size}`);
		    }
		    size = Math.max(2, size | 0);
		    const b = ceilLog2(size);
		    return bufferPool[b].pop() || new MuBuffer(new ArrayBuffer(1 << b));
		}
		function freeBuffer(buffer) {
		    if (buffer.uint8.length > 0) {
		        bufferPool[ceilLog2(buffer.uint8.length)].push(buffer);
		    }
		}
		const LITTLE_ENDIAN = true;
		class MuWriteStream {
		    constructor(capacity) {
		        this.buffer = allocBuffer(capacity);
		        this.offset = 0;
		    }
		    bytes() {
		        return this.buffer.uint8.subarray(0, this.offset);
		    }
		    destroy() {
		        freeBuffer(this.buffer);
		    }
		    grow(bytes) {
		        const newSize = this.offset + bytes;
		        const uint8 = this.buffer.uint8;
		        if (uint8.length < newSize) {
		            const buffer = allocBuffer(newSize);
		            buffer.uint8.set(uint8);
		            freeBuffer(this.buffer);
		            this.buffer = buffer;
		        }
		    }
		    writeInt8(x) {
		        this.buffer.dataView.setInt8(this.offset, x);
		        this.offset += 1;
		    }
		    writeInt16(x) {
		        this.buffer.dataView.setInt16(this.offset, x, LITTLE_ENDIAN);
		        this.offset += 2;
		    }
		    writeInt32(x) {
		        this.buffer.dataView.setInt32(this.offset, x, LITTLE_ENDIAN);
		        this.offset += 4;
		    }
		    writeUint8(x) {
		        this.buffer.dataView.setUint8(this.offset, x);
		        this.offset += 1;
		    }
		    writeUint16(x) {
		        this.buffer.dataView.setUint16(this.offset, x, LITTLE_ENDIAN);
		        this.offset += 2;
		    }
		    writeUint32(x) {
		        this.buffer.dataView.setUint32(this.offset, x, LITTLE_ENDIAN);
		        this.offset += 4;
		    }
		    writeFloat32(x) {
		        this.buffer.dataView.setFloat32(this.offset, x, LITTLE_ENDIAN);
		        this.offset += 4;
		    }
		    writeFloat64(x) {
		        this.buffer.dataView.setFloat64(this.offset, x, LITTLE_ENDIAN);
		        this.offset += 8;
		    }
		    writeVarint(x) {
		        const x_ = x >>> 0;
		        const bytes = this.buffer.uint8;
		        let offset = this.offset;
		        if (x_ < 0x80) {
		            bytes[offset++] = x_;
		        }
		        else if (x_ < 0x4000) {
		            bytes[offset++] = x_ & 0x7f | 0x80;
		            bytes[offset++] = x_ >>> 7;
		        }
		        else if (x_ < 0x200000) {
		            bytes[offset++] = x_ & 0x7f | 0x80;
		            bytes[offset++] = x_ >> 7 & 0x7f | 0x80;
		            bytes[offset++] = x_ >>> 14;
		        }
		        else if (x_ < 0x10000000) {
		            bytes[offset++] = x_ & 0x7f | 0x80;
		            bytes[offset++] = x_ >> 7 & 0x7f | 0x80;
		            bytes[offset++] = x_ >> 14 & 0x7f | 0x80;
		            bytes[offset++] = x_ >>> 21;
		        }
		        else {
		            bytes[offset++] = x_ & 0x7f | 0x80;
		            bytes[offset++] = x_ >> 7 & 0x7f | 0x80;
		            bytes[offset++] = x_ >> 14 & 0x7f | 0x80;
		            bytes[offset++] = x_ >> 21 & 0x7f | 0x80;
		            bytes[offset++] = x_ >>> 28;
		        }
		        this.offset = offset;
		    }
		    writeASCII(str) {
		        const bytes = this.buffer.uint8;
		        let ptr = this.offset;
		        for (let i = 0; i < str.length; ++i) {
		            bytes[ptr++] = str.charCodeAt(i);
		        }
		        this.offset = ptr;
		    }
		    writeString(str) {
		        const bytes = (0, exports$1.encodeUTF8)(str);
		        this.grow(5 + bytes.length);
		        this.writeVarint(bytes.length);
		        this.buffer.uint8.set(bytes, this.offset);
		        this.offset += bytes.length;
		    }
		    writeUint8At(offset, x) {
		        this.buffer.dataView.setUint8(offset, x);
		    }
		    writeUint32At(offset, x) {
		        this.buffer.dataView.setUint32(offset, x, LITTLE_ENDIAN);
		    }
		}
		exports$1.MuWriteStream = MuWriteStream;
		class MuReadStream {
		    constructor(data) {
		        this.buffer = new MuBuffer(data.buffer);
		        this.offset = data.byteOffset;
		        this.length = data.byteLength + data.byteOffset;
		    }
		    bytes() {
		        return this.buffer.uint8.subarray(this.offset, this.length);
		    }
		    checkBounds() {
		        if (this.offset > this.length) {
		            throw new Error('out of bounds');
		        }
		    }
		    readInt8() {
		        const offset = this.offset;
		        this.offset += 1;
		        this.checkBounds();
		        return this.buffer.dataView.getInt8(offset);
		    }
		    readInt16() {
		        const offset = this.offset;
		        this.offset += 2;
		        this.checkBounds();
		        return this.buffer.dataView.getInt16(offset, LITTLE_ENDIAN);
		    }
		    readInt32() {
		        const offset = this.offset;
		        this.offset += 4;
		        this.checkBounds();
		        return this.buffer.dataView.getInt32(offset, LITTLE_ENDIAN);
		    }
		    readUint8() {
		        const offset = this.offset;
		        this.offset += 1;
		        this.checkBounds();
		        return this.buffer.dataView.getUint8(offset);
		    }
		    readUint16() {
		        const offset = this.offset;
		        this.offset += 2;
		        this.checkBounds();
		        return this.buffer.dataView.getUint16(offset, LITTLE_ENDIAN);
		    }
		    readUint32() {
		        const offset = this.offset;
		        this.offset += 4;
		        this.checkBounds();
		        return this.buffer.dataView.getUint32(offset, LITTLE_ENDIAN);
		    }
		    readFloat32() {
		        const offset = this.offset;
		        this.offset += 4;
		        this.checkBounds();
		        return this.buffer.dataView.getFloat32(offset, LITTLE_ENDIAN);
		    }
		    readFloat64() {
		        const offset = this.offset;
		        this.offset += 8;
		        this.checkBounds();
		        return this.buffer.dataView.getFloat64(offset, LITTLE_ENDIAN);
		    }
		    readVarint() {
		        const bytes = this.buffer.uint8;
		        let offset = this.offset;
		        const x0 = bytes[offset++];
		        if (x0 < 0x80) {
		            this.offset = offset;
		            this.checkBounds();
		            return x0;
		        }
		        const x1 = bytes[offset++];
		        if (x1 < 0x80) {
		            this.offset = offset;
		            this.checkBounds();
		            return (x0 & 0x7f) |
		                (x1 << 7);
		        }
		        const x2 = bytes[offset++];
		        if (x2 < 0x80) {
		            this.offset = offset;
		            this.checkBounds();
		            return (x0 & 0x7f) |
		                ((x1 & 0x7f) << 7) |
		                (x2 << 14);
		        }
		        const x3 = bytes[offset++];
		        if (x3 < 0x80) {
		            this.offset = offset;
		            this.checkBounds();
		            return (x0 & 0x7f) |
		                ((x1 & 0x7f) << 7) |
		                ((x2 & 0x7f) << 14) |
		                (x3 << 21);
		        }
		        const x4 = bytes[offset++];
		        this.offset = offset;
		        this.checkBounds();
		        return (x0 & 0x7f) +
		            ((x1 & 0x7f) << 7) +
		            ((x2 & 0x7f) << 14) +
		            ((x3 & 0x7f) << 21) +
		            (x4 * (1 << 28));
		    }
		    readASCII(length) {
		        const head = this.offset;
		        this.offset += length;
		        this.checkBounds();
		        let str = '';
		        for (let i = head; i < this.offset; ++i) {
		            str += String.fromCharCode(this.buffer.uint8[i]);
		        }
		        return str;
		    }
		    readString() {
		        const byteLength = this.readVarint();
		        const head = this.offset;
		        this.offset += byteLength;
		        this.checkBounds();
		        const bytes = this.buffer.uint8.subarray(head, this.offset);
		        return (0, exports$1.decodeUTF8)(bytes);
		    }
		    readUint8At(offset) {
		        return this.buffer.dataView.getUint8(offset);
		    }
		}
		exports$1.MuReadStream = MuReadStream;
		
	} (stream));
	return stream;
}

var streamExports = requireStream();

/**
 * 把compactModel写入stream
 * 参照原来的 ModelMeshSchema.diff
 * @returns
 */
function compactModelToVbBytes(model) {
  const surfaceCount = model.surfaceCount;
  const dataLen = surfaceCount * 6;
  const materialKeys = Object.keys(model.material);
  const out = new streamExports.MuWriteStream(
  // compactModel.sliceInfo.length / 2 不一定是整数
  // sliceInfo后面的数据都用grow处理
  4 + 5 + 5 + 5 + materialKeys.length * 7);
  out.writeInt32(-11);
  out.writeVarint(surfaceCount);
  out.writeVarint(materialKeys.length);
  out.writeVarint(model.sliceInfo.length);
  for (let i = 0; i < materialKeys.length; i++) {
    const _m = model.material[materialKeys[i]];
    out.writeUint8(Number(materialKeys[i]));
    out.writeUint8(_m.rgb[0]);
    out.writeUint8(_m.rgb[1]);
    out.writeUint8(_m.rgb[2]);
    out.writeUint8(_m.pbr[0]);
    out.writeUint8(_m.pbr[1]);
    out.writeUint8(_m.pbr[2]);
  }
  let slice_ptr = 0;
  for (let i = 0; i < model.sliceInfo.length / 2; i++) {
    out.grow(1 + 5);
    out.writeUint8(model.sliceInfo[slice_ptr++]);
    out.writeVarint(model.sliceInfo[slice_ptr++]);
  }
  out.grow(dataLen);
  for (let i = 0; i < dataLen; i++) {
    out.writeUint8(model.data[i]);
  }
  const result = out.bytes();
  out.destroy();
  return result;
}

var fill = {};

var hasRequiredFill;

function requireFill () {
	if (hasRequiredFill) return fill;
	hasRequiredFill = 1;
	Object.defineProperty(fill, "__esModule", { value: true });
	fill.fillArray = void 0;
	function fillArrayAPI(array, value) {
	    array.fill(value);
	}
	function fillArrayPolyfill(array, value) {
	    for (let i = 0; i < array.length; ++i) {
	        array[i] = value;
	    }
	}
	const typedArrayPrototype = Object.getPrototypeOf(Uint8Array).prototype;
	fill.fillArray = typedArrayPrototype && typedArrayPrototype.fill !== undefined
	    ? fillArrayAPI
	    : fillArrayPolyfill;
	return fill;
}

var fillExports = requireFill();

var pool$1 = {};

var hasRequiredPool;

function requirePool () {
	if (hasRequiredPool) return pool$1;
	hasRequiredPool = 1;
	Object.defineProperty(pool$1, "__esModule", { value: true });
	pool$1.alloc = alloc;
	pool$1.free = free;
	pool$1.cloneU8 = cloneU8;
	pool$1.clearMemoryPool = clearMemoryPool;
	const bit_twiddle_1 = requireTwiddle$1();
	const pool = new Array(32);
	for (let i = 0; i < 32; ++i) {
	    pool[i] = [];
	}
	function alloc(size) {
	    const sz = (0, bit_twiddle_1.nextPow2)(size);
	    const bin = pool[(0, bit_twiddle_1.log2)(sz)];
	    const mem = bin.pop();
	    if (mem) {
	        return mem;
	    }
	    else {
	        return new Uint8Array(sz).buffer;
	    }
	}
	function free(buffer) {
	    pool[(0, bit_twiddle_1.log2)(buffer.byteLength)].push(buffer);
	}
	function cloneU8(data) {
	    const sz = (0, bit_twiddle_1.nextPow2)(data.length);
	    const bin = pool[(0, bit_twiddle_1.log2)(sz)];
	    const mem = bin.pop();
	    if (mem) {
	        const result = new Uint8Array(mem);
	        result.set(data);
	        return result;
	    }
	    else {
	        return new Uint8Array(data);
	    }
	}
	function clearMemoryPool() {
	    for (let i = 0; i < pool.length; ++i) {
	        pool[i].length = 0;
	    }
	}
	return pool$1;
}

var poolExports = requirePool();

var rleCompress = {};

var hasRequiredRleCompress;

function requireRleCompress () {
	if (hasRequiredRleCompress) return rleCompress;
	hasRequiredRleCompress = 1;
	Object.defineProperty(rleCompress, "__esModule", { value: true });
	rleCompress.compress = compress;
	rleCompress.decompress = decompress;
	rleCompress.sectionDecompress = sectionDecompress;
	rleCompress.old_decompress = old_decompress;
	function writeRun(out, runLength, block) {
	    if (runLength) {
	        out.grow(10);
	        out.writeVarint(runLength - 1);
	        out.writeVarint(block);
	    }
	}
	function compress(voxels, out) {
	    const { data, shape: [nx, ny, nz], stride: [sx, sy, sz], offset, } = voxels;
	    let prevBlock = -1;
	    let runLength = 0;
	    let ptr = offset;
	    const stepi = sx;
	    const stepj = sy - sx * nx;
	    const stepk = sz - sy * ny;
	    for (let k = 0; k < nz; ++k) {
	        for (let j = 0; j < ny; ++j) {
	            for (let i = 0; i < nx; ++i) {
	                const b = data[ptr];
	                if (b !== prevBlock) {
	                    writeRun(out, runLength, prevBlock);
	                    runLength = 0;
	                    prevBlock = b;
	                }
	                runLength += 1;
	                ptr += stepi;
	            }
	            ptr += stepj;
	        }
	        ptr += stepk;
	    }
	    writeRun(out, runLength, prevBlock);
	    return true;
	}
	function fastDecompress(inp, data, count) {
	    for (let ptr = 0; ptr < count;) {
	        const length = inp.readVarint() + 1;
	        const block = inp.readVarint();
	        for (let i = 0; i < length; ++i) {
	            data[ptr++] = block;
	        }
	    }
	    return true;
	}
	function decompress(inp, voxels) {
	    const { data, shape: [nx, ny, nz], stride: [sx, sy, sz], offset, } = voxels;
	    let curBlock = -1;
	    let curLength = 0;
	    if (sx === 1 && sy === nx && sz === nx * ny && offset === 0) {
	        return fastDecompress(inp, data, nx * ny * nz);
	    }
	    let ptr = offset;
	    const stepi = sx;
	    const stepj = sy - sx * nx;
	    const stepk = sz - sy * ny;
	    for (let k = 0; k < nz; ++k) {
	        for (let j = 0; j < ny; ++j) {
	            for (let i = 0; i < nx; ++i) {
	                if (curLength <= 0) {
	                    curLength = inp.readVarint() + 1;
	                    curBlock = inp.readVarint();
	                }
	                data[ptr] = curBlock;
	                curLength -= 1;
	                ptr += stepi;
	            }
	            ptr += stepj;
	        }
	        ptr += stepk;
	    }
	    return curLength === 0;
	}
	function sectionDecompress(rle, voxels, start, end) {
	    const { data, stride: [sx, sy, sz], offset, } = voxels;
	    const rleLength = rle.length;
	    let curBlock = -1;
	    let curLength = 0;
	    let rlePtr = 0;
	    const l = end[0] - start[0] + 1;
	    const h = end[1] - start[1] + 1;
	    const stepi = sx;
	    const stepj = sy - sx * l;
	    const stepk = sz - sy * h;
	    let ptr = sx * start[0] + sy * start[1] + sz * start[2] + offset;
	    for (let k = start[2]; k <= end[2]; k++) {
	        for (let j = start[1]; j <= end[1]; j++) {
	            for (let i = start[0]; i <= end[0]; i++) {
	                if (curLength <= 0) {
	                    if (rlePtr >= rleLength) {
	                        return false;
	                    }
	                    const runPrefix = rle[rlePtr++];
	                    if (runPrefix < 255) {
	                        curLength = runPrefix;
	                    }
	                    else {
	                        if (rlePtr + 1 >= rleLength) {
	                            return false;
	                        }
	                        curLength = (rle[rlePtr] << 8) + rle[rlePtr + 1];
	                        rlePtr += 2;
	                    }
	                    if (rlePtr >= rleLength) {
	                        return false;
	                    }
	                    const blockPrefix = rle[rlePtr++];
	                    if (blockPrefix < 255) {
	                        curBlock = blockPrefix;
	                    }
	                    else {
	                        if (rlePtr + 1 >= rleLength) {
	                            return false;
	                        }
	                        curBlock = (rle[rlePtr] << 8) + rle[rlePtr + 1];
	                        rlePtr += 2;
	                    }
	                }
	                data[ptr] = curBlock;
	                curLength -= 1;
	                ptr += stepi;
	            }
	            ptr += stepj;
	        }
	        ptr += stepk;
	    }
	    return rlePtr === rle.length && curLength === 0;
	}
	function old_decompress(rle, voxels) {
	    return sectionDecompress(rle, voxels, [0, 0, 0], voxels.shape.map((v) => v - 1));
	}
	return rleCompress;
}

var rleCompressExports = requireRleCompress();

var voxel = {};

/**
 * Common utilities
 * @module glMatrix
 */
// Configuration Constants
var EPSILON = 0.000001;
var ARRAY_TYPE = typeof Float32Array !== 'undefined' ? Float32Array : Array;
var RANDOM = Math.random;
/**
 * Sets the type of array used when creating new vectors and matrices
 *
 * @param {Float32ArrayConstructor | ArrayConstructor} type Array type, such as Float32Array or Array
 */

function setMatrixArrayType(type) {
  ARRAY_TYPE = type;
}
var degree = Math.PI / 180;
/**
 * Convert Degree To Radian
 *
 * @param {Number} a Angle in Degrees
 */

function toRadian(a) {
  return a * degree;
}
/**
 * Tests whether or not the arguments have approximately the same value, within an absolute
 * or relative tolerance of glMatrix.EPSILON (an absolute tolerance is used for values less
 * than or equal to 1.0, and a relative tolerance is used for larger values)
 *
 * @param {Number} a The first number to test.
 * @param {Number} b The second number to test.
 * @returns {Boolean} True if the numbers are approximately equal, false otherwise.
 */

function equals$9(a, b) {
  return Math.abs(a - b) <= EPSILON * Math.max(1.0, Math.abs(a), Math.abs(b));
}
if (!Math.hypot) Math.hypot = function () {
  var y = 0,
      i = arguments.length;

  while (i--) {
    y += arguments[i] * arguments[i];
  }

  return Math.sqrt(y);
};

var common = /*#__PURE__*/Object.freeze({
__proto__: null,
get ARRAY_TYPE () { return ARRAY_TYPE; },
EPSILON: EPSILON,
RANDOM: RANDOM,
equals: equals$9,
setMatrixArrayType: setMatrixArrayType,
toRadian: toRadian
});

/**
 * 2x2 Matrix
 * @module mat2
 */

/**
 * Creates a new identity mat2
 *
 * @returns {mat2} a new 2x2 matrix
 */

function create$8() {
  var out = new ARRAY_TYPE(4);

  if (ARRAY_TYPE != Float32Array) {
    out[1] = 0;
    out[2] = 0;
  }

  out[0] = 1;
  out[3] = 1;
  return out;
}
/**
 * Creates a new mat2 initialized with values from an existing matrix
 *
 * @param {ReadonlyMat2} a matrix to clone
 * @returns {mat2} a new 2x2 matrix
 */

function clone$8(a) {
  var out = new ARRAY_TYPE(4);
  out[0] = a[0];
  out[1] = a[1];
  out[2] = a[2];
  out[3] = a[3];
  return out;
}
/**
 * Copy the values from one mat2 to another
 *
 * @param {mat2} out the receiving matrix
 * @param {ReadonlyMat2} a the source matrix
 * @returns {mat2} out
 */

function copy$8(out, a) {
  out[0] = a[0];
  out[1] = a[1];
  out[2] = a[2];
  out[3] = a[3];
  return out;
}
/**
 * Set a mat2 to the identity matrix
 *
 * @param {mat2} out the receiving matrix
 * @returns {mat2} out
 */

function identity$5(out) {
  out[0] = 1;
  out[1] = 0;
  out[2] = 0;
  out[3] = 1;
  return out;
}
/**
 * Create a new mat2 with the given values
 *
 * @param {Number} m00 Component in column 0, row 0 position (index 0)
 * @param {Number} m01 Component in column 0, row 1 position (index 1)
 * @param {Number} m10 Component in column 1, row 0 position (index 2)
 * @param {Number} m11 Component in column 1, row 1 position (index 3)
 * @returns {mat2} out A new 2x2 matrix
 */

function fromValues$8(m00, m01, m10, m11) {
  var out = new ARRAY_TYPE(4);
  out[0] = m00;
  out[1] = m01;
  out[2] = m10;
  out[3] = m11;
  return out;
}
/**
 * Set the components of a mat2 to the given values
 *
 * @param {mat2} out the receiving matrix
 * @param {Number} m00 Component in column 0, row 0 position (index 0)
 * @param {Number} m01 Component in column 0, row 1 position (index 1)
 * @param {Number} m10 Component in column 1, row 0 position (index 2)
 * @param {Number} m11 Component in column 1, row 1 position (index 3)
 * @returns {mat2} out
 */

function set$8(out, m00, m01, m10, m11) {
  out[0] = m00;
  out[1] = m01;
  out[2] = m10;
  out[3] = m11;
  return out;
}
/**
 * Transpose the values of a mat2
 *
 * @param {mat2} out the receiving matrix
 * @param {ReadonlyMat2} a the source matrix
 * @returns {mat2} out
 */

function transpose$2(out, a) {
  // If we are transposing ourselves we can skip a few steps but have to cache
  // some values
  if (out === a) {
    var a1 = a[1];
    out[1] = a[2];
    out[2] = a1;
  } else {
    out[0] = a[0];
    out[1] = a[2];
    out[2] = a[1];
    out[3] = a[3];
  }

  return out;
}
/**
 * Inverts a mat2
 *
 * @param {mat2} out the receiving matrix
 * @param {ReadonlyMat2} a the source matrix
 * @returns {mat2} out
 */

function invert$5(out, a) {
  var a0 = a[0],
      a1 = a[1],
      a2 = a[2],
      a3 = a[3]; // Calculate the determinant

  var det = a0 * a3 - a2 * a1;

  if (!det) {
    return null;
  }

  det = 1.0 / det;
  out[0] = a3 * det;
  out[1] = -a1 * det;
  out[2] = -a2 * det;
  out[3] = a0 * det;
  return out;
}
/**
 * Calculates the adjugate of a mat2
 *
 * @param {mat2} out the receiving matrix
 * @param {ReadonlyMat2} a the source matrix
 * @returns {mat2} out
 */

function adjoint$2(out, a) {
  // Caching this value is nessecary if out == a
  var a0 = a[0];
  out[0] = a[3];
  out[1] = -a[1];
  out[2] = -a[2];
  out[3] = a0;
  return out;
}
/**
 * Calculates the determinant of a mat2
 *
 * @param {ReadonlyMat2} a the source matrix
 * @returns {Number} determinant of a
 */

function determinant$3(a) {
  return a[0] * a[3] - a[2] * a[1];
}
/**
 * Multiplies two mat2's
 *
 * @param {mat2} out the receiving matrix
 * @param {ReadonlyMat2} a the first operand
 * @param {ReadonlyMat2} b the second operand
 * @returns {mat2} out
 */

function multiply$8(out, a, b) {
  var a0 = a[0],
      a1 = a[1],
      a2 = a[2],
      a3 = a[3];
  var b0 = b[0],
      b1 = b[1],
      b2 = b[2],
      b3 = b[3];
  out[0] = a0 * b0 + a2 * b1;
  out[1] = a1 * b0 + a3 * b1;
  out[2] = a0 * b2 + a2 * b3;
  out[3] = a1 * b2 + a3 * b3;
  return out;
}
/**
 * Rotates a mat2 by the given angle
 *
 * @param {mat2} out the receiving matrix
 * @param {ReadonlyMat2} a the matrix to rotate
 * @param {Number} rad the angle to rotate the matrix by
 * @returns {mat2} out
 */

function rotate$4(out, a, rad) {
  var a0 = a[0],
      a1 = a[1],
      a2 = a[2],
      a3 = a[3];
  var s = Math.sin(rad);
  var c = Math.cos(rad);
  out[0] = a0 * c + a2 * s;
  out[1] = a1 * c + a3 * s;
  out[2] = a0 * -s + a2 * c;
  out[3] = a1 * -s + a3 * c;
  return out;
}
/**
 * Scales the mat2 by the dimensions in the given vec2
 *
 * @param {mat2} out the receiving matrix
 * @param {ReadonlyMat2} a the matrix to rotate
 * @param {ReadonlyVec2} v the vec2 to scale the matrix by
 * @returns {mat2} out
 **/

function scale$8(out, a, v) {
  var a0 = a[0],
      a1 = a[1],
      a2 = a[2],
      a3 = a[3];
  var v0 = v[0],
      v1 = v[1];
  out[0] = a0 * v0;
  out[1] = a1 * v0;
  out[2] = a2 * v1;
  out[3] = a3 * v1;
  return out;
}
/**
 * Creates a matrix from a given angle
 * This is equivalent to (but much faster than):
 *
 *     mat2.identity(dest);
 *     mat2.rotate(dest, dest, rad);
 *
 * @param {mat2} out mat2 receiving operation result
 * @param {Number} rad the angle to rotate the matrix by
 * @returns {mat2} out
 */

function fromRotation$4(out, rad) {
  var s = Math.sin(rad);
  var c = Math.cos(rad);
  out[0] = c;
  out[1] = s;
  out[2] = -s;
  out[3] = c;
  return out;
}
/**
 * Creates a matrix from a vector scaling
 * This is equivalent to (but much faster than):
 *
 *     mat2.identity(dest);
 *     mat2.scale(dest, dest, vec);
 *
 * @param {mat2} out mat2 receiving operation result
 * @param {ReadonlyVec2} v Scaling vector
 * @returns {mat2} out
 */

function fromScaling$3(out, v) {
  out[0] = v[0];
  out[1] = 0;
  out[2] = 0;
  out[3] = v[1];
  return out;
}
/**
 * Returns a string representation of a mat2
 *
 * @param {ReadonlyMat2} a matrix to represent as a string
 * @returns {String} string representation of the matrix
 */

function str$8(a) {
  return "mat2(" + a[0] + ", " + a[1] + ", " + a[2] + ", " + a[3] + ")";
}
/**
 * Returns Frobenius norm of a mat2
 *
 * @param {ReadonlyMat2} a the matrix to calculate Frobenius norm of
 * @returns {Number} Frobenius norm
 */

function frob$3(a) {
  return Math.hypot(a[0], a[1], a[2], a[3]);
}
/**
 * Returns L, D and U matrices (Lower triangular, Diagonal and Upper triangular) by factorizing the input matrix
 * @param {ReadonlyMat2} L the lower triangular matrix
 * @param {ReadonlyMat2} D the diagonal matrix
 * @param {ReadonlyMat2} U the upper triangular matrix
 * @param {ReadonlyMat2} a the input matrix to factorize
 */

function LDU(L, D, U, a) {
  L[2] = a[2] / a[0];
  U[0] = a[0];
  U[1] = a[1];
  U[3] = a[3] - L[2] * U[1];
  return [L, D, U];
}
/**
 * Adds two mat2's
 *
 * @param {mat2} out the receiving matrix
 * @param {ReadonlyMat2} a the first operand
 * @param {ReadonlyMat2} b the second operand
 * @returns {mat2} out
 */

function add$8(out, a, b) {
  out[0] = a[0] + b[0];
  out[1] = a[1] + b[1];
  out[2] = a[2] + b[2];
  out[3] = a[3] + b[3];
  return out;
}
/**
 * Subtracts matrix b from matrix a
 *
 * @param {mat2} out the receiving matrix
 * @param {ReadonlyMat2} a the first operand
 * @param {ReadonlyMat2} b the second operand
 * @returns {mat2} out
 */

function subtract$6(out, a, b) {
  out[0] = a[0] - b[0];
  out[1] = a[1] - b[1];
  out[2] = a[2] - b[2];
  out[3] = a[3] - b[3];
  return out;
}
/**
 * Returns whether or not the matrices have exactly the same elements in the same position (when compared with ===)
 *
 * @param {ReadonlyMat2} a The first matrix.
 * @param {ReadonlyMat2} b The second matrix.
 * @returns {Boolean} True if the matrices are equal, false otherwise.
 */

function exactEquals$8(a, b) {
  return a[0] === b[0] && a[1] === b[1] && a[2] === b[2] && a[3] === b[3];
}
/**
 * Returns whether or not the matrices have approximately the same elements in the same position.
 *
 * @param {ReadonlyMat2} a The first matrix.
 * @param {ReadonlyMat2} b The second matrix.
 * @returns {Boolean} True if the matrices are equal, false otherwise.
 */

function equals$8(a, b) {
  var a0 = a[0],
      a1 = a[1],
      a2 = a[2],
      a3 = a[3];
  var b0 = b[0],
      b1 = b[1],
      b2 = b[2],
      b3 = b[3];
  return Math.abs(a0 - b0) <= EPSILON * Math.max(1.0, Math.abs(a0), Math.abs(b0)) && Math.abs(a1 - b1) <= EPSILON * Math.max(1.0, Math.abs(a1), Math.abs(b1)) && Math.abs(a2 - b2) <= EPSILON * Math.max(1.0, Math.abs(a2), Math.abs(b2)) && Math.abs(a3 - b3) <= EPSILON * Math.max(1.0, Math.abs(a3), Math.abs(b3));
}
/**
 * Multiply each element of the matrix by a scalar.
 *
 * @param {mat2} out the receiving matrix
 * @param {ReadonlyMat2} a the matrix to scale
 * @param {Number} b amount to scale the matrix's elements by
 * @returns {mat2} out
 */

function multiplyScalar$3(out, a, b) {
  out[0] = a[0] * b;
  out[1] = a[1] * b;
  out[2] = a[2] * b;
  out[3] = a[3] * b;
  return out;
}
/**
 * Adds two mat2's after multiplying each element of the second operand by a scalar value.
 *
 * @param {mat2} out the receiving vector
 * @param {ReadonlyMat2} a the first operand
 * @param {ReadonlyMat2} b the second operand
 * @param {Number} scale the amount to scale b's elements by before adding
 * @returns {mat2} out
 */

function multiplyScalarAndAdd$3(out, a, b, scale) {
  out[0] = a[0] + b[0] * scale;
  out[1] = a[1] + b[1] * scale;
  out[2] = a[2] + b[2] * scale;
  out[3] = a[3] + b[3] * scale;
  return out;
}
/**
 * Alias for {@link mat2.multiply}
 * @function
 */

var mul$8 = multiply$8;
/**
 * Alias for {@link mat2.subtract}
 * @function
 */

var sub$6 = subtract$6;

var mat2 = /*#__PURE__*/Object.freeze({
__proto__: null,
LDU: LDU,
add: add$8,
adjoint: adjoint$2,
clone: clone$8,
copy: copy$8,
create: create$8,
determinant: determinant$3,
equals: equals$8,
exactEquals: exactEquals$8,
frob: frob$3,
fromRotation: fromRotation$4,
fromScaling: fromScaling$3,
fromValues: fromValues$8,
identity: identity$5,
invert: invert$5,
mul: mul$8,
multiply: multiply$8,
multiplyScalar: multiplyScalar$3,
multiplyScalarAndAdd: multiplyScalarAndAdd$3,
rotate: rotate$4,
scale: scale$8,
set: set$8,
str: str$8,
sub: sub$6,
subtract: subtract$6,
transpose: transpose$2
});

/**
 * 2x3 Matrix
 * @module mat2d
 * @description
 * A mat2d contains six elements defined as:
 * <pre>
 * [a, b,
 *  c, d,
 *  tx, ty]
 * </pre>
 * This is a short form for the 3x3 matrix:
 * <pre>
 * [a, b, 0,
 *  c, d, 0,
 *  tx, ty, 1]
 * </pre>
 * The last column is ignored so the array is shorter and operations are faster.
 */

/**
 * Creates a new identity mat2d
 *
 * @returns {mat2d} a new 2x3 matrix
 */

function create$7() {
  var out = new ARRAY_TYPE(6);

  if (ARRAY_TYPE != Float32Array) {
    out[1] = 0;
    out[2] = 0;
    out[4] = 0;
    out[5] = 0;
  }

  out[0] = 1;
  out[3] = 1;
  return out;
}
/**
 * Creates a new mat2d initialized with values from an existing matrix
 *
 * @param {ReadonlyMat2d} a matrix to clone
 * @returns {mat2d} a new 2x3 matrix
 */

function clone$7(a) {
  var out = new ARRAY_TYPE(6);
  out[0] = a[0];
  out[1] = a[1];
  out[2] = a[2];
  out[3] = a[3];
  out[4] = a[4];
  out[5] = a[5];
  return out;
}
/**
 * Copy the values from one mat2d to another
 *
 * @param {mat2d} out the receiving matrix
 * @param {ReadonlyMat2d} a the source matrix
 * @returns {mat2d} out
 */

function copy$7(out, a) {
  out[0] = a[0];
  out[1] = a[1];
  out[2] = a[2];
  out[3] = a[3];
  out[4] = a[4];
  out[5] = a[5];
  return out;
}
/**
 * Set a mat2d to the identity matrix
 *
 * @param {mat2d} out the receiving matrix
 * @returns {mat2d} out
 */

function identity$4(out) {
  out[0] = 1;
  out[1] = 0;
  out[2] = 0;
  out[3] = 1;
  out[4] = 0;
  out[5] = 0;
  return out;
}
/**
 * Create a new mat2d with the given values
 *
 * @param {Number} a Component A (index 0)
 * @param {Number} b Component B (index 1)
 * @param {Number} c Component C (index 2)
 * @param {Number} d Component D (index 3)
 * @param {Number} tx Component TX (index 4)
 * @param {Number} ty Component TY (index 5)
 * @returns {mat2d} A new mat2d
 */

function fromValues$7(a, b, c, d, tx, ty) {
  var out = new ARRAY_TYPE(6);
  out[0] = a;
  out[1] = b;
  out[2] = c;
  out[3] = d;
  out[4] = tx;
  out[5] = ty;
  return out;
}
/**
 * Set the components of a mat2d to the given values
 *
 * @param {mat2d} out the receiving matrix
 * @param {Number} a Component A (index 0)
 * @param {Number} b Component B (index 1)
 * @param {Number} c Component C (index 2)
 * @param {Number} d Component D (index 3)
 * @param {Number} tx Component TX (index 4)
 * @param {Number} ty Component TY (index 5)
 * @returns {mat2d} out
 */

function set$7(out, a, b, c, d, tx, ty) {
  out[0] = a;
  out[1] = b;
  out[2] = c;
  out[3] = d;
  out[4] = tx;
  out[5] = ty;
  return out;
}
/**
 * Inverts a mat2d
 *
 * @param {mat2d} out the receiving matrix
 * @param {ReadonlyMat2d} a the source matrix
 * @returns {mat2d} out
 */

function invert$4(out, a) {
  var aa = a[0],
      ab = a[1],
      ac = a[2],
      ad = a[3];
  var atx = a[4],
      aty = a[5];
  var det = aa * ad - ab * ac;

  if (!det) {
    return null;
  }

  det = 1.0 / det;
  out[0] = ad * det;
  out[1] = -ab * det;
  out[2] = -ac * det;
  out[3] = aa * det;
  out[4] = (ac * aty - ad * atx) * det;
  out[5] = (ab * atx - aa * aty) * det;
  return out;
}
/**
 * Calculates the determinant of a mat2d
 *
 * @param {ReadonlyMat2d} a the source matrix
 * @returns {Number} determinant of a
 */

function determinant$2(a) {
  return a[0] * a[3] - a[1] * a[2];
}
/**
 * Multiplies two mat2d's
 *
 * @param {mat2d} out the receiving matrix
 * @param {ReadonlyMat2d} a the first operand
 * @param {ReadonlyMat2d} b the second operand
 * @returns {mat2d} out
 */

function multiply$7(out, a, b) {
  var a0 = a[0],
      a1 = a[1],
      a2 = a[2],
      a3 = a[3],
      a4 = a[4],
      a5 = a[5];
  var b0 = b[0],
      b1 = b[1],
      b2 = b[2],
      b3 = b[3],
      b4 = b[4],
      b5 = b[5];
  out[0] = a0 * b0 + a2 * b1;
  out[1] = a1 * b0 + a3 * b1;
  out[2] = a0 * b2 + a2 * b3;
  out[3] = a1 * b2 + a3 * b3;
  out[4] = a0 * b4 + a2 * b5 + a4;
  out[5] = a1 * b4 + a3 * b5 + a5;
  return out;
}
/**
 * Rotates a mat2d by the given angle
 *
 * @param {mat2d} out the receiving matrix
 * @param {ReadonlyMat2d} a the matrix to rotate
 * @param {Number} rad the angle to rotate the matrix by
 * @returns {mat2d} out
 */

function rotate$3(out, a, rad) {
  var a0 = a[0],
      a1 = a[1],
      a2 = a[2],
      a3 = a[3],
      a4 = a[4],
      a5 = a[5];
  var s = Math.sin(rad);
  var c = Math.cos(rad);
  out[0] = a0 * c + a2 * s;
  out[1] = a1 * c + a3 * s;
  out[2] = a0 * -s + a2 * c;
  out[3] = a1 * -s + a3 * c;
  out[4] = a4;
  out[5] = a5;
  return out;
}
/**
 * Scales the mat2d by the dimensions in the given vec2
 *
 * @param {mat2d} out the receiving matrix
 * @param {ReadonlyMat2d} a the matrix to translate
 * @param {ReadonlyVec2} v the vec2 to scale the matrix by
 * @returns {mat2d} out
 **/

function scale$7(out, a, v) {
  var a0 = a[0],
      a1 = a[1],
      a2 = a[2],
      a3 = a[3],
      a4 = a[4],
      a5 = a[5];
  var v0 = v[0],
      v1 = v[1];
  out[0] = a0 * v0;
  out[1] = a1 * v0;
  out[2] = a2 * v1;
  out[3] = a3 * v1;
  out[4] = a4;
  out[5] = a5;
  return out;
}
/**
 * Translates the mat2d by the dimensions in the given vec2
 *
 * @param {mat2d} out the receiving matrix
 * @param {ReadonlyMat2d} a the matrix to translate
 * @param {ReadonlyVec2} v the vec2 to translate the matrix by
 * @returns {mat2d} out
 **/

function translate$3(out, a, v) {
  var a0 = a[0],
      a1 = a[1],
      a2 = a[2],
      a3 = a[3],
      a4 = a[4],
      a5 = a[5];
  var v0 = v[0],
      v1 = v[1];
  out[0] = a0;
  out[1] = a1;
  out[2] = a2;
  out[3] = a3;
  out[4] = a0 * v0 + a2 * v1 + a4;
  out[5] = a1 * v0 + a3 * v1 + a5;
  return out;
}
/**
 * Creates a matrix from a given angle
 * This is equivalent to (but much faster than):
 *
 *     mat2d.identity(dest);
 *     mat2d.rotate(dest, dest, rad);
 *
 * @param {mat2d} out mat2d receiving operation result
 * @param {Number} rad the angle to rotate the matrix by
 * @returns {mat2d} out
 */

function fromRotation$3(out, rad) {
  var s = Math.sin(rad),
      c = Math.cos(rad);
  out[0] = c;
  out[1] = s;
  out[2] = -s;
  out[3] = c;
  out[4] = 0;
  out[5] = 0;
  return out;
}
/**
 * Creates a matrix from a vector scaling
 * This is equivalent to (but much faster than):
 *
 *     mat2d.identity(dest);
 *     mat2d.scale(dest, dest, vec);
 *
 * @param {mat2d} out mat2d receiving operation result
 * @param {ReadonlyVec2} v Scaling vector
 * @returns {mat2d} out
 */

function fromScaling$2(out, v) {
  out[0] = v[0];
  out[1] = 0;
  out[2] = 0;
  out[3] = v[1];
  out[4] = 0;
  out[5] = 0;
  return out;
}
/**
 * Creates a matrix from a vector translation
 * This is equivalent to (but much faster than):
 *
 *     mat2d.identity(dest);
 *     mat2d.translate(dest, dest, vec);
 *
 * @param {mat2d} out mat2d receiving operation result
 * @param {ReadonlyVec2} v Translation vector
 * @returns {mat2d} out
 */

function fromTranslation$3(out, v) {
  out[0] = 1;
  out[1] = 0;
  out[2] = 0;
  out[3] = 1;
  out[4] = v[0];
  out[5] = v[1];
  return out;
}
/**
 * Returns a string representation of a mat2d
 *
 * @param {ReadonlyMat2d} a matrix to represent as a string
 * @returns {String} string representation of the matrix
 */

function str$7(a) {
  return "mat2d(" + a[0] + ", " + a[1] + ", " + a[2] + ", " + a[3] + ", " + a[4] + ", " + a[5] + ")";
}
/**
 * Returns Frobenius norm of a mat2d
 *
 * @param {ReadonlyMat2d} a the matrix to calculate Frobenius norm of
 * @returns {Number} Frobenius norm
 */

function frob$2(a) {
  return Math.hypot(a[0], a[1], a[2], a[3], a[4], a[5], 1);
}
/**
 * Adds two mat2d's
 *
 * @param {mat2d} out the receiving matrix
 * @param {ReadonlyMat2d} a the first operand
 * @param {ReadonlyMat2d} b the second operand
 * @returns {mat2d} out
 */

function add$7(out, a, b) {
  out[0] = a[0] + b[0];
  out[1] = a[1] + b[1];
  out[2] = a[2] + b[2];
  out[3] = a[3] + b[3];
  out[4] = a[4] + b[4];
  out[5] = a[5] + b[5];
  return out;
}
/**
 * Subtracts matrix b from matrix a
 *
 * @param {mat2d} out the receiving matrix
 * @param {ReadonlyMat2d} a the first operand
 * @param {ReadonlyMat2d} b the second operand
 * @returns {mat2d} out
 */

function subtract$5(out, a, b) {
  out[0] = a[0] - b[0];
  out[1] = a[1] - b[1];
  out[2] = a[2] - b[2];
  out[3] = a[3] - b[3];
  out[4] = a[4] - b[4];
  out[5] = a[5] - b[5];
  return out;
}
/**
 * Multiply each element of the matrix by a scalar.
 *
 * @param {mat2d} out the receiving matrix
 * @param {ReadonlyMat2d} a the matrix to scale
 * @param {Number} b amount to scale the matrix's elements by
 * @returns {mat2d} out
 */

function multiplyScalar$2(out, a, b) {
  out[0] = a[0] * b;
  out[1] = a[1] * b;
  out[2] = a[2] * b;
  out[3] = a[3] * b;
  out[4] = a[4] * b;
  out[5] = a[5] * b;
  return out;
}
/**
 * Adds two mat2d's after multiplying each element of the second operand by a scalar value.
 *
 * @param {mat2d} out the receiving vector
 * @param {ReadonlyMat2d} a the first operand
 * @param {ReadonlyMat2d} b the second operand
 * @param {Number} scale the amount to scale b's elements by before adding
 * @returns {mat2d} out
 */

function multiplyScalarAndAdd$2(out, a, b, scale) {
  out[0] = a[0] + b[0] * scale;
  out[1] = a[1] + b[1] * scale;
  out[2] = a[2] + b[2] * scale;
  out[3] = a[3] + b[3] * scale;
  out[4] = a[4] + b[4] * scale;
  out[5] = a[5] + b[5] * scale;
  return out;
}
/**
 * Returns whether or not the matrices have exactly the same elements in the same position (when compared with ===)
 *
 * @param {ReadonlyMat2d} a The first matrix.
 * @param {ReadonlyMat2d} b The second matrix.
 * @returns {Boolean} True if the matrices are equal, false otherwise.
 */

function exactEquals$7(a, b) {
  return a[0] === b[0] && a[1] === b[1] && a[2] === b[2] && a[3] === b[3] && a[4] === b[4] && a[5] === b[5];
}
/**
 * Returns whether or not the matrices have approximately the same elements in the same position.
 *
 * @param {ReadonlyMat2d} a The first matrix.
 * @param {ReadonlyMat2d} b The second matrix.
 * @returns {Boolean} True if the matrices are equal, false otherwise.
 */

function equals$7(a, b) {
  var a0 = a[0],
      a1 = a[1],
      a2 = a[2],
      a3 = a[3],
      a4 = a[4],
      a5 = a[5];
  var b0 = b[0],
      b1 = b[1],
      b2 = b[2],
      b3 = b[3],
      b4 = b[4],
      b5 = b[5];
  return Math.abs(a0 - b0) <= EPSILON * Math.max(1.0, Math.abs(a0), Math.abs(b0)) && Math.abs(a1 - b1) <= EPSILON * Math.max(1.0, Math.abs(a1), Math.abs(b1)) && Math.abs(a2 - b2) <= EPSILON * Math.max(1.0, Math.abs(a2), Math.abs(b2)) && Math.abs(a3 - b3) <= EPSILON * Math.max(1.0, Math.abs(a3), Math.abs(b3)) && Math.abs(a4 - b4) <= EPSILON * Math.max(1.0, Math.abs(a4), Math.abs(b4)) && Math.abs(a5 - b5) <= EPSILON * Math.max(1.0, Math.abs(a5), Math.abs(b5));
}
/**
 * Alias for {@link mat2d.multiply}
 * @function
 */

var mul$7 = multiply$7;
/**
 * Alias for {@link mat2d.subtract}
 * @function
 */

var sub$5 = subtract$5;

var mat2d = /*#__PURE__*/Object.freeze({
__proto__: null,
add: add$7,
clone: clone$7,
copy: copy$7,
create: create$7,
determinant: determinant$2,
equals: equals$7,
exactEquals: exactEquals$7,
frob: frob$2,
fromRotation: fromRotation$3,
fromScaling: fromScaling$2,
fromTranslation: fromTranslation$3,
fromValues: fromValues$7,
identity: identity$4,
invert: invert$4,
mul: mul$7,
multiply: multiply$7,
multiplyScalar: multiplyScalar$2,
multiplyScalarAndAdd: multiplyScalarAndAdd$2,
rotate: rotate$3,
scale: scale$7,
set: set$7,
str: str$7,
sub: sub$5,
subtract: subtract$5,
translate: translate$3
});

/**
 * 3x3 Matrix
 * @module mat3
 */

/**
 * Creates a new identity mat3
 *
 * @returns {mat3} a new 3x3 matrix
 */

function create$6() {
  var out = new ARRAY_TYPE(9);

  if (ARRAY_TYPE != Float32Array) {
    out[1] = 0;
    out[2] = 0;
    out[3] = 0;
    out[5] = 0;
    out[6] = 0;
    out[7] = 0;
  }

  out[0] = 1;
  out[4] = 1;
  out[8] = 1;
  return out;
}
/**
 * Copies the upper-left 3x3 values into the given mat3.
 *
 * @param {mat3} out the receiving 3x3 matrix
 * @param {ReadonlyMat4} a   the source 4x4 matrix
 * @returns {mat3} out
 */

function fromMat4$1(out, a) {
  out[0] = a[0];
  out[1] = a[1];
  out[2] = a[2];
  out[3] = a[4];
  out[4] = a[5];
  out[5] = a[6];
  out[6] = a[8];
  out[7] = a[9];
  out[8] = a[10];
  return out;
}
/**
 * Creates a new mat3 initialized with values from an existing matrix
 *
 * @param {ReadonlyMat3} a matrix to clone
 * @returns {mat3} a new 3x3 matrix
 */

function clone$6(a) {
  var out = new ARRAY_TYPE(9);
  out[0] = a[0];
  out[1] = a[1];
  out[2] = a[2];
  out[3] = a[3];
  out[4] = a[4];
  out[5] = a[5];
  out[6] = a[6];
  out[7] = a[7];
  out[8] = a[8];
  return out;
}
/**
 * Copy the values from one mat3 to another
 *
 * @param {mat3} out the receiving matrix
 * @param {ReadonlyMat3} a the source matrix
 * @returns {mat3} out
 */

function copy$6(out, a) {
  out[0] = a[0];
  out[1] = a[1];
  out[2] = a[2];
  out[3] = a[3];
  out[4] = a[4];
  out[5] = a[5];
  out[6] = a[6];
  out[7] = a[7];
  out[8] = a[8];
  return out;
}
/**
 * Create a new mat3 with the given values
 *
 * @param {Number} m00 Component in column 0, row 0 position (index 0)
 * @param {Number} m01 Component in column 0, row 1 position (index 1)
 * @param {Number} m02 Component in column 0, row 2 position (index 2)
 * @param {Number} m10 Component in column 1, row 0 position (index 3)
 * @param {Number} m11 Component in column 1, row 1 position (index 4)
 * @param {Number} m12 Component in column 1, row 2 position (index 5)
 * @param {Number} m20 Component in column 2, row 0 position (index 6)
 * @param {Number} m21 Component in column 2, row 1 position (index 7)
 * @param {Number} m22 Component in column 2, row 2 position (index 8)
 * @returns {mat3} A new mat3
 */

function fromValues$6(m00, m01, m02, m10, m11, m12, m20, m21, m22) {
  var out = new ARRAY_TYPE(9);
  out[0] = m00;
  out[1] = m01;
  out[2] = m02;
  out[3] = m10;
  out[4] = m11;
  out[5] = m12;
  out[6] = m20;
  out[7] = m21;
  out[8] = m22;
  return out;
}
/**
 * Set the components of a mat3 to the given values
 *
 * @param {mat3} out the receiving matrix
 * @param {Number} m00 Component in column 0, row 0 position (index 0)
 * @param {Number} m01 Component in column 0, row 1 position (index 1)
 * @param {Number} m02 Component in column 0, row 2 position (index 2)
 * @param {Number} m10 Component in column 1, row 0 position (index 3)
 * @param {Number} m11 Component in column 1, row 1 position (index 4)
 * @param {Number} m12 Component in column 1, row 2 position (index 5)
 * @param {Number} m20 Component in column 2, row 0 position (index 6)
 * @param {Number} m21 Component in column 2, row 1 position (index 7)
 * @param {Number} m22 Component in column 2, row 2 position (index 8)
 * @returns {mat3} out
 */

function set$6(out, m00, m01, m02, m10, m11, m12, m20, m21, m22) {
  out[0] = m00;
  out[1] = m01;
  out[2] = m02;
  out[3] = m10;
  out[4] = m11;
  out[5] = m12;
  out[6] = m20;
  out[7] = m21;
  out[8] = m22;
  return out;
}
/**
 * Set a mat3 to the identity matrix
 *
 * @param {mat3} out the receiving matrix
 * @returns {mat3} out
 */

function identity$3(out) {
  out[0] = 1;
  out[1] = 0;
  out[2] = 0;
  out[3] = 0;
  out[4] = 1;
  out[5] = 0;
  out[6] = 0;
  out[7] = 0;
  out[8] = 1;
  return out;
}
/**
 * Transpose the values of a mat3
 *
 * @param {mat3} out the receiving matrix
 * @param {ReadonlyMat3} a the source matrix
 * @returns {mat3} out
 */

function transpose$1(out, a) {
  // If we are transposing ourselves we can skip a few steps but have to cache some values
  if (out === a) {
    var a01 = a[1],
        a02 = a[2],
        a12 = a[5];
    out[1] = a[3];
    out[2] = a[6];
    out[3] = a01;
    out[5] = a[7];
    out[6] = a02;
    out[7] = a12;
  } else {
    out[0] = a[0];
    out[1] = a[3];
    out[2] = a[6];
    out[3] = a[1];
    out[4] = a[4];
    out[5] = a[7];
    out[6] = a[2];
    out[7] = a[5];
    out[8] = a[8];
  }

  return out;
}
/**
 * Inverts a mat3
 *
 * @param {mat3} out the receiving matrix
 * @param {ReadonlyMat3} a the source matrix
 * @returns {mat3} out
 */

function invert$3(out, a) {
  var a00 = a[0],
      a01 = a[1],
      a02 = a[2];
  var a10 = a[3],
      a11 = a[4],
      a12 = a[5];
  var a20 = a[6],
      a21 = a[7],
      a22 = a[8];
  var b01 = a22 * a11 - a12 * a21;
  var b11 = -a22 * a10 + a12 * a20;
  var b21 = a21 * a10 - a11 * a20; // Calculate the determinant

  var det = a00 * b01 + a01 * b11 + a02 * b21;

  if (!det) {
    return null;
  }

  det = 1.0 / det;
  out[0] = b01 * det;
  out[1] = (-a22 * a01 + a02 * a21) * det;
  out[2] = (a12 * a01 - a02 * a11) * det;
  out[3] = b11 * det;
  out[4] = (a22 * a00 - a02 * a20) * det;
  out[5] = (-a12 * a00 + a02 * a10) * det;
  out[6] = b21 * det;
  out[7] = (-a21 * a00 + a01 * a20) * det;
  out[8] = (a11 * a00 - a01 * a10) * det;
  return out;
}
/**
 * Calculates the adjugate of a mat3
 *
 * @param {mat3} out the receiving matrix
 * @param {ReadonlyMat3} a the source matrix
 * @returns {mat3} out
 */

function adjoint$1(out, a) {
  var a00 = a[0],
      a01 = a[1],
      a02 = a[2];
  var a10 = a[3],
      a11 = a[4],
      a12 = a[5];
  var a20 = a[6],
      a21 = a[7],
      a22 = a[8];
  out[0] = a11 * a22 - a12 * a21;
  out[1] = a02 * a21 - a01 * a22;
  out[2] = a01 * a12 - a02 * a11;
  out[3] = a12 * a20 - a10 * a22;
  out[4] = a00 * a22 - a02 * a20;
  out[5] = a02 * a10 - a00 * a12;
  out[6] = a10 * a21 - a11 * a20;
  out[7] = a01 * a20 - a00 * a21;
  out[8] = a00 * a11 - a01 * a10;
  return out;
}
/**
 * Calculates the determinant of a mat3
 *
 * @param {ReadonlyMat3} a the source matrix
 * @returns {Number} determinant of a
 */

function determinant$1(a) {
  var a00 = a[0],
      a01 = a[1],
      a02 = a[2];
  var a10 = a[3],
      a11 = a[4],
      a12 = a[5];
  var a20 = a[6],
      a21 = a[7],
      a22 = a[8];
  return a00 * (a22 * a11 - a12 * a21) + a01 * (-a22 * a10 + a12 * a20) + a02 * (a21 * a10 - a11 * a20);
}
/**
 * Multiplies two mat3's
 *
 * @param {mat3} out the receiving matrix
 * @param {ReadonlyMat3} a the first operand
 * @param {ReadonlyMat3} b the second operand
 * @returns {mat3} out
 */

function multiply$6(out, a, b) {
  var a00 = a[0],
      a01 = a[1],
      a02 = a[2];
  var a10 = a[3],
      a11 = a[4],
      a12 = a[5];
  var a20 = a[6],
      a21 = a[7],
      a22 = a[8];
  var b00 = b[0],
      b01 = b[1],
      b02 = b[2];
  var b10 = b[3],
      b11 = b[4],
      b12 = b[5];
  var b20 = b[6],
      b21 = b[7],
      b22 = b[8];
  out[0] = b00 * a00 + b01 * a10 + b02 * a20;
  out[1] = b00 * a01 + b01 * a11 + b02 * a21;
  out[2] = b00 * a02 + b01 * a12 + b02 * a22;
  out[3] = b10 * a00 + b11 * a10 + b12 * a20;
  out[4] = b10 * a01 + b11 * a11 + b12 * a21;
  out[5] = b10 * a02 + b11 * a12 + b12 * a22;
  out[6] = b20 * a00 + b21 * a10 + b22 * a20;
  out[7] = b20 * a01 + b21 * a11 + b22 * a21;
  out[8] = b20 * a02 + b21 * a12 + b22 * a22;
  return out;
}
/**
 * Translate a mat3 by the given vector
 *
 * @param {mat3} out the receiving matrix
 * @param {ReadonlyMat3} a the matrix to translate
 * @param {ReadonlyVec2} v vector to translate by
 * @returns {mat3} out
 */

function translate$2(out, a, v) {
  var a00 = a[0],
      a01 = a[1],
      a02 = a[2],
      a10 = a[3],
      a11 = a[4],
      a12 = a[5],
      a20 = a[6],
      a21 = a[7],
      a22 = a[8],
      x = v[0],
      y = v[1];
  out[0] = a00;
  out[1] = a01;
  out[2] = a02;
  out[3] = a10;
  out[4] = a11;
  out[5] = a12;
  out[6] = x * a00 + y * a10 + a20;
  out[7] = x * a01 + y * a11 + a21;
  out[8] = x * a02 + y * a12 + a22;
  return out;
}
/**
 * Rotates a mat3 by the given angle
 *
 * @param {mat3} out the receiving matrix
 * @param {ReadonlyMat3} a the matrix to rotate
 * @param {Number} rad the angle to rotate the matrix by
 * @returns {mat3} out
 */

function rotate$2(out, a, rad) {
  var a00 = a[0],
      a01 = a[1],
      a02 = a[2],
      a10 = a[3],
      a11 = a[4],
      a12 = a[5],
      a20 = a[6],
      a21 = a[7],
      a22 = a[8],
      s = Math.sin(rad),
      c = Math.cos(rad);
  out[0] = c * a00 + s * a10;
  out[1] = c * a01 + s * a11;
  out[2] = c * a02 + s * a12;
  out[3] = c * a10 - s * a00;
  out[4] = c * a11 - s * a01;
  out[5] = c * a12 - s * a02;
  out[6] = a20;
  out[7] = a21;
  out[8] = a22;
  return out;
}
/**
 * Scales the mat3 by the dimensions in the given vec2
 *
 * @param {mat3} out the receiving matrix
 * @param {ReadonlyMat3} a the matrix to rotate
 * @param {ReadonlyVec2} v the vec2 to scale the matrix by
 * @returns {mat3} out
 **/

function scale$6(out, a, v) {
  var x = v[0],
      y = v[1];
  out[0] = x * a[0];
  out[1] = x * a[1];
  out[2] = x * a[2];
  out[3] = y * a[3];
  out[4] = y * a[4];
  out[5] = y * a[5];
  out[6] = a[6];
  out[7] = a[7];
  out[8] = a[8];
  return out;
}
/**
 * Creates a matrix from a vector translation
 * This is equivalent to (but much faster than):
 *
 *     mat3.identity(dest);
 *     mat3.translate(dest, dest, vec);
 *
 * @param {mat3} out mat3 receiving operation result
 * @param {ReadonlyVec2} v Translation vector
 * @returns {mat3} out
 */

function fromTranslation$2(out, v) {
  out[0] = 1;
  out[1] = 0;
  out[2] = 0;
  out[3] = 0;
  out[4] = 1;
  out[5] = 0;
  out[6] = v[0];
  out[7] = v[1];
  out[8] = 1;
  return out;
}
/**
 * Creates a matrix from a given angle
 * This is equivalent to (but much faster than):
 *
 *     mat3.identity(dest);
 *     mat3.rotate(dest, dest, rad);
 *
 * @param {mat3} out mat3 receiving operation result
 * @param {Number} rad the angle to rotate the matrix by
 * @returns {mat3} out
 */

function fromRotation$2(out, rad) {
  var s = Math.sin(rad),
      c = Math.cos(rad);
  out[0] = c;
  out[1] = s;
  out[2] = 0;
  out[3] = -s;
  out[4] = c;
  out[5] = 0;
  out[6] = 0;
  out[7] = 0;
  out[8] = 1;
  return out;
}
/**
 * Creates a matrix from a vector scaling
 * This is equivalent to (but much faster than):
 *
 *     mat3.identity(dest);
 *     mat3.scale(dest, dest, vec);
 *
 * @param {mat3} out mat3 receiving operation result
 * @param {ReadonlyVec2} v Scaling vector
 * @returns {mat3} out
 */

function fromScaling$1(out, v) {
  out[0] = v[0];
  out[1] = 0;
  out[2] = 0;
  out[3] = 0;
  out[4] = v[1];
  out[5] = 0;
  out[6] = 0;
  out[7] = 0;
  out[8] = 1;
  return out;
}
/**
 * Copies the values from a mat2d into a mat3
 *
 * @param {mat3} out the receiving matrix
 * @param {ReadonlyMat2d} a the matrix to copy
 * @returns {mat3} out
 **/

function fromMat2d(out, a) {
  out[0] = a[0];
  out[1] = a[1];
  out[2] = 0;
  out[3] = a[2];
  out[4] = a[3];
  out[5] = 0;
  out[6] = a[4];
  out[7] = a[5];
  out[8] = 1;
  return out;
}
/**
 * Calculates a 3x3 matrix from the given quaternion
 *
 * @param {mat3} out mat3 receiving operation result
 * @param {ReadonlyQuat} q Quaternion to create matrix from
 *
 * @returns {mat3} out
 */

function fromQuat$1(out, q) {
  var x = q[0],
      y = q[1],
      z = q[2],
      w = q[3];
  var x2 = x + x;
  var y2 = y + y;
  var z2 = z + z;
  var xx = x * x2;
  var yx = y * x2;
  var yy = y * y2;
  var zx = z * x2;
  var zy = z * y2;
  var zz = z * z2;
  var wx = w * x2;
  var wy = w * y2;
  var wz = w * z2;
  out[0] = 1 - yy - zz;
  out[3] = yx - wz;
  out[6] = zx + wy;
  out[1] = yx + wz;
  out[4] = 1 - xx - zz;
  out[7] = zy - wx;
  out[2] = zx - wy;
  out[5] = zy + wx;
  out[8] = 1 - xx - yy;
  return out;
}
/**
 * Calculates a 3x3 normal matrix (transpose inverse) from the 4x4 matrix
 *
 * @param {mat3} out mat3 receiving operation result
 * @param {ReadonlyMat4} a Mat4 to derive the normal matrix from
 *
 * @returns {mat3} out
 */

function normalFromMat4(out, a) {
  var a00 = a[0],
      a01 = a[1],
      a02 = a[2],
      a03 = a[3];
  var a10 = a[4],
      a11 = a[5],
      a12 = a[6],
      a13 = a[7];
  var a20 = a[8],
      a21 = a[9],
      a22 = a[10],
      a23 = a[11];
  var a30 = a[12],
      a31 = a[13],
      a32 = a[14],
      a33 = a[15];
  var b00 = a00 * a11 - a01 * a10;
  var b01 = a00 * a12 - a02 * a10;
  var b02 = a00 * a13 - a03 * a10;
  var b03 = a01 * a12 - a02 * a11;
  var b04 = a01 * a13 - a03 * a11;
  var b05 = a02 * a13 - a03 * a12;
  var b06 = a20 * a31 - a21 * a30;
  var b07 = a20 * a32 - a22 * a30;
  var b08 = a20 * a33 - a23 * a30;
  var b09 = a21 * a32 - a22 * a31;
  var b10 = a21 * a33 - a23 * a31;
  var b11 = a22 * a33 - a23 * a32; // Calculate the determinant

  var det = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;

  if (!det) {
    return null;
  }

  det = 1.0 / det;
  out[0] = (a11 * b11 - a12 * b10 + a13 * b09) * det;
  out[1] = (a12 * b08 - a10 * b11 - a13 * b07) * det;
  out[2] = (a10 * b10 - a11 * b08 + a13 * b06) * det;
  out[3] = (a02 * b10 - a01 * b11 - a03 * b09) * det;
  out[4] = (a00 * b11 - a02 * b08 + a03 * b07) * det;
  out[5] = (a01 * b08 - a00 * b10 - a03 * b06) * det;
  out[6] = (a31 * b05 - a32 * b04 + a33 * b03) * det;
  out[7] = (a32 * b02 - a30 * b05 - a33 * b01) * det;
  out[8] = (a30 * b04 - a31 * b02 + a33 * b00) * det;
  return out;
}
/**
 * Generates a 2D projection matrix with the given bounds
 *
 * @param {mat3} out mat3 frustum matrix will be written into
 * @param {number} width Width of your gl context
 * @param {number} height Height of gl context
 * @returns {mat3} out
 */

function projection(out, width, height) {
  out[0] = 2 / width;
  out[1] = 0;
  out[2] = 0;
  out[3] = 0;
  out[4] = -2 / height;
  out[5] = 0;
  out[6] = -1;
  out[7] = 1;
  out[8] = 1;
  return out;
}
/**
 * Returns a string representation of a mat3
 *
 * @param {ReadonlyMat3} a matrix to represent as a string
 * @returns {String} string representation of the matrix
 */

function str$6(a) {
  return "mat3(" + a[0] + ", " + a[1] + ", " + a[2] + ", " + a[3] + ", " + a[4] + ", " + a[5] + ", " + a[6] + ", " + a[7] + ", " + a[8] + ")";
}
/**
 * Returns Frobenius norm of a mat3
 *
 * @param {ReadonlyMat3} a the matrix to calculate Frobenius norm of
 * @returns {Number} Frobenius norm
 */

function frob$1(a) {
  return Math.hypot(a[0], a[1], a[2], a[3], a[4], a[5], a[6], a[7], a[8]);
}
/**
 * Adds two mat3's
 *
 * @param {mat3} out the receiving matrix
 * @param {ReadonlyMat3} a the first operand
 * @param {ReadonlyMat3} b the second operand
 * @returns {mat3} out
 */

function add$6(out, a, b) {
  out[0] = a[0] + b[0];
  out[1] = a[1] + b[1];
  out[2] = a[2] + b[2];
  out[3] = a[3] + b[3];
  out[4] = a[4] + b[4];
  out[5] = a[5] + b[5];
  out[6] = a[6] + b[6];
  out[7] = a[7] + b[7];
  out[8] = a[8] + b[8];
  return out;
}
/**
 * Subtracts matrix b from matrix a
 *
 * @param {mat3} out the receiving matrix
 * @param {ReadonlyMat3} a the first operand
 * @param {ReadonlyMat3} b the second operand
 * @returns {mat3} out
 */

function subtract$4(out, a, b) {
  out[0] = a[0] - b[0];
  out[1] = a[1] - b[1];
  out[2] = a[2] - b[2];
  out[3] = a[3] - b[3];
  out[4] = a[4] - b[4];
  out[5] = a[5] - b[5];
  out[6] = a[6] - b[6];
  out[7] = a[7] - b[7];
  out[8] = a[8] - b[8];
  return out;
}
/**
 * Multiply each element of the matrix by a scalar.
 *
 * @param {mat3} out the receiving matrix
 * @param {ReadonlyMat3} a the matrix to scale
 * @param {Number} b amount to scale the matrix's elements by
 * @returns {mat3} out
 */

function multiplyScalar$1(out, a, b) {
  out[0] = a[0] * b;
  out[1] = a[1] * b;
  out[2] = a[2] * b;
  out[3] = a[3] * b;
  out[4] = a[4] * b;
  out[5] = a[5] * b;
  out[6] = a[6] * b;
  out[7] = a[7] * b;
  out[8] = a[8] * b;
  return out;
}
/**
 * Adds two mat3's after multiplying each element of the second operand by a scalar value.
 *
 * @param {mat3} out the receiving vector
 * @param {ReadonlyMat3} a the first operand
 * @param {ReadonlyMat3} b the second operand
 * @param {Number} scale the amount to scale b's elements by before adding
 * @returns {mat3} out
 */

function multiplyScalarAndAdd$1(out, a, b, scale) {
  out[0] = a[0] + b[0] * scale;
  out[1] = a[1] + b[1] * scale;
  out[2] = a[2] + b[2] * scale;
  out[3] = a[3] + b[3] * scale;
  out[4] = a[4] + b[4] * scale;
  out[5] = a[5] + b[5] * scale;
  out[6] = a[6] + b[6] * scale;
  out[7] = a[7] + b[7] * scale;
  out[8] = a[8] + b[8] * scale;
  return out;
}
/**
 * Returns whether or not the matrices have exactly the same elements in the same position (when compared with ===)
 *
 * @param {ReadonlyMat3} a The first matrix.
 * @param {ReadonlyMat3} b The second matrix.
 * @returns {Boolean} True if the matrices are equal, false otherwise.
 */

function exactEquals$6(a, b) {
  return a[0] === b[0] && a[1] === b[1] && a[2] === b[2] && a[3] === b[3] && a[4] === b[4] && a[5] === b[5] && a[6] === b[6] && a[7] === b[7] && a[8] === b[8];
}
/**
 * Returns whether or not the matrices have approximately the same elements in the same position.
 *
 * @param {ReadonlyMat3} a The first matrix.
 * @param {ReadonlyMat3} b The second matrix.
 * @returns {Boolean} True if the matrices are equal, false otherwise.
 */

function equals$6(a, b) {
  var a0 = a[0],
      a1 = a[1],
      a2 = a[2],
      a3 = a[3],
      a4 = a[4],
      a5 = a[5],
      a6 = a[6],
      a7 = a[7],
      a8 = a[8];
  var b0 = b[0],
      b1 = b[1],
      b2 = b[2],
      b3 = b[3],
      b4 = b[4],
      b5 = b[5],
      b6 = b[6],
      b7 = b[7],
      b8 = b[8];
  return Math.abs(a0 - b0) <= EPSILON * Math.max(1.0, Math.abs(a0), Math.abs(b0)) && Math.abs(a1 - b1) <= EPSILON * Math.max(1.0, Math.abs(a1), Math.abs(b1)) && Math.abs(a2 - b2) <= EPSILON * Math.max(1.0, Math.abs(a2), Math.abs(b2)) && Math.abs(a3 - b3) <= EPSILON * Math.max(1.0, Math.abs(a3), Math.abs(b3)) && Math.abs(a4 - b4) <= EPSILON * Math.max(1.0, Math.abs(a4), Math.abs(b4)) && Math.abs(a5 - b5) <= EPSILON * Math.max(1.0, Math.abs(a5), Math.abs(b5)) && Math.abs(a6 - b6) <= EPSILON * Math.max(1.0, Math.abs(a6), Math.abs(b6)) && Math.abs(a7 - b7) <= EPSILON * Math.max(1.0, Math.abs(a7), Math.abs(b7)) && Math.abs(a8 - b8) <= EPSILON * Math.max(1.0, Math.abs(a8), Math.abs(b8));
}
/**
 * Alias for {@link mat3.multiply}
 * @function
 */

var mul$6 = multiply$6;
/**
 * Alias for {@link mat3.subtract}
 * @function
 */

var sub$4 = subtract$4;

var mat3 = /*#__PURE__*/Object.freeze({
__proto__: null,
add: add$6,
adjoint: adjoint$1,
clone: clone$6,
copy: copy$6,
create: create$6,
determinant: determinant$1,
equals: equals$6,
exactEquals: exactEquals$6,
frob: frob$1,
fromMat2d: fromMat2d,
fromMat4: fromMat4$1,
fromQuat: fromQuat$1,
fromRotation: fromRotation$2,
fromScaling: fromScaling$1,
fromTranslation: fromTranslation$2,
fromValues: fromValues$6,
identity: identity$3,
invert: invert$3,
mul: mul$6,
multiply: multiply$6,
multiplyScalar: multiplyScalar$1,
multiplyScalarAndAdd: multiplyScalarAndAdd$1,
normalFromMat4: normalFromMat4,
projection: projection,
rotate: rotate$2,
scale: scale$6,
set: set$6,
str: str$6,
sub: sub$4,
subtract: subtract$4,
translate: translate$2,
transpose: transpose$1
});

/**
 * 4x4 Matrix<br>Format: column-major, when typed out it looks like row-major<br>The matrices are being post multiplied.
 * @module mat4
 */

/**
 * Creates a new identity mat4
 *
 * @returns {mat4} a new 4x4 matrix
 */

function create$5() {
  var out = new ARRAY_TYPE(16);

  if (ARRAY_TYPE != Float32Array) {
    out[1] = 0;
    out[2] = 0;
    out[3] = 0;
    out[4] = 0;
    out[6] = 0;
    out[7] = 0;
    out[8] = 0;
    out[9] = 0;
    out[11] = 0;
    out[12] = 0;
    out[13] = 0;
    out[14] = 0;
  }

  out[0] = 1;
  out[5] = 1;
  out[10] = 1;
  out[15] = 1;
  return out;
}
/**
 * Creates a new mat4 initialized with values from an existing matrix
 *
 * @param {ReadonlyMat4} a matrix to clone
 * @returns {mat4} a new 4x4 matrix
 */

function clone$5(a) {
  var out = new ARRAY_TYPE(16);
  out[0] = a[0];
  out[1] = a[1];
  out[2] = a[2];
  out[3] = a[3];
  out[4] = a[4];
  out[5] = a[5];
  out[6] = a[6];
  out[7] = a[7];
  out[8] = a[8];
  out[9] = a[9];
  out[10] = a[10];
  out[11] = a[11];
  out[12] = a[12];
  out[13] = a[13];
  out[14] = a[14];
  out[15] = a[15];
  return out;
}
/**
 * Copy the values from one mat4 to another
 *
 * @param {mat4} out the receiving matrix
 * @param {ReadonlyMat4} a the source matrix
 * @returns {mat4} out
 */

function copy$5(out, a) {
  out[0] = a[0];
  out[1] = a[1];
  out[2] = a[2];
  out[3] = a[3];
  out[4] = a[4];
  out[5] = a[5];
  out[6] = a[6];
  out[7] = a[7];
  out[8] = a[8];
  out[9] = a[9];
  out[10] = a[10];
  out[11] = a[11];
  out[12] = a[12];
  out[13] = a[13];
  out[14] = a[14];
  out[15] = a[15];
  return out;
}
/**
 * Create a new mat4 with the given values
 *
 * @param {Number} m00 Component in column 0, row 0 position (index 0)
 * @param {Number} m01 Component in column 0, row 1 position (index 1)
 * @param {Number} m02 Component in column 0, row 2 position (index 2)
 * @param {Number} m03 Component in column 0, row 3 position (index 3)
 * @param {Number} m10 Component in column 1, row 0 position (index 4)
 * @param {Number} m11 Component in column 1, row 1 position (index 5)
 * @param {Number} m12 Component in column 1, row 2 position (index 6)
 * @param {Number} m13 Component in column 1, row 3 position (index 7)
 * @param {Number} m20 Component in column 2, row 0 position (index 8)
 * @param {Number} m21 Component in column 2, row 1 position (index 9)
 * @param {Number} m22 Component in column 2, row 2 position (index 10)
 * @param {Number} m23 Component in column 2, row 3 position (index 11)
 * @param {Number} m30 Component in column 3, row 0 position (index 12)
 * @param {Number} m31 Component in column 3, row 1 position (index 13)
 * @param {Number} m32 Component in column 3, row 2 position (index 14)
 * @param {Number} m33 Component in column 3, row 3 position (index 15)
 * @returns {mat4} A new mat4
 */

function fromValues$5(m00, m01, m02, m03, m10, m11, m12, m13, m20, m21, m22, m23, m30, m31, m32, m33) {
  var out = new ARRAY_TYPE(16);
  out[0] = m00;
  out[1] = m01;
  out[2] = m02;
  out[3] = m03;
  out[4] = m10;
  out[5] = m11;
  out[6] = m12;
  out[7] = m13;
  out[8] = m20;
  out[9] = m21;
  out[10] = m22;
  out[11] = m23;
  out[12] = m30;
  out[13] = m31;
  out[14] = m32;
  out[15] = m33;
  return out;
}
/**
 * Set the components of a mat4 to the given values
 *
 * @param {mat4} out the receiving matrix
 * @param {Number} m00 Component in column 0, row 0 position (index 0)
 * @param {Number} m01 Component in column 0, row 1 position (index 1)
 * @param {Number} m02 Component in column 0, row 2 position (index 2)
 * @param {Number} m03 Component in column 0, row 3 position (index 3)
 * @param {Number} m10 Component in column 1, row 0 position (index 4)
 * @param {Number} m11 Component in column 1, row 1 position (index 5)
 * @param {Number} m12 Component in column 1, row 2 position (index 6)
 * @param {Number} m13 Component in column 1, row 3 position (index 7)
 * @param {Number} m20 Component in column 2, row 0 position (index 8)
 * @param {Number} m21 Component in column 2, row 1 position (index 9)
 * @param {Number} m22 Component in column 2, row 2 position (index 10)
 * @param {Number} m23 Component in column 2, row 3 position (index 11)
 * @param {Number} m30 Component in column 3, row 0 position (index 12)
 * @param {Number} m31 Component in column 3, row 1 position (index 13)
 * @param {Number} m32 Component in column 3, row 2 position (index 14)
 * @param {Number} m33 Component in column 3, row 3 position (index 15)
 * @returns {mat4} out
 */

function set$5(out, m00, m01, m02, m03, m10, m11, m12, m13, m20, m21, m22, m23, m30, m31, m32, m33) {
  out[0] = m00;
  out[1] = m01;
  out[2] = m02;
  out[3] = m03;
  out[4] = m10;
  out[5] = m11;
  out[6] = m12;
  out[7] = m13;
  out[8] = m20;
  out[9] = m21;
  out[10] = m22;
  out[11] = m23;
  out[12] = m30;
  out[13] = m31;
  out[14] = m32;
  out[15] = m33;
  return out;
}
/**
 * Set a mat4 to the identity matrix
 *
 * @param {mat4} out the receiving matrix
 * @returns {mat4} out
 */

function identity$2(out) {
  out[0] = 1;
  out[1] = 0;
  out[2] = 0;
  out[3] = 0;
  out[4] = 0;
  out[5] = 1;
  out[6] = 0;
  out[7] = 0;
  out[8] = 0;
  out[9] = 0;
  out[10] = 1;
  out[11] = 0;
  out[12] = 0;
  out[13] = 0;
  out[14] = 0;
  out[15] = 1;
  return out;
}
/**
 * Transpose the values of a mat4
 *
 * @param {mat4} out the receiving matrix
 * @param {ReadonlyMat4} a the source matrix
 * @returns {mat4} out
 */

function transpose(out, a) {
  // If we are transposing ourselves we can skip a few steps but have to cache some values
  if (out === a) {
    var a01 = a[1],
        a02 = a[2],
        a03 = a[3];
    var a12 = a[6],
        a13 = a[7];
    var a23 = a[11];
    out[1] = a[4];
    out[2] = a[8];
    out[3] = a[12];
    out[4] = a01;
    out[6] = a[9];
    out[7] = a[13];
    out[8] = a02;
    out[9] = a12;
    out[11] = a[14];
    out[12] = a03;
    out[13] = a13;
    out[14] = a23;
  } else {
    out[0] = a[0];
    out[1] = a[4];
    out[2] = a[8];
    out[3] = a[12];
    out[4] = a[1];
    out[5] = a[5];
    out[6] = a[9];
    out[7] = a[13];
    out[8] = a[2];
    out[9] = a[6];
    out[10] = a[10];
    out[11] = a[14];
    out[12] = a[3];
    out[13] = a[7];
    out[14] = a[11];
    out[15] = a[15];
  }

  return out;
}
/**
 * Inverts a mat4
 *
 * @param {mat4} out the receiving matrix
 * @param {ReadonlyMat4} a the source matrix
 * @returns {mat4} out
 */

function invert$2(out, a) {
  var a00 = a[0],
      a01 = a[1],
      a02 = a[2],
      a03 = a[3];
  var a10 = a[4],
      a11 = a[5],
      a12 = a[6],
      a13 = a[7];
  var a20 = a[8],
      a21 = a[9],
      a22 = a[10],
      a23 = a[11];
  var a30 = a[12],
      a31 = a[13],
      a32 = a[14],
      a33 = a[15];
  var b00 = a00 * a11 - a01 * a10;
  var b01 = a00 * a12 - a02 * a10;
  var b02 = a00 * a13 - a03 * a10;
  var b03 = a01 * a12 - a02 * a11;
  var b04 = a01 * a13 - a03 * a11;
  var b05 = a02 * a13 - a03 * a12;
  var b06 = a20 * a31 - a21 * a30;
  var b07 = a20 * a32 - a22 * a30;
  var b08 = a20 * a33 - a23 * a30;
  var b09 = a21 * a32 - a22 * a31;
  var b10 = a21 * a33 - a23 * a31;
  var b11 = a22 * a33 - a23 * a32; // Calculate the determinant

  var det = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;

  if (!det) {
    return null;
  }

  det = 1.0 / det;
  out[0] = (a11 * b11 - a12 * b10 + a13 * b09) * det;
  out[1] = (a02 * b10 - a01 * b11 - a03 * b09) * det;
  out[2] = (a31 * b05 - a32 * b04 + a33 * b03) * det;
  out[3] = (a22 * b04 - a21 * b05 - a23 * b03) * det;
  out[4] = (a12 * b08 - a10 * b11 - a13 * b07) * det;
  out[5] = (a00 * b11 - a02 * b08 + a03 * b07) * det;
  out[6] = (a32 * b02 - a30 * b05 - a33 * b01) * det;
  out[7] = (a20 * b05 - a22 * b02 + a23 * b01) * det;
  out[8] = (a10 * b10 - a11 * b08 + a13 * b06) * det;
  out[9] = (a01 * b08 - a00 * b10 - a03 * b06) * det;
  out[10] = (a30 * b04 - a31 * b02 + a33 * b00) * det;
  out[11] = (a21 * b02 - a20 * b04 - a23 * b00) * det;
  out[12] = (a11 * b07 - a10 * b09 - a12 * b06) * det;
  out[13] = (a00 * b09 - a01 * b07 + a02 * b06) * det;
  out[14] = (a31 * b01 - a30 * b03 - a32 * b00) * det;
  out[15] = (a20 * b03 - a21 * b01 + a22 * b00) * det;
  return out;
}
/**
 * Calculates the adjugate of a mat4
 *
 * @param {mat4} out the receiving matrix
 * @param {ReadonlyMat4} a the source matrix
 * @returns {mat4} out
 */

function adjoint(out, a) {
  var a00 = a[0],
      a01 = a[1],
      a02 = a[2],
      a03 = a[3];
  var a10 = a[4],
      a11 = a[5],
      a12 = a[6],
      a13 = a[7];
  var a20 = a[8],
      a21 = a[9],
      a22 = a[10],
      a23 = a[11];
  var a30 = a[12],
      a31 = a[13],
      a32 = a[14],
      a33 = a[15];
  out[0] = a11 * (a22 * a33 - a23 * a32) - a21 * (a12 * a33 - a13 * a32) + a31 * (a12 * a23 - a13 * a22);
  out[1] = -(a01 * (a22 * a33 - a23 * a32) - a21 * (a02 * a33 - a03 * a32) + a31 * (a02 * a23 - a03 * a22));
  out[2] = a01 * (a12 * a33 - a13 * a32) - a11 * (a02 * a33 - a03 * a32) + a31 * (a02 * a13 - a03 * a12);
  out[3] = -(a01 * (a12 * a23 - a13 * a22) - a11 * (a02 * a23 - a03 * a22) + a21 * (a02 * a13 - a03 * a12));
  out[4] = -(a10 * (a22 * a33 - a23 * a32) - a20 * (a12 * a33 - a13 * a32) + a30 * (a12 * a23 - a13 * a22));
  out[5] = a00 * (a22 * a33 - a23 * a32) - a20 * (a02 * a33 - a03 * a32) + a30 * (a02 * a23 - a03 * a22);
  out[6] = -(a00 * (a12 * a33 - a13 * a32) - a10 * (a02 * a33 - a03 * a32) + a30 * (a02 * a13 - a03 * a12));
  out[7] = a00 * (a12 * a23 - a13 * a22) - a10 * (a02 * a23 - a03 * a22) + a20 * (a02 * a13 - a03 * a12);
  out[8] = a10 * (a21 * a33 - a23 * a31) - a20 * (a11 * a33 - a13 * a31) + a30 * (a11 * a23 - a13 * a21);
  out[9] = -(a00 * (a21 * a33 - a23 * a31) - a20 * (a01 * a33 - a03 * a31) + a30 * (a01 * a23 - a03 * a21));
  out[10] = a00 * (a11 * a33 - a13 * a31) - a10 * (a01 * a33 - a03 * a31) + a30 * (a01 * a13 - a03 * a11);
  out[11] = -(a00 * (a11 * a23 - a13 * a21) - a10 * (a01 * a23 - a03 * a21) + a20 * (a01 * a13 - a03 * a11));
  out[12] = -(a10 * (a21 * a32 - a22 * a31) - a20 * (a11 * a32 - a12 * a31) + a30 * (a11 * a22 - a12 * a21));
  out[13] = a00 * (a21 * a32 - a22 * a31) - a20 * (a01 * a32 - a02 * a31) + a30 * (a01 * a22 - a02 * a21);
  out[14] = -(a00 * (a11 * a32 - a12 * a31) - a10 * (a01 * a32 - a02 * a31) + a30 * (a01 * a12 - a02 * a11));
  out[15] = a00 * (a11 * a22 - a12 * a21) - a10 * (a01 * a22 - a02 * a21) + a20 * (a01 * a12 - a02 * a11);
  return out;
}
/**
 * Calculates the determinant of a mat4
 *
 * @param {ReadonlyMat4} a the source matrix
 * @returns {Number} determinant of a
 */

function determinant(a) {
  var a00 = a[0],
      a01 = a[1],
      a02 = a[2],
      a03 = a[3];
  var a10 = a[4],
      a11 = a[5],
      a12 = a[6],
      a13 = a[7];
  var a20 = a[8],
      a21 = a[9],
      a22 = a[10],
      a23 = a[11];
  var a30 = a[12],
      a31 = a[13],
      a32 = a[14],
      a33 = a[15];
  var b00 = a00 * a11 - a01 * a10;
  var b01 = a00 * a12 - a02 * a10;
  var b02 = a00 * a13 - a03 * a10;
  var b03 = a01 * a12 - a02 * a11;
  var b04 = a01 * a13 - a03 * a11;
  var b05 = a02 * a13 - a03 * a12;
  var b06 = a20 * a31 - a21 * a30;
  var b07 = a20 * a32 - a22 * a30;
  var b08 = a20 * a33 - a23 * a30;
  var b09 = a21 * a32 - a22 * a31;
  var b10 = a21 * a33 - a23 * a31;
  var b11 = a22 * a33 - a23 * a32; // Calculate the determinant

  return b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;
}
/**
 * Multiplies two mat4s
 *
 * @param {mat4} out the receiving matrix
 * @param {ReadonlyMat4} a the first operand
 * @param {ReadonlyMat4} b the second operand
 * @returns {mat4} out
 */

function multiply$5(out, a, b) {
  var a00 = a[0],
      a01 = a[1],
      a02 = a[2],
      a03 = a[3];
  var a10 = a[4],
      a11 = a[5],
      a12 = a[6],
      a13 = a[7];
  var a20 = a[8],
      a21 = a[9],
      a22 = a[10],
      a23 = a[11];
  var a30 = a[12],
      a31 = a[13],
      a32 = a[14],
      a33 = a[15]; // Cache only the current line of the second matrix

  var b0 = b[0],
      b1 = b[1],
      b2 = b[2],
      b3 = b[3];
  out[0] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
  out[1] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
  out[2] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
  out[3] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;
  b0 = b[4];
  b1 = b[5];
  b2 = b[6];
  b3 = b[7];
  out[4] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
  out[5] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
  out[6] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
  out[7] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;
  b0 = b[8];
  b1 = b[9];
  b2 = b[10];
  b3 = b[11];
  out[8] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
  out[9] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
  out[10] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
  out[11] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;
  b0 = b[12];
  b1 = b[13];
  b2 = b[14];
  b3 = b[15];
  out[12] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
  out[13] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
  out[14] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
  out[15] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;
  return out;
}
/**
 * Translate a mat4 by the given vector
 *
 * @param {mat4} out the receiving matrix
 * @param {ReadonlyMat4} a the matrix to translate
 * @param {ReadonlyVec3} v vector to translate by
 * @returns {mat4} out
 */

function translate$1(out, a, v) {
  var x = v[0],
      y = v[1],
      z = v[2];
  var a00, a01, a02, a03;
  var a10, a11, a12, a13;
  var a20, a21, a22, a23;

  if (a === out) {
    out[12] = a[0] * x + a[4] * y + a[8] * z + a[12];
    out[13] = a[1] * x + a[5] * y + a[9] * z + a[13];
    out[14] = a[2] * x + a[6] * y + a[10] * z + a[14];
    out[15] = a[3] * x + a[7] * y + a[11] * z + a[15];
  } else {
    a00 = a[0];
    a01 = a[1];
    a02 = a[2];
    a03 = a[3];
    a10 = a[4];
    a11 = a[5];
    a12 = a[6];
    a13 = a[7];
    a20 = a[8];
    a21 = a[9];
    a22 = a[10];
    a23 = a[11];
    out[0] = a00;
    out[1] = a01;
    out[2] = a02;
    out[3] = a03;
    out[4] = a10;
    out[5] = a11;
    out[6] = a12;
    out[7] = a13;
    out[8] = a20;
    out[9] = a21;
    out[10] = a22;
    out[11] = a23;
    out[12] = a00 * x + a10 * y + a20 * z + a[12];
    out[13] = a01 * x + a11 * y + a21 * z + a[13];
    out[14] = a02 * x + a12 * y + a22 * z + a[14];
    out[15] = a03 * x + a13 * y + a23 * z + a[15];
  }

  return out;
}
/**
 * Scales the mat4 by the dimensions in the given vec3 not using vectorization
 *
 * @param {mat4} out the receiving matrix
 * @param {ReadonlyMat4} a the matrix to scale
 * @param {ReadonlyVec3} v the vec3 to scale the matrix by
 * @returns {mat4} out
 **/

function scale$5(out, a, v) {
  var x = v[0],
      y = v[1],
      z = v[2];
  out[0] = a[0] * x;
  out[1] = a[1] * x;
  out[2] = a[2] * x;
  out[3] = a[3] * x;
  out[4] = a[4] * y;
  out[5] = a[5] * y;
  out[6] = a[6] * y;
  out[7] = a[7] * y;
  out[8] = a[8] * z;
  out[9] = a[9] * z;
  out[10] = a[10] * z;
  out[11] = a[11] * z;
  out[12] = a[12];
  out[13] = a[13];
  out[14] = a[14];
  out[15] = a[15];
  return out;
}
/**
 * Rotates a mat4 by the given angle around the given axis
 *
 * @param {mat4} out the receiving matrix
 * @param {ReadonlyMat4} a the matrix to rotate
 * @param {Number} rad the angle to rotate the matrix by
 * @param {ReadonlyVec3} axis the axis to rotate around
 * @returns {mat4} out
 */

function rotate$1(out, a, rad, axis) {
  var x = axis[0],
      y = axis[1],
      z = axis[2];
  var len = Math.hypot(x, y, z);
  var s, c, t;
  var a00, a01, a02, a03;
  var a10, a11, a12, a13;
  var a20, a21, a22, a23;
  var b00, b01, b02;
  var b10, b11, b12;
  var b20, b21, b22;

  if (len < EPSILON) {
    return null;
  }

  len = 1 / len;
  x *= len;
  y *= len;
  z *= len;
  s = Math.sin(rad);
  c = Math.cos(rad);
  t = 1 - c;
  a00 = a[0];
  a01 = a[1];
  a02 = a[2];
  a03 = a[3];
  a10 = a[4];
  a11 = a[5];
  a12 = a[6];
  a13 = a[7];
  a20 = a[8];
  a21 = a[9];
  a22 = a[10];
  a23 = a[11]; // Construct the elements of the rotation matrix

  b00 = x * x * t + c;
  b01 = y * x * t + z * s;
  b02 = z * x * t - y * s;
  b10 = x * y * t - z * s;
  b11 = y * y * t + c;
  b12 = z * y * t + x * s;
  b20 = x * z * t + y * s;
  b21 = y * z * t - x * s;
  b22 = z * z * t + c; // Perform rotation-specific matrix multiplication

  out[0] = a00 * b00 + a10 * b01 + a20 * b02;
  out[1] = a01 * b00 + a11 * b01 + a21 * b02;
  out[2] = a02 * b00 + a12 * b01 + a22 * b02;
  out[3] = a03 * b00 + a13 * b01 + a23 * b02;
  out[4] = a00 * b10 + a10 * b11 + a20 * b12;
  out[5] = a01 * b10 + a11 * b11 + a21 * b12;
  out[6] = a02 * b10 + a12 * b11 + a22 * b12;
  out[7] = a03 * b10 + a13 * b11 + a23 * b12;
  out[8] = a00 * b20 + a10 * b21 + a20 * b22;
  out[9] = a01 * b20 + a11 * b21 + a21 * b22;
  out[10] = a02 * b20 + a12 * b21 + a22 * b22;
  out[11] = a03 * b20 + a13 * b21 + a23 * b22;

  if (a !== out) {
    // If the source and destination differ, copy the unchanged last row
    out[12] = a[12];
    out[13] = a[13];
    out[14] = a[14];
    out[15] = a[15];
  }

  return out;
}
/**
 * Rotates a matrix by the given angle around the X axis
 *
 * @param {mat4} out the receiving matrix
 * @param {ReadonlyMat4} a the matrix to rotate
 * @param {Number} rad the angle to rotate the matrix by
 * @returns {mat4} out
 */

function rotateX$3(out, a, rad) {
  var s = Math.sin(rad);
  var c = Math.cos(rad);
  var a10 = a[4];
  var a11 = a[5];
  var a12 = a[6];
  var a13 = a[7];
  var a20 = a[8];
  var a21 = a[9];
  var a22 = a[10];
  var a23 = a[11];

  if (a !== out) {
    // If the source and destination differ, copy the unchanged rows
    out[0] = a[0];
    out[1] = a[1];
    out[2] = a[2];
    out[3] = a[3];
    out[12] = a[12];
    out[13] = a[13];
    out[14] = a[14];
    out[15] = a[15];
  } // Perform axis-specific matrix multiplication


  out[4] = a10 * c + a20 * s;
  out[5] = a11 * c + a21 * s;
  out[6] = a12 * c + a22 * s;
  out[7] = a13 * c + a23 * s;
  out[8] = a20 * c - a10 * s;
  out[9] = a21 * c - a11 * s;
  out[10] = a22 * c - a12 * s;
  out[11] = a23 * c - a13 * s;
  return out;
}
/**
 * Rotates a matrix by the given angle around the Y axis
 *
 * @param {mat4} out the receiving matrix
 * @param {ReadonlyMat4} a the matrix to rotate
 * @param {Number} rad the angle to rotate the matrix by
 * @returns {mat4} out
 */

function rotateY$3(out, a, rad) {
  var s = Math.sin(rad);
  var c = Math.cos(rad);
  var a00 = a[0];
  var a01 = a[1];
  var a02 = a[2];
  var a03 = a[3];
  var a20 = a[8];
  var a21 = a[9];
  var a22 = a[10];
  var a23 = a[11];

  if (a !== out) {
    // If the source and destination differ, copy the unchanged rows
    out[4] = a[4];
    out[5] = a[5];
    out[6] = a[6];
    out[7] = a[7];
    out[12] = a[12];
    out[13] = a[13];
    out[14] = a[14];
    out[15] = a[15];
  } // Perform axis-specific matrix multiplication


  out[0] = a00 * c - a20 * s;
  out[1] = a01 * c - a21 * s;
  out[2] = a02 * c - a22 * s;
  out[3] = a03 * c - a23 * s;
  out[8] = a00 * s + a20 * c;
  out[9] = a01 * s + a21 * c;
  out[10] = a02 * s + a22 * c;
  out[11] = a03 * s + a23 * c;
  return out;
}
/**
 * Rotates a matrix by the given angle around the Z axis
 *
 * @param {mat4} out the receiving matrix
 * @param {ReadonlyMat4} a the matrix to rotate
 * @param {Number} rad the angle to rotate the matrix by
 * @returns {mat4} out
 */

function rotateZ$3(out, a, rad) {
  var s = Math.sin(rad);
  var c = Math.cos(rad);
  var a00 = a[0];
  var a01 = a[1];
  var a02 = a[2];
  var a03 = a[3];
  var a10 = a[4];
  var a11 = a[5];
  var a12 = a[6];
  var a13 = a[7];

  if (a !== out) {
    // If the source and destination differ, copy the unchanged last row
    out[8] = a[8];
    out[9] = a[9];
    out[10] = a[10];
    out[11] = a[11];
    out[12] = a[12];
    out[13] = a[13];
    out[14] = a[14];
    out[15] = a[15];
  } // Perform axis-specific matrix multiplication


  out[0] = a00 * c + a10 * s;
  out[1] = a01 * c + a11 * s;
  out[2] = a02 * c + a12 * s;
  out[3] = a03 * c + a13 * s;
  out[4] = a10 * c - a00 * s;
  out[5] = a11 * c - a01 * s;
  out[6] = a12 * c - a02 * s;
  out[7] = a13 * c - a03 * s;
  return out;
}
/**
 * Creates a matrix from a vector translation
 * This is equivalent to (but much faster than):
 *
 *     mat4.identity(dest);
 *     mat4.translate(dest, dest, vec);
 *
 * @param {mat4} out mat4 receiving operation result
 * @param {ReadonlyVec3} v Translation vector
 * @returns {mat4} out
 */

function fromTranslation$1(out, v) {
  out[0] = 1;
  out[1] = 0;
  out[2] = 0;
  out[3] = 0;
  out[4] = 0;
  out[5] = 1;
  out[6] = 0;
  out[7] = 0;
  out[8] = 0;
  out[9] = 0;
  out[10] = 1;
  out[11] = 0;
  out[12] = v[0];
  out[13] = v[1];
  out[14] = v[2];
  out[15] = 1;
  return out;
}
/**
 * Creates a matrix from a vector scaling
 * This is equivalent to (but much faster than):
 *
 *     mat4.identity(dest);
 *     mat4.scale(dest, dest, vec);
 *
 * @param {mat4} out mat4 receiving operation result
 * @param {ReadonlyVec3} v Scaling vector
 * @returns {mat4} out
 */

function fromScaling(out, v) {
  out[0] = v[0];
  out[1] = 0;
  out[2] = 0;
  out[3] = 0;
  out[4] = 0;
  out[5] = v[1];
  out[6] = 0;
  out[7] = 0;
  out[8] = 0;
  out[9] = 0;
  out[10] = v[2];
  out[11] = 0;
  out[12] = 0;
  out[13] = 0;
  out[14] = 0;
  out[15] = 1;
  return out;
}
/**
 * Creates a matrix from a given angle around a given axis
 * This is equivalent to (but much faster than):
 *
 *     mat4.identity(dest);
 *     mat4.rotate(dest, dest, rad, axis);
 *
 * @param {mat4} out mat4 receiving operation result
 * @param {Number} rad the angle to rotate the matrix by
 * @param {ReadonlyVec3} axis the axis to rotate around
 * @returns {mat4} out
 */

function fromRotation$1(out, rad, axis) {
  var x = axis[0],
      y = axis[1],
      z = axis[2];
  var len = Math.hypot(x, y, z);
  var s, c, t;

  if (len < EPSILON) {
    return null;
  }

  len = 1 / len;
  x *= len;
  y *= len;
  z *= len;
  s = Math.sin(rad);
  c = Math.cos(rad);
  t = 1 - c; // Perform rotation-specific matrix multiplication

  out[0] = x * x * t + c;
  out[1] = y * x * t + z * s;
  out[2] = z * x * t - y * s;
  out[3] = 0;
  out[4] = x * y * t - z * s;
  out[5] = y * y * t + c;
  out[6] = z * y * t + x * s;
  out[7] = 0;
  out[8] = x * z * t + y * s;
  out[9] = y * z * t - x * s;
  out[10] = z * z * t + c;
  out[11] = 0;
  out[12] = 0;
  out[13] = 0;
  out[14] = 0;
  out[15] = 1;
  return out;
}
/**
 * Creates a matrix from the given angle around the X axis
 * This is equivalent to (but much faster than):
 *
 *     mat4.identity(dest);
 *     mat4.rotateX(dest, dest, rad);
 *
 * @param {mat4} out mat4 receiving operation result
 * @param {Number} rad the angle to rotate the matrix by
 * @returns {mat4} out
 */

function fromXRotation(out, rad) {
  var s = Math.sin(rad);
  var c = Math.cos(rad); // Perform axis-specific matrix multiplication

  out[0] = 1;
  out[1] = 0;
  out[2] = 0;
  out[3] = 0;
  out[4] = 0;
  out[5] = c;
  out[6] = s;
  out[7] = 0;
  out[8] = 0;
  out[9] = -s;
  out[10] = c;
  out[11] = 0;
  out[12] = 0;
  out[13] = 0;
  out[14] = 0;
  out[15] = 1;
  return out;
}
/**
 * Creates a matrix from the given angle around the Y axis
 * This is equivalent to (but much faster than):
 *
 *     mat4.identity(dest);
 *     mat4.rotateY(dest, dest, rad);
 *
 * @param {mat4} out mat4 receiving operation result
 * @param {Number} rad the angle to rotate the matrix by
 * @returns {mat4} out
 */

function fromYRotation(out, rad) {
  var s = Math.sin(rad);
  var c = Math.cos(rad); // Perform axis-specific matrix multiplication

  out[0] = c;
  out[1] = 0;
  out[2] = -s;
  out[3] = 0;
  out[4] = 0;
  out[5] = 1;
  out[6] = 0;
  out[7] = 0;
  out[8] = s;
  out[9] = 0;
  out[10] = c;
  out[11] = 0;
  out[12] = 0;
  out[13] = 0;
  out[14] = 0;
  out[15] = 1;
  return out;
}
/**
 * Creates a matrix from the given angle around the Z axis
 * This is equivalent to (but much faster than):
 *
 *     mat4.identity(dest);
 *     mat4.rotateZ(dest, dest, rad);
 *
 * @param {mat4} out mat4 receiving operation result
 * @param {Number} rad the angle to rotate the matrix by
 * @returns {mat4} out
 */

function fromZRotation(out, rad) {
  var s = Math.sin(rad);
  var c = Math.cos(rad); // Perform axis-specific matrix multiplication

  out[0] = c;
  out[1] = s;
  out[2] = 0;
  out[3] = 0;
  out[4] = -s;
  out[5] = c;
  out[6] = 0;
  out[7] = 0;
  out[8] = 0;
  out[9] = 0;
  out[10] = 1;
  out[11] = 0;
  out[12] = 0;
  out[13] = 0;
  out[14] = 0;
  out[15] = 1;
  return out;
}
/**
 * Creates a matrix from a quaternion rotation and vector translation
 * This is equivalent to (but much faster than):
 *
 *     mat4.identity(dest);
 *     mat4.translate(dest, vec);
 *     let quatMat = mat4.create();
 *     quat4.toMat4(quat, quatMat);
 *     mat4.multiply(dest, quatMat);
 *
 * @param {mat4} out mat4 receiving operation result
 * @param {quat4} q Rotation quaternion
 * @param {ReadonlyVec3} v Translation vector
 * @returns {mat4} out
 */

function fromRotationTranslation$1(out, q, v) {
  // Quaternion math
  var x = q[0],
      y = q[1],
      z = q[2],
      w = q[3];
  var x2 = x + x;
  var y2 = y + y;
  var z2 = z + z;
  var xx = x * x2;
  var xy = x * y2;
  var xz = x * z2;
  var yy = y * y2;
  var yz = y * z2;
  var zz = z * z2;
  var wx = w * x2;
  var wy = w * y2;
  var wz = w * z2;
  out[0] = 1 - (yy + zz);
  out[1] = xy + wz;
  out[2] = xz - wy;
  out[3] = 0;
  out[4] = xy - wz;
  out[5] = 1 - (xx + zz);
  out[6] = yz + wx;
  out[7] = 0;
  out[8] = xz + wy;
  out[9] = yz - wx;
  out[10] = 1 - (xx + yy);
  out[11] = 0;
  out[12] = v[0];
  out[13] = v[1];
  out[14] = v[2];
  out[15] = 1;
  return out;
}
/**
 * Creates a new mat4 from a dual quat.
 *
 * @param {mat4} out Matrix
 * @param {ReadonlyQuat2} a Dual Quaternion
 * @returns {mat4} mat4 receiving operation result
 */

function fromQuat2(out, a) {
  var translation = new ARRAY_TYPE(3);
  var bx = -a[0],
      by = -a[1],
      bz = -a[2],
      bw = a[3],
      ax = a[4],
      ay = a[5],
      az = a[6],
      aw = a[7];
  var magnitude = bx * bx + by * by + bz * bz + bw * bw; //Only scale if it makes sense

  if (magnitude > 0) {
    translation[0] = (ax * bw + aw * bx + ay * bz - az * by) * 2 / magnitude;
    translation[1] = (ay * bw + aw * by + az * bx - ax * bz) * 2 / magnitude;
    translation[2] = (az * bw + aw * bz + ax * by - ay * bx) * 2 / magnitude;
  } else {
    translation[0] = (ax * bw + aw * bx + ay * bz - az * by) * 2;
    translation[1] = (ay * bw + aw * by + az * bx - ax * bz) * 2;
    translation[2] = (az * bw + aw * bz + ax * by - ay * bx) * 2;
  }

  fromRotationTranslation$1(out, a, translation);
  return out;
}
/**
 * Returns the translation vector component of a transformation
 *  matrix. If a matrix is built with fromRotationTranslation,
 *  the returned vector will be the same as the translation vector
 *  originally supplied.
 * @param  {vec3} out Vector to receive translation component
 * @param  {ReadonlyMat4} mat Matrix to be decomposed (input)
 * @return {vec3} out
 */

function getTranslation$1(out, mat) {
  out[0] = mat[12];
  out[1] = mat[13];
  out[2] = mat[14];
  return out;
}
/**
 * Returns the scaling factor component of a transformation
 *  matrix. If a matrix is built with fromRotationTranslationScale
 *  with a normalized Quaternion paramter, the returned vector will be
 *  the same as the scaling vector
 *  originally supplied.
 * @param  {vec3} out Vector to receive scaling factor component
 * @param  {ReadonlyMat4} mat Matrix to be decomposed (input)
 * @return {vec3} out
 */

function getScaling(out, mat) {
  var m11 = mat[0];
  var m12 = mat[1];
  var m13 = mat[2];
  var m21 = mat[4];
  var m22 = mat[5];
  var m23 = mat[6];
  var m31 = mat[8];
  var m32 = mat[9];
  var m33 = mat[10];
  out[0] = Math.hypot(m11, m12, m13);
  out[1] = Math.hypot(m21, m22, m23);
  out[2] = Math.hypot(m31, m32, m33);
  return out;
}
/**
 * Returns a quaternion representing the rotational component
 *  of a transformation matrix. If a matrix is built with
 *  fromRotationTranslation, the returned quaternion will be the
 *  same as the quaternion originally supplied.
 * @param {quat} out Quaternion to receive the rotation component
 * @param {ReadonlyMat4} mat Matrix to be decomposed (input)
 * @return {quat} out
 */

function getRotation(out, mat) {
  var scaling = new ARRAY_TYPE(3);
  getScaling(scaling, mat);
  var is1 = 1 / scaling[0];
  var is2 = 1 / scaling[1];
  var is3 = 1 / scaling[2];
  var sm11 = mat[0] * is1;
  var sm12 = mat[1] * is2;
  var sm13 = mat[2] * is3;
  var sm21 = mat[4] * is1;
  var sm22 = mat[5] * is2;
  var sm23 = mat[6] * is3;
  var sm31 = mat[8] * is1;
  var sm32 = mat[9] * is2;
  var sm33 = mat[10] * is3;
  var trace = sm11 + sm22 + sm33;
  var S = 0;

  if (trace > 0) {
    S = Math.sqrt(trace + 1.0) * 2;
    out[3] = 0.25 * S;
    out[0] = (sm23 - sm32) / S;
    out[1] = (sm31 - sm13) / S;
    out[2] = (sm12 - sm21) / S;
  } else if (sm11 > sm22 && sm11 > sm33) {
    S = Math.sqrt(1.0 + sm11 - sm22 - sm33) * 2;
    out[3] = (sm23 - sm32) / S;
    out[0] = 0.25 * S;
    out[1] = (sm12 + sm21) / S;
    out[2] = (sm31 + sm13) / S;
  } else if (sm22 > sm33) {
    S = Math.sqrt(1.0 + sm22 - sm11 - sm33) * 2;
    out[3] = (sm31 - sm13) / S;
    out[0] = (sm12 + sm21) / S;
    out[1] = 0.25 * S;
    out[2] = (sm23 + sm32) / S;
  } else {
    S = Math.sqrt(1.0 + sm33 - sm11 - sm22) * 2;
    out[3] = (sm12 - sm21) / S;
    out[0] = (sm31 + sm13) / S;
    out[1] = (sm23 + sm32) / S;
    out[2] = 0.25 * S;
  }

  return out;
}
/**
 * Creates a matrix from a quaternion rotation, vector translation and vector scale
 * This is equivalent to (but much faster than):
 *
 *     mat4.identity(dest);
 *     mat4.translate(dest, vec);
 *     let quatMat = mat4.create();
 *     quat4.toMat4(quat, quatMat);
 *     mat4.multiply(dest, quatMat);
 *     mat4.scale(dest, scale)
 *
 * @param {mat4} out mat4 receiving operation result
 * @param {quat4} q Rotation quaternion
 * @param {ReadonlyVec3} v Translation vector
 * @param {ReadonlyVec3} s Scaling vector
 * @returns {mat4} out
 */

function fromRotationTranslationScale(out, q, v, s) {
  // Quaternion math
  var x = q[0],
      y = q[1],
      z = q[2],
      w = q[3];
  var x2 = x + x;
  var y2 = y + y;
  var z2 = z + z;
  var xx = x * x2;
  var xy = x * y2;
  var xz = x * z2;
  var yy = y * y2;
  var yz = y * z2;
  var zz = z * z2;
  var wx = w * x2;
  var wy = w * y2;
  var wz = w * z2;
  var sx = s[0];
  var sy = s[1];
  var sz = s[2];
  out[0] = (1 - (yy + zz)) * sx;
  out[1] = (xy + wz) * sx;
  out[2] = (xz - wy) * sx;
  out[3] = 0;
  out[4] = (xy - wz) * sy;
  out[5] = (1 - (xx + zz)) * sy;
  out[6] = (yz + wx) * sy;
  out[7] = 0;
  out[8] = (xz + wy) * sz;
  out[9] = (yz - wx) * sz;
  out[10] = (1 - (xx + yy)) * sz;
  out[11] = 0;
  out[12] = v[0];
  out[13] = v[1];
  out[14] = v[2];
  out[15] = 1;
  return out;
}
/**
 * Creates a matrix from a quaternion rotation, vector translation and vector scale, rotating and scaling around the given origin
 * This is equivalent to (but much faster than):
 *
 *     mat4.identity(dest);
 *     mat4.translate(dest, vec);
 *     mat4.translate(dest, origin);
 *     let quatMat = mat4.create();
 *     quat4.toMat4(quat, quatMat);
 *     mat4.multiply(dest, quatMat);
 *     mat4.scale(dest, scale)
 *     mat4.translate(dest, negativeOrigin);
 *
 * @param {mat4} out mat4 receiving operation result
 * @param {quat4} q Rotation quaternion
 * @param {ReadonlyVec3} v Translation vector
 * @param {ReadonlyVec3} s Scaling vector
 * @param {ReadonlyVec3} o The origin vector around which to scale and rotate
 * @returns {mat4} out
 */

function fromRotationTranslationScaleOrigin(out, q, v, s, o) {
  // Quaternion math
  var x = q[0],
      y = q[1],
      z = q[2],
      w = q[3];
  var x2 = x + x;
  var y2 = y + y;
  var z2 = z + z;
  var xx = x * x2;
  var xy = x * y2;
  var xz = x * z2;
  var yy = y * y2;
  var yz = y * z2;
  var zz = z * z2;
  var wx = w * x2;
  var wy = w * y2;
  var wz = w * z2;
  var sx = s[0];
  var sy = s[1];
  var sz = s[2];
  var ox = o[0];
  var oy = o[1];
  var oz = o[2];
  var out0 = (1 - (yy + zz)) * sx;
  var out1 = (xy + wz) * sx;
  var out2 = (xz - wy) * sx;
  var out4 = (xy - wz) * sy;
  var out5 = (1 - (xx + zz)) * sy;
  var out6 = (yz + wx) * sy;
  var out8 = (xz + wy) * sz;
  var out9 = (yz - wx) * sz;
  var out10 = (1 - (xx + yy)) * sz;
  out[0] = out0;
  out[1] = out1;
  out[2] = out2;
  out[3] = 0;
  out[4] = out4;
  out[5] = out5;
  out[6] = out6;
  out[7] = 0;
  out[8] = out8;
  out[9] = out9;
  out[10] = out10;
  out[11] = 0;
  out[12] = v[0] + ox - (out0 * ox + out4 * oy + out8 * oz);
  out[13] = v[1] + oy - (out1 * ox + out5 * oy + out9 * oz);
  out[14] = v[2] + oz - (out2 * ox + out6 * oy + out10 * oz);
  out[15] = 1;
  return out;
}
/**
 * Calculates a 4x4 matrix from the given quaternion
 *
 * @param {mat4} out mat4 receiving operation result
 * @param {ReadonlyQuat} q Quaternion to create matrix from
 *
 * @returns {mat4} out
 */

function fromQuat(out, q) {
  var x = q[0],
      y = q[1],
      z = q[2],
      w = q[3];
  var x2 = x + x;
  var y2 = y + y;
  var z2 = z + z;
  var xx = x * x2;
  var yx = y * x2;
  var yy = y * y2;
  var zx = z * x2;
  var zy = z * y2;
  var zz = z * z2;
  var wx = w * x2;
  var wy = w * y2;
  var wz = w * z2;
  out[0] = 1 - yy - zz;
  out[1] = yx + wz;
  out[2] = zx - wy;
  out[3] = 0;
  out[4] = yx - wz;
  out[5] = 1 - xx - zz;
  out[6] = zy + wx;
  out[7] = 0;
  out[8] = zx + wy;
  out[9] = zy - wx;
  out[10] = 1 - xx - yy;
  out[11] = 0;
  out[12] = 0;
  out[13] = 0;
  out[14] = 0;
  out[15] = 1;
  return out;
}
/**
 * Generates a frustum matrix with the given bounds
 *
 * @param {mat4} out mat4 frustum matrix will be written into
 * @param {Number} left Left bound of the frustum
 * @param {Number} right Right bound of the frustum
 * @param {Number} bottom Bottom bound of the frustum
 * @param {Number} top Top bound of the frustum
 * @param {Number} near Near bound of the frustum
 * @param {Number} far Far bound of the frustum
 * @returns {mat4} out
 */

function frustum(out, left, right, bottom, top, near, far) {
  var rl = 1 / (right - left);
  var tb = 1 / (top - bottom);
  var nf = 1 / (near - far);
  out[0] = near * 2 * rl;
  out[1] = 0;
  out[2] = 0;
  out[3] = 0;
  out[4] = 0;
  out[5] = near * 2 * tb;
  out[6] = 0;
  out[7] = 0;
  out[8] = (right + left) * rl;
  out[9] = (top + bottom) * tb;
  out[10] = (far + near) * nf;
  out[11] = -1;
  out[12] = 0;
  out[13] = 0;
  out[14] = far * near * 2 * nf;
  out[15] = 0;
  return out;
}
/**
 * Generates a perspective projection matrix with the given bounds.
 * The near/far clip planes correspond to a normalized device coordinate Z range of [-1, 1],
 * which matches WebGL/OpenGL's clip volume.
 * Passing null/undefined/no value for far will generate infinite projection matrix.
 *
 * @param {mat4} out mat4 frustum matrix will be written into
 * @param {number} fovy Vertical field of view in radians
 * @param {number} aspect Aspect ratio. typically viewport width/height
 * @param {number} near Near bound of the frustum
 * @param {number} far Far bound of the frustum, can be null or Infinity
 * @returns {mat4} out
 */

function perspectiveNO(out, fovy, aspect, near, far) {
  var f = 1.0 / Math.tan(fovy / 2),
      nf;
  out[0] = f / aspect;
  out[1] = 0;
  out[2] = 0;
  out[3] = 0;
  out[4] = 0;
  out[5] = f;
  out[6] = 0;
  out[7] = 0;
  out[8] = 0;
  out[9] = 0;
  out[11] = -1;
  out[12] = 0;
  out[13] = 0;
  out[15] = 0;

  if (far != null && far !== Infinity) {
    nf = 1 / (near - far);
    out[10] = (far + near) * nf;
    out[14] = 2 * far * near * nf;
  } else {
    out[10] = -1;
    out[14] = -2 * near;
  }

  return out;
}
/**
 * Alias for {@link mat4.perspectiveNO}
 * @function
 */

var perspective = perspectiveNO;
/**
 * Generates a perspective projection matrix suitable for WebGPU with the given bounds.
 * The near/far clip planes correspond to a normalized device coordinate Z range of [0, 1],
 * which matches WebGPU/Vulkan/DirectX/Metal's clip volume.
 * Passing null/undefined/no value for far will generate infinite projection matrix.
 *
 * @param {mat4} out mat4 frustum matrix will be written into
 * @param {number} fovy Vertical field of view in radians
 * @param {number} aspect Aspect ratio. typically viewport width/height
 * @param {number} near Near bound of the frustum
 * @param {number} far Far bound of the frustum, can be null or Infinity
 * @returns {mat4} out
 */

function perspectiveZO(out, fovy, aspect, near, far) {
  var f = 1.0 / Math.tan(fovy / 2),
      nf;
  out[0] = f / aspect;
  out[1] = 0;
  out[2] = 0;
  out[3] = 0;
  out[4] = 0;
  out[5] = f;
  out[6] = 0;
  out[7] = 0;
  out[8] = 0;
  out[9] = 0;
  out[11] = -1;
  out[12] = 0;
  out[13] = 0;
  out[15] = 0;

  if (far != null && far !== Infinity) {
    nf = 1 / (near - far);
    out[10] = far * nf;
    out[14] = far * near * nf;
  } else {
    out[10] = -1;
    out[14] = -near;
  }

  return out;
}
/**
 * Generates a perspective projection matrix with the given field of view.
 * This is primarily useful for generating projection matrices to be used
 * with the still experiemental WebVR API.
 *
 * @param {mat4} out mat4 frustum matrix will be written into
 * @param {Object} fov Object containing the following values: upDegrees, downDegrees, leftDegrees, rightDegrees
 * @param {number} near Near bound of the frustum
 * @param {number} far Far bound of the frustum
 * @returns {mat4} out
 */

function perspectiveFromFieldOfView(out, fov, near, far) {
  var upTan = Math.tan(fov.upDegrees * Math.PI / 180.0);
  var downTan = Math.tan(fov.downDegrees * Math.PI / 180.0);
  var leftTan = Math.tan(fov.leftDegrees * Math.PI / 180.0);
  var rightTan = Math.tan(fov.rightDegrees * Math.PI / 180.0);
  var xScale = 2.0 / (leftTan + rightTan);
  var yScale = 2.0 / (upTan + downTan);
  out[0] = xScale;
  out[1] = 0.0;
  out[2] = 0.0;
  out[3] = 0.0;
  out[4] = 0.0;
  out[5] = yScale;
  out[6] = 0.0;
  out[7] = 0.0;
  out[8] = -((leftTan - rightTan) * xScale * 0.5);
  out[9] = (upTan - downTan) * yScale * 0.5;
  out[10] = far / (near - far);
  out[11] = -1;
  out[12] = 0.0;
  out[13] = 0.0;
  out[14] = far * near / (near - far);
  out[15] = 0.0;
  return out;
}
/**
 * Generates a orthogonal projection matrix with the given bounds.
 * The near/far clip planes correspond to a normalized device coordinate Z range of [-1, 1],
 * which matches WebGL/OpenGL's clip volume.
 *
 * @param {mat4} out mat4 frustum matrix will be written into
 * @param {number} left Left bound of the frustum
 * @param {number} right Right bound of the frustum
 * @param {number} bottom Bottom bound of the frustum
 * @param {number} top Top bound of the frustum
 * @param {number} near Near bound of the frustum
 * @param {number} far Far bound of the frustum
 * @returns {mat4} out
 */

function orthoNO(out, left, right, bottom, top, near, far) {
  var lr = 1 / (left - right);
  var bt = 1 / (bottom - top);
  var nf = 1 / (near - far);
  out[0] = -2 * lr;
  out[1] = 0;
  out[2] = 0;
  out[3] = 0;
  out[4] = 0;
  out[5] = -2 * bt;
  out[6] = 0;
  out[7] = 0;
  out[8] = 0;
  out[9] = 0;
  out[10] = 2 * nf;
  out[11] = 0;
  out[12] = (left + right) * lr;
  out[13] = (top + bottom) * bt;
  out[14] = (far + near) * nf;
  out[15] = 1;
  return out;
}
/**
 * Alias for {@link mat4.orthoNO}
 * @function
 */

var ortho = orthoNO;
/**
 * Generates a orthogonal projection matrix with the given bounds.
 * The near/far clip planes correspond to a normalized device coordinate Z range of [0, 1],
 * which matches WebGPU/Vulkan/DirectX/Metal's clip volume.
 *
 * @param {mat4} out mat4 frustum matrix will be written into
 * @param {number} left Left bound of the frustum
 * @param {number} right Right bound of the frustum
 * @param {number} bottom Bottom bound of the frustum
 * @param {number} top Top bound of the frustum
 * @param {number} near Near bound of the frustum
 * @param {number} far Far bound of the frustum
 * @returns {mat4} out
 */

function orthoZO(out, left, right, bottom, top, near, far) {
  var lr = 1 / (left - right);
  var bt = 1 / (bottom - top);
  var nf = 1 / (near - far);
  out[0] = -2 * lr;
  out[1] = 0;
  out[2] = 0;
  out[3] = 0;
  out[4] = 0;
  out[5] = -2 * bt;
  out[6] = 0;
  out[7] = 0;
  out[8] = 0;
  out[9] = 0;
  out[10] = nf;
  out[11] = 0;
  out[12] = (left + right) * lr;
  out[13] = (top + bottom) * bt;
  out[14] = near * nf;
  out[15] = 1;
  return out;
}
/**
 * Generates a look-at matrix with the given eye position, focal point, and up axis.
 * If you want a matrix that actually makes an object look at another object, you should use targetTo instead.
 *
 * @param {mat4} out mat4 frustum matrix will be written into
 * @param {ReadonlyVec3} eye Position of the viewer
 * @param {ReadonlyVec3} center Point the viewer is looking at
 * @param {ReadonlyVec3} up vec3 pointing up
 * @returns {mat4} out
 */

function lookAt(out, eye, center, up) {
  var x0, x1, x2, y0, y1, y2, z0, z1, z2, len;
  var eyex = eye[0];
  var eyey = eye[1];
  var eyez = eye[2];
  var upx = up[0];
  var upy = up[1];
  var upz = up[2];
  var centerx = center[0];
  var centery = center[1];
  var centerz = center[2];

  if (Math.abs(eyex - centerx) < EPSILON && Math.abs(eyey - centery) < EPSILON && Math.abs(eyez - centerz) < EPSILON) {
    return identity$2(out);
  }

  z0 = eyex - centerx;
  z1 = eyey - centery;
  z2 = eyez - centerz;
  len = 1 / Math.hypot(z0, z1, z2);
  z0 *= len;
  z1 *= len;
  z2 *= len;
  x0 = upy * z2 - upz * z1;
  x1 = upz * z0 - upx * z2;
  x2 = upx * z1 - upy * z0;
  len = Math.hypot(x0, x1, x2);

  if (!len) {
    x0 = 0;
    x1 = 0;
    x2 = 0;
  } else {
    len = 1 / len;
    x0 *= len;
    x1 *= len;
    x2 *= len;
  }

  y0 = z1 * x2 - z2 * x1;
  y1 = z2 * x0 - z0 * x2;
  y2 = z0 * x1 - z1 * x0;
  len = Math.hypot(y0, y1, y2);

  if (!len) {
    y0 = 0;
    y1 = 0;
    y2 = 0;
  } else {
    len = 1 / len;
    y0 *= len;
    y1 *= len;
    y2 *= len;
  }

  out[0] = x0;
  out[1] = y0;
  out[2] = z0;
  out[3] = 0;
  out[4] = x1;
  out[5] = y1;
  out[6] = z1;
  out[7] = 0;
  out[8] = x2;
  out[9] = y2;
  out[10] = z2;
  out[11] = 0;
  out[12] = -(x0 * eyex + x1 * eyey + x2 * eyez);
  out[13] = -(y0 * eyex + y1 * eyey + y2 * eyez);
  out[14] = -(z0 * eyex + z1 * eyey + z2 * eyez);
  out[15] = 1;
  return out;
}
/**
 * Generates a matrix that makes something look at something else.
 *
 * @param {mat4} out mat4 frustum matrix will be written into
 * @param {ReadonlyVec3} eye Position of the viewer
 * @param {ReadonlyVec3} center Point the viewer is looking at
 * @param {ReadonlyVec3} up vec3 pointing up
 * @returns {mat4} out
 */

function targetTo(out, eye, target, up) {
  var eyex = eye[0],
      eyey = eye[1],
      eyez = eye[2],
      upx = up[0],
      upy = up[1],
      upz = up[2];
  var z0 = eyex - target[0],
      z1 = eyey - target[1],
      z2 = eyez - target[2];
  var len = z0 * z0 + z1 * z1 + z2 * z2;

  if (len > 0) {
    len = 1 / Math.sqrt(len);
    z0 *= len;
    z1 *= len;
    z2 *= len;
  }

  var x0 = upy * z2 - upz * z1,
      x1 = upz * z0 - upx * z2,
      x2 = upx * z1 - upy * z0;
  len = x0 * x0 + x1 * x1 + x2 * x2;

  if (len > 0) {
    len = 1 / Math.sqrt(len);
    x0 *= len;
    x1 *= len;
    x2 *= len;
  }

  out[0] = x0;
  out[1] = x1;
  out[2] = x2;
  out[3] = 0;
  out[4] = z1 * x2 - z2 * x1;
  out[5] = z2 * x0 - z0 * x2;
  out[6] = z0 * x1 - z1 * x0;
  out[7] = 0;
  out[8] = z0;
  out[9] = z1;
  out[10] = z2;
  out[11] = 0;
  out[12] = eyex;
  out[13] = eyey;
  out[14] = eyez;
  out[15] = 1;
  return out;
}
/**
 * Returns a string representation of a mat4
 *
 * @param {ReadonlyMat4} a matrix to represent as a string
 * @returns {String} string representation of the matrix
 */

function str$5(a) {
  return "mat4(" + a[0] + ", " + a[1] + ", " + a[2] + ", " + a[3] + ", " + a[4] + ", " + a[5] + ", " + a[6] + ", " + a[7] + ", " + a[8] + ", " + a[9] + ", " + a[10] + ", " + a[11] + ", " + a[12] + ", " + a[13] + ", " + a[14] + ", " + a[15] + ")";
}
/**
 * Returns Frobenius norm of a mat4
 *
 * @param {ReadonlyMat4} a the matrix to calculate Frobenius norm of
 * @returns {Number} Frobenius norm
 */

function frob(a) {
  return Math.hypot(a[0], a[1], a[2], a[3], a[4], a[5], a[6], a[7], a[8], a[9], a[10], a[11], a[12], a[13], a[14], a[15]);
}
/**
 * Adds two mat4's
 *
 * @param {mat4} out the receiving matrix
 * @param {ReadonlyMat4} a the first operand
 * @param {ReadonlyMat4} b the second operand
 * @returns {mat4} out
 */

function add$5(out, a, b) {
  out[0] = a[0] + b[0];
  out[1] = a[1] + b[1];
  out[2] = a[2] + b[2];
  out[3] = a[3] + b[3];
  out[4] = a[4] + b[4];
  out[5] = a[5] + b[5];
  out[6] = a[6] + b[6];
  out[7] = a[7] + b[7];
  out[8] = a[8] + b[8];
  out[9] = a[9] + b[9];
  out[10] = a[10] + b[10];
  out[11] = a[11] + b[11];
  out[12] = a[12] + b[12];
  out[13] = a[13] + b[13];
  out[14] = a[14] + b[14];
  out[15] = a[15] + b[15];
  return out;
}
/**
 * Subtracts matrix b from matrix a
 *
 * @param {mat4} out the receiving matrix
 * @param {ReadonlyMat4} a the first operand
 * @param {ReadonlyMat4} b the second operand
 * @returns {mat4} out
 */

function subtract$3(out, a, b) {
  out[0] = a[0] - b[0];
  out[1] = a[1] - b[1];
  out[2] = a[2] - b[2];
  out[3] = a[3] - b[3];
  out[4] = a[4] - b[4];
  out[5] = a[5] - b[5];
  out[6] = a[6] - b[6];
  out[7] = a[7] - b[7];
  out[8] = a[8] - b[8];
  out[9] = a[9] - b[9];
  out[10] = a[10] - b[10];
  out[11] = a[11] - b[11];
  out[12] = a[12] - b[12];
  out[13] = a[13] - b[13];
  out[14] = a[14] - b[14];
  out[15] = a[15] - b[15];
  return out;
}
/**
 * Multiply each element of the matrix by a scalar.
 *
 * @param {mat4} out the receiving matrix
 * @param {ReadonlyMat4} a the matrix to scale
 * @param {Number} b amount to scale the matrix's elements by
 * @returns {mat4} out
 */

function multiplyScalar(out, a, b) {
  out[0] = a[0] * b;
  out[1] = a[1] * b;
  out[2] = a[2] * b;
  out[3] = a[3] * b;
  out[4] = a[4] * b;
  out[5] = a[5] * b;
  out[6] = a[6] * b;
  out[7] = a[7] * b;
  out[8] = a[8] * b;
  out[9] = a[9] * b;
  out[10] = a[10] * b;
  out[11] = a[11] * b;
  out[12] = a[12] * b;
  out[13] = a[13] * b;
  out[14] = a[14] * b;
  out[15] = a[15] * b;
  return out;
}
/**
 * Adds two mat4's after multiplying each element of the second operand by a scalar value.
 *
 * @param {mat4} out the receiving vector
 * @param {ReadonlyMat4} a the first operand
 * @param {ReadonlyMat4} b the second operand
 * @param {Number} scale the amount to scale b's elements by before adding
 * @returns {mat4} out
 */

function multiplyScalarAndAdd(out, a, b, scale) {
  out[0] = a[0] + b[0] * scale;
  out[1] = a[1] + b[1] * scale;
  out[2] = a[2] + b[2] * scale;
  out[3] = a[3] + b[3] * scale;
  out[4] = a[4] + b[4] * scale;
  out[5] = a[5] + b[5] * scale;
  out[6] = a[6] + b[6] * scale;
  out[7] = a[7] + b[7] * scale;
  out[8] = a[8] + b[8] * scale;
  out[9] = a[9] + b[9] * scale;
  out[10] = a[10] + b[10] * scale;
  out[11] = a[11] + b[11] * scale;
  out[12] = a[12] + b[12] * scale;
  out[13] = a[13] + b[13] * scale;
  out[14] = a[14] + b[14] * scale;
  out[15] = a[15] + b[15] * scale;
  return out;
}
/**
 * Returns whether or not the matrices have exactly the same elements in the same position (when compared with ===)
 *
 * @param {ReadonlyMat4} a The first matrix.
 * @param {ReadonlyMat4} b The second matrix.
 * @returns {Boolean} True if the matrices are equal, false otherwise.
 */

function exactEquals$5(a, b) {
  return a[0] === b[0] && a[1] === b[1] && a[2] === b[2] && a[3] === b[3] && a[4] === b[4] && a[5] === b[5] && a[6] === b[6] && a[7] === b[7] && a[8] === b[8] && a[9] === b[9] && a[10] === b[10] && a[11] === b[11] && a[12] === b[12] && a[13] === b[13] && a[14] === b[14] && a[15] === b[15];
}
/**
 * Returns whether or not the matrices have approximately the same elements in the same position.
 *
 * @param {ReadonlyMat4} a The first matrix.
 * @param {ReadonlyMat4} b The second matrix.
 * @returns {Boolean} True if the matrices are equal, false otherwise.
 */

function equals$5(a, b) {
  var a0 = a[0],
      a1 = a[1],
      a2 = a[2],
      a3 = a[3];
  var a4 = a[4],
      a5 = a[5],
      a6 = a[6],
      a7 = a[7];
  var a8 = a[8],
      a9 = a[9],
      a10 = a[10],
      a11 = a[11];
  var a12 = a[12],
      a13 = a[13],
      a14 = a[14],
      a15 = a[15];
  var b0 = b[0],
      b1 = b[1],
      b2 = b[2],
      b3 = b[3];
  var b4 = b[4],
      b5 = b[5],
      b6 = b[6],
      b7 = b[7];
  var b8 = b[8],
      b9 = b[9],
      b10 = b[10],
      b11 = b[11];
  var b12 = b[12],
      b13 = b[13],
      b14 = b[14],
      b15 = b[15];
  return Math.abs(a0 - b0) <= EPSILON * Math.max(1.0, Math.abs(a0), Math.abs(b0)) && Math.abs(a1 - b1) <= EPSILON * Math.max(1.0, Math.abs(a1), Math.abs(b1)) && Math.abs(a2 - b2) <= EPSILON * Math.max(1.0, Math.abs(a2), Math.abs(b2)) && Math.abs(a3 - b3) <= EPSILON * Math.max(1.0, Math.abs(a3), Math.abs(b3)) && Math.abs(a4 - b4) <= EPSILON * Math.max(1.0, Math.abs(a4), Math.abs(b4)) && Math.abs(a5 - b5) <= EPSILON * Math.max(1.0, Math.abs(a5), Math.abs(b5)) && Math.abs(a6 - b6) <= EPSILON * Math.max(1.0, Math.abs(a6), Math.abs(b6)) && Math.abs(a7 - b7) <= EPSILON * Math.max(1.0, Math.abs(a7), Math.abs(b7)) && Math.abs(a8 - b8) <= EPSILON * Math.max(1.0, Math.abs(a8), Math.abs(b8)) && Math.abs(a9 - b9) <= EPSILON * Math.max(1.0, Math.abs(a9), Math.abs(b9)) && Math.abs(a10 - b10) <= EPSILON * Math.max(1.0, Math.abs(a10), Math.abs(b10)) && Math.abs(a11 - b11) <= EPSILON * Math.max(1.0, Math.abs(a11), Math.abs(b11)) && Math.abs(a12 - b12) <= EPSILON * Math.max(1.0, Math.abs(a12), Math.abs(b12)) && Math.abs(a13 - b13) <= EPSILON * Math.max(1.0, Math.abs(a13), Math.abs(b13)) && Math.abs(a14 - b14) <= EPSILON * Math.max(1.0, Math.abs(a14), Math.abs(b14)) && Math.abs(a15 - b15) <= EPSILON * Math.max(1.0, Math.abs(a15), Math.abs(b15));
}
/**
 * Alias for {@link mat4.multiply}
 * @function
 */

var mul$5 = multiply$5;
/**
 * Alias for {@link mat4.subtract}
 * @function
 */

var sub$3 = subtract$3;

var mat4 = /*#__PURE__*/Object.freeze({
__proto__: null,
add: add$5,
adjoint: adjoint,
clone: clone$5,
copy: copy$5,
create: create$5,
determinant: determinant,
equals: equals$5,
exactEquals: exactEquals$5,
frob: frob,
fromQuat: fromQuat,
fromQuat2: fromQuat2,
fromRotation: fromRotation$1,
fromRotationTranslation: fromRotationTranslation$1,
fromRotationTranslationScale: fromRotationTranslationScale,
fromRotationTranslationScaleOrigin: fromRotationTranslationScaleOrigin,
fromScaling: fromScaling,
fromTranslation: fromTranslation$1,
fromValues: fromValues$5,
fromXRotation: fromXRotation,
fromYRotation: fromYRotation,
fromZRotation: fromZRotation,
frustum: frustum,
getRotation: getRotation,
getScaling: getScaling,
getTranslation: getTranslation$1,
identity: identity$2,
invert: invert$2,
lookAt: lookAt,
mul: mul$5,
multiply: multiply$5,
multiplyScalar: multiplyScalar,
multiplyScalarAndAdd: multiplyScalarAndAdd,
ortho: ortho,
orthoNO: orthoNO,
orthoZO: orthoZO,
perspective: perspective,
perspectiveFromFieldOfView: perspectiveFromFieldOfView,
perspectiveNO: perspectiveNO,
perspectiveZO: perspectiveZO,
rotate: rotate$1,
rotateX: rotateX$3,
rotateY: rotateY$3,
rotateZ: rotateZ$3,
scale: scale$5,
set: set$5,
str: str$5,
sub: sub$3,
subtract: subtract$3,
targetTo: targetTo,
translate: translate$1,
transpose: transpose
});

/**
 * 3 Dimensional Vector
 * @module vec3
 */

/**
 * Creates a new, empty vec3
 *
 * @returns {vec3} a new 3D vector
 */

function create$4() {
  var out = new ARRAY_TYPE(3);

  if (ARRAY_TYPE != Float32Array) {
    out[0] = 0;
    out[1] = 0;
    out[2] = 0;
  }

  return out;
}
/**
 * Creates a new vec3 initialized with values from an existing vector
 *
 * @param {ReadonlyVec3} a vector to clone
 * @returns {vec3} a new 3D vector
 */

function clone$4(a) {
  var out = new ARRAY_TYPE(3);
  out[0] = a[0];
  out[1] = a[1];
  out[2] = a[2];
  return out;
}
/**
 * Calculates the length of a vec3
 *
 * @param {ReadonlyVec3} a vector to calculate length of
 * @returns {Number} length of a
 */

function length$4(a) {
  var x = a[0];
  var y = a[1];
  var z = a[2];
  return Math.hypot(x, y, z);
}
/**
 * Creates a new vec3 initialized with the given values
 *
 * @param {Number} x X component
 * @param {Number} y Y component
 * @param {Number} z Z component
 * @returns {vec3} a new 3D vector
 */

function fromValues$4(x, y, z) {
  var out = new ARRAY_TYPE(3);
  out[0] = x;
  out[1] = y;
  out[2] = z;
  return out;
}
/**
 * Copy the values from one vec3 to another
 *
 * @param {vec3} out the receiving vector
 * @param {ReadonlyVec3} a the source vector
 * @returns {vec3} out
 */

function copy$4(out, a) {
  out[0] = a[0];
  out[1] = a[1];
  out[2] = a[2];
  return out;
}
/**
 * Set the components of a vec3 to the given values
 *
 * @param {vec3} out the receiving vector
 * @param {Number} x X component
 * @param {Number} y Y component
 * @param {Number} z Z component
 * @returns {vec3} out
 */

function set$4(out, x, y, z) {
  out[0] = x;
  out[1] = y;
  out[2] = z;
  return out;
}
/**
 * Adds two vec3's
 *
 * @param {vec3} out the receiving vector
 * @param {ReadonlyVec3} a the first operand
 * @param {ReadonlyVec3} b the second operand
 * @returns {vec3} out
 */

function add$4(out, a, b) {
  out[0] = a[0] + b[0];
  out[1] = a[1] + b[1];
  out[2] = a[2] + b[2];
  return out;
}
/**
 * Subtracts vector b from vector a
 *
 * @param {vec3} out the receiving vector
 * @param {ReadonlyVec3} a the first operand
 * @param {ReadonlyVec3} b the second operand
 * @returns {vec3} out
 */

function subtract$2(out, a, b) {
  out[0] = a[0] - b[0];
  out[1] = a[1] - b[1];
  out[2] = a[2] - b[2];
  return out;
}
/**
 * Multiplies two vec3's
 *
 * @param {vec3} out the receiving vector
 * @param {ReadonlyVec3} a the first operand
 * @param {ReadonlyVec3} b the second operand
 * @returns {vec3} out
 */

function multiply$4(out, a, b) {
  out[0] = a[0] * b[0];
  out[1] = a[1] * b[1];
  out[2] = a[2] * b[2];
  return out;
}
/**
 * Divides two vec3's
 *
 * @param {vec3} out the receiving vector
 * @param {ReadonlyVec3} a the first operand
 * @param {ReadonlyVec3} b the second operand
 * @returns {vec3} out
 */

function divide$2(out, a, b) {
  out[0] = a[0] / b[0];
  out[1] = a[1] / b[1];
  out[2] = a[2] / b[2];
  return out;
}
/**
 * Math.ceil the components of a vec3
 *
 * @param {vec3} out the receiving vector
 * @param {ReadonlyVec3} a vector to ceil
 * @returns {vec3} out
 */

function ceil$2(out, a) {
  out[0] = Math.ceil(a[0]);
  out[1] = Math.ceil(a[1]);
  out[2] = Math.ceil(a[2]);
  return out;
}
/**
 * Math.floor the components of a vec3
 *
 * @param {vec3} out the receiving vector
 * @param {ReadonlyVec3} a vector to floor
 * @returns {vec3} out
 */

function floor$2(out, a) {
  out[0] = Math.floor(a[0]);
  out[1] = Math.floor(a[1]);
  out[2] = Math.floor(a[2]);
  return out;
}
/**
 * Returns the minimum of two vec3's
 *
 * @param {vec3} out the receiving vector
 * @param {ReadonlyVec3} a the first operand
 * @param {ReadonlyVec3} b the second operand
 * @returns {vec3} out
 */

function min$2(out, a, b) {
  out[0] = Math.min(a[0], b[0]);
  out[1] = Math.min(a[1], b[1]);
  out[2] = Math.min(a[2], b[2]);
  return out;
}
/**
 * Returns the maximum of two vec3's
 *
 * @param {vec3} out the receiving vector
 * @param {ReadonlyVec3} a the first operand
 * @param {ReadonlyVec3} b the second operand
 * @returns {vec3} out
 */

function max$2(out, a, b) {
  out[0] = Math.max(a[0], b[0]);
  out[1] = Math.max(a[1], b[1]);
  out[2] = Math.max(a[2], b[2]);
  return out;
}
/**
 * Math.round the components of a vec3
 *
 * @param {vec3} out the receiving vector
 * @param {ReadonlyVec3} a vector to round
 * @returns {vec3} out
 */

function round$2(out, a) {
  out[0] = Math.round(a[0]);
  out[1] = Math.round(a[1]);
  out[2] = Math.round(a[2]);
  return out;
}
/**
 * Scales a vec3 by a scalar number
 *
 * @param {vec3} out the receiving vector
 * @param {ReadonlyVec3} a the vector to scale
 * @param {Number} b amount to scale the vector by
 * @returns {vec3} out
 */

function scale$4(out, a, b) {
  out[0] = a[0] * b;
  out[1] = a[1] * b;
  out[2] = a[2] * b;
  return out;
}
/**
 * Adds two vec3's after scaling the second operand by a scalar value
 *
 * @param {vec3} out the receiving vector
 * @param {ReadonlyVec3} a the first operand
 * @param {ReadonlyVec3} b the second operand
 * @param {Number} scale the amount to scale b by before adding
 * @returns {vec3} out
 */

function scaleAndAdd$2(out, a, b, scale) {
  out[0] = a[0] + b[0] * scale;
  out[1] = a[1] + b[1] * scale;
  out[2] = a[2] + b[2] * scale;
  return out;
}
/**
 * Calculates the euclidian distance between two vec3's
 *
 * @param {ReadonlyVec3} a the first operand
 * @param {ReadonlyVec3} b the second operand
 * @returns {Number} distance between a and b
 */

function distance$2(a, b) {
  var x = b[0] - a[0];
  var y = b[1] - a[1];
  var z = b[2] - a[2];
  return Math.hypot(x, y, z);
}
/**
 * Calculates the squared euclidian distance between two vec3's
 *
 * @param {ReadonlyVec3} a the first operand
 * @param {ReadonlyVec3} b the second operand
 * @returns {Number} squared distance between a and b
 */

function squaredDistance$2(a, b) {
  var x = b[0] - a[0];
  var y = b[1] - a[1];
  var z = b[2] - a[2];
  return x * x + y * y + z * z;
}
/**
 * Calculates the squared length of a vec3
 *
 * @param {ReadonlyVec3} a vector to calculate squared length of
 * @returns {Number} squared length of a
 */

function squaredLength$4(a) {
  var x = a[0];
  var y = a[1];
  var z = a[2];
  return x * x + y * y + z * z;
}
/**
 * Negates the components of a vec3
 *
 * @param {vec3} out the receiving vector
 * @param {ReadonlyVec3} a vector to negate
 * @returns {vec3} out
 */

function negate$2(out, a) {
  out[0] = -a[0];
  out[1] = -a[1];
  out[2] = -a[2];
  return out;
}
/**
 * Returns the inverse of the components of a vec3
 *
 * @param {vec3} out the receiving vector
 * @param {ReadonlyVec3} a vector to invert
 * @returns {vec3} out
 */

function inverse$2(out, a) {
  out[0] = 1.0 / a[0];
  out[1] = 1.0 / a[1];
  out[2] = 1.0 / a[2];
  return out;
}
/**
 * Normalize a vec3
 *
 * @param {vec3} out the receiving vector
 * @param {ReadonlyVec3} a vector to normalize
 * @returns {vec3} out
 */

function normalize$4(out, a) {
  var x = a[0];
  var y = a[1];
  var z = a[2];
  var len = x * x + y * y + z * z;

  if (len > 0) {
    //TODO: evaluate use of glm_invsqrt here?
    len = 1 / Math.sqrt(len);
  }

  out[0] = a[0] * len;
  out[1] = a[1] * len;
  out[2] = a[2] * len;
  return out;
}
/**
 * Calculates the dot product of two vec3's
 *
 * @param {ReadonlyVec3} a the first operand
 * @param {ReadonlyVec3} b the second operand
 * @returns {Number} dot product of a and b
 */

function dot$4(a, b) {
  return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
}
/**
 * Computes the cross product of two vec3's
 *
 * @param {vec3} out the receiving vector
 * @param {ReadonlyVec3} a the first operand
 * @param {ReadonlyVec3} b the second operand
 * @returns {vec3} out
 */

function cross$2(out, a, b) {
  var ax = a[0],
      ay = a[1],
      az = a[2];
  var bx = b[0],
      by = b[1],
      bz = b[2];
  out[0] = ay * bz - az * by;
  out[1] = az * bx - ax * bz;
  out[2] = ax * by - ay * bx;
  return out;
}
/**
 * Performs a linear interpolation between two vec3's
 *
 * @param {vec3} out the receiving vector
 * @param {ReadonlyVec3} a the first operand
 * @param {ReadonlyVec3} b the second operand
 * @param {Number} t interpolation amount, in the range [0-1], between the two inputs
 * @returns {vec3} out
 */

function lerp$4(out, a, b, t) {
  var ax = a[0];
  var ay = a[1];
  var az = a[2];
  out[0] = ax + t * (b[0] - ax);
  out[1] = ay + t * (b[1] - ay);
  out[2] = az + t * (b[2] - az);
  return out;
}
/**
 * Performs a hermite interpolation with two control points
 *
 * @param {vec3} out the receiving vector
 * @param {ReadonlyVec3} a the first operand
 * @param {ReadonlyVec3} b the second operand
 * @param {ReadonlyVec3} c the third operand
 * @param {ReadonlyVec3} d the fourth operand
 * @param {Number} t interpolation amount, in the range [0-1], between the two inputs
 * @returns {vec3} out
 */

function hermite(out, a, b, c, d, t) {
  var factorTimes2 = t * t;
  var factor1 = factorTimes2 * (2 * t - 3) + 1;
  var factor2 = factorTimes2 * (t - 2) + t;
  var factor3 = factorTimes2 * (t - 1);
  var factor4 = factorTimes2 * (3 - 2 * t);
  out[0] = a[0] * factor1 + b[0] * factor2 + c[0] * factor3 + d[0] * factor4;
  out[1] = a[1] * factor1 + b[1] * factor2 + c[1] * factor3 + d[1] * factor4;
  out[2] = a[2] * factor1 + b[2] * factor2 + c[2] * factor3 + d[2] * factor4;
  return out;
}
/**
 * Performs a bezier interpolation with two control points
 *
 * @param {vec3} out the receiving vector
 * @param {ReadonlyVec3} a the first operand
 * @param {ReadonlyVec3} b the second operand
 * @param {ReadonlyVec3} c the third operand
 * @param {ReadonlyVec3} d the fourth operand
 * @param {Number} t interpolation amount, in the range [0-1], between the two inputs
 * @returns {vec3} out
 */

function bezier(out, a, b, c, d, t) {
  var inverseFactor = 1 - t;
  var inverseFactorTimesTwo = inverseFactor * inverseFactor;
  var factorTimes2 = t * t;
  var factor1 = inverseFactorTimesTwo * inverseFactor;
  var factor2 = 3 * t * inverseFactorTimesTwo;
  var factor3 = 3 * factorTimes2 * inverseFactor;
  var factor4 = factorTimes2 * t;
  out[0] = a[0] * factor1 + b[0] * factor2 + c[0] * factor3 + d[0] * factor4;
  out[1] = a[1] * factor1 + b[1] * factor2 + c[1] * factor3 + d[1] * factor4;
  out[2] = a[2] * factor1 + b[2] * factor2 + c[2] * factor3 + d[2] * factor4;
  return out;
}
/**
 * Generates a random vector with the given scale
 *
 * @param {vec3} out the receiving vector
 * @param {Number} [scale] Length of the resulting vector. If ommitted, a unit vector will be returned
 * @returns {vec3} out
 */

function random$3(out, scale) {
  scale = scale || 1.0;
  var r = RANDOM() * 2.0 * Math.PI;
  var z = RANDOM() * 2.0 - 1.0;
  var zScale = Math.sqrt(1.0 - z * z) * scale;
  out[0] = Math.cos(r) * zScale;
  out[1] = Math.sin(r) * zScale;
  out[2] = z * scale;
  return out;
}
/**
 * Transforms the vec3 with a mat4.
 * 4th vector component is implicitly '1'
 *
 * @param {vec3} out the receiving vector
 * @param {ReadonlyVec3} a the vector to transform
 * @param {ReadonlyMat4} m matrix to transform with
 * @returns {vec3} out
 */

function transformMat4$2(out, a, m) {
  var x = a[0],
      y = a[1],
      z = a[2];
  var w = m[3] * x + m[7] * y + m[11] * z + m[15];
  w = w || 1.0;
  out[0] = (m[0] * x + m[4] * y + m[8] * z + m[12]) / w;
  out[1] = (m[1] * x + m[5] * y + m[9] * z + m[13]) / w;
  out[2] = (m[2] * x + m[6] * y + m[10] * z + m[14]) / w;
  return out;
}
/**
 * Transforms the vec3 with a mat3.
 *
 * @param {vec3} out the receiving vector
 * @param {ReadonlyVec3} a the vector to transform
 * @param {ReadonlyMat3} m the 3x3 matrix to transform with
 * @returns {vec3} out
 */

function transformMat3$1(out, a, m) {
  var x = a[0],
      y = a[1],
      z = a[2];
  out[0] = x * m[0] + y * m[3] + z * m[6];
  out[1] = x * m[1] + y * m[4] + z * m[7];
  out[2] = x * m[2] + y * m[5] + z * m[8];
  return out;
}
/**
 * Transforms the vec3 with a quat
 * Can also be used for dual quaternions. (Multiply it with the real part)
 *
 * @param {vec3} out the receiving vector
 * @param {ReadonlyVec3} a the vector to transform
 * @param {ReadonlyQuat} q quaternion to transform with
 * @returns {vec3} out
 */

function transformQuat$1(out, a, q) {
  // benchmarks: https://jsperf.com/quaternion-transform-vec3-implementations-fixed
  var qx = q[0],
      qy = q[1],
      qz = q[2],
      qw = q[3];
  var x = a[0],
      y = a[1],
      z = a[2]; // var qvec = [qx, qy, qz];
  // var uv = vec3.cross([], qvec, a);

  var uvx = qy * z - qz * y,
      uvy = qz * x - qx * z,
      uvz = qx * y - qy * x; // var uuv = vec3.cross([], qvec, uv);

  var uuvx = qy * uvz - qz * uvy,
      uuvy = qz * uvx - qx * uvz,
      uuvz = qx * uvy - qy * uvx; // vec3.scale(uv, uv, 2 * w);

  var w2 = qw * 2;
  uvx *= w2;
  uvy *= w2;
  uvz *= w2; // vec3.scale(uuv, uuv, 2);

  uuvx *= 2;
  uuvy *= 2;
  uuvz *= 2; // return vec3.add(out, a, vec3.add(out, uv, uuv));

  out[0] = x + uvx + uuvx;
  out[1] = y + uvy + uuvy;
  out[2] = z + uvz + uuvz;
  return out;
}
/**
 * Rotate a 3D vector around the x-axis
 * @param {vec3} out The receiving vec3
 * @param {ReadonlyVec3} a The vec3 point to rotate
 * @param {ReadonlyVec3} b The origin of the rotation
 * @param {Number} rad The angle of rotation in radians
 * @returns {vec3} out
 */

function rotateX$2(out, a, b, rad) {
  var p = [],
      r = []; //Translate point to the origin

  p[0] = a[0] - b[0];
  p[1] = a[1] - b[1];
  p[2] = a[2] - b[2]; //perform rotation

  r[0] = p[0];
  r[1] = p[1] * Math.cos(rad) - p[2] * Math.sin(rad);
  r[2] = p[1] * Math.sin(rad) + p[2] * Math.cos(rad); //translate to correct position

  out[0] = r[0] + b[0];
  out[1] = r[1] + b[1];
  out[2] = r[2] + b[2];
  return out;
}
/**
 * Rotate a 3D vector around the y-axis
 * @param {vec3} out The receiving vec3
 * @param {ReadonlyVec3} a The vec3 point to rotate
 * @param {ReadonlyVec3} b The origin of the rotation
 * @param {Number} rad The angle of rotation in radians
 * @returns {vec3} out
 */

function rotateY$2(out, a, b, rad) {
  var p = [],
      r = []; //Translate point to the origin

  p[0] = a[0] - b[0];
  p[1] = a[1] - b[1];
  p[2] = a[2] - b[2]; //perform rotation

  r[0] = p[2] * Math.sin(rad) + p[0] * Math.cos(rad);
  r[1] = p[1];
  r[2] = p[2] * Math.cos(rad) - p[0] * Math.sin(rad); //translate to correct position

  out[0] = r[0] + b[0];
  out[1] = r[1] + b[1];
  out[2] = r[2] + b[2];
  return out;
}
/**
 * Rotate a 3D vector around the z-axis
 * @param {vec3} out The receiving vec3
 * @param {ReadonlyVec3} a The vec3 point to rotate
 * @param {ReadonlyVec3} b The origin of the rotation
 * @param {Number} rad The angle of rotation in radians
 * @returns {vec3} out
 */

function rotateZ$2(out, a, b, rad) {
  var p = [],
      r = []; //Translate point to the origin

  p[0] = a[0] - b[0];
  p[1] = a[1] - b[1];
  p[2] = a[2] - b[2]; //perform rotation

  r[0] = p[0] * Math.cos(rad) - p[1] * Math.sin(rad);
  r[1] = p[0] * Math.sin(rad) + p[1] * Math.cos(rad);
  r[2] = p[2]; //translate to correct position

  out[0] = r[0] + b[0];
  out[1] = r[1] + b[1];
  out[2] = r[2] + b[2];
  return out;
}
/**
 * Get the angle between two 3D vectors
 * @param {ReadonlyVec3} a The first operand
 * @param {ReadonlyVec3} b The second operand
 * @returns {Number} The angle in radians
 */

function angle$1(a, b) {
  var ax = a[0],
      ay = a[1],
      az = a[2],
      bx = b[0],
      by = b[1],
      bz = b[2],
      mag1 = Math.sqrt(ax * ax + ay * ay + az * az),
      mag2 = Math.sqrt(bx * bx + by * by + bz * bz),
      mag = mag1 * mag2,
      cosine = mag && dot$4(a, b) / mag;
  return Math.acos(Math.min(Math.max(cosine, -1), 1));
}
/**
 * Set the components of a vec3 to zero
 *
 * @param {vec3} out the receiving vector
 * @returns {vec3} out
 */

function zero$2(out) {
  out[0] = 0.0;
  out[1] = 0.0;
  out[2] = 0.0;
  return out;
}
/**
 * Returns a string representation of a vector
 *
 * @param {ReadonlyVec3} a vector to represent as a string
 * @returns {String} string representation of the vector
 */

function str$4(a) {
  return "vec3(" + a[0] + ", " + a[1] + ", " + a[2] + ")";
}
/**
 * Returns whether or not the vectors have exactly the same elements in the same position (when compared with ===)
 *
 * @param {ReadonlyVec3} a The first vector.
 * @param {ReadonlyVec3} b The second vector.
 * @returns {Boolean} True if the vectors are equal, false otherwise.
 */

function exactEquals$4(a, b) {
  return a[0] === b[0] && a[1] === b[1] && a[2] === b[2];
}
/**
 * Returns whether or not the vectors have approximately the same elements in the same position.
 *
 * @param {ReadonlyVec3} a The first vector.
 * @param {ReadonlyVec3} b The second vector.
 * @returns {Boolean} True if the vectors are equal, false otherwise.
 */

function equals$4(a, b) {
  var a0 = a[0],
      a1 = a[1],
      a2 = a[2];
  var b0 = b[0],
      b1 = b[1],
      b2 = b[2];
  return Math.abs(a0 - b0) <= EPSILON * Math.max(1.0, Math.abs(a0), Math.abs(b0)) && Math.abs(a1 - b1) <= EPSILON * Math.max(1.0, Math.abs(a1), Math.abs(b1)) && Math.abs(a2 - b2) <= EPSILON * Math.max(1.0, Math.abs(a2), Math.abs(b2));
}
/**
 * Alias for {@link vec3.subtract}
 * @function
 */

var sub$2 = subtract$2;
/**
 * Alias for {@link vec3.multiply}
 * @function
 */

var mul$4 = multiply$4;
/**
 * Alias for {@link vec3.divide}
 * @function
 */

var div$2 = divide$2;
/**
 * Alias for {@link vec3.distance}
 * @function
 */

var dist$2 = distance$2;
/**
 * Alias for {@link vec3.squaredDistance}
 * @function
 */

var sqrDist$2 = squaredDistance$2;
/**
 * Alias for {@link vec3.length}
 * @function
 */

var len$4 = length$4;
/**
 * Alias for {@link vec3.squaredLength}
 * @function
 */

var sqrLen$4 = squaredLength$4;
/**
 * Perform some operation over an array of vec3s.
 *
 * @param {Array} a the array of vectors to iterate over
 * @param {Number} stride Number of elements between the start of each vec3. If 0 assumes tightly packed
 * @param {Number} offset Number of elements to skip at the beginning of the array
 * @param {Number} count Number of vec3s to iterate over. If 0 iterates over entire array
 * @param {Function} fn Function to call for each vector in the array
 * @param {Object} [arg] additional argument to pass to fn
 * @returns {Array} a
 * @function
 */

var forEach$2 = function () {
  var vec = create$4();
  return function (a, stride, offset, count, fn, arg) {
    var i, l;

    if (!stride) {
      stride = 3;
    }

    if (!offset) {
      offset = 0;
    }

    if (count) {
      l = Math.min(count * stride + offset, a.length);
    } else {
      l = a.length;
    }

    for (i = offset; i < l; i += stride) {
      vec[0] = a[i];
      vec[1] = a[i + 1];
      vec[2] = a[i + 2];
      fn(vec, vec, arg);
      a[i] = vec[0];
      a[i + 1] = vec[1];
      a[i + 2] = vec[2];
    }

    return a;
  };
}();

var vec3 = /*#__PURE__*/Object.freeze({
__proto__: null,
add: add$4,
angle: angle$1,
bezier: bezier,
ceil: ceil$2,
clone: clone$4,
copy: copy$4,
create: create$4,
cross: cross$2,
dist: dist$2,
distance: distance$2,
div: div$2,
divide: divide$2,
dot: dot$4,
equals: equals$4,
exactEquals: exactEquals$4,
floor: floor$2,
forEach: forEach$2,
fromValues: fromValues$4,
hermite: hermite,
inverse: inverse$2,
len: len$4,
length: length$4,
lerp: lerp$4,
max: max$2,
min: min$2,
mul: mul$4,
multiply: multiply$4,
negate: negate$2,
normalize: normalize$4,
random: random$3,
rotateX: rotateX$2,
rotateY: rotateY$2,
rotateZ: rotateZ$2,
round: round$2,
scale: scale$4,
scaleAndAdd: scaleAndAdd$2,
set: set$4,
sqrDist: sqrDist$2,
sqrLen: sqrLen$4,
squaredDistance: squaredDistance$2,
squaredLength: squaredLength$4,
str: str$4,
sub: sub$2,
subtract: subtract$2,
transformMat3: transformMat3$1,
transformMat4: transformMat4$2,
transformQuat: transformQuat$1,
zero: zero$2
});

/**
 * 4 Dimensional Vector
 * @module vec4
 */

/**
 * Creates a new, empty vec4
 *
 * @returns {vec4} a new 4D vector
 */

function create$3() {
  var out = new ARRAY_TYPE(4);

  if (ARRAY_TYPE != Float32Array) {
    out[0] = 0;
    out[1] = 0;
    out[2] = 0;
    out[3] = 0;
  }

  return out;
}
/**
 * Creates a new vec4 initialized with values from an existing vector
 *
 * @param {ReadonlyVec4} a vector to clone
 * @returns {vec4} a new 4D vector
 */

function clone$3(a) {
  var out = new ARRAY_TYPE(4);
  out[0] = a[0];
  out[1] = a[1];
  out[2] = a[2];
  out[3] = a[3];
  return out;
}
/**
 * Creates a new vec4 initialized with the given values
 *
 * @param {Number} x X component
 * @param {Number} y Y component
 * @param {Number} z Z component
 * @param {Number} w W component
 * @returns {vec4} a new 4D vector
 */

function fromValues$3(x, y, z, w) {
  var out = new ARRAY_TYPE(4);
  out[0] = x;
  out[1] = y;
  out[2] = z;
  out[3] = w;
  return out;
}
/**
 * Copy the values from one vec4 to another
 *
 * @param {vec4} out the receiving vector
 * @param {ReadonlyVec4} a the source vector
 * @returns {vec4} out
 */

function copy$3(out, a) {
  out[0] = a[0];
  out[1] = a[1];
  out[2] = a[2];
  out[3] = a[3];
  return out;
}
/**
 * Set the components of a vec4 to the given values
 *
 * @param {vec4} out the receiving vector
 * @param {Number} x X component
 * @param {Number} y Y component
 * @param {Number} z Z component
 * @param {Number} w W component
 * @returns {vec4} out
 */

function set$3(out, x, y, z, w) {
  out[0] = x;
  out[1] = y;
  out[2] = z;
  out[3] = w;
  return out;
}
/**
 * Adds two vec4's
 *
 * @param {vec4} out the receiving vector
 * @param {ReadonlyVec4} a the first operand
 * @param {ReadonlyVec4} b the second operand
 * @returns {vec4} out
 */

function add$3(out, a, b) {
  out[0] = a[0] + b[0];
  out[1] = a[1] + b[1];
  out[2] = a[2] + b[2];
  out[3] = a[3] + b[3];
  return out;
}
/**
 * Subtracts vector b from vector a
 *
 * @param {vec4} out the receiving vector
 * @param {ReadonlyVec4} a the first operand
 * @param {ReadonlyVec4} b the second operand
 * @returns {vec4} out
 */

function subtract$1(out, a, b) {
  out[0] = a[0] - b[0];
  out[1] = a[1] - b[1];
  out[2] = a[2] - b[2];
  out[3] = a[3] - b[3];
  return out;
}
/**
 * Multiplies two vec4's
 *
 * @param {vec4} out the receiving vector
 * @param {ReadonlyVec4} a the first operand
 * @param {ReadonlyVec4} b the second operand
 * @returns {vec4} out
 */

function multiply$3(out, a, b) {
  out[0] = a[0] * b[0];
  out[1] = a[1] * b[1];
  out[2] = a[2] * b[2];
  out[3] = a[3] * b[3];
  return out;
}
/**
 * Divides two vec4's
 *
 * @param {vec4} out the receiving vector
 * @param {ReadonlyVec4} a the first operand
 * @param {ReadonlyVec4} b the second operand
 * @returns {vec4} out
 */

function divide$1(out, a, b) {
  out[0] = a[0] / b[0];
  out[1] = a[1] / b[1];
  out[2] = a[2] / b[2];
  out[3] = a[3] / b[3];
  return out;
}
/**
 * Math.ceil the components of a vec4
 *
 * @param {vec4} out the receiving vector
 * @param {ReadonlyVec4} a vector to ceil
 * @returns {vec4} out
 */

function ceil$1(out, a) {
  out[0] = Math.ceil(a[0]);
  out[1] = Math.ceil(a[1]);
  out[2] = Math.ceil(a[2]);
  out[3] = Math.ceil(a[3]);
  return out;
}
/**
 * Math.floor the components of a vec4
 *
 * @param {vec4} out the receiving vector
 * @param {ReadonlyVec4} a vector to floor
 * @returns {vec4} out
 */

function floor$1(out, a) {
  out[0] = Math.floor(a[0]);
  out[1] = Math.floor(a[1]);
  out[2] = Math.floor(a[2]);
  out[3] = Math.floor(a[3]);
  return out;
}
/**
 * Returns the minimum of two vec4's
 *
 * @param {vec4} out the receiving vector
 * @param {ReadonlyVec4} a the first operand
 * @param {ReadonlyVec4} b the second operand
 * @returns {vec4} out
 */

function min$1(out, a, b) {
  out[0] = Math.min(a[0], b[0]);
  out[1] = Math.min(a[1], b[1]);
  out[2] = Math.min(a[2], b[2]);
  out[3] = Math.min(a[3], b[3]);
  return out;
}
/**
 * Returns the maximum of two vec4's
 *
 * @param {vec4} out the receiving vector
 * @param {ReadonlyVec4} a the first operand
 * @param {ReadonlyVec4} b the second operand
 * @returns {vec4} out
 */

function max$1(out, a, b) {
  out[0] = Math.max(a[0], b[0]);
  out[1] = Math.max(a[1], b[1]);
  out[2] = Math.max(a[2], b[2]);
  out[3] = Math.max(a[3], b[3]);
  return out;
}
/**
 * Math.round the components of a vec4
 *
 * @param {vec4} out the receiving vector
 * @param {ReadonlyVec4} a vector to round
 * @returns {vec4} out
 */

function round$1(out, a) {
  out[0] = Math.round(a[0]);
  out[1] = Math.round(a[1]);
  out[2] = Math.round(a[2]);
  out[3] = Math.round(a[3]);
  return out;
}
/**
 * Scales a vec4 by a scalar number
 *
 * @param {vec4} out the receiving vector
 * @param {ReadonlyVec4} a the vector to scale
 * @param {Number} b amount to scale the vector by
 * @returns {vec4} out
 */

function scale$3(out, a, b) {
  out[0] = a[0] * b;
  out[1] = a[1] * b;
  out[2] = a[2] * b;
  out[3] = a[3] * b;
  return out;
}
/**
 * Adds two vec4's after scaling the second operand by a scalar value
 *
 * @param {vec4} out the receiving vector
 * @param {ReadonlyVec4} a the first operand
 * @param {ReadonlyVec4} b the second operand
 * @param {Number} scale the amount to scale b by before adding
 * @returns {vec4} out
 */

function scaleAndAdd$1(out, a, b, scale) {
  out[0] = a[0] + b[0] * scale;
  out[1] = a[1] + b[1] * scale;
  out[2] = a[2] + b[2] * scale;
  out[3] = a[3] + b[3] * scale;
  return out;
}
/**
 * Calculates the euclidian distance between two vec4's
 *
 * @param {ReadonlyVec4} a the first operand
 * @param {ReadonlyVec4} b the second operand
 * @returns {Number} distance between a and b
 */

function distance$1(a, b) {
  var x = b[0] - a[0];
  var y = b[1] - a[1];
  var z = b[2] - a[2];
  var w = b[3] - a[3];
  return Math.hypot(x, y, z, w);
}
/**
 * Calculates the squared euclidian distance between two vec4's
 *
 * @param {ReadonlyVec4} a the first operand
 * @param {ReadonlyVec4} b the second operand
 * @returns {Number} squared distance between a and b
 */

function squaredDistance$1(a, b) {
  var x = b[0] - a[0];
  var y = b[1] - a[1];
  var z = b[2] - a[2];
  var w = b[3] - a[3];
  return x * x + y * y + z * z + w * w;
}
/**
 * Calculates the length of a vec4
 *
 * @param {ReadonlyVec4} a vector to calculate length of
 * @returns {Number} length of a
 */

function length$3(a) {
  var x = a[0];
  var y = a[1];
  var z = a[2];
  var w = a[3];
  return Math.hypot(x, y, z, w);
}
/**
 * Calculates the squared length of a vec4
 *
 * @param {ReadonlyVec4} a vector to calculate squared length of
 * @returns {Number} squared length of a
 */

function squaredLength$3(a) {
  var x = a[0];
  var y = a[1];
  var z = a[2];
  var w = a[3];
  return x * x + y * y + z * z + w * w;
}
/**
 * Negates the components of a vec4
 *
 * @param {vec4} out the receiving vector
 * @param {ReadonlyVec4} a vector to negate
 * @returns {vec4} out
 */

function negate$1(out, a) {
  out[0] = -a[0];
  out[1] = -a[1];
  out[2] = -a[2];
  out[3] = -a[3];
  return out;
}
/**
 * Returns the inverse of the components of a vec4
 *
 * @param {vec4} out the receiving vector
 * @param {ReadonlyVec4} a vector to invert
 * @returns {vec4} out
 */

function inverse$1(out, a) {
  out[0] = 1.0 / a[0];
  out[1] = 1.0 / a[1];
  out[2] = 1.0 / a[2];
  out[3] = 1.0 / a[3];
  return out;
}
/**
 * Normalize a vec4
 *
 * @param {vec4} out the receiving vector
 * @param {ReadonlyVec4} a vector to normalize
 * @returns {vec4} out
 */

function normalize$3(out, a) {
  var x = a[0];
  var y = a[1];
  var z = a[2];
  var w = a[3];
  var len = x * x + y * y + z * z + w * w;

  if (len > 0) {
    len = 1 / Math.sqrt(len);
  }

  out[0] = x * len;
  out[1] = y * len;
  out[2] = z * len;
  out[3] = w * len;
  return out;
}
/**
 * Calculates the dot product of two vec4's
 *
 * @param {ReadonlyVec4} a the first operand
 * @param {ReadonlyVec4} b the second operand
 * @returns {Number} dot product of a and b
 */

function dot$3(a, b) {
  return a[0] * b[0] + a[1] * b[1] + a[2] * b[2] + a[3] * b[3];
}
/**
 * Returns the cross-product of three vectors in a 4-dimensional space
 *
 * @param {ReadonlyVec4} result the receiving vector
 * @param {ReadonlyVec4} U the first vector
 * @param {ReadonlyVec4} V the second vector
 * @param {ReadonlyVec4} W the third vector
 * @returns {vec4} result
 */

function cross$1(out, u, v, w) {
  var A = v[0] * w[1] - v[1] * w[0],
      B = v[0] * w[2] - v[2] * w[0],
      C = v[0] * w[3] - v[3] * w[0],
      D = v[1] * w[2] - v[2] * w[1],
      E = v[1] * w[3] - v[3] * w[1],
      F = v[2] * w[3] - v[3] * w[2];
  var G = u[0];
  var H = u[1];
  var I = u[2];
  var J = u[3];
  out[0] = H * F - I * E + J * D;
  out[1] = -(G * F) + I * C - J * B;
  out[2] = G * E - H * C + J * A;
  out[3] = -(G * D) + H * B - I * A;
  return out;
}
/**
 * Performs a linear interpolation between two vec4's
 *
 * @param {vec4} out the receiving vector
 * @param {ReadonlyVec4} a the first operand
 * @param {ReadonlyVec4} b the second operand
 * @param {Number} t interpolation amount, in the range [0-1], between the two inputs
 * @returns {vec4} out
 */

function lerp$3(out, a, b, t) {
  var ax = a[0];
  var ay = a[1];
  var az = a[2];
  var aw = a[3];
  out[0] = ax + t * (b[0] - ax);
  out[1] = ay + t * (b[1] - ay);
  out[2] = az + t * (b[2] - az);
  out[3] = aw + t * (b[3] - aw);
  return out;
}
/**
 * Generates a random vector with the given scale
 *
 * @param {vec4} out the receiving vector
 * @param {Number} [scale] Length of the resulting vector. If ommitted, a unit vector will be returned
 * @returns {vec4} out
 */

function random$2(out, scale) {
  scale = scale || 1.0; // Marsaglia, George. Choosing a Point from the Surface of a
  // Sphere. Ann. Math. Statist. 43 (1972), no. 2, 645--646.
  // http://projecteuclid.org/euclid.aoms/1177692644;

  var v1, v2, v3, v4;
  var s1, s2;

  do {
    v1 = RANDOM() * 2 - 1;
    v2 = RANDOM() * 2 - 1;
    s1 = v1 * v1 + v2 * v2;
  } while (s1 >= 1);

  do {
    v3 = RANDOM() * 2 - 1;
    v4 = RANDOM() * 2 - 1;
    s2 = v3 * v3 + v4 * v4;
  } while (s2 >= 1);

  var d = Math.sqrt((1 - s1) / s2);
  out[0] = scale * v1;
  out[1] = scale * v2;
  out[2] = scale * v3 * d;
  out[3] = scale * v4 * d;
  return out;
}
/**
 * Transforms the vec4 with a mat4.
 *
 * @param {vec4} out the receiving vector
 * @param {ReadonlyVec4} a the vector to transform
 * @param {ReadonlyMat4} m matrix to transform with
 * @returns {vec4} out
 */

function transformMat4$1(out, a, m) {
  var x = a[0],
      y = a[1],
      z = a[2],
      w = a[3];
  out[0] = m[0] * x + m[4] * y + m[8] * z + m[12] * w;
  out[1] = m[1] * x + m[5] * y + m[9] * z + m[13] * w;
  out[2] = m[2] * x + m[6] * y + m[10] * z + m[14] * w;
  out[3] = m[3] * x + m[7] * y + m[11] * z + m[15] * w;
  return out;
}
/**
 * Transforms the vec4 with a quat
 *
 * @param {vec4} out the receiving vector
 * @param {ReadonlyVec4} a the vector to transform
 * @param {ReadonlyQuat} q quaternion to transform with
 * @returns {vec4} out
 */

function transformQuat(out, a, q) {
  var x = a[0],
      y = a[1],
      z = a[2];
  var qx = q[0],
      qy = q[1],
      qz = q[2],
      qw = q[3]; // calculate quat * vec

  var ix = qw * x + qy * z - qz * y;
  var iy = qw * y + qz * x - qx * z;
  var iz = qw * z + qx * y - qy * x;
  var iw = -qx * x - qy * y - qz * z; // calculate result * inverse quat

  out[0] = ix * qw + iw * -qx + iy * -qz - iz * -qy;
  out[1] = iy * qw + iw * -qy + iz * -qx - ix * -qz;
  out[2] = iz * qw + iw * -qz + ix * -qy - iy * -qx;
  out[3] = a[3];
  return out;
}
/**
 * Set the components of a vec4 to zero
 *
 * @param {vec4} out the receiving vector
 * @returns {vec4} out
 */

function zero$1(out) {
  out[0] = 0.0;
  out[1] = 0.0;
  out[2] = 0.0;
  out[3] = 0.0;
  return out;
}
/**
 * Returns a string representation of a vector
 *
 * @param {ReadonlyVec4} a vector to represent as a string
 * @returns {String} string representation of the vector
 */

function str$3(a) {
  return "vec4(" + a[0] + ", " + a[1] + ", " + a[2] + ", " + a[3] + ")";
}
/**
 * Returns whether or not the vectors have exactly the same elements in the same position (when compared with ===)
 *
 * @param {ReadonlyVec4} a The first vector.
 * @param {ReadonlyVec4} b The second vector.
 * @returns {Boolean} True if the vectors are equal, false otherwise.
 */

function exactEquals$3(a, b) {
  return a[0] === b[0] && a[1] === b[1] && a[2] === b[2] && a[3] === b[3];
}
/**
 * Returns whether or not the vectors have approximately the same elements in the same position.
 *
 * @param {ReadonlyVec4} a The first vector.
 * @param {ReadonlyVec4} b The second vector.
 * @returns {Boolean} True if the vectors are equal, false otherwise.
 */

function equals$3(a, b) {
  var a0 = a[0],
      a1 = a[1],
      a2 = a[2],
      a3 = a[3];
  var b0 = b[0],
      b1 = b[1],
      b2 = b[2],
      b3 = b[3];
  return Math.abs(a0 - b0) <= EPSILON * Math.max(1.0, Math.abs(a0), Math.abs(b0)) && Math.abs(a1 - b1) <= EPSILON * Math.max(1.0, Math.abs(a1), Math.abs(b1)) && Math.abs(a2 - b2) <= EPSILON * Math.max(1.0, Math.abs(a2), Math.abs(b2)) && Math.abs(a3 - b3) <= EPSILON * Math.max(1.0, Math.abs(a3), Math.abs(b3));
}
/**
 * Alias for {@link vec4.subtract}
 * @function
 */

var sub$1 = subtract$1;
/**
 * Alias for {@link vec4.multiply}
 * @function
 */

var mul$3 = multiply$3;
/**
 * Alias for {@link vec4.divide}
 * @function
 */

var div$1 = divide$1;
/**
 * Alias for {@link vec4.distance}
 * @function
 */

var dist$1 = distance$1;
/**
 * Alias for {@link vec4.squaredDistance}
 * @function
 */

var sqrDist$1 = squaredDistance$1;
/**
 * Alias for {@link vec4.length}
 * @function
 */

var len$3 = length$3;
/**
 * Alias for {@link vec4.squaredLength}
 * @function
 */

var sqrLen$3 = squaredLength$3;
/**
 * Perform some operation over an array of vec4s.
 *
 * @param {Array} a the array of vectors to iterate over
 * @param {Number} stride Number of elements between the start of each vec4. If 0 assumes tightly packed
 * @param {Number} offset Number of elements to skip at the beginning of the array
 * @param {Number} count Number of vec4s to iterate over. If 0 iterates over entire array
 * @param {Function} fn Function to call for each vector in the array
 * @param {Object} [arg] additional argument to pass to fn
 * @returns {Array} a
 * @function
 */

var forEach$1 = function () {
  var vec = create$3();
  return function (a, stride, offset, count, fn, arg) {
    var i, l;

    if (!stride) {
      stride = 4;
    }

    if (!offset) {
      offset = 0;
    }

    if (count) {
      l = Math.min(count * stride + offset, a.length);
    } else {
      l = a.length;
    }

    for (i = offset; i < l; i += stride) {
      vec[0] = a[i];
      vec[1] = a[i + 1];
      vec[2] = a[i + 2];
      vec[3] = a[i + 3];
      fn(vec, vec, arg);
      a[i] = vec[0];
      a[i + 1] = vec[1];
      a[i + 2] = vec[2];
      a[i + 3] = vec[3];
    }

    return a;
  };
}();

var vec4 = /*#__PURE__*/Object.freeze({
__proto__: null,
add: add$3,
ceil: ceil$1,
clone: clone$3,
copy: copy$3,
create: create$3,
cross: cross$1,
dist: dist$1,
distance: distance$1,
div: div$1,
divide: divide$1,
dot: dot$3,
equals: equals$3,
exactEquals: exactEquals$3,
floor: floor$1,
forEach: forEach$1,
fromValues: fromValues$3,
inverse: inverse$1,
len: len$3,
length: length$3,
lerp: lerp$3,
max: max$1,
min: min$1,
mul: mul$3,
multiply: multiply$3,
negate: negate$1,
normalize: normalize$3,
random: random$2,
round: round$1,
scale: scale$3,
scaleAndAdd: scaleAndAdd$1,
set: set$3,
sqrDist: sqrDist$1,
sqrLen: sqrLen$3,
squaredDistance: squaredDistance$1,
squaredLength: squaredLength$3,
str: str$3,
sub: sub$1,
subtract: subtract$1,
transformMat4: transformMat4$1,
transformQuat: transformQuat,
zero: zero$1
});

/**
 * Quaternion
 * @module quat
 */

/**
 * Creates a new identity quat
 *
 * @returns {quat} a new quaternion
 */

function create$2() {
  var out = new ARRAY_TYPE(4);

  if (ARRAY_TYPE != Float32Array) {
    out[0] = 0;
    out[1] = 0;
    out[2] = 0;
  }

  out[3] = 1;
  return out;
}
/**
 * Set a quat to the identity quaternion
 *
 * @param {quat} out the receiving quaternion
 * @returns {quat} out
 */

function identity$1(out) {
  out[0] = 0;
  out[1] = 0;
  out[2] = 0;
  out[3] = 1;
  return out;
}
/**
 * Sets a quat from the given angle and rotation axis,
 * then returns it.
 *
 * @param {quat} out the receiving quaternion
 * @param {ReadonlyVec3} axis the axis around which to rotate
 * @param {Number} rad the angle in radians
 * @returns {quat} out
 **/

function setAxisAngle(out, axis, rad) {
  rad = rad * 0.5;
  var s = Math.sin(rad);
  out[0] = s * axis[0];
  out[1] = s * axis[1];
  out[2] = s * axis[2];
  out[3] = Math.cos(rad);
  return out;
}
/**
 * Gets the rotation axis and angle for a given
 *  quaternion. If a quaternion is created with
 *  setAxisAngle, this method will return the same
 *  values as providied in the original parameter list
 *  OR functionally equivalent values.
 * Example: The quaternion formed by axis [0, 0, 1] and
 *  angle -90 is the same as the quaternion formed by
 *  [0, 0, 1] and 270. This method favors the latter.
 * @param  {vec3} out_axis  Vector receiving the axis of rotation
 * @param  {ReadonlyQuat} q     Quaternion to be decomposed
 * @return {Number}     Angle, in radians, of the rotation
 */

function getAxisAngle(out_axis, q) {
  var rad = Math.acos(q[3]) * 2.0;
  var s = Math.sin(rad / 2.0);

  if (s > EPSILON) {
    out_axis[0] = q[0] / s;
    out_axis[1] = q[1] / s;
    out_axis[2] = q[2] / s;
  } else {
    // If s is zero, return any axis (no rotation - axis does not matter)
    out_axis[0] = 1;
    out_axis[1] = 0;
    out_axis[2] = 0;
  }

  return rad;
}
/**
 * Gets the angular distance between two unit quaternions
 *
 * @param  {ReadonlyQuat} a     Origin unit quaternion
 * @param  {ReadonlyQuat} b     Destination unit quaternion
 * @return {Number}     Angle, in radians, between the two quaternions
 */

function getAngle(a, b) {
  var dotproduct = dot$2(a, b);
  return Math.acos(2 * dotproduct * dotproduct - 1);
}
/**
 * Multiplies two quat's
 *
 * @param {quat} out the receiving quaternion
 * @param {ReadonlyQuat} a the first operand
 * @param {ReadonlyQuat} b the second operand
 * @returns {quat} out
 */

function multiply$2(out, a, b) {
  var ax = a[0],
      ay = a[1],
      az = a[2],
      aw = a[3];
  var bx = b[0],
      by = b[1],
      bz = b[2],
      bw = b[3];
  out[0] = ax * bw + aw * bx + ay * bz - az * by;
  out[1] = ay * bw + aw * by + az * bx - ax * bz;
  out[2] = az * bw + aw * bz + ax * by - ay * bx;
  out[3] = aw * bw - ax * bx - ay * by - az * bz;
  return out;
}
/**
 * Rotates a quaternion by the given angle about the X axis
 *
 * @param {quat} out quat receiving operation result
 * @param {ReadonlyQuat} a quat to rotate
 * @param {number} rad angle (in radians) to rotate
 * @returns {quat} out
 */

function rotateX$1(out, a, rad) {
  rad *= 0.5;
  var ax = a[0],
      ay = a[1],
      az = a[2],
      aw = a[3];
  var bx = Math.sin(rad),
      bw = Math.cos(rad);
  out[0] = ax * bw + aw * bx;
  out[1] = ay * bw + az * bx;
  out[2] = az * bw - ay * bx;
  out[3] = aw * bw - ax * bx;
  return out;
}
/**
 * Rotates a quaternion by the given angle about the Y axis
 *
 * @param {quat} out quat receiving operation result
 * @param {ReadonlyQuat} a quat to rotate
 * @param {number} rad angle (in radians) to rotate
 * @returns {quat} out
 */

function rotateY$1(out, a, rad) {
  rad *= 0.5;
  var ax = a[0],
      ay = a[1],
      az = a[2],
      aw = a[3];
  var by = Math.sin(rad),
      bw = Math.cos(rad);
  out[0] = ax * bw - az * by;
  out[1] = ay * bw + aw * by;
  out[2] = az * bw + ax * by;
  out[3] = aw * bw - ay * by;
  return out;
}
/**
 * Rotates a quaternion by the given angle about the Z axis
 *
 * @param {quat} out quat receiving operation result
 * @param {ReadonlyQuat} a quat to rotate
 * @param {number} rad angle (in radians) to rotate
 * @returns {quat} out
 */

function rotateZ$1(out, a, rad) {
  rad *= 0.5;
  var ax = a[0],
      ay = a[1],
      az = a[2],
      aw = a[3];
  var bz = Math.sin(rad),
      bw = Math.cos(rad);
  out[0] = ax * bw + ay * bz;
  out[1] = ay * bw - ax * bz;
  out[2] = az * bw + aw * bz;
  out[3] = aw * bw - az * bz;
  return out;
}
/**
 * Calculates the W component of a quat from the X, Y, and Z components.
 * Assumes that quaternion is 1 unit in length.
 * Any existing W component will be ignored.
 *
 * @param {quat} out the receiving quaternion
 * @param {ReadonlyQuat} a quat to calculate W component of
 * @returns {quat} out
 */

function calculateW(out, a) {
  var x = a[0],
      y = a[1],
      z = a[2];
  out[0] = x;
  out[1] = y;
  out[2] = z;
  out[3] = Math.sqrt(Math.abs(1.0 - x * x - y * y - z * z));
  return out;
}
/**
 * Calculate the exponential of a unit quaternion.
 *
 * @param {quat} out the receiving quaternion
 * @param {ReadonlyQuat} a quat to calculate the exponential of
 * @returns {quat} out
 */

function exp(out, a) {
  var x = a[0],
      y = a[1],
      z = a[2],
      w = a[3];
  var r = Math.sqrt(x * x + y * y + z * z);
  var et = Math.exp(w);
  var s = r > 0 ? et * Math.sin(r) / r : 0;
  out[0] = x * s;
  out[1] = y * s;
  out[2] = z * s;
  out[3] = et * Math.cos(r);
  return out;
}
/**
 * Calculate the natural logarithm of a unit quaternion.
 *
 * @param {quat} out the receiving quaternion
 * @param {ReadonlyQuat} a quat to calculate the exponential of
 * @returns {quat} out
 */

function ln(out, a) {
  var x = a[0],
      y = a[1],
      z = a[2],
      w = a[3];
  var r = Math.sqrt(x * x + y * y + z * z);
  var t = r > 0 ? Math.atan2(r, w) / r : 0;
  out[0] = x * t;
  out[1] = y * t;
  out[2] = z * t;
  out[3] = 0.5 * Math.log(x * x + y * y + z * z + w * w);
  return out;
}
/**
 * Calculate the scalar power of a unit quaternion.
 *
 * @param {quat} out the receiving quaternion
 * @param {ReadonlyQuat} a quat to calculate the exponential of
 * @param {Number} b amount to scale the quaternion by
 * @returns {quat} out
 */

function pow(out, a, b) {
  ln(out, a);
  scale$2(out, out, b);
  exp(out, out);
  return out;
}
/**
 * Performs a spherical linear interpolation between two quat
 *
 * @param {quat} out the receiving quaternion
 * @param {ReadonlyQuat} a the first operand
 * @param {ReadonlyQuat} b the second operand
 * @param {Number} t interpolation amount, in the range [0-1], between the two inputs
 * @returns {quat} out
 */

function slerp(out, a, b, t) {
  // benchmarks:
  //    http://jsperf.com/quaternion-slerp-implementations
  var ax = a[0],
      ay = a[1],
      az = a[2],
      aw = a[3];
  var bx = b[0],
      by = b[1],
      bz = b[2],
      bw = b[3];
  var omega, cosom, sinom, scale0, scale1; // calc cosine

  cosom = ax * bx + ay * by + az * bz + aw * bw; // adjust signs (if necessary)

  if (cosom < 0.0) {
    cosom = -cosom;
    bx = -bx;
    by = -by;
    bz = -bz;
    bw = -bw;
  } // calculate coefficients


  if (1.0 - cosom > EPSILON) {
    // standard case (slerp)
    omega = Math.acos(cosom);
    sinom = Math.sin(omega);
    scale0 = Math.sin((1.0 - t) * omega) / sinom;
    scale1 = Math.sin(t * omega) / sinom;
  } else {
    // "from" and "to" quaternions are very close
    //  ... so we can do a linear interpolation
    scale0 = 1.0 - t;
    scale1 = t;
  } // calculate final values


  out[0] = scale0 * ax + scale1 * bx;
  out[1] = scale0 * ay + scale1 * by;
  out[2] = scale0 * az + scale1 * bz;
  out[3] = scale0 * aw + scale1 * bw;
  return out;
}
/**
 * Generates a random unit quaternion
 *
 * @param {quat} out the receiving quaternion
 * @returns {quat} out
 */

function random$1(out) {
  // Implementation of http://planning.cs.uiuc.edu/node198.html
  // TODO: Calling random 3 times is probably not the fastest solution
  var u1 = RANDOM();
  var u2 = RANDOM();
  var u3 = RANDOM();
  var sqrt1MinusU1 = Math.sqrt(1 - u1);
  var sqrtU1 = Math.sqrt(u1);
  out[0] = sqrt1MinusU1 * Math.sin(2.0 * Math.PI * u2);
  out[1] = sqrt1MinusU1 * Math.cos(2.0 * Math.PI * u2);
  out[2] = sqrtU1 * Math.sin(2.0 * Math.PI * u3);
  out[3] = sqrtU1 * Math.cos(2.0 * Math.PI * u3);
  return out;
}
/**
 * Calculates the inverse of a quat
 *
 * @param {quat} out the receiving quaternion
 * @param {ReadonlyQuat} a quat to calculate inverse of
 * @returns {quat} out
 */

function invert$1(out, a) {
  var a0 = a[0],
      a1 = a[1],
      a2 = a[2],
      a3 = a[3];
  var dot = a0 * a0 + a1 * a1 + a2 * a2 + a3 * a3;
  var invDot = dot ? 1.0 / dot : 0; // TODO: Would be faster to return [0,0,0,0] immediately if dot == 0

  out[0] = -a0 * invDot;
  out[1] = -a1 * invDot;
  out[2] = -a2 * invDot;
  out[3] = a3 * invDot;
  return out;
}
/**
 * Calculates the conjugate of a quat
 * If the quaternion is normalized, this function is faster than quat.inverse and produces the same result.
 *
 * @param {quat} out the receiving quaternion
 * @param {ReadonlyQuat} a quat to calculate conjugate of
 * @returns {quat} out
 */

function conjugate$1(out, a) {
  out[0] = -a[0];
  out[1] = -a[1];
  out[2] = -a[2];
  out[3] = a[3];
  return out;
}
/**
 * Creates a quaternion from the given 3x3 rotation matrix.
 *
 * NOTE: The resultant quaternion is not normalized, so you should be sure
 * to renormalize the quaternion yourself where necessary.
 *
 * @param {quat} out the receiving quaternion
 * @param {ReadonlyMat3} m rotation matrix
 * @returns {quat} out
 * @function
 */

function fromMat3(out, m) {
  // Algorithm in Ken Shoemake's article in 1987 SIGGRAPH course notes
  // article "Quaternion Calculus and Fast Animation".
  var fTrace = m[0] + m[4] + m[8];
  var fRoot;

  if (fTrace > 0.0) {
    // |w| > 1/2, may as well choose w > 1/2
    fRoot = Math.sqrt(fTrace + 1.0); // 2w

    out[3] = 0.5 * fRoot;
    fRoot = 0.5 / fRoot; // 1/(4w)

    out[0] = (m[5] - m[7]) * fRoot;
    out[1] = (m[6] - m[2]) * fRoot;
    out[2] = (m[1] - m[3]) * fRoot;
  } else {
    // |w| <= 1/2
    var i = 0;
    if (m[4] > m[0]) i = 1;
    if (m[8] > m[i * 3 + i]) i = 2;
    var j = (i + 1) % 3;
    var k = (i + 2) % 3;
    fRoot = Math.sqrt(m[i * 3 + i] - m[j * 3 + j] - m[k * 3 + k] + 1.0);
    out[i] = 0.5 * fRoot;
    fRoot = 0.5 / fRoot;
    out[3] = (m[j * 3 + k] - m[k * 3 + j]) * fRoot;
    out[j] = (m[j * 3 + i] + m[i * 3 + j]) * fRoot;
    out[k] = (m[k * 3 + i] + m[i * 3 + k]) * fRoot;
  }

  return out;
}
/**
 * Creates a quaternion from the given euler angle x, y, z.
 *
 * @param {quat} out the receiving quaternion
 * @param {x} Angle to rotate around X axis in degrees.
 * @param {y} Angle to rotate around Y axis in degrees.
 * @param {z} Angle to rotate around Z axis in degrees.
 * @returns {quat} out
 * @function
 */

function fromEuler(out, x, y, z) {
  var halfToRad = 0.5 * Math.PI / 180.0;
  x *= halfToRad;
  y *= halfToRad;
  z *= halfToRad;
  var sx = Math.sin(x);
  var cx = Math.cos(x);
  var sy = Math.sin(y);
  var cy = Math.cos(y);
  var sz = Math.sin(z);
  var cz = Math.cos(z);
  out[0] = sx * cy * cz - cx * sy * sz;
  out[1] = cx * sy * cz + sx * cy * sz;
  out[2] = cx * cy * sz - sx * sy * cz;
  out[3] = cx * cy * cz + sx * sy * sz;
  return out;
}
/**
 * Returns a string representation of a quatenion
 *
 * @param {ReadonlyQuat} a vector to represent as a string
 * @returns {String} string representation of the vector
 */

function str$2(a) {
  return "quat(" + a[0] + ", " + a[1] + ", " + a[2] + ", " + a[3] + ")";
}
/**
 * Creates a new quat initialized with values from an existing quaternion
 *
 * @param {ReadonlyQuat} a quaternion to clone
 * @returns {quat} a new quaternion
 * @function
 */

var clone$2 = clone$3;
/**
 * Creates a new quat initialized with the given values
 *
 * @param {Number} x X component
 * @param {Number} y Y component
 * @param {Number} z Z component
 * @param {Number} w W component
 * @returns {quat} a new quaternion
 * @function
 */

var fromValues$2 = fromValues$3;
/**
 * Copy the values from one quat to another
 *
 * @param {quat} out the receiving quaternion
 * @param {ReadonlyQuat} a the source quaternion
 * @returns {quat} out
 * @function
 */

var copy$2 = copy$3;
/**
 * Set the components of a quat to the given values
 *
 * @param {quat} out the receiving quaternion
 * @param {Number} x X component
 * @param {Number} y Y component
 * @param {Number} z Z component
 * @param {Number} w W component
 * @returns {quat} out
 * @function
 */

var set$2 = set$3;
/**
 * Adds two quat's
 *
 * @param {quat} out the receiving quaternion
 * @param {ReadonlyQuat} a the first operand
 * @param {ReadonlyQuat} b the second operand
 * @returns {quat} out
 * @function
 */

var add$2 = add$3;
/**
 * Alias for {@link quat.multiply}
 * @function
 */

var mul$2 = multiply$2;
/**
 * Scales a quat by a scalar number
 *
 * @param {quat} out the receiving vector
 * @param {ReadonlyQuat} a the vector to scale
 * @param {Number} b amount to scale the vector by
 * @returns {quat} out
 * @function
 */

var scale$2 = scale$3;
/**
 * Calculates the dot product of two quat's
 *
 * @param {ReadonlyQuat} a the first operand
 * @param {ReadonlyQuat} b the second operand
 * @returns {Number} dot product of a and b
 * @function
 */

var dot$2 = dot$3;
/**
 * Performs a linear interpolation between two quat's
 *
 * @param {quat} out the receiving quaternion
 * @param {ReadonlyQuat} a the first operand
 * @param {ReadonlyQuat} b the second operand
 * @param {Number} t interpolation amount, in the range [0-1], between the two inputs
 * @returns {quat} out
 * @function
 */

var lerp$2 = lerp$3;
/**
 * Calculates the length of a quat
 *
 * @param {ReadonlyQuat} a vector to calculate length of
 * @returns {Number} length of a
 */

var length$2 = length$3;
/**
 * Alias for {@link quat.length}
 * @function
 */

var len$2 = length$2;
/**
 * Calculates the squared length of a quat
 *
 * @param {ReadonlyQuat} a vector to calculate squared length of
 * @returns {Number} squared length of a
 * @function
 */

var squaredLength$2 = squaredLength$3;
/**
 * Alias for {@link quat.squaredLength}
 * @function
 */

var sqrLen$2 = squaredLength$2;
/**
 * Normalize a quat
 *
 * @param {quat} out the receiving quaternion
 * @param {ReadonlyQuat} a quaternion to normalize
 * @returns {quat} out
 * @function
 */

var normalize$2 = normalize$3;
/**
 * Returns whether or not the quaternions have exactly the same elements in the same position (when compared with ===)
 *
 * @param {ReadonlyQuat} a The first quaternion.
 * @param {ReadonlyQuat} b The second quaternion.
 * @returns {Boolean} True if the vectors are equal, false otherwise.
 */

var exactEquals$2 = exactEquals$3;
/**
 * Returns whether or not the quaternions have approximately the same elements in the same position.
 *
 * @param {ReadonlyQuat} a The first vector.
 * @param {ReadonlyQuat} b The second vector.
 * @returns {Boolean} True if the vectors are equal, false otherwise.
 */

var equals$2 = equals$3;
/**
 * Sets a quaternion to represent the shortest rotation from one
 * vector to another.
 *
 * Both vectors are assumed to be unit length.
 *
 * @param {quat} out the receiving quaternion.
 * @param {ReadonlyVec3} a the initial vector
 * @param {ReadonlyVec3} b the destination vector
 * @returns {quat} out
 */

var rotationTo = function () {
  var tmpvec3 = create$4();
  var xUnitVec3 = fromValues$4(1, 0, 0);
  var yUnitVec3 = fromValues$4(0, 1, 0);
  return function (out, a, b) {
    var dot = dot$4(a, b);

    if (dot < -0.999999) {
      cross$2(tmpvec3, xUnitVec3, a);
      if (len$4(tmpvec3) < 0.000001) cross$2(tmpvec3, yUnitVec3, a);
      normalize$4(tmpvec3, tmpvec3);
      setAxisAngle(out, tmpvec3, Math.PI);
      return out;
    } else if (dot > 0.999999) {
      out[0] = 0;
      out[1] = 0;
      out[2] = 0;
      out[3] = 1;
      return out;
    } else {
      cross$2(tmpvec3, a, b);
      out[0] = tmpvec3[0];
      out[1] = tmpvec3[1];
      out[2] = tmpvec3[2];
      out[3] = 1 + dot;
      return normalize$2(out, out);
    }
  };
}();
/**
 * Performs a spherical linear interpolation with two control points
 *
 * @param {quat} out the receiving quaternion
 * @param {ReadonlyQuat} a the first operand
 * @param {ReadonlyQuat} b the second operand
 * @param {ReadonlyQuat} c the third operand
 * @param {ReadonlyQuat} d the fourth operand
 * @param {Number} t interpolation amount, in the range [0-1], between the two inputs
 * @returns {quat} out
 */

var sqlerp = function () {
  var temp1 = create$2();
  var temp2 = create$2();
  return function (out, a, b, c, d, t) {
    slerp(temp1, a, d, t);
    slerp(temp2, b, c, t);
    slerp(out, temp1, temp2, 2 * t * (1 - t));
    return out;
  };
}();
/**
 * Sets the specified quaternion with values corresponding to the given
 * axes. Each axis is a vec3 and is expected to be unit length and
 * perpendicular to all other specified axes.
 *
 * @param {ReadonlyVec3} view  the vector representing the viewing direction
 * @param {ReadonlyVec3} right the vector representing the local "right" direction
 * @param {ReadonlyVec3} up    the vector representing the local "up" direction
 * @returns {quat} out
 */

var setAxes = function () {
  var matr = create$6();
  return function (out, view, right, up) {
    matr[0] = right[0];
    matr[3] = right[1];
    matr[6] = right[2];
    matr[1] = up[0];
    matr[4] = up[1];
    matr[7] = up[2];
    matr[2] = -view[0];
    matr[5] = -view[1];
    matr[8] = -view[2];
    return normalize$2(out, fromMat3(out, matr));
  };
}();

var quat = /*#__PURE__*/Object.freeze({
__proto__: null,
add: add$2,
calculateW: calculateW,
clone: clone$2,
conjugate: conjugate$1,
copy: copy$2,
create: create$2,
dot: dot$2,
equals: equals$2,
exactEquals: exactEquals$2,
exp: exp,
fromEuler: fromEuler,
fromMat3: fromMat3,
fromValues: fromValues$2,
getAngle: getAngle,
getAxisAngle: getAxisAngle,
identity: identity$1,
invert: invert$1,
len: len$2,
length: length$2,
lerp: lerp$2,
ln: ln,
mul: mul$2,
multiply: multiply$2,
normalize: normalize$2,
pow: pow,
random: random$1,
rotateX: rotateX$1,
rotateY: rotateY$1,
rotateZ: rotateZ$1,
rotationTo: rotationTo,
scale: scale$2,
set: set$2,
setAxes: setAxes,
setAxisAngle: setAxisAngle,
slerp: slerp,
sqlerp: sqlerp,
sqrLen: sqrLen$2,
squaredLength: squaredLength$2,
str: str$2
});

/**
 * Dual Quaternion<br>
 * Format: [real, dual]<br>
 * Quaternion format: XYZW<br>
 * Make sure to have normalized dual quaternions, otherwise the functions may not work as intended.<br>
 * @module quat2
 */

/**
 * Creates a new identity dual quat
 *
 * @returns {quat2} a new dual quaternion [real -> rotation, dual -> translation]
 */

function create$1() {
  var dq = new ARRAY_TYPE(8);

  if (ARRAY_TYPE != Float32Array) {
    dq[0] = 0;
    dq[1] = 0;
    dq[2] = 0;
    dq[4] = 0;
    dq[5] = 0;
    dq[6] = 0;
    dq[7] = 0;
  }

  dq[3] = 1;
  return dq;
}
/**
 * Creates a new quat initialized with values from an existing quaternion
 *
 * @param {ReadonlyQuat2} a dual quaternion to clone
 * @returns {quat2} new dual quaternion
 * @function
 */

function clone$1(a) {
  var dq = new ARRAY_TYPE(8);
  dq[0] = a[0];
  dq[1] = a[1];
  dq[2] = a[2];
  dq[3] = a[3];
  dq[4] = a[4];
  dq[5] = a[5];
  dq[6] = a[6];
  dq[7] = a[7];
  return dq;
}
/**
 * Creates a new dual quat initialized with the given values
 *
 * @param {Number} x1 X component
 * @param {Number} y1 Y component
 * @param {Number} z1 Z component
 * @param {Number} w1 W component
 * @param {Number} x2 X component
 * @param {Number} y2 Y component
 * @param {Number} z2 Z component
 * @param {Number} w2 W component
 * @returns {quat2} new dual quaternion
 * @function
 */

function fromValues$1(x1, y1, z1, w1, x2, y2, z2, w2) {
  var dq = new ARRAY_TYPE(8);
  dq[0] = x1;
  dq[1] = y1;
  dq[2] = z1;
  dq[3] = w1;
  dq[4] = x2;
  dq[5] = y2;
  dq[6] = z2;
  dq[7] = w2;
  return dq;
}
/**
 * Creates a new dual quat from the given values (quat and translation)
 *
 * @param {Number} x1 X component
 * @param {Number} y1 Y component
 * @param {Number} z1 Z component
 * @param {Number} w1 W component
 * @param {Number} x2 X component (translation)
 * @param {Number} y2 Y component (translation)
 * @param {Number} z2 Z component (translation)
 * @returns {quat2} new dual quaternion
 * @function
 */

function fromRotationTranslationValues(x1, y1, z1, w1, x2, y2, z2) {
  var dq = new ARRAY_TYPE(8);
  dq[0] = x1;
  dq[1] = y1;
  dq[2] = z1;
  dq[3] = w1;
  var ax = x2 * 0.5,
      ay = y2 * 0.5,
      az = z2 * 0.5;
  dq[4] = ax * w1 + ay * z1 - az * y1;
  dq[5] = ay * w1 + az * x1 - ax * z1;
  dq[6] = az * w1 + ax * y1 - ay * x1;
  dq[7] = -ax * x1 - ay * y1 - az * z1;
  return dq;
}
/**
 * Creates a dual quat from a quaternion and a translation
 *
 * @param {ReadonlyQuat2} dual quaternion receiving operation result
 * @param {ReadonlyQuat} q a normalized quaternion
 * @param {ReadonlyVec3} t tranlation vector
 * @returns {quat2} dual quaternion receiving operation result
 * @function
 */

function fromRotationTranslation(out, q, t) {
  var ax = t[0] * 0.5,
      ay = t[1] * 0.5,
      az = t[2] * 0.5,
      bx = q[0],
      by = q[1],
      bz = q[2],
      bw = q[3];
  out[0] = bx;
  out[1] = by;
  out[2] = bz;
  out[3] = bw;
  out[4] = ax * bw + ay * bz - az * by;
  out[5] = ay * bw + az * bx - ax * bz;
  out[6] = az * bw + ax * by - ay * bx;
  out[7] = -ax * bx - ay * by - az * bz;
  return out;
}
/**
 * Creates a dual quat from a translation
 *
 * @param {ReadonlyQuat2} dual quaternion receiving operation result
 * @param {ReadonlyVec3} t translation vector
 * @returns {quat2} dual quaternion receiving operation result
 * @function
 */

function fromTranslation(out, t) {
  out[0] = 0;
  out[1] = 0;
  out[2] = 0;
  out[3] = 1;
  out[4] = t[0] * 0.5;
  out[5] = t[1] * 0.5;
  out[6] = t[2] * 0.5;
  out[7] = 0;
  return out;
}
/**
 * Creates a dual quat from a quaternion
 *
 * @param {ReadonlyQuat2} dual quaternion receiving operation result
 * @param {ReadonlyQuat} q the quaternion
 * @returns {quat2} dual quaternion receiving operation result
 * @function
 */

function fromRotation(out, q) {
  out[0] = q[0];
  out[1] = q[1];
  out[2] = q[2];
  out[3] = q[3];
  out[4] = 0;
  out[5] = 0;
  out[6] = 0;
  out[7] = 0;
  return out;
}
/**
 * Creates a new dual quat from a matrix (4x4)
 *
 * @param {quat2} out the dual quaternion
 * @param {ReadonlyMat4} a the matrix
 * @returns {quat2} dual quat receiving operation result
 * @function
 */

function fromMat4(out, a) {
  //TODO Optimize this
  var outer = create$2();
  getRotation(outer, a);
  var t = new ARRAY_TYPE(3);
  getTranslation$1(t, a);
  fromRotationTranslation(out, outer, t);
  return out;
}
/**
 * Copy the values from one dual quat to another
 *
 * @param {quat2} out the receiving dual quaternion
 * @param {ReadonlyQuat2} a the source dual quaternion
 * @returns {quat2} out
 * @function
 */

function copy$1(out, a) {
  out[0] = a[0];
  out[1] = a[1];
  out[2] = a[2];
  out[3] = a[3];
  out[4] = a[4];
  out[5] = a[5];
  out[6] = a[6];
  out[7] = a[7];
  return out;
}
/**
 * Set a dual quat to the identity dual quaternion
 *
 * @param {quat2} out the receiving quaternion
 * @returns {quat2} out
 */

function identity(out) {
  out[0] = 0;
  out[1] = 0;
  out[2] = 0;
  out[3] = 1;
  out[4] = 0;
  out[5] = 0;
  out[6] = 0;
  out[7] = 0;
  return out;
}
/**
 * Set the components of a dual quat to the given values
 *
 * @param {quat2} out the receiving quaternion
 * @param {Number} x1 X component
 * @param {Number} y1 Y component
 * @param {Number} z1 Z component
 * @param {Number} w1 W component
 * @param {Number} x2 X component
 * @param {Number} y2 Y component
 * @param {Number} z2 Z component
 * @param {Number} w2 W component
 * @returns {quat2} out
 * @function
 */

function set$1(out, x1, y1, z1, w1, x2, y2, z2, w2) {
  out[0] = x1;
  out[1] = y1;
  out[2] = z1;
  out[3] = w1;
  out[4] = x2;
  out[5] = y2;
  out[6] = z2;
  out[7] = w2;
  return out;
}
/**
 * Gets the real part of a dual quat
 * @param  {quat} out real part
 * @param  {ReadonlyQuat2} a Dual Quaternion
 * @return {quat} real part
 */

var getReal = copy$2;
/**
 * Gets the dual part of a dual quat
 * @param  {quat} out dual part
 * @param  {ReadonlyQuat2} a Dual Quaternion
 * @return {quat} dual part
 */

function getDual(out, a) {
  out[0] = a[4];
  out[1] = a[5];
  out[2] = a[6];
  out[3] = a[7];
  return out;
}
/**
 * Set the real component of a dual quat to the given quaternion
 *
 * @param {quat2} out the receiving quaternion
 * @param {ReadonlyQuat} q a quaternion representing the real part
 * @returns {quat2} out
 * @function
 */

var setReal = copy$2;
/**
 * Set the dual component of a dual quat to the given quaternion
 *
 * @param {quat2} out the receiving quaternion
 * @param {ReadonlyQuat} q a quaternion representing the dual part
 * @returns {quat2} out
 * @function
 */

function setDual(out, q) {
  out[4] = q[0];
  out[5] = q[1];
  out[6] = q[2];
  out[7] = q[3];
  return out;
}
/**
 * Gets the translation of a normalized dual quat
 * @param  {vec3} out translation
 * @param  {ReadonlyQuat2} a Dual Quaternion to be decomposed
 * @return {vec3} translation
 */

function getTranslation(out, a) {
  var ax = a[4],
      ay = a[5],
      az = a[6],
      aw = a[7],
      bx = -a[0],
      by = -a[1],
      bz = -a[2],
      bw = a[3];
  out[0] = (ax * bw + aw * bx + ay * bz - az * by) * 2;
  out[1] = (ay * bw + aw * by + az * bx - ax * bz) * 2;
  out[2] = (az * bw + aw * bz + ax * by - ay * bx) * 2;
  return out;
}
/**
 * Translates a dual quat by the given vector
 *
 * @param {quat2} out the receiving dual quaternion
 * @param {ReadonlyQuat2} a the dual quaternion to translate
 * @param {ReadonlyVec3} v vector to translate by
 * @returns {quat2} out
 */

function translate(out, a, v) {
  var ax1 = a[0],
      ay1 = a[1],
      az1 = a[2],
      aw1 = a[3],
      bx1 = v[0] * 0.5,
      by1 = v[1] * 0.5,
      bz1 = v[2] * 0.5,
      ax2 = a[4],
      ay2 = a[5],
      az2 = a[6],
      aw2 = a[7];
  out[0] = ax1;
  out[1] = ay1;
  out[2] = az1;
  out[3] = aw1;
  out[4] = aw1 * bx1 + ay1 * bz1 - az1 * by1 + ax2;
  out[5] = aw1 * by1 + az1 * bx1 - ax1 * bz1 + ay2;
  out[6] = aw1 * bz1 + ax1 * by1 - ay1 * bx1 + az2;
  out[7] = -ax1 * bx1 - ay1 * by1 - az1 * bz1 + aw2;
  return out;
}
/**
 * Rotates a dual quat around the X axis
 *
 * @param {quat2} out the receiving dual quaternion
 * @param {ReadonlyQuat2} a the dual quaternion to rotate
 * @param {number} rad how far should the rotation be
 * @returns {quat2} out
 */

function rotateX(out, a, rad) {
  var bx = -a[0],
      by = -a[1],
      bz = -a[2],
      bw = a[3],
      ax = a[4],
      ay = a[5],
      az = a[6],
      aw = a[7],
      ax1 = ax * bw + aw * bx + ay * bz - az * by,
      ay1 = ay * bw + aw * by + az * bx - ax * bz,
      az1 = az * bw + aw * bz + ax * by - ay * bx,
      aw1 = aw * bw - ax * bx - ay * by - az * bz;
  rotateX$1(out, a, rad);
  bx = out[0];
  by = out[1];
  bz = out[2];
  bw = out[3];
  out[4] = ax1 * bw + aw1 * bx + ay1 * bz - az1 * by;
  out[5] = ay1 * bw + aw1 * by + az1 * bx - ax1 * bz;
  out[6] = az1 * bw + aw1 * bz + ax1 * by - ay1 * bx;
  out[7] = aw1 * bw - ax1 * bx - ay1 * by - az1 * bz;
  return out;
}
/**
 * Rotates a dual quat around the Y axis
 *
 * @param {quat2} out the receiving dual quaternion
 * @param {ReadonlyQuat2} a the dual quaternion to rotate
 * @param {number} rad how far should the rotation be
 * @returns {quat2} out
 */

function rotateY(out, a, rad) {
  var bx = -a[0],
      by = -a[1],
      bz = -a[2],
      bw = a[3],
      ax = a[4],
      ay = a[5],
      az = a[6],
      aw = a[7],
      ax1 = ax * bw + aw * bx + ay * bz - az * by,
      ay1 = ay * bw + aw * by + az * bx - ax * bz,
      az1 = az * bw + aw * bz + ax * by - ay * bx,
      aw1 = aw * bw - ax * bx - ay * by - az * bz;
  rotateY$1(out, a, rad);
  bx = out[0];
  by = out[1];
  bz = out[2];
  bw = out[3];
  out[4] = ax1 * bw + aw1 * bx + ay1 * bz - az1 * by;
  out[5] = ay1 * bw + aw1 * by + az1 * bx - ax1 * bz;
  out[6] = az1 * bw + aw1 * bz + ax1 * by - ay1 * bx;
  out[7] = aw1 * bw - ax1 * bx - ay1 * by - az1 * bz;
  return out;
}
/**
 * Rotates a dual quat around the Z axis
 *
 * @param {quat2} out the receiving dual quaternion
 * @param {ReadonlyQuat2} a the dual quaternion to rotate
 * @param {number} rad how far should the rotation be
 * @returns {quat2} out
 */

function rotateZ(out, a, rad) {
  var bx = -a[0],
      by = -a[1],
      bz = -a[2],
      bw = a[3],
      ax = a[4],
      ay = a[5],
      az = a[6],
      aw = a[7],
      ax1 = ax * bw + aw * bx + ay * bz - az * by,
      ay1 = ay * bw + aw * by + az * bx - ax * bz,
      az1 = az * bw + aw * bz + ax * by - ay * bx,
      aw1 = aw * bw - ax * bx - ay * by - az * bz;
  rotateZ$1(out, a, rad);
  bx = out[0];
  by = out[1];
  bz = out[2];
  bw = out[3];
  out[4] = ax1 * bw + aw1 * bx + ay1 * bz - az1 * by;
  out[5] = ay1 * bw + aw1 * by + az1 * bx - ax1 * bz;
  out[6] = az1 * bw + aw1 * bz + ax1 * by - ay1 * bx;
  out[7] = aw1 * bw - ax1 * bx - ay1 * by - az1 * bz;
  return out;
}
/**
 * Rotates a dual quat by a given quaternion (a * q)
 *
 * @param {quat2} out the receiving dual quaternion
 * @param {ReadonlyQuat2} a the dual quaternion to rotate
 * @param {ReadonlyQuat} q quaternion to rotate by
 * @returns {quat2} out
 */

function rotateByQuatAppend(out, a, q) {
  var qx = q[0],
      qy = q[1],
      qz = q[2],
      qw = q[3],
      ax = a[0],
      ay = a[1],
      az = a[2],
      aw = a[3];
  out[0] = ax * qw + aw * qx + ay * qz - az * qy;
  out[1] = ay * qw + aw * qy + az * qx - ax * qz;
  out[2] = az * qw + aw * qz + ax * qy - ay * qx;
  out[3] = aw * qw - ax * qx - ay * qy - az * qz;
  ax = a[4];
  ay = a[5];
  az = a[6];
  aw = a[7];
  out[4] = ax * qw + aw * qx + ay * qz - az * qy;
  out[5] = ay * qw + aw * qy + az * qx - ax * qz;
  out[6] = az * qw + aw * qz + ax * qy - ay * qx;
  out[7] = aw * qw - ax * qx - ay * qy - az * qz;
  return out;
}
/**
 * Rotates a dual quat by a given quaternion (q * a)
 *
 * @param {quat2} out the receiving dual quaternion
 * @param {ReadonlyQuat} q quaternion to rotate by
 * @param {ReadonlyQuat2} a the dual quaternion to rotate
 * @returns {quat2} out
 */

function rotateByQuatPrepend(out, q, a) {
  var qx = q[0],
      qy = q[1],
      qz = q[2],
      qw = q[3],
      bx = a[0],
      by = a[1],
      bz = a[2],
      bw = a[3];
  out[0] = qx * bw + qw * bx + qy * bz - qz * by;
  out[1] = qy * bw + qw * by + qz * bx - qx * bz;
  out[2] = qz * bw + qw * bz + qx * by - qy * bx;
  out[3] = qw * bw - qx * bx - qy * by - qz * bz;
  bx = a[4];
  by = a[5];
  bz = a[6];
  bw = a[7];
  out[4] = qx * bw + qw * bx + qy * bz - qz * by;
  out[5] = qy * bw + qw * by + qz * bx - qx * bz;
  out[6] = qz * bw + qw * bz + qx * by - qy * bx;
  out[7] = qw * bw - qx * bx - qy * by - qz * bz;
  return out;
}
/**
 * Rotates a dual quat around a given axis. Does the normalisation automatically
 *
 * @param {quat2} out the receiving dual quaternion
 * @param {ReadonlyQuat2} a the dual quaternion to rotate
 * @param {ReadonlyVec3} axis the axis to rotate around
 * @param {Number} rad how far the rotation should be
 * @returns {quat2} out
 */

function rotateAroundAxis(out, a, axis, rad) {
  //Special case for rad = 0
  if (Math.abs(rad) < EPSILON) {
    return copy$1(out, a);
  }

  var axisLength = Math.hypot(axis[0], axis[1], axis[2]);
  rad = rad * 0.5;
  var s = Math.sin(rad);
  var bx = s * axis[0] / axisLength;
  var by = s * axis[1] / axisLength;
  var bz = s * axis[2] / axisLength;
  var bw = Math.cos(rad);
  var ax1 = a[0],
      ay1 = a[1],
      az1 = a[2],
      aw1 = a[3];
  out[0] = ax1 * bw + aw1 * bx + ay1 * bz - az1 * by;
  out[1] = ay1 * bw + aw1 * by + az1 * bx - ax1 * bz;
  out[2] = az1 * bw + aw1 * bz + ax1 * by - ay1 * bx;
  out[3] = aw1 * bw - ax1 * bx - ay1 * by - az1 * bz;
  var ax = a[4],
      ay = a[5],
      az = a[6],
      aw = a[7];
  out[4] = ax * bw + aw * bx + ay * bz - az * by;
  out[5] = ay * bw + aw * by + az * bx - ax * bz;
  out[6] = az * bw + aw * bz + ax * by - ay * bx;
  out[7] = aw * bw - ax * bx - ay * by - az * bz;
  return out;
}
/**
 * Adds two dual quat's
 *
 * @param {quat2} out the receiving dual quaternion
 * @param {ReadonlyQuat2} a the first operand
 * @param {ReadonlyQuat2} b the second operand
 * @returns {quat2} out
 * @function
 */

function add$1(out, a, b) {
  out[0] = a[0] + b[0];
  out[1] = a[1] + b[1];
  out[2] = a[2] + b[2];
  out[3] = a[3] + b[3];
  out[4] = a[4] + b[4];
  out[5] = a[5] + b[5];
  out[6] = a[6] + b[6];
  out[7] = a[7] + b[7];
  return out;
}
/**
 * Multiplies two dual quat's
 *
 * @param {quat2} out the receiving dual quaternion
 * @param {ReadonlyQuat2} a the first operand
 * @param {ReadonlyQuat2} b the second operand
 * @returns {quat2} out
 */

function multiply$1(out, a, b) {
  var ax0 = a[0],
      ay0 = a[1],
      az0 = a[2],
      aw0 = a[3],
      bx1 = b[4],
      by1 = b[5],
      bz1 = b[6],
      bw1 = b[7],
      ax1 = a[4],
      ay1 = a[5],
      az1 = a[6],
      aw1 = a[7],
      bx0 = b[0],
      by0 = b[1],
      bz0 = b[2],
      bw0 = b[3];
  out[0] = ax0 * bw0 + aw0 * bx0 + ay0 * bz0 - az0 * by0;
  out[1] = ay0 * bw0 + aw0 * by0 + az0 * bx0 - ax0 * bz0;
  out[2] = az0 * bw0 + aw0 * bz0 + ax0 * by0 - ay0 * bx0;
  out[3] = aw0 * bw0 - ax0 * bx0 - ay0 * by0 - az0 * bz0;
  out[4] = ax0 * bw1 + aw0 * bx1 + ay0 * bz1 - az0 * by1 + ax1 * bw0 + aw1 * bx0 + ay1 * bz0 - az1 * by0;
  out[5] = ay0 * bw1 + aw0 * by1 + az0 * bx1 - ax0 * bz1 + ay1 * bw0 + aw1 * by0 + az1 * bx0 - ax1 * bz0;
  out[6] = az0 * bw1 + aw0 * bz1 + ax0 * by1 - ay0 * bx1 + az1 * bw0 + aw1 * bz0 + ax1 * by0 - ay1 * bx0;
  out[7] = aw0 * bw1 - ax0 * bx1 - ay0 * by1 - az0 * bz1 + aw1 * bw0 - ax1 * bx0 - ay1 * by0 - az1 * bz0;
  return out;
}
/**
 * Alias for {@link quat2.multiply}
 * @function
 */

var mul$1 = multiply$1;
/**
 * Scales a dual quat by a scalar number
 *
 * @param {quat2} out the receiving dual quat
 * @param {ReadonlyQuat2} a the dual quat to scale
 * @param {Number} b amount to scale the dual quat by
 * @returns {quat2} out
 * @function
 */

function scale$1(out, a, b) {
  out[0] = a[0] * b;
  out[1] = a[1] * b;
  out[2] = a[2] * b;
  out[3] = a[3] * b;
  out[4] = a[4] * b;
  out[5] = a[5] * b;
  out[6] = a[6] * b;
  out[7] = a[7] * b;
  return out;
}
/**
 * Calculates the dot product of two dual quat's (The dot product of the real parts)
 *
 * @param {ReadonlyQuat2} a the first operand
 * @param {ReadonlyQuat2} b the second operand
 * @returns {Number} dot product of a and b
 * @function
 */

var dot$1 = dot$2;
/**
 * Performs a linear interpolation between two dual quats's
 * NOTE: The resulting dual quaternions won't always be normalized (The error is most noticeable when t = 0.5)
 *
 * @param {quat2} out the receiving dual quat
 * @param {ReadonlyQuat2} a the first operand
 * @param {ReadonlyQuat2} b the second operand
 * @param {Number} t interpolation amount, in the range [0-1], between the two inputs
 * @returns {quat2} out
 */

function lerp$1(out, a, b, t) {
  var mt = 1 - t;
  if (dot$1(a, b) < 0) t = -t;
  out[0] = a[0] * mt + b[0] * t;
  out[1] = a[1] * mt + b[1] * t;
  out[2] = a[2] * mt + b[2] * t;
  out[3] = a[3] * mt + b[3] * t;
  out[4] = a[4] * mt + b[4] * t;
  out[5] = a[5] * mt + b[5] * t;
  out[6] = a[6] * mt + b[6] * t;
  out[7] = a[7] * mt + b[7] * t;
  return out;
}
/**
 * Calculates the inverse of a dual quat. If they are normalized, conjugate is cheaper
 *
 * @param {quat2} out the receiving dual quaternion
 * @param {ReadonlyQuat2} a dual quat to calculate inverse of
 * @returns {quat2} out
 */

function invert(out, a) {
  var sqlen = squaredLength$1(a);
  out[0] = -a[0] / sqlen;
  out[1] = -a[1] / sqlen;
  out[2] = -a[2] / sqlen;
  out[3] = a[3] / sqlen;
  out[4] = -a[4] / sqlen;
  out[5] = -a[5] / sqlen;
  out[6] = -a[6] / sqlen;
  out[7] = a[7] / sqlen;
  return out;
}
/**
 * Calculates the conjugate of a dual quat
 * If the dual quaternion is normalized, this function is faster than quat2.inverse and produces the same result.
 *
 * @param {quat2} out the receiving quaternion
 * @param {ReadonlyQuat2} a quat to calculate conjugate of
 * @returns {quat2} out
 */

function conjugate(out, a) {
  out[0] = -a[0];
  out[1] = -a[1];
  out[2] = -a[2];
  out[3] = a[3];
  out[4] = -a[4];
  out[5] = -a[5];
  out[6] = -a[6];
  out[7] = a[7];
  return out;
}
/**
 * Calculates the length of a dual quat
 *
 * @param {ReadonlyQuat2} a dual quat to calculate length of
 * @returns {Number} length of a
 * @function
 */

var length$1 = length$2;
/**
 * Alias for {@link quat2.length}
 * @function
 */

var len$1 = length$1;
/**
 * Calculates the squared length of a dual quat
 *
 * @param {ReadonlyQuat2} a dual quat to calculate squared length of
 * @returns {Number} squared length of a
 * @function
 */

var squaredLength$1 = squaredLength$2;
/**
 * Alias for {@link quat2.squaredLength}
 * @function
 */

var sqrLen$1 = squaredLength$1;
/**
 * Normalize a dual quat
 *
 * @param {quat2} out the receiving dual quaternion
 * @param {ReadonlyQuat2} a dual quaternion to normalize
 * @returns {quat2} out
 * @function
 */

function normalize$1(out, a) {
  var magnitude = squaredLength$1(a);

  if (magnitude > 0) {
    magnitude = Math.sqrt(magnitude);
    var a0 = a[0] / magnitude;
    var a1 = a[1] / magnitude;
    var a2 = a[2] / magnitude;
    var a3 = a[3] / magnitude;
    var b0 = a[4];
    var b1 = a[5];
    var b2 = a[6];
    var b3 = a[7];
    var a_dot_b = a0 * b0 + a1 * b1 + a2 * b2 + a3 * b3;
    out[0] = a0;
    out[1] = a1;
    out[2] = a2;
    out[3] = a3;
    out[4] = (b0 - a0 * a_dot_b) / magnitude;
    out[5] = (b1 - a1 * a_dot_b) / magnitude;
    out[6] = (b2 - a2 * a_dot_b) / magnitude;
    out[7] = (b3 - a3 * a_dot_b) / magnitude;
  }

  return out;
}
/**
 * Returns a string representation of a dual quatenion
 *
 * @param {ReadonlyQuat2} a dual quaternion to represent as a string
 * @returns {String} string representation of the dual quat
 */

function str$1(a) {
  return "quat2(" + a[0] + ", " + a[1] + ", " + a[2] + ", " + a[3] + ", " + a[4] + ", " + a[5] + ", " + a[6] + ", " + a[7] + ")";
}
/**
 * Returns whether or not the dual quaternions have exactly the same elements in the same position (when compared with ===)
 *
 * @param {ReadonlyQuat2} a the first dual quaternion.
 * @param {ReadonlyQuat2} b the second dual quaternion.
 * @returns {Boolean} true if the dual quaternions are equal, false otherwise.
 */

function exactEquals$1(a, b) {
  return a[0] === b[0] && a[1] === b[1] && a[2] === b[2] && a[3] === b[3] && a[4] === b[4] && a[5] === b[5] && a[6] === b[6] && a[7] === b[7];
}
/**
 * Returns whether or not the dual quaternions have approximately the same elements in the same position.
 *
 * @param {ReadonlyQuat2} a the first dual quat.
 * @param {ReadonlyQuat2} b the second dual quat.
 * @returns {Boolean} true if the dual quats are equal, false otherwise.
 */

function equals$1(a, b) {
  var a0 = a[0],
      a1 = a[1],
      a2 = a[2],
      a3 = a[3],
      a4 = a[4],
      a5 = a[5],
      a6 = a[6],
      a7 = a[7];
  var b0 = b[0],
      b1 = b[1],
      b2 = b[2],
      b3 = b[3],
      b4 = b[4],
      b5 = b[5],
      b6 = b[6],
      b7 = b[7];
  return Math.abs(a0 - b0) <= EPSILON * Math.max(1.0, Math.abs(a0), Math.abs(b0)) && Math.abs(a1 - b1) <= EPSILON * Math.max(1.0, Math.abs(a1), Math.abs(b1)) && Math.abs(a2 - b2) <= EPSILON * Math.max(1.0, Math.abs(a2), Math.abs(b2)) && Math.abs(a3 - b3) <= EPSILON * Math.max(1.0, Math.abs(a3), Math.abs(b3)) && Math.abs(a4 - b4) <= EPSILON * Math.max(1.0, Math.abs(a4), Math.abs(b4)) && Math.abs(a5 - b5) <= EPSILON * Math.max(1.0, Math.abs(a5), Math.abs(b5)) && Math.abs(a6 - b6) <= EPSILON * Math.max(1.0, Math.abs(a6), Math.abs(b6)) && Math.abs(a7 - b7) <= EPSILON * Math.max(1.0, Math.abs(a7), Math.abs(b7));
}

var quat2 = /*#__PURE__*/Object.freeze({
__proto__: null,
add: add$1,
clone: clone$1,
conjugate: conjugate,
copy: copy$1,
create: create$1,
dot: dot$1,
equals: equals$1,
exactEquals: exactEquals$1,
fromMat4: fromMat4,
fromRotation: fromRotation,
fromRotationTranslation: fromRotationTranslation,
fromRotationTranslationValues: fromRotationTranslationValues,
fromTranslation: fromTranslation,
fromValues: fromValues$1,
getDual: getDual,
getReal: getReal,
getTranslation: getTranslation,
identity: identity,
invert: invert,
len: len$1,
length: length$1,
lerp: lerp$1,
mul: mul$1,
multiply: multiply$1,
normalize: normalize$1,
rotateAroundAxis: rotateAroundAxis,
rotateByQuatAppend: rotateByQuatAppend,
rotateByQuatPrepend: rotateByQuatPrepend,
rotateX: rotateX,
rotateY: rotateY,
rotateZ: rotateZ,
scale: scale$1,
set: set$1,
setDual: setDual,
setReal: setReal,
sqrLen: sqrLen$1,
squaredLength: squaredLength$1,
str: str$1,
translate: translate
});

/**
 * 2 Dimensional Vector
 * @module vec2
 */

/**
 * Creates a new, empty vec2
 *
 * @returns {vec2} a new 2D vector
 */

function create() {
  var out = new ARRAY_TYPE(2);

  if (ARRAY_TYPE != Float32Array) {
    out[0] = 0;
    out[1] = 0;
  }

  return out;
}
/**
 * Creates a new vec2 initialized with values from an existing vector
 *
 * @param {ReadonlyVec2} a vector to clone
 * @returns {vec2} a new 2D vector
 */

function clone(a) {
  var out = new ARRAY_TYPE(2);
  out[0] = a[0];
  out[1] = a[1];
  return out;
}
/**
 * Creates a new vec2 initialized with the given values
 *
 * @param {Number} x X component
 * @param {Number} y Y component
 * @returns {vec2} a new 2D vector
 */

function fromValues(x, y) {
  var out = new ARRAY_TYPE(2);
  out[0] = x;
  out[1] = y;
  return out;
}
/**
 * Copy the values from one vec2 to another
 *
 * @param {vec2} out the receiving vector
 * @param {ReadonlyVec2} a the source vector
 * @returns {vec2} out
 */

function copy(out, a) {
  out[0] = a[0];
  out[1] = a[1];
  return out;
}
/**
 * Set the components of a vec2 to the given values
 *
 * @param {vec2} out the receiving vector
 * @param {Number} x X component
 * @param {Number} y Y component
 * @returns {vec2} out
 */

function set(out, x, y) {
  out[0] = x;
  out[1] = y;
  return out;
}
/**
 * Adds two vec2's
 *
 * @param {vec2} out the receiving vector
 * @param {ReadonlyVec2} a the first operand
 * @param {ReadonlyVec2} b the second operand
 * @returns {vec2} out
 */

function add(out, a, b) {
  out[0] = a[0] + b[0];
  out[1] = a[1] + b[1];
  return out;
}
/**
 * Subtracts vector b from vector a
 *
 * @param {vec2} out the receiving vector
 * @param {ReadonlyVec2} a the first operand
 * @param {ReadonlyVec2} b the second operand
 * @returns {vec2} out
 */

function subtract(out, a, b) {
  out[0] = a[0] - b[0];
  out[1] = a[1] - b[1];
  return out;
}
/**
 * Multiplies two vec2's
 *
 * @param {vec2} out the receiving vector
 * @param {ReadonlyVec2} a the first operand
 * @param {ReadonlyVec2} b the second operand
 * @returns {vec2} out
 */

function multiply(out, a, b) {
  out[0] = a[0] * b[0];
  out[1] = a[1] * b[1];
  return out;
}
/**
 * Divides two vec2's
 *
 * @param {vec2} out the receiving vector
 * @param {ReadonlyVec2} a the first operand
 * @param {ReadonlyVec2} b the second operand
 * @returns {vec2} out
 */

function divide(out, a, b) {
  out[0] = a[0] / b[0];
  out[1] = a[1] / b[1];
  return out;
}
/**
 * Math.ceil the components of a vec2
 *
 * @param {vec2} out the receiving vector
 * @param {ReadonlyVec2} a vector to ceil
 * @returns {vec2} out
 */

function ceil(out, a) {
  out[0] = Math.ceil(a[0]);
  out[1] = Math.ceil(a[1]);
  return out;
}
/**
 * Math.floor the components of a vec2
 *
 * @param {vec2} out the receiving vector
 * @param {ReadonlyVec2} a vector to floor
 * @returns {vec2} out
 */

function floor(out, a) {
  out[0] = Math.floor(a[0]);
  out[1] = Math.floor(a[1]);
  return out;
}
/**
 * Returns the minimum of two vec2's
 *
 * @param {vec2} out the receiving vector
 * @param {ReadonlyVec2} a the first operand
 * @param {ReadonlyVec2} b the second operand
 * @returns {vec2} out
 */

function min(out, a, b) {
  out[0] = Math.min(a[0], b[0]);
  out[1] = Math.min(a[1], b[1]);
  return out;
}
/**
 * Returns the maximum of two vec2's
 *
 * @param {vec2} out the receiving vector
 * @param {ReadonlyVec2} a the first operand
 * @param {ReadonlyVec2} b the second operand
 * @returns {vec2} out
 */

function max(out, a, b) {
  out[0] = Math.max(a[0], b[0]);
  out[1] = Math.max(a[1], b[1]);
  return out;
}
/**
 * Math.round the components of a vec2
 *
 * @param {vec2} out the receiving vector
 * @param {ReadonlyVec2} a vector to round
 * @returns {vec2} out
 */

function round(out, a) {
  out[0] = Math.round(a[0]);
  out[1] = Math.round(a[1]);
  return out;
}
/**
 * Scales a vec2 by a scalar number
 *
 * @param {vec2} out the receiving vector
 * @param {ReadonlyVec2} a the vector to scale
 * @param {Number} b amount to scale the vector by
 * @returns {vec2} out
 */

function scale(out, a, b) {
  out[0] = a[0] * b;
  out[1] = a[1] * b;
  return out;
}
/**
 * Adds two vec2's after scaling the second operand by a scalar value
 *
 * @param {vec2} out the receiving vector
 * @param {ReadonlyVec2} a the first operand
 * @param {ReadonlyVec2} b the second operand
 * @param {Number} scale the amount to scale b by before adding
 * @returns {vec2} out
 */

function scaleAndAdd(out, a, b, scale) {
  out[0] = a[0] + b[0] * scale;
  out[1] = a[1] + b[1] * scale;
  return out;
}
/**
 * Calculates the euclidian distance between two vec2's
 *
 * @param {ReadonlyVec2} a the first operand
 * @param {ReadonlyVec2} b the second operand
 * @returns {Number} distance between a and b
 */

function distance(a, b) {
  var x = b[0] - a[0],
      y = b[1] - a[1];
  return Math.hypot(x, y);
}
/**
 * Calculates the squared euclidian distance between two vec2's
 *
 * @param {ReadonlyVec2} a the first operand
 * @param {ReadonlyVec2} b the second operand
 * @returns {Number} squared distance between a and b
 */

function squaredDistance(a, b) {
  var x = b[0] - a[0],
      y = b[1] - a[1];
  return x * x + y * y;
}
/**
 * Calculates the length of a vec2
 *
 * @param {ReadonlyVec2} a vector to calculate length of
 * @returns {Number} length of a
 */

function length(a) {
  var x = a[0],
      y = a[1];
  return Math.hypot(x, y);
}
/**
 * Calculates the squared length of a vec2
 *
 * @param {ReadonlyVec2} a vector to calculate squared length of
 * @returns {Number} squared length of a
 */

function squaredLength(a) {
  var x = a[0],
      y = a[1];
  return x * x + y * y;
}
/**
 * Negates the components of a vec2
 *
 * @param {vec2} out the receiving vector
 * @param {ReadonlyVec2} a vector to negate
 * @returns {vec2} out
 */

function negate(out, a) {
  out[0] = -a[0];
  out[1] = -a[1];
  return out;
}
/**
 * Returns the inverse of the components of a vec2
 *
 * @param {vec2} out the receiving vector
 * @param {ReadonlyVec2} a vector to invert
 * @returns {vec2} out
 */

function inverse(out, a) {
  out[0] = 1.0 / a[0];
  out[1] = 1.0 / a[1];
  return out;
}
/**
 * Normalize a vec2
 *
 * @param {vec2} out the receiving vector
 * @param {ReadonlyVec2} a vector to normalize
 * @returns {vec2} out
 */

function normalize(out, a) {
  var x = a[0],
      y = a[1];
  var len = x * x + y * y;

  if (len > 0) {
    //TODO: evaluate use of glm_invsqrt here?
    len = 1 / Math.sqrt(len);
  }

  out[0] = a[0] * len;
  out[1] = a[1] * len;
  return out;
}
/**
 * Calculates the dot product of two vec2's
 *
 * @param {ReadonlyVec2} a the first operand
 * @param {ReadonlyVec2} b the second operand
 * @returns {Number} dot product of a and b
 */

function dot(a, b) {
  return a[0] * b[0] + a[1] * b[1];
}
/**
 * Computes the cross product of two vec2's
 * Note that the cross product must by definition produce a 3D vector
 *
 * @param {vec3} out the receiving vector
 * @param {ReadonlyVec2} a the first operand
 * @param {ReadonlyVec2} b the second operand
 * @returns {vec3} out
 */

function cross(out, a, b) {
  var z = a[0] * b[1] - a[1] * b[0];
  out[0] = out[1] = 0;
  out[2] = z;
  return out;
}
/**
 * Performs a linear interpolation between two vec2's
 *
 * @param {vec2} out the receiving vector
 * @param {ReadonlyVec2} a the first operand
 * @param {ReadonlyVec2} b the second operand
 * @param {Number} t interpolation amount, in the range [0-1], between the two inputs
 * @returns {vec2} out
 */

function lerp(out, a, b, t) {
  var ax = a[0],
      ay = a[1];
  out[0] = ax + t * (b[0] - ax);
  out[1] = ay + t * (b[1] - ay);
  return out;
}
/**
 * Generates a random vector with the given scale
 *
 * @param {vec2} out the receiving vector
 * @param {Number} [scale] Length of the resulting vector. If ommitted, a unit vector will be returned
 * @returns {vec2} out
 */

function random(out, scale) {
  scale = scale || 1.0;
  var r = RANDOM() * 2.0 * Math.PI;
  out[0] = Math.cos(r) * scale;
  out[1] = Math.sin(r) * scale;
  return out;
}
/**
 * Transforms the vec2 with a mat2
 *
 * @param {vec2} out the receiving vector
 * @param {ReadonlyVec2} a the vector to transform
 * @param {ReadonlyMat2} m matrix to transform with
 * @returns {vec2} out
 */

function transformMat2(out, a, m) {
  var x = a[0],
      y = a[1];
  out[0] = m[0] * x + m[2] * y;
  out[1] = m[1] * x + m[3] * y;
  return out;
}
/**
 * Transforms the vec2 with a mat2d
 *
 * @param {vec2} out the receiving vector
 * @param {ReadonlyVec2} a the vector to transform
 * @param {ReadonlyMat2d} m matrix to transform with
 * @returns {vec2} out
 */

function transformMat2d(out, a, m) {
  var x = a[0],
      y = a[1];
  out[0] = m[0] * x + m[2] * y + m[4];
  out[1] = m[1] * x + m[3] * y + m[5];
  return out;
}
/**
 * Transforms the vec2 with a mat3
 * 3rd vector component is implicitly '1'
 *
 * @param {vec2} out the receiving vector
 * @param {ReadonlyVec2} a the vector to transform
 * @param {ReadonlyMat3} m matrix to transform with
 * @returns {vec2} out
 */

function transformMat3(out, a, m) {
  var x = a[0],
      y = a[1];
  out[0] = m[0] * x + m[3] * y + m[6];
  out[1] = m[1] * x + m[4] * y + m[7];
  return out;
}
/**
 * Transforms the vec2 with a mat4
 * 3rd vector component is implicitly '0'
 * 4th vector component is implicitly '1'
 *
 * @param {vec2} out the receiving vector
 * @param {ReadonlyVec2} a the vector to transform
 * @param {ReadonlyMat4} m matrix to transform with
 * @returns {vec2} out
 */

function transformMat4(out, a, m) {
  var x = a[0];
  var y = a[1];
  out[0] = m[0] * x + m[4] * y + m[12];
  out[1] = m[1] * x + m[5] * y + m[13];
  return out;
}
/**
 * Rotate a 2D vector
 * @param {vec2} out The receiving vec2
 * @param {ReadonlyVec2} a The vec2 point to rotate
 * @param {ReadonlyVec2} b The origin of the rotation
 * @param {Number} rad The angle of rotation in radians
 * @returns {vec2} out
 */

function rotate(out, a, b, rad) {
  //Translate point to the origin
  var p0 = a[0] - b[0],
      p1 = a[1] - b[1],
      sinC = Math.sin(rad),
      cosC = Math.cos(rad); //perform rotation and translate to correct position

  out[0] = p0 * cosC - p1 * sinC + b[0];
  out[1] = p0 * sinC + p1 * cosC + b[1];
  return out;
}
/**
 * Get the angle between two 2D vectors
 * @param {ReadonlyVec2} a The first operand
 * @param {ReadonlyVec2} b The second operand
 * @returns {Number} The angle in radians
 */

function angle(a, b) {
  var x1 = a[0],
      y1 = a[1],
      x2 = b[0],
      y2 = b[1],
      // mag is the product of the magnitudes of a and b
  mag = Math.sqrt(x1 * x1 + y1 * y1) * Math.sqrt(x2 * x2 + y2 * y2),
      // mag &&.. short circuits if mag == 0
  cosine = mag && (x1 * x2 + y1 * y2) / mag; // Math.min(Math.max(cosine, -1), 1) clamps the cosine between -1 and 1

  return Math.acos(Math.min(Math.max(cosine, -1), 1));
}
/**
 * Set the components of a vec2 to zero
 *
 * @param {vec2} out the receiving vector
 * @returns {vec2} out
 */

function zero(out) {
  out[0] = 0.0;
  out[1] = 0.0;
  return out;
}
/**
 * Returns a string representation of a vector
 *
 * @param {ReadonlyVec2} a vector to represent as a string
 * @returns {String} string representation of the vector
 */

function str(a) {
  return "vec2(" + a[0] + ", " + a[1] + ")";
}
/**
 * Returns whether or not the vectors exactly have the same elements in the same position (when compared with ===)
 *
 * @param {ReadonlyVec2} a The first vector.
 * @param {ReadonlyVec2} b The second vector.
 * @returns {Boolean} True if the vectors are equal, false otherwise.
 */

function exactEquals(a, b) {
  return a[0] === b[0] && a[1] === b[1];
}
/**
 * Returns whether or not the vectors have approximately the same elements in the same position.
 *
 * @param {ReadonlyVec2} a The first vector.
 * @param {ReadonlyVec2} b The second vector.
 * @returns {Boolean} True if the vectors are equal, false otherwise.
 */

function equals(a, b) {
  var a0 = a[0],
      a1 = a[1];
  var b0 = b[0],
      b1 = b[1];
  return Math.abs(a0 - b0) <= EPSILON * Math.max(1.0, Math.abs(a0), Math.abs(b0)) && Math.abs(a1 - b1) <= EPSILON * Math.max(1.0, Math.abs(a1), Math.abs(b1));
}
/**
 * Alias for {@link vec2.length}
 * @function
 */

var len = length;
/**
 * Alias for {@link vec2.subtract}
 * @function
 */

var sub = subtract;
/**
 * Alias for {@link vec2.multiply}
 * @function
 */

var mul = multiply;
/**
 * Alias for {@link vec2.divide}
 * @function
 */

var div = divide;
/**
 * Alias for {@link vec2.distance}
 * @function
 */

var dist = distance;
/**
 * Alias for {@link vec2.squaredDistance}
 * @function
 */

var sqrDist = squaredDistance;
/**
 * Alias for {@link vec2.squaredLength}
 * @function
 */

var sqrLen = squaredLength;
/**
 * Perform some operation over an array of vec2s.
 *
 * @param {Array} a the array of vectors to iterate over
 * @param {Number} stride Number of elements between the start of each vec2. If 0 assumes tightly packed
 * @param {Number} offset Number of elements to skip at the beginning of the array
 * @param {Number} count Number of vec2s to iterate over. If 0 iterates over entire array
 * @param {Function} fn Function to call for each vector in the array
 * @param {Object} [arg] additional argument to pass to fn
 * @returns {Array} a
 * @function
 */

var forEach = function () {
  var vec = create();
  return function (a, stride, offset, count, fn, arg) {
    var i, l;

    if (!stride) {
      stride = 2;
    }

    if (!offset) {
      offset = 0;
    }

    if (count) {
      l = Math.min(count * stride + offset, a.length);
    } else {
      l = a.length;
    }

    for (i = offset; i < l; i += stride) {
      vec[0] = a[i];
      vec[1] = a[i + 1];
      fn(vec, vec, arg);
      a[i] = vec[0];
      a[i + 1] = vec[1];
    }

    return a;
  };
}();

var vec2 = /*#__PURE__*/Object.freeze({
__proto__: null,
add: add,
angle: angle,
ceil: ceil,
clone: clone,
copy: copy,
create: create,
cross: cross,
dist: dist,
distance: distance,
div: div,
divide: divide,
dot: dot,
equals: equals,
exactEquals: exactEquals,
floor: floor,
forEach: forEach,
fromValues: fromValues,
inverse: inverse,
len: len,
length: length,
lerp: lerp,
max: max,
min: min,
mul: mul,
multiply: multiply,
negate: negate,
normalize: normalize,
random: random,
rotate: rotate,
round: round,
scale: scale,
scaleAndAdd: scaleAndAdd,
set: set,
sqrDist: sqrDist,
sqrLen: sqrLen,
squaredDistance: squaredDistance,
squaredLength: squaredLength,
str: str,
sub: sub,
subtract: subtract,
transformMat2: transformMat2,
transformMat2d: transformMat2d,
transformMat3: transformMat3,
transformMat4: transformMat4,
zero: zero
});

var esm = /*#__PURE__*/Object.freeze({
__proto__: null,
glMatrix: common,
mat2: mat2,
mat2d: mat2d,
mat3: mat3,
mat4: mat4,
quat: quat,
quat2: quat2,
vec2: vec2,
vec3: vec3,
vec4: vec4
});

var require$$0 = /*@__PURE__*/getAugmentedNamespace(esm);

var helper = {};

var hasRequiredHelper;

function requireHelper () {
	if (hasRequiredHelper) return helper;
	hasRequiredHelper = 1;
	Object.defineProperty(helper, "__esModule", { value: true });
	helper.FaceModeSelectOption = helper.FaceModeColorOption = helper.CenterModeOption = helper.colorSelectOptions = helper.EditingMode = helper.Actions = helper.WorkAction = void 0;
	helper.generateCuboid = generateCuboid;
	helper.boundary = boundary;
	helper.surfaceScale = surfaceScale;
	helper.hex2rgb = hex2rgb;
	helper.absMod = absMod;
	helper.traverseVoxels = traverseVoxels;
	helper.inRange = inRange;
	helper.adjacentVoxels = adjacentVoxels;
	helper.drawVoxelSphere = drawVoxelSphere;
	helper.drawVoxelCircle = drawVoxelCircle;
	helper.drawVoxelSquare = drawVoxelSquare;
	helper.calcRadius = calcRadius;
	helper.calcHalfEdgeLen = calcHalfEdgeLen;
	helper.drawVoxelLine = drawVoxelLine;
	helper.cloneArray = cloneArray;
	helper.newBundle = newBundle;
	helper.fillSpace = fillSpace;
	helper.allocEmptyVoxels = allocEmptyVoxels;
	helper.getElementPos = getElementPos;
	helper.mergeVoxel = mergeVoxel;
	helper.surfaceByNormalAndPoint = surfaceByNormalAndPoint;
	const voxel_1 = requireVoxel();
	const gl_matrix_1 = require$$0;
	var WorkAction;
	(function (WorkAction) {
	    WorkAction[WorkAction["bakeAoData"] = 0] = "bakeAoData";
	    WorkAction[WorkAction["syncVoxel"] = 1] = "syncVoxel";
	    WorkAction[WorkAction["updateVoxel"] = 2] = "updateVoxel";
	    WorkAction[WorkAction["sendPoints"] = 3] = "sendPoints";
	    WorkAction[WorkAction["clearData"] = 4] = "clearData";
	    WorkAction[WorkAction["changeSize"] = 5] = "changeSize";
	})(WorkAction || (helper.WorkAction = WorkAction = {}));
	var Actions;
	(function (Actions) {
	    Actions[Actions["Attach"] = 0] = "Attach";
	    Actions[Actions["Erase"] = 1] = "Erase";
	    Actions[Actions["Paint"] = 2] = "Paint";
	    Actions[Actions["Select"] = 3] = "Select";
	    Actions[Actions["Translate"] = 4] = "Translate";
	    Actions[Actions["ColorSelect"] = 5] = "ColorSelect";
	    Actions[Actions["PickColor"] = 6] = "PickColor";
	    Actions[Actions["HollowOut"] = 7] = "HollowOut";
	    Actions[Actions["FillSameColorSpace"] = 8] = "FillSameColorSpace";
	    Actions[Actions["Extrude"] = 9] = "Extrude";
	})(Actions || (helper.Actions = Actions = {}));
	var EditingMode;
	(function (EditingMode) {
	    EditingMode[EditingMode["line"] = 0] = "line";
	    EditingMode[EditingMode["center"] = 1] = "center";
	    EditingMode[EditingMode["box"] = 2] = "box";
	    EditingMode[EditingMode["voxel"] = 3] = "voxel";
	    EditingMode[EditingMode["face"] = 4] = "face";
	    EditingMode[EditingMode["rect"] = 5] = "rect";
	})(EditingMode || (helper.EditingMode = EditingMode = {}));
	var colorSelectOptions;
	(function (colorSelectOptions) {
	    colorSelectOptions[colorSelectOptions["volume"] = 0] = "volume";
	    colorSelectOptions[colorSelectOptions["face"] = 1] = "face";
	    colorSelectOptions[colorSelectOptions["all"] = 2] = "all";
	})(colorSelectOptions || (helper.colorSelectOptions = colorSelectOptions = {}));
	var CenterModeOption;
	(function (CenterModeOption) {
	    CenterModeOption[CenterModeOption["square"] = 0] = "square";
	    CenterModeOption[CenterModeOption["circle"] = 1] = "circle";
	})(CenterModeOption || (helper.CenterModeOption = CenterModeOption = {}));
	var FaceModeColorOption;
	(function (FaceModeColorOption) {
	    FaceModeColorOption[FaceModeColorOption["voxelColor"] = 0] = "voxelColor";
	    FaceModeColorOption[FaceModeColorOption["currentColor"] = 1] = "currentColor";
	})(FaceModeColorOption || (helper.FaceModeColorOption = FaceModeColorOption = {}));
	var FaceModeSelectOption;
	(function (FaceModeSelectOption) {
	    FaceModeSelectOption[FaceModeSelectOption["geometry"] = 0] = "geometry";
	    FaceModeSelectOption[FaceModeSelectOption["colorGeometry"] = 1] = "colorGeometry";
	})(FaceModeSelectOption || (helper.FaceModeSelectOption = FaceModeSelectOption = {}));
	function generateCuboid(a, b, isVoxle, outerNormal, range) {
	    const { start, end } = boundary(a, b, [-Infinity, -Infinity, -Infinity], [Infinity, Infinity, Infinity]);
	    const positions = [];
	    const elements = [];
	    const normals = [];
	    const nSign = outerNormal ? -1 : 1;
	    if (isVoxle) {
	        for (let i = 0; i < 3; i++) {
	            if (range) {
	                end[i] = Math.min(end[i] + 1, range[i]);
	            }
	            else {
	                end[i] = end[i] + 1;
	            }
	        }
	    }
	    positions.push([start[0], start[1], start[2]]);
	    positions.push([start[0], start[1], end[2]]);
	    positions.push([end[0], start[1], end[2]]);
	    positions.push([end[0], start[1], start[2]]);
	    positions.push([start[0], end[1], start[2]]);
	    positions.push([end[0], end[1], start[2]]);
	    positions.push([end[0], end[1], end[2]]);
	    positions.push([start[0], end[1], end[2]]);
	    positions.push([end[0], start[1], start[2]]);
	    positions.push([end[0], start[1], end[2]]);
	    positions.push([end[0], end[1], end[2]]);
	    positions.push([end[0], end[1], start[2]]);
	    positions.push([start[0], start[1], start[2]]);
	    positions.push([start[0], end[1], start[2]]);
	    positions.push([start[0], end[1], end[2]]);
	    positions.push([start[0], start[1], end[2]]);
	    positions.push([start[0], start[1], start[2]]);
	    positions.push([end[0], start[1], start[2]]);
	    positions.push([end[0], end[1], start[2]]);
	    positions.push([start[0], end[1], start[2]]);
	    positions.push([start[0], start[1], end[2]]);
	    positions.push([start[0], end[1], end[2]]);
	    positions.push([end[0], end[1], end[2]]);
	    positions.push([end[0], start[1], end[2]]);
	    for (let i = 0; i < 4; i++) {
	        normals.push([0, 1 * nSign, 0]);
	    }
	    for (let i = 0; i < 4; i++) {
	        normals.push([0, -1 * nSign, 0]);
	    }
	    for (let i = 0; i < 4; i++) {
	        normals.push([-1 * nSign, 0, 0]);
	    }
	    for (let i = 0; i < 4; i++) {
	        normals.push([1 * nSign, 0, 0]);
	    }
	    for (let i = 0; i < 4; i++) {
	        normals.push([0, 0, 1 * nSign]);
	    }
	    for (let i = 0; i < 4; i++) {
	        normals.push([0, 0, -1 * nSign]);
	    }
	    const surfaceIndex = [0, 4, 8, 12, 16, 20];
	    for (let i = 0; i < surfaceIndex.length; i++) {
	        if (nSign == -1) {
	            elements.push([
	                surfaceIndex[i] + 2,
	                surfaceIndex[i] + 1,
	                surfaceIndex[i],
	            ]);
	            elements.push([
	                surfaceIndex[i],
	                surfaceIndex[i] + 3,
	                surfaceIndex[i] + 2,
	            ]);
	        }
	        else {
	            elements.push([
	                surfaceIndex[i],
	                surfaceIndex[i] + 1,
	                surfaceIndex[i] + 2,
	            ]);
	            elements.push([
	                surfaceIndex[i] + 2,
	                surfaceIndex[i] + 3,
	                surfaceIndex[i],
	            ]);
	        }
	    }
	    return {
	        lo: [start[0], start[1], start[2]],
	        hi: [end[0], end[1], end[2]],
	        positions,
	        elements,
	        normals,
	    };
	}
	function boundary(a, b, minima, maxima) {
	    const start = gl_matrix_1.vec3.create();
	    const end = gl_matrix_1.vec3.create();
	    gl_matrix_1.vec3.max(start, gl_matrix_1.vec3.min(start, a, b), minima);
	    gl_matrix_1.vec3.min(end, gl_matrix_1.vec3.max(end, a, b), maxima);
	    return {
	        start,
	        end,
	    };
	}
	function surfaceScale(normal, surface, scale) {
	    const min = Math.min;
	    const offset = [surface[0][0], surface[0][1], surface[0][2]];
	    for (let i = 1; i < surface.length; i++) {
	        offset[0] = min(offset[0], surface[i][0]);
	        offset[1] = min(offset[1], surface[i][1]);
	        offset[2] = min(offset[2], surface[i][2]);
	    }
	    const out = [];
	    for (let i = 0; i < surface.length; i++) {
	        const pos = [0, 0, 0];
	        if (normal[0] == 0) {
	            pos[0] = (surface[i][0] - offset[0]) * scale - scale / 2;
	        }
	        else if (normal[0] != 0) {
	            pos[0] = surface[0][0];
	        }
	        if (normal[1] == 0) {
	            pos[1] = (surface[i][1] - offset[1]) * scale - scale / 2;
	        }
	        else if (normal[1] != 0) {
	            pos[1] = surface[0][1];
	        }
	        if (normal[2] == 0) {
	            pos[2] = (surface[i][2] - offset[2]) * scale - scale / 2;
	        }
	        else if (normal[2] != 0) {
	            pos[2] = surface[0][2];
	        }
	        out.push(pos);
	    }
	    return out;
	}
	function hex2rgb(hex) {
	    if (hex[0] == '#') {
	        hex = hex.substr(1);
	    }
	    return [
	        parseInt(hex.substr(0, 2), 16),
	        parseInt(hex.substr(2, 2), 16),
	        parseInt(hex.substr(4, 2), 16),
	    ];
	}
	function absMod(n, mod) {
	    if (n < 0) {
	        n = Math.ceil(Math.abs(n / mod)) * mod + n;
	    }
	    else {
	        n %= mod;
	    }
	    return n;
	}
	function traverseVoxels(voxel, start, end, operation) {
	    const { data, stride: [sx, sy, sz], offset, } = voxel;
	    const l = end[0] - start[0] + 1;
	    const h = end[1] - start[1] + 1;
	    const stepi = sx;
	    const stepj = sy - sx * l;
	    const stepk = sz - sy * h;
	    let ptr = sx * start[0] + sy * start[1] + sz * start[2] + offset;
	    for (let k = start[2]; k <= end[2]; ++k) {
	        for (let j = start[1]; j <= end[1]; ++j) {
	            for (let i = start[0]; i <= end[0]; ++i) {
	                operation(i, j, k, data[ptr], ptr);
	                ptr += stepi;
	            }
	            ptr += stepj;
	        }
	        ptr += stepk;
	    }
	}
	function inRange(position, minimum, maximum) {
	    const [x, y, z] = position;
	    const [minX, minY, minZ] = minimum;
	    const [maxX, maxY, maxZ] = maximum;
	    return (x >= minX && y >= minY && z >= minZ && x <= maxX && y <= maxY && z <= maxZ);
	}
	function adjacentVoxels(src, out, currentPos, value, currentMaterial, axis, start, end, normal) {
	    const queue = [];
	    queue.push(currentPos);
	    const maximum = [src.shape[0] - 1, src.shape[1] - 1, src.shape[2] - 1];
	    while (queue.length) {
	        const [x, y, z] = queue.pop();
	        if (!inRange([x, y, z], [0, 0, 0], maximum)) {
	            continue;
	        }
	        if (normal &&
	            inRange([x + normal[0], y + normal[1], z + normal[2]], [0, 0, 0], maximum)) {
	            if (src.getVoxel(x + normal[0], y + normal[1], z + normal[2]) !== 0) {
	                continue;
	            }
	        }
	        if (value === -1) {
	            const index = out.index(x, y, z);
	            if (out.data[index] != 0) {
	                continue;
	            }
	            if (src.data[index] !== 0) {
	                out.data[index] = src.data[index];
	            }
	            else {
	                continue;
	            }
	        }
	        else if (value === 0) {
	            if (out.getVoxel(x, y, z) === currentMaterial) {
	                continue;
	            }
	            if (src.getVoxel(x, y, z) === 0) {
	                out.setVoxel(x, y, z, currentMaterial);
	                src.setVoxel(x, y, z, currentMaterial);
	            }
	            else {
	                continue;
	            }
	        }
	        else {
	            if (out.getVoxel(x, y, z) === value) {
	                continue;
	            }
	            if (src.getVoxel(x, y, z) === value) {
	                out.setVoxel(x, y, z, value);
	            }
	            else {
	                continue;
	            }
	        }
	        gl_matrix_1.vec3.min(start, start, [x, y, z]);
	        gl_matrix_1.vec3.max(end, end, [x, y, z]);
	        if (axis[0] != 0) {
	            queue.push([x + 1, y, z]);
	            queue.push([x - 1, y, z]);
	        }
	        if (axis[1] != 0) {
	            queue.push([x, y + 1, z]);
	            queue.push([x, y - 1, z]);
	        }
	        if (axis[2] != 0) {
	            queue.push([x, y, z + 1]);
	            queue.push([x, y, z - 1]);
	        }
	    }
	}
	function drawVoxelSphere(voxels, center, radius) {
	    for (let i = 0; i < radius; i++) {
	        for (let j = 0; j < radius; j++) {
	            for (let k = 0; k < radius; k++) {
	                if (i * i + j * j + k * k < radius * radius) {
	                    voxels.setVoxel(center[0] + i, center[1] + j, center[2] + k, 1);
	                    voxels.setVoxel(center[0] - i, center[1] + j, center[2] + k, 1);
	                    voxels.setVoxel(center[0] + i, center[1] - j, center[2] + k, 1);
	                    voxels.setVoxel(center[0] + i, center[1] + j, center[2] - k, 1);
	                    voxels.setVoxel(center[0] - i, center[1] - j, center[2] + k, 1);
	                    voxels.setVoxel(center[0] - i, center[1] - j, center[2] - k, 1);
	                    voxels.setVoxel(center[0] + i, center[1] - j, center[2] - k, 1);
	                    voxels.setVoxel(center[0] - i, center[1] + j, center[2] - k, 1);
	                }
	            }
	        }
	    }
	}
	function drawVoxelCircle(voxels, color, center, radius, N_axis, visitor) {
	    let a = 0;
	    let b = radius;
	    let p = 5 / 4 - radius;
	    if (typeof N_axis !== 'string') {
	        if (N_axis[0] != 0) {
	            N_axis = 'x';
	        }
	        else if (N_axis[1] != 0) {
	            N_axis = 'y';
	        }
	        else if (N_axis[2] != 0) {
	            N_axis = 'z';
	        }
	    }
	    while (a <= b) {
	        if (p < 0) {
	            p = p + 2 * a + 3;
	            a++;
	        }
	        else {
	            p = p + 2 * (a - b) + 5;
	            b--;
	            a++;
	        }
	        if (N_axis === 'z') {
	            for (let i = center[0] - a; i <= center[0] + a; i++) {
	                visitor(i, center[1] + b, center[2]);
	                visitor(i, center[1] - b, center[2]);
	            }
	            for (let i = center[0] - b; i <= center[0] + b; i++) {
	                visitor(i, center[1] + a, center[2]);
	                visitor(i, center[1] - a, center[2]);
	            }
	            for (let i = center[0] - radius; i <= center[0] + radius; i++) {
	                if (i != center[0]) {
	                    visitor(i, center[1], center[2]);
	                }
	            }
	        }
	        else if (N_axis === 'y') {
	            for (let i = center[2] - a; i <= center[2] + a; i++) {
	                visitor(center[0] + b, center[1], i);
	                visitor(center[0] - b, center[1], i);
	            }
	            for (let i = center[2] - b; i <= center[2] + b; i++) {
	                visitor(center[0] + a, center[1], i);
	                visitor(center[0] - a, center[1], i);
	            }
	            for (let i = center[2] - radius; i <= center[2] + radius; i++) {
	                if (i != center[2]) {
	                    visitor(center[0], center[1], i);
	                }
	            }
	        }
	        else if (N_axis === 'x') {
	            for (let i = center[2] - a; i <= center[2] + a; i++) {
	                visitor(center[0], center[1] + b, i);
	                visitor(center[0], center[1] - b, i);
	            }
	            for (let i = center[2] - b; i <= center[2] + b; i++) {
	                visitor(center[0], center[1] + a, i);
	                visitor(center[0], center[1] - a, i);
	            }
	            for (let i = center[2] - radius; i <= center[2] + radius; i++) {
	                if (i != center[2]) {
	                    visitor(center[0], center[1], i);
	                }
	            }
	        }
	    }
	}
	function drawVoxelSquare(voxels, color, center, halfEdgeLen, N_axis, force = false) {
	    if (typeof N_axis !== 'string') {
	        if (N_axis[0] != 0) {
	            N_axis = 'x';
	        }
	        else if (N_axis[1] != 0) {
	            N_axis = 'y';
	        }
	        else if (N_axis[2] != 0) {
	            N_axis = 'z';
	        }
	    }
	    if (N_axis === 'z') {
	        for (let i = center[0] - halfEdgeLen; i <= center[0] + halfEdgeLen; i++) {
	            for (let j = center[1] - halfEdgeLen; j <= center[1] + halfEdgeLen; j++) {
	                if (i != center[0] || j != center[1]) {
	                    const idx = voxels.index(i, j, center[2]);
	                    if (idx > -1) {
	                        voxels.data[idx] = force ? color : voxels.data[idx] || color;
	                    }
	                }
	            }
	        }
	    }
	    else if (N_axis === 'y') {
	        for (let i = center[0] - halfEdgeLen; i <= center[0] + halfEdgeLen; i++) {
	            for (let k = center[2] - halfEdgeLen; k <= center[2] + halfEdgeLen; k++) {
	                if (i != center[0] || k != center[2]) {
	                    const idx = voxels.index(i, center[1], k);
	                    if (idx > -1) {
	                        voxels.data[idx] = force ? color : voxels.data[idx] || color;
	                    }
	                }
	            }
	        }
	    }
	    else if (N_axis === 'x') {
	        for (let j = center[1] - halfEdgeLen; j <= center[1] + halfEdgeLen; j++) {
	            for (let k = center[2] - halfEdgeLen; k <= center[2] + halfEdgeLen; k++) {
	                if (j != center[1] || k != center[2]) {
	                    const idx = voxels.index(center[0], j, k);
	                    if (idx > -1) {
	                        voxels.data[idx] = force ? color : voxels.data[idx] || color;
	                    }
	                }
	            }
	        }
	    }
	}
	function calcRadius(N_axis, center, pos) {
	    if (N_axis[0] != 0) {
	        const _dy = pos[1] - center[1];
	        const _dz = pos[2] - center[2];
	        return Math.round(Math.pow(_dy * _dy + _dz * _dz, 0.5));
	    }
	    else if (N_axis[1] != 0) {
	        const _dx = pos[0] - center[0];
	        const _dz = pos[2] - center[2];
	        return Math.round(Math.pow(_dx * _dx + _dz * _dz, 0.5));
	    }
	    else if (N_axis[2] != 0) {
	        const _dx = pos[0] - center[0];
	        const _dy = pos[1] - center[1];
	        return Math.round(Math.pow(_dx * _dx + _dy * _dy, 0.5));
	    }
	    return 0;
	}
	function calcHalfEdgeLen(N_axis, center, pos) {
	    if (N_axis[0] != 0) {
	        const _dy = Math.abs(pos[1] - center[1]);
	        const _dz = Math.abs(pos[2] - center[2]);
	        return Math.max(_dy, _dz);
	    }
	    else if (N_axis[1] != 0) {
	        const _dx = Math.abs(pos[0] - center[0]);
	        const _dz = Math.abs(pos[2] - center[2]);
	        return Math.max(_dx, _dz);
	    }
	    else if (N_axis[2] != 0) {
	        const _dx = Math.abs(pos[0] - center[0]);
	        const _dy = Math.abs(pos[1] - center[1]);
	        return Math.max(_dx, _dy);
	    }
	    return 0;
	}
	function drawVoxelLine(startP, endP, visitor) {
	    const minX = Math.min(startP[0], endP[0]);
	    const minY = Math.min(startP[1], endP[1]);
	    const minZ = Math.min(startP[2], endP[2]);
	    const maxX = Math.max(startP[0], endP[0]);
	    const maxY = Math.max(startP[1], endP[1]);
	    const maxZ = Math.max(startP[2], endP[2]);
	    let dx = +(endP[0] - startP[0]);
	    let dy = +(endP[1] - startP[1]);
	    let dz = +(endP[2] - startP[2]);
	    const s = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2) + Math.pow(dz, 2));
	    dx = dx / s;
	    dy = dy / s;
	    dz = dz / s;
	    const txDelta = Math.abs(1 / dx);
	    const tyDelta = Math.abs(1 / dy);
	    const tzDelta = Math.abs(1 / dz);
	    let txMax = txDelta < Infinity ? Math.abs(dx) + 1 : Infinity;
	    let tyMax = tyDelta < Infinity ? Math.abs(dy) + 1 : Infinity;
	    let tzMax = tzDelta < Infinity ? Math.abs(dz) + 1 : Infinity;
	    const stepx = dx < 0 ? -1 : dx > 0 ? 1 : 0;
	    const stepy = dy < 0 ? -1 : dy > 0 ? 1 : 0;
	    const stepz = dz < 0 ? -1 : dz > 0 ? 1 : 0;
	    let [x, y, z] = startP;
	    while (true) {
	        visitor(x, y, z);
	        if (x == endP[0] && y == endP[1] && z == endP[2]) {
	            return;
	        }
	        if (txMax < tyMax) {
	            if (txMax < tzMax) {
	                x = x + stepx;
	                if (x < minX || x > maxX) {
	                    return;
	                }
	                txMax = txMax + txDelta;
	            }
	            else {
	                z = z + stepz;
	                if (z < minZ || z > maxZ) {
	                    return;
	                }
	                tzMax = tzMax + tzDelta;
	            }
	        }
	        else {
	            if (tyMax < tzMax) {
	                y = y + stepy;
	                if (y < minY || y > maxY) {
	                    return;
	                }
	                tyMax = tyMax + tyDelta;
	            }
	            else {
	                z = z + stepz;
	                if (z < minZ || z > maxZ) {
	                    return;
	                }
	                tzMax = tzMax + tzDelta;
	            }
	        }
	    }
	}
	function cloneArray(x) {
	    const result = new Array(x.length);
	    for (let i = 0; i < x.length; ++i) {
	        result[i] = x[i].slice();
	    }
	    return result;
	}
	function getSubSpace(as, ae, bs, be) {
	    const max = Math.max;
	    const min = Math.min;
	    const intersectS = [max(as[0], bs[0]), max(as[1], bs[1]), max(as[2], bs[2])];
	    const intersectE = [min(ae[0], be[0]), min(ae[1], be[1]), min(ae[2], be[2])];
	    if (!(intersectS[0] < intersectE[0] &&
	        intersectS[1] < intersectE[1] &&
	        intersectS[2] < intersectE[2])) {
	        return { eliminate: [[as, ae]], addition: [[bs, be]] };
	    }
	    const eliminateSpace = [];
	    [
	        [as, [intersectE[0], ae[1], intersectS[2]]],
	        [
	            [intersectE[0] + 1, as[1], as[2]],
	            [ae[0], ae[1], intersectE[2]],
	        ],
	        [
	            [as[0], as[1], intersectS[2]],
	            [intersectS[0] - 1, ae[1], ae[2]],
	        ],
	        [[intersectS[0], as[1], intersectE[2]], ae],
	        [
	            [intersectS[0], as[1], intersectS[2]],
	            [intersectE[0], intersectS[1] - 1, intersectE[2]],
	        ],
	        [
	            [intersectS[0], intersectE[1] + 1, intersectS[2]],
	            [intersectE[0], ae[1], intersectE[2]],
	        ],
	    ].forEach((points) => {
	        for (let i = 0; i < points[0].length; i++) {
	            if (points[1][i] - points[0][i] < 0) {
	                return;
	            }
	        }
	        eliminateSpace.push(points);
	    });
	    const additionSpace = [];
	    [
	        [bs, [intersectE[0], be[1], intersectS[2]]],
	        [
	            [intersectE[0] + 1, bs[1], bs[2]],
	            [be[0], be[1], intersectE[2]],
	        ],
	        [
	            [bs[0], bs[1], intersectS[2]],
	            [intersectS[0] - 1, be[1], be[2]],
	        ],
	        [[intersectS[0], bs[1], intersectE[2]], be],
	        [
	            [intersectS[0], bs[1], intersectS[2]],
	            [intersectE[0], intersectS[1] - 1, intersectE[2]],
	        ],
	        [
	            [intersectS[0], intersectE[1] + 1, intersectS[2]],
	            [intersectE[0], be[1], intersectE[2]],
	        ],
	    ].forEach((points) => {
	        for (let i = 0; i < points[0].length; i++) {
	            if (points[1][i] - points[0][i] < 0) {
	                return;
	            }
	        }
	        additionSpace.push(points);
	    });
	    return { eliminate: eliminateSpace, addition: additionSpace };
	}
	function newBundle(voxel, prevStart, prevEnd, start, end, eliminateMaterial, newMaterial, condition) {
	    const currBound = boundary(start, end, [0, 0, 0], voxel.getDimension());
	    const [minX, minY, minZ] = currBound.start;
	    const [maxX, maxY, maxZ] = currBound.end;
	    if (prevStart && prevStart.length == 3) {
	        const prevBound = boundary(prevStart, prevEnd, [0, 0, 0], voxel.getDimension());
	        const [preMinX, preMinY, preMinZ] = prevBound.start;
	        const [preMaxX, preMaxY, preMaxZ] = prevBound.end;
	        const rst = getSubSpace([preMinX, preMinY, preMinZ], [preMaxX, preMaxY, preMaxZ], [minX, minY, minZ], [maxX, maxY, maxZ]);
	        rst.eliminate.forEach((pos) => {
	            fillSpace(voxel, pos[0], pos[1], eliminateMaterial);
	        });
	        rst.addition.forEach((pos) => {
	            fillSpace(voxel, pos[0], pos[1], newMaterial, condition);
	        });
	    }
	    else {
	        for (let i = minX; i <= maxX; i++) {
	            for (let j = minY; j <= maxY; j++) {
	                for (let k = minZ; k <= maxZ; k++) {
	                    if (typeof newMaterial == 'function') {
	                        voxel.setVoxel(i, j, k, newMaterial(i, j, k));
	                    }
	                    else {
	                        voxel.setVoxel(i, j, k, newMaterial);
	                    }
	                }
	            }
	        }
	    }
	    return voxel;
	}
	function fillSpace(voxel, start, end, material, condition) {
	    const getTextureId = typeof material === 'function' ? material : () => material;
	    const onCondition = typeof condition === 'function' ? condition : () => true;
	    traverseVoxels(voxel, start, end, (i, j, k) => {
	        if (!onCondition(i, j, k)) {
	            return;
	        }
	        voxel.setVoxel(i, j, k, getTextureId(i, j, k));
	    });
	}
	function allocEmptyVoxels(x, y, z) {
	    const voxels = (0, voxel_1.allocVoxels)(x, y, z);
	    for (let i = 0; i < voxels.data.length; i++) {
	        voxels.data[i] = 0;
	    }
	    return voxels;
	}
	function getElementPos(e) {
	    let x = 0;
	    let y = 0;
	    while (e != null) {
	        x += e.offsetLeft;
	        y += e.offsetTop;
	        e = e.offsetParent;
	    }
	    return {
	        x,
	        y,
	    };
	}
	function mergeVoxel(a, b, start, end, type = 1) {
	    const bound = boundary(start, end, [0, 0, 0], a.shape.map((v) => v - 1));
	    const [minX, minY, minZ] = bound.start;
	    const [maxX, maxY, maxZ] = bound.end;
	    for (let i = minX; i <= maxX; i++) {
	        for (let j = minY; j <= maxY; j++) {
	            for (let k = minZ; k <= maxZ; k++) {
	                if (type === 1) {
	                    if (a.getVoxel(i, j, k) == 0) {
	                        a.setVoxel(i, j, k, b.getVoxel(i, j, k));
	                    }
	                }
	                else if (type === 2) {
	                    a.setVoxel(i, j, k, b.getVoxel(i, j, k));
	                }
	                else if (type === 3) {
	                    if (b.getVoxel(i, j, k) != 0) {
	                        a.setVoxel(i, j, k, b.getVoxel(i, j, k));
	                    }
	                }
	                else if (type === 4) {
	                    if (b.getVoxel(i, j, k) != 0) {
	                        a.setVoxel(i, j, k, b.getVoxel(i, j, k));
	                        b.setVoxel(i, j, k, 0);
	                    }
	                }
	                else if (type === 5) {
	                    if (a.getVoxel(i, j, k) == 0) {
	                        a.setVoxel(i, j, k, b.getVoxel(i, j, k));
	                        b.setVoxel(i, j, k, 0);
	                    }
	                }
	            }
	        }
	    }
	    return function (c, s, e, t = 1) {
	        return mergeVoxel(a, c, s, e, t);
	    };
	}
	function surfaceByNormalAndPoint(p, q) {
	    const tris = [];
	    const A = q[0] - p[0];
	    const B = q[1] - p[1];
	    const C = q[2] - p[2];
	    const Cx = p[0];
	    const Cy = p[1];
	    const Cz = p[2];
	    const maxDN = Math.max(Math.abs(A), Math.abs(B), Math.abs(C));
	    let vertices;
	    const v = 2000;
	    if (maxDN === Math.abs(A)) {
	        if (A > 0) {
	            vertices = [
	                [v, v],
	                [-v, v],
	                [-v, -v],
	                [v, -v],
	            ];
	        }
	        else {
	            vertices = [
	                [v, v],
	                [v, -v],
	                [-v, -v],
	                [-v, v],
	            ];
	        }
	        for (let i = 0; i < vertices.length; i++) {
	            const y = vertices[i][0];
	            const z = vertices[i][1];
	            const x = Cx - (B * (y - Cy) + C * (z - Cz)) / A;
	            tris.push([x, y, z]);
	        }
	    }
	    else if (maxDN === Math.abs(B)) {
	        if (B > 0) {
	            vertices = [
	                [v, v],
	                [v, -v],
	                [-v, -v],
	                [-v, v],
	            ];
	        }
	        else {
	            vertices = [
	                [v, v],
	                [-v, v],
	                [-v, -v],
	                [v, -v],
	            ];
	        }
	        for (let i = 0; i < vertices.length; i++) {
	            const x = vertices[i][0];
	            const z = vertices[i][1];
	            const y = Cy - (A * (x - Cx) + C * (z - Cz)) / B;
	            tris.push([x, y, z]);
	        }
	    }
	    else {
	        if (C > 0) {
	            vertices = [
	                [v, v],
	                [-v, v],
	                [-v, -v],
	                [v, -v],
	            ];
	        }
	        else if (C < 0) {
	            vertices = [
	                [v, v],
	                [v, -v],
	                [-v, -v],
	                [-v, v],
	            ];
	        }
	        else {
	            throw new Error('C should not be zero');
	        }
	        for (let i = 0; i < vertices.length; i++) {
	            const x = vertices[i][0];
	            const y = vertices[i][1];
	            const z = Cz - (A * (x - Cx) + B * (y - Cy)) / C;
	            tris.push([x, y, z]);
	        }
	    }
	    return tris;
	}
	return helper;
}

var hasRequiredVoxel;

function requireVoxel () {
	if (hasRequiredVoxel) return voxel;
	hasRequiredVoxel = 1;
	Object.defineProperty(voxel, "__esModule", { value: true });
	voxel.VoxelView = void 0;
	voxel.getBoxBoundary = getBoxBoundary;
	voxel.allocVoxels = allocVoxels;
	voxel.freeVoxels = freeVoxels;
	voxel.cloneVoxels = cloneVoxels;
	voxel.storeVoxels = storeVoxels;
	voxel.restoreVoxels = restoreVoxels;
	voxel.flipVoxels = flipVoxels;
	voxel.isEmptyVoxels = isEmptyVoxels;
	const gl_matrix_1 = require$$0;
	const helper_1 = requireHelper();
	const pool_1 = requirePool();
	const rle_compress_1 = requireRleCompress();
	const TEMP_UINT16ARRAY = new Uint16Array();
	class VoxelView {
	    constructor(data, shape, stride, offset, dataStart, dataEnd, dataStride) {
	        this.getVoxelByPtr = (ptr) => {
	            if (!this.dataStart || !this.dataEnd || !this.dataStride) {
	                return this.data[ptr];
	            }
	            const z = Math.floor(ptr / this.stride[2]);
	            const y = Math.floor((ptr % this.stride[2]) / this.stride[1]);
	            const x = ptr % this.stride[1];
	            if (!this.contains(x, y, z, this.dataStart, this.dataEnd)) {
	                return 0;
	            }
	            return this.data[this.dataStride[0] * (x - this.dataStart[0]) +
	                this.dataStride[1] * (y - this.dataStart[1]) +
	                this.dataStride[2] * (z - this.dataStart[2])];
	        };
	        this.setVoxelByPtr = (ptr, b) => {
	            if (!this.dataStart || !this.dataEnd || !this.dataStride) {
	                return (this.data[ptr] = b);
	            }
	            const z = Math.floor(ptr / this.stride[2]);
	            const y = Math.floor((ptr % this.stride[2]) / this.stride[1]);
	            const x = ptr % this.stride[1];
	            if (!this.contains(x, y, z, this.dataStart, this.dataEnd)) {
	                return 0;
	            }
	            return (this.data[this.dataStride[0] * (x - this.dataStart[0]) +
	                this.dataStride[1] * (y - this.dataStart[1]) +
	                this.dataStride[2] * (z - this.dataStart[2])] = b);
	        };
	        this.data = data;
	        this.shape = shape;
	        this.stride = stride;
	        this.offset = offset | 0;
	        this.dataStart = dataStart;
	        this.dataEnd = dataEnd;
	        this.dataStride = dataStride;
	    }
	    getVoxel(x, y, z) {
	        return this.getVoxelByPtr(this.index(x, y, z));
	    }
	    getVoxels() {
	        const voxels = [];
	        (0, helper_1.traverseVoxels)(this, [0, 0, 0], this.shape.map((v) => v - 1), (i, j, k, d) => {
	            if (d != 0) {
	                voxels.push([i, j, k]);
	            }
	        });
	        return voxels;
	    }
	    getDimension() {
	        return gl_matrix_1.vec3.add(gl_matrix_1.vec3.clone(this.shape), this.shape, [-1, -1, -1]);
	    }
	    index(x, y, z) {
	        return (this.stride[0] * x + this.stride[1] * y + this.stride[2] * z + this.offset);
	    }
	    contains(x, y, z, start, end) {
	        return (x >= start[0] &&
	            x < end[0] &&
	            y >= start[1] &&
	            y < end[1] &&
	            z >= start[2] &&
	            z < end[2]);
	    }
	    setVoxel(x, y, z, b) {
	        return this.setVoxelByPtr(this.index(x, y, z), b);
	    }
	    setVoxelRotate(x, y, z, rotate) {
	        const b = this.getVoxel(x, y, z) | (rotate << 14);
	        return (this.data[this.stride[0] * x + this.stride[1] * y + this.stride[2] * z + this.offset] = b);
	    }
	    slice(lo, hi) {
	        return new VoxelView(this.data, [hi[0] - lo[0], hi[1] - lo[1], hi[2] - lo[2]], this.stride, this.offset +
	            this.stride[0] * lo[0] +
	            this.stride[1] * lo[1] +
	            this.stride[2] * lo[2], this.dataStart, this.dataEnd, this.dataStride);
	    }
	    transpose(px, py, pz) {
	        return new VoxelView(this.data, [this.shape[px], this.shape[py], this.shape[pz]], [this.stride[px], this.stride[py], this.stride[pz]], this.offset);
	    }
	    step(sx, sy, sz) {
	        return new VoxelView(this.data, [
	            Math.floor(this.shape[0] / sx),
	            Math.floor(this.shape[1] / sy),
	            Math.floor(this.shape[2] / sz),
	        ], [this.stride[0] * sx, this.stride[1] * sy, this.stride[2] * sz], this.offset);
	    }
	    copy(other) {
	        const [nx_, ny_, nz_] = this.shape;
	        const [mx_, my_, mz_] = other.shape;
	        const nx = Math.min(nx_, mx_);
	        const ny = Math.min(ny_, my_);
	        const nz = Math.min(nz_, mz_);
	        const tdata = this.data;
	        const [tx, ty, tz] = this.stride;
	        let tptr = this.offset;
	        const dtdi = tx;
	        const dtdj = ty - nx * tx;
	        const dtdk = tz - ny * ty;
	        const sdata = other.data;
	        const [sx, sy, sz] = other.stride;
	        let sptr = other.offset;
	        const dsdi = sx;
	        const dsdj = sy - nx * sx;
	        const dsdk = sz - ny * sy;
	        for (let k = 0; k < nz; ++k) {
	            for (let j = 0; j < ny; ++j) {
	                for (let i = 0; i < nx; ++i) {
	                    tdata[tptr] = sdata[sptr];
	                    tptr += dtdi;
	                    sptr += dsdi;
	                }
	                tptr += dtdj;
	                sptr += dsdj;
	            }
	            tptr += dtdk;
	            sptr += dsdk;
	        }
	    }
	    fill(b) {
	        const [nx, ny, nz] = this.shape;
	        const tdata = this.data;
	        const [tx, ty, tz] = this.stride;
	        let tptr = this.offset;
	        const dtdi = tx;
	        const dtdj = ty - nx * tx;
	        const dtdk = tz - ny * ty;
	        for (let k = 0; k < nz; ++k) {
	            for (let j = 0; j < ny; ++j) {
	                for (let i = 0; i < nx; ++i) {
	                    tdata[tptr] = b;
	                    tptr += dtdi;
	                }
	                tptr += dtdj;
	            }
	            tptr += dtdk;
	        }
	    }
	    equals(other) {
	        if (this.shape[0] !== other.shape[0] ||
	            this.shape[1] !== other.shape[1] ||
	            this.shape[2] !== other.shape[2]) {
	            return false;
	        }
	        const [nx, ny, nz] = this.shape;
	        const tdata = this.data;
	        const [tx, ty, tz] = this.stride;
	        let tptr = this.offset;
	        const dtdi = tx;
	        const dtdj = ty - nx * tx;
	        const dtdk = tz - ny * ty;
	        const sdata = other.data;
	        const [sx, sy, sz] = other.stride;
	        let sptr = other.offset;
	        const dsdi = sx;
	        const dsdj = sy - nx * sx;
	        const dsdk = sz - ny * sy;
	        for (let k = 0; k < nz; ++k) {
	            for (let j = 0; j < ny; ++j) {
	                for (let i = 0; i < nx; ++i) {
	                    if (tdata[tptr] !== sdata[sptr]) {
	                        return false;
	                    }
	                    tptr += dtdi;
	                    sptr += dsdi;
	                }
	                tptr += dtdj;
	                sptr += dsdj;
	            }
	            tptr += dtdk;
	            sptr += dsdk;
	        }
	        return true;
	    }
	    clear() {
	        for (let i = 0; i < this.data.length; i++) {
	            this.data[i] = 0;
	        }
	    }
	    destroy() {
	        this.data = TEMP_UINT16ARRAY;
	    }
	    getStartPosition() {
	        let idx = this.data.findIndex((data) => data !== 0);
	        if (idx < 0) {
	            return undefined;
	        }
	        const [strideX, strideY, strideZ] = this.stride;
	        let x = 0;
	        let y = 0;
	        let z = 0;
	        z = Math.floor(idx / strideZ);
	        idx -= z * strideZ;
	        y = Math.floor(idx / strideY);
	        idx -= y * strideY;
	        x = Math.floor(idx / strideX);
	        return [x, y, z];
	    }
	}
	voxel.VoxelView = VoxelView;
	function getBoxBoundary(voxels) {
	    const start = [Infinity, Infinity, Infinity];
	    const end = [-Infinity, -Infinity, -Infinity];
	    (0, helper_1.traverseVoxels)(voxels, [0, 0, 0], voxels.getDimension(), (i, j, k, d) => {
	        if (d) {
	            gl_matrix_1.vec3.min(start, start, [i, j, k]);
	            gl_matrix_1.vec3.max(end, end, [i, j, k]);
	        }
	    });
	    return {
	        start,
	        end,
	    };
	}
	function allocVoxels(nx, ny, nz, dataStart, dataEnd) {
	    let size = nx * ny * nz;
	    let dataStride = undefined;
	    if (dataStart && dataEnd) {
	        const dnx = dataEnd[0] - dataStart[0];
	        const dny = dataEnd[1] - dataStart[1];
	        const dnz = dataEnd[2] - dataStart[2];
	        size = dnx * dny * dnz;
	        dataStride = [1, dnx, dnx * dny];
	    }
	    return new VoxelView(new Uint16Array((0, pool_1.alloc)(size * 2)), [nx, ny, nz], [1, nx, nx * ny], 0, dataStart, dataEnd, dataStride);
	}
	function freeVoxels(voxels) {
	    (0, pool_1.free)(voxels.data.buffer);
	}
	function cloneVoxels(voxels) {
	    const result = allocVoxels(voxels.shape[0], voxels.shape[1], voxels.shape[2]);
	    result.copy(voxels);
	    return result;
	}
	function storeVoxels(voxels, ws, isEmpty) {
	    const [nx, ny, nz] = voxels.shape;
	    ws.writeInt32(nx);
	    ws.writeInt32(ny);
	    ws.writeInt32(nz);
	    if (isEmpty) {
	        return;
	    }
	    (0, rle_compress_1.compress)(voxels, ws);
	}
	function restoreVoxels(rs) {
	    const nx = rs.readInt32();
	    const ny = rs.readInt32();
	    const nz = rs.readInt32();
	    const isEmpty = rs.buffer.buffer.byteLength <= rs.offset;
	    let voxels;
	    if (isEmpty) {
	        voxels = (0, helper_1.allocEmptyVoxels)(nx, ny, nz);
	    }
	    else {
	        voxels = allocVoxels(nx, ny, nz);
	        (0, rle_compress_1.decompress)(rs, voxels);
	    }
	    return {
	        voxels,
	        isEmpty,
	    };
	}
	function flipVoxels(voxels, axis, boundary) {
	    const flipBoundary = boundary || getBoxBoundary(voxels);
	    switch (axis) {
	        case 'X':
	            flipX(voxels, flipBoundary);
	            break;
	        case 'Y':
	            flipY(voxels, flipBoundary);
	            break;
	        case 'Z':
	            flipZ(voxels, flipBoundary);
	    }
	}
	function flipX(voxels, boundary) {
	    const { start, end } = boundary;
	    const spanX = start[0] + end[0];
	    (0, helper_1.traverseVoxels)(voxels, start, [Math.floor(spanX / 2), end[1], end[2]], (i, j, k, d) => {
	        const flipped = voxels.getVoxel(spanX - i, j, k);
	        voxels.setVoxel(i, j, k, flipped);
	        voxels.setVoxel(spanX - i, j, k, d);
	    });
	}
	function flipY(voxels, boundary) {
	    const { start, end } = boundary;
	    const spanY = start[1] + end[1];
	    (0, helper_1.traverseVoxels)(voxels, start, [end[0], Math.floor(spanY / 2), end[2]], (i, j, k, d) => {
	        const flipped = voxels.getVoxel(i, spanY - j, k);
	        voxels.setVoxel(i, j, k, flipped);
	        voxels.setVoxel(i, spanY - j, k, d);
	    });
	}
	function flipZ(voxels, boundary) {
	    const { start, end } = boundary;
	    const spanZ = start[2] + end[2];
	    (0, helper_1.traverseVoxels)(voxels, start, [end[0], end[1], Math.floor(spanZ / 2)], (i, j, k, d) => {
	        const flipped = voxels.getVoxel(i, j, spanZ - k);
	        voxels.setVoxel(i, j, k, flipped);
	        voxels.setVoxel(i, j, spanZ - k, d);
	    });
	}
	function isEmptyVoxels(voxelView) {
	    return voxelView.data.some((v) => v !== 0);
	}
	return voxel;
}

var voxelExports = requireVoxel();

let urlAlphabet =
  'useandom-26T198340PX75pxJACKVERYMINDBUSHWOLF_GQZbfghjklqvwyzrict';

const POOL_SIZE_MULTIPLIER = 128;
let pool, poolOffset;

let fillPool = bytes => {
  if (bytes < 0) throw new RangeError('Wrong ID size')
  try {
    if (!pool || pool.length < bytes) {
      pool = Buffer.allocUnsafe(bytes * POOL_SIZE_MULTIPLIER);
      crypto.randomFillSync(pool);
      poolOffset = 0;
    } else if (poolOffset + bytes > pool.length) {
      crypto.randomFillSync(pool);
      poolOffset = 0;
    }
  } catch (e) {
    pool = undefined;
    throw e
  }
  poolOffset += bytes;
};

let nanoid = (size = 21) => {
  fillPool((size |= 0));
  let id = '';
  for (let i = poolOffset - size; i < poolOffset; i++) {
    id += urlAlphabet[pool[i] & 63];
  }
  return id
};

var ndarrayExports = requireNdarray();
var ndarray = /*@__PURE__*/getDefaultExportFromCjs(ndarrayExports);

var NodeType;
(function (NodeType) {
  NodeType[NodeType["Root"] = 0] = "Root";
  NodeType[NodeType["SkinPart"] = 1] = "SkinPart";
  NodeType[NodeType["Group"] = 2] = "Group";
})(NodeType || (NodeType = {}));

function parseVbFile(vbFile) {
  const {
    HEXCOLORS,
    PBRATTRBS,
    CURRENTCOLORINDEX,
    ENCODEVOXELS
  } = vbFile;
  const voxelView = restoreVoxels(ENCODEVOXELS);
  const {
    rawMesh: rawMesh,
    bounds,
    textureIds
  } = bakeMesh(voxelView);
  const skinPartNodeId = nanoid();
  const model = getVoxaModel({
    skinPartNodeId,
    rawMesh,
    bounds,
    hexColorTables: HEXCOLORS,
    pbrTables: PBRATTRBS,
    currentColorIdx: CURRENTCOLORINDEX
  });
  const project = getVoxaProject({
    voxelView,
    hexColors: HEXCOLORS[CURRENTCOLORINDEX],
    encodedVoxels: ENCODEVOXELS,
    textureIds
  });
  return {
    model,
    project
  };
}
function restoreVoxels(encodedVoxels) {
  const readStream = new streamExports.MuReadStream(new Uint8Array(encodedVoxels));
  const sx = readStream.readInt32();
  const sy = readStream.readInt32();
  const sz = readStream.readInt32();
  const voxels = voxelExports.allocVoxels(sx, sy, sz);
  rleCompressExports.decompress(readStream, voxels);
  return voxels;
}
const VOXELS_WARP_OFFSET = 3;
function bakeMesh(voxels) {
  const [sx, sy, sz] = voxels.shape;
  const nx = sx + VOXELS_WARP_OFFSET;
  const ny = sy + VOXELS_WARP_OFFSET;
  const nz = sz + VOXELS_WARP_OFFSET;
  const buffer = poolExports.alloc(2 * nx * ny * nz);
  const voxelsWarp = ndarray(new Uint16Array(buffer), [nx, ny, nz]);
  voxelsWarp.data.fill(0);
  let isEmptyVoxels = true;
  const start = [Infinity, Infinity, Infinity];
  const end = [-Infinity, -Infinity, -Infinity];
  const textureIds = new Set();
  for (let i = 0; i < sx; i++) {
    for (let j = 0; j < sy; j++) {
      for (let k = 0; k < sz; k++) {
        const textureId = voxels.getVoxel(i, j, k);
        if (textureId === 0) {
          continue;
        }
        isEmptyVoxels = false;
        voxelsWarp.set(i + 1, j + 1, k + 1, textureId | 1 << 15);
        min$2(start, start, [i, j, k]);
        max$2(end, end, [i, j, k]);
        textureIds.add(textureId);
      }
    }
  }
  let rawMesh;
  const bounds = [0, 0, 0];
  if (isEmptyVoxels) {
    rawMesh = new Uint8Array(0);
  } else {
    rawMesh = meshExports.greedyComputeMesh(voxelsWarp);
    sub$2(bounds, end, start);
  }
  poolExports.free(voxelsWarp.data.buffer);
  return {
    rawMesh,
    bounds,
    textureIds
  };
}
function getCompactModelRGB(hexColors, currentColorIdx) {
  return hexColors[currentColorIdx].map(item => {
    if (!item) {
      return {
        r: 0,
        g: 0,
        b: 0
      };
    }
    const [r, g, b] = hexToRgb(item);
    return {
      r,
      g,
      b
    };
  });
}
function getMSEList(currentColorIdx, pbr) {
  if (!pbr || !pbr[currentColorIdx]) {
    return;
  }
  return pbr[currentColorIdx].map(item => {
    const [m, s, e] = item;
    return [m, s, e];
  });
}
function hexToRgb(hexStr) {
  const rgb = [0, 0, 0];
  if (hexStr.length === 7 && hexStr[0] == '#') {
    rgb[0] = parseInt(hexStr.slice(1, 3), 16);
    rgb[1] = parseInt(hexStr.slice(3, 5), 16);
    rgb[2] = parseInt(hexStr.slice(5, 7), 16);
  } else if (hexStr.length === 6) {
    rgb[0] = parseInt(hexStr.slice(0, 2), 16);
    rgb[1] = parseInt(hexStr.slice(2, 4), 16);
    rgb[2] = parseInt(hexStr.slice(4, 6), 16);
  }
  return rgb;
}
function rawMeshToCompactModel(rgbList, rawMesh, mseList) {
  const vertexCount = rawMesh.length / 8;
  const surfaceCount = vertexCount / 6;
  const data = new Uint8Array(poolExports.alloc(surfaceCount * 6));
  fillExports.fillArray(data, 0);
  let ptr = 0;
  const min = Math.min;
  const max = Math.max;
  const material = {};
  const normal_slice_table = [{}, {}, {}, {}, {}, {}];
  for (let k = 0; k < 6; k++) {
    for (let i = 0; i < surfaceCount; i++) {
      const normal_code = rawMesh[i * 48 + 5];
      if (normal_code === k) {
        let x_min = Infinity;
        let y_min = Infinity;
        let z_min = Infinity;
        let x_max = 0;
        let y_max = 0;
        let z_max = 0;
        for (let j = 0, m = 0; j < 6; j++, m += 8) {
          x_min = min(rawMesh[i * 48 + m], x_min);
          y_min = min(rawMesh[i * 48 + m + 1], y_min);
          z_min = min(rawMesh[i * 48 + m + 2], z_min);
          x_max = max(rawMesh[i * 48 + m], x_max);
          y_max = max(rawMesh[i * 48 + m + 1], y_max);
          z_max = max(rawMesh[i * 48 + m + 2], z_max);
        }
        let lo_x;
        let lo_y;
        let hi_x;
        let hi_y;
        let z;
        if (normal_code === 0 || normal_code === 1) {
          lo_x = z_min;
          lo_y = y_min;
          hi_x = z_max;
          hi_y = y_max;
          z = x_min;
        } else if (normal_code === 2 || normal_code === 3) {
          lo_x = x_min;
          lo_y = z_min;
          hi_x = x_max;
          hi_y = z_max;
          z = y_min;
        } else if (normal_code === 4 || normal_code === 5) {
          lo_x = y_min;
          lo_y = x_min;
          hi_x = y_max;
          hi_y = x_max;
          z = z_min;
        }
        if (normal_slice_table[normal_code][z] === undefined) {
          normal_slice_table[normal_code][z] = 1;
        } else {
          normal_slice_table[normal_code][z]++;
        }
        const packedAO = rawMesh[i * 48 + 6];
        const material_id = rawMesh[i * 48 + 7];
        data[ptr++] = lo_x;
        data[ptr++] = lo_y;
        data[ptr++] = hi_x;
        data[ptr++] = hi_y;
        data[ptr++] = material_id;
        data[ptr++] = packedAO;
        material[material_id] = {
          rgb: [rgbList[material_id].r, rgbList[material_id].g, rgbList[material_id].b],
          pbr: mseList ? [mseList[material_id][0], mseList[material_id][1], mseList[material_id][2]] : [0, 10, 0]
        };
      }
    }
  }
  let slice_ptr = 0;
  const sliceInfo = [];
  for (let i = 0; i < 6; i++) {
    let z = Object.keys(normal_slice_table[i]).map(v => Number(v));
    z = z.sort((a, b) => a - b);
    sliceInfo[slice_ptr++] = i;
    sliceInfo[slice_ptr++] = z.length;
    for (let j = 0; j < z.length; j++) {
      sliceInfo[slice_ptr++] = z[j];
      sliceInfo[slice_ptr++] = normal_slice_table[i][z[j]];
    }
  }
  return {
    data,
    sliceInfo,
    material,
    surfaceCount
  };
}
function getVoxaModel(params) {
  const {
    rawMesh,
    bounds,
    hexColorTables,
    pbrTables,
    currentColorIdx,
    skinPartNodeId
  } = params;
  const palette = getCompactModelRGB(hexColorTables, currentColorIdx);
  const mse = getMSEList(currentColorIdx, pbrTables);
  const compactModel = rawMeshToCompactModel(palette, rawMesh, mse);
  const mesh = Array.from(compactModelToVbBytes(compactModel));
  poolExports.free(compactModel.data.buffer);
  return {
    bounds,
    meshes: {
      [skinPartNodeId]: mesh
    }
  };
}
function getVoxaProject(params) {
  const {
    textureIds,
    encodedVoxels,
    hexColors,
    voxelView
  } = params;
  const version = 1;
  const {
    palette,
    textureIdRecord
  } = getVoxaPalette({
    hexColors,
    textureIds
  });
  const voxelId = nanoid();
  const voxels = getVoxels({
    voxelId,
    textureIds,
    encodedVoxels,
    textureIdRecord
  });
  const nodes = getNodes({
    voxelId,
    voxelShape: voxelView.shape
  });
  return {
    version,
    voxels,
    nodes,
    palette
  };
}
const DEFAULT_PALETTE_GROUP_ID = 'default';
const DEFAULT_PALETTE_GROUP_NAME = 'Color';
const LOCAL_IDX_OFFSET = 1;
function getVoxaPalette(params) {
  const {
    textureIds,
    hexColors
  } = params;
  const items = [];
  const itemIndices = [];
  const textureIdRecord = {};
  textureIds.forEach(id => {
    const globalIdx = items.length;
    textureIdRecord[id] = globalIdx + LOCAL_IDX_OFFSET;
    const paletteId = nanoid();
    let color = {
      r: 0,
      g: 0,
      b: 0
    };
    const hex = hexColors[id];
    if (hex) {
      const [r, g, b] = hexToRgb(hex);
      color = {
        r,
        g,
        b
      };
    }
    const {
      r,
      g,
      b
    } = color;
    const hsv = RGBToHsv(r, g, b);
    const material = {
      emissive: 0
    };
    items.push({
      id: paletteId,
      color,
      hsv,
      material
    });
    itemIndices.push(globalIdx);
  });
  const groups = {
    [DEFAULT_PALETTE_GROUP_ID]: {
      id: DEFAULT_PALETTE_GROUP_ID,
      name: DEFAULT_PALETTE_GROUP_NAME,
      colorIndices: itemIndices
    }
  };
  const palette = {
    items,
    groups,
    groupList: [DEFAULT_PALETTE_GROUP_ID]
  };
  return {
    palette,
    textureIdRecord
  };
}
const LOCAL_PALETTE_LENGTH = 255;
const EMPTY_VALUE = -1;
function getVoxels(params) {
  const {
    textureIds,
    encodedVoxels,
    textureIdRecord,
    voxelId
  } = params;
  const voxels = {};
  const localPalette = [];
  for (let i = 0; i < LOCAL_PALETTE_LENGTH; i++) {
    if (!textureIds.has(i + 1)) {
      localPalette.push(EMPTY_VALUE);
      continue;
    }
    localPalette.push(textureIdRecord[i + 1] - 1);
  }
  voxels[voxelId] = {
    id: voxelId,
    encodedView: encodedVoxels,
    localPalette
  };
  return voxels;
}
const ROOT_NODE_ID = 'ROOT';
const ROOT_NODE_NAME = 'Root';
function getNodes(params) {
  const {
    voxelId,
    voxelShape
  } = params;
  const skinPartNodeId = nanoid();
  const rootNode = {
    id: ROOT_NODE_ID,
    name: ROOT_NODE_NAME,
    type: NodeType.Root,
    childrenIds: [skinPartNodeId]
  };
  const pivotVec3 = create$4();
  scale$4(pivotVec3, voxelShape, -0.5);
  const [px, py, pz] = pivotVec3;
  const nodes = {
    [ROOT_NODE_ID]: rootNode,
    [skinPartNodeId]: {
      id: skinPartNodeId,
      name: `name${skinPartNodeId}`,
      type: NodeType.SkinPart,
      parentId: ROOT_NODE_ID,
      pivot: [px, py, pz],
      position: [0, -py, 0],
      quaternion: [0, 0, 0, 1],
      voxelId
    }
  };
  return nodes;
}
function RGBToHsv(r, g, b) {
  r = r / 255;
  g = g / 255;
  b = b / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s;
  const v = max;
  const d = max - min;
  s = max == 0 ? 0 : d / max;
  if (max == min) {
    h = 0;
  } else {
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }
  return [Math.round(h * 360), Math.round(s * 100), Math.round(v * 100)];
}

export { parseVbFile };
