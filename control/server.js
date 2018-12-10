var express = require('express');
var itemDB = require('../model/ItemDB.js');
var userDB = require('../model/UserDB.js');
var session = require('express-session');
var mongoose = require('mongoose');
var itemsModel = require('../model/Item.js');
var bodyParser = require("body-parser");

mongoose.connect('mongodb://localhost/gacdb');

var itemSchema = new mongoose.Schema({
    itemCode: {type: String, required: true},
    itemName: {type: String, required:true},
    catalogCategory: {type: String, required:true},
    description: {type: String, required:true},
    rating : Number,
    imageURL: String,
    UserRating: Number,
    Status: String,
    UserID:Number,
    Initiated: 0
    });

var offerSchema = new mongoose.Schema({
    UserID: {type: Number, required: true},
    SwapUserID: {type: Number, required:true},
    itemCode: {type: String, required:true},
    SwapItemCode: {type: String, required:true}
    });

var swapSchema = new mongoose.Schema({
    UserID: {type: Number, required: true},
    SwapUserID: {type: Number, required:true},
    itemCode: {type: String, required:true},
    SwapItemCode: {type: String, required:true}
    });

var userSchema = new mongoose.Schema({  
    _id: {type:Number, required:true},
    Password: {type:String, require:true},
    FirstName: {type: String, required:true},
    LastName: {type: String, required:true},
    EmailAddress: {type: String, required:true},
    Address1:String,
    Address2:String,
    City: String,
    State: String,
    PostCode: String,
    Country: String
    });

var itemsDB = mongoose.model('items', itemSchema);
var swapsDB = mongoose.model('swaps', swapSchema);
var offersDB = mongoose.model('offers', offerSchema);
var usersDB = mongoose.model('users', userSchema);

exports.itemsDB = itemsDB;
exports.swapsDB = swapsDB;
exports.offersDB = offersDB;
exports.usersDB = usersDB;

var profileController = require('./ProfileController');

var app = express();

// set the view engine to ejs
app.set('view engine', 'ejs');
app.set('views', '../view');

app.use(express.static(__dirname + '/../public'));

app.use(session({
    secret: 'key',
    saveUninitialized: false,
    resave: false
}));

app.use(bodyParser.urlencoded({
    extended: true
}));



app.use(profileController);

// index page 
app.get(['/','/index'], function(req, res) {
    if(req.session.theUser != undefined){
        userDB.getUserName(usersDB, req.session.theUser, function(userResult){
            res.render('pages/index',{user: userResult});
        });
        //res.render('pages/index',{user: userDB.getUserName(req.session.theUser)});
    }
    else{
        res.render('pages/index',{user: undefined});
    }
    
});

