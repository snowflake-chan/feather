import { MuRDAList } from '@box/mudb/rda';
import { FileDictRDA } from '@box/schema/code-editor/code-editor-common-state';
import { getMeshPath } from '@box/schema/project/hot-schema';
import { ROOT_ID, TreeNodeType } from '@box/schema/project/murda-tree';
import {
  AssetType,
  EntitiesTreeRDA,
  EntitySeedRDA,
  TreeNode,
} from '@box/schema/project/project-rda';
import { tool } from 'ai';
import { vec3 } from 'gl-matrix';
import { Logger } from 'pino';
import { z } from 'zod';
import { CodeEditorServerController } from '../code-editor/code-editor-server-controller';
import { EditServerState } from '../edit-server-schema';
import { EditReplicaServer } from '../replica/replica-server';

const DEFAULT_SCALE = 1 / 16;

/**
 * 获取错误信息的辅助函数
 */
function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return String(error);
}

export const createScriptTools = (
  state: EditServerState,
  codeEditor: CodeEditorServerController,
  logger: Logger,
) => {
  return {
    listScripts: tool({
      description: 'List all scripts in the project',
      inputSchema: z.object({}),
      execute: async () => {
        logger.info('[AI Tool] Executing listScripts');
        const files = Object.values(state.codeEditor.fileDict).map((f) => ({
          id: f.fileId,
          name: f.name,
          isClient: f.isClient,
          order: f.order,
        }));
        return {
          scripts: files,
          total: files.length,
        };
      },
    }),

    readScript: tool({
      description: 'Read the content of a script',
      inputSchema: z.object({
        fileId: z.string().describe('The ID of the script file'),
      }),
      execute: async ({ fileId }) => {
        logger.info({ fileId }, '[AI Tool] Executing readScript');
        const file = state.codeEditor.fileDict[fileId];
        if (!file) {
          return { success: false, error: 'File not found' };
        }
        return {
          success: true,
          id: file.fileId,
          name: file.name,
          content: file.text,
        };
      },
    }),

    updateScript: tool({
      description:
        'Update the content of a script using insert and remove operations. Operations are applied based on the initial file state.',
      inputSchema: z.object({
        fileId: z.string().describe('The ID of the script file'),
        operations: z
          .array(
            z.object({
              type: z
                .enum(['insert', 'remove'])
                .describe('The type of operation'),
              index: z
                .number()
                .describe(
                  'The index to perform the operation at (based on initial file content)',
                ),
              text: z
                .string()
                .optional()
                .describe('The text to insert (required for insert operation)'),
              count: z
                .number()
                .optional()
                .describe(
                  'The number of characters to remove (required for remove operation)',
                ),
            }),
          )
          .describe('List of operations'),
      }),
      execute: async ({ fileId, operations }) => {
        logger.info({ fileId, operations }, '[AI Tool] Executing updateScript');
        const file = state.codeEditor.fileDict[fileId];
        if (!file) {
          return { success: false, error: 'File not found' };
        }

        const fileStore = codeEditor.fileDictReplica.store.keyIndex[fileId];
        if (!fileStore) {
          return { success: false, error: 'File store not found' };
        }
        const textStore = fileStore.value.stores.text;

        const actions: (typeof FileDictRDA.actionSchema.identity)[] = [];
        const rdaAction = codeEditor.fileDictReplica
          .action()
          .update(fileId)
          .text(textStore);

        try {
          for (const op of operations) {
            if (op.type === 'insert') {
              if (typeof op.text !== 'string') {
                return {
                  success: false,
                  error: 'Insert operation requires text',
                };
              }
              actions.push(rdaAction.insert(op.index, op.text));
            } else if (op.type === 'remove') {
              const count = op.count ?? 1;
              actions.push(rdaAction.remove(op.index, count));
            }
          }

          if (actions.length > 0) {
            for (const action of actions) {
              codeEditor.fileDictReplica.dispatch(action);
            }
          }

          return {
            success: true,
            message: `Script ${file.name} updated with ${operations.length} operations`,
          };
        } catch (error: unknown) {
          return { success: false, error: getErrorMessage(error) };
        }
      },
    }),

    createScript: tool({
      description: 'Create a new script file',
      inputSchema: z.object({
        name: z
          .string()
          .describe('The name of the script file (e.g., "myScript.js")'),
        content: z
          .string()
          .optional()
          .describe('The initial content of the script'),
        isClient: z
          .boolean()
          .optional()
          .describe('Whether it is a client-side script'),
      }),
      execute: async ({ name, content = '', isClient = false }) => {
        logger.info({ name, isClient }, '[AI Tool] Executing createScript');

        if (name === 'index.js' || name === 'clientIndex.js') {
          return {
            success: false,
            error: `Cannot create reserved script: ${name}`,
          };
        }

        const dict = state.codeEditor.fileDict;
        for (const fileId in dict) {
          if (name === dict[fileId].name) {
            return {
              success: false,
              error: 'File with this name already exists',
            };
          }
        }

        const fileId = ((Math.random() * (1 << 30)) >>> 0).toString();
        const finalName = name;

        const fileList = Object.values(dict);
        const highestOrder = fileList.reduce((a, e) => Math.max(a, e.order), 0);

        const file = {
          fileId: fileId,
          text: content,
          name: finalName,
          order: highestOrder + 1,
          isClient,
          isShare: false,
          lockedMapTitle: '',
          lockedMapId: 0,
          isUploading: false,
          size: 0,
        };

        codeEditor.fileDictReplica.dispatch(
          codeEditor.fileDictReplica.action().set(file.fileId, file),
        );

        return {
          success: true,
          fileId,
          message: `Script ${finalName} created`,
        };
      },
    }),

    deleteScript: tool({
      description: 'Delete a script file',
      inputSchema: z.object({
        fileId: z.string().describe('The ID of the script file'),
      }),
      execute: async ({ fileId }) => {
        logger.info({ fileId }, '[AI Tool] Executing deleteScript');
        const file = state.codeEditor.fileDict[fileId];
        if (!file) {
          return { success: false, error: 'File not found' };
        }

        codeEditor.fileDictReplica.dispatch(
          codeEditor.fileDictReplica.action().remove(fileId),
        );

        return {
          success: true,
          message: `Script ${file.name} deleted`,
        };
      },
    }),
  };
};

