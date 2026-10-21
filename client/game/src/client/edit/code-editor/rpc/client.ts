import { CodeEditorStateSchema } from '../schema';
import { CodeEditorRPCProtocol } from './schema';
import { MuClient, MuClientProtocol } from '@box/mudb/client';
import { Logger } from '@box/utils/logger';

export class CodeEditorRPCClient {
  public protocol: MuClientProtocol<typeof CodeEditorRPCProtocol>;
  private state: typeof CodeEditorStateSchema.identity;
  private logger: Logger;
  constructor(spec: {
    client: MuClient;
    state: typeof CodeEditorStateSchema.identity;
    logger: Logger;
    onStateChange: () => void;
  }) {
    this.state = spec.state;
    this.logger = spec.logger;
    this.protocol = spec.client.protocol(CodeEditorRPCProtocol);
    this.protocol.configure({
      message: {
        setInitialState: (state) => {
          this.state = CodeEditorStateSchema.assign(this.state, state);
        },
        setCursorPosition: (data) => {
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
          spec.onStateChange();
        },

        userEnterFile: (data) => {
          if (!this.state.cursorList[data.fileId]) {
            this.state.cursorList[data.fileId] = {};
          }
          const fileId = this.findUserCurrentFile(data.userId);
          if (fileId) {
            this.userExitFile(data.userId, fileId);
          }
          this.state.cursorList[data.fileId][data.userId] = {
            name: data.name,
            textId: '',
          };
          spec.onStateChange();
        },

        userExitFile: (data) => {
          this.userExitFile(data.userId, data.fileId);
          spec.onStateChange();
        },
      },
    });
  }

  private userExitFile(userId: string, fileId: string) {
    const file = this.state.cursorList[fileId];
    if (file) {
      delete file[userId];
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
