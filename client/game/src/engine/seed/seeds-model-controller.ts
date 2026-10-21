import { GameClientState } from '../game-client-schema';
import { pixelToRay } from '../camera/camera-controller';
import { vec3, vec2, mat3 } from 'gl-matrix';
import { rayHitBox } from '../utils/ray';
import {
  UI3DSeedSpec,
  UI3DEventSchema,
  UI3DMouseEventSchema,
  UI3DEventQueueSchema,
  UI3DEventQueue,
} from '../ui3d/ui3d-schema';
import { renderBoxFromRenderable, computeRenderBox } from './util';

const testRay = vec3.create();
const aa = vec3.create();
const bb = vec3.create();
const hitBoundRes = vec3.create();
const tempBounds = vec3.create();
const tempOffset = vec3.create();

export function handleSeed(
  mousePosition: vec2,
  mouseState: number,
  mouseButton: number,
  eye: vec3,
  events: UI3DEventQueue,
  mouseInEvents: UI3DEventQueue,
  mouseOutEvents: UI3DEventQueue,
  seed: UI3DSeedSpec,
) {
  if (!seed.onMouseChange && !seed.onMouseIn && !seed.onMouseOut) {
    return;
  }

  renderBoxFromRenderable(
    { bounds: tempBounds, offset: tempOffset },
    seed.glRef,
  );

  const { position, dimension } = computeRenderBox({
    position: seed.position,
    orientation: seed.orientation,
    scale: seed.scale,
    renderBoxBounds: tempBounds,
    renderBoxOffset: tempOffset,
  });

  dimension[0] *= 0.5;
  dimension[1] *= 0.5;
  dimension[2] *= 0.5;

  aa[0] = position[0] - dimension[0];
  aa[1] = position[1] - dimension[1];
  aa[2] = position[2] - dimension[2];
  bb[0] = position[0] + dimension[0];
  bb[1] = position[1] + dimension[1];
  bb[2] = position[2] + dimension[2];

  const rst = rayHitBox(aa, bb, eye, testRay, hitBoundRes);
  if (rst) {
    const e = UI3DEventSchema.alloc();
    e.hitDistance = vec3.dist(hitBoundRes, eye);
    e.handler = seed.onMouseChange;
    e.event.type = 'mouse';
    const data = (e.event.data = UI3DMouseEventSchema.alloc());
    data.mouseState = mouseState;
    vec3.copy(data.eye, eye);
    vec2.copy(data.screenPosition, mousePosition);
    vec3.copy(data.worldPosition, hitBoundRes);
    data.mouseButton = mouseButton;
    events.push(e);
    if (seed.mouseOn === false) {
      if (seed.onMouseIn !== undefined && seed.onMouseIn !== null) {
        const e2 = UI3DEventSchema.clone(e);
        e2.handler = seed.onMouseIn;
        mouseInEvents.push(e2);
      }
    }
    seed.mouseOn = true;
  } else {
    if (seed.mouseOn) {
      if (seed.onMouseOut !== undefined && seed.onMouseOut !== null) {
        const e = UI3DEventSchema.alloc();
        e.event.type = 'mouse';
        e.handler = seed.onMouseOut;
        const data = (e.event.data = UI3DMouseEventSchema.alloc());
        data.mouseState = mouseState;
        data.mouseButton = mouseButton;
        // const e = getMouseOutEventObject('mouse', seed.onMouseOut, mouseState, mouseButton);
        mouseOutEvents.push(e);
      }
    }
    seed.mouseOn = false;
    return;
  }
}

function compareEvent(
  a: typeof UI3DEventSchema.identity,
  b: typeof UI3DEventSchema.identity,
) {
  return a.hitDistance - b.hitDistance;
}

export function processSeedEvents(state: GameClientState) {
  const events = UI3DEventQueueSchema.clone(UI3DEventQueueSchema.identity);
  const mouseInEvents = UI3DEventQueueSchema.clone(
    UI3DEventQueueSchema.identity,
  );
  const mouseOutEvents = UI3DEventQueueSchema.clone(
    UI3DEventQueueSchema.identity,
  );

  pixelToRay(state, state.input.mouse[0], state.input.mouse[1], testRay);
  const elements = state.ui3D.elements;
  for (let i = 0; i < elements.length; ++i) {
    const e = elements[i];
    if (e.type === 'seed') {
      handleSeed(
        state.input.mouse,
        state.input.mouseState,
        state.input.mouseButton,
        state.camera.eye,
        events,
        mouseInEvents,
        mouseOutEvents,
        <UI3DSeedSpec>e.data,
      );
    }
  }

  events.sort(compareEvent);
  for (let i = 0; i < events.length; i++) {
    const e = events[i];
    if (!e) {
      return;
    }
    if (e.handler !== null && e.handler(e.event.data)) {
      break;
    }
  }

  for (let i = 0; i < mouseOutEvents.length; i++) {
    const e = mouseOutEvents[i];
    if (e.handler !== null && e.handler(e.event.data)) {
      break;
    }
  }

  mouseInEvents.sort(compareEvent);
  for (let i = 0; i < mouseInEvents.length; i++) {
    const e = mouseInEvents[i];
    if (e.handler !== null && e.handler(e.event.data)) {
      break;
    }
  }

  UI3DEventQueueSchema.free(events);
  UI3DEventQueueSchema.free(mouseInEvents);
  UI3DEventQueueSchema.free(mouseOutEvents);
}
