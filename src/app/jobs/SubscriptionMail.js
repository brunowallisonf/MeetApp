import Mail from '../../lib/Mail';

class SubscriptionMail {
  get key() {
    return 'SubscriptionMail';
  }

  async handle({ data }) {
    const { meetup, myUser } = data;
    await Mail.sendMail({
      to: `${meetup.organizer.name} <${meetup.organizer.email}>`,
      subject: `Nova inscricao`,
      template: 'subscribe',
      context: {
        title: meetup.title,
        ownerName: meetup.organizer.name,
        userName: myUser.name,
        userEmail: myUser.email,
      },
    });
  }
}

export default new SubscriptionMail();
