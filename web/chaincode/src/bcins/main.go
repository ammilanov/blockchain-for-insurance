package main

import (
	"fmt"

	"github.com/hyperledger/fabric/core/chaincode/shim"
	pb "github.com/hyperledger/fabric/protos/peer"
)

// SimpleChaincode example simple Chaincode implementation
type SimpleChaincode struct {
}

// Init callback representing the invocation of a chaincode
func (t *SimpleChaincode) Init(stub shim.ChaincodeStubInterface) pb.Response {
	var err error
	stub.GetFunctionAndParameters()

	return shim.Success(nil)
}

// Invoke Function accept blockchain code invocations.
func (t *SimpleChaincode) Invoke(stub shim.ChaincodeStubInterface) pb.Response {

	return shim.Error("Invalid invoke function.")
}

func main() {
	err := shim.Start(new(SimpleChaincode))
	if err != nil {
		fmt.Printf("Error starting Simple chaincode: %s", err)
	}
}
