import inquirer from 'inquirer'

const Task = fork => ({
  fork,
  map: fn => Task((rej, res) => fork(rej, x => res(fn(x)))),
  chain: other => Task((rej, res) => fork(rej, x => other(x).fork(rej, res))),
})

const Input = (obj) => ({ type: 'input', ...obj})

const getInput = obj => 
  Task((rej, res) => inquirer.prompt(Input(obj))
    .then(answer => res(answer[obj.name]))
    .catch((error) => 
      (error.isTtyError) ? 
        rej("Prompt couldn't be rendered in the current environment") :
        rej("Something else went wrong"))
  )

const start = () => 
  getInput({
    name: 'playing',
    message: 'Do you want to play a game? (y/n)'
  })
    .chain(answer => Task((rej, res) => {
      (answer === 'n') ? rej('Quit game') : res(answer)
    })
    )


const runApp = () =>
  start().fork(console.log, runApp)

runApp()
