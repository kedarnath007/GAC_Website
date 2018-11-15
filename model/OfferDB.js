

function addOffer(offersDB, UserID, SwapUserID, itemCode, SwapItemCode, callback){
    var offerItem = new offersDB({UserID:UserID,SwapUserID:SwapUserID, itemCode:itemCode, SwapItemCode:SwapItemCode});
    offerItem.save(function(err,result ){
        if(!err){
            callback(true);
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
