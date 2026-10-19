import { MuStruct, MuVarint, MuUTF8, MuUnion, MuVoid, MuBoolean, MuArray, MuQuantizedFloat } from '@box/mudb/schema';
export declare const RGBASchema: MuStruct<{
    r: MuQuantizedFloat;
    g: MuQuantizedFloat;
    b: MuQuantizedFloat;
    a: MuQuantizedFloat;
}>;
export declare const XYZSchema: MuStruct<{
    x: MuQuantizedFloat;
    y: MuQuantizedFloat;
    z: MuQuantizedFloat;
}>;
export declare const DialogCommonConfigSchema: MuStruct<{
    title: MuUTF8;
    content: MuUTF8;
    titleBackgroundColor: MuStruct<{
        r: MuQuantizedFloat;
        g: MuQuantizedFloat;
        b: MuQuantizedFloat;
        a: MuQuantizedFloat;
    }>;
    titleTextColor: MuStruct<{
        r: MuQuantizedFloat;
        g: MuQuantizedFloat;
        b: MuQuantizedFloat;
        a: MuQuantizedFloat;
    }>;
    contentBackgroundColor: MuStruct<{
        r: MuQuantizedFloat;
        g: MuQuantizedFloat;
        b: MuQuantizedFloat;
        a: MuQuantizedFloat;
    }>;
    contentTextColor: MuStruct<{
        r: MuQuantizedFloat;
        g: MuQuantizedFloat;
        b: MuQuantizedFloat;
        a: MuQuantizedFloat;
    }>;
    lookTargetEnabled: MuBoolean;
    lookTargetEntity: MuVarint;
    lookTargetOffset: MuStruct<{
        x: MuQuantizedFloat;
        y: MuQuantizedFloat;
        z: MuQuantizedFloat;
    }>;
    lookUpEnabled: MuBoolean;
    lookUp: MuStruct<{
        x: MuQuantizedFloat;
        y: MuQuantizedFloat;
        z: MuQuantizedFloat;
    }>;
    lookEyeEnabled: MuBoolean;
    lookEyeEntity: MuVarint;
    lookEyeOffset: MuStruct<{
        x: MuQuantizedFloat;
        y: MuQuantizedFloat;
        z: MuQuantizedFloat;
    }>;
}>;
export type DialogCommonConfig = typeof DialogCommonConfigSchema.identity;
export declare const TextDialogConfigSchema: MuStruct<{
    common: MuStruct<{
        title: MuUTF8;
        content: MuUTF8;
        titleBackgroundColor: MuStruct<{
            r: MuQuantizedFloat;
            g: MuQuantizedFloat;
            b: MuQuantizedFloat;
            a: MuQuantizedFloat;
        }>;
        titleTextColor: MuStruct<{
            r: MuQuantizedFloat;
            g: MuQuantizedFloat;
            b: MuQuantizedFloat;
            a: MuQuantizedFloat;
        }>;
        contentBackgroundColor: MuStruct<{
            r: MuQuantizedFloat;
            g: MuQuantizedFloat;
            b: MuQuantizedFloat;
            a: MuQuantizedFloat;
        }>;
        contentTextColor: MuStruct<{
            r: MuQuantizedFloat;
            g: MuQuantizedFloat;
            b: MuQuantizedFloat;
            a: MuQuantizedFloat;
        }>;
        lookTargetEnabled: MuBoolean;
        lookTargetEntity: MuVarint;
        lookTargetOffset: MuStruct<{
            x: MuQuantizedFloat;
            y: MuQuantizedFloat;
            z: MuQuantizedFloat;
        }>;
        lookUpEnabled: MuBoolean;
        lookUp: MuStruct<{
            x: MuQuantizedFloat;
            y: MuQuantizedFloat;
            z: MuQuantizedFloat;
        }>;
        lookEyeEnabled: MuBoolean;
        lookEyeEntity: MuVarint;
        lookEyeOffset: MuStruct<{
            x: MuQuantizedFloat;
            y: MuQuantizedFloat;
            z: MuQuantizedFloat;
        }>;
    }>;
    hasArrow: MuBoolean;
}>;
export type TextDialogConfig = typeof TextDialogConfigSchema.identity;
export declare const InputDialogConfigSchema: MuStruct<{
    common: MuStruct<{
        title: MuUTF8;
        content: MuUTF8;
        titleBackgroundColor: MuStruct<{
            r: MuQuantizedFloat;
            g: MuQuantizedFloat;
            b: MuQuantizedFloat;
            a: MuQuantizedFloat;
        }>;
        titleTextColor: MuStruct<{
            r: MuQuantizedFloat;
            g: MuQuantizedFloat;
            b: MuQuantizedFloat;
            a: MuQuantizedFloat;
        }>;
        contentBackgroundColor: MuStruct<{
            r: MuQuantizedFloat;
            g: MuQuantizedFloat;
            b: MuQuantizedFloat;
            a: MuQuantizedFloat;
        }>;
        contentTextColor: MuStruct<{
            r: MuQuantizedFloat;
            g: MuQuantizedFloat;
            b: MuQuantizedFloat;
            a: MuQuantizedFloat;
        }>;
        lookTargetEnabled: MuBoolean;
        lookTargetEntity: MuVarint;
        lookTargetOffset: MuStruct<{
            x: MuQuantizedFloat;
            y: MuQuantizedFloat;
            z: MuQuantizedFloat;
        }>;
        lookUpEnabled: MuBoolean;
        lookUp: MuStruct<{
            x: MuQuantizedFloat;
            y: MuQuantizedFloat;
            z: MuQuantizedFloat;
        }>;
        lookEyeEnabled: MuBoolean;
        lookEyeEntity: MuVarint;
        lookEyeOffset: MuStruct<{
            x: MuQuantizedFloat;
            y: MuQuantizedFloat;
            z: MuQuantizedFloat;
        }>;
    }>;
    placeholder: MuUTF8;
    confirmText: MuUTF8;
}>;
export type InputDialogConfig = typeof InputDialogConfigSchema.identity;
export declare const SelectDialogConfigSchema: MuStruct<{
    common: MuStruct<{
        title: MuUTF8;
        content: MuUTF8;
        titleBackgroundColor: MuStruct<{
            r: MuQuantizedFloat;
            g: MuQuantizedFloat;
            b: MuQuantizedFloat;
            a: MuQuantizedFloat;
        }>;
        titleTextColor: MuStruct<{
            r: MuQuantizedFloat;
            g: MuQuantizedFloat;
            b: MuQuantizedFloat;
            a: MuQuantizedFloat;
        }>;
        contentBackgroundColor: MuStruct<{
            r: MuQuantizedFloat;
            g: MuQuantizedFloat;
            b: MuQuantizedFloat;
            a: MuQuantizedFloat;
        }>;
        contentTextColor: MuStruct<{
            r: MuQuantizedFloat;
            g: MuQuantizedFloat;
            b: MuQuantizedFloat;
            a: MuQuantizedFloat;
        }>;
        lookTargetEnabled: MuBoolean;
        lookTargetEntity: MuVarint;
        lookTargetOffset: MuStruct<{
            x: MuQuantizedFloat;
            y: MuQuantizedFloat;
            z: MuQuantizedFloat;
        }>;
        lookUpEnabled: MuBoolean;
        lookUp: MuStruct<{
            x: MuQuantizedFloat;
            y: MuQuantizedFloat;
            z: MuQuantizedFloat;
        }>;
        lookEyeEnabled: MuBoolean;
        lookEyeEntity: MuVarint;
        lookEyeOffset: MuStruct<{
            x: MuQuantizedFloat;
            y: MuQuantizedFloat;
            z: MuQuantizedFloat;
        }>;
    }>;
    options: MuArray<MuUTF8>;
}>;
export type SelectDialogConfig = typeof SelectDialogConfigSchema.identity;
export declare const DialogConfigSchema: MuUnion<{
    text: MuStruct<{
        common: MuStruct<{
            title: MuUTF8;
            content: MuUTF8;
            titleBackgroundColor: MuStruct<{
                r: MuQuantizedFloat;
                g: MuQuantizedFloat;
                b: MuQuantizedFloat;
                a: MuQuantizedFloat;
            }>;
            titleTextColor: MuStruct<{
                r: MuQuantizedFloat;
                g: MuQuantizedFloat;
                b: MuQuantizedFloat;
                a: MuQuantizedFloat;
            }>;
            contentBackgroundColor: MuStruct<{
                r: MuQuantizedFloat;
                g: MuQuantizedFloat;
                b: MuQuantizedFloat;
                a: MuQuantizedFloat;
            }>;
            contentTextColor: MuStruct<{
                r: MuQuantizedFloat;
                g: MuQuantizedFloat;
                b: MuQuantizedFloat;
                a: MuQuantizedFloat;
            }>;
            lookTargetEnabled: MuBoolean;
            lookTargetEntity: MuVarint;
            lookTargetOffset: MuStruct<{
                x: MuQuantizedFloat;
                y: MuQuantizedFloat;
                z: MuQuantizedFloat;
            }>;
            lookUpEnabled: MuBoolean;
            lookUp: MuStruct<{
                x: MuQuantizedFloat;
                y: MuQuantizedFloat;
                z: MuQuantizedFloat;
            }>;
            lookEyeEnabled: MuBoolean;
            lookEyeEntity: MuVarint;
            lookEyeOffset: MuStruct<{
                x: MuQuantizedFloat;
                y: MuQuantizedFloat;
                z: MuQuantizedFloat;
            }>;
        }>;
        hasArrow: MuBoolean;
    }>;
    input: MuStruct<{
        common: MuStruct<{
            title: MuUTF8;
            content: MuUTF8;
            titleBackgroundColor: MuStruct<{
                r: MuQuantizedFloat;
                g: MuQuantizedFloat;
                b: MuQuantizedFloat;
                a: MuQuantizedFloat;
            }>;
            titleTextColor: MuStruct<{
                r: MuQuantizedFloat;
                g: MuQuantizedFloat;
                b: MuQuantizedFloat;
                a: MuQuantizedFloat;
            }>;
            contentBackgroundColor: MuStruct<{
                r: MuQuantizedFloat;
                g: MuQuantizedFloat;
                b: MuQuantizedFloat;
                a: MuQuantizedFloat;
            }>;
            contentTextColor: MuStruct<{
                r: MuQuantizedFloat;
                g: MuQuantizedFloat;
                b: MuQuantizedFloat;
                a: MuQuantizedFloat;
            }>;
            lookTargetEnabled: MuBoolean;
            lookTargetEntity: MuVarint;
            lookTargetOffset: MuStruct<{
                x: MuQuantizedFloat;
                y: MuQuantizedFloat;
                z: MuQuantizedFloat;
            }>;
            lookUpEnabled: MuBoolean;
            lookUp: MuStruct<{
                x: MuQuantizedFloat;
                y: MuQuantizedFloat;
                z: MuQuantizedFloat;
            }>;
            lookEyeEnabled: MuBoolean;
            lookEyeEntity: MuVarint;
            lookEyeOffset: MuStruct<{
                x: MuQuantizedFloat;
                y: MuQuantizedFloat;
                z: MuQuantizedFloat;
            }>;
        }>;
        placeholder: MuUTF8;
        confirmText: MuUTF8;
    }>;
    select: MuStruct<{
        common: MuStruct<{
            title: MuUTF8;
            content: MuUTF8;
            titleBackgroundColor: MuStruct<{
                r: MuQuantizedFloat;
                g: MuQuantizedFloat;
                b: MuQuantizedFloat;
                a: MuQuantizedFloat;
            }>;
            titleTextColor: MuStruct<{
                r: MuQuantizedFloat;
                g: MuQuantizedFloat;
                b: MuQuantizedFloat;
                a: MuQuantizedFloat;
            }>;
            contentBackgroundColor: MuStruct<{
                r: MuQuantizedFloat;
                g: MuQuantizedFloat;
                b: MuQuantizedFloat;
                a: MuQuantizedFloat;
            }>;
            contentTextColor: MuStruct<{
                r: MuQuantizedFloat;
                g: MuQuantizedFloat;
                b: MuQuantizedFloat;
                a: MuQuantizedFloat;
            }>;
            lookTargetEnabled: MuBoolean;
            lookTargetEntity: MuVarint;
            lookTargetOffset: MuStruct<{
                x: MuQuantizedFloat;
                y: MuQuantizedFloat;
                z: MuQuantizedFloat;
            }>;
            lookUpEnabled: MuBoolean;
            lookUp: MuStruct<{
                x: MuQuantizedFloat;
                y: MuQuantizedFloat;
                z: MuQuantizedFloat;
            }>;
            lookEyeEnabled: MuBoolean;
            lookEyeEntity: MuVarint;
            lookEyeOffset: MuStruct<{
                x: MuQuantizedFloat;
                y: MuQuantizedFloat;
                z: MuQuantizedFloat;
            }>;
        }>;
        options: MuArray<MuUTF8>;
    }>;
}>;
export type DialogConfig = typeof DialogConfigSchema.identity;
declare const DialogSelectResultSchema: MuStruct<{
    index: MuVarint;
    value: MuUTF8;
}>;
export type DialogSelectResult = typeof DialogSelectResultSchema.identity;
export declare const DialogResultSchema: MuUnion<{
    close: MuVoid;
    text: MuUTF8;
    input: MuUTF8;
    select: MuStruct<{
        index: MuVarint;
        value: MuUTF8;
    }>;
}>;
export type DialogResult = typeof DialogResultSchema.identity;
export declare const OpenDialogSchema: MuStruct<{
    rpcId: MuVarint;
    config: MuUnion<{
        text: MuStruct<{
            common: MuStruct<{
                title: MuUTF8;
                content: MuUTF8;
                titleBackgroundColor: MuStruct<{
                    r: MuQuantizedFloat;
                    g: MuQuantizedFloat;
                    b: MuQuantizedFloat;
                    a: MuQuantizedFloat;
                }>;
                titleTextColor: MuStruct<{
                    r: MuQuantizedFloat;
                    g: MuQuantizedFloat;
                    b: MuQuantizedFloat;
                    a: MuQuantizedFloat;
                }>;
                contentBackgroundColor: MuStruct<{
                    r: MuQuantizedFloat;
                    g: MuQuantizedFloat;
                    b: MuQuantizedFloat;
                    a: MuQuantizedFloat;
                }>;
                contentTextColor: MuStruct<{
                    r: MuQuantizedFloat;
                    g: MuQuantizedFloat;
                    b: MuQuantizedFloat;
                    a: MuQuantizedFloat;
                }>;
                lookTargetEnabled: MuBoolean;
                lookTargetEntity: MuVarint;
                lookTargetOffset: MuStruct<{
                    x: MuQuantizedFloat;
                    y: MuQuantizedFloat;
                    z: MuQuantizedFloat;
                }>;
                lookUpEnabled: MuBoolean;
                lookUp: MuStruct<{
                    x: MuQuantizedFloat;
                    y: MuQuantizedFloat;
                    z: MuQuantizedFloat;
                }>;
                lookEyeEnabled: MuBoolean;
                lookEyeEntity: MuVarint;
                lookEyeOffset: MuStruct<{
                    x: MuQuantizedFloat;
                    y: MuQuantizedFloat;
                    z: MuQuantizedFloat;
                }>;
            }>;
            hasArrow: MuBoolean;
        }>;
        input: MuStruct<{
            common: MuStruct<{
                title: MuUTF8;
                content: MuUTF8;
                titleBackgroundColor: MuStruct<{
                    r: MuQuantizedFloat;
                    g: MuQuantizedFloat;
                    b: MuQuantizedFloat;
                    a: MuQuantizedFloat;
                }>;
                titleTextColor: MuStruct<{
                    r: MuQuantizedFloat;
                    g: MuQuantizedFloat;
                    b: MuQuantizedFloat;
                    a: MuQuantizedFloat;
                }>;
                contentBackgroundColor: MuStruct<{
                    r: MuQuantizedFloat;
                    g: MuQuantizedFloat;
                    b: MuQuantizedFloat;
                    a: MuQuantizedFloat;
                }>;
                contentTextColor: MuStruct<{
                    r: MuQuantizedFloat;
                    g: MuQuantizedFloat;
                    b: MuQuantizedFloat;
                    a: MuQuantizedFloat;
                }>;
                lookTargetEnabled: MuBoolean;
                lookTargetEntity: MuVarint;
                lookTargetOffset: MuStruct<{
                    x: MuQuantizedFloat;
                    y: MuQuantizedFloat;
                    z: MuQuantizedFloat;
                }>;
                lookUpEnabled: MuBoolean;
                lookUp: MuStruct<{
                    x: MuQuantizedFloat;
                    y: MuQuantizedFloat;
                    z: MuQuantizedFloat;
                }>;
                lookEyeEnabled: MuBoolean;
                lookEyeEntity: MuVarint;
                lookEyeOffset: MuStruct<{
                    x: MuQuantizedFloat;
                    y: MuQuantizedFloat;
                    z: MuQuantizedFloat;
                }>;
            }>;
            placeholder: MuUTF8;
            confirmText: MuUTF8;
        }>;
        select: MuStruct<{
            common: MuStruct<{
                title: MuUTF8;
                content: MuUTF8;
                titleBackgroundColor: MuStruct<{
                    r: MuQuantizedFloat;
                    g: MuQuantizedFloat;
                    b: MuQuantizedFloat;
                    a: MuQuantizedFloat;
                }>;
                titleTextColor: MuStruct<{
                    r: MuQuantizedFloat;
                    g: MuQuantizedFloat;
                    b: MuQuantizedFloat;
                    a: MuQuantizedFloat;
                }>;
                contentBackgroundColor: MuStruct<{
                    r: MuQuantizedFloat;
                    g: MuQuantizedFloat;
                    b: MuQuantizedFloat;
                    a: MuQuantizedFloat;
                }>;
                contentTextColor: MuStruct<{
                    r: MuQuantizedFloat;
                    g: MuQuantizedFloat;
                    b: MuQuantizedFloat;
                    a: MuQuantizedFloat;
                }>;
                lookTargetEnabled: MuBoolean;
                lookTargetEntity: MuVarint;
                lookTargetOffset: MuStruct<{
                    x: MuQuantizedFloat;
                    y: MuQuantizedFloat;
                    z: MuQuantizedFloat;
                }>;
                lookUpEnabled: MuBoolean;
                lookUp: MuStruct<{
                    x: MuQuantizedFloat;
                    y: MuQuantizedFloat;
                    z: MuQuantizedFloat;
                }>;
                lookEyeEnabled: MuBoolean;
                lookEyeEntity: MuVarint;
                lookEyeOffset: MuStruct<{
                    x: MuQuantizedFloat;
                    y: MuQuantizedFloat;
                    z: MuQuantizedFloat;
                }>;
            }>;
            options: MuArray<MuUTF8>;
        }>;
    }>;
}>;
export type OpenDialog = typeof OpenDialogSchema.identity;
export declare const CloseDialogSchema: MuStruct<{
    rpcId: MuVarint;
    result: MuUnion<{
        close: MuVoid;
        text: MuUTF8;
        input: MuUTF8;
        select: MuStruct<{
            index: MuVarint;
            value: MuUTF8;
        }>;
    }>;
}>;
export declare const DialogProtocol: {
    name: string;
    client: {
        open: MuStruct<{
            rpcId: MuVarint;
            config: MuUnion<{
                text: MuStruct<{
                    common: MuStruct<{
                        title: MuUTF8;
                        content: MuUTF8;
                        titleBackgroundColor: MuStruct<{
                            r: MuQuantizedFloat;
                            g: MuQuantizedFloat;
                            b: MuQuantizedFloat;
                            a: MuQuantizedFloat;
                        }>;
                        titleTextColor: MuStruct<{
                            r: MuQuantizedFloat;
                            g: MuQuantizedFloat;
                            b: MuQuantizedFloat;
                            a: MuQuantizedFloat;
                        }>;
                        contentBackgroundColor: MuStruct<{
                            r: MuQuantizedFloat;
                            g: MuQuantizedFloat;
                            b: MuQuantizedFloat;
                            a: MuQuantizedFloat;
                        }>;
                        contentTextColor: MuStruct<{
                            r: MuQuantizedFloat;
                            g: MuQuantizedFloat;
                            b: MuQuantizedFloat;
                            a: MuQuantizedFloat;
                        }>;
                        lookTargetEnabled: MuBoolean;
                        lookTargetEntity: MuVarint;
                        lookTargetOffset: MuStruct<{
                            x: MuQuantizedFloat;
                            y: MuQuantizedFloat;
                            z: MuQuantizedFloat;
                        }>;
                        lookUpEnabled: MuBoolean;
                        lookUp: MuStruct<{
                            x: MuQuantizedFloat;
                            y: MuQuantizedFloat;
                            z: MuQuantizedFloat;
                        }>;
                        lookEyeEnabled: MuBoolean;
                        lookEyeEntity: MuVarint;
                        lookEyeOffset: MuStruct<{
                            x: MuQuantizedFloat;
                            y: MuQuantizedFloat;
                            z: MuQuantizedFloat;
                        }>;
                    }>;
                    hasArrow: MuBoolean;
                }>;
                input: MuStruct<{
                    common: MuStruct<{
                        title: MuUTF8;
                        content: MuUTF8;
                        titleBackgroundColor: MuStruct<{
                            r: MuQuantizedFloat;
                            g: MuQuantizedFloat;
                            b: MuQuantizedFloat;
                            a: MuQuantizedFloat;
                        }>;
                        titleTextColor: MuStruct<{
                            r: MuQuantizedFloat;
                            g: MuQuantizedFloat;
                            b: MuQuantizedFloat;
                            a: MuQuantizedFloat;
                        }>;
                        contentBackgroundColor: MuStruct<{
                            r: MuQuantizedFloat;
                            g: MuQuantizedFloat;
                            b: MuQuantizedFloat;
                            a: MuQuantizedFloat;
                        }>;
                        contentTextColor: MuStruct<{
                            r: MuQuantizedFloat;
                            g: MuQuantizedFloat;
                            b: MuQuantizedFloat;
                            a: MuQuantizedFloat;
                        }>;
                        lookTargetEnabled: MuBoolean;
                        lookTargetEntity: MuVarint;
                        lookTargetOffset: MuStruct<{
                            x: MuQuantizedFloat;
                            y: MuQuantizedFloat;
                            z: MuQuantizedFloat;
                        }>;
                        lookUpEnabled: MuBoolean;
                        lookUp: MuStruct<{
                            x: MuQuantizedFloat;
                            y: MuQuantizedFloat;
                            z: MuQuantizedFloat;
                        }>;
                        lookEyeEnabled: MuBoolean;
                        lookEyeEntity: MuVarint;
                        lookEyeOffset: MuStruct<{
                            x: MuQuantizedFloat;
                            y: MuQuantizedFloat;
                            z: MuQuantizedFloat;
                        }>;
                    }>;
                    placeholder: MuUTF8;
                    confirmText: MuUTF8;
                }>;
                select: MuStruct<{
                    common: MuStruct<{
                        title: MuUTF8;
                        content: MuUTF8;
                        titleBackgroundColor: MuStruct<{
                            r: MuQuantizedFloat;
                            g: MuQuantizedFloat;
                            b: MuQuantizedFloat;
                            a: MuQuantizedFloat;
                        }>;
                        titleTextColor: MuStruct<{
                            r: MuQuantizedFloat;
                            g: MuQuantizedFloat;
                            b: MuQuantizedFloat;
                            a: MuQuantizedFloat;
                        }>;
                        contentBackgroundColor: MuStruct<{
                            r: MuQuantizedFloat;
                            g: MuQuantizedFloat;
                            b: MuQuantizedFloat;
                            a: MuQuantizedFloat;
                        }>;
                        contentTextColor: MuStruct<{
                            r: MuQuantizedFloat;
                            g: MuQuantizedFloat;
                            b: MuQuantizedFloat;
                            a: MuQuantizedFloat;
                        }>;
                        lookTargetEnabled: MuBoolean;
                        lookTargetEntity: MuVarint;
                        lookTargetOffset: MuStruct<{
                            x: MuQuantizedFloat;
                            y: MuQuantizedFloat;
                            z: MuQuantizedFloat;
                        }>;
                        lookUpEnabled: MuBoolean;
                        lookUp: MuStruct<{
                            x: MuQuantizedFloat;
                            y: MuQuantizedFloat;
                            z: MuQuantizedFloat;
                        }>;
                        lookEyeEnabled: MuBoolean;
                        lookEyeEntity: MuVarint;
                        lookEyeOffset: MuStruct<{
                            x: MuQuantizedFloat;
                            y: MuQuantizedFloat;
                            z: MuQuantizedFloat;
                        }>;
                    }>;
                    options: MuArray<MuUTF8>;
                }>;
            }>;
        }>;
        cancelDialogs: MuVoid;
        cancelDialog: MuVarint;
    };
    server: {
        close: MuStruct<{
            rpcId: MuVarint;
            result: MuUnion<{
                close: MuVoid;
                text: MuUTF8;
                input: MuUTF8;
                select: MuStruct<{
                    index: MuVarint;
                    value: MuUTF8;
                }>;
            }>;
        }>;
    };
};
export {};
//# sourceMappingURL=dialog-protocol.d.ts.map