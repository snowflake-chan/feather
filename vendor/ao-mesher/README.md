# ao-mesher

A voxel mesher for ndarrays that handles ambient occlusion and transparency.

## 在本工作区使用

包名为 `@box/ao-mesher`，随根目录 `npm run install:all` 安装，直接使用已提交的 `mesh.js`，无需单独构建。下文保留算法接口与原始署名。

### `require("ao-mesher")(array)`

Constructs a mesh for `array`.

- `array` is a 3D ndarray of voxels

**Returns** A uint8array encoding the mesh, or else null if there were no facets. This is in the same format that `ao-shader` expects.

# Credits

(c) 2013 Mikola Lysenko. MIT License
