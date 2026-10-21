'use strict';
const assert = require('node:assert/strict');
const test = require('node:test');
const policy = require('../dist/index.cjs');
const navigation = require('../dist/navigation.cjs');
const { PLAYER_ADMIN_PERMISSION_MENU } = require('../dist/permission-menu.cjs');

test('capability normalization and legacy paired read permissions remain compatible', () => {
    assert.deepEqual(
        policy.normalizePlayerAdminCapabilities(['players.view', 'invalid', 'players.view']),
        ['players.view'],
    );
    const effective = policy.effectivePlayerAdminCapabilities('moderator', [
        'identity-bans.manage',
        'containers.manage',
    ]);
    assert.ok(effective.includes('identity-bans.view'));
    assert.ok(effective.includes('containers.view'));
    assert.equal(policy.roleHasPlayerAdminPermission('owner', 'owner'), false);
});

test('navigation retains moderator filtering and owner-only map authorization', () => {
    const actor = { role: 'moderator', permissions: ['players.view', 'sessions.view'] };
    assert.deepEqual(navigation.allowedPlayerAdminViews(actor), [
        'overview',
        'players',
        'online-sessions',
    ]);
    assert.equal(navigation.playerAdminFallbackView(actor), 'players');
    assert.equal(
        navigation.canOpenPlayerAdminView({ role: 'admin', permissions: [] }, 'script-moderation'),
        false,
    );
    assert.equal(
        navigation.canOpenPlayerAdminView({ role: 'owner', permissions: [] }, 'script-moderation'),
        true,
    );
    assert.equal(
        navigation.allowedPlayerAdminViews({ role: 'owner', permissions: [] }).length,
        navigation.PLAYER_ADMIN_VIEWS.length,
    );
});

test('permission menu represents every grantable capability exactly once', () => {
    const entries = PLAYER_ADMIN_PERMISSION_MENU.flatMap((category) =>
        category.sections.flatMap((section) => section.capabilities),
    );
    assert.equal(entries.length, new Set(entries).size);
    assert.deepEqual(
        entries.slice().sort(),
        policy.PLAYER_ADMIN_GRANTABLE_CAPABILITIES.slice().sort(),
    );
});
