package main

import (
	"encoding/json"

	"github.com/hyperledger/fabric/core/chaincode/shim"
	pb "github.com/hyperledger/fabric/protos/peer"
)

func createContrau(stub shim.ChaincodeStubInterface, args []string) pb.Response {
	//TODO: createContrau
	return shim.Success(nil)
}

func createUser(stub shim.ChaincodeStubInterface, args []string) pb.Response {
	var err error

	u := &user{}

	err = json.Unmarshal([]byte(args[0]), u)
	if err != nil {
		return shim.Error(err.Error())
	}

	key, err := stub.CreateCompositeKey(prefixUser, []string{u.Username})
	if err != nil {
		return shim.Error(err.Error())
	}

	value, err := json.Marshal(u)
	if err != nil {
		return shim.Error(err.Error())
	}

	err = stub.PutState(key, value)
	if err != nil {
		return shim.Error(err.Error())
	}

	return shim.Success(nil)
}
