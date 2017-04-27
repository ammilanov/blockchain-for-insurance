package main

import (
	"encoding/json"

	"github.com/hyperledger/fabric/core/chaincode/shim"
	pb "github.com/hyperledger/fabric/protos/peer"
)

func listContractTypes(stub shim.ChaincodeStubInterface, args []string) pb.Response {
	//TODO: listContractType
	return shim.Success(nil)
}

func createContractType(stub shim.ChaincodeStubInterface, args []string) pb.Response {
	type contractTypeDTO struct {
		UUID string `json:"uuid"`
	}
	var err error

	dto := &contractTypeDTO{}
	ct := &contractType{}

	err = json.Unmarshal([]byte(args[0]), dto)
	if err != nil {
		return shim.Error(err.Error())
	}

	err = json.Unmarshal([]byte(args[0]), ct)
	if err != nil {
		return shim.Error(err.Error())
	}

	key, err := stub.CreateCompositeKey(prefixContractType, []string{dto.UUID})
	if err != nil {
		return shim.Error(err.Error())
	}

	value, err := json.Marshal(ct)
	if err != nil {
		return shim.Error(err.Error())
	}

	err = stub.PutState(key, value)
	if err != nil {
		return shim.Error(err.Error())
	}

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
