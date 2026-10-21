import { AdminUser } from '@box/schema/admin/admin-protocol';
import { AssetType, EntitySeedRDA } from '@box/schema/project/project-rda';
import { quat, vec3, vec4 } from 'gl-matrix';
import React, { useEffect } from 'react';
import { createRoot, Root } from 'react-dom/client';
import { AssetController } from 'src/client/edit/state-controller/asset-controller';
import { SeedController } from 'src/client/edit/state-controller/seed-controller';
import { DEFAULT_SCALE } from 'src/defs/modelScale';

import type { GameAdminClient } from '../admin-client';
import style from './index.module.css';

interface AdminContainerProps {
  hide: () => void;
  toggleUI: () => void;
  setGhost: (x: boolean) => void;
  ban: (userId: number) => void;
  banIp: (ipAddres: string) => void;
  kick: (userId: number) => void;
  alert: (userId: number, message: string) => void;
  redirect: (userId: number, href: string) => void;

  setFOV: (fov: number) => void;
  fov: number;
  setDrawDistance: (drawDistance: number) => void;
  drawDistance: number;
  setFreezeFov: (val: boolean) => void;
  freezeFov: boolean;
  setFreezeDrawDistance: (val: boolean) => void;
  freezeDrawDistance: boolean;

  stopScripts: () => void;
  reloadProject: () => void;
  selfDestruct: () => void;
  restartContainer: () => void;
  users: AdminUser[];
  assetController?: AssetController;
  seedController?: SeedController;
  uploadImage?: (
    imageData: ArrayBuffer,
    type: string,
    width: number,
    height: number,
    cb: (imageHash: string) => void,
  ) => void;
  updateHash: (hash: string) => void;
  closeWebSocket: () => void;
  logCurrentStore: () => void;
  storeGLB?: (
    glb: ArrayBuffer,
  ) => Promise<{ metaDataHash: string; bounds: vec3 }>;
}

export interface AdminContainerState {
  selectedId: number;
}

const _allocSeedFromImage = (imgHashName: string) => {
  const newSeed = EntitySeedRDA.stateSchema.alloc();
  newSeed.mesh = imgHashName;
  newSeed.name = imgHashName;

  vec3.set(newSeed.scale, DEFAULT_SCALE, DEFAULT_SCALE, DEFAULT_SCALE);
  vec3.copy(newSeed.position, vec3.fromValues(64, 10, 64));
  vec4.set(newSeed.tint, 255, 255, 255, 255);
  quat.identity(newSeed.orientation);
  return newSeed;
};

const _allocSeedFromGLB = (glbHashName: string) => {
  const newSeed = EntitySeedRDA.stateSchema.alloc();

  newSeed.mesh = glbHashName;
  newSeed.name = glbHashName;

  vec3.set(newSeed.scale, 1, 1, 1);
  // TODO 出生点
  vec3.copy(newSeed.position, vec3.fromValues(29, 10, 29));
  vec4.set(newSeed.tint, 255, 255, 255, 255);
  quat.identity(newSeed.orientation);
  return newSeed;
};

export class AdminContainer extends React.Component<
  AdminContainerProps,
  AdminContainerState
