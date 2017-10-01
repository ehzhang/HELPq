Template.tickets.helpers({
  activeTickets: function () {
    return Tickets.find({
      status: {
        $in: ['OPEN', 'CLAIMED']
      },
      expiresAt: {
        $gt: InstantReactiveNow.get()
      }
    }).fetch();
  }
});
