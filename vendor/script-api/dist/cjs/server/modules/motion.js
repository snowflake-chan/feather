"use strict";
/**
 * 实体动作相关
 *
 * ```js
 * const entity = world.createEntity();
 * const entityMotionControl = entity.motion; // MotionController
 * const motion = entityMotionControl.loadByName('FirstMotion'); // MotionHandler
 * motion.onFinish(() => {
 *  console.log('Motion End');
 * });
 * motion.play()
 *  .then(() => { console.log('Motion End with Promise')})
 *  .catch((err) => {
 *    console.log('Motion play error')
 *  })
 * ```
 * @module 动作
 */
Object.defineProperty(exports, "__esModule", { value: true });
//# sourceMappingURL=motion.js.map