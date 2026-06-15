import { useState, useCallback } from 'react';
import { useWriteContract, useReadContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther } from 'viem';

// GMArc 签到合约 ABI
const CHECKIN_ABI = [
  {
    inputs: [],
    name: 'sign',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'MESSAGE',
    outputs: [{ internalType: 'string', name: '', type: 'string' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'totalSignatures',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: '', type: 'address' }],
    name: 'hasSigned',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: '', type: 'address' }],
    name: 'signedAt',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const;

// Greeting 合约 ABI
const GREETING_ABI = [
  {
    inputs: [],
    stateMutability: 'nonpayable',
    type: 'constructor',
  },
  {
    inputs: [],
    name: 'getGreeting',
    outputs: [{ internalType: 'string', name: '', type: 'string' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'string', name: '_message', type: 'string' }],
    name: 'setGreeting',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const;

// 合约地址
const CHECKIN_CONTRACT_ADDRESS = '0x3e721061491026eFBaDEE180Ad268b220AA06825';

// Greeting 合约字节码
const GREETING_BYTECODE = '0x608060405234801561000f575f5ffd5b506040518060400160405280601d81526020017f48656c6c6f204172632c207468697320697320537572662120f09f918b0000008152505f908161005391906102e7565b503360015f6101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff1602179055506103b6565b5f81519050919050565b7f4e487b71000000000000000000000000000000000000000000000000000000005f52604160045260245ffd5b7f4e487b71000000000000000000000000000000000000000000000000000000005f52602260045260245ffd5b5f600282049050600182168061011457607f821691505b602082108103610127576101266100d0565b5b50919050565b5f819050815f5260205f209050919050565b5f6020601f8301049050919050565b5f82821b905092915050565b5f600883026101897fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff8261014e565b610193868361014e565b95508019841693508086168417925050509392505050565b5f819050919050565b5f819050919050565b5f6101d76101d26101cd846101ab565b6101b4565b6101ab565b9050919050565b5f819050919050565b6101f0836101bd565b6102046101fc826101de565b84845461015a565b825550505050565b5f5f905090565b61021b61020c565b6102268184846101e7565b505050565b5f5b8281101561024c576102415f828401610213565b60018101905061022d565b505050565b601f82111561029f578282111561029e5761026b8161012d565b6102748361013f565b61027d8561013f565b602086101561028a575f90505b8083016102998284038261022b565b505050505b5b505050565b5f82821c905092915050565b5f6102bf5f19846008026102a4565b1980831691505092915050565b5f6102d783836102b0565b9150826002028217905092915050565b6102f082610099565b67ffffffffffffffff811115610309576103086100a3565b5b61031382546100fd565b61031e828285610251565b5f60209050601f83116001811461034f575f841561033d578287015190505b61034785826102cc565b8655506103ae565b601f19841661035d8661012d565b5f5b828110156103845784890151825560018201915060208501945060208101905061035f565b868310156103a1578489015161039d601f8916826102b0565b8355505b6001600288020188555050505b505050505050565b6107eb806103c35f395ff3fe608060405234801561000f575f5ffd5b506004361061004a575f3560e01c80638da5cb5b1461004e578063a41368621461006c578063e21f37ce14610088578063fe50cc72146100a6575b5f5ffd5b6100566100c4565b60405161006391906102a2565b60405180910390f35b61008660048036038101906100819190610408565b6100e9565b005b610090610149565b60405161009d91906104af565b60405180910390f35b6100ae6101d4565b6040516100bb91906104af565b60405180910390f35b60015f9054906101000a900473ffffffffffffffffffffffffffffffffffffffff1681565b805f90816100f791906106e6565b503373ffffffffffffffffffffffffffffffffffffffff167fea07f7ca8b8b2cfaab1214b6e1459ad859cf1ff2d60a948a1f9c4644970c89508260405161013e91906104af565b60405180910390a250565b5f8054610155906104fc565b80601f0160208091040260200160405190810160405280929190818152602001828054610181906104fc565b80156101cc5780601f106101a3576101008083540402835291602001916101cc565b820191905f5260205f20905b8154815290600101906020018083116101af57829003601f168201915b505050505081565b60605f80546101e2906104fc565b80601f016020809104026020016040519081016040528092919081815260200182805461020e906104fc565b80156102595780601f1061023057610100808354040283529160200191610259565b820191905f5260205f20905b81548152906001019060200180831161023c57829003601f168201915b5050505050905090565b5f73ffffffffffffffffffffffffffffffffffffffff82169050919050565b5f61028c82610263565b9050919050565b61029c81610282565b82525050565b5f6020820190506102b55f830184610293565b92915050565b5f604051905090565b5f5ffd5b5f5ffd5b5f5ffd5b5f5ffd5b5f601f19601f8301169050919050565b7f4e487b71000000000000000000000000000000000000000000000000000000005f52604160045260245ffd5b61031a826102d4565b810181811067ffffffffffffffff82111715610339576103386102e4565b5b80604052505050565b5f61034b6102bb565b90506103578282610311565b919050565b5f67ffffffffffffffff821115610376576103756102e4565b5b61037f826102d4565b9050602081019050919050565b828183375f83830152505050565b5f6103ac6103a78461035c565b610342565b9050828152602081018484840111156103c8576103c76102d0565b5b6103d384828561038c565b509392505050565b5f82601f8301126103ef576103ee6102cc565b5b81356103ff84826020860161039a565b91505092915050565b5f6020828403121561041d5761041c6102c4565b5b5f82013567ffffffffffffffff81111561043a576104396102c8565b5b610446848285016103db565b91505092915050565b5f81519050919050565b5f82825260208201905092915050565b8281835e5f83830152505050565b5f6104818261044f565b61048b8185610459565b935061049b818560208601610469565b6104a4816102d4565b840191505092915050565b5f6020820190508181035f8301526104c78184610477565b905092915050565b7f4e487b71000000000000000000000000000000000000000000000000000000005f52602260045260245ffd5b5f600282049050600182168061051357607f821691505b602082108103610526576105256104cf565b5b50919050565b5f819050815f5260205f209050919050565b5f6020601f8301049050919050565b5f82821b905092915050565b5f600883026105887fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff8261054d565b610592868361054d565b95508019841693508086168417925050509392505050565b5f819050919050565b5f819050919050565b5f6105d66105d16105cc846105aa565b6105b3565b6105aa565b9050919050565b5f819050919050565b6105ef836105bc565b6106036105fb826105dd565b848454610559565b825550505050565b5f5f905090565b61061a61060b565b6106258184846105e6565b505050565b5f5b8281101561064b576106405f828401610612565b60018101905061062c565b505050565b601f82111561069e578282111561069d5761066a8161052c565b6106738361053e565b61067c8561053e565b6020861015610689575f90505b8083016106988284038261062a565b505050505b5b505050565b5f82821c905092915050565b5f6106be5f19846008026106a3565b1980831691505092915050565b5f6106d683836106af565b9150826002028217905092915050565b6106ef8261044f565b67ffffffffffffffff811115610708576107076102e4565b5b61071282546104fc565b61071d828285610650565b5f60209050601f83116001811461074e575f841561073c578287015190505b61074685826106cb565b8655506107ad565b601f19841661075c8661052c565b5f5b828110156107835784890151825560018201915060208501945060208101905061075e565b868310156107a0578489015161079c601f8916826106af565b8355505b6001600288020188555050505b50505050505056fea26469706673582212200dcee079f8c9d80fef96190aa4274a9e2b708c67a78ef2c2769e94717a7db48264736f6c63430008230033';

interface ContractState {
  isDeploying: boolean;
  isCheckingIn: boolean;
  deployedAddress: string | null;
  txHash: string | null;
  error: string | null;
  checkInStatus: {
    hasSigned: boolean;
    signedAt: number;
    totalSignatures: number;
  } | null;
}

export function useContract() {
  const [state, setState] = useState<ContractState>({
    isDeploying: false,
    isCheckingIn: false,
    deployedAddress: null,
    txHash: null,
    error: null,
    checkInStatus: null,
  });

  const { writeContractAsync } = useWriteContract();

  // 部署 Greeting 合约
  const deployGreetingContract = useCallback(async () => {
    setState(prev => ({ ...prev, isDeploying: true, error: null }));

    try {
      const hash = await writeContractAsync({
        abi: GREETING_ABI,
        bytecode: GREETING_BYTECODE as `0x${string}`,
        args: [],
      });

      setState(prev => ({
        ...prev,
        txHash: hash,
        isDeploying: false,
      }));

      return hash;
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        isDeploying: false,
        error: error.message || 'Deployment failed',
      }));
      throw error;
    }
  }, [writeContractAsync]);

  // 执行签到（调用 sign()）
  const checkIn = useCallback(async () => {
    setState(prev => ({ ...prev, isCheckingIn: true, error: null }));

    try {
      console.log('开始签到...');
      console.log('合约地址:', CHECKIN_CONTRACT_ADDRESS);

      const hash = await writeContractAsync({
        address: CHECKIN_CONTRACT_ADDRESS as `0x${string}`,
        abi: CHECKIN_ABI,
        functionName: 'sign',
      });

      console.log('交易哈希:', hash);

      setState(prev => ({
        ...prev,
        txHash: hash,
        isCheckingIn: false,
      }));

      return hash;
    } catch (error: any) {
      console.error('签到错误:', error);
      setState(prev => ({
        ...prev,
        isCheckingIn: false,
        error: error.message || 'Check-in failed',
      }));
      throw error;
    }
  }, [writeContractAsync]);

  // 查询签到状态
  const getCheckInStatus = useCallback(async (address: string) => {
    // 这个函数需要在组件外部调用，所以我们返回一个对象
    // 实际的状态查询会在组件内使用 useReadContract
    return null;
  }, []);

  // 清除错误
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  return {
    ...state,
    deployGreetingContract,
    checkIn,
    getCheckInStatus,
    clearError,
  };
}

// 查询签到状态的 hook
export function useCheckInStatus(address: `0x${string}` | undefined) {
  const { data: hasSigned, refetch: refetchHasSigned } = useReadContract({
    address: CHECKIN_CONTRACT_ADDRESS,
    abi: CHECKIN_ABI,
    functionName: 'hasSigned',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  });

  const { data: signedAt } = useReadContract({
    address: CHECKIN_CONTRACT_ADDRESS,
    abi: CHECKIN_ABI,
    functionName: 'signedAt',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  });

  const { data: totalSignatures, refetch: refetchTotal } = useReadContract({
    address: CHECKIN_CONTRACT_ADDRESS,
    abi: CHECKIN_ABI,
    functionName: 'totalSignatures',
    query: {
      enabled: !!address,
    },
  });

  return {
    hasSigned: hasSigned ?? false,
    signedAt: signedAt ? Number(signedAt) : 0,
    totalSignatures: totalSignatures ? Number(totalSignatures) : 0,
    refetch: () => {
      refetchHasSigned();
      refetchTotal();
    },
  };
}
