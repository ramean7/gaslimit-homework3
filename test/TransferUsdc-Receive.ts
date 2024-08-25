import {loadFixture} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import hre, {ethers} from "hardhat";

// const web3 = require('web3');
// const web3 = new Web3();

// Define a test suite for Sender and Receiver contracts.
describe("Transfer USDC and Receiver", function () {
    // Define a chain selector for the test scenario.
    const chainSelector = "16015286601757825753";

    // A fixture to deploy necessary contracts before each test.
    async function deployFixture() {
        // Get signers, with the first one typically being the deployer.
        // const [owner] = await ethers.getSigners();

        const [owner, alice] = await hre.ethers.getSigners();

        const Router = await ethers.getContractFactory("MockCCIPRouter");
        // const Sender = await ethers.getContractFactory("Sender");
        const TransferUSDC = await ethers.getContractFactory("TransferUSDC");
        // const Receiver = await ethers.getContractFactory("Receiver");
        const BurnMintERC677 = await ethers.getContractFactory("BurnMintERC677");

        // Instantiate the contracts.
        const router = await Router.deploy();
        const link = await BurnMintERC677.deploy(
            "ChainLink Token",
            "LINK",
            18,
            BigInt(1e27).toString()
        );

        const usdc = await BurnMintERC677.deploy(
            "USD Coin",
            "USDC",
            6,
            BigInt(1e12)
        );

        console.log(`USDC deployed to: ${await usdc.getAddress()}`);
        console.log(`LINK deployed to: ${await link.getAddress()}`);
        console.log(`OWNER address to: ${owner.address}`);
        // console.log(`USDC total supply to: ${await usdc.totalSupply()}`);
        // console.log(`LINK total supply to: ${await link.totalSupply()}`);
        // console.log(`USDC Balance to: ${await usdc.balanceOf(owner)}`);
        // console.log(`Link Balance to: ${await link.balanceOf(owner.address)}`);

        // await usdc.connect(owner).mint(alice.address, 100000000000000); // Mint tokens
        //
        // await usdc.transfer(owner.address, 100000000000000); // Transfer 1000 USDC to recipient

        // console.log(`USDC Balance to: ${await usdc.balanceOf(owner.address)}`);

        // const sender = await Sender.deploy(router, link);
        const transferUsdc = await TransferUSDC.deploy(router, link, usdc);
        // const receiver = await Receiver.deploy(router);

        // Setup allowlists for chains and sender addresses for the test scenario.
        // await sender.allowlistDestinationChain(chainSelector, true);

        console.log(`ℹ️ About to call allowlistDestinationChain `);
        await transferUsdc.allowlistDestinationChain(chainSelector, true);
        console.log(`✅ allowlistDestinationChain COMPLETED`)

        // await receiver.allowlistSourceChain(chainSelector, true);
        //
        // // await receiver.allowlistSender(sender, true);
        // await receiver.allowlistSender(transferUsdc, true);


        const transferUsdcAddress = await transferUsdc.getAddress();

        console.log(`TransferUsdcAddress address to: ${transferUsdcAddress}`);
        console.log(`LINK TOTAL SUPPLY b4: ${await link.totalSupply()}`);
        console.log(`USDC TOTAL SUPPLY b4: ${await usdc.totalSupply()}`);
        console.log(`LINK(TransferUsdcAddress) Balance b4: ${await link.balanceOf(transferUsdcAddress)}`);

        console.log(`ℹ️ About to transfer 3 LINKS to the TransferUSDC smart contract`);

        await link.transfer(transferUsdcAddress, BigInt(3e18).toString());

        console.log(`✅ TRANSFER COMPLETED TO: ${transferUsdcAddress}`);

        console.log(`LINK Balance to: ${await link.balanceOf(transferUsdcAddress)}`);

        console.log(`ℹ️ About to approve 1 USDC`);
        await usdc.approve(transferUsdcAddress, 1000000)

        console.log(`✅ 1 USDC APPROVED`);

        // Return the deployed instances and the owner for use in tests.
        // return {owner, sender, receiver, router, link};
        return {owner, transferUsdc, router, link, usdc};
    }

    // Test scenario to send a CCIP message from transferUsdc to receiver and assess gas usage.
    it("should estimate gas fee for _ccipReceive func and pass it to transferUsdc func", async function () {
            // Deploy contracts and load their instances.
            const {owner, transferUsdc, router, usdc} = await loadFixture(deployFixture);

            // Define parameters for the tests, including gas limit and iterations for messages.
            const gasLimit = 500000;
            const testParams = [0, 50, 99]; // Different iteration values for testing.
            const gasUsageReport = []; // To store reports of gas used for each test.
            const _amount = 1000000
            // const _amount = 0

            // const messageId = web3.utils.padRight(web3.utils.asciiToHex("testMessageId"), 64);
            // // ethers.utils.formatBytes32String("testMessageId");
            // const sourceChainSelector = chainSelector;
            // const senderAddress = owner.address;
            const iterations = 256;
            // const data = web3.eth.abi.encodeParameter('uint256', iterations);
            // ethers.utils.defaultAbiCoder.encode(["uint256"], [iterations]);

            // Encode sender address as bytes
            // const encodedSenderAddress = web3.eth.abi.encodeParameter('address', senderAddress);

            // // Mock EVMTokenAmount array
            //         const destTokenAmounts = [
            //             {
            //                 token: await usdc.getAddress(),
            //                 amount: 1000000000000000000
            //                 // web3.utils.toBN("1000000000000000000") // 1 ETH in Wei (for example)
            //             }
            //         ];

            // Encode destTokenAmounts as ABI array
            // const encodedDestTokenAmounts = web3.eth.abi.encodeParameter(
            //     'tuple(address token, uint256 amount)[]',
            //     destTokenAmounts.map(item => [item.token, item.amount])
            // );

            // const any2EvmMessage = {
            //     messageId: messageId,
            //     sourceChainSelector: sourceChainSelector,
            //     sender: web3.eth.abi.encodeParameter('address', senderAddress),
            //     // ethers.utils.defaultAbiCoder.encode(["address"], [senderAddress]),
            //     data: data,
            //     feeToken: "0x0000000000000000000000000000000000000000",
            //     // ethers.constants.AddressZero,
            //     feeAmount: 0,
            // };

            // const any2EvmMessage = {
            //     messageId: messageId,
            //     sourceChainSelector: sourceChainSelector,
            //     sender: encodedSenderAddress,
            //     data: data,
            //     destTokenAmounts: encodedDestTokenAmounts,
            // };
            // Calculate expected maxIterations and result
            // const maxIterations = iterations % 100;
            // let expectedResult = iterations;
            // for (let i = 0; i < maxIterations; i++) {
            //     expectedResult += i;
            // }
            // Loop through each test parameter to send messages and record gas usage.
            for (const iterations of testParams) {
                //
                // await sender.sendMessagePayLINK(
                //     chainSelector,
                //     receiver,
                //     iterations,
                //     gasLimit
                // );
                //
                // await receiver.ccipReceive(
                //     any2EvmMessage as unknown as Any2EVMMessageStruct
                // );
                // console.log("Final Gas Usage Report: here");
                await transferUsdc.transferUsdc(
                    chainSelector,
                    owner.address,
                    _amount,
                    gasLimit
                );


                // Retrieve gas used from the last message executed by querying the router's events.
                const mockRouterEvents = await router.queryFilter(
                    router.filters.MsgExecuted
                );
                const mockRouterEvent = mockRouterEvents[mockRouterEvents.length - 1]; // check last event
                const gasUsed = mockRouterEvent?.args?.gasUsed || 500000;

                // Push the report of iterations and gas used to the array.
                gasUsageReport.push({
                    iterations,
                    gasUsed: gasUsed.toString(),
                });
            }

            // Log the final report of gas usage for each iteration.
            console.log("✅ Final Gas Usage Report:");
            gasUsageReport.forEach((report) => {
                console.log(
                    "Number of iterations %d - Gas used: %d",
                    report.iterations,
                    report.gasUsed
                );
            });

            const gasToBeUsed = (BigInt(gasUsageReport[gasUsageReport.length - 1].gasUsed) * 110n) / 100n;

            console.log("✅ Final gas used: ", gasToBeUsed);

            await transferUsdc.transferUsdc(
                chainSelector,
                owner.address,
                _amount,
                gasToBeUsed
            );

            console.log("✅ transferUsdc function called with 10% increase of total gas used");


        }
    )
    ;
});
