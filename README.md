<!-- ABOUT THE PROJECT -->
## About The Project

There are many great README templates available on GitHub; however, I didn't find one that really suited my needs so I created this enhanced one. I want to create a README template so amazing that it'll be the last one you ever need -- I think this is it.

<!-- GETTING STARTED -->
## Getting Started

This is an example of how you run slack_tagbot on your Heroku server.

### Installation

1. Install "Slack Bolt" [https://slack.dev/bolt-js/tutorial/getting-started](https://slack.dev/bolt-js/tutorial/getting-started)(up to "Setting up your project")
2. Upload to Heroku [https://slack.dev/bolt-js/deployments/heroku](https://slack.dev/bolt-js/deployments/heroku)


### Required events

* Event Subscriptions > Subscribe to bot events
  ```sh
  message.channels(for public channel)
  message.groups(for private channel)
  ```
  
### Required scopes
 
* OAuth & Permissions > Bot tokens
  ```sh
  chat:write (for chat.postMessage, chat.update, etc.)
  users.profile:read (for users.profile.get, etc.)
  channels:history (for conversations.replies etc.)
  channels:read(for conversations.info, etc.)
  groups:history
  groups:read(for conversations.info, etc.)
  im:history(for conversations.info, etc.)
  mpim:history(for conversations.info, etc.)
  ```
  
  
* OAuth & Permissions > User tokens
  ```sh
  chat:write(for chat.postMessage, chat.update, etc.)
  users.profile:read(for users.profile.get, etc.)
  channels:history (for conversations.replies, etc.)
  channels:read(for conversations.info, etc.)
  groups:history
  groups:read(for conversations.info, etc.)
  im:history(for conversations.info, etc.)
  mpim:history(for conversations.info, etc.)
  ``` 
  
## Usage

 1: integration this bot to a channel.
 2: post a comment with hash tag of a channel.

![tagbot](https://user-images.githubusercontent.com/62285965/169650961-40f96802-9693-4dcf-9b6c-0b66f7e075ae.png)


<!-- LICENSE -->
## License

Distributed under the MIT License.

<p align="right">(<a href="#top">back to top</a>)</p>



<!-- CONTACT -->
## Contact
Yushin Suzuki - kizusuzuki@gmail.com

<p align="right">(<a href="#top">back to top</a>)</p>
