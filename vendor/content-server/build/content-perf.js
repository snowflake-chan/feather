"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContentPerf = void 0;
class ContentPerf {
    constructor(content) {
        this.content = content;
        this.storeBytes = 0;
        this.retrieveBytes = 0;
        this.cacheMiss = 0;
    }
    init() {
        return this.content.init();
    }
    async store(content, options) {
        this.storeBytes += content.length;
        return this.content.store(content, options);
    }
    async retrieve(hash, options) {
        const result = await this.content.retrieve(hash, options);
        if (result) {
            this.retrieveBytes += result.length;
        }
        else {
            this.cacheMiss += 1;
        }
        return result;
    }
}
exports.ContentPerf = ContentPerf;
