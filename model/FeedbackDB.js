

function addOfferFeedback(itemsDB, UserID, itemCode,offerRating,  callback){
    itemsDB.findoneAndUpdate({itemCode:itemCode, UserID:UserID}, function(error, doc){
        if(!error){
            doc.UserRating = offerRating;
            doc.save();
            callback(true);
        }
    });
};

function addItemFeedback(itemsDB, UserID, itemCode,itemRating,  callback){
    itemsDB.findoneAndUpdate({itemCode:itemCode, UserID:UserID}, function(error, doc){
        if(!error){
            doc.rating = itemRating;
            doc.save();
            callback(true);
        }
    });
};

module.exports = {
    addOfferFeedback:addOfferFeedback,
    addItemFeedback:addItemFeedback
}