> {
  public state: AdminContainerState = {
    selectedId: -1,
  };

  public render() {
    let selectedUser: null | AdminUser = null;
    for (let i = 0; i < this.props.users.length; ++i) {
      if (this.props.users[i].entityId === this.state.selectedId) {
        selectedUser = this.props.users[i];
        break;
      }
    }
    return (
      <div className={style.adminPanel}>
        <p>
          <input
            style={{ pointerEvents: 'auto' }}
            type="button"
            value="hide"
            onClick={() => this.props.hide()}
          />
          <input
            style={{ pointerEvents: 'auto' }}
            type="button"
            value="toggle ui"
            onClick={() => this.props.toggleUI()}
          />
          <input
            style={{ pointerEvents: 'auto' }}
            type="button"
            value="ghost on"
            onClick={() => this.props.setGhost(true)}
          />
          <input
            style={{ pointerEvents: 'auto' }}
            type="button"
            value="ghost off"
            onClick={() => this.props.setGhost(false)}
          />
          <input
            style={{ pointerEvents: 'auto' }}
            type="button"
            value="stop scripts"
            onClick={() => {
              if (window.confirm('really stop all scripts?')) {
                this.props.stopScripts();
              }
            }}
          />
          <input
            style={{ pointerEvents: 'auto' }}
            type="button"
            value="reload project"
            onClick={() => {
              if (window.confirm('really reload project?')) {
                this.props.reloadProject();
              }
            }}
          />
          <input
            style={{ pointerEvents: 'auto' }}
            type="button"
            value="close socket"
            onClick={() => {
              if (window.confirm('really close socket?')) {
                this.props.closeWebSocket();
              }
            }}
          />
          <input
            style={{ pointerEvents: 'auto' }}
            type="button"
            value="log store"
            onClick={() => {
              if (window.confirm('really log store?')) {
                this.props.logCurrentStore();
              }
            }}
          />
          <br />
          FOV:{' '}
          <input
            style={{ pointerEvents: 'auto' }}
            type="checkbox"
            checked={this.props.freezeFov}
            onChange={(ev) => this.props.setFreezeFov(ev.target.checked)}
          />
          <input
            style={{ pointerEvents: 'auto' }}
            type="range"
            disabled={!this.props.freezeFov}
            min={0.01 * Math.PI}
            max={Math.PI}
            step={0.01}
            value={this.props.fov}
            onChange={(ev) => this.props.setFOV(+ev.target.value)}
          />
          Draw distance:{' '}
          <input
            style={{ pointerEvents: 'auto' }}
            type="checkbox"
            checked={this.props.freezeDrawDistance}
            onChange={(ev) =>
              this.props.setFreezeDrawDistance(ev.target.checked)
            }
          />
          <input
            style={{ pointerEvents: 'auto' }}
            type="range"
            disabled={!this.props.freezeDrawDistance}
            min={1}
            max={4096}
            step={1}
            value={this.props.drawDistance}
            onChange={(ev) => this.props.setDrawDistance(+ev.target.value)}
          />
          <br />
          <input
            style={{ pointerEvents: 'auto', backgroundColor: '#f00' }}
            type="button"
            value="exit process"
            onClick={() => {
              const userInput = window.prompt(
                'this will restart the container without update.  type OK to confirm',
              );
              if (userInput === 'OK') {
                this.props.selfDestruct();
              }
            }}
          />
          <input
            style={{ pointerEvents: 'auto', backgroundColor: 'yellow' }}
            type="button"
            value="restart container"
            onClick={() => {
              const userInput = window.prompt(
                'this will restart the container with update.  type OK to confirm',
              );
              if (userInput === 'OK') {
                this.props.restartContainer();
              }
            }}
          />
          <input
            style={{ pointerEvents: 'auto' }}
            type="button"
            value="update hash(edit only)"
            onClick={() => {
              const userInput = window.prompt(
                'enter the hash, leave blank to cancel',
              );
              if (userInput) {
                this.props.updateHash(userInput);
              }
            }}
          />
        </p>
        <p>
          <input
            style={{ pointerEvents: 'auto' }}
            disabled={!selectedUser}
            type="button"
            value="ban"
            onClick={() => this.props.ban(this.state.selectedId)}
          />
          <input
            style={{ pointerEvents: 'auto' }}
            disabled={!selectedUser}
            type="button"
            value="ban ip"
            onClick={() =>
              selectedUser && this.props.banIp(selectedUser.ipAddress)
            }
          />
          <input
            style={{ pointerEvents: 'auto' }}
            disabled={!selectedUser}
            type="button"
            value="kick"
            onClick={() => this.props.kick(this.state.selectedId)}
          />
          <input
            style={{ pointerEvents: 'auto' }}
            disabled={!selectedUser}
            type="button"
            value="alert"
            onClick={() => {
              if (selectedUser) {
                const message = window.prompt(
                  `send alert to ${selectedUser.name}`,
                );
                if (message) {
                  this.props.alert(this.state.selectedId, message);
                }
              }
            }}
          />
          <input
            style={{ pointerEvents: 'auto' }}
            disabled={!selectedUser}
            type="button"
            value="redirect"
            onClick={() => {
              if (selectedUser) {
                const href = window.prompt(
                  `redirect ${selectedUser.name} to which url?`,
                );
                if (href) {
                  this.props.redirect(this.state.selectedId, href);
                }
              }
            }}
          />
        </p>
        {this.props.uploadImage &&
          this.props.assetController &&
          this.props.seedController && (
            <div>
              <input
                value="upload image"
                type="button"
                onClick={() => {
                  const inputEle = document.createElement('input');
                  inputEle.type = 'file';
                  inputEle.accept = '.png, .jpg, .jpeg';
                  inputEle.onchange = () => {
                    if (!inputEle.files?.length) {
                      return;
                    }
                    const file = inputEle.files[0];
                    const reader = new FileReader();
                    reader.readAsArrayBuffer(file);
                    reader.onload = () => {
                      const blob = new Blob([reader.result as ArrayBuffer], {
                        type: 'image/jpeg',
                      });
                      const img = new Image();
                      img.src = URL.createObjectURL(blob);
                      img.onload = () => {
                        const defaultSize = `${img.width}x${img.height}`;
                        const type = file.name
                          .slice(file.name.lastIndexOf('.') + 1)
                          .toLowerCase();
                        const sizes = (
                          prompt('image size', defaultSize) || defaultSize
                        ).split('x');
                        const width = parseInt(sizes[0]);
                        const height = parseInt(sizes[1]);
                        this.props.uploadImage!(
                          reader.result as ArrayBuffer,
                          type,
                          width,
                          height,
                          (imgHash) => {
                            this.props.assetController!.addImageToProject(
                              {
                                name: file.name,
                                hash: imgHash,
                              },
                              Date.now(),
                            );
                          },
                        );
                      };
                    };
                  };
                  inputEle.click();
                }}
              />
              {this.props.assetController
                .getAssetsList(AssetType.IMAGE)
                .map((name, index) => {
                  return (
                    <div style={{ color: 'white' }} key={index}>
                      {name}
                      <input
                        value="create image entity"
                        type="button"
                        onClick={() => {
                          const newSeed = _allocSeedFromImage(name);
                          this.props.seedController!.addSeed(
                            this.props.seedController!.genNodeId(),
                            newSeed,
                          );
                        }}
                      />
                    </div>
                  );
                })}
            </div>
          )}

        {this.props.storeGLB &&
          this.props.assetController &&
          this.props.seedController && (
            <div>
              <input
                value="upload GLB"
                type="button"
                onClick={() => {
                  const inputEle = document.createElement('input');
                  inputEle.type = 'file';
                  inputEle.accept = '.glb';
                  inputEle.onchange = () => {
                    if (!inputEle.files?.length) {
                      return;
                    }
                    const file = inputEle.files[0];
                    const reader = new FileReader();
                    reader.readAsArrayBuffer(file);
                    reader.onload = async () => {
                      if (
                        !this.props.assetController ||
                        !reader.result ||
                        !(reader.result instanceof ArrayBuffer)
                      ) {
                        return;
                      }

                      let res:
                        | { metaDataHash: string; bounds: vec3 }
                        | undefined;

                      try {
                        res = await this.props.storeGLB?.(reader.result);
                      } catch (err) {
                        console.error('error', err);
                      }

                      if (!res) {
                        return;
                      }

                      this.props.assetController.addGLBToProject(
                        {
                          name: file.name,
                          hash: res.metaDataHash,
                          bounds: res.bounds,
                        },
                        new Date().getTime(),
                      );
                    };
                  };
                  inputEle.click();
                }}
              />
              {this.props.assetController
                .getAssetsList(AssetType.GLTF_MODEL)
                .map((name, index) => {
                  return (
                    <div style={{ color: 'white' }} key={index}>
                      {name}
                      <input
                        value="create glb entity"
                        type="button"
                        onClick={() => {
                          console.log('name', name);
                          const newSeed = _allocSeedFromGLB(name);
                          console.log('newSeed', newSeed);

                          // newSeed.
                          // newSeed.damage
                          this.props.seedController!.addSeed(
                            this.props.seedController!.genNodeId(),
                            newSeed,
                          );
                        }}
                      />
                      <input
                        value="remove"
                        type="button"
                        onClick={() => {
                          this.props.assetController?.removeGLBFromProject(
                            name,
                          );
                        }}
                      />
                    </div>
                  );
                })}
            </div>
          )}

        {this.props.users.map(({ entityId, userId, name, ipAddress }) => {
          return (
            <div
              key={entityId}
              style={{
                pointerEvents: 'auto',
                backgroundColor:
                  entityId === this.state.selectedId ? '#f00' : '#fff',
                width: '400px',
              }}
              onClick={() => this.setState({ selectedId: entityId })}
            >
              {name} cmid={userId} ip={ipAddress} id={entityId}
            </div>
          );
        })}
      </div>
    );
  }
}

