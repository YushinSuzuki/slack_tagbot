const { App } = require('@slack/bolt');

const app = new App({
    token: process.env.SLACK_BOT_TOKEN,
    signingSecret: process.env.SLACK_SIGNING_SECRET
});

app.event('message', async({ event, client, logger }) => {
    try {
        const event_channell = event.channel;
        var displayName;
        var ch_id;
        var new_text;
        var new_parent_message;

        if (event.thread_ts) {
            try {
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
                console.log('last_mes = ', last_mes);

                const start_idx = replies.messages[0].text.indexOf("<#")

                ch_id = replies.messages[0].text.substr(start_idx + 2, 11);

                displayName = await app.client.users.profile.get({
                    token: client.token,
                    user: event.user
                });

                const ts = last_mes.ts.replace('.', '');
                const thread_ts = last_mes.thread_ts;
                var origin_text;
                const text_idx = last_mes.text.indexOf(">")

                if (last_mes.text.includes("#")) {
                    origin_text = last_mes.text.substr(text_idx + 2);
                } else {
                    origin_text = last_mes.text;
                }

                new_text = `<https://test.slack.com/archives/${event_channell}/p${ts}?thread_ts=${thread_ts}&cid=${event_channell}|${origin_text}> `

                var parent_messages;
                new_parent_message;

                const text_idx2 = replies.messages[0].text.indexOf(">")
                const parent_origin_text = replies.messages[0].text.substr(text_idx2 + 2);
                const parent_ts = replies.messages[0].ts.replace('.', '');

                const parent_text = `<https://test.slack.com/archives/${event_channell}/p${parent_ts}|${parent_origin_text}> `

                try {
                    parent_messages = await client.conversations.history({
                        token: client.token,
                        channel: ch_id
                    });

                    console.log('parent_messages = ', parent_messages);

                    console.log('parent_text = ', parent_text);

                    for (const idx in parent_messages.messages) {
                        if (parent_messages.messages[idx].text == parent_text) {
                            new_parent_message = parent_messages.messages[idx];
                        }
                    }

                    console.log('new_parent_message = ', new_parent_message);


                } catch (error) {
                    console.error(error);
                }

                const result = await client.chat.postMessage({
                    token: client.token,
                    username: displayName.profile.display_name,
                    channel: ch_id,
                    text: new_text,
                    thread_ts: new_parent_message.ts,
                    icon_url: displayName.profile.image_original
                });


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
        const regexp1 = /<#/g;
        const regexp2 = />/g;
        let array1 = [];
        let array2 = [];

        const result1 = regexp1.exec(message.text); // または text.match( rg );
        const result2 = regexp2.exec(message.text); // または text.match( rg );

        // while (result1 !== null && result1[0] != '') {
        //     array1.push(result1);
        // }

        console.log("result1: ", result1);


        // while (result2 !== null) {
        //     array2.push(result2);
        // }

        // for (let i = 0; array1.length > i; i++) {

        //     console.log("value: ", array1[i].valueOf());

        //     console.log("index: ", array1[i].index, );

        // }

        // for (let i = 0; array2.length > i; i++) {

        //     console.log("value: ", array2[i].valueOf());

        //     console.log("index: ", array2[i].index, );

        // }


        const start_idx = message.text.indexOf("<#")
        const end_idx = message.text.indexOf(">")

        const ch_id = message.text.substr(start_idx + 2, 11);
        const replace_txt = message.text.substr(start_idx, end_idx - start_idx + 1);

        console.log("replace_txt == ", replace_txt);

        const event_ts = message.ts.replace('.', '');
        const origin_text = message.text.replace(replace_txt, "");

        // console.log("origin_text == ", origin_text);

        var new_text;

        if (message.thread_ts) {
            new_text = `<https://test.slack.com/archives/${message.channel}/p${event_ts}?thread_ts=${message.thread_ts}&cid=${message.channel}|${origin_text}> `
        } else {
            new_text = `<https://test.slack.com/archives/${message.channel}/p${event_ts}|${origin_text}> `
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
        logger.info('result = ', result);
    } catch (error) {
        logger.error('error = ', error);
    }
});


(async() => {
    // Start your app
    await app.start(process.env.PORT || 3000);

    console.log('⚡️ Bolt app is running!');
})();