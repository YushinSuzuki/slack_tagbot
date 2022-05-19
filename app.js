const { App } = require('@slack/bolt');

const app = new App({
    token: process.env.SLACK_BOT_TOKEN,
    signingSecret: process.env.SLACK_SIGNING_SECRET
});

/**
 * get a message event
 */
app.event('message', async({ event, client, logger }) => {
    try {
        const event_channell = event.channel;
        var displayName;
        var new_text;

        /**
         * check a message is in thread.
         */
        if (event.thread_ts) {

            /**
             * get a profile of posting user.
             */
            displayName = await app.client.users.profile.get({
                token: client.token,
                user: event.user
            });

            console.log("イベント！！！");
            try {
                /**
                 * get a new message in a thread.
                 */
                const replies = await client.conversations.replies({
                    token: client.token,
                    channel: event.channel,
                    ts: event.thread_ts,
                    inclusive: true
                });

                var last_mes;
                for (const idx in replies.messages) {
                    if (replies.messages[idx].client_msg_id == event.client_msg_id) {
                        last_mes = replies.messages[idx];
                    }
                }

                console.log("replies.messages", replies.messages);
                console.log("last_mes", last_mes);

                /**
                 * make a message txt for new posts.
                 */
                const ts = last_mes.ts.replace('.', '');
                const thread_ts = last_mes.thread_ts;
                new_text = `<https://test.slack.com/archives/${event_channell}/p${ts}?thread_ts=${thread_ts}&cid=${event_channell}|original > > `
                new_text += last_mes.text;

                console.log('new_text = ', new_text);

                /**
                 * make a txt of a posted message
                 * that is originally parent message of a thread.
                 */
                console.log('replies.messages[0] = ', replies.messages[0].text);

                //replies.messages[0] is a original parent message of a thread
                const parent_ts = replies.messages[0].ts.replace('.', '');
                var parent_text = `<https://test.slack.com/archives/${event_channell}/p${parent_ts}|original > &gt; `
                parent_text += replies.messages[0].text;

                console.log('parent_text = ', parent_text);

                /**
                 * get positions of cannhel tags.
                 */
                // const start_idx = replies.messages[0].text.indexOf("<#")
                const regexp_start = /<#/g;
                let start_idxs = [];
                let start_idx = [];

                while ((start_idx = regexp_start.exec(replies.messages[0].text)) !== null) {
                    start_idxs.push(start_idx);
                }

                /**
                 * post a message to each channels.
                 */
                for (const i in start_idxs) {

                    /**
                     * get channel IDs as times as the number of channel tags.
                     */
                    //replies.messages[0] is a original parent message of a thread
                    const ch_id = replies.messages[0].text.substr(start_idxs[i].index + 2, 11);
                    console.log('ch_id = ', ch_id);

                    /**
                     * get messages from a poted channel
                     */
                    var copied_messages;
                    try {
                        copied_messages = await client.conversations.history({
                            token: client.token,
                            channel: ch_id
                        });

                        console.log('copied_messages = ', copied_messages);

                        /**
                         * get a parent message of a thread from poted channels
                         */
                        var copied_parent_message;
                        for (const idx in copied_messages.messages) {
                            if (copied_messages.messages[idx].text == parent_text) {
                                copied_parent_message = copied_messages.messages[idx];
                            }
                        }

                        console.log('copied_parent_message = ', copied_parent_message);

                        /**
                         * post a message to thread of a posted channel.
                         */
                        const result = await client.chat.postMessage({
                            token: client.token,
                            username: displayName.profile.display_name,
                            channel: ch_id,
                            text: new_text,
                            thread_ts: copied_parent_message.ts,
                            icon_url: displayName.profile.image_original
                        });

                    } catch (error) {
                        console.error(error);
                    }

                }

            } catch (error) {
                console.error(error);
            }

        }

    } catch (error) {
        logger.error(error);
    }
});

app.message('#', async({ message, event, client, logger }) => {
    try {
        const regexp_start = /<#/g;
        let start_idxs = [];
        let start_idx = [];

        console.log("メッセージ！！！");

        while ((start_idx = regexp_start.exec(message.text)) !== null) {
            start_idxs.push(start_idx);
        }

        for (const idx in start_idxs) {

            const ch_id = message.text.substr(start_idxs[idx].index + 2, 11);
            console.log("ch_id == ", ch_id);

            const event_ts = message.ts.replace('.', '');

            var new_text;

            if (message.thread_ts) {
                new_text = `<https://test.slack.com/archives/${message.channel}/p${event_ts}?thread_ts=${message.thread_ts}&cid=${message.channel}|original > > `
            } else {
                new_text = `<https://test.slack.com/archives/${message.channel}/p${event_ts}|original > > `
            }

            console.log("message.conversations.info == ", message.conversations.info);

            if (message.conversations.info.is_private) {
                new_text += message.text;
            }

            const displayName = await app.client.users.profile.get({
                token: client.token,
                user: message.user
            });

            const result = await client.chat.postMessage({
                token: client.token,
                username: displayName.profile.display_name,
                channel: ch_id,
                text: new_text,
                icon_url: displayName.profile.image_original
            });

            // logger.info('result = ', result);
        }

    } catch (error) {
        logger.error('error = ', error);
    }
});


(async() => {
    // Start your app
    await app.start(process.env.PORT || 3000);

    console.log('⚡️ Bolt app is running!');
})();