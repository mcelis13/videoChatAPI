"use strict"

const Conversation = require('../models/conversation'),
      Message = require('../models/message'),
      User = require('../models/user'),
      jwt_decode = require('jwt-decode');


//creating the function that deals with getting the user conversation/messages
exports.getConversations = function(req, res, next){
    //Only return one conversation at a time to view
    Conversation.findOne({participants: req.user._id})
      .select('_id')
      .exec(function(err, conversations){
        if(err){
          res.send({error: err});
          return next(err);
        }
      })

//incase you get your conversations and it turns out there are not conversations
//for this user
      if(conversations.length===0) {
        return res.status(200).json({ message: "No conversations yet" });
      }

    //Set up an empty array to hold convesations + more recent Messages
    let fullConversations = [];
    conversations.forEach(function(conversation){
      Message.find({'conversationId': conversation._id})
        .sort('-createdAt')
        .limit(1)
        .populate({
          path: 'author',
          select: 'profile.firstName profile.lastName'
        })
        .exec(function(err, message){
          if(err){
            res.send({error: err});
            return next(err);
          }
          fullConversations.push(message);
          if(fullConversations.length === conversations.length){
            return res.status(200).json({ conversations: fullConversations});
          }
        });
    });
}

exports.getConversation = function(req, res, next){
  Message.find({conversationId: req.params.conversationId})
    .select('createdAt body author')
    .sort('-createdAt')
    .populate({
      path: 'author',
      select: 'profile.firstName profile.lastName'
    })
    .exec(function(err, messages){

      if(err){
        res.send({error: err})
        return next(err);
      }

      res.status(200).json({conversation: messages});
    })
}

exports.newConversation = function(req, res, next){
  if(!req.params.recipientId) {
    res.status(422).send({error: "Please choose a valid recipient."});
    return next();
  }
  if(!req.body.composedMessage){
    res.status(422).send({ error: 'Please enter a message.'});
    return next();
  }

  let user = jwt_decode(req.headers.authorization)
  const conversation = new Conversation({
    participants: [user._id, req.params.recipientId]
  });

  conversation.save(function(err, newConversation){
    if(err){
      res.send({error: err});
      return next(err);
    }

    const message = new Message({
      conversationId: newConversation._id,
      body: req.body.composedMessage,
      author: user._id
    });

    message.save(function(err, newMessage){
      if(err){
        res.send({error: err});
        return next(err);
      }

      res.status(200).json({message: 'Conversation started!', conversationId: conversation._id});
      return next();
    });

  });
};

exports.sendReply = function(req, res, next){
  const reply = new Message({
    conversationId: req.params.conversationId,
    body: req.body.composedMessage,
    author: req.user_id
  });

  reply.save(function(err, sentReply){
    if(err){
      res.send({error: err})
      return next(err);
    }

    res.status(200).json({message: 'Reply successfully sent!'});
    return(next);
  });
}
