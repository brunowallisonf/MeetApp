import { isAfter } from 'date-fns';

import { Op } from 'sequelize';
import Subscription from '../models/Subscription';
import Meetup from '../models/Meetup';
import User from '../models/User';
import Queue from '../../lib/Queue';
import File from '../models/File';
import SubscriptionMail from '../jobs/SubscriptionMail';

class SubscriptionController {
  async store(req, res) {
    const { meetup_id } = req.body;
    const checkExists = await Subscription.findOne({
      where: { meetup_id, user_id: req.id },
    });
    if (checkExists) {
      return res.status(401).json({ error: 'You are already subscribed' });
    }

    const meetup = await Meetup.findOne({
      where: { id: meetup_id },
      include: [
        { model: User, as: 'organizer', attributes: ['name', 'email'] },
      ],
    });
    if (!meetup) {
      return res.status(400).json({ error: `Meetup doesn't exists ` });
    }
    if (meetup.user_id === req.id) {
      return res
        .status(400)
        .json({ error: `You cannot subscribe in your own ` });
    }
    const checkHour = await Subscription.findOne({
      where: { user_id: req.id },
      include: [{ model: Meetup, where: { date: meetup.date } }],
    });
    if (checkHour) {
      return res.status(401).json({ error: 'Hour conflict' });
    }
    if (isAfter(new Date(), meetup.date)) {
      return res
        .status(401)
        .json({ error: `You can subscribe in a old meetup` });
    }
    const myUser = await User.findByPk(req.id);
    Queue.add(SubscriptionMail.key, { meetup, myUser });
    return res.json(await Subscription.create({ meetup_id, user_id: req.id }));
  }

  async index(req, res) {
    const subs = await Subscription.findAll({
      include: [
        {
          model: Meetup,
          where: {
            date: {
              [Op.gte]: new Date(),
            },
          },
          attributes: ['id', 'title', 'description', 'localization', 'date'],
          include: [
            {
              model: User,
              as: 'organizer',
              attributes: ['id', 'name', 'email'],
            },
            {
              model: File,
              as: 'banner',
              attributes: ['path', 'url'],
            },
          ],
          order: ['date'],
        },
      ],
      where: {
        user_id: req.id,
      },
      attributes: ['id'],
    });
    return res.json(subs);
  }
}

export default new SubscriptionController();
