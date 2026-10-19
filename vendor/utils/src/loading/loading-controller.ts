import { EventBus } from '../event';
import { Task, TaskTypeEnum } from './loading-schema';

const EXPECTED_TASKS = 128;

export class LoadingController {
  // some property
  public events = new EventBus<Task>();

  public pending: number = 0;
  public completed: number = 0;

  public appLoaded: boolean = false;

  public startTask(mesg: string, type: TaskTypeEnum, count: number = 1) {
    if (this.appLoaded) {
      return;
    }
    this.pending += count;
    setTimeout(() => {
      this.events.notify({
        taskName: mesg,
        taskType: type,
      });
    }, Math.random() * 10);
  }

  public endTask(mesg: string, type: TaskTypeEnum) {
    if (this.appLoaded) {
      return;
    }
    this.completed += 1;
    setTimeout(() => {
      this.events.notify({
        taskName: mesg,
        taskType: type,
      });
    }, 10 + Math.random() * 100);
  }

  public task(mesg: string, type: TaskTypeEnum) {
    if (this.appLoaded) {
      return;
    }
    this.completed += 1;
    this.pending += 1;
    setTimeout(() => {
      this.events.notify({
        taskName: mesg,
        taskType: type,
      });
    }, Math.random() * 100);
  }

  public progress() {
    if (this.appLoaded) {
      return 1;
    }
    return Math.pow(this.completed / Math.max(this.pending, EXPECTED_TASKS), 3);
  }
}
