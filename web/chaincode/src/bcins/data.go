package main

import (
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
	Username   string    `json:"username"`
	Item       item      `json:"item"`
	StartDate  time.Time `json:"start_date"`
	EndDate    time.Time `json:"end_date"`
	ClaimIndex []string  `json:"claims"`
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

const prefixRepairOrder = "repair_order"

func (u *user) Contacts(stub shim.ChaincodeStubInterface) []contract {
	return nil
}

func (c *contract) Claims(stub shim.ChaincodeStubInterface) []claim {
	return nil
}
