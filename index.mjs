import inquirer from 'inquirer'

const yesOrNo = value => {
  const reg = new RegExp('(y(es)?|no?)', 'i')
  return reg.test(value) ? true : 'Please write "yes" or "no"';
}

const isNo = value => {
  const reg = new RegExp('no?', 'i')
  return reg.test(value);
}

const inquirerConf = {
  start: {
    type: 'input',
    name: 'playing',
    message: 'Do you want to play a game? (y/n)',
    validate: yesOrNo
  },
  selectGame: {
    type: 'list',
    name: 'game',
    message: 'Which Game would you like to play?',
    choices: () => Object.keys(router),
  },
  guessing: {
    type: 'input',
    name: 'guessing',
    message: 'Guess a number',
  },
}

const Task = fork => ({
  fork,
  map: fn => Task((rej, res) => fork(rej, x => res(fn(x)))),
  chain: other => Task((rej, res) => fork(rej, x => other(x).fork(rej, res))),
})

const getUserInput = obj => 
  Task((rej, res) => inquirer.prompt(obj)
    .then(answer => res(answer[obj.name]))
    .catch((error) => 
      (error.isTtyError) ? 
        rej("Prompt couldn't be rendered in the current environment") :
        rej("Something else went wrong"))
  )

const start = () => 
  getUserInput(inquirerConf.start)
    .map(answer => isNo(answer) ? quit : selectGame)

const quit = () => Task((rej, _) => rej('Quit game'))

const selectGame = () =>
  getUserInput(inquirerConf.selectGame)
  .map(answer => router[answer])

const guessing = () =>
  getUserInput(inquirerConf.guessing)

const router = { guessing }

const runApp = f =>
  f().fork(console.log, runApp)

runApp(start)