// categories page 
app.get('/categories', function(req, res) {
    
    if(req.query.catalogCategory == undefined){
        if(req.session.theUser != undefined){
            userDB.getUniqueCategoriesByUser(itemsDB,req.session.theUser,function(result1){
                userDB.getItemsByUser(itemsDB,req.session.theUser,function(result2){
                    userDB.getUserName(usersDB, req.session.theUser, function(userResult){
                        res.render('pages/categories', {
                            category: result1,
                            gameItems: result2,
                            user : userResult
                        });
                    });
                    // res.render('pages/categories', {
                    //     category: result1,
                    //     gameItems: result2,
                    //     user : userDB.getUserName(req.session.theUser)
                    // });
                });
            });
        }
        else{
            itemDB.getUniqueCategories(itemsDB, function(result1){
                itemDB.getItemsFromDB(itemsDB, function(result2){
                    res.render('pages/categories', {
                        category: result1,
                        gameItems: result2,
                        user : undefined
                    });
                });
            });
        }
        
    }else if(req.query.catalogCategory != undefined ){
        if(req.session.theUser != undefined){
           userDB.getUniqueCategoriesByUserCategory(itemsDB,req.session.theUser,req.query.catalogCategory,function(result1){
               if((result1.length > 0) && result1 != undefined){
                userDB.getItemsByUserCategory(itemsDB,req.session.theUser,req.query.catalogCategory, function(result2){
                    userDB.getUserName(usersDB, req.session.theUser, function(userResult){
                        res.render('pages/categories', {
                            category: result1,
                            gameItems: result2,
                            user : userResult
                        });
                    });
                    // res.render('pages/categories', {
                    //     category: result1,
                    //     gameItems: result2,
                    //     user : userDB.getUserName(req.session.theUser)
                    // });
                });
               }else{
                itemDB.getUniqueCategories(itemsDB, function(result1){
                    itemDB.getItemsFromDB(itemsDB, function(result2){
                        userDB.getUserName(usersDB, req.session.theUser, function(userResult){
                            res.render('pages/categories', {
                                category: result1,
                                gameItems: result2,
                                user : userResult
                            });
                        });
                        // res.render('pages/categories', {
                        //     category: result1,
                        //     gameItems: result2,
                        //     user : userDB.getUserName(req.session.theUser)
                        // });
                    });
                });
               }
           });
        }
        else{
            itemDB.getItemByCategory(itemsDB,req.query.catalogCategory, function(result1){
                if((result1.length > 0) && result1 != undefined){
                    categories = [];
                    categories.push(req.query.catalogCategory);
                    res.render('pages/categories', {
                        category: categories,
                        gameItems: result1,
                        user : undefined
                });
                }else{
                    itemDB.getUniqueCategories(itemsDB, function(result1){
                        itemDB.getItemsFromDB(itemsDB, function(result2){
                            res.render('pages/categories', {
                                category: result1,
                                gameItems: result2,
                                user : undefined
                            });
                        });
                    });
                }
            });
        }
    }
});

// item page 
app.get('/item', function(req, res) {
    if(req.query.itemCode == undefined)
    {
        if(req.session.theUser != undefined){
            itemDB.getUniqueCategories(itemsDB, function(result1){
                itemDB.getItemsFromDB(itemsDB, function(result2){
                    userDB.getUserName(usersDB, req.session.theUser, function(userResult){
                        res.render('pages/categories', {
                            category: result1,
                            gameItems: result2,
                            user : userResult
                        });
                    });
                    // res.render('pages/categories', {
                    //     category: result1,
                    //     gameItems: result2,
                    //     user : userDB.getUserName(req.session.theUser)
                    // });
                });
            });
        }else{
            itemDB.getUniqueCategories(itemsDB, function(result1){
                itemDB.getItemsFromDB(itemsDB, function(result2){
                    res.render('pages/categories', {
                        category: result1,
                        gameItems: result2,
                        user : undefined
                    });
                });
            });
        }
        
    }
    else {
        if(req.session.theUser != undefined){
            itemDB.getItem(itemsDB,req.query.itemCode, function(result1){
                if(result1 != undefined){
                    if(req.session.currentProfile != undefined){
                        let status=undefined;
                        if(result1.Status == 'swapped' || result1.Status == 'pending'){
                            status = "unknown";
                        }
                        for(let i = 0; i < req.session.currentProfile.UserItems.length; i++){
                            if(req.session.currentProfile.UserItems[i].SwapItem!=undefined){
                                if(req.session.currentProfile.UserItems[i].SwapItem.itemCode == req.query.itemCode){
                                    status = req.session.currentProfile.UserItems[i].Status;
                                }else if(req.session.currentProfile.UserItems[i].Item.itemCode == req.query.itemCode){
                                    status = "unknown";
                                }
                            }
                        }
                        userDB.getUserName(usersDB, req.session.theUser, function(userResult){
                            res.render('pages/item',{
                                available: true,
                                error:false,
                                status: status,
                                gameItem: result1,
                                user : userResult
                            });
                        });
                    }else{
                        userDB.getUserName(usersDB, req.session.theUser, function(userResult){
                            res.render('pages/item',{
                                available: true,
                                error:false,
                                status: undefined,
                                gameItem: result1,
                                user : userResult
                            });
                        });
                    }
                    
                }else{
                    userDB.getUserName(usersDB, req.session.theUser, function(userResult){
                        res.render('pages/item',{
                            available:false,
                            user : userResult
                        });
                    });
                    // res.render('pages/item',{
                    //     available:false,
                    //     user : userDB.getUserName(req.session.theUser)
                    // });
                }
            });
        }else{
            itemDB.getItem(itemsDB, req.query.itemCode, function(result1){
                if(result1 != undefined){
                    res.render('pages/item',{
                                    available: true,
                                    error:false,
                                    status: 'unknown',
                                    gameItem: result1,
                                    user : undefined
                                });
                }else{
                    res.render('pages/item',{
                        available:false,
                        user : undefined
                    });
                }
            });
        }
    }
    // else{
    //     if(req.session.theUser != undefined){
    //         var status=undefined;
    //         for(var i = 0; i < req.session.currentProfile.UserItems.length; i++){
    //             if(req.session.currentProfile.UserItems[i].SwapItem!=undefined){
    //                 if(req.session.currentProfile.UserItems[i].SwapItem.itemCode == req.query.itemCode){
    //                     status = req.session.currentProfile.UserItems[i].Status;
    //                 }
    //             }
    //         }
    //         res.render('pages/item',{
    //             available: true,
    //             error:false,
    //             status: status,
    //             gameItem: itemDB.getItem(itemsDB,req.query.itemCode),
    //             user : userDB.getUserName(req.session.theUser)
    //         });
    //     }
    //     else{
    //         res.render('pages/item',{
    //             available: true,
    //             error:false,
    //             status: undefined,
    //             gameItem: itemDB.getItem(req.query.itemCode),
    //             user : undefined
    //         });
    //     }
        
    // }
});