export const createEntityTools = (
  replica: EditReplicaServer,
  state: EditServerState,
  gameId: number,
  logger: Logger,
) => {
  return {
    createEntity: tool({
      description: 'Create a new entity in the project',
      inputSchema: z.object({
        name: z.string().describe('The name of the entity'),
        parentId: z
          .string()
          .optional()
          .describe(
            'The ID of the parent entity. If not provided, it will be a root entity.',
          ),
        position: z
          .array(z.number())
          .length(3)
          .optional()
          .describe(
            'The position [x, y, z] of the entity (based on the center of the entity)',
          ),
        mesh: z
          .string()
          .optional()
          .describe('The mesh path for the entity (e.g., "mesh/cube.vb")'),
        tags: z.array(z.string()).optional().describe('Tags for the entity'),
      }),
      execute: async ({ name, parentId, position, mesh, tags }) => {
        logger.info(
          { name, parentId, position, mesh, tags },
          '[AI Tool] Executing createEntity',
        );
        try {
          const tx = replica.projectTransaction();
          const entityId = ((Math.random() * (1 << 30)) >>> 0).toString();

          tx.push((action) => {
            const newNode = EntitiesTreeRDA.nodeSchema.alloc();
            const defaultState = EntitySeedRDA.stateSchema.identity;

            newNode.id = entityId;
            newNode.name = name;
            newNode.parentId = parentId || ROOT_ID;
            newNode.type = TreeNodeType.leaf;

            // Initialize with default values and overrides
            newNode.value = {
              ...defaultState,
              name: name,
              position: position
                ? (position as [number, number, number])
                : defaultState.position,
              mesh: mesh || defaultState.mesh,
              tags: tags || defaultState.tags,
            };

            return action.entitiesTree.add(newNode);
          });

          await tx.commit();
          return {
            success: true,
            entityId,
            message: `Entity '${name}' created with ID ${entityId}`,
          };
        } catch (error: unknown) {
          return { success: false, error: getErrorMessage(error) };
        }
      },
    }),

    deleteEntity: tool({
      description: 'Delete entities from the project',
      inputSchema: z.object({
        entityIds: z
          .array(z.string())
          .describe('The IDs of the entities to delete'),
      }),
      execute: async ({ entityIds }) => {
        logger.info({ entityIds }, '[AI Tool] Executing deleteEntity');
        try {
          const tx = replica.projectTransaction();
          tx.push((action) => {
            return action.entitiesTree.remove(entityIds);
          });
          await tx.commit();
          return {
            success: true,
            message: `Entities ${entityIds.join(', ')} deleted`,
          };
        } catch (error: unknown) {
          return { success: false, error: getErrorMessage(error) };
        }
      },
    }),

    updateEntity: tool({
      description: 'Update properties of an entity',
      inputSchema: z.object({
        entityId: z.string().describe('The ID of the entity to update'),
        properties: z
          .record(z.string(), z.any())
          .describe(
            'The properties to update (e.g., { position: [0, 10, 0], name: "New Name" })',
          ),
      }),
      execute: async ({ entityId, properties }) => {
        logger.info(
          { entityId, properties },
          '[AI Tool] Executing updateEntity',
        );
        try {
          const tx = replica.projectTransaction();

          // Helper to check if RDA is a list
          const isRDAList = (rda: unknown): rda is MuRDAList<any> => {
            return rda instanceof MuRDAList;
          };

          // Recursive update function
          const updateEntityProperties = (
            id: string,
            data: Record<string, any>,
            schemaSpec = EntitySeedRDA.rdas,
            parentPath: string = '',
          ) => {
            Object.entries(data).forEach(([key, value]) => {
              if (value === null || value === undefined) {
                return;
              }

              const fullPath = parentPath ? `${parentPath}.${key}` : key;
              const currentSchema = schemaSpec[key];

              if (currentSchema && isRDAList(currentSchema)) {
                // Handle list replacement
                tx.push((action) => {
                  const updateNode = action.entitiesTree.update(id);
                  // @ts-ignore - Dynamic access
                  return updateNode[key].splice(0, Infinity, ...value);
                });
              } else if (
                currentSchema &&
                currentSchema.rdas &&
                typeof value === 'object' &&
                !Array.isArray(value)
              ) {
                // Handle nested struct
                updateEntityProperties(id, value, currentSchema.rdas, fullPath);
              } else if (
                typeof value === 'object' &&
                !Array.isArray(value) &&
                !currentSchema
              ) {
                // Handle nested object without explicit schema at this level (if any)
                const flattenedData: Record<string, any> = {};
                Object.entries(value).forEach(([k, v]) => {
                  flattenedData[`${key}.${k}`] = v;
                });
                updateEntityProperties(id, flattenedData, schemaSpec, '');
              } else {
                // Handle scalar or register
                tx.push((action) => {
                  let updateNode = action.entitiesTree.update(id);
                  const pathParts = fullPath.split('.');

                  for (const part of pathParts.slice(0, -1)) {
                    updateNode = updateNode[part];
                  }

                  const lastPart = pathParts[pathParts.length - 1];
                  if (
                    updateNode &&
                    typeof updateNode[lastPart] === 'function'
                  ) {
                    return updateNode[lastPart](value);
                  } else {
                    // Fallback or error if path is invalid
                    console.warn(
                      `Invalid path or method for property update: ${fullPath}`,
                    );
                  }
                });
              }
            });
          };

          updateEntityProperties(entityId, properties);
          await tx.commit();
          return { success: true, message: `Entity ${entityId} updated` };
        } catch (error: unknown) {
          return { success: false, error: getErrorMessage(error) };
        }
      },
    }),

    listEntities: tool({
      description: 'List all entities in the project to find IDs and details',
      inputSchema: z.object({}),
      execute: async () => {
        logger.info('[AI Tool] Executing listEntities');
        const entitiesTree = state.replica.project.entitiesTree;
        // Use unknown for type assertion to avoid direct any usage
        const entities = Object.values(entitiesTree).map((node: any) => ({
          id: node.id,
          name: node.value?.name,
          parentId: node.parentId,
          position: node.value?.position,
          mesh: node.value?.mesh,
        }));
        return {
          entities: entities.slice(0, 50),
          total: entities.length,
          note: 'Showing first 50 entities',
        };
      },
    }),

    moveEntity: tool({
      description: 'Move an entity to a new position',
      inputSchema: z.object({
        entityId: z.string().describe('The ID of the entity to move'),
        position: z
          .array(z.number())
          .length(3)
          .describe(
            'The new position [x, y, z] (based on the center of the entity)',
          ),
      }),
      execute: async ({ entityId, position }) => {
        logger.info({ entityId, position }, '[AI Tool] Executing moveEntity');
        try {
          const tx = replica.projectTransaction();
          tx.push((action) => {
            return action.entitiesTree
              .update(entityId)
              .position(position as [number, number, number]);
          });
          await tx.commit();
          return {
            success: true,
            message: `Entity ${entityId} moved to ${position}`,
          };
        } catch (error: unknown) {
          return { success: false, error: getErrorMessage(error) };
        }
      },
    }),
    /**
     * Client side entity copy tool
     */
    copyEntities: tool({
      description: 'Copy an entity',
      inputSchema: z.object({
        entityIds: z
          .array(z.string())
          .describe('The IDs of the entities to copy'),
      }),
      execute: async ({ entityIds }) => {
        logger.info({ entityIds }, '[AI Tool] Executing copyEntities');
        try {
          const entitiesTree = state.replica.project.entitiesTree;
          const newIds: string[] = [];

          const genNodeId = (newIds: string[]) => {
            let shift = 0;
            const checkIds = Object.keys(entitiesTree);
            checkIds.push(...newIds);
            while (true) {
              shift = Math.max(30, shift + 7);
              const id = (Math.random() * (1 << shift)) >>> 0;
              const idStr = id.toString();
              if (!checkIds.includes(idStr)) {
                return idStr;
              }
            }
          };

          const copyNode = (
            id: string,
            newIds: string[],
            parentId?: string,
          ) => {
            const node = entitiesTree[id];
            if (!node) {
              return;
            }

            const newNode = EntitiesTreeRDA.nodeSchema.clone(node);
            newNode.id = genNodeId(newIds);
            newIds.push(newNode.id);

            if (parentId) {
              newNode.parentId = parentId;
            }

            const nodesInfo: {
              newNode: TreeNode;
              newChildrenNodes: TreeNode[];
            } = {
              newNode,
              newChildrenNodes: [],
            };

            if (!node.childrenIds.length) {
              return nodesInfo;
            }

            newNode.childrenIds.length = 0;
            node.childrenIds.forEach((childId) => {
              const childNodesInfo = copyNode(childId, newIds, newNode.id);
              if (!childNodesInfo) {
                return;
              }

              nodesInfo.newNode.childrenIds.push(childNodesInfo.newNode.id);
              nodesInfo.newChildrenNodes.push(childNodesInfo.newNode);
              nodesInfo.newChildrenNodes.push(
                ...childNodesInfo.newChildrenNodes,
              );
            });

            return nodesInfo;
          };

          const copyNodes: {
            sourceNodeId: string;
            newNode: TreeNode;
            newChildrenNodes: TreeNode[];
          }[] = [];

          entityIds.forEach((nodeId) => {
            const newInfo = copyNode(nodeId, newIds);
            if (!newInfo) {
              return;
            }

            copyNodes.push({
              sourceNodeId: nodeId,
              newNode: newInfo.newNode,
              newChildrenNodes: newInfo.newChildrenNodes,
            });
          });

          const tx = replica.projectTransaction();
          tx.push((action) => action.entitiesTree.copy(copyNodes));
          await tx.commit();

          return {
            success: true,
            message: `Entities ${entityIds.join(', ')} copied`,
            newEntityIds: copyNodes.map((n) => n.newNode.id),
          };
        } catch (error: unknown) {
          return { success: false, error: getErrorMessage(error) };
        }
      },
    }),

    getProjectModels: tool({
      description: 'Get the list of available models for the project',
      inputSchema: z.object({
        limit: z
          .number()
          .optional()
          .describe('Limit the number of models returned'),
        offset: z.number().optional().describe('Offset for pagination'),
        modelName: z.string().optional().describe('Filter by model name'),
      }),
      execute: async ({ limit = 20, offset = 0, modelName }) => {
        logger.info(
          { limit, offset, modelName },
          '[AI Tool] Executing getProjectModels',
        );
        try {
          const meshAssets = state.replica.extraProjectInfo.meshAssets;
          let models = Object.entries(meshAssets).map(([key, m]) => {
            const name = key.replace(/^mesh\//, '').replace(/\.vb$/, '');
            return {
              id: m.modelId,
              name: name,
            };
          });

          if (modelName) {
            const lowerName = modelName.toLowerCase();
            models = models.filter((m) =>
              m.name.toLowerCase().includes(lowerName),
            );
          }

          const total = models.length;
          const paginatedModels = models.slice(offset, offset + limit);

          return {
            success: true,
            models: paginatedModels,
            total,
          };
        } catch (error: unknown) {
          return { success: false, error: getErrorMessage(error) };
        }
      },
    }),

    searchPublicModels: tool({
      description: 'Search for public models to use in the project',
      inputSchema: z.object({
        query: z.string().describe('The search query for the model name'),
        limit: z.number().optional().describe('Limit the number of results'),
        offset: z.number().optional().describe('Offset for pagination'),
      }),
      execute: async ({ query, limit = 20, offset = 0 }) => {
        logger.info(
          { query, limit, offset },
          '[AI Tool] Executing searchPublicModels',
        );
        return {
          success: true,
          models: [],
          total: 0,
          message: 'Public model search is unavailable in the local engine.',
        };
      },
    }),

    addModelToProject: tool({
      description: 'Add public models to the project assets',
      inputSchema: z.object({
        modelIds: z
          .array(z.number())
          .describe('The IDs of the public models to add'),
      }),
    }),

    createEntityFromModel: tool({
      description: 'Create a new entity from a model in the project',
      inputSchema: z.object({
        modelId: z.number().describe('The ID of the model to use'),
        name: z.string().optional().describe('The name of the entity'),
        parentId: z
          .string()
          .optional()
          .describe(
            'The ID of the parent entity. If not provided, it will be a root entity.',
          ),
        position: z
          .array(z.number())
          .length(3)
          .optional()
          .describe(
            'The position [x, y, z] of the entity (based on the center of the entity)',
          ),
      }),
      execute: async ({ modelId, name, parentId, position }) => {
        logger.info(
          { modelId, name, parentId, position },
          '[AI Tool] Executing createEntityFromModel',
        );
        try {
          // 1. Get model details
          let modelData:
            | { modelFileHash: string; modelName: string }
            | undefined;

          // Try to find model in project assets first
          const meshAssets = state.replica.extraProjectInfo.meshAssets;
          const foundEntry = Object.entries(meshAssets).find(
            ([_, m]) => m.modelId === modelId,
          );

          if (foundEntry) {
            const [key, m] = foundEntry;
            modelData = {
              modelFileHash: m.hash,
              modelName: key.replace(/^mesh\//, '').replace(/\.vb$/, ''),
            };
          }

          if (!modelData) {
            return { success: false, error: 'Model not found' };
          }

          // 2. Get model metadata
          // Try to get from bake cache first
          let metaData = await state.bakeCache.getMeshInfo(
            modelData.modelFileHash,
            AssetType.VOXEL_MODEL,
          );

          if (!metaData) {
            // If not in cache, getMeshInfo usually handles retrieval
            return {
              success: false,
              error: 'Failed to retrieve model metadata',
            };
          }

          // 3. Create entity
          const tx = replica.projectTransaction();
          const entityId = ((Math.random() * (1 << 30)) >>> 0).toString();

          tx.push((action) => {
            const newNode = EntitiesTreeRDA.nodeSchema.alloc();
            const defaultState = EntitySeedRDA.stateSchema.identity;

            newNode.id = entityId;
            newNode.name = name || modelData.modelName || 'Entity';
            newNode.parentId = parentId || ROOT_ID;
            newNode.type = TreeNodeType.leaf;

            // Calculate bounds and position
            const bounds = vec3.fromValues(
              metaData.bounds[0],
              metaData.bounds[1],
              metaData.bounds[2],
            );

            // Use provided position or default to [0,0,0]
            const pos = position
              ? vec3.fromValues(position[0], position[1], position[2])
              : vec3.create();

            // Adjust position based on bounds and renderBoxOffset (similar to frontend logic)
            // Note: Frontend logic aligns "bottom-left" with cursor. Here we might want to center it or just place it at the given position.
            // If we want to place the center of the model at 'pos':
            // The model's origin is usually at the bottom center or corner depending on how it was built.
            // Let's stick to the raw position for now, but we need to set the bounds correctly.

            const formatName = getMeshPath(modelData.modelName || '');
            const defaultMotionId =
              metaData.motionList && metaData.motionList.length
                ? metaData.motionList[0].id
                : '';

            newNode.value = {
              ...defaultState,
              name: name || modelData.modelName || 'Entity',
              position: [pos[0], pos[1], pos[2]],
              mesh: formatName || defaultState.mesh,
              meshId: modelId,
              defaultMotionId: defaultMotionId,
              bounds: [bounds[0], bounds[1], bounds[2]],
              scale: [DEFAULT_SCALE, DEFAULT_SCALE, DEFAULT_SCALE],
              tint: [255, 255, 255, 255],
            };

            return action.entitiesTree.add(newNode);
          });

          await tx.commit();
          return {
            success: true,
            entityId,
            message: `Entity '${name || modelData.modelName}' created from model ${modelId}`,
          };
        } catch (error: unknown) {
          return { success: false, error: getErrorMessage(error) };
        }
      },
    }),
  };
};
