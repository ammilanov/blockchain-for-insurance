'use strict';

import express from 'express';

import * as ShopPeer from '../blockchain/shopPeer';

const router = express.Router();

router.get('/', (req, res) => {
  res.render('shop-main', { shopActive: true });
});

router.get('/login', (req, res) => {
  res.render('login', { shopActive: true });
});

router.post('/api/contractTypes', async (req, res) => {
  if (typeof req.body !== 'object') {
    res.json(null);
  }
  let letter;
  switch ((req.body.shopType || '').toLowerCase()) {
    case 'bikes':
      letter = 'B';
      break;
    case 'smart-phones':
      letter = 'P';
      break;
    case 'skis':
      letter = 'S';
      break;
    default:
      letter = '';
      break;
  }

  let contractTypes;
  try {
    contractTypes = await ShopPeer.getContractTypes();
  } catch (e) {
    console.log(e);
    res.json({ error: "Could not retrieve contract types!" });
  }

  if (!Array.isArray(contractTypes)) {
    res.json({ error: "Could not retrieve contract types!" });
  }
  if (letter) {
    contractTypes = contractTypes.filter(contractType => contractType.shopType.toUpperCase().includes(letter));
  }
  res.json(
    contractTypes.map(contractType => {
      let mapped = Object.assign({}, contractType);
      delete mapped.shopType;
      return mapped;
    }));
});

router.post('/api/requestUser', async (req, res) => {
  let { user } = req.body;
  let { firstName, lastName, email } = user || {};
  if (typeof user === 'object' &&
    typeof firstName === 'string' &&
    typeof lastName === 'string' &&
    typeof email === 'string') {

    try {
      let reponseUser = await ShopPeer.createUser({
        username: email,
        firstName: firstName,
        lastName: lastName,
        password: generatePassword()
      });
      res.json(reponseUser);
    } catch (e) {
      console.log(e);
      res.json({ error: 'Could not create new user!' });
    }
  } else {
    res.json({ error: 'Invalid request!' });
  }
});

router.post('/api/enterContract', async (req, res) => {
  let { user, contractId, additionalInfo } = req.body;
  if (typeof user === 'object' &&
    typeof contractId === 'string' &&
    typeof additionalInfo === 'object') {
      try {
        let { username, password } = user;
        if (await ShopPeer.authenticateUser({ username, password })) {
          await ShopPeer.enterContract(username, contractId, additionalInfo);
          res.json({ success: 'Contract signed.' });
        } else {
          res.json({ error: 'Unknown user!' });
        }
      } catch (e) {
        console.log(e);
        res.json({ error: 'Could not create new contract!' });
      }
  } else {
    res.json({ error: 'Invalid request!' });
  }
});

router.get('*', (req, res) => {
  res.render('shop', {
    shopActive: true,
    bikesActive: req.originalUrl.includes('bikes'),
    smartPhonesActive: req.originalUrl.includes('smart-phones'),
    skisActive: req.originalUrl.includes('skis')
  });
});

function generatePassword() {
  let passwordType = Math.floor(Math.random() * 4);
  let password;
  switch (passwordType) {
    case 0:
      password = 'test';
      break;
    case 1:
      password = 'demo';
      break;
    case 2:
      password = 'pass';
      break;
    case 3:
      password = 'secret';
      break;
    case 4:
    default:
      password = 'qwerty';
  }
  password += Math.floor(Math.random() * (99 - 10) + 10);
  return password;
}

export default router;
