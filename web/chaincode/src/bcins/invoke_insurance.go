package main

import "github.com/hyperledger/fabric/core/chaincode/shim"
import pb "github.com/hyperledger/fabric/protos/peer"

func listContractTypes(stub shim.ChaincodeStubInterface, args []string) pb.Response {
	//TODO: listContractType
	return shim.Success(nil)
}

func createContractType(stub shim.ChaincodeStubInterface, args []string) pb.Response {
	//TODO: createContractType

	return shim.Success(nil)
}

func setActiveContractType(stub shim.ChaincodeStubInterface, args []string) pb.Response {
	//TODO: setActiveContractType
	return shim.Success(nil)
}

func listContracts(stub shim.ChaincodeStubInterface, args []string) pb.Response {
	//TODO: listContracts
	return shim.Success(nil)
}

func listClaims(stub shim.ChaincodeStubInterface, args []string) pb.Response {
	//TODO: listClaims
	return shim.Success(nil)
}

func fileClaim(stub shim.ChaincodeStubInterface, args []string) pb.Response {
	//TODO: fileClaim
	return shim.Success(nil)
}

func processClaim(stub shim.ChaincodeStubInterface, args []string) pb.Response {
	//TODO: processClaim
	return shim.Success(nil)
}

func authUser(stub shim.ChaincodeStubInterface, args []string) pb.Response {
	//TODO: authUser
	return shim.Success(nil)
}

func getUser(stub shim.ChaincodeStubInterface, args []string) pb.Response {
	//TODO: getUser
	return shim.Success(nil)
}
