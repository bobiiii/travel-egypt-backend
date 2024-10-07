const express = require('express');
const { messageControllers } = require('../../controllers');

const messageRoute = express.Router();

messageRoute.get('/get-messages', messageControllers.getMessages);
messageRoute.delete('/delete-message/:messageId', messageControllers.deleteMessage);

module.exports = messageRoute;
