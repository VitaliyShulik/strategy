//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.12;
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "./PancakeSwap/MasterChefV2.sol";
import "./PancakeSwap/PancakeStableSwap.sol";
import "./PancakeSwap/PancakeStableSwapFactory.sol";
import "./PancakeSwap/interfaces/IMasterChef.sol";

import "hardhat/console.sol";

contract Strategy is Ownable, ReentrancyGuard {

    IERC20 internal constant depositToken = IERC20(0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56); // BUSD
    mapping(address => mapping(address => uint256)) userDepositedBalance;

    IERC20 internal constant lpTokenA = IERC20(0x55d398326f99059fF775485246999027B3197955); // USDT
    IERC20 internal constant lpTokenB = IERC20(0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d); // USDC

    PancakeStableSwapFactory internal constant StableSwapFactory = PancakeStableSwapFactory(0x36bBb126e75351C0DfB651e39b38fe0BC436FFD2);

    PancakeStableSwap internal constant stableLP = PancakeStableSwap(0x3EFebC418efB585248A0D2140cfb87aFcc2C63DD);
    IERC20 internal constant lpToken = IERC20(0xee1bcc9F1692E81A281b3a302a4b67890BA4be76);

    uint256 internal constant poolId = 135;
    IMasterChef internal constant farm = IMasterChef(0xa5f8C5Dbd5F286960b9d90548680aE5ebFf07652);

    uint256 public constant MAX_BPS = 10_000;

    constructor() {}

    function getDepositToken() external pure returns(address) {
        return address(depositToken);
    }

    function deposit(uint256 amount) external onlyOwner nonReentrant {
        // takes tokens as a deposit
        require(depositToken.balanceOf(msg.sender) >= amount, "Insufficient deposit token funds");

        userDepositedBalance[msg.sender][address(depositToken)] = amount;

        // swap deposit toket to lpTokenA
        PancakeStableSwapFactory.StableSwapPairInfo memory pairInfo = StableSwapFactory.getPairInfo(address(depositToken), address(lpTokenA));

        PancakeStableSwap swapContract = PancakeStableSwap(pairInfo.swapContract);

        (uint256 depositTokenIndex, uint256  lpTokenAIndex) = (pairInfo.token0 == address(depositToken)) ? (0, 1) : (1, 0);
        uint256 amountA = swapContract.get_dy(depositTokenIndex, lpTokenAIndex, amount);
        swapContract.exchange(depositTokenIndex, lpTokenAIndex, amount, amountA);

        // approve and add liquidity to the stableLP and get lpTokens
        lpTokenA.approve(address(stableLP), amountA);

        uint256 minMintAmount = amountA - calculatePercentage(amountA, 50); // the default slippage percent is 0.5
        stableLP.add_liquidity([amountA, 0], minMintAmount);

        // approve and add lpTokens to the farm
        uint256 lpTokenAmount = lpToken.balanceOf(address(this)); // TODO: find the best way to get added liquidity
        lpToken.approve(address(farm), lpTokenAmount);

        farm.deposit(poolId, lpTokenAmount);
    }

    function calculatePercentage(uint256 amount, uint256 bps) public pure returns (uint256) {
        require((amount * bps) >= MAX_BPS, "The amount multiplied by the Basis Points is greater than or equal to 10.000");
        return amount * bps / MAX_BPS;
    }

}