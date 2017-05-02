package main

import (
	"encoding/json"

	"github.com/hyperledger/fabric/core/chaincode/shim"
	pb "github.com/hyperledger/fabric/protos/peer"
	"time"
)

func createContract(stub shim.ChaincodeStubInterface, args []string) pb.Response {
	if len(args) != 1 {
		return shim.Error("Invalid argument count.")
	}

	type contractDTO struct {
		UUID             string    `json:"uuid"`
		ContractTypeUUID string    `json:"contract_type_uuid"`
		Username         string    `json:"username"`
		Password         string    `json:"password"`
		FirstName        string    `json:"first_name"`
		LastName         string    `json:"last_name"`
		Item             item      `json:"item"`
		StartDate        time.Time `json:"start_date"`
		EndDate          time.Time `json:"end_date"`
	}

	var u user
	dto := contractDTO{}

	err := json.Unmarshal([]byte(args[0]), &dto)
	if err != nil {
		return shim.Error(err.Error())
	}

	// Create new user if necessary
	requestUserCreate := len(dto.Username) > 0 && len(dto.Password) > 0
	userKey, err := stub.CreateCompositeKey(prefixUser, []string{dto.Username})
	if requestUserCreate {
		// Check if a user with the same username exists
		if err != nil {
			return shim.Error(err.Error())
		}
		userAsBytes, _ := stub.GetState(userKey)
		if userAsBytes == nil {
			u = user{
				Username:  dto.Username,
				Password:  dto.Password,
				FirstName: dto.FirstName,
				LastName:  dto.LastName,
			}
		} else {
			err := json.Unmarshal(userAsBytes, &u)
			if err != nil {
				return shim.Error(err.Error())
			}
		}
	} else {
		// Validate if the user exists
		userAsBytes, _ := stub.GetState(userKey)
		if userAsBytes == nil {
			return shim.Error("User with this username does not exist!")
		}
	}

	contract := contract{
		Username:         dto.Username,
		ContractTypeUUID: dto.ContractTypeUUID,
		Item:             dto.Item,
		StartDate:        dto.StartDate,
		EndDate:          dto.EndDate,
		Void:             false,
		ClaimIndex:       []string{},
	}

	contractAsBytes, err := json.Marshal(contract)
	if err != nil {
		return shim.Error(err.Error())
	}
	contractKey, err := stub.CreateCompositeKey(prefixContract, []string{dto.Username, dto.UUID})
	if err != nil {
		return shim.Error(err.Error())
	}
	err = stub.PutState(contractKey, contractAsBytes)
	if err != nil {
		return shim.Error(err.Error())
	}

	// Return success, if the new user has been created
	// (the user variable should be blank)
	if !requestUserCreate {
		return shim.Success(nil)
	}

	response := struct {
		Username string `json:"username"`
		Password string `json:"password"`
	}{
		u.Username,
		u.Password,
	}
	responseAsBytes, err := json.Marshal(response)
	if err != nil {
		return shim.Error(err.Error())
	}
	return shim.Success(responseAsBytes)
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
