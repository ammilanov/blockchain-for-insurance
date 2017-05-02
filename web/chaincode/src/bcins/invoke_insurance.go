package main

import (
	"encoding/json"

	"strings"

	"github.com/hyperledger/fabric/core/chaincode/shim"
	pb "github.com/hyperledger/fabric/protos/peer"
)

func listContractTypes(stub shim.ChaincodeStubInterface, args []string) pb.Response {
	var shopType string
	callingAsMerchant := false
	if len(args) > 0 {
		shopType = args[0]
		callingAsMerchant = true
	}

	type contractTypeDTO struct {
		UUID string `json:"uuid"`
		*contractType
	}

	resultsIterator, err := stub.GetStateByPartialCompositeKey(prefixContractType, []string{})
	if err != nil {
		return shim.Error(err.Error())
	}

	defer resultsIterator.Close()

	results := []contractTypeDTO{}
	for resultsIterator.HasNext() {
		key, value, err := resultsIterator.Next()
		if err != nil {
			return shim.Error(err.Error())
		}

		ct := contractTypeDTO{}
		err = json.Unmarshal(value, &ct)
		if err != nil {
			return shim.Error(err.Error())
		}
		ct.UUID = key

		// Apply proper filtering, merchants should only see active contracts
		if !callingAsMerchant || (strings.Contains(ct.ShopType, shopType) && ct.Active) {
			results = append(results, ct)
		}
	}

	returnBytes, err := json.Marshal(results)
	return shim.Success(returnBytes)
}

func createContractType(stub shim.ChaincodeStubInterface, args []string) pb.Response {
	if len(args) != 1 {
		return shim.Error("Invalid argument count.")
	}

	type contractTypePartial struct {
		UUID string `json:"uuid"`
	}

	partial := &contractTypePartial{}
	ct := &contractType{}

	err := json.Unmarshal([]byte(args[0]), partial)
	if err != nil {
		return shim.Error(err.Error())
	}

	err = json.Unmarshal([]byte(args[0]), ct)
	if err != nil {
		return shim.Error(err.Error())
	}

	key, err := stub.CreateCompositeKey(prefixContractType, []string{partial.UUID})
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
	if len(args) != 1 {
		return shim.Error("Invalid argument count.")
	}

	type activationRequest struct {
		UUID   string `json:"uuid"`
		Active bool   `json:"active"`
	}

	req := activationRequest{}
	ct := contractType{}

	err := json.Unmarshal([]byte(args[0]), req)
	if err != nil {
		return shim.Error(err.Error())
	}

	searchKey, err := stub.CreateCompositeKey(prefixContractType, []string{req.UUID})
	if err != nil {
		return shim.Error(err.Error())
	}

	valAsBytes, err := stub.GetState(searchKey)
	if err != nil {
		return shim.Error(err.Error())
	}

	err = json.Unmarshal(valAsBytes, &ct)
	if err != nil {
		return shim.Error(err.Error())
	}

	ct.Active = req.Active

	valAsBytes, err = json.Marshal(ct)
	if err != nil {
		return shim.Error(err.Error())
	}
	err = stub.PutState(req.UUID, valAsBytes)
	if err != nil {
		return shim.Error(err.Error())
	}

	return shim.Success(nil)
}

func listContracts(stub shim.ChaincodeStubInterface, args []string) pb.Response {

	return shim.Success(nil)
}

func listClaims(stub shim.ChaincodeStubInterface, args []string) pb.Response {
	c := &contract{}

	contractAsBytes, err := stub.GetState(args[0])
	if err != nil {
		res := "Failed to get state for " + args[0]
		return shim.Error(res)
	} else if contractAsBytes == nil {
		res := "Contract does not exist: " + args[0]
		return shim.Error(res)
	}

	// parse contract
	json.Unmarshal(contractAsBytes, &c)

	claims := c.Claims(stub)

	if claims == nil {
		res := "Failed to get claims for " + args[0]
		return shim.Error(res)
	}

	claimsAsBytes, errCt := json.Marshal(claims)
	if errCt != nil {
		return shim.Error(errCt.Error())
	}

	return shim.Success(claimsAsBytes)
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
