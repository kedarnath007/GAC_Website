var express = require('express');
var userDB = require('../model/UserDB.js');
var itemDB = require('../model/ItemDB.js');
var offerDB = require('../model/OfferDB.js');
var session = require('express-session');
var server = require('./server.js');
var expressValidator = require('express-validator');
const { sanitizeBody } = require('express-validator/filter');
var app = module.exports= express();
app.set('views', '../view');
app.use(expressValidator());

//Below code is called from the Rate button of Item page
app.get('/rating', function(req, res){
    let theUser = req.session.theUser;
    if(theUser == undefined){
        res.render('pages/login',{user:undefined, error:false});
    }else{
        if(req.query.theItem == undefined){
            itemDB.getUniqueCategories(server.itemsDB, function(result1){
                itemDB.getItemsFromDB(server.itemsDB, function(result2){
                    res.render('pages/categories', {
                        category: result1,
                        gameItems: result2,
                        user : undefined
                    });
                });
            });
        }else{
            if(req.query.itemRating != undefined && req.query.userRating != undefined){
                let itemCode = req.query.theItem;
                itemDB.updateRating(server.itemsDB, req.query.theItem, req.query.itemRating, req.query.userRating, function(result){
                    if(result){
                        itemDB.getItem(server.itemsDB,req.query.theItem, function(result1){
                            if(result1 != undefined){
                                if(req.session.currentProfile != undefined){
                                    let status=undefined;
                                    for(let i = 0; i < req.session.currentProfile.UserItems.length; i++){
                                        if(req.session.currentProfile.UserItems[i].SwapItem!=undefined){
                                            if(req.session.currentProfile.UserItems[i].SwapItem.itemCode == req.query.itemCode){
                                                status = req.session.currentProfile.UserItems[i].Status;
                                            }else if(req.session.currentProfile.UserItems[i].Item.itemCode == req.query.itemCode){
                                                status = "unknown";
                                            }
                                        }
                                    }
                                    userDB.getUserName(server.usersDB, req.session.theUser, function(userResult){
                                        res.render('pages/item',{
                                            available: true,
                                            error:false,
                                            status: status,
                                            gameItem: result1,
                                            user : userResult
                                        });
                                    });
                                }else{
                                    userDB.getUserName(server.usersDB, req.session.theUser, function(userResult){
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
                                userDB.getUserName(server.usersDB, req.session.theUser, function(userResult){
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
                        console.log('received here');
                        itemDB.getUniqueCategories(server.itemsDB, function(result1){
                            itemDB.getItemsFromDB(server.itemsDB, function(result2){
                                res.render('pages/categories', {
                                    category: result1,
                                    gameItems: result2,
                                    user : undefined
                                });
                            });
                        });
                    }
                });
            }else{
                itemDB.getItem(server.itemsDB,req.query.theItem, function(result1){
                    userDB.getUserName(server.usersDB, req.session.theUser, function(userResult){
                        res.render('pages/rating',{
                            available: true,
                            error:false,
                            status: "unknown",
                            gameItem: result1,
                            user : userResult
                        });
                    });
                });
            }
        }
    }
});

//Below code is used to render the userRegister page
app.get('/userRegister', function(req, res) {
     res.render('pages/userRegister',{user: undefined});
});

//Below code will handle the POST data submitted from the userRegister page
app.post('/userRegister',sanitizeBody('first_name').trim().escape(),sanitizeBody('last_name').trim().escape(),
sanitizeBody('email').trim().escape(),sanitizeBody('address1').trim().escape(),sanitizeBody('address2').trim().escape(),
sanitizeBody('city').trim().escape(),sanitizeBody('state').trim().escape(),sanitizeBody('country').trim().escape(),
sanitizeBody('postcode').trim().escape(),sanitizeBody('password').trim().escape(), function(req, res) {
    if(req.body == undefined){
        res.render('pages/userRegister',{user: undefined});
    }else{
        req.check('email', 'Invalid Email Address').isEmail();
        req.check('first_name', 'Please enter your name correctly').isLength({min:2});
        req.check('last_name', 'Please enter your name correctly').isLength({min:2});
        req.check('address1', 'Please enter your address correctly').isLength({min:2});
        req.check('city', 'Please enter a correct city').isLength({min:2});
        req.check('state', 'Please enter a correct state').isLength({min:2});
        req.check('country', 'Please enter the name of country correctly').isLength({min:2});
        req.check('postcode', 'Please enter a valid postcode').isNumeric();
        req.check('password', 'Password should have a minimum length of 5').isLength({ min: 5 });
        req.check('password', 'Password should be a combination of letters and numeric values').isAlphanumeric();
        req.check('password', 'Password should match').matches(req.body.password_confirmation);
        req.check('password_confirmation', 'Password should have a minimum length of 5').isLength({ min: 5 });
        req.check('password_confirmation', 'Password should be a combination of letters and numeric values').isAlphanumeric();
        req.check('password_confirmation', 'Password should match').matches(req.body.password);
        var errors = req.validationErrors();
        if(errors){
            console.log(errors);
            res.render('pages/userRegister',{user:undefined, error:errors});
        }else{
            userDB.checkEmail(server.usersDB, req.body.email, function(resultout){
                if(resultout == undefined){
                    userDB.getMaxID(server.usersDB, function(result){
                        var userInstance = userDB.createUser(result+1,req.body.first_name, req.body.last_name,req.body.email,req.body.address1,req.body.address2,
                            req.body.city,req.body.state,req.body.postcode,req.body.country);
                        
                        userDB.addUser(server.usersDB,userInstance,req.body.password,function(result){
                            if(result){
                                res.render('pages/login',{user:undefined, error:false, success:true});
                            }
                        });
                    });
                }else{
                    res.render('pages/login',{user:undefined, error:false, exists:true});
                }
            });
        }
    }
});

//Below code to handle the data when Login button is pressed.
app.post('/signIn',sanitizeBody('inputEmail').trim().escape(), function(req,res){
    if(req.body == undefined){
        res.render('pages/login',{user:undefined, error:false});
    }else{
        if(req.body.inputEmail != undefined && req.body.inputPassword != undefined){
            req.check('inputEmail', 'Invalid Email Address').isEmail();
            req.check('inputPassword', 'Password should be a combination of letters and numeric values').isLength({ min: 3 });
            req.check('inputPassword', 'Password should be a combination of letters and numeric values').isAlphanumeric();
            var errors = req.validationErrors();
            if(errors){
                res.render('pages/login',{user:undefined, error:true});
            }else{
                userDB.validateCredentials(server.usersDB, req.body.inputEmail, req.body.inputPassword, function(userid){
                    if(userid!=undefined){
                        userDB.getUserProfile(server.itemsDB,server.swapsDB, server.offersDB, userid,function(result){
                            if(result == undefined){
                                req.session.theUser = userid;
                                userDB.getUserName(server.usersDB, userid, function(userResult){
                                    res.render('pages/myItems', 
                                    {   userItemsDisplay: result, 
                                        user: userResult
                                    });
                                });
                            }else{
                                var userProfile = result;
                                req.session.theUser = userProfile.UserID;
                                req.session.currentProfile = userProfile;
                                userDB.getItemIDByUser(server.itemsDB,userProfile.UserID,function(result2){
                                    req.session.itemList = result2;
                                    userDB.getUserName(server.usersDB, req.session.theUser, function(userResult){
                                        res.render('pages/myItems', 
                                        {   userItemsDisplay: req.session.currentProfile.UserItems, 
                                            user: userResult
                                        });
                                    });
                                });
                            }
                        });
                    }else{
                        res.render('pages/login',{user:undefined, error:true});
                    }
                });
            }
        }
    }
});

app.get('/myItems', function(req, res){
    var action = req.query.action;
    var theUser = req.session.theUser;
    if(action == undefined)
    {
        if(theUser == undefined){
            res.render('pages/login',{user:undefined, error:false});
        }else{
            if(req.session.currentProfile == undefined){
                userDB.getUserName(server.usersDB, req.session.theUser, function(userResult){
                    res.render('pages/myItems', 
                    {   userItemsDisplay: undefined, 
                        user: userResult
                    });
                });
            }else{
                userDB.getUserName(server.usersDB, req.session.theUser, function(userResult){
                    res.render('pages/myItems', 
                    {   userItemsDisplay: req.session.currentProfile.UserItems, 
                        user: userResult
                    });
                });
            }
           
        }
        // //var userProfile = userDB.getUserProfile(server.itemsDB,users[0].UserID);
        // userDB.getUserProfile(server.itemsDB,server.swapsDB, server.offersDB, 1,function(result){
        //     var userProfile = result;
        //     req.session.theUser = userProfile.UserID;
        //     req.session.currentProfile = userProfile;
        //     userDB.getItemIDByUser(server.itemsDB,userProfile.UserID,function(result2){
        //         req.session.itemList = result2;
                
        //     });
        // });
        // req.session.theUser = users[0].UserID;
        // req.session.currentProfile = userProfile;
        // req.session.itemList = userDB.getItemIDByUser(userProfile.UserID)
        // res.render('pages/myItems', 
        //             {   userItemsDisplay: req.session.currentProfile.UserItems, 
        //                 user: userDB.getUserName(req.session.theUser) 
        //             });
    }else{
        if(req.query.action == "signIn"){
            res.render('pages/login',{user:undefined, error:false});
        }
        else{
            if(req.query.action == 'signIn'){
                res.render('pages/login',{user:undefined, error:false});
            }else if(req.query.action == 'update'){
                if(req.query.theItem != undefined){
                    itemDB.isValidItem(server.itemsDB,req.query.theItem, function(result){
                        if(result){
                            let userProfile = req.session.currentProfile;
                            let containsItem = false;
                            let userItem;
                            for(let i=0; i<userProfile.UserItems.length; i++){
                                if(req.query.theItem == userProfile.UserItems[i].Item.itemCode){
                                    userItem = userProfile.UserItems[i];
                                    containsItem =true;
                                }
                            }
                            if(containsItem){
                                let itemsList = req.session.itemList;
                                let count = 0;
                                if(itemsList.length == userProfile.UserItems.length){
                                    for(let i = 0; i < itemsList.length; i++){
                                        for(let j = 0; j < userProfile.UserItems.length; j++){
                                            if(itemsList[i]== userProfile.UserItems[j].Item.itemCode){
                                                count++;
                                            }
                                        }
                                    }
                                    if(count == itemsList.length){
                                        if(userItem.Status == 'pending'){
                                            let gameItems=[];
                                            for(let i = 0; i < req.session.currentProfile.UserItems.length; i++){
                                                if(req.session.currentProfile.UserItems[i].Status == 'pending'){
                                                    gameItems.push(req.session.currentProfile.UserItems[i]);
                                                }
                                            }
                                            userDB.getUserName(server.usersDB, req.session.theUser, function(userResult){
                                                res.render('pages/mySwaps', 
                                                {   user: userResult, 
                                                    swapItem: gameItems
                                                });
                                            });
                                            // res.render('pages/mySwaps', 
                                            // {   user: userDB.getUserName(req.session.theUser),
                                            //     swapItem: gameItems
                                            // });
                                        }
                                        else if(userItem.Status == 'available' || userItem.Status == 'swapped'){
                                            userDB.getUserName(server.usersDB, req.session.theUser, function(userResult){
                                                res.render('pages/item',{
                                                    available: true,
                                                    error:false,
                                                    status: userItem.Status,
                                                    gameItem: userItem.Item,
                                                    user: userResult
                                                });
                                            });
                                            // res.render('pages/item',{
                                            //     available: true,
                                            //     error:false,
                                            //     status: available,
                                            //     gameItem: userItem.Item,
                                            //     user: userDB.getUserName(req.session.theUser)
                                            // });
                                        }
                                    }
                                }
                            }
                            else{
                                userDB.getUserName(server.usersDB, req.session.theUser, function(userResult){
                                    res.render('pages/myItems',{
                                        userItemsDisplay: req.session.currentProfile.UserItems,
                                        user: userResult
                                    });
                                });
                                // res.render('pages/myItems',{
                                //     userItemsDisplay: req.session.currentProfile.UserItems,
                                //     user: userDB.getUserName(req.session.theUser)
                                // });
                            }
                        }
                        else{
                            userDB.getUserName(server.usersDB, req.session.theUser, function(userResult){
                                res.render('pages/myItems',{
                                    userItemsDisplay : req.session.currentProfile.UserItems,
                                    user: userResult
                                });
                            });
                            // res.render('pages/myItems',{
                            //     userItemsDisplay : req.session.currentProfile.UserItems,
                            //     user: userDB.getUserName(req.session.theUser)
                            // });
                        }
                    });
                }
                else{
                    userDB.getUserName(server.usersDB, req.session.theUser, function(userResult){
                        res.render('pages/myItems',{   
                            userItemsDisplay : req.session.currentProfile.UserItems,
                            user: userResult
                        });
                    });
                    // res.render('pages/myItems',{   
                    //     userItemsDisplay : req.session.currentProfile.UserItems,
                    //     user: userDB.getUserName(req.session.theUser)
                    // });
                }
            }
            else if(req.query.action == 'reject' || req.query.action == 'withdraw' || req.query.action == 'accept'){
                itemDB.isValidItem(server.itemsDB,req.query.theItem, function(result){
                    if(result){
                        let userProfile = req.session.currentProfile;
                        let containsItem = false;
                        let userItem;
                        for(let i=0; i<userProfile.UserItems.length; i++){
                            if(req.query.theItem == userProfile.UserItems[i].Item.itemCode){
                                userItem = userProfile.UserItems[i];
                                containsItem =true;
                            }
                        }
                        if(containsItem){
                            let itemsList = req.session.itemList;
                            let count = 0;
                            if(itemsList.length == userProfile.UserItems.length){
                                for(let i = 0; i < itemsList.length; i++){
                                    for(let j = 0; j < userProfile.UserItems.length; j++){
                                        if(itemsList[i]== userProfile.UserItems[j].Item.itemCode){
                                            count++;
                                        }
                                    }
                                }
                                if(count == itemsList.length){
                                    if(req.query.action == 'reject' || req.query.action == 'withdraw'){
                                        if(req.query.action == 'reject'){
                                            itemDB.rejectOrWithdrawItem(server.itemsDB, server.offersDB, userItem.SwapItem.itemCode, userItem.Item.itemCode, function(result){
                                                if(result){
                                                    userItem.Status = 'available';
                                                    userItem.SwapItem = undefined;
                                                    userItem.SwapItemRating = undefined;
                                                    userItem.SwapperRating = undefined;
                                                    for(let i = 0; i < userProfile.UserItems.length; i++){
                                                        if(userProfile.UserItems[i].Item.itemCode == userItem.Item.itemCode){
                                                            userProfile.UserItems[i] = userItem;
                                                        }
                                                    }
                                                    req.session.currentProfile = userProfile;
                                                    userDB.getUserName(server.usersDB, req.session.theUser, function(userResult){
                                                        res.render('pages/myItems',{
                                                            userItemsDisplay : req.session.currentProfile.UserItems,
                                                            user: userResult
                                                        });
                                                    });
                                                }
                                            });
                                        }else{
                                            console.log('hello reached to withdraw');
                                            itemDB.rejectOrWithdrawItem(server.itemsDB, server.offersDB, userItem.Item.itemCode, userItem.SwapItem.itemCode, function(result){
                                                if(result){
                                                    userItem.Status = 'available';
                                                    userItem.SwapItem = undefined;
                                                    userItem.SwapItemRating = undefined;
                                                    userItem.SwapperRating = undefined;
                                                    for(let i = 0; i < userProfile.UserItems.length; i++){
                                                        if(userProfile.UserItems[i].Item.itemCode == userItem.Item.itemCode){
                                                            userProfile.UserItems[i] = userItem;
                                                        }
                                                    }
                                                    req.session.currentProfile = userProfile;
                                                    userDB.getUserName(server.usersDB, req.session.theUser, function(userResult){
                                                        res.render('pages/myItems',{
                                                            userItemsDisplay : req.session.currentProfile.UserItems,
                                                            user: userResult
                                                        });
                                                    });
                                                }
                                            });
                                        }
                                       
                                    }
                                    else if (req.query.action == 'accept') {
                                        itemDB.acceptItem(server.itemsDB, server.offersDB,server.swapsDB, userItem.SwapItem.itemCode, userItem.Item.itemCode, function(result){
                                            if(result){
                                                userItem.Status = 'swapped';
                                                for(let i = 0; i < userProfile.UserItems.length; i++){
                                                    if(userProfile.UserItems[i].Item.itemCode == userItem.Item.itemCode){
                                                        userProfile.UserItems[i] = userItem;
                                                    }
                                                }
                                                req.session.currentProfile = userProfile;
                                                userDB.getUserName(server.usersDB, req.session.theUser, function(userResult){
                                                    res.render('pages/myItems',{
                                                        userItemsDisplay : req.session.currentProfile.UserItems,
                                                        user: userResult
                                                    });
                                                });
                                            }
                                        });
                                    }

                                    
                                    // res.render('pages/myItems',{
                                    //     userItemsDisplay : req.session.currentProfile.UserItems,
                                    //     user: userDB.getUserName(req.session.theUser)
                                    // });
                                }
                                else{
                                    userDB.getUserName(server.usersDB, req.session.theUser, function(userResult){
                                        res.render('pages/myItems',{
                                            userItemsDisplay : req.session.currentProfile.UserItems,
                                            user: userResult
                                        });
                                    });
                                    // res.render('pages/myItems',{
                                    //     userItemsDisplay : req.session.currentProfile.UserItems,
                                    //     user: userDB.getUserName(req.session.theUser)
                                    // });
                                }
                            }
                        }
                        else{
                            userDB.getUserName(server.usersDB, req.session.theUser, function(userResult){
                                res.render('pages/myItems',{
                                    userItemsDisplay: req.session.currentProfile.UserItems,
                                    user: userResult
                                });
                            });
                            // res.render('pages/myItems',{
                            //     userItemsDisplay: req.session.currentProfile.UserItems,
                            //     user: userDB.getUserName(req.session.theUser)
                            // });
                        }
                    }
                    else{
                        userDB.getUserName(server.usersDB, req.session.theUser, function(userResult){
                            res.render('pages/myItems',{
                                userItemsDisplay : req.session.currentProfile.UserItems,
                                user: userResult
                            });
                        });
                        // res.render('pages/myItems',{
                        //     userItemsDisplay : req.session.currentProfile.UserItems,
                        //     user: userDB.getUserName(req.session.theUser)
                        // });
                    }
                });
            }
            else if(req.query.action == 'delete'){
                itemDB.isValidItem(server.itemsDB, req.query.theItem, function(result){
                    if(result){
                        let userProfile = req.session.currentProfile;
                        let containsItem = false;
                        let userItem;
                        for(let i=0; i<userProfile.UserItems.length; i++){
                            if(req.query.theItem == userProfile.UserItems[i].Item.itemCode){
                                userItem = userProfile.UserItems[i];
                                containsItem =true;
                            }
                        }
                        if(containsItem){
                            let itemsList = req.session.itemList;
                            let count = 0;
                            if(itemsList.length == userProfile.UserItems.length){
                                for(let i = 0; i < itemsList.length; i++){
                                    for(let j = 0; j < userProfile.UserItems.length; j++){
                                        if(itemsList[i]== userProfile.UserItems[j].Item.itemCode){
                                            count++;
                                        }
                                    }
                                }
                                if(count == itemsList.length){

                                    for(let i = 0; i < userProfile.UserItems.length; i++){
                                        for( let j=0; j< req.session.itemList.length ; j++){
                                            console.log(userProfile.UserItems[i].Item.itemCode);
                                            console.log(userProfile.UserItems[i].Item.Status);
                                            console.log(userProfile.UserItems[i].Item.Status);
                                            if(userProfile.UserItems[i].Item.itemCode == req.session.itemList[j] && userProfile.UserItems[i].Status != 'pending' ){
                                                console.log('inside splice');
                                                req.session.itemList.splice(j,1);
                                            }
                                        }
                                        console.log(userProfile.UserItems[i].Item.itemCode);
                                        console.log(req.query.theItem);
                                        console.log(userProfile.UserItems[i].Item.Status);
                                        if(userProfile.UserItems[i].Item.itemCode == req.query.theItem && userProfile.UserItems[i].Status != 'pending'){
                                            console.log('inside splice');
                                            userProfile.UserItems.splice(i,1);
                                        }
                                    }
                                    req.session.currentProfile = userProfile;
                                    itemDB.deleteItem(server.itemsDB, server.offersDB, server.swapsDB, req.query.theItem, function(result){
                                        if(result == 'unhandled'){
                                            userDB.getUserName(server.usersDB, req.session.theUser, function(userResult){
                                                res.render('pages/myItems',{
                                                    messages: true,
                                                    pendingItem: req.query.theItem,
                                                    userItemsDisplay : req.session.currentProfile.UserItems,
                                                    user: userResult
                                                });
                                            });
                                        }else if(result == 'successful'){
                                            userDB.getUserName(server.usersDB, req.session.theUser, function(userResult){
                                                res.render('pages/myItems',{
                                                    userItemsDisplay : req.session.currentProfile.UserItems,
                                                    user: userResult
                                                });
                                            });
                                        }
                                    });
                                    
                                    // res.render('pages/myItems',{
                                    //     userItemsDisplay : req.session.currentProfile.UserItems,
                                    //     user: userDB.getUserName(req.session.theUser)
                                    // });
                                }
                                else{
                                    userDB.getUserName(server.usersDB, req.session.theUser, function(userResult){
                                        res.render('pages/myItems',{
                                            userItemsDisplay : req.session.currentProfile.UserItems,
                                            user: userResult
                                        });
                                    });
                                    // res.render('pages/myItems',{
                                    //     userItemsDisplay : req.session.currentProfile.UserItems,
                                    //     user: userDB.getUserName(req.session.theUser)
                                    // });
                                }
                            }
                        }
                        else{
                            userDB.getUserName(server.usersDB, req.session.theUser, function(userResult){
                                res.render('pages/myItems',{
                                    userItemsDisplay: req.session.currentProfile.UserItems,
                                    user: userResult
                                });
                            });
                            // res.render('pages/myItems',{
                            //     userItemsDisplay: req.session.currentProfile.UserItems,
                            //     user: userDB.getUserName(req.session.theUser)
                            // });
                        }
                    }
                    else{
                        userDB.getUserName(server.usersDB, req.session.theUser, function(userResult){
                            res.render('pages/myItems',{
                                userItemsDisplay : req.session.currentProfile.UserItems,
                                user: userResult
                            });
                        });
                        // res.render('pages/myItems',{
                        //     userItemsDisplay : req.session.currentProfile.UserItems,
                        //     user: userDB.getUserName(req.session.theUser)
                        // });
                    }
                });
            }
            else if(req.query.action == 'offer'){
                itemDB.isValidItem(server.itemsDB,req.query.theItem, function(result){
                    if(result){
                        if(req.session.currentProfile == undefined){
                            userDB.getUserName(server.usersDB, req.session.theUser, function(userResult){
                                itemDB.getItem(server.itemsDB,req.query.theItem, function(userItemInstance){
                                    res.render('pages/item',{
                                        available: true,
                                        error: true,
                                        status: undefined,
                                        gameItem: userItemInstance,
                                        user: userResult
                                    });
                                } );
                            });
                        }else{
                            let userProfile = req.session.currentProfile;
                            //let containsItem = false;
                            let userItem;
                            //userItem = itemDB.getItem(req.query.theItem);
                                let itemsList = req.session.itemList;
                                let count = 0;
                                if(itemsList.length == userProfile.UserItems.length){
                                    for(let i = 0; i < itemsList.length; i++){
                                        for(let j = 0; j < userProfile.UserItems.length; j++){
                                            if(itemsList[i]== userProfile.UserItems[j].Item.itemCode){
                                                count++;
                                            }
                                        }
                                    }
                                    if(count == itemsList.length){
                                        if(req.query.swapItem!=undefined){
                                            itemDB.getItem(server.itemsDB, req.query.swapItem, function(swapItem){
                                                for(let i = 0; i < userProfile.UserItems.length; i++){
                                                    if(req.query.theItem == userProfile.UserItems[i].Item.itemCode){
                                                        if(userProfile.UserItems[i].Item.Status == 'swapped' || swapItem.Status == 'swapped'){
                                                            var itemListView =[];
                                                            var available = false; 
                                                            for(var j = 0; j < userProfile.UserItems.length; j++){
                                                                if(userProfile.UserItems[j].Status == 'available'){
                                                                    available = true;
                                                                    itemListView.push(userProfile.UserItems[j].Item);
                                                                }
                                                            }
                                                            if(available){
                                                                userDB.getUserName(server.usersDB, req.session.theUser, function(userResult){
                                                                    itemDB.getItem(server.itemsDB,req.query.theItem, function(userItemInstance){
                                                                        res.render('pages/swap',{
                                                                            available: true,
                                                                            itemListView: itemListView,
                                                                            gameItem : userItemInstance,
                                                                            user: userResult
                                                                        });
                                                                    } );
                                                                });
                                                            }
                                                        }else{
                                                            offerDB.addOffer(server.itemsDB,server.offersDB,userProfile.UserItems[i].Item.UserID, swapItem.UserID, userProfile.UserItems[i].Item.itemCode, swapItem.itemCode, function(result){
                                                                if(result){
                                                                    userProfile.UserItems[i].Status = 'pending';
                                                                    userProfile.UserItems[i].PendingStatus = 2;
                                                                    userProfile.UserItems[i].SwapItem = swapItem;
                                                                    userProfile.UserItems[i].SwapItemRating = swapItem.rating;
                                                                    req.session.currentProfile = userProfile;
                                                                    userDB.getUserName(server.usersDB, req.session.theUser, function(userResult){
                                                                        res.render('pages/myItems',{
                                                                            userItemsDisplay : req.session.currentProfile.UserItems,
                                                                            user: userResult
                                                                        });
                                                                    });
                                                                }
                                                            });
                                                        }
                                                    }
                                                }
                                            });
                                            // swapItem = itemDB.getItem(req.query.swapItem);
                                            // for(let i = 0; i < userProfile.UserItems.length; i++){
                                            //     if(req.query.theItem == userProfile.UserItems[i].Item.itemCode){
                                            //         userProfile.UserItems[i].Status = 'pending';
                                            //         userProfile.UserItems[i].PendingStatus = 2;
                                            //         userProfile.UserItems[i].SwapItem = swapItem;
                                            //         userProfile.UserItems[i].SwapItemRating = swapItem.rating;
                                            //     }
                                            // }
                                            // req.session.currentProfile = userProfile;
                                            // userDB.getUserName(server.usersDB, req.session.theUser, function(userResult){
                                            //     res.render('pages/myItems',{
                                            //         userItemsDisplay : req.session.currentProfile.UserItems,
                                            //         user: uuserResult
                                            //     });
                                            // });
                                            // res.render('pages/myItems',{
                                            //     userItemsDisplay : req.session.currentProfile.UserItems,
                                            //     user: userDB.getUserName(req.session.theUser)
                                            // });
                                        }
                                        else{
                                            var itemListView =[];
                                            var available = false; 
                                            for(var i = 0; i < userProfile.UserItems.length; i++){
                                                if(userProfile.UserItems[i].Status == 'available'){
                                                    available = true;
                                                    itemListView.push(userProfile.UserItems[i].Item);
                                                }
                                            }
                                            if(available){
                                                userDB.getUserName(server.usersDB, req.session.theUser, function(userResult){
                                                    itemDB.getItem(server.itemsDB,req.query.theItem, function(userItemInstance){
                                                        res.render('pages/swap',{
                                                            available: true,
                                                            itemListView: itemListView,
                                                            gameItem : userItemInstance,
                                                            user: userResult
                                                        });
                                                    } );
                                                });
                                                // res.render('pages/swap',{
                                                //     available: true,
                                                //     itemListView: itemListView,
                                                //     gameItem : userItem,
                                                //     user: userDB.getUserName(req.session.theUser)
                                                // });
                                            }
                                            else{
                                                userDB.getUserName(server.usersDB, req.session.theUser, function(userResult){
                                                    itemDB.getItem(server.itemsDB,req.query.theItem, function(userItemInstance){
                                                        res.render('pages/item',{
                                                            available: true,
                                                            error: true,
                                                            status: undefined,
                                                            gameItem: userItemInstance,
                                                            user: userResult
                                                        });
                                                    } );
                                                    
                                                });
                                                // res.render('pages/item',{
                                                //     available: true,
                                                //     error: true,
                                                //     status: undefined,
                                                //     gameItem: userItem,
                                                //     user: userDB.getUserName(req.session.theUser)
                                                // });
                                            }
                                        }
                                    }
                                    else{
                                        userDB.getUserName(server.usersDB, req.session.theUser, function(userResult){
                                            res.render('pages/myItems',{
                                                userItemsDisplay : req.session.currentProfile.UserItems,
                                                user: userResult
                                            });
                                        });
                                        // res.render('pages/myItems',{
                                        //     userItemsDisplay : req.session.currentProfile.UserItems,
                                        //     user: userDB.getUserName(req.session.theUser)
                                        // });
                                    }
                                }
                             }
                    }
                    else{
                        userDB.getUserName(server.usersDB, req.session.theUser, function(userResult){
                            res.render('pages/myItems',{
                                userItemsDisplay : req.session.currentProfile.UserItems,
                                user: userResult
                            });
                        });
                        // res.render('pages/myItems',{
                        //     userItemsDisplay : req.session.currentProfile.UserItems,
                        //     user: userDB.getUserName(req.session.theUser)
                        // });
                    }
                });
            }
            else if(req.query.action == 'signout'){
                req.session.theUser = undefined;
                req.session.currentProfile=undefined;
                itemDB.getUniqueCategories(server.itemsDB, function(result1){
                    itemDB.getItemsFromDB(server.itemsDB, function(result2){
                        res.render('pages/categories', {
                            category: result1,
                            gameItems: result2,
                            user : undefined
                        });
                    });
                });
            }else{
                res.render('pages/login',{user:undefined, error:false});
            }
        }
    }
});

