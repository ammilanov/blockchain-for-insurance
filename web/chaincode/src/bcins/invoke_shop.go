package main

import "github.com/hyperledger/fabric/core/chaincode/shim"
import pb "github.com/hyperledger/fabric/protos/peer"

func createContract(stub shim.ChaincodeStubInterface, args []string) pb.Response {
	//TODO: createContract
	return shim.Success(nil)
}

func createUser(stub shim.ChaincodeStubInterface, args []string) pb.Response {
	//TODO: createUser
	return shim.Success(nil)
}
