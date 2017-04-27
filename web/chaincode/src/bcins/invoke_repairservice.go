package main

import "github.com/hyperledger/fabric/core/chaincode/shim"
import pb "github.com/hyperledger/fabric/protos/peer"

func listRepairOrders(stub shim.ChaincodeStubInterface, args []string) pb.Response {
	//TODO: listRepairOrders
	return shim.Success(nil)
}

func completeRepairOrder(stub shim.ChaincodeStubInterface, args []string) pb.Response {
	//TODO: completeRepairOrder
	return shim.Success(nil)
}
