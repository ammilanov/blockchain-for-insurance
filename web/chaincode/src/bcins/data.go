package main

import (
	"encoding/json"
	"time"

	"github.com/hyperledger/fabric/core/chaincode/shim"
)

// Key consists of prefix + UUID of the contract type
type contractType struct {
	ShopType        string  `json:"shop_type"`
	FormulaPerDay   string  `json:"formula_per_day"`
	MaxSumInsured   float32 `json:"max_sum_insured"`
	TheftInsured    bool    `json:"theft_insured"`
	Description     string  `json:"description"`
	Conditions      string  `json:"conditions"`
	Active          bool    `json:"active"`
	MinDurationDays int32   `json:"min_duration_days"`
	MaxDurationDays int32   `json:"max_duration_days"`
}

// Key consists of prefix + username + UUID of the contract
type contract struct {
	Username         string    `json:"username"`
	Item             item      `json:"item"`
	StartDate        time.Time `json:"start_date"`
	EndDate          time.Time `json:"end_date"`
	Void             bool      `json:"void"`
	ContractTypeUUID string    `json:"contract_type_uuid"`
	ClaimIndex       []string  `json:"claims"`
}

// Entity not persisted on its own
type item struct {
	ID          int32   `json:"id"`
	Brand       string  `json:"brand"`
	Model       string  `json:"model"`
	Price       float32 `json:"price"`
	Description string  `json:"description"`
}

// Key consists of prefix + UUID of the contract + UUID of the claim
type claim struct {
	ContractUUID string    `json:"contract_uuid"`
	Date         time.Time `json:"date"`
	Description  string    `json:"description"`
	IsTheft      bool      `json:"is_theft"`
	Status       string    `json:"status"`
	Refundable   float32   `json:"refundable"`
	Repaired     bool      `json:"repaired"`
}

// Key consists of prefix + username
type user struct {
	Username      string   `json:"username"`
	Password      string   `json:"password"`
	FirstName     string   `json:"first_name"`
	LastName      string   `json:"last_name"`
	ContractIndex []string `json:"contracts"`
}

// Key consists of prefix + UUID fo the repair order
type repairOrder struct {
	ClaimUUID    string `json:"claim_uuid"`
	ContractUUID string `json:"contract_uuid"`
	Item         item   `json:"item"`
	Ready        bool   `json:"ready"`
}

func (u *user) Contacts(stub shim.ChaincodeStubInterface) []contract {
	contracts := make([]contract, 0)

	// for each contractID in user.ContractIndex
	for _, contractID := range u.ContractIndex {

		c := &contract{}

		// get contract
		contractAsBytes, err := stub.GetState(contractID)
		if err != nil {
			//res := "Failed to get state for " + contractID
			return nil
		}

		// parse contract
		err = json.Unmarshal(contractAsBytes, c)
		if err != nil {
			//res := "Failed to parse contract"
			return nil
		}

		// append to the contracts array
		contracts = append(contracts, *c)
	}

	return contracts
}

func (c *contract) Claims(stub shim.ChaincodeStubInterface) ([]claim, error) {
	claims := make([]claim, 0)

	// for each claimId in consumer.Contracts
	for _, claimID := range c.ClaimIndex {

		claim := &claim{}

		// get claim
		claimAsBytes, err := stub.GetState(claimID)
		if err != nil {
			//res := "Failed to get state for " + claimID
			return nil, err
		}

		// parse claim
		err = json.Unmarshal(claimAsBytes, claim)
		if err != nil {
			//res := "Failed to parse claim"
			return nil, err
		}

		// append to the claims array
		claims = append(claims, *claim)
	}

	return claims, nil
}

func (c *claim) Contract(stub shim.ChaincodeStubInterface) (*contract, error) {
	if len(c.ContractUUID) == 0 {
		return nil, nil
	}

	resultsIterator, err := stub.GetStateByPartialCompositeKey(prefixContract, []string{})
	if err != nil {
		return nil, err
	}

	defer resultsIterator.Close()
	for resultsIterator.HasNext() {
		key, value, err := resultsIterator.Next()
		if err != nil {
			return nil, err
		}

		_, keyParams, err := stub.SplitCompositeKey(key)
		if len(keyParams) != 2 {
			continue
		}

		if keyParams[1] == c.ContractUUID {
			contract := &contract{}
			err := json.Unmarshal(value, contract)
			if err != nil {
				return nil, err
			}
			return contract, nil
		}
	}
	return nil, nil
}
