import * as React from 'react';
import { hashURL } from 'src/utils/hash-url';
import { DB } from '@box/schema/backend/database-type';

import { Card } from '../basic/card/index';
import { notice } from '../../../components/common/notice';
import { Input } from '../../../components/edit/input';
import { ClickPopup } from '../../../components/basic/click-popup';
import { intlMessage } from 'src/utils/i18n';
import { canvasToBlob } from 'src/utils/capture';
import { editor } from 'src/client/edit/edit-client';

import style from './index.module.scss';

type Props = {
  img: string;
  name: string;
  isNeverChangeDisplayName: boolean;
  detail: string;
  isSaving: boolean;
  isAuthor: boolean;
  requirePreviewImg?: boolean;
  bannerImages: string[];

  setName: (name: string) => void;
  setDetail: (detail: string) => void;
  setImg: (imgHash: string) => void;
  setBannerImg: (imgHash: string) => void;
  replaceBannerImg: (imgHash: string, index: number) => void;
  removeBannerImg: (index: number) => void;

  hasCustomUrl: boolean;
  customUrl?: string;
  publishStatus?: DB.ContentStatus;
  publishVersion?: number;
  canRename?: boolean;
};

type State = {
  name: string;
  detail: string;
  showBannerImgPreview: boolean;
  previewBannerImgUrl: string;
  showScreenshotMask: boolean;
  coverImgLoading: boolean;
  selectImgLoading: boolean;
  uploadedImgLoading: boolean[];
  customUrl: string;
  titleCustomUrl: string;
  isError: boolean;
  errorMessage: string;
  linkTitle: string;
};

enum ImageEnum {
  select,
  cover,
  banner,
}

const Website = 'box.game/p/';

const MINSIZE = 5;
const MAXSIZE = 30;
const REG = /^[a-z0-9-]$/;
const REG_NOT_BAR = /^-+|-+$|(-)-+/g;

/**
 * @deprecated
 */
