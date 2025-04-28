export const generateReminderEmailTemplate = (user, subscription, daysUntilRenewal) => `
    <h2>Subscription Renewal Reminder</h2>
    <p>Hello ${user.name},</p>
    <p>Your subscription for ${subscription.name} will renew in ${daysUntilRenewal} days.</p>
    <p>Subscription Details:</p>
    <ul>
        <li>Name: ${subscription.name}</li>
        <li>Price: ${subscription.price} ${subscription.currency}</li>
        <li>Renewal Date: ${subscription.renewalDate}</li>
    </ul>
    <p>Thank you for using our service!</p>
`;