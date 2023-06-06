import { simpleGit } from 'simple-git'

// main function
async function main() {
  const git = simpleGit('../mock-repo/')
  const log = await git.log()
  console.log(log)
  for (const l of log.all) {
    console.log(l)
    await new Promise((resolve) => setTimeout(resolve, 500))
  }
}

// run main function
main()
