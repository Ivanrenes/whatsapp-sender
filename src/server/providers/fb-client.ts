import axios from 'axios';

//generate http client service

const fbClient = axios.create({
  baseURL: 'https://identitytoolkit.googleapis.com/v1',
  timeout: 5000, // set the timeout value in milliseconds
  headers: {
    'Content-Type': 'application/json'
  },
  params: {
    key: `${process.env.FIREBASE_API_KEY}`
  }
});

export default fbClient;
