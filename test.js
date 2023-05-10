const seconds = 90;
const timeout = 0;
const maxAttempts = 3;
let attempts = 1;

async function createGitHubIssue() {
  const issueTitle = "Testing #02";
  const issueBody = "### Title test";

  const duplicateIssueRequest = await github.rest.search.issuesAndPullRequests({
    // q: `repo:${{ github.repository }} is:issue is:open in:title ${issueTitle}`,
  });
  const issueExists = duplicateIssueRequest.data.total_count > 0;
  if (issueExists) {
    console.log(`There's already an issue for \"${issueTitle}\"`);
  } else {
    await github.rest.issues.create({
      owner: context.repo.owner,
      repo: context.repo.repo,
      title: issueTitle,
      body: issueBody,
    });
    console.log("Issue created successfully");
  }
}

function handleGitHubIssue() {
  if (attempts > maxAttempts) {
    throw new Error("Issue not created successfully");
  }

  setTimeout(() => {
    createGitHubIssue().catch((error) => {
      if (
        !error?.response?.data?.message.includes(
          "You have exceeded a secondary rate limit"
        )
      ) {
        throw error;
      }

      attempts++;
      timeout != 90 && (timeout += 90)
      handleGitHubIssue();
    });
  }, timeout);
}

handleGitHubIssue();
