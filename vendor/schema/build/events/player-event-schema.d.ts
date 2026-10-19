import { MuStruct, MuVarint, MuBoolean } from '@box/mudb/schema';
export declare const PlayerInputEventSchema: MuStruct<{
    id: MuVarint;
    button: MuVarint;
    press: MuBoolean;
    position: import("@box/mudb/schema").MuSchema<import("gl-matrix").vec3>;
}>;
export declare const PlayerEventSchema: MuStruct<{
    id: MuVarint;
    position: import("@box/mudb/schema").MuSchema<import("gl-matrix").vec3>;
}>;
//# sourceMappingURL=player-event-schema.d.ts.map