import { roleHasPlayerAdminPermission, type PlayerAdminCapability } from './policy';

export const PLAYER_ADMIN_VIEWS = [
    'overview',
    'players',
    'online-sessions',
    'account-bans',
    'identity-bans',
    'security',
    'admins',
    'permission-groups',
    'script-moderation',
    'play-maps',
    'container-play',
    'container-creator',
    'container-profiles',
    'container-resource-groups',
    'creator-access',
    'creator-tokens',
] as const;

export type PlayerAdminView = (typeof PLAYER_ADMIN_VIEWS)[number];

export type PlayerAdminNavigationActor = {
    role:'moderator' | 'admin' | 'owner';
    permissions:readonly string[];
};

/** The least privilege needed to reveal and open each console page. */
export const PLAYER_ADMIN_VIEW_REQUIREMENTS:Record<
    PlayerAdminView,
    PlayerAdminCapability | 'owner'
> = {
    'overview': 'players.view',
    'players': 'players.view',
    'online-sessions': 'sessions.view',
    'account-bans': 'account-bans.view',
    'identity-bans': 'identity-bans.view',
    'security': 'audit.view',
    'admins': 'owner',
    'permission-groups': 'owner',
    'script-moderation': 'owner',
    'play-maps': 'play-maps.view',
    'container-play': 'containers.view',
    'container-creator': 'containers.view',
    'container-profiles': 'containers.view',
    'container-resource-groups': 'containers.view',
    'creator-access': 'creator-access.view',
    'creator-tokens': 'creator-tokens.view',
};

export function canOpenPlayerAdminView(
    actor:PlayerAdminNavigationActor | undefined,
    view:PlayerAdminView,
) {
    if (!actor) {
        return false;
    }
    if (view === 'script-moderation') {
        return actor.role === 'owner';
    }
    // Owners and full administrators always receive the complete built-in
    // capability set. Moderators are the only role whose menu is shaped by a
    // delegable permission group.
    if (actor.role === 'owner' || actor.role === 'admin') {
        return true;
    }
    const requirement = PLAYER_ADMIN_VIEW_REQUIREMENTS[view];
    return (
        requirement !== 'owner' &&
        roleHasPlayerAdminPermission(actor.role, requirement, actor.permissions)
    );
}

export function allowedPlayerAdminViews(actor:PlayerAdminNavigationActor | undefined) {
    return PLAYER_ADMIN_VIEWS.filter((view) => canOpenPlayerAdminView(actor, view));
}

export function playerAdminFallbackView(
    actor:PlayerAdminNavigationActor | undefined,
):PlayerAdminView {
    const available = allowedPlayerAdminViews(actor);
    return available.includes('players') ? 'players' : available[0] || 'players';
}
