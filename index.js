//Externos 
const inquirer = require('inquirer')
const chalk = require('chalk')

//Internos
const fs = require('fs')

operation()

function operation(){
    inquirer.prompt([
        {
            type: 'list',
            name:'action',
            message: 'O que você deseja fazer?',
            choices: [
                'Criar conta',
                'Consultar saldo',
                'Depositar',
                'Sacar',
                'Sair',
            ],
        },
    ]).then((answer)=>{
        const action = answer['action']

        if(action==='Criar conta'){
            createAccount()
        }else if(action ==="Depositar"){
            deposit()
        }else if(action ==='Consultar saldo'){
            getBalanceAccount()
        }else if (action ==='Sacar'){
            withdraw()
        }else if(action ==='Sair'){
            console.log(chalk.bgBlue.black("Obrigado por usar o Accounts"))
            process.exit()
        }
    })
    .catch(err=> console.log(err))
}

//Create new Account
function createAccount(){
    console.log(chalk.bgGreen.black('Parabens por escolher nosso banco!'))
    console.log(chalk.green('Defina as opçoes da sua conta a seguir'))

    buildAccount()
}

function buildAccount(){
        inquirer.prompt([
            {
                name: 'accountName',
                message: 'Digite um nome para sua conta:',
            },
        ]).
        then((answer)=>{
            const accountName = answer['accountName']

            console.info(accountName)

            if(!fs.existsSync('accounts')){
                fs.mkdirSync('accounts')
            }

            if(fs.existsSync(`accounts/${accountName}.json`)){
                console.log(
                    chalk.bgRed.black('Essa conta ja existe, tente novamente com outro nome')
                )
                buildAccount()
                return
            }

            fs.writeFileSync(
                `accounts/${accountName}.json`,
                '{"balance":"0"}',
                function(err){
                    console.log(err)
                }
            )

            console.log(chalk.green('Parabéns, conta criada com sucesso'))
            operation()
        })
        .catch(err=> console.log(err))
}

//add new amount to account
function deposit(){
    inquirer.prompt([
        {
            name: 'accountName',
            message: 'Qual o nome da sua conta?'
        }
    ])
    .then((answer)=>{
        const accountName = answer['accountName']

        //verify if account exists
        if(!checkAccount(accountName)){
           return deposit()
        }

        inquirer.prompt([
            {
                name: 'amount',
                message: 'Quanto você deseja depositar'
            }
        ])
        .then((answer)=>{
            const amount = answer['amount']
            addAmount(accountName, amount)
        })
        .catch(err => console.log(err))
    })
    .catch(err => console.log(err))
}

function addAmount(accountName, amount){
    const accountData = getAccount(accountName)
    if(!amount){
        console.log(
            chalk.bgRed.black('ocorreu um erro, tente novamente')
        )
        return deposit()
    }

    accountData.balance = parseFloat(amount) + parseFloat(accountData.balance)

    fs.writeFileSync(
        `accounts/${accountName}.json`,
        JSON.stringify(accountData),
        function(err){
            console.log(err)
        },
    )
    console.log(
        chalk.green(`foi depositado um valor de R$${amount} na sua conta!`)
    )
    operation()
}

//Withdraw
function withdraw(){
    inquirer.prompt([
        {
            name: 'accountName',
            message: 'Qual o nome da sua conta?'
        }
    ])
    .then((answer)=>{
        const accountName = answer['accountName']

        if(!checkAccount(accountName)){
            return withdraw()
        }

        inquirer.prompt([
            {
                name:'amount',
                message: 'Quanto você deseja retirar?'
            }
        ])
        .then((answer)=>{
            const amount = answer['amount']
            removeAmount(accountName, amount)
        })
        .catch(err=> console.log(err))
    })
    .catch(err=> console.log(err))
}

function removeAmount(accountName, amount){
    const accountData = getAccount(accountName)
    if(!amount){
        console.log(
            chalk.bgRed.black('Ocorreu um erro, tente novamente')
        )
        return withdraw()
    }

    if(accountData.balance<amount){
        console.log(
            chalk.bgRed.black('Ocorreu um erro, valor indisponivel')
        )
        return withdraw()
    }

    accountData.balance = parseFloat(accountData.balance) - parseFloat(amount)

    fs.writeFileSync(
        `accounts/${accountName}.json`,
        JSON.stringify(accountData),
        function(err){
            console.log(err)
        }
    )

    console.log(
        chalk.blue(`foi retirado um valor de R$${amount} na sua conta!, seu saldo atual e de ${accountData.balance}`)
    )
    operation()
}

//Check balance
function getBalanceAccount(){
    inquirer.prompt([
        {
            name: 'accountName',
            message: 'Qual o nome da sua conta?'
        }
    ])
    .then((answer)=>{
        const accountName = answer['accountName']

        if(!checkAccount(accountName)){
            return getBalanceAccount()
        }

        const accountData = getAccount(accountName)

        console.log(
            chalk.bgBlue.black(`O saldo da sua conta é de R$${accountData.balance}`)
        )
        operation()
    }).catch(err=> console.log(err))
}

//Util
function getAccount(accountName){
    const accountJSON = fs.readFileSync(`accounts/${accountName}.json`,{
        encoding: 'utf8',
        flag: 'r'
    })

    return JSON.parse(accountJSON)
}

 //account exists
function checkAccount(accountName){
    if(!fs.existsSync(`accounts/${accountName}.json`)){
        console.log(chalk.bgRed.black('Essa conta, não existe, tente novamente'))
        return false
    }else{
        return true
    }
}