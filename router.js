const authenticationController = require('./controllers/authentication'),
      chatController = require('./controllers/chat'),
      express = require('express'),
      passportService = require('./config/passport'),
      passport = require('passport');


//setting up our passport middleware to require login/auth
const requireAuth = passport.authenticate('jwt', {session: false});
const requireLogin = passport.authenticate('local', {session: false});


//roles types of user
const REQUIRE_ADMIN = 'Admin',
      REQUIRE_MEMBER = 'Member';


//Setting up our routes

module.exports = function(app){
  //Initializing routes for authorized users/ api
  const apiRoutes = express.Router(),
        authRoutes = express.Router(),
        chatRoutes = express.Router();


  //setting up our chat routes as a subgroup/middleware to apiRoutes
  apiRoutes.use('/chat', chatRoutes);

  //view messages to and from authentication user
  chatRoutes.get('/', chatController.getConversations);

  //Retrieve single conversation
  chatRoutes.get('/:conversationId', chatController.getConversation);

  //Send reply in conversation
  chatRoutes.post('/:conversationId', chatController.sendReply);

  //create a new conversation
  chatRoutes.post('/new/:recipientId', chatController.newConversation);

  //Set auth routes as subgroup/middleware to apiRoutes
  apiRoutes.use('/auth', authRoutes);

  //Registration route
  authRoutes.post('/register', authenticationController.register);

  //Login Route
  authRoutes.post('/login', requireLogin, authenticationController.login);

  //Set url for API group routes
  app.use('/api', apiRoutes);
}
