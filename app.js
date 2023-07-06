const { App, HTTPReceiver } = require('@slack/bolt');
require('dotenv').config();
const openai = require('./open_ai.js');
const { BigQuery } = require('@google-cloud/bigquery');
const blocks = require('./blocks.js')
/*
* Initialize BigQuery client using the service account key (service_account.json)
*/

const bigquery = new BigQuery({
  projectId: 'proxify-data',
  keyFilename: process.env.SERVER_KEY_PATH
});


// Initializes your app with your bot token and app token
const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  socketMode: true,
  appToken: process.env.SLACK_APP_TOKEN,
});

app.error(async (error) => {
  console.error(error);
});


app.command('/pitch', async ({ command, ack, say }) => {
  await ack();
  await say({
    blocks: [
      {
        "type": "input",
        "element": {
          "type": "plain_text_input",
          "action_id": "staffing_request_id"
        },
        "label": {
          "type": "plain_text",
          "text": "Staffing Request ID",
          "emoji": true
        }
      },
      {
        "type": "input",
        "element": {
          "type": "plain_text_input",
          "action_id": "developer_id"
        },
        "label": {
          "type": "plain_text",
          "text": "Developer ID",
          "emoji": true
        }
      },
      {
        "type": "input",
        "element": {
          "type": "plain_text_input",
          "multiline": true,
          "action_id": "pitch_input"
        },
        "label": {
          "type": "plain_text",
          "text": "What is not mentioned in the profile that highlights why this candidate is a great fit for the role?",
          "emoji": true
        }
      },
      {
        "type": "actions",
        "elements": [
          {
            "type": "button",
            "text": {
              "type": "plain_text",
              "text": "Pitch",
              "emoji": true
            },
            "value": "click_me_123",
            "action_id": "pitch_button_click"
          }
        ]
      }
    ],
  });
});

app.command('/which_skills', async ({ command, ack, say }) => {
  await ack();
  console.log('autocomplete_field command')
  await say({
    blocks: blocks.PITCH_BLOCK,
  });
});


/*
* Load the options from the external data menu field
*/
app.options('autocomplete_field', async ({ options, ack }) => {
  return await ack({
    options:[]
  });
});

app.action('autocomplete_field', async ({ body, ack, say }) => {
  await ack();
  console.log('autocomplete_field action')  
});

app.action('pitch_button_click', async ({ body, ack, say }) => {
  await ack();
  const inputKeys = Object.keys(body.state.values)
  let staffingRequestId = body.state.values[inputKeys[0]].staffing_request_id.value
  let pitch = body.state.values[inputKeys[2]].pitch_input.value
  let developerId = body.state.values[inputKeys[1]].developer_id.value

  const profileQuery = await bigquery.query({
    query: `SELECT 
    d.id,
    d.name,
    d.title.en as title,
    d.summary.en as summary,
    d.commitment,
    d.community_id,
    d.alias,
    TO_JSON(sk.skill_proficiency_level) as skills, 
    sk.education,
    je.job_experience
  FROM 
  \`proxify.developers\` d 
  JOIN \`proxify-data.proxify_analytics.v_developer_profile_skills\` sk on d.id = sk.developer_id
  JOIN (
    SELECT 
      ex.developer_id,
      TO_JSON(ARRAY_AGG(
        STRUCT(
          ex.id,
          ex.employer,
          ex.job_description,
          ex.title,
          ex.start_date,
          ex.end_date,
          ex.still_working,
          (SELECT ARRAY_AGG(skill.skills_name) FROM UNNEST(ex.skills_used) as skill) AS skills_used
        )
      )) AS job_experience
    FROM \`proxify-data.proxify_analytics.v_developer_profile_job_experience\` ex
    GROUP BY ex.developer_id
  ) je on d.id = je.developer_id
    WHERE d.id = ${developerId} LIMIT 1`
  })


  const staffingRequestQuery = await bigquery.query({
    query: `SELECT *
    FROM \`proxify-data.proxify.recruitments\`
    WHERE id = ${staffingRequestId} 
    LIMIT 1`
  })

  let userMessage = `
  Please help me generate the perfect pitch based on the given details
  Here's the candidate information (represented as javascript object) :\n\n 
  ${profileQuery[0][0]} 
  \n\n And Here's the staffing request informations :\n\n ${staffingRequestQuery[0][0].additional_information}\n\n`

  if (pitch != null && pitch != undefined && pitch != '') {
    userMessage += `Here are some additional information about the candidate :\n\n` + pitch + `\n\n`
  }

  console.log(staffingRequestQuery[0][0]])

  userMessage += `Please generate the perfect pitch that highlights the developer's expertise and experience, matches the staffing request, and introduces him as the ideal candidate.
  `

  userMessage  += `\n PLEASE LIMIT THE OUTPUT TEXT TO MAXIMUM 400 CHARACTERS LENGTH`

  const rs = await openai.openai.createChatCompletion({
    model: "gpt-3.5-turbo-16k",
    messages: [
      {
        role: "user",
        content: userMessage
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