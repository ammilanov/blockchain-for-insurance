'use strict';

import fetch from 'isomorphic-fetch';

export function authenticateUser(user) {
  return fetch('/self-service/api/authenticateUser', {
    method: 'POST',
    headers: new Headers({
      'Content-Type': 'application/json'
    }),
    body: JSON.stringify({ user })
  }).then(async res => {
    let result = await res.json();
    if (result.error) {
      throw new Error("Invalid login!");
    } else {
      return result.success;
    }
  });
}

export function getContracts(user) {
  return fetch('/self-service/api/getContracts', {
    method: 'POST',
    headers: new Headers({
      'Content-Type': 'application/json'
    }),
    body: JSON.stringify({ user })
  }).then(async res => {
    let result = await res.json();
    if (result.error) {
      throw new Error("Could not get contracts!");
    }
    return result.contracts;
  });
}

export function submitClaim(user, contractId, claim) {
  return fetch('/self-service/api/submitClaim', {
    method: 'POST',
    headers: new Headers({
      'Content-Type': 'application/json'
    }),
    body: JSON.stringify({ user, contractId, claim })
  }).then(async res => {
    let result = await res.json();
    if (result.error) {
      throw new Error("Error occurred!");
    }
    return;
  });
}