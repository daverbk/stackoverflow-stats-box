const axios = require('axios');
const { Octokit } = require("octokit");

const {
  GIST_ID, GT_TOKEN, USERID,
} = process.env;

const STACKOVERFLOW_URL = "https://api.stackexchange.com/2.3/users/" + USERID + "?site=stackoverflow";
const STACKOVERFLOW_QUES_URL = "https://api.stackexchange.com/2.3/users/" + USERID + "/questions?site=stackoverflow&filter=total"
const STACKOVERFLOW_ANS_URL = "https://api.stackexchange.com/2.3/users/" + USERID + "/answers?site=stackoverflow&filter=total"
const STACKOVERFLOW_TOP_ATG_URL = "https://api.stackexchange.com/2.3/users/" + USERID + "/top-tags?pagesize=3&site=stackoverflow"

async function update_gist(user_data, user_ques, user_ans, user_top_tag) {
  const octokit = new Octokit({
    auth: GT_TOKEN
  })

  tags = ""
  user_top_tag.items.forEach(element => {
    tags += "[" + element.tag_name + "] " 
  });


  gold = String(user_data.items[0].badge_counts.gold).padEnd(4)
  silver = String(user_data.items[0].badge_counts.silver).padEnd(4)
  bronze = String(user_data.items[0].badge_counts.bronze).padEnd(4)

  reputation = String("Reputation:").padEnd(12) + user_data.items[0].reputation
  questions = String("Questions:").padEnd(12) + user_ques.total
  answers = String("Answers:").padEnd(12) + user_ans.total

  content_table = [
    `${tags}`,
    `🥇 ${gold}| ${reputation}`,
    `🥈 ${silver}| ${questions}`,
    `🥉 ${bronze}| ${answers}`,
  ].join("\n")

  const gist = await octokit.request('GET /gists/{gist_id}', {
        gist_id: GIST_ID,
    });
  const filename = Object.keys(gist.data.files)[0];
  
  await octokit.request('PATCH /gists/{gist_id}', {
    gist_id: GIST_ID,
    files: {
      [filename]: {
        content: content_table
      }
    }
  })
  console.log("Update Success !!!!!")
  console.log(content_table)
}

async function query_stackoverflow() {
  const headers = {
    "content-type": "application/json"
  };
  
  user_result = await axios.get(STACKOVERFLOW_URL, {
    headers: headers
  })

  user_ques_result = await axios.get(STACKOVERFLOW_QUES_URL, {
    headers: headers
  })

  user_ans_result = await axios.get(STACKOVERFLOW_ANS_URL, {
    headers: headers
  })

  user_top_tag = await axios.get(STACKOVERFLOW_TOP_ATG_URL, {
    headers: headers
  })

  await update_gist(user_result.data, user_ques_result.data, user_ans_result.data, user_top_tag.data)
};

query_stackoverflow()
