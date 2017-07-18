'use strict';

import fetch from 'isomorphic-fetch';

export function getClaims(status) {
  return fetch('/contract-management/api/claims', {
    method: 'POST',
    headers: new Headers({
      'Content-Type': 'application/json'
    }),
    body: JSON.stringify({ status })
  }).then(async res => {
    let claims = await res.json();
    return claims;
  });
}

export function processClaim(contractUuid, uuid, status, reimbursable) {
  return fetch('/contract-management/api/process-claim', {
    method: 'POST',
    headers: new Headers({
      'Content-Type': 'application/json'
    }),
    body: JSON.stringify({ contractUuid, uuid, status, reimbursable })
  }).then(async res => {
    return await res.json();
  });
}

export function getContractTypes() {
  return fetch('/contract-management/api/contract-types', {
    method: 'POST',
    headers: new Headers({
      'Content-Type': 'application/json'
    })
  }).then(async res => {
    return await res.json();
  });
}

export function createContractType(contractType) {
  return fetch('/contract-management/api/create-contract-type', {
    method: 'POST',
    headers: new Headers({
      'Content-Type': 'application/json'
    }),
    body: JSON.stringify(contractType)
  }).then(async res => {
    const response = await res.json();
    if (response.success) {
      return response.uuid;
    } else {
      throw new Error(response.error);
    }
  });
}

export function setContractTypeActive(uuid, active) {
  return fetch('/contract-management/api/set-contract-type-active', {
    method: 'POST',
    headers: new Headers({
      'Content-Type': 'application/json'
    }),
    body: JSON.stringify({ uuid, active })
  }).then(async res => {
    return await res.json();
  });
}
