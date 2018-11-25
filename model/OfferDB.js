

function addOffer(itemsDB, offersDB, UserID, SwapUserID, item, swapItem, callback){

    itemsDB.updateMany({$or:[{itemCode:item},{itemCode:swapItem}]},{Status:'pending'}, {multi:true},function(error1,doc1){
        if(!error1){
            itemsDB.updateOne({itemCode:item}, {Initiated:1}, function(error2, doc2){
                if(!error2){
                    itemsDB.updateOne({itemCode:swapItem}, {Initiated:0}, function(error3, doc2){
                        if(!error3){
                            let offerItem = new offersDB({UserID:UserID,SwapUserID:SwapUserID, itemCode:item, SwapItemCode:swapItem});
                            offerItem.save(function(err,result ){
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
                }else{
                    callback(false);
                }
            });  
        }else{
            console.log(error1);
            callback(false);
        }
    });
};

function updateOffer(offersDB, UserID, itemCode, initiated, callback){
    if(initiated == 1){
        offersDB.find({UserID:UserID,itemCode:itemCode}, function(err, docs){
            if(!err){
                docs.remove();
                callback(true);
            }
        });
    }else{
        offersDB.find({SwapUserID:UserID,SwapItemCode:itemCode}, function(err, docs){
            if(!err){
                docs.remove();
                callback(true);
            }
        });
    }
};

module.exports = {
    addOffer:addOffer,
    updateOffer:updateOffer
}
