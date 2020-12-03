// import/conf expres
const express = require('express');
const router = express.Router();
router.use(express.json());

var firebase = require('firebase-admin');
// import { NextFunction, Request, Response } from 'express';

var serviceAccount = require("../course-registration-site-firebase-adminsdk-k7obh-7a2ba905b4.json");
firebase.initializeApp({
  credential: firebase.credential.cert(serviceAccount),
  databaseURL: "https://course-registration-site.firebaseio.com"
});
  


/****** Authentication ******/
const getAuthToken = (req, res, next) => {
    console.log(req.headers.authorization);
    if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
        req.authToken = req.headers.authorization.split(' ')[1];
    } else {
        req.authToken = null;
    }
    next();
};

const checkIfAuthenticated = (req, res, next) => {
  getAuthToken(req, res, async () => {
    try {
      const { authToken } = req;
      const userInfo = await (await firebase.auth().verifyIdToken(authToken)).uid;
      req.authId = userInfo.uid;
      return next();
    } catch (e) {
      return res.status(401).send({ error: 'You are not authorized to make this request' });
    }
  });
};

const checkIfAdmin = (req, res, next) => {
  getAuthToken(req, res, async () => {
    try {
      const userInfo = await firebase.auth().verifyIdToken(req.authToken);
      if (userInfo.admin === true) {
        req.authId = userInfo.uid;
        return next();
      }
    } catch (e) {
      return res.status(401).send({ error: 'You are not authorized to make this request' });
    }
  });
};

/****** Routes ******/

router.put('/users/:scheduleName', checkIfAuthenticated, (req, res) => {
    firebase.database().ref(`user/${req.authId}`).child(req.body.title).set({
        title: req.body.title,
        description: req.body.description
    })
});

module.exports = router;