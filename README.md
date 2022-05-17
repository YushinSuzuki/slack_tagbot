# slack_tagbot
Organize your Slack comments with tags.

[installation]
> install "Slack Bolt"
https://slack.dev/bolt-js/tutorial/getting-started
(up to "Setting up your project")

> Upload to Heroku
https://slack.dev/bolt-js/deployments/heroku


[Required events]
>Event Subscriptions > Subscribe to bot events
  message.channels(for public channel)
  message.groups(for private channel)
  

[Required scopes]
>OAuth & Permissions
>Bot tokens
  chat:write (for chat.postMessage)
  users.profile:read (for users.profile.get)
  channels:history (for conversations.replies)
  groups:history
  im:history
  mpim:history
  
>User tokens
  chat:write(chat.postMessage)
  users.profile:read(users.profile.get)
  channels:history (for conversations.replies)
  groups:history
  im:history
  mpim:history
