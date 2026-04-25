

import { instantiate } from './ghost-standalone-wasm-js.uninstantiated.mjs';


const exports = (await instantiate({

})).exports;

export const {
    ghostPrewarm,
    ghostSerialize,
    ghostDeserialize,
    ghostDeserializeBytes,
    ghostDeserializeBytesJs,
    ghostDeserializeJs,
    memory,
    _initialize,
    startUnitTests
} = exports;

