const { App } = require('@slack/bolt');
require('dotenv').config();
const openai = require('./open_ai.js');
const blocks = require('./blocks.js')
const queries = require('./queries.js')

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
    blocks: blocks.REQUEST_PITCH_BLOCK,
  });
});

app.command('/which_skills', async ({ command, ack, say }) => {
  await ack();
  console.log('autocomplete_field command')
  await say({
    blocks: blocks.SKILLS_EXTRACT_BLOCK,
  });
});


/*
* Load the options from the external data menu field
*/
app.options('autocomplete_field', async ({ options, ack }) => {
  let staffingRequests = await queries.findStaffingRequest(options.value);
  options.options = staffingRequests.map((staffingRequest) => {
    return {
      text: {
        type: 'plain_text',
        text: staffingRequest.request_title
      },
      value: staffingRequest.id.toString()
    }
  }).slice(0, 5);
  return await ack({
    options: options.options
  });
});

app.action('autocomplete_field', async ({ body, ack, say }) => {
  await ack();
  /*
  * Get the selected option from the menu field
  */
  const selectedOption = body.actions[0].selected_option;
  const staffingRequest = await queries.getStaffingRequest(selectedOption.value)
  console.log(staffingRequest)
});

app.action('pitch_button_click', async ({ body, ack, say }) => {
  await ack();
  const inputKeys = Object.keys(body.state.values)
  let staffingRequestId = body.state.values[inputKeys[0]].staffing_request_id.value
  let pitch = body.state.values[inputKeys[2]].pitch_input.value
  let developerId = body.state.values[inputKeys[1]].developer_id.value

  const profileQuery = await queries.getDeveloper(developerId)
  const staffingRequestQuery = await queries.getStaffingRequest(staffingRequestId)
  let userMessage = `
  Please help me generate the perfect pitch based on the given details
  Here's the candidate information (represented as javascript object) :\n\n 
  ${profileQuery} 
  \n\n And Here's the staffing request informations :\n\n ${staffingRequestQuery.additional_information}\n\n`

  if (pitch != null && pitch != undefined && pitch != '') {
    userMessage += `Here are some additional information about the candidate :\n\n` + pitch + `\n\n`
  }

  userMessage += `Please generate the perfect pitch that highlights the developer's expertise and experience, matches the staffing request, and introduces him as the ideal candidate.
  `

  userMessage += `\n PLEASE LIMIT THE OUTPUT TEXT TO MAXIMUM 400 CHARACTERS LENGTH`

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