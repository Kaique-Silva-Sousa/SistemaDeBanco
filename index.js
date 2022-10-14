const inquirer = require('inquirer')
const chalk = require('chalk')

const fs = require('fs')

operation()

function operation(){
    inquirer.prompt([
    {
        type:'list',
        name:'action',
        message:'O que voce deseja fazer?',
        choices: [
            'Criar Conta',
            'Consultar Saldo',
            'Depositar',
            'Sacar',
            'Sair'
        ]

    }
    ]).then((resposta)=>{
        const action = resposta['action'] 
        if(action === 'Criar Conta'){
            createAccount()
        }else if(action === 'Consultar Saldo'){
            getAccountBalance()
        }else if(action ==='Depositar'){
            deposit()
        }else if(action ==='Sacar'){
            withdraw()
        }else if(action==='Sair'){
            console.log(chalk.blue('Obrigado por usar o Accounts'))
            process.exit()
        }else{
            return console.log('Erro.')
        }
    })
    .catch((e)=>{
        console.log(e)
    })
}

function createAccount(){
    console.log(chalk.bgMagenta.black('Obrigado por escolher este banco'))
    console.log(chalk.blue('Define as opcoes da sua conta a seguir'))
    buildAccount()
}

function buildAccount(){
    inquirer.prompt([
        {name:'accountName',message:'Digite um nome para sua conta: '},
    ]).then((resposta)=>{
        const accountname = resposta['accountName']
        console.info(accountname)

        if(!fs.existsSync('accounts')){
            fs.mkdirSync('accounts')
        }
        
        if(fs.existsSync(`accounts/${accountname}.json`)){
            console.log(chalk.bgRed.black('Está conta ja existe, escolha outro nome'))
            return buildAccount()
        }
        inquirer.prompt([{
            type:'list',
            name:'types',
            message:'Qual tipo de conta voce deseja criar?',
            choices:['Conta Corrente','Conta Poupança']
        }])
        .then(answer=>{
            const accountType = answer['types']
            console.log(accountType)
            fs.writeFileSync(`accounts/${accountname}.json`,`{"balance":0,"type":"${accountType}"}`,function(err){
                console.log(err)
            })
            console.log(chalk.green.bold('Conta criada com sucesso!'))
            operation()
        })
        .catch(err=>{
            console.log(err)
        })
    })
    .catch((err)=>{
        console.log(err)
    })
}

function deposit(){
    inquirer.prompt([{
        name:'accountName',message:'Qual o nome da sua conta?'
    }])
    .then((resposta)=>{
        const accountName = resposta['accountName']
        
        if(!checkAccount(accountName)){
            return deposit()
        }

        inquirer.prompt([{
            name:'amount', message:'Quanto voce deseja depositar?'
        }])
        .then((resposta)=>{
            const amount = resposta['amount']
            addAmount(accountName,amount)
            operation()
        })
        .catch(err=>{
            console.log(err)
        })
    })
    .catch(e=>{
        console.log(e)
    })
}
function checkAccount(accountName){
    if(!fs.existsSync(`accounts/${accountName}.json`)){
        console.log(chalk.bgRed.black('Está conta nao existe! tente novamente'))
        return false
    }
    return true
}
function addAmount(accountName,amount){
    const account = getAccount(accountName)

    if(!amount){
        console.log(chalk.bgRed.black('Ocorreu um erro'))
        return deposit()
    }
    account.balance = parseFloat(amount) + parseFloat(account.balance)
    fs.writeFileSync(`accounts/${accountName}.json`, JSON.stringify(account),function(err){
        console.log(err)
    })

    console.log(chalk.green(`Foi depositado o valor de R$${amount} na sua conta`))

}

function getAccount(accountName){
    const accountJSON = fs.readFileSync(`accounts/${accountName}.json`,{
        encoding:'utf8',
        flag: 'r'
    })
    return JSON.parse(accountJSON)
}

function getAccountBalance(){
    inquirer.prompt([{
        name:'accountname', message:'Digite o nome da sua conta'
    }])
    .then(resposta=>{
        const accountname = resposta['accountname']
        if(!checkAccount(accountname)){
            return getAccountBalance()
        }

        const accountdata = getAccount(accountname)
        console.log(chalk.bgBlue.black(`Olá! o saldo da sua conta é de  R${accountdata.balance}`))
        operation()
    })
    .catch(err=>{
        console.log(err)
    })
}


function withdraw(){
    inquirer.prompt([{
        name:'accountname', message:'Digite o nome da sua conta: '
    }])
    .then(resposta=>{
        const accountname = resposta['accountname']
        if(!checkAccount(accountname)){
            return withdraw()
        }
        inquirer.prompt([
            {name:'amount',message:'Quanto voce deseja sacar? '}
        ])
        .then(resposta=>{
            const amount = resposta['amount']
            removeAmount(accountname,amount)
        })
        .catch(err=>{
            console.log(err)
        })

    })
    .catch(e=>{
        console.log(e)
    })
}

function removeAmount(accountname,amount){
    const accountdata = getAccount(accountname)
    if(!amount){
        console.log(chalk.bgRed.black('Ocorreu um erro!'))
        return withdraw()
    }
    if(accountdata.type ==="Conta Corrente"){
        return withdrawCC(accountname,amount,accountdata)
    }
    if(accountdata.balance < amount){
        console.log(chalk.bgRed.black('Valor indisponivel'))
        return withdraw()
    }
    accountdata.balance = parseFloat(accountdata.balance) - parseFloat(amount)
    fs.writeFileSync(`accounts/${accountname}.json`,JSON.stringify(accountdata),function(err){
        console.log(err)
    })
    console.log(chalk.green(`Foi realizado um saque de R${amount} na sua conta`))
    operation()
}

function withdrawCC(accountname,amount){
    const accountdata = getAccount(accountname)
    if((accountdata.balance + 100) < amount){
        console.log(chalk.bgRed.black('Valor indisponivel'))
        return withdraw()
    }
    accountdata.balance = parseFloat(accountdata.balance) - parseFloat(amount)
    fs.writeFileSync(`accounts/${accountname}.json`,JSON.stringify(accountdata),function(err){
        console.log(err)
    })
    console.log(chalk.green(`Foi realizado um saque de R${amount} na sua conta`))
    operation()
}