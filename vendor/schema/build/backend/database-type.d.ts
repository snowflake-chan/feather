import { PlayerSkinName } from '../player/player-schema';
import { AuditResultSchema } from './service/audit-schema';
import { CommentStatus, ContentCommentStatus, ReportReason, ReportStatus2, ReportType } from './declarations';
export declare namespace DB {
    enum Gender {
        male = 0,
        female = 1,
        unknow = 2
    }
    enum UserPermission {
        none = 0,
        canChangePermission = 1,
        canDealReport = 2,
        canReviewContent = 4,
        canBanUserReleaseContent = 8,
        isReleaseLimited = 16,
        canAddEditorChoice = 32,
        canChangeResourceGroup = 64,
        canCreateGame = 128,
        canInviteEditor = 256,
        gameAdmin = 512,
        canBanUser = 1024,
        canAuditAvatar = 2048,
        canPunish = 4096,
        canManageComment = 8192,
        canNotify = 16384
    }
    type TimeStamp = Date | null | string | number;
    type Identity = number;
    enum UserStatus {
        normal = 0,
        limited = 1,
        warning = 2,
        banned = 3
    }
    enum OperationType {
        ban = 0,
        liftBan = 1
    }
    enum UserUpdateType {
        username = 0,
        phone = 1,
        password = 2,
        email = 3,
        avatar = 4
    }
    enum AvatarStatus {
        waiting = 0,
        rejected = 1,
        noticed = 2,
        accepted = 3,
        cancelled = 4
    }
    enum UserFlags {
        agreementOnChat = 1,
        agreementOnComment = 2,
        isbn = 4,
        weakUser = 8
    }
    enum SkinStatus {
        not4sale = 0,
        onsale = 1
    }
    interface PhysicalTable {
        user: {
            id: Identity;
            created_at?: TimeStamp;
            updated_at?: TimeStamp;
            cmid?: number;
            displayname: string;
            wearing_skins: PlayerSkinName;
            permission: UserPermission;
            birthday: TimeStamp;
            avatar: string;
            avatar_hash: string;
            status: UserStatus;
            gender: number;
            username: string;
            phone: string;
            password: string;
            email: string;
            language: string;
            description: string;
            avatar_status: AvatarStatus;
            auth_info: number;
            first_login: boolean;
            blocklist: number[];
            reputation: number;
            flags: UserFlags;
            muted_till: Date;
            banned_till: Date;
            ban_editor: boolean;
            gold: number;
            tag: number;
            recommend_by?: number;
        };
        user_online_history: {
            id: Identity;
            created_at?: TimeStamp;
            updated_at?: TimeStamp;
            user_id: number;
            application: string;
            online_count: number;
            offline_count: number;
        };
        user_ban_history: {
            id: Identity;
            created_at?: TimeStamp;
            user_id: Identity;
            operator_id: Identity;
            operation: OperationType;
        };
        content: {
            content_id: Identity;
            created_at?: TimeStamp;
            updated_at?: TimeStamp;
            author_id: number;
            type: ContentType;
            url: string;
            play_count: number;
            collect_count: number;
            view_count: number;
            status: ContentStatus;
            status_version_id: number;
            status_updated_at?: TimeStamp;
            published_version_id: number;
            published_at: number;
            published_version: number;
            quality: ContentQuality;
            comment_status: ContentCommentStatus;
            comment_count: number;
        };
        content_version: {
            version_id: Identity;
            created_at?: TimeStamp;
            updated_at?: TimeStamp;
            content_id: number;
            version: number;
            describe: string;
            hash: string;
            name: string;
            image: string;
            engine_version: string;
            notice: string;
            svg: string;
            banner: string[];
            shortname: string;
            audio_hash: string;
            duration: number;
        };
        content_comment: {
            id: Identity;
            root_id: number | null;
            parent_id: number | null;
            content_id: number;
            user_id: number;
            comment: string;
            updated_at?: TimeStamp;
            created_at?: TimeStamp;
        };
        content_comment_like: {
            id: Identity;
            comment_id: number;
            user_id: number;
            created_at?: TimeStamp;
        };
        skin: {
            id: Identity;
            created_at?: TimeStamp;
            updated_at?: TimeStamp;
            name: string;
            price: number;
            image?: string;
            describe?: string;
            author_id: number;
            displayname: string;
            status: number;
        };
        user_skin_library: {
            id: Identity;
            created_at?: TimeStamp;
            updated_at?: TimeStamp;
            user_id: number;
            skin_name: string;
        };
        user_collect_content: {
            id: Identity;
            created_at?: TimeStamp;
            updated_at?: TimeStamp;
            user_id: Identity;
            content_id: Identity;
        };
        user_browse_content_history: {
            id: Identity;
            created_at?: TimeStamp;
            updated_at?: TimeStamp;
            user_id: Identity;
            content_id: Identity;
        };
        user_permission_history: {
            id: Identity;
            created_at?: TimeStamp;
            updated_at?: TimeStamp;
            operator_id: Identity;
            target_id: Identity;
            to_permission: UserPermission;
        };
        content_report: {
            id: Identity;
            created_at?: TimeStamp;
            updated_at?: TimeStamp;
            reporter_id: Identity;
            content_id: Identity;
            reason: ViolationType;
            status: ReportStatus;
            content_version: number;
            version_id: number;
        };
        editor_choice_content: {
            id: Identity;
            created_at?: TimeStamp;
            updated_at?: TimeStamp;
            user_id: Identity;
            content_id: Identity;
            type: number;
        };
        user_play_game_history: {
            id: Identity;
            created_at?: TimeStamp;
            updated_at?: TimeStamp;
            content_id: Identity;
            user_id: Identity;
        };
        content_status_history: {
            id: Identity;
            created_at?: TimeStamp;
            updated_at?: TimeStamp;
            content_id: Identity;
            status: ContentStatus;
            version: number;
            review_info: ContentReviewRejectInfo;
            auditor_id: Identity;
            version_id: Identity;
            base_info: {
                image: typeof AuditResultSchema.identity | null;
                audio_hash: typeof AuditResultSchema.identity | null;
            };
        };
        container: {
            id: Identity;
            created_at?: TimeStamp;
            updated_at?: TimeStamp;
            content_id: Identity;
            name: string;
            resource_id: Identity;
            status: ContainerStatus;
            type: ContainerType;
            permission: string;
            status_updated_at: TimeStamp;
        };
        resources_group: {
            id: Identity;
            created_at?: TimeStamp;
            updated_at?: TimeStamp;
            name: string;
            limits_cpu: string;
            limits_memory: string;
            requests_cpu: string;
            requests_memory: string;
        };
        engine_version_history: {
            id: Identity;
            created_at?: TimeStamp;
            updated_at?: TimeStamp;
            version: string;
        };
        invitation_hash: {
            id: Identity;
            created_at?: TimeStamp;
            updated_at?: TimeStamp;
            hash: string;
            expire_at: TimeStamp;
            generator_id: number;
            user_id: number;
            type: InvitationType;
        };
        invitation_application: {
            id: Identity;
            created_at?: TimeStamp;
            updated_at?: TimeStamp;
            type: InvitationType;
            phone: string;
            name: string;
            description: string;
            applicant_id: number;
            operator_id: number;
            status: InvitationAppStatus;
            topic: string;
            answer: string;
        };
        bug_report: {
            id: Identity;
            subject: string;
            description: string;
            environment: string;
            screenshots: string[];
            reporter_id: number;
            content_id: number;
            version_id: number;
            status: BugReportStatus;
            reviewer_id: number;
            created_at: TimeStamp;
            updated_at: TimeStamp;
        };
        user_update_history: {
            user_id: number;
            type: UserUpdateType;
            detail: string;
            updated_at: TimeStamp;
        };
        username_bind: {
            user_id: number;
            username: string;
        };
        customer_service: {
            id: number;
            title: string;
            detail: string;
            name: string;
            contact: string;
            status: number;
            user_agent: string;
            created_at?: TimeStamp;
            updated_at?: TimeStamp;
        };
        given_skins: {
            id: number;
            skin_name: string;
            left: number;
        };
        avatar_audit: {
            id: number;
            user_id: number;
            avatar: string;
            status: AvatarStatus;
            operator: number;
            reason: string;
            created_at?: TimeStamp;
            updated_at?: TimeStamp;
        };
        report: {
            id: number;
            type: ReportType;
            user_id: number;
            target_id: number;
            reason: ReportReason;
            description: string;
            screenshot?: string[];
            status: ReportStatus2;
            container_name?: string;
            related_log?: string;
            comment_id?: number;
            punish_id?: number;
            operator_id?: number;
            created_at?: Date;
            updated_at?: Date;
        };
        punish: {
            id: number;
            operator_id: number;
            target_id: number;
            reputation?: number;
            mute?: number;
            ban?: number;
            ban_editor?: number;
            delete_comment?: boolean;
            comment?: string;
            report_id?: number;
            created_at?: Date;
            checked: boolean;
        };
        comment: {
            id: number;
            content_id: number;
            base_comment_id: number;
            user_id: number;
            comment: string;
            status: CommentStatus;
            reply_to: number;
            reply_count: number;
            reply_user_id: number;
            best_reply_id: number;
            like_count: number;
            created_at?: Date;
            updated_at?: Date;
        };
        config: {
            id: number;
            name: string;
            value: string;
        };
        comment_delete_log: {
            id: number;
            operator: number;
            reason: ReportReason;
            description: string;
            screenshot: string[];
            created_at: Date;
        };
        comment_like: {
            id: number;
            comment_id: number;
            user_id: number;
        };
        follow: {
            id: number;
            follower: number;
            following: number;
        };
        shortname_history: {
            id: number;
            name: string;
            content_id: number;
            created_at: Date;
        };
        order: {
            id: number;
            user_id: number;
            type: number;
            item_id: number;
            price: number;
            created_at: Date;
            updated_at: Date;
        };
        website_banner: {
            banner_mobile: string;
            banner_pc: string;
            banner_link: string;
            created_at?: TimeStamp;
            time_from: TimeStamp;
            time_to: TimeStamp;
            status: boolean;
            operator: number;
            hits?: number;
        };
    }
    interface View {
        status_contents: PhysicalTable['content_version'] & Pick<PhysicalTable['content'], 'type' | 'play_count' | 'collect_count' | 'view_count' | 'url' | 'author_id' | 'status' | 'status_updated_at' | 'published_version' | 'published_at' | 'quality'> & {
            author_avatar: string;
            author_name: string;
        };
        published_contents: PhysicalTable['content_version'] & Pick<PhysicalTable['content'], 'type' | 'play_count' | 'collect_count' | 'view_count' | 'url' | 'author_id' | 'published_at' | 'quality' | 'comment_status' | 'comment_count'> & {
            author_name: string;
            author_avatar: string;
        };
        latest_contents: PhysicalTable['content_version'] & Pick<PhysicalTable['content'], 'type' | 'author_id'>;
        reported_contents: Pick<PhysicalTable['content_version'], 'name' | 'image'> & Pick<PhysicalTable['content'], 'type'> & Pick<PhysicalTable['content_report'], 'id' | 'content_id' | 'content_version' | 'reporter_id'> & {
            reporter_name: string;
            reporter_avatar: string;
            report_reason: ViolationType;
            report_date: TimeStamp;
            report_status: ReportStatus;
        };
    }
    type Tables = PhysicalTable & View;
    type All = {
        [name in keyof Tables]: Tables[name];
    };
    type List<T> = {
        count: number;
        rows: T;
    };
    type SearchPrivateAssetsList = Pick<All['latest_contents'], 'content_id' | 'name' | 'image' | 'hash'>;
    type SearchPrivateContentList = Pick<All['latest_contents'], 'created_at' | 'describe' | 'engine_version' | 'hash' | 'content_id' | 'image' | 'name' | 'version' | 'version_id'>;
    type SearchedPublishedGames = All['published_contents'];
    type SearchedPublishedAssets = All['published_contents'];
    enum ContentStatus {
        unpublished = 1,
        underReview = 2,
        published = 3,
        rejected = 4,
        censored = 5,//  someone reported it and removed from published list by admin
        removed = 6
    }
    enum ContentType {
        game = 1,
        asset = 2,
        music = 3
    }
    interface ContentRejectInfo {
        title: string;
        reason: ViolationType[];
        details: string;
    }
    enum PostType {
        thread = 1,
        comment = 2,
        replyToComment = 3
    }
    enum ViolationType {
        others = 0,
        advertisement = 1,
        political = 2,
        sex = 3,
        violent = 4,
        crime = 5,
        fraud = 6,
        copyright = 7
    }
    interface ContentReviewRejectInfo {
        title: string;
        reason: ContentReviewViolationType[];
        details: string;
    }
    enum ContentReviewViolationType {
        codeError = 0,
        nameNotMatch = 1,
        coverNotMatch = 2,
        contentViolation = 3,
        contentNotClear = 4,
        nameViolation = 5,
        descViolation = 6,
        coverViolation = 7,
        advertisement = 8,
        needOptimize = 9,
        linkViolation = 10,
        others = 11,
        descNotMatch = 12
    }
    enum ReportStatus {
        waiting = 1,
        reject = 2,
        pass = 3
    }
    interface OnlineInfo {
        last_online: TimeStamp;
        last_offline: TimeStamp;
        online_count: number;
        offline_count: number;
    }
    enum ContainerType {
        edit = "edit",
        play = "play"
    }
    enum ContainerStatus {
        pending = "Pending",
        running = "Running",
        suspended = "Suspended",
        unknown = "Unknown"
    }
    enum ContentOrder {
        updated = 1,
        created = 2,
        published = 3
    }
    enum InvitationType {
        createGame = 1
    }
    enum InvitationCodeStatus {
        ready = 1,
        expired = 2,
        used = 3,
        unexist = 4
    }
    enum InvitationAppStatus {
        waiting = 1,
        approved = 2,
        rejected = 3
    }
    const Limitations: {
        contentDescriptionBytes: number;
        contentUpdateNoticeBytes: number;
        contentNameBytes: number;
    };
    enum BugReportStatus {
        pending = 0,
        processed = 1
    }
    enum ContentQuality {
        unset = 0,
        low = 1
    }
    enum OrderByDate {
        latest = 1,
        oldest = 2
    }
}
