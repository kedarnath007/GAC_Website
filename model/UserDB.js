var user = require('./User.js');
var userItem = require('./UserItem.js');
var userProfile = require('./UserProfile.js');
var itemDB = require('./ItemDB.js');
var itemModel = require('./Item.js');

// users = [];
// userItems = [];
// userProfiles = [];

// user1 = new user.User(1,'Kedarnath','Kurnool Gandla','kedarnath1234@gmail.com','9613 Grove Crest Lane','Apt 1724','Charlotte','North Carolina','28262','United States');
// user2 = new user.User(2,'Vini','Malhotra','vini.malhotra2@gmail.com','3405 Telford St.','Apt 1724','Cincinnati','Ohio','45220','United States');
// user3 = new user.User(3, 'Vishnu','Yandrapati','srivishnuthatsit@gmail.com','9613 Grove Crest Lane','Apt 1724','Charlotte','NC','28262','United States');
// user4 = new user.User(4, 'Sridhar','Ramesh Babu','sridharramesh92@gmail.com','9613 Grove Crest Lane','Apt 1724','Charlotte','NC','28262','United States');
// users.push(user1);
// users.push(user2);
// users.push(user3);
// users.push(user4);

// var items = itemDB.getItems();

// userItem1 = new userItem.UserItem(items[2], 4,'swapped',undefined,items[5],items[5].rating,3);
// userItem2 = new userItem.UserItem(items[1], 4,'available',undefined,undefined,undefined,undefined);
// userItem3 = new userItem.UserItem(items[3], 5,'pending',2,items[1],items[1].rating,4);
// userItem4 = new userItem.UserItem(items[0], 5,'pending',1,items[4],items[4].rating,3);
// userItem5 = new userItem.UserItem(items[4], 3,'available',undefined,undefined,undefined,undefined);
// userItem6 = new userItem.UserItem(items[5], 3,'swapped',undefined,items[2],items[2].rating,4);

// userItems.push(userItem1);
// userItems.push(userItem2);
// userItems.push(userItem3);
// userItems.push(userItem4);
// userItems.push(userItem5);
// userItems.push(userItem6);


// userProfile1 = new userProfile.UserProfile(1,[userItem3,userItem4]);
// userProfile2 = new userProfile.UserProfile(2,[userItem1,userItem2]);
// userProfile3 = new userProfile.UserProfile(3,[userItem5]);
// userProfile4 = new userProfile.UserProfile(4,[userItem6]);

// userProfiles.push(userProfile1);
// userProfiles.push(userProfile2);
// userProfiles.push(userProfile3);
// userProfiles.push(userProfile4);

// function getUserItems(){
//     if(userItems.length>0){
//         return userItems;
//     }else{
//         return undefined;
//     }
// };

// function getUsers(){
//     if(users.length>0){
//         return users;
//     }else{
//         return undefined;
//     }
// };


// function getUserProfiles(){
//     if(userProfiles.length>0){
//         return userProfiles;
//     }else{
//         return undefined;
//     }
// };
function createUser( UserID, FirstName, LastName, EmailAddress, Address1, Address2, City, State, PostCode,Country){
    var userInstance = new user.User(UserID, FirstName, LastName, EmailAddress, Address1, Address2, City, State, PostCode,Country);
    return userInstance;
};

function addUser(usersDB, userParam, password, callback){
    var userInstance = new usersDB({_id:userParam.UserID, Password: password, FirstName: userParam.FirstName, LastName: userParam.LastName,
                                    EmailAddress: userParam.EmailAddress, Address1:userParam.Address1, Address2: userParam.Address2, City: userParam.City, State:userParam.State, PostCode: userParam.PostCode, Country: userParam.Country});
    userInstance.save(function(err,result ){
        if(!err){
            callback(true);
        }
    });
};

