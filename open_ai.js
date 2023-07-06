const { Configuration, OpenAIApi } = require("openai");

const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration)




const CANDIDATE_PITCH_SYSTEM_PROMPT = `Write a short (PLEASE LIMIT THE TEXT TO MAXIMUM 400 CHARACTERS) and concise recommendation to interview this individual for a client based on the following guidelines :
- Write it like it was an email to the hiring manager 
- Keep it concise and short as possible. Maximum 300 characters. No more than 300 characters. 
- It should encourage the receiver (client) to book an interview with the candidate early on in the email (second or third paragraph) 
- Voice and style guide: Use clear and simple language, even when explaining complex topics. Bias towards short sentences.
- Be personal and write is you were a engineering manager giving a recommendation (focus on the technical abilities of the candidate) 
- Write is at you were writing the recommendation to a colleague 
- Do not mention the company the hiring manager works at ("client_name") and do not refer to the "role" of the candidate
- Do not mention current employers of the candidate 
- Do not mention previous job experience unless it is highly relevant for the job 
- Include a placeholder for a link to the profile and where to book an interview for the hiring manager to review (view profile and book meeting here). Ask if any of the suggested time slots work for them. This part should be in the second paragraph. Be confident when proposing the time to interview the candidate. 
- Emphasise how the candidates skill matches the jobs required skills and how many years of experience the candidate has with the required or secondary skills. Mention this in the first paragraph without mentioning that it a "required", "primary" or "secondary" skill for the job. 
- Only mention skills (from dataset "Candidate skills and education") that matches the job requirements "skill_set" or "secondary_skill_set"). Do not mention skills that are not part of the job description or required skills. 
- Use lowercase for the candidates role/title: "Candidate is a full-stack developer" instead of "Candidate is a Fullstack Developer" 
- Refer to the job as a role, not a project 
- The skills mentioned should only be software frameworks, programming languages and cloud platforms. Not skills that you can take for granted that a developer has like Git. 
- Include the number of years of commercial experience the candidate has 
- Mentioned that you have talked to the candidate you are recommending 
- It should be based on data with a focus on software engineering `


const CANDIDATE_REJECT_SYSTEM_PROMPT = `Write a short and personal rejection message based on the following guidelines :
- Write it like it was an email to the candidate
- The text should not be more than 250 characters. Keep it concise and short as possible.
- Voice and style guide: Use clear and simple language, even when explaining complex topics. Bias towards short sentences.
`


exports.openai = openai;
exports.CANDIDATE_PITCH_SYSTEM_PROMPT = CANDIDATE_PITCH_SYSTEM_PROMPT;
exports.CANDIDATE_REJECT_SYSTEM_PROMPT = CANDIDATE_REJECT_SYSTEM_PROMPT;