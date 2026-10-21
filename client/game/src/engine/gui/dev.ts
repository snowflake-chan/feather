// @ts-nocheck

/*
USAGE:
budo src/engine/gui/dev.ts -o -l -- --debug -p [ tsify --project node.tsconfig.json ]
*/

import { GUIClient } from './gui-client';
import {
  createLocalSocket,
  createLocalSocketServer,
} from '@box/mudb/socket/local';
import { MuClient, MuServer } from '@box/mudb';
import { GUIProtocol } from './gui-protocol';

const socketServer = createLocalSocketServer();
const server = new MuServer(socketServer);
const protocol = server.protocol(GUIProtocol);
protocol.configure({
  message: {
    return: (_, data) => {
      console.log('client returned:', data);
    },
    throw: (_, data) => {
      console.log('client thrown:', data);
    },
    sendMessage: (_, data) => {
      console.log('client sent message:', data);
    },
  },
  connect: (c) => {
    c.message.init({
      handle: 0,
      data: JSON.stringify(guiData),
    });
  },
});
server.start();

const clientSocket = createLocalSocket({
  sessionId: Math.random().toString(36).substring(2),
  server: socketServer,
});
const client = new MuClient(clientSocket);
const canvas = document.createElement('canvas');
const container = document.createElement('div');
container.append(canvas);
document.body.append(container);
const ctx = canvas.getContext('2d')!;
const gui = new GUIClient({
  client,
  state: {
    dom: {
      canvas,
    },
  } as any,
});
gui.setContext(ctx);
client.start();

container.style.position = canvas.style.position = 'absolute';
container.style.top = canvas.style.top = '0';
container.style.bottom = canvas.style.bottom = '0';
container.style.left = canvas.style.left = '0';
container.style.right = canvas.style.right = '0';
container.style.width = canvas.style.width = '100%';
container.style.height = canvas.style.height = '100%';
container.style.border = canvas.style.border = document.body.style.border = '0';
container.style.margin = canvas.style.margin = document.body.style.margin = '0';
container.style.padding =
  canvas.style.padding =
  document.body.style.padding =
    '0';

Object.assign(window, {
  gui,
  client,
  server,
  protocol,
});

(function render() {
  const bounds = container.getBoundingClientRect();
  const ratio = devicePixelRatio;
  canvas.width = bounds.width * ratio;
  canvas.height = bounds.height * ratio;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  gui.draw();

  requestAnimationFrame(render);
})();

const ui = gui.stage.ui;

