var UserItem = function (Item, Rating, Status,PendingStatus, SwapItem, SwapItemRating, SwapperRating ) {
    this.Item = Item;
    this.Rating = Rating;
    this.Status = Status;
    this.PendingStatus = PendingStatus
    this.SwapItem = SwapItem;
    this.SwapItemRating = SwapItemRating;
    this.SwapperRating = SwapperRating;

    var userItemInfo = {
        Item: this.Item,
        Rating: this.Rating,
        Status: this.Status,
        PendingStatus: this.PendingStatus,
        SwapItem: this.SwapItem,
        SwapItemRating:this.SwapItemRating,
        SwapperRating:this.SwapperRating
    }

    return userItemInfo;
};

module.exports.UserItem = UserItem;