const { ethers } = require("hardhat")
const { expect } = require(`chai`)
const { recoverAddress } = require("ethers/lib/utils")
const { result } = require("lodash")


const tokens = (n) =>{

   return ethers.utils.parseUnits(n.toString(),`ether`)

} 

describe(`Token`, () => {

    let token, accounts, deployer, receiver, exchange

    beforeEach( async() => {
        
        const Token = await ethers.getContractFactory(`Token`)
        token = await Token.deploy(`Dapp University`,`DAPP`,1000000)

        accounts = await ethers.getSigners()
        deployer = accounts[0]
        receiver = accounts[1]
        exchange = accounts[2]

    })

    describe(`Deployment`, () => {

    const name = `Dapp University`
    const symbol = `DAPP`
    const decimals = `18`
    const totalSupply = tokens(1000000)

    it(`has correct name`, async () => {

    
        expect(await token.name() ).to.equal(name)
    

    })

    it(`has correct symbol`, async () => {

        

        expect(await token.symbol() ).to.equal(symbol)

    })

    it(`has correct decimals`, async () => {

         
        expect(await token.decimals()).to.equal(decimals)

    })
    
    it(`has correct totalSupply`, async ( ) => {
        
        
        expect(await token.totalSupply()).to.equal(totalSupply)
    })

    it(`assigns totalSupply to deployer`, async ( ) => {
        
        
        expect(await token.balanceOf(deployer.address)).to.equal(totalSupply)
    })
})



    describe(`Sending Token`, () => {
        let amount, transaction, result
        
        describe(`Success`, () => {
            beforeEach(async () => {
                amount = tokens(100)
                transaction = await token.connect(deployer).transfer(receiver.address, amount)
                result = await transaction.wait()
    
            })
    
            it(`transfers token balances`, async () => {
                // Log balance before transger
                //console.log(`deployer balance befor transfer`, await token.balanceOf(deployer.address))
                //console.log(`receiver balance befor transfer`, await token.balanceOf(receiver.address))
                //transfer tokens    
               
    
                //ensure tokens were changed
                expect(await token.balanceOf(deployer.address)).to.equal(tokens(999900))
                expect(await token.balanceOf(receiver.address)).to.equal(amount)
                // Log after before transger
    
                //console.log(`deployer balance befor transfer`, await token.balanceOf(deployer.address))
                //console.log(`receiver balance befor transfer`, await token.balanceOf(receiver.address))
            })
    
            it(`emits a transfer event`,async () =>{
                const eventLogs = result.events[0]
                
                expect(eventLogs.args._from).to.equal(deployer.address)
                expect(eventLogs.args._to).to.equal(receiver.address)
                expect(eventLogs.args._value).to.equal(amount)
            })
        })

        describe(`Failure`, () =>{

            it(`rejects insufficient balances`, async () =>{
            const invalidAmount =  tokens(1000000000)
            
            await expect(token.connect(deployer).transfer(receiver.address, invalidAmount)).to.be.reverted;
                        
            })


            it(`rejects invalid recipients`, async () =>{

                const amount = tokens(100)
                await expect(token.connect(deployer).transfer(`0x0000000000000000000000000000000000000000`,amount)).to.be.reverted
            })
        })
    })

       describe(`Approving Tokens`, () => {
        let amount, transaction, result
        beforeEach(async () => {

            amount = tokens(100)
            transaction = await token.connect(deployer).approve(exchange.address, amount)
            result = await transaction.wait()

        })
        describe(`Success`, () => {

        it(`allocates an allowance for delegated token spending`, async () => {

            expect(await token.allowance(deployer.address, exchange.address)).to.equal(amount)
        })

        it(`emits an approval event`,async () =>{

            const eventLogs = result.events[0]
            expect(eventLogs.args._owner).to.equal(deployer.address)
            expect(eventLogs.args._spender).to.equal(exchange.address)
            expect(eventLogs.args._value).to.equal(amount)

        })

        })

        describe(`Failure`, () => {

            it(`rejects invalid spenders`, async () => {

               await expect(token.connect(deployer).approve(`0x0000000000000000000000000000000000000000`, amount)).to.be.reverted
            })
            
        })
    })

    describe(`Delegated Token Transfers`, () => {
        let amount, transaction, result
        beforeEach(async () => {
         amount = tokens(100)
         transaction = await token.connect(deployer).approve(exchange.address, amount)
         result = await transaction.wait()
        })

        describe(`Success`, () => {
         beforeEach(async () => {      
             transaction = await token.connect(exchange).transferFrom(deployer.address, receiver.address, amount)
             result = await transaction.wait()
        
            })            

        it(`transfers token balances`, async () => 
            {   

            expect(await token.balanceOf(deployer.address)).to.be.equal(ethers.utils.parseUnits(`999900`,`ether`))
            expect(await token.balanceOf(receiver.address)).to.be.equal(amount)

            })
        it(`resets the allowance`, async () => {

            expect(await token.allowance(deployer.address, exchange.address)).to.be.equal(0)
        })
        it(`emits a transfer event`, async () => {

            const eventLog= result.events[0]
            
            expect(eventLog.args._from).to.be.equal(deployer.address)
            expect(eventLog.args._to).to.be.equal(receiver.address)
            expect(eventLog.args._value).to.be.equal(amount)
            

        })

        })
        describe(`Failure`, async () => {
           
             
            const invalidAmount = tokens(100000000000000000)
            await expect(token.connect(exchange).transferFrom(deployer.address,receiver.address, invalidAmount)).to.be.reverted

           
        })

        console.log(accounts)

    })
}) 