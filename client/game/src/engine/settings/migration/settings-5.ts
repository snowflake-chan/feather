import { Settings, GuestAntiAddictSchema } from '../settings-schema';

export default function (settings:Settings) {
    settings.teenagerAntiAddict = [];
    settings.guestAntiAddict = GuestAntiAddictSchema.identity;
}