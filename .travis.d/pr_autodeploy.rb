# frozen_string_literal: true
require 'git'
require 'octokit'

TR_PR_BRANCH = ENV['TRAVIS_PULL_REQUEST_BRANCH']
GH_TOKEN = ENV['GH_TOKEN']
ORG_NAME = ENV['ORG_NAME'] || 'HackGT'
GIT_NAME = ENV['GIT_NAME'] || 'HackGBot'
GIT_EMAIL = ENV['GIT_EMAIL'] || 'thehackgt@gmail.com'

def commit_to_biodomes
  path = Dir.mktmpdir
  git = Git.clone("https://github.com/#{ORG_NAME}/biodomes.git",
                  'biodomes',
                  path: path,
                  depth: 1)
  # Configure git
  git.config('user.name', GIT_NAME)
  git.config('user.email', GIT_EMAIL)
  # Change origin
  git.remote('origin').remove
  git.add_remote('origin',
                 "https://#{GH_TOKEN}@github.com/#{ORG_NAME}/biodomes.git",
                 fetch: false)

  # do whatever work you want
  message = nil
  Dir.chdir(File.join(path, 'biodomes')) { || message = yield }

  # commit & push
  git.add(all: true)
  begin
    git.commit(message)
  rescue
    puts 'Nothing to commit, skipping...'
    return
  end
  git.push
end

def git_branch
  return TR_PR_BRANCH unless TR_PR_BRANCH.nil?
  return ENV['TRAVIS_BRANCH'] unless ENV['TRAVIS_BRANCH'].nil?
  `git rev-parse --abbrev-ref HEAD`.strip
end

def git_remote
  remotes = `git remote -v`.match %r{#{ORG_NAME}/(.*?)\.git }i
  remotes[1]
end

def git_branch_id(branch)
  branch.gsub(/[^0-9a-zA-Z_-]/, '-')
end

def pr_id(branch)
  "#{git_remote}-#{git_branch_id branch}"
end

def create_biodome_file(branch)
  remote = git_remote
  data = <<~EOF
    git:
        remote: "https://github.com/#{ORG_NAME}/#{remote}.git"
        branch: "#{branch}"

    secrets-source: git-#{ORG_NAME}-#{remote}-secrets
    deployment:
        replicas: 1
        strategy:
            type: Recreate
  EOF
  ["pr/#{pr_id branch}.yaml", data.downcase]
end

def create_message(branch)
  <<~EOF
    Hey y'all! A deployment of this PR can be found here:
    https://#{pr_id branch}.pr.hack.gt
  EOF
end

def pr_digest(github, slug)
  github.pulls(slug)
        .select { |p| p.state == 'open' }
        .map do |p|
          {
            branch: p.head.ref,
            number: p.number
          }
        end
        .uniq
end

def main
  github = Octokit::Client.new(access_token: GH_TOKEN)

  remote = git_remote
  slug = "#{ORG_NAME}/#{remote}"

  digest = pr_digest(github, slug)
  open_branches = digest.map { |pr| pr[:branch] }
  files = open_branches.map { |branch| create_biodome_file(branch) }

  # commit all the right files to biodomes
  commit_to_biodomes do
    FileUtils.rm_rf(Dir["./pr/#{remote}-*"])
    files.each do |(path, data)|
      FileUtils.mkdir_p(File.dirname(path))
      File.write(path, data)
    end

    puts `git status`
    puts `git diff`
    "Automatic #{remote} PR deploys of #{open_branches.join(', ')}."
  end

  # Check if this is part of a PR build
  current_branch = git_branch
  current_pr = digest.find { |pr| pr[:branch] == current_branch }
  return if current_pr.nil?

  # Check if a message has already been written
  message = create_message current_branch
  comment_written =
    github
    .issue_comments(slug, current_pr[:number])
    .find { |comment| comment.body.gsub(/\s+/, '') == message.gsub(/\s+/, '') }
  return unless comment_written.nil?

  # Write a message
  github.add_comment(slug, current_pr[:number], message)
end

main
