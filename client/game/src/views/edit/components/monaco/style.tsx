import React, { useContext, useMemo } from 'react';
import style from './index.module.scss';
import { CodeEditorStateContext } from '../script-container/hooks';

export const StyleMonaco = (props: { readOnly: boolean }) => {
  const { readOnly } = props;
  const { codeEditorState } = useContext(CodeEditorStateContext);
  const courseList = Object.values(codeEditorState.cursorDict) || [];
  const cursorColorList = [
    '#b13e53',
    '#ffcd75',
    '#a7f070',
    '#41a6f6',
    '#ef7d57',
    '#38b764',
    '#3b5dc9',
    '#94b0c2',
  ];

  const backgroundColor = useMemo(() => {
    if (readOnly) {
      return 'rgba(255, 255, 255, 0.1)';
    } else {
      return '#262626';
    }
  }, [readOnly]);

  return (
    <style>{`
            .${style.container}>.monaco-editor {
                background-color: rgba(18,18,18,0.9);
                -webkit-user-select: auto;
            }
            .monaco-editor-background,
            .monaco-editor .margin {
                background-color: ${backgroundColor};
                border: none;
            }

            .monaco-editor .margin-view-overlays div.current-line,
            .monaco-editor .view-overlays div.current-line
            {
                border: none;
                background-color: rgba(200,200,200,.1);
            }

            .liveCursor {
                border-right: solid #94b0c2 2px;
                border-left: solid transparent 2px;
                margin-left: -3px;
                height: 24px;
                position: absolute;
                cursor:pointer;
            }
            .liveCursor::after {
                content: ' ';
                position: absolute;
                top: -23px;
                border-radius: 0.25em 0.25em 0.25em 0;
                padding: 0px 0.5ch;
                display: inline-block;
                color: #333c57;
                font-size: 0.9em;
                pointer-events: none;
                z-index: 1;
                font-weight: bold;
                background-color: #94b0c2;
            }
            .liveCursor.firstline::after {
                top: 22px;
                border-radius: 0 0.25em 0.25em 0.25em;
            }
            .hide::after {
                opacity:0;
            }
            .hide:hover::after {
                opacity:1;
            }
            .show::after {
                -moz-animation: fadeOutAnime 0.8s forwards;
                -webkit-animation: fadeOutAnime 0.8s forwards;
                -o-animation: fadeOutAnime 0.8s forwards;
                animation: fadeOutAnime 0.8s forwards;
                -webkit-animation-fill-mode: forwards;
                animation-fill-mode: forwards;
                opacity: 1;
            }
            .show:hover::after {
                opacity:1;
            }
            @keyframes fadeOutAnime {
                0% {
                    opacity: 1;
                }
                99%{
                opacity: 1;
                }
                100% {
                    opacity: 0;
                }
            }
            @-webkit-keyframes fadeOutAnime {
                0% {
                    opacity: 1;
                }
                99%{
                opacity: 1;
                }
                100% {
                    opacity: 0;
                }
            }
            ${cursorColorList
              .map(
                (e, i) => `
                    .userBg${i} {
                        background-color: ${e + '55'};
                    }
                    .user${i} {
                        border-right-color: ${e};
                    }
                    .user${i}::after {
                        background-color: ${e};
                        color:#222222;
                    }
                    `,
              )
              .join('\n')}
            ${courseList
              .map((e, i) => `.user${i}::after{content:"${e.name}";}`)
              .join('\n')}
        `}</style>
  );
};
