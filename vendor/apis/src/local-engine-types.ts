import type { components } from './generated/openapi';

type Schemas = components['schemas'];

/** Public Local Engine transport types. They are generated from OpenAPI. */
export type Actor = Schemas['PlayerAdminActor'];
export type Player = Schemas['Player'];
export type PlayerSelfProfile = Schemas['PlayerSelfProfile'];
export type Activity = Schemas['PlayerAdminActivity'];
export type Admin = Schemas['PlayerAdminAccount'];
export type Group = Schemas['PermissionGroup'];
export type IdentityBan = Schemas['IdentityBan'];
export type RuntimeStatus = Schemas['RuntimeStatus'];
export type ContainerProfile = Schemas['ContainerProfile'];
export type ContainerResourceGroup = Schemas['ContainerResourceGroup'];
export type ContainerMapChoice = Schemas['ContainerMapChoice'];
export type ContainerMap = Schemas['ContainerMap'];
export type ContainerCatalog = Schemas['ContainerCatalog'];
export type PlayMap = Schemas['PlayMap'];
export type PlayMapResourceStatus = Schemas['PlayMapResourceStatus'];
