import { UserModel } from '../model/auth.model';
import { HttpError } from '../error/http-error';

export class DashboardService {
  async getOverview(userId: string) {
    const user = await UserModel.findById(userId).lean();

    if (!user) {
      throw new HttpError(404, 'User not found');
    }

    const firstName = user.full_name?.split(' ')[0] || 'Trekker';

    const dateLabel = new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    }).format(new Date()).toUpperCase();

    return {
      header: {
        dateLabel,
        greeting: `Journey Dashboard, ${firstName}`,
        location: 'Namche Bazaar • Everest Region',
      },
      expedition: {
        title: 'Everest Base Camp',
        subtitle: 'Day 05 • Namche to Tengboche',
        distance: '11.2 km',
        ascent: '+780 m',
        eta: '5h 20m',
        progress: 0.62,
        statusTag: 'SYNC OK',
      },
      insights: [
        {
          title: 'Summit Readiness',
          value: '84%',
          hint: 'Excellent pacing and acclimatization trend',
          type: 'readiness',
        },
        {
          title: 'Weather Window',
          value: '14:30 - 17:00',
          hint: 'Safer crossing visibility expected',
          type: 'weather',
        },
      ],
      nextCheckpoint: {
        order: 3,
        title: 'Phunki Thenga Bridge',
        detail: 'ETA 09:20 • Water refill and pulse scan',
      },
      tasks: [
        {
          title: 'Hydration checkpoint',
          meta: 'Due in 20 min',
          done: true,
        },
        {
          title: 'Confirm weather window',
          meta: 'Before 12:00',
          done: false,
        },
        {
          title: 'Submit daily trek log',
          meta: 'Evening',
          done: false,
        },
      ],
    };
  }
}
