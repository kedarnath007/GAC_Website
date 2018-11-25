var express = require('express');
var userDB = require('../model/UserDB.js');
var itemDB = require('../model/ItemDB.js');
var offerDB = require('../model/OfferDB.js');
var session = require('express-session');
var server = require('./server.js');
var expressValidator = require('express-validator');
var app = module.exports= express();
app.set('views', '../view');
app.use(expressValidator());

app.post('/signIn', function(req,res){
    if(req.body == undefined){
        res.render('pages/login',{user:undefined, error:false});
    }else{
        if(req.body.inputEmail != undefined && req.body.inputPassword != undefined){
            req.check('inputEmail', 'Invalid Email Address').isEmail();
            req.check('inputPassword', 'Invalid Last Name').isLength({ min: 3 });
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
                                            if(userProfile.UserItems[i].Item.itemCode == req.session.itemList[j]){
                                                req.session.itemList.splice(j,1);
                                            }
                                        }
                                        if(userProfile.UserItems[i].Item.itemCode == req.query.theItem){
                                            userProfile.UserItems.splice(i,1);
                                        }
                                    }
                                    req.session.currentProfile = userProfile;
                                    itemDB.deleteItem(server.itemsDB, req.query.theItem, function(result){
                                        if(result){
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
                        console.log('hello inside 1');
                        if(req.session.currentProfile == undefined){
                            console.log('hello inside if condition');
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
                                                        offerDB.addOffer(server.itemsDB,server.offersDB,userProfile.UserItems[i].Item.UserID, swapItem.UserID, userProfile.UserItems[i].Item.itemCode, swapItem.itemCode, function(result){
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
                                                        });
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