export class GameDetailEdit extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    this.state = {
      name: props.name,
      detail: props.detail,
      showBannerImgPreview: false,
      previewBannerImgUrl: '',
      showScreenshotMask: false,
      coverImgLoading: false,
      selectImgLoading: false,
      uploadedImgLoading: [],
      titleCustomUrl: props.customUrl,
      customUrl: '',
      isError: false,
      errorMessage: '',
      linkTitle: '',
    };
  }

  private inputElm: HTMLInputElement | undefined;
  private bannerImgInputRef: HTMLInputElement[] = [];
  private uploadBannerInputRef = React.createRef<HTMLInputElement>();

  public componentDidMount() {
    if (!this.props.bannerImages.length && this.props.img) {
      this.props.setBannerImg(this.props.img);
    }
    if (this.props.isNeverChangeDisplayName) {
      this.props.setName('');
      this.setState({
        name: '',
      });
    }
    if (!this.props.hasCustomUrl) {
      return;
    }
    if (!this.props.canRename) {
      return;
    }
    this.validateCustomUrl(this.props.customUrl, this.props.customUrl !== '');
  }

  public isLoading = () => {
    const { coverImgLoading, selectImgLoading, uploadedImgLoading } =
      this.state;
    if (!uploadedImgLoading.length) {
      for (let i = 0; i < uploadedImgLoading.length; i++) {
        if (uploadedImgLoading[i]) {
          return true;
        }
      }
    }
    return coverImgLoading || selectImgLoading;
  };

  public getCustomUrl = () => {
    return this.state.customUrl;
  };

  private _handleUploadClick = () => {
    if (this.inputElm) {
      this.inputElm.click();
    }
  };

  private _handleScreenshot = async (
    imageType: ImageEnum,
    setBanner?,
    index?,
  ) => {
    if (!editor.game.state.dom.canvas) {
      return;
    }
    const noticeId = notice.pending(intlMessage('uploading'));
    this.setState(
      {
        showScreenshotMask: true,
      },
      () => {
        setTimeout(() => {
          this.setState({
            showScreenshotMask: false,
          });
        }, 160);
      },
    );
    switch (imageType) {
      case ImageEnum.select: {
        this.setState({
          selectImgLoading: true,
        });
        break;
      }
      case ImageEnum.cover: {
        this.setState({
          coverImgLoading: true,
        });
        break;
      }
      case ImageEnum.banner: {
        if (index === undefined) {
          return;
        }
        const { uploadedImgLoading } = this.state;
        uploadedImgLoading[index] = true;
        this.setState({
          uploadedImgLoading: [...uploadedImgLoading],
        });
      }
    }
    const type = 'png';
    const imageData = await canvasToBlob(editor.game.state.dom.canvas, {
      type,
    });
    const reader = new FileReader();
    reader.onload = (e) => {
      return editor.game.state.content
        .storeImageBuffer((e.target as any).result, '.' + type)
        .then((imageURL) => {
          notice.closeNotice(noticeId);
          notice.success(intlMessage('uploadSuccess'));
          if (setBanner) {
            setBanner(imageURL);
            return;
          }
          this.props.setImg(imageURL);
          if (!this.props.bannerImages.length) {
            this.props.setBannerImg(imageURL);
          }
        })
        .catch((err) => {
          editor.logger.error(err.toString());
          notice.closeNotice(noticeId);
          notice.error(intlMessage('uploadFailed'));
        })
        .finally(() => {
          switch (imageType) {
            case ImageEnum.select: {
              this.setState({
                selectImgLoading: false,
              });
              break;
            }
            case ImageEnum.cover: {
              this.setState({
                coverImgLoading: false,
              });
              break;
            }
            case ImageEnum.banner: {
              if (index === undefined) {
                return;
              }
              const { uploadedImgLoading } = this.state;
              uploadedImgLoading[index] = false;
              this.setState({
                uploadedImgLoading: [...uploadedImgLoading],
              });
            }
          }
        });
    };
    reader.readAsArrayBuffer(imageData);
  };

  private _checkFileSize = (
    ev: React.ChangeEvent<HTMLInputElement>,
    size: number,
  ) => {
    if (!ev.target.files) {
      ev.target.value = '';
      return void 0;
    }
    const file = ev.target.files[0];
    if (!file) {
      return void 0;
    }
    if (file.size > size * 1024 * 1024) {
      notice.error({
        title: intlMessage('uploadFailed'),
        detail: `${intlMessage('fileTooLarge')}${size}MB`,
      });
      return void 0;
    }
    return file;
  };

  private _handleUploadImg = (ev: React.ChangeEvent<HTMLInputElement>) => {
    const file = this._checkFileSize(ev, 2);
    if (!file) {
      return void 0;
    }
    const noticeId = notice.pending(intlMessage('uploading'));
    this.setState({
      coverImgLoading: true,
    });
    return editor.game.state.content
      .storeImageFile(file)
      .then((imageURL) => {
        notice.closeNotice(noticeId);
        notice.success(intlMessage('uploadSuccess'));
        this.props.setImg(imageURL);
        if (!this.props.bannerImages.length) {
          this.props.setBannerImg(imageURL);
        }
      })
      .catch((err) => {
        editor.logger.error(err.toString());
        notice.closeNotice(noticeId);
        notice.error(intlMessage('uploadFailed'));
      })
      .finally(() => {
        this.setState({
          coverImgLoading: false,
        });
      });
  };

  private _handleUploadBannerImgs = (
    ev: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = this._checkFileSize(ev, 2);
    if (!file) {
      return;
    }
    const noticeId = notice.pending(intlMessage('uploading'));
    this.setState({
      selectImgLoading: true,
    });
    editor.game.state.content
      .storeImageFile(file)
      .then((imageURL) => {
        this.setState({
          selectImgLoading: false,
        });
        this.props.setBannerImg(imageURL);
        notice.closeNotice(noticeId);
        notice.success(intlMessage('uploadSuccess'));
      })
      .catch((err) => {
        this.setState({
          selectImgLoading: false,
        });
        editor.logger.error(err.toString());
        notice.closeNotice(noticeId);
        notice.error(intlMessage('uploadFailed'));
      });
    ev.target.value = '';
  };

  private _handleReplaceBannerImgs = (
    ev: React.ChangeEvent<HTMLInputElement>,
    index: number,
  ) => {
    const file = this._checkFileSize(ev, 2);
    if (!file) {
      return void 0;
    }
    const noticeId = notice.pending(intlMessage('uploading'));
    const { uploadedImgLoading } = this.state;
    uploadedImgLoading[index] = true;
    this.setState({
      uploadedImgLoading: [...uploadedImgLoading],
    });
    return editor.game.state.content
      .storeImageFile(file)
      .then((imageURL) => {
        this.props.replaceBannerImg(imageURL, index);
        notice.closeNotice(noticeId);
        notice.success(intlMessage('uploadSuccess'));
      })
      .catch((err) => {
        editor.logger.error(err.toString());
        notice.closeNotice(noticeId);
        notice.error(intlMessage('uploadFailed'));
      })
      .finally(() => {
        const { uploadedImgLoading: imgLoadingArr } = this.state;
        imgLoadingArr[index] = false;
        this.setState({
          uploadedImgLoading: [...imgLoadingArr],
        });
        ev.target.value = '';
      });
  };

  private _handleBannerImgPreview = (url: string) => {
    if (!url) {
      return;
    }
    this.setState({
      previewBannerImgUrl: hashURL(url),
      showBannerImgPreview: true,
    });
  };

  private _handleBannerImgPreviewShow = (show: boolean) => {
    this.setState({
      showBannerImgPreview: show,
    });
  };

  public componentWillMount() {
    this.setState({
      name: this.props.name,
      detail: this.props.detail,
    });
  }

  public validateCustomUrl = (
    value: string = '',
    emptyCustomUrl: boolean = false,
  ) => {
    this.setState({
      isError: false,
      errorMessage: '',
    });
    if (!value) {
      this.setState({
        linkTitle: intlMessage('link'),
        customUrl: '',
        titleCustomUrl: this.props.customUrl
          ? this.props.customUrl
          : intlMessage('unset'),
      });
      return;
    }
    let isInvalidText = false;
    const urlArr = value.toLocaleLowerCase().split('');
    let url = urlArr
      .filter((text) => {
        const result = REG.test(text);
        if (!result) {
          isInvalidText = true;
        }
        return result;
      })
      .join('');
    url = url.replace(REG_NOT_BAR, '$1');
    this.setState({
      isError: false,
      customUrl: emptyCustomUrl ? '' : url,
      titleCustomUrl: url ? url : intlMessage('unset'),
      linkTitle: emptyCustomUrl
        ? intlMessage('link')
        : intlMessage('linkTitleCustom'),
    });
    if (new Blob([url]).size < MINSIZE) {
      this.setState({
        isError: true,
        errorMessage: intlMessage('atLeastWords'),
        linkTitle: intlMessage('linkTitleCustom'),
      });
    }
    if ((isInvalidText && new Blob([url]).size <= MINSIZE) || isInvalidText) {
      this.setState({
        isError: true,
        errorMessage: intlMessage('wrongInputText'),
        linkTitle: intlMessage('linkTitleCustom'),
      });
    }
  };

  public setIsErrorAndMessage = (isError: boolean, errorMessage: string) => {
    this.setState({
      isError,
      errorMessage,
    });
  };

  public render() {
    const {
      coverImgLoading,
      selectImgLoading,
      uploadedImgLoading,
      customUrl,
      errorMessage,
      isError,
      titleCustomUrl,
      linkTitle,
    } = this.state;
    const { hasCustomUrl, canRename } = this.props;
    return (
      <div className={style.gameInfoContainer}>
        {this.state.showBannerImgPreview && (
          <div
            className={style.closeWrapper}
            onClick={() => this._handleBannerImgPreviewShow(false)}
          >
            <img
              className={style.previewBannerImg}
              src={this.state.previewBannerImgUrl}
            />
            <div
              className={style.closeBtn}
              onClick={() => this._handleBannerImgPreviewShow(false)}
            ></div>
          </div>
        )}
        <div className={style.propertyItem}>
          <div className={style.subTitle}>{intlMessage('mapTitle')}</div>
          <Input
            value={this.state.name}
            onBlur={(name) => {
              this.setState({ name });
              this.props.setName(name);
            }}
            placeholder={intlMessage('gameNamePlaceHolder')}
            disabled={!this.props.isAuthor || this.props.isSaving}
            maxBytes={DB.Limitations.contentNameBytes}
          />
        </div>

        {hasCustomUrl && canRename && (
          <div className={style.propertyItem}>
            <div className={style.subTitle}>{linkTitle}</div>
            <div className={style.hint}>{`${Website}${titleCustomUrl}`}</div>
            <Input
              immediatelyChange
              value={customUrl}
              onChange={(value) => {
                this.validateCustomUrl(value);
              }}
              clearBtn
              maxBytes={MAXSIZE}
              isError={isError}
              errorMessage={errorMessage}
              placeholder={intlMessage('onlyOnce')}
            />
          </div>
        )}

        <div className={style.propertyItem}>
          <div className={style.subTitle}>{intlMessage('introduction')}</div>
          <Input
            value={this.state.detail}
            onChange={(detail) => {
              this.setState({ detail });
              this.props.setDetail(detail);
            }}
            inputStyle={{ height: '100px' }}
            placeholder={intlMessage('gameDetailPlaceHolder')}
            disabled={!this.props.isAuthor || this.props.isSaving}
            textarea
            maxBytes={DB.Limitations.contentDescriptionBytes}
          />
        </div>
        <div className={style.propertyItem}>
          <div className={style.subTitle + ' ' + style.previewTitle}>
            {intlMessage('contentPreview')}
          </div>
          <div className={style.previewWrapper}>
            <div className={style.preview}>
              <Card
                hideDefaultImg={false}
                previewImg={this.props.img}
                onClick={() => this._handleBannerImgPreview(this.props.img)}
                id={0}
                selected={false}
                style={{ opacity: coverImgLoading ? '0.3' : '1' }}
                name={
                  (!coverImgLoading &&
                    this.props.requirePreviewImg &&
                    !this.props.img &&
                    intlMessage('updatePreviewImg')) ||
                  ''
                }
              />
              {coverImgLoading ? (
                <div className={style.coverLoadingContainer}>
                  <div className={style.loadingIcon}></div>
                </div>
              ) : (
                <>
                  {!this.props.isSaving && this.props.isAuthor && (
                    <div
                      className={
                        !this.props.img
                          ? style.uploadCoverWrapper
                          : style.operationIconWrapper
                      }
                    >
                      <ClickPopup
                        posX="right"
                        posY="down"
                        popup={
                          <div className={style.previewSelectionContainer}>
                            <div
                              className={style.popupSelection}
                              onClick={this._handleUploadClick}
                            >
                              {intlMessage('uploadPreview')}
                            </div>
                            <div
                              className={style.popupSelection}
                              onClick={() =>
                                this._handleScreenshot(ImageEnum.cover)
                              }
                            >
                              {intlMessage('takeScreenshot')}
                            </div>
                          </div>
                        }
                      >
                        <div className={style.iconWrapper}>
                          <div
                            className={
                              !this.props.img
                                ? this.props.isSaving
                                  ? style.uploadIconDisabled
                                  : style.uploadIcon
                                : style.operationIcon
                            }
                          ></div>
                        </div>
                      </ClickPopup>
                    </div>
                  )}
                </>
              )}
              <input
                className={style.uploadInput}
                type="file"
                accept=".jpeg, .png, .jpg"
                onChange={this._handleUploadImg}
                ref={(ref) => {
                  if (ref) {
                    this.inputElm = ref;
                  }
                }}
              />
            </div>
            <div className={style.previewTipContainer}>
              <div className={style.previewTip}>
                {intlMessage('availableFormat')}:
                <br />
                JPEG, PNG, GIF, SVG
              </div>
              <div className={style.previewTip}>
                {intlMessage('suggestSize')}:
                <br />
                1024 x 1024 {intlMessage('pixel')}
                <br />
                {intlMessage('notGreaterThan')}2MB
              </div>
            </div>
          </div>
        </div>
        <div className={style.propertyItem}>
          <div className={style.subTitle}>{intlMessage('bannerImg')}</div>
          <div className={style.bannerImgWrapper}>
            {this.props.bannerImages.map((item, index) => {
              return (
                <div className={style.bannerImgContainer} key={item + index}>
                  {uploadedImgLoading[index] ? (
                    <div className={style.imgLoadingContainer}>
                      <img
                        className={style.loadingBannerImg}
                        src={hashURL(item)}
                      />
                      <div className={style.loadingIcon}></div>
                    </div>
                  ) : (
                    <>
                      <img
                        className={style.bannerImg}
                        src={hashURL(item)}
                        onClick={() => this._handleBannerImgPreview(item)}
                      />
                      <ClickPopup
                        className={style.operationIconWrapper}
                        posX="right"
                        posY="down"
                        popup={
                          <div className={style.popupContainer}>
                            <div
                              className={style.popupSelection}
                              onClick={() => {
                                this.bannerImgInputRef[index].click();
                              }}
                            >
                              {intlMessage('uploadPreview')}
                            </div>
                            <div
                              className={style.popupSelection}
                              onClick={() =>
                                this._handleScreenshot(
                                  ImageEnum.banner,
                                  (imageURL) =>
                                    this.props.replaceBannerImg(
                                      imageURL,
                                      index,
                                    ),
                                  index,
                                )
                              }
                            >
                              {intlMessage('takeScreenshot')}
                            </div>
                            {this.props.bannerImages.length > 1 && (
                              <div
                                className={style.popupSelection}
                                onClick={() => {
                                  this.props.removeBannerImg(index);
                                }}
                              >
                                {intlMessage('remove')}
                              </div>
                            )}
                          </div>
                        }
                      >
                        <div className={style.iconWrapper}>
                          <div className={style.operationIcon}></div>
                        </div>
                      </ClickPopup>
                    </>
                  )}
                  <input
                    className={style.hidden}
                    ref={(ref) => {
                      if (ref) {
                        this.bannerImgInputRef[index] = ref;
                      }
                    }}
                    type="file"
                    accept=".jpeg, .png, .jpg"
                    onChange={(ev) => this._handleReplaceBannerImgs(ev, index)}
                  />
                </div>
              );
            })}
            {selectImgLoading ? (
              <div className={style.imgLoadingContainer}>
                <div className={style.loadingIcon}></div>
              </div>
            ) : (
              <div
                className={
                  this.props.bannerImages.length < 3
                    ? style.backgroundImgAddContainer
                    : style.hidden
                }
              >
                <input
                  className={style.hidden}
                  ref={this.uploadBannerInputRef}
                  type="file"
                  accept=".jpeg, .png, .jpg"
                  onChange={this._handleUploadBannerImgs}
                />
                <ClickPopup
                  posX="right"
                  posY="down"
                  popup={
                    <div className={style.popupContainer}>
                      <div
                        className={style.popupSelection}
                        onClick={() => {
                          this.uploadBannerInputRef.current?.click();
                        }}
                      >
                        {intlMessage('uploadPreview')}
                      </div>
                      <div
                        className={style.popupSelection}
                        onClick={() =>
                          this._handleScreenshot(
                            ImageEnum.select,
                            this.props.setBannerImg,
                          )
                        }
                      >
                        {intlMessage('takeScreenshot')}
                      </div>
                    </div>
                  }
                >
                  <div className={style.bannerUploadIcon}></div>
                </ClickPopup>
              </div>
            )}
          </div>
        </div>
        {this.state.showScreenshotMask && (
          <div className={style.screenshotMask}></div>
        )}
      </div>
    );
  }
}
