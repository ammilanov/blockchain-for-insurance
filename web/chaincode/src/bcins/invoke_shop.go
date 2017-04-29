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
	u := &user{}

	// Extract UUID for contract
	err = json.Unmarshal([]byte(args[0]), dto)
	if err != nil {
		return shim.Error(err.Error())
	}

	// Extract contract
	err = json.Unmarshal([]byte(args[0]), c)
	if err != nil {
		return shim.Error(err.Error())
	}

	// Update User with new Contract
	readUserAsbytes, err := stub.GetState(c.Username)
	if err != nil {
		res := "Failed to get state for " + c.Username
		return shim.Error(res)
	} else if readUserAsbytes == nil {
		res := "User does not exist: " + c.Username
		return shim.Error(res)
	}
	err = json.Unmarshal(readUserAsbytes, u)
	if err != nil {
		return shim.Error(err.Error())
	}
	u.ContractIndex = append(u.ContractIndex, dto.UUID)
	writeUserAsBytes, err := json.Marshal(u)
	if err != nil {
		return shim.Error(err.Error())
	}
	err = stub.PutState(u.Username, writeUserAsBytes)
	if err != nil {
		return shim.Error(err.Error())
	}

	// Write contract to State
	key, err := stub.CreateCompositeKey(prefixContract, []string{dto.UUID})
	if err != nil {
		return shim.Error(err.Error())
	}
	contractAsBytes, err := json.Marshal(c)
	if err != nil {
		return shim.Error(err.Error())
	}
	err = stub.PutState(key, contractAsBytes)
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
