import { MuStruct, MuBoolean, MuUTF8 } from '@box/mudb/schema';
import { REGLSchema, REGLLoaderSchema, REGLElementSchema, REGLVAOSchema } from '../../utils/regl-schema';

export const GLStateSchema = new MuStruct({
    contextLost: new MuBoolean(false),

    regl: REGLSchema,
    reglLoader: REGLLoaderSchema,

    floatBufferType: new MuUTF8('half float'),
    floatBufferFilter: new MuUTF8('linear'),

    hasTextureLOD: new MuBoolean(false),
    hasInstancing: new MuBoolean(false),
    mipmapEnabled: new MuBoolean(true),

    smallElements: REGLElementSchema,
    bigElements: REGLElementSchema,

    triangle: REGLVAOSchema,
});

export type GLState = typeof GLStateSchema.identity;