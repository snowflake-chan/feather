import { Settings } from '../settings-schema';

export const SETTINGS_MIGRATIONS:((settings:Settings) => void)[] = [
    require('./settings-1'),
    require('./settings-2'),
    require('./settings-3'),
    require('./settings-4'),
    require('./settings-5'),
];