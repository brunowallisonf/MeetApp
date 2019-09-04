import { isAfter } from 'date-fns';
import * as Yup from 'yup';
import Meetup from '../models/Meetup';
import File from '../models/File';

class OrganizingController {
  async index(req, res) {
    const meetups = await Meetup.findAll({
      where: { user_id: req.id },
      include: [{ model: File, as: 'banner' }],
    });
    res.json(meetups);
  }

  async delete(req, res) {
    const meetup = await Meetup.findOne({
      where: { id: req.params.id, user_id: req.id },
    });
    if (!meetup) {
      return res.status(401).json({ error: 'Invalid meetup' });
    }
    if (isAfter(new Date(), meetup.date)) {
      return res.status(401).json({ error: 'Past meetups cannot be deleted' });
    }
    meetup.destroy();
    return res.json();
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      title: Yup.string(),
      description: Yup.string(),
      localization: Yup.string(),
      date: Yup.date(),
      file_id: Yup.number(),
    });
    if (!schema.isValid(req.body)) {
      return res.status(400).json({ error: 'Validation fails' });
    }
    const meetup = await Meetup.findOne({
      where: { id: req.params.id, user_id: req.id },
    });
    if (!meetup) {
      return res.status(404).json({ error: 'meetup not found' });
    }

    if (isAfter(new Date(), meetup.date)) {
      return res.status(401).json({ error: 'You cannot update past meetups' });
    }
    const { title, description, localization, date, file_id } = req.body;
    meetup.update({ title, description, localization, date, file_id });
    await meetup.save();
    return res.json(await meetup.save());
  }
}
export default new OrganizingController();
