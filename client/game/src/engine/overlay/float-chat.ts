import { ChatSchema } from '@box/schema/chat/chat-schema';
import { GameClientState } from '../game-client-schema';
import { nowrapEllipsisText } from '../utils/canvas';
import { intlMessage } from 'src/utils/i18n';
import { isPhoneSize } from 'src/utils/mobile';

const FLOAT_CHAT_TOP = 20;
const FLOAT_CHAT_HEIGHT = 36;
const FLOAT_TEXT_PADDING = 32;
const CHAT_TIME = 5000;

const PHONE_FLOAT_TEXT_PADDING = 24;

export function drawFloatChat(state: GameClientState) {
  let duration = state.chat.duration || CHAT_TIME;
  if (duration < 0) {
    duration = Infinity;
  }
  if (state.clock.clock - state.chat.clock > duration) {
    return;
  }

  const content = concatChatMsg(state.chat);
  const context2D = state.overlays.context;
  if (!content || !context2D) {
    return;
  }

  const { width } = context2D.canvas;
  const ratio = window.devicePixelRatio || 1;
  const screenWidth = width / ratio;
  const padding = isPhoneSize() ? PHONE_FLOAT_TEXT_PADDING : FLOAT_TEXT_PADDING;

  context2D.setTransform(ratio, 0, 0, ratio, 0, 0);
  context2D.font = '14px Montserrat-Regular';
  context2D.textAlign = 'center';
  const maxTextWidth = screenWidth * 0.9 - padding * 2;
  const { text, textLen } = nowrapEllipsisText(
    context2D,
    content,
    maxTextWidth,
  );

  const halfLineWidth = textLen / 2 + padding;

  context2D.beginPath();
  const gradient = context2D.createLinearGradient(
    screenWidth / 2 - halfLineWidth,
    FLOAT_CHAT_TOP,
    screenWidth / 2 + halfLineWidth,
    FLOAT_CHAT_TOP,
  );
  gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
  gradient.addColorStop(0.16, 'rgba(0, 0, 0, 0.6)');
  gradient.addColorStop(0.84, 'rgba(0, 0, 0, 0.6)');
  gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
  context2D.fillStyle = gradient;
  context2D.fillRect(
    screenWidth / 2 - halfLineWidth,
    FLOAT_CHAT_TOP,
    halfLineWidth * 2,
    FLOAT_CHAT_HEIGHT,
  );
  context2D.closePath();

  context2D.beginPath();
  context2D.fillStyle = '#FFFFFF';
  context2D.fillText(
    text,
    screenWidth / 2,
    FLOAT_CHAT_TOP + FLOAT_CHAT_HEIGHT / 2,
  );
  context2D.closePath();
}

function concatChatMsg(chat: typeof ChatSchema.identity) {
  const parts: string[] = [];
  if (chat.i18nPrefix) {
    parts.push(intlMessage(chat.i18nPrefix));
  }
  if (chat.text) {
    parts.push(chat.text);
  }
  if (chat.i18nSuffix) {
    parts.push(intlMessage(chat.i18nSuffix));
  }
  return parts.join(' ');
}
