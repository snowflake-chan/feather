export enum ChunkVisibilityFlags {
    POS_X = (1 << 0),
    NEG_X = (1 << 1),
    POS_Y = (1 << 2),
    NEG_Y = (1 << 3),
    POS_Z = (1 << 4),
    NEG_Z = (1 << 5),

    MASK = (1 << 6) - 1,
}