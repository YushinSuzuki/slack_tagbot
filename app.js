const { App } = require('@slack/bolt');

const app = new App({
    token: process.env.SLACK_BOT_TOKEN,
    signingSecret: process.env.SLACK_SIGNING_SECRET
});

/**
 * get a message event contains cannhel tags
 */
app.message('#', async({ message, event, client, logger }) => {
    /**
     * get positions of cannhel tags from the message.
     */
    const regexp_start = /<#/g;
    let start_idxs = [];
    let start_idx = [];

    while ((start_idx = regexp_start.exec(message.text)) !== null) {
        start_idxs.push(start_idx);
    }

    for (const idx in start_idxs) {
        const ch_id = message.text.substr(start_idxs[idx].index + 2, 11);

        /**
         * make a message txt for the new posts.
         */
        const event_ts = message.ts.replace('.', '');
        let new_text;

        if (message.thread_ts) {
            new_text = `<https://test.slack.com/archives/${message.channel}/p${event_ts}?thread_ts=${message.thread_ts}&cid=${message.channel}|original > > `
        } else {
            new_text = `<https://test.slack.com/archives/${message.channel}/p${event_ts}|original > > `
        }

        /**
         * get a chennel information for private status.
         * if the channnel is unprivate, link of original message shows same massage.
         * so only private channel want "message.text" for new text.
         */
        let ch_info;
        try {
            ch_info = await client.conversations.info({
                token: client.token,
                channel: message.channel,
            });
            logger.info('ch_info = ', ch_info);
        } catch (error) {
            logger.error('error = ', error);
        }

        if (ch_info.channel.is_private) {
            new_text += message.text;
        }

        /**
         * get a profile of the posted user
         * for the bot to pretend to be the user.
         */
        let displayName;
        try {
            displayName = await app.client.users.profile.get({
                token: client.token,
                user: message.user
            });
            logger.info('displayName = ', displayName);
        } catch (error) {
            logger.error('error = ', error);
        }

        try {
            const result = await client.chat.postMessage({
                token: client.token,
                username: displayName.profile.display_name,
                channel: ch_id,
                text: new_text,
                icon_url: displayName.profile.image_original
            });
            logger.info('result = ', result);
        } catch (error) {
            logger.error('error = ', error);
        }
    }
});

/**
 * get a message event
 */