function getUserProfile(itemsDB,swapsDB, offersDB, userID, callback){
    itemsDB.find({UserID: userID},function(error,docs){
        if(!error && docs.length>0){
            userItemsFromDB = [];
            let total = docs.length;
            for(let i=0;i<docs.length;i++){
                if(docs[i].Status == 'available'){
                    let item = itemDB.addItem(docs[i].itemCode,docs[i].itemName,
                        docs[i].catalogCategory,docs[i].description,docs[i].rating,docs[i].imageURL,
                        docs[i].UserID,docs[i].Status,docs[i].Initiated, docs[i].UserRating);
                    let userItemInstance = new userItem.UserItem(item,docs[i].rating,docs[i].Status, undefined, undefined, undefined, undefined);
                    userItemsFromDB.push(userItemInstance);
                    if(total == i+1){
                        userProfileInstance = new userProfile.UserProfile(userID,userItemsFromDB)
                        callback(userProfileInstance);
                    }
                }else if(docs[i].Status == 'swapped'){
                    let item = itemDB.addItem(docs[i].itemCode,docs[i].itemName,
                        docs[i].catalogCategory,docs[i].description,docs[i].rating,docs[i].imageURL,
                        docs[i].UserID,docs[i].Status,docs[i].Initiated, docs[i].UserRating);
                    if(docs[i].Initiated == 1){
                        swapsDB.findOne({UserID: docs[i].UserID, itemCode:docs[i].itemCode}, function(error, doc){
                            if(!error){
                                console.log(doc.SwapItemCode);
                                itemDB.getItem(itemsDB, doc.SwapItemCode, function(result){
                                    let swapItem = result;
                                    let userItemInstance = new userItem.UserItem(item,docs[i].rating,docs[i].Status, undefined, swapItem, swapItem.rating, swapItem.UserRating);
                                    userItemsFromDB.push(userItemInstance);
                                    if(total == i+1){
                                        userProfileInstance = new userProfile.UserProfile(userID,userItemsFromDB)
                                        callback(userProfileInstance);
                                    }
                                });
                            }
                        });
                    }else{
                        swapsDB.findOne({SwapUserID: docs[i].UserID, SwapItemCode:docs[i].itemCode}, function(error, doc){
                            if(!error){
                                console.log(doc.itemCode);
                                itemDB.getItem(itemsDB, doc.itemCode, function(result){
                                    let swapItem = result;
                                    let userItemInstance = new userItem.UserItem(item,docs[i].rating,docs[i].Status, undefined, swapItem, swapItem.rating, swapItem.UserRating);
                                    userItemsFromDB.push(userItemInstance);
                                    if(total == i+1){
                                        userProfileInstance = new userProfile.UserProfile(userID,userItemsFromDB)
                                        callback(userProfileInstance);
                                    }
                                });
                            }
                        });
                    }
                }else{
                    let item = itemDB.addItem(docs[i].itemCode,docs[i].itemName,
                        docs[i].catalogCategory,docs[i].description,docs[i].rating,docs[i].imageURL,
                        docs[i].UserID,docs[i].Status,docs[i].Initiated, docs[i].UserRating);
                    if(docs[i].Initiated == 1){
                        offersDB.findOne({UserID: docs[i].UserID, itemCode:docs[i].itemCode}, function(error, doc){
                            if(!error){
                               itemDB.getItem(itemsDB, doc.SwapItemCode, function(result){
                                    var userItemInstance = new userItem.UserItem(item,docs[i].rating,docs[i].Status, 2, result, result.rating, result.UserRating);
                                    userItemsFromDB.push(userItemInstance);
                                    if(total == i+1){
                                        userProfileInstance = new userProfile.UserProfile(userID,userItemsFromDB)
                                        callback(userProfileInstance);
                                    }
                                });
                            }
                        });
                    }else{
                        offersDB.find({SwapUserID: docs[i].UserID, SwapItemCode:docs[i].itemCode}, function(error, doc){
                            if(!error){
                                for(let j= 0; j< doc.length; j++){
                                    itemDB.getItem(itemsDB, doc[j].itemCode, function(result){
                                        var userItemInstance = new userItem.UserItem(item,docs[i].rating,docs[i].Status, 1, result, result.rating, result.UserRating);
                                        userItemsFromDB.push(userItemInstance);
                                        if(total == i+1){
                                            userProfileInstance = new userProfile.UserProfile(userID,userItemsFromDB)
                                            callback(userProfileInstance);
                                        }
                                    });
                                }
                            }
                        });
                    }
                }
                
            }
            // userProfileInstance = new userProfile.UserProfile(userID,userItemsFromDB)
            // callback(userProfileInstance);
        }else{
            callback(undefined);
        }
    });
    // for(var i = 0; i < userProfiles.length; i++){
    //     if(userProfiles[i].UserID == userID){
    //         return userProfiles[i];
    //     }
    // }
};

