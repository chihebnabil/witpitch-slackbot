const { BigQuery } = require('@google-cloud/bigquery');

/*
* Initialize BigQuery client using the service account key (service_account.json)
*/
const bigquery = new BigQuery({
    projectId: 'proxify-data',
    keyFilename: process.env.SERVER_KEY_PATH
});


async function getStaffingRequest(id) {


    const query = `SELECT id, request_title , additional_information FROM \`proxify-data.proxify.recruitments\` WHERE id = ${id}`;
    const options = {
        query: query,
    };

    const [rows] = await bigquery.query(options);

    return rows[0];
}


async function findStaffingRequest(q) {
  
    const query = `SELECT id, request_title , additional_information FROM \`proxify-data.proxify.recruitments\`  
    WHERE deleted_at is null and completed_at is null and state = true and
    request_title like '%${q}%'`;
    const options = {
        query: query,
    };
    const [rows] = await bigquery.query(options);
    return rows;
}


async function getDeveloper(id) {
    const query = `SELECT 
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
    WHERE d.id = ${id} LIMIT 1`;
    const options = {
        query: query,
    };

    const [rows] = await bigquery.query(options);

    return rows[0];
}

exports.getStaffingRequest = getStaffingRequest
exports.getDeveloper = getDeveloper
exports.findStaffingRequest = findStaffingRequest