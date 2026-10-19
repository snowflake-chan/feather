"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContentRPCSchema = exports.ReviewOrder = exports.ManuallyRejectType = exports.ChooseType = exports.ContentHistorySchema = exports.ContentReportSchema = exports.HomeRecommendSchema = exports.ReviewContentSchema = exports.PrivateContentSchema = exports.PublicContentSchema = exports.PublicCollaboratorDisplaySchema = exports.PublicContentListSchema = exports.ContentSchema = exports.ContentCommentStatus = exports.ProjectReviewInfoSchema = exports.ContentQualitySchema = exports.ContentStatusSchema = exports.ContentTypeSchema = void 0;
const schema_1 = require("@box/mudb/schema");
const nullable_schema_1 = require("./nullable-schema");
const audit_schema_1 = require("../service/audit-schema");
exports.ContentTypeSchema = new schema_1.MuVarint();
exports.ContentStatusSchema = new schema_1.MuVarint();
exports.ContentQualitySchema = new schema_1.MuVarint();
exports.ProjectReviewInfoSchema = new schema_1.MuStruct({
    reason: new schema_1.MuArray(new schema_1.MuUint8(), Infinity),
    title: new schema_1.MuUTF8(),
    details: new schema_1.MuUTF8(),
});
var ContentCommentStatus;
(function (ContentCommentStatus) {
    ContentCommentStatus[ContentCommentStatus["normal"] = 0] = "normal";
    ContentCommentStatus[ContentCommentStatus["ownerDisabled"] = 1] = "ownerDisabled";
})(ContentCommentStatus || (exports.ContentCommentStatus = ContentCommentStatus = {}));
exports.ContentSchema = new schema_1.MuStruct({
    created_at: new schema_1.MuDate(),
    describe: new schema_1.MuUTF8(),
    hash: new schema_1.MuUTF8(),
    content_id: new schema_1.MuVarint(),
    image: new schema_1.MuUTF8(),
    name: new schema_1.MuUTF8(),
    version: new schema_1.MuVarint(),
    version_id: new schema_1.MuVarint(),
    play_count: new schema_1.MuVarint(),
    view_count: new schema_1.MuVarint(),
    url: new schema_1.MuUTF8(),
    audio_hash: new schema_1.MuOption(new schema_1.MuUTF8()),
    duration: new schema_1.MuOption(new schema_1.MuVarint()),
});
exports.PublicContentListSchema = new schema_1.MuStruct(Object.assign(Object.assign({}, exports.ContentSchema.muData), { author_id: new schema_1.MuVarint(), author_avatar: new schema_1.MuUTF8(), author_name: new schema_1.MuUTF8(), author_tag: new schema_1.MuVarint(), play_container_name: new nullable_schema_1.MuNullable(new schema_1.MuUTF8()), edit_container_name: new nullable_schema_1.MuNullable(new schema_1.MuUTF8()), comment_status: new schema_1.MuVarint(), comment_count: new schema_1.MuVarint() }));
exports.PublicCollaboratorDisplaySchema = new schema_1.MuArray(new schema_1.MuStruct({
    id: new schema_1.MuVarint(),
    avatar: new schema_1.MuUTF8(),
    displayname: new schema_1.MuUTF8(),
    is_following: new schema_1.MuBoolean(),
}), Infinity);
exports.PublicContentSchema = new schema_1.MuStruct(Object.assign(Object.assign({}, exports.PublicContentListSchema.muData), { collaborator: new schema_1.MuOption(exports.PublicCollaboratorDisplaySchema), follower_count: new schema_1.MuVarint(), following_count: new schema_1.MuVarint(), is_following: new schema_1.MuBoolean() }));
exports.PrivateContentSchema = new schema_1.MuStruct(Object.assign(Object.assign({}, exports.ContentSchema.muData), { on_publish_version: new schema_1.MuVarint(), published_version_id: new schema_1.MuVarint(), status: new schema_1.MuVarint(), status_version: new schema_1.MuVarint(), review_info: new nullable_schema_1.MuNullable(new schema_1.MuOption(exports.ProjectReviewInfoSchema)), type: exports.ContentTypeSchema, play_container_name: new nullable_schema_1.MuNullable(new schema_1.MuUTF8()), edit_container_name: new nullable_schema_1.MuNullable(new schema_1.MuUTF8()) }));
exports.ReviewContentSchema = new schema_1.MuStruct({
    content_id: new schema_1.MuVarint(),
    type: exports.ContentTypeSchema,
    image: new schema_1.MuUTF8(),
    name: new schema_1.MuUTF8(),
    shortname: new schema_1.MuUTF8(),
    describe: new schema_1.MuUTF8(),
    hash: new schema_1.MuUTF8(),
    quality: exports.ContentQualitySchema,
    author_id: new schema_1.MuVarint(),
    author_name: new schema_1.MuUTF8(),
    version: new schema_1.MuVarint(),
    container_name: new nullable_schema_1.MuNullable(new schema_1.MuUTF8()),
    reason: new nullable_schema_1.MuNullable(new schema_1.MuJSON()),
    reviewer_name: new schema_1.MuUTF8(),
    review_at: new schema_1.MuOption(new nullable_schema_1.MuNullable(new schema_1.MuDate())),
    status_updated_at: new schema_1.MuOption(new nullable_schema_1.MuNullable(new schema_1.MuDate())),
    published_version_id: new schema_1.MuVarint(),
    notice: new schema_1.MuUTF8(),
    audio_hash: new schema_1.MuUTF8(),
    base_info: new nullable_schema_1.MuNullable(new schema_1.MuStruct({
        image: new nullable_schema_1.MuNullable(audit_schema_1.AuditResultSchema),
        audio_hash: new nullable_schema_1.MuNullable(audit_schema_1.AuditResultSchema),
    })),
});
exports.HomeRecommendSchema = new schema_1.MuStruct({
    content_id: new schema_1.MuVarint(),
    name: new schema_1.MuUTF8(),
    hash: new schema_1.MuUTF8(),
    image: new schema_1.MuUTF8(),
    version: new schema_1.MuVarint(),
    version_id: new schema_1.MuVarint(),
    audio_hash: new schema_1.MuUTF8(),
    duration: new schema_1.MuVarint(),
    view_count: new schema_1.MuVarint(),
    author_id: new schema_1.MuVarint(),
    author_name: new schema_1.MuUTF8(),
    author_avatar: new schema_1.MuUTF8(),
    container_name: new nullable_schema_1.MuNullable(new schema_1.MuUTF8()),
});
exports.ContentReportSchema = new schema_1.MuStruct({
    id: new schema_1.MuVarint(), // report id
    type: exports.ContentTypeSchema,
    name: exports.ContentSchema.muData.name,
    image: exports.ContentSchema.muData.image,
    content_id: exports.ContentSchema.muData.content_id,
    content_version: exports.ContentSchema.muData.version,
    reporter_id: new schema_1.MuVarint(),
    reporter_name: new schema_1.MuUTF8(),
    reporter_avatar: new schema_1.MuUTF8(),
    report_reason: new schema_1.MuVarint(),
    report_date: new schema_1.MuDate(),
    report_status: new schema_1.MuVarint(),
});
exports.ContentHistorySchema = new schema_1.MuStruct({
    id: new schema_1.MuVarint(),
    created_at: new nullable_schema_1.MuNullable(new schema_1.MuDate()),
    updated_at: new nullable_schema_1.MuNullable(new schema_1.MuDate()),
    content_id: new schema_1.MuVarint(),
    status: exports.ContentStatusSchema,
    version: new schema_1.MuVarint(),
    review_info: new nullable_schema_1.MuNullable(new schema_1.MuOption(exports.ProjectReviewInfoSchema)),
    version_id: new schema_1.MuVarint(),
    auditor_id: new schema_1.MuVarint(),
});
var ChooseType;
(function (ChooseType) {
    ChooseType[ChooseType["editor"] = 0] = "editor";
    ChooseType[ChooseType["new_trend"] = 1] = "new_trend";
})(ChooseType || (exports.ChooseType = ChooseType = {}));
var ManuallyRejectType;
(function (ManuallyRejectType) {
    ManuallyRejectType[ManuallyRejectType["none"] = 0] = "none";
    ManuallyRejectType[ManuallyRejectType["image"] = 1] = "image";
    ManuallyRejectType[ManuallyRejectType["audio"] = 2] = "audio";
})(ManuallyRejectType || (exports.ManuallyRejectType = ManuallyRejectType = {}));
var ReviewOrder;
(function (ReviewOrder) {
    ReviewOrder[ReviewOrder["byPublishTime"] = 0] = "byPublishTime";
    ReviewOrder[ReviewOrder["byReviewTime"] = 1] = "byReviewTime";
})(ReviewOrder || (exports.ReviewOrder = ReviewOrder = {}));
exports.ContentRPCSchema = {
    name: 'content-server-rpc',
    api: {
        search: {
            arg: new schema_1.MuStruct({
                type: exports.ContentTypeSchema,
                isPublic: new schema_1.MuBoolean(),
                keyword: new schema_1.MuUTF8(),
                offset: new schema_1.MuVarint(),
                limit: new schema_1.MuVarint(),
                authorId: new schema_1.MuOption(new schema_1.MuVarint()),
            }),
            ret: new schema_1.MuStruct({
                rows: new schema_1.MuArray(new schema_1.MuStruct(Object.assign(Object.assign(Object.assign({}, exports.PublicContentSchema.muData), exports.PrivateContentSchema.muData), { count: new schema_1.MuVarint() })), Infinity),
                global_disabled: new schema_1.MuBoolean(),
            }),
        },
        list: {
            arg: new schema_1.MuStruct({
                type: exports.ContentTypeSchema,
                isPublic: new schema_1.MuBoolean(),
                offset: new schema_1.MuVarint(),
                limit: new schema_1.MuVarint(),
                sort: new schema_1.MuVarint(), // updated/created
                filter: new schema_1.MuOption(new schema_1.MuUTF8()), // featured/hot/latest/collected/shared
                authorId: new schema_1.MuOption(new schema_1.MuVarint()), // get particular author's list
                recommendByContentId: new schema_1.MuOption(new schema_1.MuVarint()), // get recommend list by content
                status: new schema_1.MuOption(exports.ContentStatusSchema),
                noCache: new schema_1.MuOption(new schema_1.MuBoolean()),
            }),
            ret: new schema_1.MuStruct({
                rows: new schema_1.MuArray(new schema_1.MuStruct(Object.assign(Object.assign({}, exports.PublicContentListSchema.muData), exports.PrivateContentSchema.muData)), Infinity),
                count: new schema_1.MuVarint(),
                global_disabled: new schema_1.MuBoolean(),
            }),
        },
        get: {
            arg: new schema_1.MuUnion({
                id: new schema_1.MuStruct({
                    type: exports.ContentTypeSchema,
                    isPublic: new schema_1.MuBoolean(),
                    contentId: new schema_1.MuOption(new schema_1.MuVarint()), // if provided then ignore containerName
                    userId: new schema_1.MuVarint(), // for server request
                    meshHash: new schema_1.MuBoolean(),
                }),
                containerName: new schema_1.MuUTF8(),
            }),
            ret: new schema_1.MuStruct(Object.assign(Object.assign(Object.assign({}, exports.PublicContentSchema.muData), exports.PrivateContentSchema.muData), { 
                // particular hash
                meshHash: new schema_1.MuUTF8(), audio_hash: new schema_1.MuUTF8(), global_disabled: new schema_1.MuBoolean(), is_collected: new schema_1.MuBoolean(), banner: new schema_1.MuArray(new schema_1.MuUTF8(), Infinity), published_at: new schema_1.MuOption(new schema_1.MuDate()), notice: new schema_1.MuUTF8(), 
                // for private games
                shortname: new schema_1.MuUTF8(), can_rename: new schema_1.MuBoolean() })),
        },
        getNameByContainerName: {
            arg: new schema_1.MuUTF8(), // containerName
            ret: new schema_1.MuUTF8(), // contentName
        },
        getStatusHistory: {
            arg: new schema_1.MuStruct({
                content_id: new schema_1.MuVarint(),
                user_id: new schema_1.MuVarint(), // for server request
                offset: new schema_1.MuVarint(),
                limit: new schema_1.MuVarint(),
            }),
            ret: new schema_1.MuStruct({
                rows: new schema_1.MuArray(exports.ContentHistorySchema, Infinity),
                count: new schema_1.MuVarint(),
            }),
        },
        updateGame: {
            arg: new schema_1.MuStruct({
                content_id: new schema_1.MuVarint(),
                name: new schema_1.MuUTF8(),
                describe: new schema_1.MuUTF8(),
                image: new schema_1.MuUTF8(),
                hash: new schema_1.MuUTF8(),
                engine_version: new schema_1.MuUTF8(),
            }),
            ret: new schema_1.MuStruct({
                version_id: new schema_1.MuVarint(),
            }),
        },
    },
};
//# sourceMappingURL=content-protocol.js.map