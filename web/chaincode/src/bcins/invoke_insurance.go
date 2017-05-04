package main

import (
	"encoding/json"

	"strings"

	"time"

	"github.com/hyperledger/fabric/core/chaincode/shim"
	pb "github.com/hyperledger/fabric/protos/peer"
)

func listContractTypes(stub shim.ChaincodeStubInterface, args []string) pb.Response {
	callingAsMerchant := len(args) == 1
	input := struct {
		ShopType string `json:"shop_type"`
	}{}
	if callingAsMerchant {
		err := json.Unmarshal([]byte(args[0]), &input)
		if err != nil {
			return shim.Error(err.Error())
		}
	}

	resultsIterator, err := stub.GetStateByPartialCompositeKey(prefixContractType, []string{})
	if err != nil {
		return shim.Error(err.Error())
	}
	defer resultsIterator.Close()

	results := []interface{}{}
	for resultsIterator.HasNext() {
		key, value, err := resultsIterator.Next()
		if err != nil {
			return shim.Error(err.Error())
		}

		ct := struct {
			UUID string `json:"uuid"`
			*contractType
		}{}
		err = json.Unmarshal(value, &ct)
		if err != nil {
			return shim.Error(err.Error())
		}
		prefix, keyParts, err := stub.SplitCompositeKey(key)
		if err != nil {
			return shim.Error(err.Error())
		}
		if len(keyParts) > 0 {
			ct.UUID = keyParts[0]
		} else {
			ct.UUID = prefix
		}

		// Apply proper filtering, merchants should only see active contracts
		if !callingAsMerchant ||
			(strings.Contains(strings.ToTitle(ct.ShopType), strings.ToTitle(input.ShopType)) && ct.Active) {
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

	partial := struct {
		UUID string `json:"uuid"`
	}{}
	ct := contractType{}

	err := json.Unmarshal([]byte(args[0]), &partial)
	if err != nil {
		return shim.Error(err.Error())
	}

	err = json.Unmarshal([]byte(args[0]), &ct)
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

	req := struct {
		UUID   string `json:"uuid"`
		Active bool   `json:"active"`
	}{}
	ct := contractType{}

	err := json.Unmarshal([]byte(args[0]), &req)
	if err != nil {
		return shim.Error(err.Error())
	}

	key, err := stub.CreateCompositeKey(prefixContractType, []string{req.UUID})
	if err != nil {
		return shim.Error(err.Error())
	}

	valAsBytes, err := stub.GetState(key)
	if err != nil {
		return shim.Error(err.Error())
	}
	if len(valAsBytes) == 0 {
		return shim.Error("Contract Type coould not be found")
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

	err = stub.PutState(key, valAsBytes)
	if err != nil {
		return shim.Error(err.Error())
	}

	return shim.Success(nil)
}

func listContracts(stub shim.ChaincodeStubInterface, args []string) pb.Response {
	input := struct {
		Username string `json:"username"`
	}{}
	if len(args) == 1 {
		err := json.Unmarshal([]byte(args[0]), &input)
		if err != nil {
			return shim.Error(err.Error())
		}
	}
	filterByUsername := len(input.Username) > 0

	var resultsIterator shim.StateQueryIteratorInterface
	var err error
	// Filtering by username if required
	if filterByUsername {
		resultsIterator, err = stub.GetStateByPartialCompositeKey(prefixContract, []string{input.Username})
	} else {
		resultsIterator, err = stub.GetStateByPartialCompositeKey(prefixContract, []string{})
	}
	if err != nil {
		return shim.Error(err.Error())
	}
	defer resultsIterator.Close()

	results := []interface{}{}
	// Iterate over the results
	for resultsIterator.HasNext() {
		key, value, err := resultsIterator.Next()
		if err != nil {
			return shim.Error(err.Error())
		}

		// Construct response struct
		result := struct {
			UUID string `json:"uuid"`
			*contract
			Claims []claim `json:"claims,omitempty"`
		}{}

		err = json.Unmarshal(value, &result)
		if err != nil {
			return shim.Error(err.Error())
		}

		// Fetch key
		prefix, keyParts, err := stub.SplitCompositeKey(key)
		if len(keyParts) == 2 {
			result.UUID = keyParts[1]
		} else {
			result.UUID = prefix
		}

		// Fetch the claims, if the the username parameter is specified
		if len(input.Username) > 0 {
			result.Claims, err = result.contract.Claims(stub)
			if err != nil {
				return shim.Error(err.Error())
			}
		}
		results = append(results, result)
	}

	resultsAsBytes, err := json.Marshal(results)
	if err != nil {
		return shim.Error(err.Error())
	}
	return shim.Success(resultsAsBytes)
}

func listClaims(stub shim.ChaincodeStubInterface, args []string) pb.Response {
	var status string
	if len(args) > 0 {
		input := struct {
			Status string `json:"status"`
		}{}
		err := json.Unmarshal([]byte(args[0]), &input)
		if err != nil {
			return shim.Error(err.Error())
		}
		status = input.Status
	}

	results := []interface{}{}
	resultsIterator, err := stub.GetStateByPartialCompositeKey(prefixClaim, []string{})
	if err != nil {
		return shim.Error(err.Error())
	}
	defer resultsIterator.Close()

	for resultsIterator.HasNext() {
		key, value, err := resultsIterator.Next()
		if err != nil {
			return shim.Error(err.Error())
		}

		result := struct {
			UUID string `json:"uuid"`
			*claim
		}{}
		err = json.Unmarshal(value, &result)
		if err != nil {
			return shim.Error(err.Error())
		}

		if len(status) > 0 && !strings.Contains(result.Status, status) {
			continue // Skip the processing of the result, if the status does not equal the query status
		}

		// Fetch key
		prefix, keyParts, err := stub.SplitCompositeKey(key)
		if len(keyParts) < 2 {
			result.UUID = prefix
		} else {
			result.UUID = keyParts[1]
		}

		results = append(results, result)
	}

	claimsAsBytes, err := json.Marshal(results)
	if err != nil {
		return shim.Error(err.Error())
	}
	return shim.Success(claimsAsBytes)
}

func fileClaim(stub shim.ChaincodeStubInterface, args []string) pb.Response {
	if len(args) != 1 {
		return shim.Error("Invalid argument count.")
	}

	claimDTO := struct {
		UUID         string    `json:"uuid"`
		ContractUUID string    `json:"contract_uuid"`
		Date         time.Time `json:"date"`
		Description  string    `json:"description"`
		IsTheft      bool      `json:"is_theft"`
	}{}
	err := json.Unmarshal([]byte(args[0]), &claimDTO)
	if err != nil {
		return shim.Error(err.Error())
	}

	contractKey, err := stub.CreateCompositeKey(prefixContract, []string{claimDTO.ContractUUID})
	if err != nil {
		return shim.Error(err.Error())
	}
	contractBytes, _ := stub.GetState(contractKey)
	if contractBytes == nil {
		return shim.Error("Contract could not be found.")
	}

	claim := claim{
		ContractUUID: claimDTO.ContractUUID,
		Date:         claimDTO.Date,
		Description:  claimDTO.Description,
		IsTheft:      claimDTO.IsTheft,
		Status:       "N", // N - new claim
	}
	claimKey, err := stub.CreateCompositeKey(prefixClaim,
		[]string{claimDTO.ContractUUID, claimDTO.UUID})
	if err != nil {
		return shim.Error(err.Error())
	}
	claimBytes, err := json.Marshal(claim)
	if err != nil {
		return shim.Error(err.Error())
	}

	err = stub.PutState(claimKey, claimBytes)
	if err != nil {
		return shim.Error(err.Error())
	}

	// Update the claim index in the contract
	contract := contract{}
	err = json.Unmarshal(contractBytes, &contract)
	if err != nil {
		return shim.Error(err.Error())
	}
	contract.ClaimIndex = append(contract.ClaimIndex, claimKey)
	contractBytes, err = json.Marshal(contract)
	if err != nil {
		return shim.Error(err.Error())
	}

	return shim.Success(nil)
}

func processClaim(stub shim.ChaincodeStubInterface, args []string) pb.Response {
	if len(args) != 1 {
		return shim.Error("Invalid argument count.")
	}

	input := struct {
		UUID         string  `json:"uuid"`
		ContractUUID string  `json:"contract_uuid"`
		Status       string  `json:"status"`
		Refundable   float32 `json:"refundable"`
	}{}
	err := json.Unmarshal([]byte(args[0]), &input)
	if err != nil {
		return shim.Error(err.Error())
	}

	claimKey, err := stub.CreateCompositeKey(prefixClaim, []string{input.ContractUUID, input.UUID})
	if err != nil {
		return shim.Error(err.Error())
	}

	claimBytes, _ := stub.GetState(claimKey)
	if len(claimBytes) == 0 {
		return shim.Error("Claim cannot be found.")
	}

	claim := claim{}
	err = json.Unmarshal(claimBytes, &claim)
	if err != nil {
		return shim.Error(err.Error())
	}

	if claim.Status != "N" {
		return shim.Error("Cannot change a status of a non-new claim.")
	}

	claim.Status = input.Status
	switch input.Status {
	case "R":
		// Approve and create a repair order
		if claim.IsTheft {
			return shim.Error("Invalid status selected.")
		}
		claim.Refundable = 0

		contract, err := claim.Contract(stub)
		if err != nil {
			return shim.Error(err.Error())
		}
		// Create new repair order
		repairOrder := repairOrder{
			Item:         contract.Item,
			ClaimUUID:    input.UUID,
			ContractUUID: input.ContractUUID,
			Ready:        false,
		}
		repairOrderKey, err := stub.CreateCompositeKey(prefixRepairOrder, []string{input.UUID})
		if err != nil {
			return shim.Error(err.Error())
		}
		repairOrderBytes, err := json.Marshal(repairOrder)
		if err != nil {
			return shim.Error(err.Error())
		}
		err = stub.PutState(repairOrderKey, repairOrderBytes)
		if err != nil {
			return shim.Error(err.Error())
		}
	case "F":
		// Approve as refundable, and provide the sum of the refund
		claim.Refundable = input.Refundable
		// If theft was involved, mark the contract as void
		if claim.IsTheft {
			contract, err := claim.Contract(stub)
			if err != nil {
				return shim.Error(err.Error())
			}
			contract.Void = true
			// Persist contract
			contractKey, err := stub.CreateCompositeKey(
				prefixContract,
				[]string{contract.Username, claim.ContractUUID})
			if err != nil {
				return shim.Error(err.Error())
			}
			contractAsBytes, err := json.Marshal(contract)
			if err != nil {
				return shim.Error(err.Error())
			}
			err = stub.PutState(contractKey, contractAsBytes)
			if err != nil {
				return shim.Error(err.Error())
			}
		}

	case "J":
		// Mark as rejected
		claim.Refundable = 0
	}

	// Persist claim
	claimBytes, err = json.Marshal(claim)
	if err != nil {
		return shim.Error(err.Error())
	}
	err = stub.PutState(claimKey, claimBytes)
	if err != nil {
		return shim.Error(err.Error())
	}

	return shim.Success(nil)
}

func authUser(stub shim.ChaincodeStubInterface, args []string) pb.Response {
	if len(args) != 1 {
		return shim.Error("Invalid argument count.")
	}

	input := struct {
		Username string `json:"username"`
		Password string `json:"password"`
	}{}

	authenticated := false

	err := json.Unmarshal([]byte(args[0]), &input)
	if err != nil {
		return shim.Error(err.Error())
	}

	userKey, err := stub.CreateCompositeKey(prefixUser, []string{input.Username})
	if err != nil {
		return shim.Error(err.Error())
	}
	userBytes, _ := stub.GetState(userKey)
	if len(userBytes) == 0 {
		authenticated = false
	} else {
		user := user{}
		err := json.Unmarshal(userBytes, &user)
		if err != nil {
			return shim.Error(err.Error())
		}
		authenticated = user.Password == input.Password
	}

	authBytes, _ := json.Marshal(authenticated)
	return shim.Success(authBytes)
}

func getUser(stub shim.ChaincodeStubInterface, args []string) pb.Response {
	if len(args) != 1 {
		return shim.Error("Invalid argument count.")
	}

	input := struct {
		Username string `json:"username"`
	}{}

	userKey, err := stub.CreateCompositeKey(prefixUser, []string{input.Username})
	if err != nil {
		return shim.Error(err.Error())
	}
	userBytes, _ := stub.GetState(userKey)
	if len(userBytes) == 0 {
		return shim.Success(nil)
	}

	response := struct {
		Username  string `json:"username"`
		FirstName string `json:"first_name"`
		LastName  string `json:"last_name"`
	}{}
	err = json.Unmarshal(userBytes, &response)
	if err != nil {
		return shim.Error(err.Error())
	}
	responseBytes, err := json.Marshal(response)
	if err != nil {
		return shim.Error(err.Error())
	}
	return shim.Success(responseBytes)
}
