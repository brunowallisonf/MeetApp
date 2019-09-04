import * as Yup from 'yup';
import { isBefore, parseISO, startOfDay, endOfDay } from 'date-fns';
import { Op } from 'sequelize';
import Meetup from '../models/Meetup';
import User from '../models/User';
import File from '../models/File';

class MeetupController {
  async store(req, res) {
    const schema = Yup.object().shape({
      title: Yup.string().required(),
      description: Yup.string().required(),
      localization: Yup.string().required(),
      date: Yup.date().required(),
      file_id: Yup.number().required(),
    });
    if (isBefore(parseISO(req.body.date), new Date())) {
      return res.status(401).json({ error: 'Past dates are not permitted' });
    }
    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }
    const { title, description, localization, date, file_id } = req.body;
    const meetup = await Meetup.create({
      title,
      localization,
      description,
      date,
      file_id,
      user_id: req.id,
    });
    return res.json(meetup);
  }

  async index(req, res) {
    const { date, page } = req.query;
    if (!date || !Number(page)) {
      return res.status(401).json({ error: 'invalid or empty params' });
    }
    const offset = (Number(page) - 1) * 10;
    const dateObject = parseISO(req.query.date);
    const meetups = await Meetup.findAll({
      where: {
        date: {
          [Op.between]: [startOfDay(dateObject), endOfDay(dateObject)],
        },
        user_id: {
          [Op.ne]: req.id,
        },
      },
      include: [
        { model: User, as: 'organizer', attributes: ['name', 'email', 'id'] },
        { model: File, as: 'banner', attributes: ['url'] },
      ],
      limit: 10,
      offset,
    });
    return res.json(meetups);
  }
}

export default new MeetupController();
