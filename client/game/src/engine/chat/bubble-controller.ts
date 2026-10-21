import { GameClientState } from '../game-client-schema';
import { getById, compareId } from '@box/utils/id';
import { ChatBubble, ChatBubbleSchema, GIFInfo } from './chat-client-schema';
import { playSoundEffectSpatial } from '../sound/client-sound-controller';
import { MsgType, StickMessage } from '@box/schema/chat/chat-schema';

const CHAT_BUBBLE_TIME = 2000;

export function tickChatBubbles(state: GameClientState) {
  const tick = state.clock.clock;
  const chats = state.events.chat.chats;
  const bubbles = state.chatBubble;
  for (let i = 0; i < chats.length; ++i) {
    const chat = chats[i];
    if (!chat.senderId) {
      continue;
    }

    // allocate new bubble
    const bubble = getById(bubbles, chat.senderId);
    if (bubble) {
      bubble.tick = tick;
      bubble.message = chat.message;
      bubble.msgType = chat.msgType;
      bubble.duration = chat.duration;
      setGIFInfo(state, bubble);
    } else {
      const newBubble = ChatBubbleSchema.alloc();
      newBubble.id = chat.senderId;
      newBubble.message = chat.message;
      newBubble.msgType = chat.msgType;
      newBubble.tick = tick;
      newBubble.duration = chat.duration;
      setGIFInfo(state, newBubble);
      bubbles.push(newBubble);
      bubbles.sort(compareId);
    }

    const sfx = getById(state.replica.sound.entitySound, chat.senderId);
    if (sfx && sfx.chat.sampleId) {
      const box = getById(state.renderBoxes, chat.senderId);
      if (box) {
        playSoundEffectSpatial(
          state,
          sfx.chat,
          box.anchorX,
          box.anchorY,
          box.anchorZ,
        );
      }
    }
  }

  // remove old bubbles from list
  let ptr = 0;
  for (let i = 0; i < bubbles.length; ++i) {
    const bubble = bubbles[i];

    let duration = bubble.duration || CHAT_BUBBLE_TIME;
    if (duration < 0) {
      duration = Infinity;
    }

    const timeout = !bubble.gifInfo && bubble.tick + duration < tick;

    let gifEnd = false;
    if (bubble.gifInfo && !bubble.gifInfo.cycleCount) {
      // 如果播放完成后时间还没超过正常bubble的时长CHAT_BUBBLE_TIME
      // 就让这个gif继续播，否则就停止播放
      if (tick - bubble.gifInfo.startTick < duration) {
        bubble.gifInfo.cycleCount++;
      } else {
        gifEnd = true;
      }
    }

    if (gifEnd || timeout) {
      ChatBubbleSchema.free(bubble);
    } else {
      bubbles[ptr++] = bubble;
    }
  }
  bubbles.length = ptr;
}

function getGIFUrl(state: GameClientState, bubble: ChatBubble) {
  if (bubble.msgType !== MsgType.sticker) {
    return;
  }
  const sticker: StickMessage = JSON.parse(bubble.message);
  const url =
    state.overlays.stickerPackList[sticker.themeId]?.[sticker.stickerId]?.url;
  if (!url) {
    return;
  }
  const type = url.slice(url.lastIndexOf('.') + 1).toLowerCase();
  if (type !== 'gif') {
    return;
  }
  return url;
}

function setGIFInfo(state: GameClientState, bubble: ChatBubble) {
  const gifURL = getGIFUrl(state, bubble);
  if (gifURL) {
    bubble.gifInfo = GIFInfo.clone(GIFInfo.identity);
    bubble.gifInfo.url = gifURL;
  } else {
    bubble.gifInfo = undefined;
  }
}