// about page 
app.get('/about', function(req, res) {
    if(req.session.theUser != undefined){
        userDB.getUserName(usersDB, req.session.theUser, function(userResult){
            res.render('pages/about',{user: userResult});
        });
        //res.render('pages/about',{user: userDB.getUserName(req.session.theUser)});
    }
    else{
        res.render('pages/about',{user: undefined});    
    }
});

// contact page 
app.get('/contact', function(req, res) {
    if(req.session.theUser != undefined){
        userDB.getUserName(usersDB, req.session.theUser, function(userResult){
            res.render('pages/contact',{user: userResult});
        });
        //res.render('pages/contact',{user: userDB.getUserName(req.session.theUser)});
    }
    else{
        res.render('pages/contact',{user: undefined});    
    }
});

// swap page 
app.get('/mySwaps', function(req, res) {
    var gameItems=[];
    if(req.session.theUser != undefined){
        if(req.session.currentProfile != undefined){
            for(var i = 0; i < req.session.currentProfile.UserItems.length; i++){
                if(req.session.currentProfile.UserItems[i].Status == 'pending'){
                    gameItems.push(req.session.currentProfile.UserItems[i]);
                }
            }
            userDB.getUserName(usersDB, req.session.theUser, function(userResult){
                res.render('pages/mySwaps', 
                {   user: userResult,
                    swapItem: gameItems
                });
            });
        }else{
            userDB.getUserName(usersDB, req.session.theUser, function(userResult){
                res.render('pages/mySwaps', 
                {   user: userResult,
                    swapItem: undefined
                });
            });
        }
        // res.render('pages/mySwaps', 
        // {   user: userDB.getUserName(req.session.theUser),
        //     swapItem: gameItems
        // });
    }
    else{
        res.render('pages/mySwaps',
        {   user: undefined,
            swapItem:undefined
        });    
    }
});

app.listen(8080);
console.log('8080 is the magic port');