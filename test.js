async function createGitHubIssue() {
  const issueTitle = 'Testing'
  const issueBody = '### Title test';

  const duplicate_issue_request =
    await github.rest.search.issuesAndPullRequests({
      q: `repo:${{ github.repository }} is:issue is:open in:title ${issueTitle}`,
    });
  const issue_exists = duplicate_issue_request.data.total_count > 0;
  if (issue_exists) {
    console.log(`There's already an issue for \"${issueTitle}\"`);
  } else {
    github.rest.issues.create({
      owner: context.repo.owner,
      repo: context.repo.repo,
      title: issueTitle,
      body: issueBody,
    });
  }
}

(async function() {
  try {
    await createGitHubIssue()
  } catch (error) {
    if (error.code && error.code === "403") {
      await createGitHubIssue()
    } else {
      console.log({ error })
    }
  }
})()
