import { MuStruct, MuVarint, MuSchema, MuBoolean, MuDate, MuArray, MuOption, MuUnion, MuUTF8, MuUint8 } from '@box/mudb/schema';
import { DB } from '../database-type';
import { MuRPCClient } from '@box/mudb/rpc/client';
import { MuNullable } from './nullable-schema';
import { UserTag } from './user-protocol';
export declare const ContentTypeSchema: MuSchema<DB.ContentType>;
export declare const ContentStatusSchema: MuSchema<DB.ContentStatus>;
export declare const ContentQualitySchema: MuSchema<DB.ContentQuality>;
export declare const ProjectReviewInfoSchema: MuStruct<{
    reason: MuArray<MuUint8>;
    title: MuUTF8;
    details: MuUTF8;
}>;
export declare enum ContentCommentStatus {
    normal = 0,
    ownerDisabled = 1
}
export declare const ContentSchema: MuStruct<{
    created_at: MuDate;
    describe: MuUTF8;
    hash: MuUTF8;
    content_id: MuVarint;
    image: MuUTF8;
    name: MuUTF8;
    version: MuVarint;
    version_id: MuVarint;
    play_count: MuVarint;
    view_count: MuVarint;
    url: MuUTF8;
    audio_hash: MuOption<MuUTF8>;
    duration: MuOption<MuVarint>;
}>;
export declare const PublicContentListSchema: MuStruct<{
    author_id: MuVarint;
    author_avatar: MuUTF8;
    author_name: MuUTF8;
    author_tag: MuSchema<UserTag>;
    play_container_name: MuNullable<MuUTF8>;
    edit_container_name: MuNullable<MuUTF8>;
    comment_status: MuSchema<ContentCommentStatus>;
    comment_count: MuVarint;
    created_at: MuDate;
    describe: MuUTF8;
    hash: MuUTF8;
    content_id: MuVarint;
    image: MuUTF8;
    name: MuUTF8;
    version: MuVarint;
    version_id: MuVarint;
    play_count: MuVarint;
    view_count: MuVarint;
    url: MuUTF8;
    audio_hash: MuOption<MuUTF8>;
    duration: MuOption<MuVarint>;
}>;
export declare const PublicCollaboratorDisplaySchema: MuArray<MuStruct<{
    id: MuVarint;
    avatar: MuUTF8;
    displayname: MuUTF8;
    is_following: MuBoolean;
}>>;
export declare const PublicContentSchema: MuStruct<{
    collaborator: MuOption<MuArray<MuStruct<{
        id: MuVarint;
        avatar: MuUTF8;
        displayname: MuUTF8;
        is_following: MuBoolean;
    }>>>;
    follower_count: MuVarint;
    following_count: MuVarint;
    is_following: MuBoolean;
    author_id: MuVarint;
    author_avatar: MuUTF8;
    author_name: MuUTF8;
    author_tag: MuSchema<UserTag>;
    play_container_name: MuNullable<MuUTF8>;
    edit_container_name: MuNullable<MuUTF8>;
    comment_status: MuSchema<ContentCommentStatus>;
    comment_count: MuVarint;
    created_at: MuDate;
    describe: MuUTF8;
    hash: MuUTF8;
    content_id: MuVarint;
    image: MuUTF8;
    name: MuUTF8;
    version: MuVarint;
    version_id: MuVarint;
    play_count: MuVarint;
    view_count: MuVarint;
    url: MuUTF8;
    audio_hash: MuOption<MuUTF8>;
    duration: MuOption<MuVarint>;
}>;
export declare const PrivateContentSchema: MuStruct<{
    on_publish_version: MuVarint;
    published_version_id: MuVarint;
    status: MuVarint;
    status_version: MuVarint;
    review_info: MuNullable<MuOption<MuStruct<{
        reason: MuArray<MuUint8>;
        title: MuUTF8;
        details: MuUTF8;
    }>>>;
    type: MuSchema<DB.ContentType>;
    play_container_name: MuNullable<MuUTF8>;
    edit_container_name: MuNullable<MuUTF8>;
    created_at: MuDate;
    describe: MuUTF8;
    hash: MuUTF8;
    content_id: MuVarint;
    image: MuUTF8;
    name: MuUTF8;
    version: MuVarint;
    version_id: MuVarint;
    play_count: MuVarint;
    view_count: MuVarint;
    url: MuUTF8;
    audio_hash: MuOption<MuUTF8>;
    duration: MuOption<MuVarint>;
}>;
export declare const ReviewContentSchema: MuStruct<{
    content_id: MuVarint;
    type: MuSchema<DB.ContentType>;
    image: MuUTF8;
    name: MuUTF8;
    shortname: MuUTF8;
    describe: MuUTF8;
    hash: MuUTF8;
    quality: MuSchema<DB.ContentQuality>;
    author_id: MuVarint;
    author_name: MuUTF8;
    version: MuVarint;
    container_name: MuNullable<MuUTF8>;
    reason: MuNullable<MuSchema<{
        title: string;
        details: string;
    }>>;
    reviewer_name: MuUTF8;
    review_at: MuOption<MuNullable<MuDate>>;
    status_updated_at: MuOption<MuNullable<MuDate>>;
    published_version_id: MuVarint;
    notice: MuUTF8;
    audio_hash: MuUTF8;
    base_info: MuNullable<MuStruct<{
        image: MuNullable<MuStruct<{
            scene: MuUTF8;
            label: MuSchema<import("../service/audit-schema").Label>;
            suggestion: MuSchema<import("../service/audit-schema").Suggestion>;
            rate: MuVarint;
            details: MuOption<MuArray<MuStruct<{
                startTime: MuVarint;
                endTime: MuVarint;
                text: MuUTF8;
                label: MuSchema<import("../service/audit-schema").Label>;
                hintWords: MuOption<MuArray<MuUTF8>>;
                keyword: MuUTF8;
                libName: MuUTF8;
            }>>>;
        }>>;
        audio_hash: MuNullable<MuStruct<{
            scene: MuUTF8;
            label: MuSchema<import("../service/audit-schema").Label>;
            suggestion: MuSchema<import("../service/audit-schema").Suggestion>;
            rate: MuVarint;
            details: MuOption<MuArray<MuStruct<{
                startTime: MuVarint;
                endTime: MuVarint;
                text: MuUTF8;
                label: MuSchema<import("../service/audit-schema").Label>;
                hintWords: MuOption<MuArray<MuUTF8>>;
                keyword: MuUTF8;
                libName: MuUTF8;
            }>>>;
        }>>;
    }>>;
}>;
export declare const HomeRecommendSchema: MuStruct<{
    content_id: MuVarint;
    name: MuUTF8;
    hash: MuUTF8;
    image: MuUTF8;
    version: MuVarint;
    version_id: MuVarint;
    audio_hash: MuUTF8;
    duration: MuVarint;
    view_count: MuVarint;
    author_id: MuVarint;
    author_name: MuUTF8;
    author_avatar: MuUTF8;
    container_name: MuNullable<MuUTF8>;
}>;
export declare const ContentReportSchema: MuStruct<{
    id: MuVarint;
    type: MuSchema<DB.ContentType>;
    name: MuUTF8;
    image: MuUTF8;
    content_id: MuVarint;
    content_version: MuVarint;
    reporter_id: MuVarint;
    reporter_name: MuUTF8;
    reporter_avatar: MuUTF8;
    report_reason: MuSchema<DB.ViolationType>;
    report_date: MuDate;
    report_status: MuSchema<DB.ReportStatus>;
}>;
export declare const ContentHistorySchema: MuStruct<{
    id: MuVarint;
    created_at: MuNullable<MuDate>;
    updated_at: MuNullable<MuDate>;
    content_id: MuVarint;
    status: MuSchema<DB.ContentStatus>;
    version: MuVarint;
    review_info: MuNullable<MuOption<MuStruct<{
        reason: MuArray<MuUint8>;
        title: MuUTF8;
        details: MuUTF8;
    }>>>;
    version_id: MuVarint;
    auditor_id: MuVarint;
}>;
type ContentListFilter = 'featured' | 'hot' | 'latest' | 'collected' | 'new_trend' | 'shared';
export declare enum ChooseType {
    editor = 0,// old one
    new_trend = 1
}
export declare enum ManuallyRejectType {
    none = 0,
    image = 1,
    audio = 2
}
export declare enum ReviewOrder {
    byPublishTime = 0,
    byReviewTime = 1
}
export declare const ContentRPCSchema: {
    name: string;
    api: {
        search: {
            arg: MuSchema<{
                type: DB.ContentType;
                isPublic: boolean;
                keyword: string;
                offset: number;
                limit: number;
            }>;
            ret: MuStruct<{
                rows: MuArray<MuStruct<{
                    count: MuVarint;
                    on_publish_version: MuVarint;
                    published_version_id: MuVarint;
                    status: MuVarint;
                    status_version: MuVarint;
                    review_info: MuNullable<MuOption<MuStruct<{
                        reason: MuArray<MuUint8>;
                        title: MuUTF8;
                        details: MuUTF8;
                    }>>>;
                    type: MuSchema<DB.ContentType>;
                    play_container_name: MuNullable<MuUTF8>;
                    edit_container_name: MuNullable<MuUTF8>;
                    created_at: MuDate;
                    describe: MuUTF8;
                    hash: MuUTF8;
                    content_id: MuVarint;
                    image: MuUTF8;
                    name: MuUTF8;
                    version: MuVarint;
                    version_id: MuVarint;
                    play_count: MuVarint;
                    view_count: MuVarint;
                    url: MuUTF8;
                    audio_hash: MuOption<MuUTF8>;
                    duration: MuOption<MuVarint>;
                    collaborator: MuOption<MuArray<MuStruct<{
                        id: MuVarint;
                        avatar: MuUTF8;
                        displayname: MuUTF8;
                        is_following: MuBoolean;
                    }>>>;
                    follower_count: MuVarint;
                    following_count: MuVarint;
                    is_following: MuBoolean;
                    author_id: MuVarint;
                    author_avatar: MuUTF8;
                    author_name: MuUTF8;
                    author_tag: MuSchema<UserTag>;
                    comment_status: MuSchema<ContentCommentStatus>;
                    comment_count: MuVarint;
                }>>;
                global_disabled: MuBoolean;
            }>;
        };
        list: {
            arg: MuStruct<{
                type: MuSchema<DB.ContentType>;
                isPublic: MuBoolean;
                offset: MuVarint;
                limit: MuVarint;
                sort: MuSchema<DB.ContentOrder>;
                filter: MuOption<MuSchema<ContentListFilter>>;
                authorId: MuOption<MuVarint>;
                recommendByContentId: MuOption<MuVarint>;
                status: MuOption<MuSchema<DB.ContentStatus>>;
                noCache: MuOption<MuBoolean>;
            }>;
            ret: MuStruct<{
                rows: MuArray<MuStruct<{
                    on_publish_version: MuVarint;
                    published_version_id: MuVarint;
                    status: MuVarint;
                    status_version: MuVarint;
                    review_info: MuNullable<MuOption<MuStruct<{
                        reason: MuArray<MuUint8>;
                        title: MuUTF8;
                        details: MuUTF8;
                    }>>>;
                    type: MuSchema<DB.ContentType>;
                    play_container_name: MuNullable<MuUTF8>;
                    edit_container_name: MuNullable<MuUTF8>;
                    created_at: MuDate;
                    describe: MuUTF8;
                    hash: MuUTF8;
                    content_id: MuVarint;
                    image: MuUTF8;
                    name: MuUTF8;
                    version: MuVarint;
                    version_id: MuVarint;
                    play_count: MuVarint;
                    view_count: MuVarint;
                    url: MuUTF8;
                    audio_hash: MuOption<MuUTF8>;
                    duration: MuOption<MuVarint>;
                    author_id: MuVarint;
                    author_avatar: MuUTF8;
                    author_name: MuUTF8;
                    author_tag: MuSchema<UserTag>;
                    comment_status: MuSchema<ContentCommentStatus>;
                    comment_count: MuVarint;
                }>>;
                count: MuVarint;
                global_disabled: MuBoolean;
            }>;
        };
        get: {
            arg: MuUnion<{
                id: MuStruct<{
                    type: MuSchema<DB.ContentType>;
                    isPublic: MuBoolean;
                    contentId: MuOption<MuVarint>;
                    userId: MuVarint;
                    meshHash: MuBoolean;
                }>;
                containerName: MuUTF8;
            }>;
            ret: MuStruct<{
                meshHash: MuUTF8;
                audio_hash: MuUTF8;
                global_disabled: MuBoolean;
                is_collected: MuBoolean;
                banner: MuArray<MuUTF8>;
                published_at: MuOption<MuDate>;
                notice: MuUTF8;
                shortname: MuUTF8;
                can_rename: MuBoolean;
                on_publish_version: MuVarint;
                published_version_id: MuVarint;
                status: MuVarint;
                status_version: MuVarint;
                review_info: MuNullable<MuOption<MuStruct<{
                    reason: MuArray<MuUint8>;
                    title: MuUTF8;
                    details: MuUTF8;
                }>>>;
                type: MuSchema<DB.ContentType>;
                play_container_name: MuNullable<MuUTF8>;
                edit_container_name: MuNullable<MuUTF8>;
                created_at: MuDate;
                describe: MuUTF8;
                hash: MuUTF8;
                content_id: MuVarint;
                image: MuUTF8;
                name: MuUTF8;
                version: MuVarint;
                version_id: MuVarint;
                play_count: MuVarint;
                view_count: MuVarint;
                url: MuUTF8;
                duration: MuOption<MuVarint>;
                collaborator: MuOption<MuArray<MuStruct<{
                    id: MuVarint;
                    avatar: MuUTF8;
                    displayname: MuUTF8;
                    is_following: MuBoolean;
                }>>>;
                follower_count: MuVarint;
                following_count: MuVarint;
                is_following: MuBoolean;
                author_id: MuVarint;
                author_avatar: MuUTF8;
                author_name: MuUTF8;
                author_tag: MuSchema<UserTag>;
                comment_status: MuSchema<ContentCommentStatus>;
                comment_count: MuVarint;
            }>;
        };
        getNameByContainerName: {
            arg: MuUTF8;
            ret: MuUTF8;
        };
        getStatusHistory: {
            arg: MuStruct<{
                content_id: MuVarint;
                user_id: MuVarint;
                offset: MuVarint;
                limit: MuVarint;
            }>;
            ret: MuStruct<{
                rows: MuArray<MuStruct<{
                    id: MuVarint;
                    created_at: MuNullable<MuDate>;
                    updated_at: MuNullable<MuDate>;
                    content_id: MuVarint;
                    status: MuSchema<DB.ContentStatus>;
                    version: MuVarint;
                    review_info: MuNullable<MuOption<MuStruct<{
                        reason: MuArray<MuUint8>;
                        title: MuUTF8;
                        details: MuUTF8;
                    }>>>;
                    version_id: MuVarint;
                    auditor_id: MuVarint;
                }>>;
                count: MuVarint;
            }>;
        };
        updateGame: {
            arg: MuStruct<{
                content_id: MuVarint;
                name: MuUTF8;
                describe: MuUTF8;
                image: MuUTF8;
                hash: MuUTF8;
                engine_version: MuUTF8;
            }>;
            ret: MuStruct<{
                version_id: MuVarint;
            }>;
        };
    };
};
export type ContentAPI = MuRPCClient<typeof ContentRPCSchema>;
export {};
//# sourceMappingURL=content-protocol.d.ts.map