function getItemIDByUser(itemsDB,userID, callback){
    itemsDB.find({UserID:userID},function(error,docs){
        if(!error){
            var itemIDs = [];
            for (var i=0;i<docs.length;i++){
                itemIDs.push(docs[i].itemCode);
            }
            callback(itemIDs);
        }
    });
    // for(var i = 0; i < userProfiles.length; i++){
    //     if(userProfiles[i].UserID == userID){
    //         for(var j=0;j<userProfiles[i].UserItems.length;j++){
    //             itemIDs.push(userProfiles[i].UserItems[j].Item.itemCode);
    //         }
    //     }
    // }
    // return itemIDs;
};

function getItemsByUser(itemsDB, userid, callback){
    itemsDB.find({UserID:{$ne:userid}},function(error,docs){
        if(!error){
            items=[];
            for(var i=0;i<docs.length;i++){
                var item = new itemModel.Item(docs[i].itemCode,docs[i].itemName,
                    docs[i].catalogCategory,docs[i].description,docs[i].rating,docs[i].imageURL);
                items.push(item);
            }
            callback(items);
        }
    });
}


function getItemsByUserCategory(itemsDB, userid, category, callback){
    var gameItems = [];
    itemsDB.find({catalogCategory: category,UserID:{$ne:userid}},function(error,docs){
        if(!error){
            items=[];
            for(var i=0;i<docs.length;i++){
                var item = new itemModel.Item(docs[i].itemCode,docs[i].itemName,
                    docs[i].catalogCategory,docs[i].description,docs[i].rating,docs[i].imageURL);
                items.push(item);
            }
            callback(items);
        }
    });
};

function getUniqueCategoriesByUser(itemsDB,userid,callback){
    itemsDB.find({UserID:{$ne:userid}}).distinct('catalogCategory',function(error, docs){
        if(!error){
            categories=[];
            for(var i = 0; i < docs.length; i++){
                categories.push(docs[i]);
            }
            callback(categories);
        }
    });
}

function getUniqueCategoriesByUserCategory(itemsDB,userid,category,callback){
    var categories = [];
    itemsDB.find({catalogCategory: category, UserID: {$ne:userid}}).distinct('catalogCategory', function(error, docs){
        if(!error){
            categories = [];
            for(var i=0;i<docs.length;i++){
                categories.push(docs[i]);
            }
            callback(categories);
        }
    });
};

function getUserName(usersDB,userID,callback){
    usersDB.findById(userID, function(error,doc){
        if(!error){
            callback(doc.LastName+', ' + doc.FirstName);
        }
    });
};

function validateCredentials(usersDB,email, password, callback){
    usersDB.findOne({EmailAddress:email, Password:password}, function(error,doc){
        if(!error){
            if(doc){
                callback(doc._id);
            }else{
                callback(undefined);
            }
        }else{
            callback(undefined);
        }
    });
};
// function getUserName(userID){
//     var userName;
//     for(var i = 0; i < users.length; i++){
//         if(users[i].UserID == userID){
//             userName = users[i].LastName + ', ' + users[i].FirstName;
//             return userName;
//         }
//     }
// };

function getMaxID(usersDB, callback){
    usersDB.findOne({}).sort('-_id').exec(function(err,doc){
        callback(doc._id);
    });
};

function checkEmail(usersDB,email, callback){
    usersDB.findOne({EmailAddress:email}, function(err,docs){
        if(!err){
            if(docs){
                callback(docs.EmailAddress);
            }else{
                callback(undefined);
            }
        }
    });
};

module.exports = {
    //getUserItems: getUserItems,
    //getUsers: getUsers,
    //getUserProfiles: getUserProfiles,
    addUser:addUser,
    createUser:createUser,
    getUserProfile: getUserProfile,
    getItemsByUser: getItemsByUser,
    getUniqueCategoriesByUser: getUniqueCategoriesByUser,
    getUserName: getUserName,
    getItemIDByUser: getItemIDByUser,
    getItemsByUserCategory: getItemsByUserCategory,
    getUniqueCategoriesByUserCategory: getUniqueCategoriesByUserCategory,
    validateCredentials:validateCredentials,
    getMaxID:getMaxID,
    checkEmail:checkEmail
}