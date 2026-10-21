const { config } = require('dotenv');
const { pascalCase } = require('@figma-export/utils');

config();

// figma地址： https://www.figma.com/file/olpaPOXmnj0pIbKJ2KaPyc/VOXA-%E7%BB%84%E4%BB%B6%E5%BA%93--%5B%E5%A4%A7%E7%94%B0%5D?type=design&node-id=14678-2104&mode=design&t=bx6er8qbbUdPUvBk-0
const FILE_ID = 'olpaPOXmnj0pIbKJ2KaPyc';
const PAGE_NAME = 'Icon library 图标库';

/**
 * 用于检测是否重名
 */
const duplicateSet = new Set();

const getComponentName = (options) => `Icon${pascalCase(options.basename)}`;
const getComponentFilename = (options) => `${getComponentName(options)}`;

module.exports = {
  commands: [
    [
      "components",
      {
        fileId: FILE_ID,
        onlyFromPages: [PAGE_NAME],
        outputters: [
          // https://www.npmjs.com/package/@figma-export/output-components-as-svgr
          require("@figma-export/output-components-as-svgr")({
            output: "./output",
            /**
             * 默认生成.jsx，调整为生成.tsx。
             * 使用icon组件时，可以获得类型提示。
             */
            getFileExtension: () => '.tsx',
            getComponentName,
            getComponentFilename,
            /**
             * 定制化导出，export语句去掉.tsx后缀
             */
            getExportTemplate: (options) => {
              const reactComponentName = getComponentName(options);
              const reactComponentFilename = `${getComponentFilename(options)}`;
              return `export { default as ${reactComponentName} } from './${reactComponentFilename}';`;
            },
            getSvgrConfig: () => {
              return {
                typescript: true,
                memo: true,
                /**
                 * 在transform中已配置
                 */
                svgo: false,
                /**
                 * icon组件暴露ref
                 */
                ref: true,
              };
            },
            /**
             * 直接放到component目录下
             */
            getDirname: (options) => {
              return `${options.dirname}`;
            },
          }),
        ],
        filterComponent: (component) => {
          const name = pascalCase(component.name);

          if (duplicateSet.has(name)) {
            // 只提示错误，不过滤掉，这样才能在build环节抛错
            console.warn(`Component [${name}] is duplicated. Original name is [${component.name}]`);
          } else {
            duplicateSet.add(name);
          }

          return true;
        },
        transformers: [
          require('@figma-export/transform-svg-with-svgo')({
            plugins: [
              {
                name: 'preset-default',
                params: {
                  overrides: {
                    removeViewBox: false,
                  }
                }
              },
              {
                name: 'removeDimensions',
                active: true
              },
              {
                name: 'removeAttrs',
                params: {
                  /**
                   * 移除所有fill、stroke
                   */
                  attrs: '(fill|stroke)',
                }
              },
            ]
        })],
      },
    ],
    // 以下配置可以生成整合svg symbol的文件
    // [
    //   "components",
    //   {
    //     fileId: FILE_ID,
    //     // onlyFromPages: ['icons'],
    //     outputters: [
    //       // https://www.npmjs.com/package/@figma-export/output-components-as-svgstore
    //       require("@figma-export/output-components-as-svgstore")({
    //         output: "./output/svgstore",
    //       }),
    //     ],
    //   },
    // ],
  ],
};
