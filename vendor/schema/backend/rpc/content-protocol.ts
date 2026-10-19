import {
  MuStruct,
  MuVarint,
  MuSchema,
  MuBoolean,
  MuDate,
  MuArray,
  MuOption,
  MuJSON,
  MuVoid,
  MuUnion,
  MuUTF8,
  MuUint8,
} from '@box/mudb/schema';
import { DB } from '../database-type';
import { MuRPCClient } from '@box/mudb/rpc/client';
import { MuNullable } from './nullable-schema';
import { UserTag } from './user-protocol';
import { AuditResultSchema } from '../service/audit-schema';

export const ContentTypeSchema = <MuSchema<DB.ContentType>>new MuVarint();
export const ContentStatusSchema = <MuSchema<DB.ContentStatus>>new MuVarint();
export const ContentQualitySchema = <MuSchema<DB.ContentQuality>>new MuVarint();

export const ProjectReviewInfoSchema = new MuStruct({
  reason: new MuArray(new MuUint8(), Infinity),
  title: new MuUTF8(),
  details: new MuUTF8(),
});

export enum ContentCommentStatus {
  normal,
  ownerDisabled,
}

export const ContentSchema = new MuStruct({
  created_at: new MuDate(),
  describe: new MuUTF8(),
  hash: new MuUTF8(),
  content_id: new MuVarint(),
  image: new MuUTF8(),
  name: new MuUTF8(),
  version: new MuVarint(),
  version_id: new MuVarint(),
  play_count: new MuVarint(),
  view_count: new MuVarint(),
  url: new MuUTF8(),
  audio_hash: new MuOption(new MuUTF8()),
  duration: new MuOption(new MuVarint()),
});

export const PublicContentListSchema = new MuStruct({
  ...ContentSchema.muData,
  author_id: new MuVarint(),
  author_avatar: new MuUTF8(),
  author_name: new MuUTF8(),
  author_tag: <MuSchema<UserTag>>new MuVarint(),
  play_container_name: new MuNullable(new MuUTF8()),
  edit_container_name: new MuNullable(new MuUTF8()),
  comment_status: <MuSchema<ContentCommentStatus>>new MuVarint(),
  comment_count: new MuVarint(),
});

export const PublicCollaboratorDisplaySchema = new MuArray(
  new MuStruct({
    id: new MuVarint(),
    avatar: new MuUTF8(),
    displayname: new MuUTF8(),
    is_following: new MuBoolean(),
  }),
  Infinity,
);

export const PublicContentSchema = new MuStruct({
  ...PublicContentListSchema.muData,
  collaborator: new MuOption(PublicCollaboratorDisplaySchema),
  follower_count: new MuVarint(),
  following_count: new MuVarint(),
  is_following: new MuBoolean(),
});

export const PrivateContentSchema = new MuStruct({
  ...ContentSchema.muData,
  on_publish_version: new MuVarint(),
  published_version_id: new MuVarint(),
  status: new MuVarint(),
  status_version: new MuVarint(),
  review_info: new MuNullable(new MuOption(ProjectReviewInfoSchema)),
  type: ContentTypeSchema, // weird, u pass type in, then i pass type out lol
  play_container_name: new MuNullable(new MuUTF8()),
  edit_container_name: new MuNullable(new MuUTF8()),
});

export const ReviewContentSchema = new MuStruct({
  content_id: new MuVarint(),
  type: ContentTypeSchema,
  image: new MuUTF8(),
  name: new MuUTF8(),
  shortname: new MuUTF8(),
  describe: new MuUTF8(),
  hash: new MuUTF8(),
  quality: ContentQualitySchema,
  author_id: new MuVarint(),
  author_name: new MuUTF8(),
  version: new MuVarint(),
  container_name: new MuNullable(new MuUTF8()),
  reason: new MuNullable(
    <MuSchema<{ title: string; details: string }>>new MuJSON(),
  ),
  reviewer_name: new MuUTF8(),
  review_at: new MuOption(new MuNullable(new MuDate())),
  status_updated_at: new MuOption(new MuNullable(new MuDate())),
  published_version_id: new MuVarint(),
  notice: new MuUTF8(),
  audio_hash: new MuUTF8(),
  base_info: new MuNullable(
    new MuStruct({
      image: new MuNullable(AuditResultSchema),
      audio_hash: new MuNullable(AuditResultSchema),
    }),
  ),
});

export const HomeRecommendSchema = new MuStruct({
  content_id: new MuVarint(),
  name: new MuUTF8(),
  hash: new MuUTF8(),
  image: new MuUTF8(),
  version: new MuVarint(),
  version_id: new MuVarint(),
  audio_hash: new MuUTF8(),
  duration: new MuVarint(),
  view_count: new MuVarint(),
  author_id: new MuVarint(),
  author_name: new MuUTF8(),
  author_avatar: new MuUTF8(),
  container_name: new MuNullable(new MuUTF8()),
});

