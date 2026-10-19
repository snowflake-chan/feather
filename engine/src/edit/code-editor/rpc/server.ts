import { CodeEditorStateSchema } from '../schema';
import { MuServer, MuServerProtocol } from '@box/mudb/server';
import { CodeEditorRPCProtocol } from './schema';
import { Logger } from '@box/utils/logger';

export class CodeEditorRPCServer {
  public protocol: MuServerProtocol<typeof CodeEditorRPCProtocol>;
  private state: typeof CodeEditorStateSchema.identity;
  private logger: Logger;
  private sessionIdtoUserId: { [sessionId: string]: string } = {};
  constructor(spec: {
    server: MuServer;
    state: typeof CodeEditorStateSchema.identity;
    logger: Logger;
  }) {
    this.state = spec.state;
    this.logger = spec.logger;
    this.protocol = spec.server.protocol(CodeEditorRPCProtocol);
    this.protocol.configure({
      connect: (client) => {
        client.message.setInitialState(this.state);
      },
      disconnect: (client) => {
        const userId = this.sessionIdtoUserId[client.sessionId];
        const file = this.findUserCurrentFile(userId);
        if (file) {
          this.userExitFile(userId, file);
          delete this.sessionIdtoUserId[client.sessionId];
        }
      },
      message: {
        setCursorPosition: (client, data) => {
          const file = this.state.cursorList[data.fileId];
          if (file) {
            if (file[data.userId]) {
              file[data.userId].textId = data.textId;
            } else {
              this.logger.log(
                `user ${data.userId}'s record not found in file ${data.fileId}`,
              );
            }
          } else {
            this.logger.log(`file ${data.fileId} not found`);
          }

          this.protocol.broadcast.setCursorPosition({
            fileId: data.fileId,
            userId: data.userId,
            textId: data.textId,
          });
        },

        userEnterFile: (client, data) => {
          if (!this.state.cursorList[data.fileId]) {
            this.state.cursorList[data.fileId] = {};
          }
          const fileId = this.findUserCurrentFile(data.userId);
          if (fileId) {
            const file = this.state.cursorList[fileId];
            if (file) {
              delete file[data.userId];
            }
          }
          this.state.cursorList[data.fileId][data.userId] = {
            name: data.name,
            textId: '',
          };

          this.sessionIdtoUserId[client.sessionId] = data.userId;

          this.protocol.broadcast.userEnterFile({
            fileId: data.fileId,
            userId: data.userId,
            name: data.name,
          });
        },

        userExitFile: (client, data) => {
          this.userExitFile(data.userId, data.fileId);
        },
      },
    });
  }
  private userExitFile(userId: string, fileId: string) {
    const file = this.state.cursorList[fileId];
    if (file) {
      delete file[userId];
      this.protocol.broadcast.userExitFile({
        fileId: fileId,
        userId: userId,
      });
    }
  }

  private findUserCurrentFile(userId: string) {
    const files = Object.keys(this.state.cursorList);
    for (let i = 0; i < files.length; i++) {
      if (this.state.cursorList[files[i]][userId]) {
        return files[i];
      }
    }
    return '';
  }
}
