"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoadingController = void 0;
const event_1 = require("../event");
const EXPECTED_TASKS = 128;
class LoadingController {
    constructor() {
        this.events = new event_1.EventBus();
        this.pending = 0;
        this.completed = 0;
        this.appLoaded = false;
    }
    startTask(mesg, type, count = 1) {
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
    endTask(mesg, type) {
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
    task(mesg, type) {
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
    progress() {
        if (this.appLoaded) {
            return 1;
        }
        return Math.pow(this.completed / Math.max(this.pending, EXPECTED_TASKS), 3);
    }
}
exports.LoadingController = LoadingController;