export const ContentReportSchema = new MuStruct({
  id: new MuVarint(), // report id
  type: ContentTypeSchema,
  name: ContentSchema.muData.name,
  image: ContentSchema.muData.image,
  content_id: ContentSchema.muData.content_id,
  content_version: ContentSchema.muData.version,
  reporter_id: new MuVarint(),
  reporter_name: new MuUTF8(),
  reporter_avatar: new MuUTF8(),
  report_reason: <MuSchema<DB.ViolationType>>new MuVarint(),
  report_date: new MuDate(),
  report_status: <MuSchema<DB.ReportStatus>>new MuVarint(),
});

export const ContentHistorySchema = new MuStruct({
  id: new MuVarint(),
  created_at: new MuNullable(new MuDate()),
  updated_at: new MuNullable(new MuDate()),
  content_id: new MuVarint(),
  status: ContentStatusSchema,
  version: new MuVarint(),
  review_info: new MuNullable(new MuOption(ProjectReviewInfoSchema)),
  version_id: new MuVarint(),
  auditor_id: new MuVarint(),
});

type ContentListFilter =
  | 'featured'
  | 'hot'
  | 'latest'
  | 'collected'
  | 'new_trend'
  | 'shared';

export enum ChooseType {
  editor, // old one
  new_trend,
}

export enum ManuallyRejectType {
  none,
  image,
  audio,
}

export enum ReviewOrder {
  byPublishTime,
  byReviewTime,
}

export const ContentRPCSchema = {
  name: 'content-server-rpc',
  api: {
    search: {
      arg: <
        MuSchema<{
          type: DB.ContentType;
          isPublic: boolean;
          keyword: string;
          offset: number;
          limit: number;
        }>
      >new MuStruct({
        type: ContentTypeSchema,
        isPublic: new MuBoolean(),
        keyword: new MuUTF8(),
        offset: new MuVarint(),
        limit: new MuVarint(),
        authorId: new MuOption(new MuVarint()),
      }),
      ret: new MuStruct({
        rows: new MuArray(
          new MuStruct({
            ...PublicContentSchema.muData,
            ...PrivateContentSchema.muData,
            count: new MuVarint(),
          }),
          Infinity,
        ),
        global_disabled: new MuBoolean(),
      }),
    },
    list: {
      arg: new MuStruct({
        type: ContentTypeSchema,
        isPublic: new MuBoolean(),
        offset: new MuVarint(),
        limit: new MuVarint(),
        sort: <MuSchema<DB.ContentOrder>>new MuVarint(), // updated/created
        filter: new MuOption(<MuSchema<ContentListFilter>>new MuUTF8()), // featured/hot/latest/collected/shared
        authorId: new MuOption(new MuVarint()), // get particular author's list
        recommendByContentId: new MuOption(new MuVarint()), // get recommend list by content
        status: new MuOption(ContentStatusSchema),
        noCache: new MuOption(new MuBoolean()),
      }),
      ret: new MuStruct({
        rows: new MuArray(
          new MuStruct({
            ...PublicContentListSchema.muData,
            ...PrivateContentSchema.muData,
          }),
          Infinity,
        ),
        count: new MuVarint(),
        global_disabled: new MuBoolean(),
      }),
    },
    get: {
      arg: new MuUnion({
        id: new MuStruct({
          type: ContentTypeSchema,
          isPublic: new MuBoolean(),
          contentId: new MuOption(new MuVarint()), // if provided then ignore containerName
          userId: new MuVarint(), // for server request
          meshHash: new MuBoolean(),
        }),
        containerName: new MuUTF8(),
      }),
      ret: new MuStruct({
        ...PublicContentSchema.muData,
        ...PrivateContentSchema.muData, // private won't have is_following stuff!

        // particular hash
        meshHash: new MuUTF8(),
        audio_hash: new MuUTF8(),

        global_disabled: new MuBoolean(),

        is_collected: new MuBoolean(),
        banner: new MuArray(new MuUTF8(), Infinity),
        published_at: new MuOption(new MuDate()),
        notice: new MuUTF8(),

        // for private games
        shortname: new MuUTF8(),
        can_rename: new MuBoolean(),
      }),
    },
    getNameByContainerName: {
      arg: new MuUTF8(), // containerName
      ret: new MuUTF8(), // contentName
    },
    getStatusHistory: {
      arg: new MuStruct({
        content_id: new MuVarint(),
        user_id: new MuVarint(), // for server request
        offset: new MuVarint(),
        limit: new MuVarint(),
      }),
      ret: new MuStruct({
        rows: new MuArray(ContentHistorySchema, Infinity),
        count: new MuVarint(),
      }),
    },
    updateGame: {
      arg: new MuStruct({
        content_id: new MuVarint(),
        name: new MuUTF8(),
        describe: new MuUTF8(),
        image: new MuUTF8(),
        hash: new MuUTF8(),
        engine_version: new MuUTF8(),
      }),
      ret: new MuStruct({
        version_id: new MuVarint(),
      }),
    },
  },
};

export type ContentAPI = MuRPCClient<typeof ContentRPCSchema>;
