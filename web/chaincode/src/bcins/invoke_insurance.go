package main

import (
	"bytes"
	"encoding/json"

	"github.com/hyperledger/fabric/core/chaincode/shim"
	pb "github.com/hyperledger/fabric/protos/peer"
	"strings"
)

func listContractTypes(stub shim.ChaincodeStubInterface, args []string) pb.Response {
	var shopType string
	if len(args) > 0 {
		shopType = args[0]
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
		if shopType == "" || strings.Contains(ct.ShopType, shopType) {
			results = append(results, ct)
		}
	}

	returnBytes, err := json.Marshal(results)
	return shim.Success(returnBytes)
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
	var err error

	type activationRequest struct {
		UUID   string `json:"uuid"`
		Active bool   `json:"active"`
	}

	req := &activationRequest{}
	ct := &contractType{}

	err = json.Unmarshal([]byte(args[0]), req)
	if err != nil {
		return shim.Error(err.Error())
	}

	valAsbytes, err := stub.GetState(req.UUID)
	if err != nil {
		res := "Failed to get state for " + req.UUID
		return shim.Error(res)
	} else if valAsbytes == nil {
		res := "ContractType does not exist: " + req.UUID
		return shim.Error(res)
	}

	err = json.Unmarshal(valAsbytes, ct)
	if err != nil {
		return shim.Error(err.Error())
	}

	ct.Active = req.Active

	contractTypeBytes, err := json.Marshal(ct)
	if err != nil {
		return shim.Error(err.Error())
	}
	err = stub.PutState(req.UUID, contractTypeBytes)
	if err != nil {
		return shim.Error(err.Error())
	}

	return shim.Success(nil)
}

func listContracts(stub shim.ChaincodeStubInterface, args []string) pb.Response {
	// buffer is a JSON array containing Results
	var buffer bytes.Buffer
	buffer.WriteString("[")
	bArrayMemberAlreadyWritten := false

	var err error

	u := &user{}

	username := args[0]
	userAsbytes, err := stub.GetState(username) //get the user from chaincode state
	if err != nil {
		res := "Failed to get state for " + username
		return shim.Error(res)
	} else if userAsbytes == nil {
		res := "ContractType does not exist: " + username
		return shim.Error(res)
	}

	err = json.Unmarshal(userAsbytes, u)
	if err != nil {
		return shim.Error(err.Error())
	}

	for _, contractUUID := range u.ContractIndex {
		c := &contract{}
		// get contract
		contractAsBytes, err := stub.GetState(contractUUID)
		if err != nil {
			res := "Failed to get state for " + contractUUID
			return shim.Error(res)
		} else if contractAsBytes == nil {
			res := "ContractType does not exist: " + contractUUID
			return shim.Error(res)
		}

		// parse contract_type
		err = json.Unmarshal(contractAsBytes, c)
		if err != nil {
			res := "Failed to decode JSON of: " + contractUUID
			return shim.Error(res)
		}
		// Use costum MarshalJSON to add uuid (key) to output
		uuidContractAsBytes, errCt := c.MarshalJSON(contractUUID)
		if errCt != nil {
			return shim.Error(errCt.Error())
		}

		// Add a comma before array members, suppress it for the first array member
		if bArrayMemberAlreadyWritten == true {
			buffer.WriteString(",")
		}

		buffer.WriteString(string(uuidContractAsBytes))
		bArrayMemberAlreadyWritten = true
	}
	buffer.WriteString("]")

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
