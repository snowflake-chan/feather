"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createContentServer = createContentServer;
exports.createOSSContentServer = createOSSContentServer;
const caching_content_server_1 = require("@box/content-server/caching-content-server");
const content_split_1 = require("@box/content-server/content-split");
const object_store_service_1 = require("@box/content-server/object-store-service");
const ipfs_http_store_node_1 = require("@box/content-server/ipfs-http-store-node");
function createContentServer(logger, config) {
    const { contentHostURL, maxIPFSConnections } = config;
    const contentServer = new content_split_1.ContentSplitter(new caching_content_server_1.CachingContentServer(logger.child({
        caller: 'caching-content',
    }), new ipfs_http_store_node_1.GoIPFSStore({
        logger: logger.child({ caller: 'ipfs' }),
        uri: contentHostURL,
        pin: false,
        maxConcurrency: maxIPFSConnections,
    })));
    return contentServer;
}
function createOSSContentServer(logger, config) {
    const { ossUploadURL, maxIPFSConnections, ossCdnURL } = config;
    const contentServer = new object_store_service_1.ObjectStoreService({
        logger: logger.child({ caller: 'oss' }),
        uri: ossUploadURL,
        maxConcurrency: maxIPFSConnections,
        cdnPath: ossCdnURL,
    });
    return contentServer;
}
//# sourceMappingURL=content-server.js.map