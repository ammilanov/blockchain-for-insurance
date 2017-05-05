'use strict';

import fetch from 'isomorphic-fetch';

export function authenticateUser(user) {
  return fetch('/self-service/api/authenticate-user', {
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
  return fetch('/self-service/api/contracts', {
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

export function fileClaim(user, contractUuid, claim) {
  return fetch('/self-service/api/file-claim', {
    method: 'POST',
    headers: new Headers({
      'Content-Type': 'application/json'
    }),
    body: JSON.stringify({ user, contractUuid, claim })
  }).then(async res => {
    let result = await res.json();
    if (result.error) {
      throw new Error("Error occurred!");
    }
    return;
  });
}
