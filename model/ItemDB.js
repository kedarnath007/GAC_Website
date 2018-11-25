var item = require('./Item.js');

// games = [];

// game1 = new item.Item('GAC1','NFS Most Wanted','Action','Need for Speed: Most Wanted is a 2005 racing video game developed by EA Canada and published by Electronic Arts. It is the ninth installment in the Need for Speed series. The game features street racing-oriented game play, with certain customization options from the Need for Speed: Underground series. The game is succeeded by Need for Speed: Carbon, which serves as a sequel to Most Wanted. Need for Speed: Most Wanted received positive reviews and was a commercial success; it sold 16 million copies worldwide, making it the best-selling title in the series.',4,'images/101.jpg' );
// game2 = new item.Item('GAC2','Grand Theft Auto Vice City','Action','Grand Theft Auto: Vice City is an action-adventure video game developed by Rockstar North and published by Rockstar Games. It was released on 29 October 2002 for the PlayStation 2, on 12 May 2003 for Microsoft Windows, and on 31 October 2003 for the Xbox. The game\'s plot is based on multiple real-world people and events in Miami such as Cuban, Haitian, and Biker gangs, the 1980s crack epidemic, the Mafioso drug lords of Miami, and the dominance of glam metal.',3,'images/102.jpg');
// game3 = new item.Item('GAC3', 'Fortnite','Action','Fortnite is the living, action building game using Unreal Engine 4 from Epic Games. You and your friends will lead a group of Heroes to reclaim and rebuild a homeland that has been left empty by mysterious darkness only known as "The Storm". Band together online to build extravagant forts, find or build insane weapons and traps and protect your towns from the strange Monsters that emerge during the Storm. In an action experience from the only company smart enough to attach chainsaws to guns, get out there to push back the Storm and save the world. And don\'t forget to Loot all the things.',5,'images/103.jpg');
// game4 = new item.Item('GAC4', 'Cricket','Sports','Cricket is a bat-and-ball game played between two teams of eleven players. It is set on a cricket field centred on a 20-metre (22-yard) pitch with two wickets each comprising a bail balanced on three stumps. For each phase of play, or innings, a batting side tries to score as many runs as possible after striking the cricket ball thrown at the wicket (or delivery) with the bat, while a bowling and fielding side tries to prevent this and dismiss each player (so they are "out"). Means of dismissal can include being bowled, when the ball directly hits the stumps and dislodges the bails, and by the fielding side catching the ball after it is hit by the bat, but before it hits the ground. When ten players have been dismissed, the innings end and the teams swap roles. The side with the most runs generally wins, though there are exceptions where the game is drawn instead. The game is adjudicated by two umpires, aided by a third umpire and match referee in international matches. They communicate with two off-field scorers (one per team) who record all the match\'s statistical information.',5,'images/104.jpg');
// game5 = new item.Item('GAC5','Soccer','Sports','The Soccer Game was an early football-management game, released by Wizard Games of Scotland in 1989. The player manages a football team in the English league. The team starts in the 4th division, although any team from [what were then] the top 4 division of England can be chosen. S/he can alter a team\'s name before playing. The squad usually consisted of 11 players, but new players could be purchased. According to the help file, the database had 1270 players, and 100 each of treasurers, scouts, physiotherapists, managers and assistant managers. The action in the football matches was written out on the screen.',4,'images/105.jpg');
// game6 = new item.Item('GAC6','Tennis','Sports','Tennis is a racket sport that can be played individually against a single opponent (singles) or between two teams of two players each (doubles). Each player uses a tennis racket that is strung with cord to strike a hollow rubber ball covered with felt over or around a net and into the opponent\'s court. The object of the game is to maneuver the ball in such a way that the opponent is not able to play a valid return. The player who is unable to return the ball will not gain a point, while the opposite player will.',3,'images/106.jpg');

// games.push(game1);
// games.push(game2);
// games.push(game3);
// games.push(game4);
// games.push(game5);
// games.push(game6);

// function getItems(){
//     if(games.length>0){
//         return games;
//     }else{
//         return undefined;
//     }
// };

function addItem(itemCode, itemName, catalogCategory, description,rating, imageURL,UserID,Status,Initiated,UserRating){
    var itemInstance = new item.Item(itemCode, itemName, catalogCategory, description,rating, imageURL,UserID,Status,Initiated,UserRating);
    return itemInstance;
};