export function useAdmin(admin: GameAdminClient | undefined) {
  useEffect(() => {
    if (!admin) {
      return;
    }

    const onFrame = () => renderAdmin(admin);

    admin.app.game.onFrame.sub(onFrame);

    if (admin.adminConsole) {
      admin.adminConsole.initAdminPanel();
    } else {
      console.warn('admin console did not init properly');
    }

    return () => {
      admin.app.game.onFrame.unsub(onFrame);
      admin.adminConsole?.closeAdminPanel();
    };
  }, [admin]);
}

function renderAdmin(client: GameAdminClient) {
  if (!adminRoot) {
    if (!containerElement) {
      return;
    }

    adminRoot = createRoot(containerElement);
  }

  adminRoot.render(
    <AdminContainer
      drawDistance={client.app.game.state.environment.drawDistance}
      setDrawDistance={(v: number) =>
        (client.app.game.state.environment.drawDistance = v)
      }
      freezeDrawDistance={client.app.game.state.environment.freezeDrawDistance}
      setFreezeDrawDistance={(freezed: boolean) =>
        (client.app.game.state.environment.freezeDrawDistance = freezed)
      }
      fov={client.app.game.state.camera.fovY}
      setFOV={(v: number) => (client.app.game.state.camera.fovY = v)}
      freezeFov={client.app.game.state.camera.freezeFovY}
      setFreezeFov={(freezed: boolean) =>
        (client.app.game.state.camera.freezeFovY = freezed)
      }
      hide={() => {
        hideAdmin();
        client.adminConsole?.closeAdminPanel();
      }}
      toggleUI={client.toggleUI}
      ban={client.banUser}
      banIp={client.banIP}
      alert={client.alert}
      redirect={client.redirect}
      kick={client.kickUser}
      setGhost={client.setGhost}
      users={client.users()}
      stopScripts={client.stopScripts}
      reloadProject={client.reloadProject}
      selfDestruct={client.selfDestruct}
      restartContainer={client.restartContainer}
      uploadImage={client.rpc && client.rpc.uploadImage}
      updateHash={client.updateHash}
      assetController={client.assetController}
      seedController={client.seedController}
      closeWebSocket={client.closeWebSocket}
      logCurrentStore={client.logCurrentStore}
      storeGLB={client.editContentStorage && client.editContentStorage.storeGLB}
    />,
  );
}

let containerElement: HTMLDivElement | null = null;
let adminRoot: Root | null = null;

export function showAdmin() {
  if (containerElement) {
    return;
  }

  containerElement = document.createElement('div');
  containerElement.id = 'adminContainer';

  Object.assign(containerElement.style, {
    'position': 'fixed',
    'top': '0',
    'left': '0',
    'z-index': '10000',
    'width': '100%',
    'height': '100%',
    'pointer-events': 'none',
  });
  document.body.appendChild(containerElement);
}

export function hideAdmin() {
  if (adminRoot !== null) {
    adminRoot.unmount();
    adminRoot = null;
  }

  if (containerElement !== null) {
    containerElement.remove();
    containerElement = null;
  }
}
