package main

import (
	"encoding/json"
	"time"

	"github.com/hyperledger/fabric/core/chaincode/shim"
)

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

type contract struct {
	Username         string    `json:"username"`
	Item             item      `json:"item"`
	StartDate        time.Time `json:"start_date"`
	EndDate          time.Time `json:"end_date"`
	Void             bool      `json:"void"`
	ContractTypeUUID string    `json:"contract_type_uuid"`
	ClaimIndex       []string  `json:"claims"`
}

type item struct {
	ID          int32   `json:"id"`
	Brand       string  `json:"brand"`
	Model       string  `json:"model"`
	Price       float32 `json:"price"`
	Description string  `json:"description"`
}

type claim struct {
	ContractUUID string    `json:"contract_uuid"`
	Date         time.Time `json:"date"`
	Description  string    `json:"description"`
	IsTheft      bool      `json:"is_theft"`
	Status       string    `json:"status"`
	Refundable   float32   `json:"refundable"`
	Repaired     bool      `json:"repaired"`
}

type user struct {
	Username      string   `json:"username"`
	Password      string   `json:"password"`
	FirstName     string   `json:"first_name"`
	LastName      string   `json:"last_name"`
	ContractIndex []string `json:"contracts"`
}

type repairOrder struct {
	ClaimUUID string `json:"claim_uuid"`
	Item      item   `json:"item"`
	Ready     bool   `json:"ready"`
}

func (ct *contractType) MarshalJSON(uuid string) ([]byte, error) {
	type Alias contractType
	return json.Marshal(&struct {
		UUID string `json:"uuid"`
		*Alias
	}{
		UUID:  uuid,
		Alias: (*Alias)(ct),
	})
}

func (c *contract) MarshalJSON(uuid string) ([]byte, error) {
	type Alias contract
	return json.Marshal(&struct {
		UUID string `json:"uuid"`
		*Alias
	}{
		UUID:  uuid,
		Alias: (*Alias)(c),
	})
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

func (c *contract) Claims(stub shim.ChaincodeStubInterface) []claim {
	claims := make([]claim, 0)

	// for each claimId in consumer.Contracts
	for _, claimID := range c.ClaimIndex {

		claim := &claim{}

		// get claim
		claimAsBytes, err := stub.GetState(claimID)
		if err != nil {
			//res := "Failed to get state for " + claimID
			return nil
		}

		// parse claim
		err = json.Unmarshal(claimAsBytes, claim)
		if err != nil {
			//res := "Failed to parse claim"
			return nil
		}

		// append to the claims array
		claims = append(claims, *claim)
	}

	return claims
}