app.event('message', async({ event, client, logger, message }) => {
    /**
     * If the message is posted to a thread,
     * post the message to the thread
     * of the copied message on another channels.
     */
    //checking the message is in a thread.
    if (event.thread_ts) {
        /**
         * get a profile of the posted user
         * for the bot to pretend to be the user.
         */
        let displayName = await app.client.users.profile.get({
            token: client.token,
            user: event.user
        });

        /**
         * get a chennel information for private status.
         * if the channnel is unprivate, link of original message shows same massage.
         * so only private channel want "replies.messages[0].text" for new text.
         */
        let ch_info;
        try {
            ch_info = await client.conversations.info({
                token: client.token,
                channel: message.channel,
            });
            logger.info('ch_info = ', ch_info);
        } catch (error) {
            console.error(error);
        }

        /**
         * make a message txt for the new posts.
         */
        const event_channell = event.channel;
        const ts = message.ts.replace('.', '');
        const thread_ts = message.thread_ts;
        let new_text = `<https://test.slack.com/archives/${event_channell}/p${ts}?thread_ts=${thread_ts}&cid=${event_channell}|original > > `
        if (ch_info.channel.is_private) {
            new_text += message.text;
        }

        /**
         * get messages in a thread.
         */
        let replies;
        try {
            replies = await client.conversations.replies({
                token: client.token,
                channel: event.channel,
                ts: event.thread_ts,
                inclusive: true
            });
            logger.info('replies = ', replies);
        } catch (error) {
            console.error(error);
        }

        /**
         * make a txt from the parent message of the thread
         * for find out the copied message.
         */
        //replies.messages[0] is a original parent message of a thread
        const parent_ts = replies.messages[0].ts.replace('.', '');
        let parent_text = `<https://test.slack.com/archives/${event_channell}/p${parent_ts}|original > &gt; `

        if (ch_info.channel.is_private) {
            parent_text += replies.messages[0].text;
        }

        /**
         * get positions of cannhel tags from the parent message.
         */
        const regexp_start = /<#/g;
        let start_idxs = [];
        let start_idx = [];

        while ((start_idx = regexp_start.exec(replies.messages[0].text)) !== null) {
            start_idxs.push(start_idx);
        }

        /**
         * post the message to each channels.
         */
        for (const i in start_idxs) {
            /**
             * get channel IDs as times as the number of channel tags.
             */
            //replies.messages[0] is a original parent message of a thread
            const ch_id = replies.messages[0].text.substr(start_idxs[i].index + 2, 11);

            /**
             * get messages from the posted channel
             */
            let copied_messages;
            try {
                copied_messages = await client.conversations.history({
                    token: client.token,
                    channel: ch_id
                });
                logger.info('copied_messages = ', copied_messages);
            } catch (error) {
                console.error(error);
            }

            /**
             * get the parent message of the thread from poted channels
             */
            let copied_parent_message;
            for (const idx in copied_messages.messages) {
                if (copied_messages.messages[idx].text == parent_text) {
                    copied_parent_message = copied_messages.messages[idx];
                }
            }

            /**
             * post the message to the thread of the posted channel.
             */
            try {
                const result = await client.chat.postMessage({
                    token: client.token,
                    username: displayName.profile.display_name,
                    channel: ch_id,
                    text: new_text,
                    thread_ts: copied_parent_message.ts,
                    icon_url: displayName.profile.image_original
                });
                logger.info('result = ', result);
            } catch (error) {
                console.error(error);
            }
        }

    }

    console.log(event);
    /**
     * If the message was edited,
     * overwrite the copied message on other channels
     * with a new message.
     */
    if (event.subtype == 'message_changed') {
        /**
         * get a chennel information for private status.
         */
        try {
            ch_info = await client.conversations.info({
                token: client.token,
                channel: message.channel,
            });
            logger.info('ch_info = ', ch_info);
        } catch (error) {
            console.error(error);
        }

        /**
         * get positions of cannhel tags from the message.
         */
        // const start_idx = replies.messages[0].text.indexOf("<#")
        const regexp_start = /<#/g;
        let start_idxs = [];
        let start_idx = [];

        while ((start_idx = regexp_start.exec(message.message.text)) !== null) {
            start_idxs.push(start_idx);
        }

        /**
         * post the message to each channels.
         */
        var ch_info;
        var new_text = "";
        for (const i in start_idxs) {
            /**
             * get channel IDs as times as the number of channel tags.
             */
            const ch_id = message.message.text.substr(start_idxs[i].index + 2, 11);

            /**
             * make a message txt for the new posts.
             */
            const ts = message.message.ts.replace('.', '');
            const thread_ts = message.thread_ts;

            if (thread_ts) {
                new_text = `<https://test.slack.com/archives/${event.channel}/p${ts}?thread_ts=${thread_ts}&cid=${event.channel}|original > > `
            } else {
                new_text = `<https://test.slack.com/archives/${event.channel}/p${ts}|original > > `
            }

            /**
             * if the channnel is unprivate, link of original message shows same massage.
             * so only private channel want "message.text" for new text.
             */
            if (ch_info.channel.is_private) {
                new_text += message.message.text;
            }

            /**
             * make a txt from the previous_message
             * for find out the copied message.
             */
            const parent_ts = message.previous_message.ts.replace('.', '');
            var previous_txt = `<https://test.slack.com/archives/${event.channel}/p${parent_ts}|original > &gt; `

            if (ch_info.channel.is_private) {
                previous_txt += message.previous_message.text;
            }

            /**
             * get messages from the posted channel
             */
            let copied_messages;
            copied_messages = await client.conversations.history({
                token: client.token,
                channel: ch_id
            });

            console.log(copied_messages);

            /**
             * get the parent message of the thread from poted channels
             */
            let copied_message;
            for (const idx in copied_messages.messages) {
                if (copied_messages.messages[idx].text == previous_txt) {
                    copied_message = copied_messages.messages[idx];
                }
            }

            /**
             * post the message to the thread of the posted channel.
             */
            try {
                const result = await client.chat.update({
                    token: client.token,
                    channel: ch_id,
                    text: new_text,
                    ts: copied_message.ts,
                });
                logger.info('result = ', result);
            } catch (error) {
                console.error(error);
            }
        }
    }

    /**
     * if the message in a thread,
     * it's gonna post to copied message thread.
     */
    if (message.message.thread_ts) {
        /**
         * get messages in a thread.
         */
        var replies;
        try {
            replies = await client.conversations.replies({
                token: client.token,
                channel: event.channel,
                ts: message.message.thread_ts,
                inclusive: true
            });
            logger.info('replies = ', replies);
        } catch (error) {
            console.error(error);
        }

        /**
         * make a txt from the parent message of the thread
         * for find out the copied message.
         */
        //replies.messages[0] is a original parent message of a thread
        const parent_ts = replies.messages[0].ts.replace('.', '');
        let parent_text = `<https://test.slack.com/archives/${event.channel}/p${parent_ts}|original > &gt; `

        if (ch_info.channel.is_private) {
            parent_text += replies.messages[0].text;
        }

        /**
         * get positions of cannhel tags from the parent message.
         */
        const regexp_start = /<#/g;
        let start_idxs = [];
        let start_idx = [];

        while ((start_idx = regexp_start.exec(replies.messages[0].text)) !== null) {
            start_idxs.push(start_idx);
        }

        /**
         * post the message to each channels.
         */
        for (const i in start_idxs) {
            /**
             * get channel IDs as times as the number of channel tags.
             */
            //replies.messages[0] is a original parent message of a thread
            const ch_id = replies.messages[0].text.substr(start_idxs[i].index + 2, 11);

            /**
             * get messages from the posted channel
             */
            let copied_messages;
            try {
                copied_messages = await client.conversations.history({
                    token: client.token,
                    channel: ch_id
                });
                logger.info('copied_messages = ', copied_messages);
            } catch (error) {
                console.error(error);
            }

            /**
             * get the parent message of the thread from poted channels
             */
            let copied_message;
            for (const idx in copied_messages.messages) {
                if (copied_messages.messages[idx].text == parent_text) {
                    copied_message = copied_messages.messages[idx];
                }
            }
            /**
             * fine the copied message in the thread of channels
             */
            let replies;
            try {
                replies = await client.conversations.replies({
                    token: client.token,
                    channel: event.channel,
                    ts: copied_message.thread_ts,
                    inclusive: true
                });
                logger.info('replies = ', replies);
            } catch (error) {
                console.error(error);
            }

            let copied_thread_mes;

            for (const p in replies.messages.length) {
                if (replies.messages[p].text == previous_txt) {
                    copied_thread_mes = replies.messages[p];
                }
            }

            /**
             * post the message to the thread of the posted channel.
             */
            try {
                const result = await client.chat.update({
                    token: client.token,
                    channel: ch_id,
                    text: new_text,
                    thread_ts: copied_thread_mes.ts
                });
                logger.info('result = ', result);
            } catch (error) {
                console.error(error);
            }
        }

    }


});

(async() => {
    // Start your app
    await app.start(process.env.PORT || 3000);

    console.log('⚡️ Bolt app is running!');
})();