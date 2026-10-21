"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameGUI = void 0;
class GameGUI {
    constructor(init, show, remove, getAttribute, setAttribute, onMessage) {
        this.init = init;
        this.show = show;
        this.remove = remove;
        this.getAttribute = getAttribute;
        this.setAttribute = setAttribute;
        this.onMessage = onMessage;
        this.ui = new Proxy({}, {
            get(_, prop) {
                return function (attributes, children) {
                    return { name: prop, attributes, children };
                };
            },
        });
    }
}
exports.GameGUI = GameGUI;
//# sourceMappingURL=gui.js.map