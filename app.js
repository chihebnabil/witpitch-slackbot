const { App, HTTPReceiver } = require('@slack/bolt');
require('dotenv').config();
const openai = require('./open_ai.js');

// Initializes your app with your bot token and app token
const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  socketMode: true,
  appToken: process.env.SLACK_APP_TOKEN,
});

app.error(async (error) => {
  console.error(error);
});


app.command('/fdbk', async ({ command, ack, say }) => {
  await ack();
  await say({
    blocks: [
      {
        "type": "input",
        "element": {
          "type": "plain_text_input",
          "multiline": true,
          "action_id": "reject_input"
        },
        "label": {
          "type": "plain_text",
          "text": "Candidate main reject reasons (Bullet points)",
          "emoji": true
        }
      },
      {
        "type": "section",
        "text": {
          "type": "mrkdwn",
          "text": "A personal rejection message to the candidate"
        },
        "accessory": {
          "type": "button",
          "text": {
            "type": "plain_text",
            "text": "Generate a reject message",
            "emoji": true
          },
          "value": "click_me_123",
          "action_id": "reject_button_click"
        }
      }
    ],
  });
});


app.command('/pitch', async ({ command, ack, say }) => {
  await ack();
  await say({
    blocks: [
      {
        "type": "input",
        "element": {
          "type": "plain_text_input",
          "multiline": true,
          "action_id": "pitch_input"
        },
        "label": {
          "type": "plain_text",
          "text": "Candidate main expertise (Bullet points)",
          "emoji": true
        }
      },
      {
        "type": "section",
        "text": {
          "type": "mrkdwn",
          "text": "A short and concise recommendation"
        },
        "accessory": {
          "type": "button",
          "text": {
            "type": "plain_text",
            "text": "Generate a pitch",
            "emoji": true
          },
          "value": "click_me_123",
          "action_id": "pitch_button_click"
        }
      }
    ],
  });
});

app.action('pitch_button_click', async ({ body, ack, say }) => {
  await ack();
  let blockId = body.message.blocks[0].block_id
  let pitch = body.state.values[blockId].pitch_input.value
  const rs = await openai.openai.createChatCompletion({
    model: "gpt-3.5-turbo-16k",
    messages: [
      {
        role: "user",
        content: "Here's the candidate information :\n\n" + pitch
      },
      {
        role: "system",
        content: openai.CANDIDATE_PITCH_SYSTEM_PROMPT
      }
    ],
  })
  await say(`<@${body.user.id}> ${rs.data.choices[0].message.content}`);
});

(async () => {
  await app.start();
  console.log('⚡️ Bolt app started');
})();