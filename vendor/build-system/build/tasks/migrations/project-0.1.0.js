"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.toVersion = exports.fromVersion = exports.name = void 0;
exports.migration = migration;
const stream_1 = require("@box/mudb/stream");
const DEFAULT_LUT = (JSON.parse('{"lut":{"BleachBypass":"QmYZDQBRZyTvL8ocUVVaWgk9RQyHH3GVSrgqGVGvZzoc9a.png","CandleLight":"QmUnjmK4i3TChoFEo1ukEPc1gV3HE6auEFVmFW6m22qDy6.png","CoolContrast":"QmQNDTBTdfoiYqypbfWzakgLYUW2t3KtPUaRZsvtaZReKF.png","DesaturatedFog":"QmbDZKBVFe1XRRMLfbD5VJGBu2vZrmX7Ki4CgHvmagMkSZ.png","Evening":"QmSZp4AqWUi3CJP5283pHLm49TGAKkWRYBYHrbZtLJJdZQ.png","Fall":"Qmcm14Bqf9onvGv71vQc5tsFcDe3GKzCLvg33Nn2HByCVU.png","Filmic":"QmbBzynGzqxbRQvw5RuJ55dzTRD97ciQRMyC2FHXR3TPX3.png","Filmic2":"QmbNDEnLhyGUwAyRmWFTkhq3NDsv8VUVSbexPrsrhxVixv.png","Filmic3":"QmcwvUpCPrQWjxQdKn3EJwvdxga1djFLGjKbzh2TUChEkL.png","Filmic4":"QmTdKM469ApXNyS6Vg6gCDdoo6Ns35V3iov6KAjup8bR6c.png","Filmic5":"QmeD1AzJVhJLvUh6a7uMrfs2xYKbqW51XyjKPR4nLA1zh9.png","Filmic6":"QmP5r9CsVZuDVGzv6MHseymu11hv5eBEaobPL7PGLm4iZc.png","Filmic7":"QmTNq4XHcxh6teKnzmk46XUcJmnce2WDMZZ9xxNJ85YM8c.png","Filmic8":"QmZB9GZnZh7ECEK9RNYVxsVNVqgs4Yv1Sy35drfzeBawYZ.png","Filmic9":"QmbTHPP5VDpWdi4EL7SsgSsdoB5AJwwPEnNi9FjMQAhVnB.png","MatrixBlue":"Qmcob1ofBJsK1x1NkLG8ZytcWfLmSBafbSoGvhrGe7UgxC.png","MatrixGreen":"QmesbPEQPk7m6VjunSZ89Af5HgFHquZrYPVQyXqzvmTNAF.png","Neutral":"Qmd6EtCsyVJuoLZPvEKneDm56rsWjPCex9DvdQZEGc76Tr.png","Night1":"Qmbwi3fuRvcKh4czjeCvXPh45H5KiCpQ46hMfPghri3pAJ.png","Night2":"QmdVnVb5tDQxEcRiT9Gyq4DHnMpow6GUm2j75Y1ms49KiF.png","Night_Dark":"QmSBUM6HZSMr3yMwfYwNzcY7k6Wk9JJ8DoMY7jewLYkmSa.png","StrongAmber":"QmUghqksEoTgvgbmapn21rWEwSSaJbokcwAoUPgiGCdZ47.png","Warm":"QmNuD82NFJ5z39raqUgqCtPmY6jdRfR3Am4Uc7vBt3xUb4.png","WarmContrast":"QmbKsxWrMtmuHonyj3QaHrmgaHLeYEvkYTXh4KJ6azqFyC.png","test2":"Qmf6xHguKVdwWx4SrYqP1tczBqPaJR3zY3ULjfJ8oHP96o.png","test3":"QmYcRSQ9kh3t1amHuF4xmevZebZbd9HHCW5LrbPQ7KXSei.png","test4":"QmcuHZZF3BiqNUA3M8Ee494kyH7quBAEW2Tx4F3yQovye6.png"},"nonePreview":"QmPZhegZH54afM73kUQubC8saKSJ3jCcZDm1SSewgUQkAd.jpg","preview":{"BleachBypass":"QmSBg9Mt4VXxRXPdCtVjo1BiQ7iBtpu1r97YLPAwydJdJX.png","CandleLight":"QmZ7t4dSZunv3sZgYYNKSFanv5acoBjiZfZaU5hrQzqqAH.png","CoolContrast":"QmbDb4VJKkKfFDmnUSQyd3NukFnoAcoZxgyPhdKsgXBzme.png","DesaturatedFog":"QmR7pfgw3xjkfjqpVTPkQoFQVXdNyUEVL8eZJA22zxvUKA.png","Evening":"QmWkgWK15BeVY2LusvrAP1HMCmh8J4UgPVZnJimHqoozHT.png","Fall":"QmWVkoRVcxA9y7jgfd8FFJ6xccHmMuqsB5C9h7MfQHYCxC.png","Filmic":"QmSzXksT4Z741vLCgx8U5d2DTGr5fhshH9LGL2meXBzxFP.png","Filmic2":"QmU1DMSnSnCKb7HXu73e7wdoeovXpFZoZVT7gzGCNCcenz.png","Filmic3":"Qma63djc7sRGkr4vpZmatwmqMkDi7z7RqtcsjZeMT4qTrC.png","Filmic4":"QmNwLPVyZkX4RKrtShpSmdzGjcQeEP3YZ8KV3fAqudW8f3.png","Filmic5":"QmQLCefFCMTyB7YhtwkbQXXht9tktRdyizGM6b1ATFtKgz.png","Filmic6":"QmVJGi24pWpRMxMhV5DrYQsdBdodVnvvrG7Vo3cyPV2zzr.png","Filmic7":"QmRSGtGE23otytAwvPC98qGN6RMvDtLHcRCn9Aq6ErdXhg.png","Filmic8":"QmULarWBJ1cuTh6qGSfqxSxFZj7SCZBF8fPTLpdXkubd4o.png","Filmic9":"Qmd4kJCpgYRyYV15n1Xbdap7Rp3uqXtwQnhgo9viwgqtyC.png","MatrixBlue":"QmeUtstEWcgWW8bfanHqC9GMFxRoSPQQaXd6z4U9WeZiZK.png","MatrixGreen":"QmfRA1tuv3QNMYB3C7BcP9gMVAor9E68VgFFdQta7BLUK5.png","Neutral":"QmaM78E1CzCZP9QfywbA3UxQBw5tHMXwgouNkUQTR7vArV.png","Night1":"QmcGMoVrLSumMGLy6o73W8pUSMvr4VRzc1ymixs5RjrRfw.png","Night2":"QmZPLHfivmhbqN1UYmV1HqLUjpuehjYb16HSwN63EHqriw.png","Night_Dark":"QmU7dTKJMuqGdwTuhuQzE4muYRiv71u7t2Mpm9iejAThhU.png","StrongAmber":"QmRDfsMaLJDz9PLq9m36TbR4bqSbbqPmpre3moitrQWqvw.png","Warm":"QmWRnj4K3EnC3zsnwcbkdYoeCCbJUdd2Ef3ZkM2eVKKZRR.png","WarmContrast":"QmbZUDuZsi5o6k3BXfyDrcefyWMTZKLZLeTxBmgyxNRTc8.png","test2":"Qmd2NAFUBS7ZA8XXBA9G8ScKWjip62Kfcq231sAcGAQz8t.png","test3":"QmSXne55ECPcyt98zJMVtBb4GU4JW8eydhn4GNarn2ffmN.png","test4":"QmNWP6Z9AzGCWkqYcBJqA5xDzsMA8RX6fc5HqoAeWeSrfW.png"}}'));
const DEFAULT_SNOW = (JSON.parse('{"bubble":"QmR6QUMwv1258WP9yKfWY5CiD32pAjqsHEbA4xpP9no2qz.png","dandelion":"QmZXMK45Ki3tHPrns4t8pWVWpEqhSicMiSrVqg8xN7LXig.png","heart":"QmZRZHWhxrkZEcdoG9tGV3cNPadF1FaEw2jxC3P5cQ2XCw.png","leaf":"QmbaYeBK9s9A8qdmsrXmUqD3Hj6n97281UwqForDsMGoHj.png","maple":"QmUJZRdHvw6hnpWnYgDNPk1WqubEVp9mMB67Ftb47KUZnS.png","sakura":"QmTBFadQoaEjrAkucd1fPuzHBCnUEFdB3NRptQHR9Rt441.png","snow":"QmdvHwuQNbmzyrqvtsYy4nBMMi9HBKzg7uAVpeGZqMAbhi.png","snow2":"QmWjutM3azrTSxxnBZSN7FjGwtfjMQi5cevJ6NsjYmfHAU.png","snow3":"Qmb1vVMaZqVqD7W96GvknKdR7CNyw34DHtBEkwokZGqUKK.png","star":"QmUZtGuRfSbe9nj3pgqccLvHK2HJCRkerFFdJyCMUVHNSi.png"}'));
exports.name = 'project';
exports.fromVersion = '0.0.15';
exports.toVersion = '0.1.0';
//
// convert project to new asset format:
//
function migration(bs, hash) {
    return __awaiter(this, void 0, void 0, function* () {
        const project = yield bs.retrieveJSON(hash);
        project.version = '0.1.0';
        project.prevHash = hash;
        project.timestamp = new Date();
        // 1. remove old asset structure
        const prevSeeds = project.seeds;
        const prevAssets = project.assets;
        const prevScripts = project.scriptIndex;
        delete project.seeds;
        delete project.assets;
        delete project.scriptIndex;
        // 2. create new asset structure
        const nextEntities = (project.entities = {});
        const nextAssets = (project.assets = {});
        // 3. convert meshes to new asset structure
        const meshURL = {};
        function upsertMesh(meshName, projectHash, ownerId, contentId, previewImage) {
            return __awaiter(this, void 0, void 0, function* () {
                if (!projectHash) {
                    return '';
                }
                if (projectHash in meshURL) {
                    return meshURL[projectHash];
                }
                if (meshName in nextAssets) {
                    for (let i = 0;; ++i) {
                        if (!(meshName + '.' + i in nextAssets)) {
                            meshName = meshName + '.' + i;
                            break;
                        }
                    }
                }
                const meshHash = yield bs.build('buildVoxel', projectHash);
                const meshBytes = yield bs.retrieveContent(meshHash);
                meshURL[projectHash] = meshName;
                nextAssets[meshName] = {
                    createdAt: new Date(),
                    ownerId,
                    contentId,
                    previewImage,
                    lastModfied: new Date(),
                    type: 2,
                    hash: projectHash,
                    size: meshBytes.length,
                };
                return meshName;
            });
        }
        yield Promise.all(Object.keys(prevAssets.model || {}).map((id) => {
            const prevModel = prevAssets.model[id];
            return upsertMesh(`mesh/${id}.vb`, prevModel.modelProjectHash, 0, +id, prevModel.previewHash);
        }));
        // 4. convert seedss to new asset structure
        yield Promise.all(Object.keys(prevSeeds).map((id) => __awaiter(this, void 0, void 0, function* () {
            const prev = prevSeeds[id];
            const next = {
                name: prev.name,
                position: prev.props.position,
                collision: prev.props.collision,
                gravity: prev.props.gravity,
                fixed: prev.props.fixed,
                mass: prev.props.mass,
                friction: prev.props.friction,
                restitution: prev.props.restitution,
                bounds: prev.props.bounds,
                mesh: yield upsertMesh(`mesh/seed_${prev.name}.vb`, prev.VBProjectHash, 0, 0, ''),
                scale: prev.props.scale,
                orientation: prev.props.orientation,
                tint: prev.props.tint,
                metalness: prev.props.metalness,
                shininess: prev.props.shininess,
                emissive: prev.props.emissive,
                damage: prev.props.damage,
                tags: prev.props.tags,
            };
            nextEntities[id] = next;
        })));
        // 5. convert scripts into asset structure
        let scriptHash = '';
        let scriptSize = 0;
        if (prevScripts.length === 1) {
            scriptHash = prevScripts[0];
            const scriptBytes = yield bs.retrieveContent(scriptHash);
            scriptSize = scriptBytes.length;
        }
        else if (prevScripts.length > 1) {
            const scripts = yield Promise.all(prevScripts.map((indexHash) => __awaiter(this, void 0, void 0, function* () {
                const data = yield bs.retrieveContent(indexHash);
                scriptSize += data.length;
                return (0, stream_1.decodeUTF8)(data);
            })));
            scriptHash = yield bs.storeContent((0, stream_1.encodeUTF8)(scripts.join(';\n')));
        }
        else {
            scriptHash = yield bs.storeContent(new Uint8Array(0));
        }
        nextAssets['index.js'] = {
            createdAt: new Date(),
            ownerId: 0,
            contentId: 0,
            type: 1,
            lastModfied: new Date(),
            hash: scriptHash,
            previewImage: '',
            size: scriptSize,
        };
        project.scriptIndex = 'index.js';
        // 6. update snow textures
        yield Promise.all(Object.keys(DEFAULT_SNOW).map((texture) => __awaiter(this, void 0, void 0, function* () {
            const snowURL = `snow/${texture}.part`;
            const snowHash = DEFAULT_SNOW[texture];
            if (snowHash === project.environment.snow.texture) {
                project.environment.snow.texture = snowURL;
            }
            nextAssets[snowURL] = {
                createdAt: new Date(0),
                ownerId: 0,
                contentId: 0,
                type: 4,
                lastModfied: new Date(0),
                hash: snowHash,
                previewImage: snowHash,
                size: 0,
            };
        })));
        // 7. update color LUTs
        yield Promise.all(Object.keys(DEFAULT_LUT.lut).map((lutName) => __awaiter(this, void 0, void 0, function* () {
            const lutHash = DEFAULT_LUT.lut[lutName];
            const lutPreview = DEFAULT_LUT.preview[lutName];
            const lutURL = `lut/${lutName}.lut`;
            if (lutHash === project.player.colorLUT) {
                project.player.colorLUT = lutURL;
            }
            nextAssets[lutURL] = {
                createdAt: new Date(0),
                ownerId: 0,
                contentId: 0,
                type: 3,
                lastModfied: new Date(0),
                hash: lutHash,
                previewImage: lutPreview,
                size: 0,
            };
        })));
        return bs.storeJSON(project);
    });
}
//# sourceMappingURL=project-0.1.0.js.map