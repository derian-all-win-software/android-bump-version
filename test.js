class CustomGitHubException extends Error {
  constructor(message) {
    super(message);
    this.name = "CustomGitHubException"
    this.response = {
      data: {
        message: 'You have exceeded a secondary rate limit. Please wait a few minutes before you try again.'
      }
    }
  }
}

async function createGitHubIssue({ predicate }) {
  const issueTitle = 'Testing #02'
  const issueBody = '### Title test';

  const duplicate_issue_request =
    await github.rest.search.issuesAndPullRequests({
      q: `repo:${{ github.repository }} is:issue is:open in:title ${issueTitle}`,
    });
  if (predicate) {
    throw new CustomGitHubException(`There's already an issue for \"${issueTitle}\"`);
  } else {
    github.rest.issues.create({
      owner: context.repo.owner,
      repo: context.repo.repo,
      title: issueTitle,
      body: issueBody,
    });
  }
}

try {
  await createGitHubIssue({ predicate: true })
} catch (error) {
  if (error?.response?.data?.message === 'You have exceeded a secondary rate limit. Please wait a few minutes before you try again.') {
    await createGitHubIssue({ predicate: false })
    return
  }

  throw error
}