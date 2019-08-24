import jwt from 'jsonwebtoken';
import * as Yup from 'yup';
import User from '../models/User';
import auth from '../../config/auth';

class SessionControler {
  async store(req, res) {
    const schema = Yup.object().shape({
      email: Yup.string()
        .required()
        .email(),
      password: Yup.string().required(),
    });
    if (!(await schema.isValid(req.body))) {
      res.status(401).json({ error: 'Validation fails' });
    }
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email' });
    }

    if (!(await user.checkPassword(password))) {
      return res.status(401).json({ error: 'Invalid password' });
    }
    const { id, name } = user;

    return res.json({
      user: { id, name, email },
      token: jwt.sign({ id }, auth.secret, { expiresIn: auth.expiresIn }),
    });
  }
}
export default new SessionControler();
