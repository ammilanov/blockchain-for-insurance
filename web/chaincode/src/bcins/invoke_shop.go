package main

import (
	"encoding/json"

	"github.com/hyperledger/fabric/core/chaincode/shim"
	pb "github.com/hyperledger/fabric/protos/peer"
)

func createContract(stub shim.ChaincodeStubInterface, args []string) pb.Response {
	var err error

	type contractDTO struct {
		UUID string `json:"uuid"`
	}

	dto := &contractDTO{}
	c := &contract{}

	err = json.Unmarshal([]byte(args[0]), dto)
	if err != nil {
		return shim.Error(err.Error())
	}

	err = json.Unmarshal([]byte(args[0]), c)
	if err != nil {
		return shim.Error(err.Error())
	}

	key, err := stub.CreateCompositeKey(prefixContract, []string{dto.UUID})
	if err != nil {
		return shim.Error(err.Error())
	}

	value, err := json.Marshal(c)
	if err != nil {
		return shim.Error(err.Error())
	}

	err = stub.PutState(key, value)
	if err != nil {
		return shim.Error(err.Error())
	}

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
