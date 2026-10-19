"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const date_1 = require("../date");
const _do_1 = require("./_do");
const date = new date_1.MuDate(new Date(0));
(0, _do_1.deltaByteLength)(date, new Date(0), new Date());
(0, _do_1.diffPatchDuration)(date, new Date(0), new Date(), 1e3);
//# sourceMappingURL=date.js.map