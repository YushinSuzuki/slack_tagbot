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
  chat:write (for chat.postMessage, chat.update)
  users.profile:read (for users.profile.get)
  channels:history (for conversations.replies)
  channels:read(for conversations.info)
  groups:history
  groups:read(for conversations.info)
  im:history(for conversations.info)
  mpim:history(for conversations.info)
  
>User tokens
  chat:write(for chat.postMessage, chat.update)
  users.profile:read(for users.profile.get)
  channels:history (for conversations.replies)
  channels:read(for conversations.info)
  groups:history
  groups:read(for conversations.info)
  im:history(for conversations.info)
  mpim:history(for conversations.info)
  
 
 [usage]
 1: integration this bot to a channel.
 2: post a comment with hash tag of a channel.

![tagbot](https://user-images.githubusercontent.com/62285965/169650961-40f96802-9693-4dcf-9b6c-0b66f7e075ae.png)
