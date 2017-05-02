package main

import (
	"fmt"

	"github.com/hyperledger/fabric/core/chaincode/shim"
	pb "github.com/hyperledger/fabric/protos/peer"
)

const prefixContractType = "contract_type"
const prefixContract = "contract"
const prefixClaim = "claim"
const prefixUser = "user"
const prefixRepairOrder = "repair_order"

var logger = shim.NewLogger("main")

// SimpleChaincode example simple Chaincode implementation
type SimpleChaincode struct {
}

var bcFunctions = map[string]func(shim.ChaincodeStubInterface, []string) pb.Response{
	//InsurancePeer
	"contract_type_ls":         listContractTypes,
	"contract_type_create":     createContractType,
	"contract_type_set_active": setActiveContractType,
	"contract_ls":              listContracts,
	"claim_ls":                 listClaims,
	"claim_file":               fileClaim,
	"claim_process":            processClaim,
	"user_authenticate":        authUser,
	"user_get_info":            getUser,
	//ShopPeer
	"contract_create": createContract,
	"user_create":     createUser,
	//RepairService
	"repair_order_ls":       listRepairOrders,
	"repair_order_complete": completeRepairOrder,
}

// Init callback representing the invocation of a chaincode
func (t *SimpleChaincode) Init(stub shim.ChaincodeStubInterface) pb.Response {

	return shim.Success(nil)
}

// Invoke Function accept blockchain code invocations.
func (t *SimpleChaincode) Invoke(stub shim.ChaincodeStubInterface) pb.Response {

	function, args := stub.GetFunctionAndParameters()

	if function == "init" {
		return t.Init(stub)
	}
	bcFunc := bcFunctions[function]
	if bcFunc == nil {
		return shim.Error("Invalid invoke function.")
	}
	return bcFunc(stub, args)
}

func main() {
	logger.SetLevel(shim.LogInfo)

	err := shim.Start(new(SimpleChaincode))
	if err != nil {
		fmt.Printf("Error starting Simple chaincode: %s", err)
	}
}