const guiData = {
  'test-label': {
    display: true,
    data: ui.label({
      lineHeight: 5,
      left: 200,
      right: 200,
      top: 200,
      bottom: 200,
      text: `你好啦
        阿萨德噶啥搭嘎是的
        阿萨德噶十多个
        撒大概我很卡说不定鬼獒四大金刚哈扫地杆哈撒给哈上东国际阿斯U盾很怪以阿萨德换个卡但是感觉卡萨丁换个卡死的科技感 sad科技馆哈迪斯空间换个卡见多识广交换机阿萨德刚
        `.repeat(5),
    }),
  },
  'copy-button': {
    display: true,
    bindings: [
      {
        event: 'click',
        action: 'clipboardWrite',
        targetSelector: 'label',
        attributeName: 'text',
      },
    ],
    data: `<button text="copy to clipboard"  width="100" height="50" left="10" top="300"/>
        `,
  },
  'image-button': {
    display: true,
    bindings: [
      {
        event: 'click',
        action: 'show',
        name: 'dialog',
        // event: 'click',
        // action: 'sendMessage',
        // messageName: 'message_open1',
      },
    ],
    data: `<imagebutton left="10" top="350" width="115" height="56">
            <image state="normal" width="100%" height="100%" src="https://static.createra.fun/block/QmVXjJea2LFmchZSgiFFSXJRq7Gnnw5LuV1KhNxdvZ5jFA.jpg"/>
            <image state="hover" width="100%" height="100%" src="https://static.createra.fun/block/Qmf8uiGaJMtpW4uGQzhXrdhpWBk6gEcZxWYcyLTBRmN2BN.jpg"/>
            <image state="active" width="100%" height="100%" src="https://static.createra.fun/block/QmXjW7z8geu2yeiAVjfxDhufiU1dK9hNL2yXvzuWMW4QfG.jpg"/>
        </imagebutton>`,
  },
  'dialog': {
    display: false,
    bindings: [
      {
        selector: '#close',
        event: 'click',
        action: 'remove',
        targetSelector: '#dialog',
      },
      {
        selector: '#confirm',
        event: 'click',
        action: 'sendMessage',
        messageName: 'message_close',
      },
    ],
    // data: `<group id="dialog" width="500" height="270" borderSize="0" zIndex="233" horizontalCenter="0"  verticalCenter="0" >
    //         <image width="100%" height="100%" src="https://static.createra.fun/block/QmTtpHAQcyuYetgPQbBn15EUV6KQCYAMgwY4WjbuMG13xw.jpg"/>
    //         <label id="content" text="contentcontentcontent" width="1" height="24" color="white" left="0" top="30" fontSize="18"/>
    //         <button id="close" text="关闭" right="10" top="5" width="50" height="30"/>
    //         <imagebutton bottom="20" horizontalCenter="0" width="115" height="56">
    //             <image state="normal" width="100%" height="100%" src="https://static.createra.fun/block/QmVXjJea2LFmchZSgiFFSXJRq7Gnnw5LuV1KhNxdvZ5jFA.jpg"/>
    //             <image state="hover" width="100%" height="100%" src="https://static.createra.fun/block/Qmf8uiGaJMtpW4uGQzhXrdhpWBk6gEcZxWYcyLTBRmN2BN.jpg"/>
    //             <image state="active" width="100%" height="100%" src="https://static.createra.fun/block/QmXjW7z8geu2yeiAVjfxDhufiU1dK9hNL2yXvzuWMW4QfG.jpg"/>
    //         </imagebutton>
    //         </group>
    //         `,
    data: ui.group(
      {
        id: 'dialog',
        width: 550,
        height: 320,
        borderSize: 0,
        zIndex: 233,
        horizontalCenter: 25,
        verticalCenter: 0,
      },
      [
        ui.imagebutton(
          { id: 'close', right: 10, top: 10, width: 49, height: 49 },
          [
            ui.image({
              state: 'normal',
              percentWidth: 100,
              percentHeight: 100,
              src: 'https://static.createra.fun/block/QmeRheD7UvtAzLt9BqLok7nPznyTaRYp5Xem2FPhb5WCxo.jpg',
            }),
            ui.image({
              state: 'hover',
              percentWidth: 100,
              percentHeight: 100,
              src: 'https://static.createra.fun/block/QmeRheD7UvtAzLt9BqLok7nPznyTaRYp5Xem2FPhb5WCxo.jpg',
            }),
            ui.image({
              state: 'active',
              percentWidth: 100,
              percentHeight: 100,
              src: 'https://static.createra.fun/block/QmeRheD7UvtAzLt9BqLok7nPznyTaRYp5Xem2FPhb5WCxo.jpg',
            }),
          ],
        ),
        ui.group({ x: 0, y: 50, width: 500, height: 270, borderSize: 0 }, [
          ui.image({
            width: 500,
            height: 270,
            src: 'https://static.createra.fun/block/QmSugUXTxS4yR1xB21qhW2aa5gTqKaqF4kkAM4vPGzZy3P.jpg',
          }),
          ui.label({
            id: 'content',
            text: 'content',
            width: 450,
            height: 24,
            color: 'white',
            x: 20,
            y: 40,
            fontSize: 18,
          }),
          ui.group(
            {
              bottom: 12,
              horizontalCenter: 0,
              width: 115,
              height: 56,
              borderSize: 0,
            },
            [
              ui.imagebutton({ id: 'confirm', width: 115, height: 56 }, [
                ui.image({
                  state: 'normal',
                  percentWidth: 100,
                  percentHeight: 100,
                  src: 'https://static.createra.fun/block/QmVXjJea2LFmchZSgiFFSXJRq7Gnnw5LuV1KhNxdvZ5jFA.jpg',
                }),
                ui.image({
                  state: 'hover',
                  percentWidth: 100,
                  percentHeight: 100,
                  src: 'https://static.createra.fun/block/Qmf8uiGaJMtpW4uGQzhXrdhpWBk6gEcZxWYcyLTBRmN2BN.jpg',
                }),
                ui.image({
                  state: 'active',
                  percentWidth: 100,
                  percentHeight: 100,
                  src: 'https://static.createra.fun/block/QmXjW7z8geu2yeiAVjfxDhufiU1dK9hNL2yXvzuWMW4QfG.jpg',
                }),

                ui.label({
                  text: 'Ok',
                  color: 'white',
                  percentWidth: 100,
                  percentHeight: 100,
                  fontSize: 18,
                  horizontalAlign: 1,
                  verticalAlign: 1,
                }),
              ]),
            ],
          ),
        ]),
      ],
    ),
  },
};
