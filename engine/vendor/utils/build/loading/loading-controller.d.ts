import { EventBus } from '../event';
import { TaskTypeEnum } from './loading-schema';
export declare class LoadingController {
    events: EventBus<import("@box/mudb/schema/struct").Struct<{
        taskName: import("@box/mudb/schema").MuUTF8;
        taskType: import("@box/mudb/schema").MuSchema<TaskTypeEnum>;
    }>>;
    pending: number;
    completed: number;
    appLoaded: boolean;
    startTask(mesg: string, type: TaskTypeEnum, count?: number): void;
    endTask(mesg: string, type: TaskTypeEnum): void;
    task(mesg: string, type: TaskTypeEnum): void;
    progress(): number;
}
//# sourceMappingURL=loading-controller.d.ts.map