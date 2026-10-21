import { DB } from '@box/schema/backend/database-type';

export function getIntlStatus(intl: any, status: DB.ContentStatus) {
  const statusMessage: { [s in DB.ContentStatus]: string } = {
    [DB.ContentStatus.unpublished]: intl('unpublished'),
    [DB.ContentStatus.published]: intl('accepted'),
    [DB.ContentStatus.rejected]: intl('unAccept'),
    [DB.ContentStatus.underReview]: intl('underReview'),
    [DB.ContentStatus.removed]: intl('contentRemoved'),
    [DB.ContentStatus.censored]: intl('contentCensored'),
  };
  return statusMessage[status];
}