function getItemsFromDB(itemsDB, callback){
    itemsDB.find({},function(error,docs){
        if(!error){
            items=[];
            for(var i=0;i<docs.length;i++){
                var itemInstance = addItem(docs[i].itemCode,docs[i].itemName,
                    docs[i].catalogCategory,docs[i].description,docs[i].rating,docs[i].imageURL,
                    docs[i].UserID,docs[i].Status,docs[i].Initiated, docs[i].UserRating);
                items.push(itemInstance);
            }
            callback(items);
        }
    });
}

function getItem(itemsDB, itemID, callback){
    itemsDB.findOne({itemCode: itemID},function(error,docs){
        if(!error){
            var itemInstance = addItem(docs.itemCode,docs.itemName,
                docs.catalogCategory,docs.description,docs.rating,docs.imageURL,
                docs.UserID,docs.Status,docs.Initiated, docs.UserRating);
            callback(itemInstance);
        }
    });
};

function getItemByCategory(itemsDB, category, callback){
    itemsDB.find({catalogCategory: category},function(error,docs){
        if(!error){
            items=[];
            for(var i=0;i<docs.length;i++){
                var itemInstance = addItem(docs[i].itemCode,docs[i].itemName,
                    docs[i].catalogCategory,docs[i].description,docs[i].rating,docs[i].imageURL,
                    docs[i].UserID,docs[i].Status,docs[i].Initiated, docs[i].UserRating);
                items.push(itemInstance);
            }
            callback(items);
        }
    });
};

function getUniqueCategories(itemsDB, callback){
    itemsDB.find({}).distinct('catalogCategory',function(error, docs){
        if(!error){
            categories=[];
            for(var i = 0; i < docs.length; i++){
                categories.push(docs[i]);
            }
            callback(categories);
        }
    });
};

function isValidItem(itemsDB,item,callback){
    itemsDB.find({itemCode:item},function(error,doc){
        if(doc){
            callback(true);
        }else{
            callback(false);
        }
    });
    // for(var i = 0; i < games.length; i++){
    //     if(games[i].itemCode == item){
    //         return true;
    //     }
    // }
};

function deleteItem(itemsDB,item,callback){
    itemsDB.deleteOne({itemCode:item}, function(error,doc){
        if(!error){
            callback(true);
        }else{
            callback(false);
        }
    });
};

function updateItemStatus(itemsDB,item,status, callback){
    itemsDB.findOneAndUpdate({itemCode:item}, {Status:status}, function(error,doc){
        if(!error){
            callback(true);
        }else{
            callback(false);
        }
    });
};

function rejectOrWithdrawItem(itemsDB,offersDB, item, swapItem, callback){
    console.log(item);
    console.log(swapItem);
    itemsDB.updateMany({$or:[{itemCode:item},{itemCode:swapItem}]}, {Status:'available'}, function(error,doc){
        if(!error){
            offersDB.deleteOne({SwapItemCode:swapItem, itemCode:item}, function(err, doc){
                if(!err){
                    callback(true);
                }else{
                    callback(false);
                }
            });
        }else{
            callback(false);
        }
    });
};

function acceptItem(itemsDB,offersDB,swapsDB, item, swapItem, callback){
    itemsDB.updateMany({$or:[{itemCode:item},{itemCode:swapItem}]}, {Status:'swapped'}, {multi:true},function(error1,doc1){
        if(!error1){
            offersDB.findOne({SwapItemCode:swapItem, itemCode:item}, function(error2, doc2){
                if(!error2){
                    var swap = new swapsDB({UserID:doc2.UserID,SwapUserID:doc2.SwapUserID,itemCode:doc2.itemCode,SwapItemCode:doc2.SwapItemCode});
                    swap.save();
                    offersDB.deleteOne({SwapItemCode:swapItem, itemCode:item}, function(error3, doc3){
                        if(!error3){
                            callback(true);
                        }else{
                            console.log(error3);
                            callback(false);
                        }
                    });
                }else{
                    console.log(error2);
                    callback(false);
                }
            });
        }else{
            console.log(error1);
            callback(false);
        }
    });
};

module.exports = {
    getItem: getItem,
    addItem: addItem,
    getItemsFromDB: getItemsFromDB,
    //getItems: getItems,
    getItemByCategory: getItemByCategory,
    getUniqueCategories: getUniqueCategories,
    isValidItem: isValidItem,
    deleteItem:deleteItem,
    updateItemStatus:updateItemStatus,
    rejectOrWithdrawItem:rejectOrWithdrawItem,
    acceptItem:acceptItem
}