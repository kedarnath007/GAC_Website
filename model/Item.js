var Item = function (itemCode, itemName, catalogCategory, description, rating, imageURL,UserID,Status,Initiated,UserRating ) {
    this.itemCode = itemCode;
    this.itemName = itemName;
    this.catalogCategory = catalogCategory;
    this.description = description;
    this.rating = rating;
    this.imageURL = imageURL;
    this.UserID = UserID;
    this.Status = Status;
    this.Initiated = Initiated;
    this.UserRating = UserRating;

    var itemInfo = {
        itemCode: this.itemCode,
        itemName: this.itemName,
        catalogCategory: this.catalogCategory,
        description: this.description,
        rating:this.rating,
        imageURL:this.imageURL,
        UserID:this.UserID,
        Status:this.Status,
        Initiated:this.Initiated,
        UserRating:this.UserRating
    }

    return itemInfo;
};

module.exports.Item = Item;