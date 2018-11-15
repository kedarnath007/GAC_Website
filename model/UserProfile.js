var UserProfile = function (UserID, UserItems ) {
    this.UserID = UserID;
    this.UserItems = UserItems;

    var userProfile = {
        UserID: this.UserID,
        UserItems: this.UserItems
    }

    return userProfile;
};

function removeuserItem(item){
    for(var i = 0; i < this.UserItems.length; i++){
        if(this.UserItems[i].itemCode ==item.itemCode){
            this.UserItems.splice(i,1);
            return;
        }
    }
};

function getUserItems(){
    if(this.UseItems.length>0){
        return this.UserItems;
    }else{
        return undefined;
    }
};

function emptyProfile(){
    for(var i = 0; i < this.UserItems.length; i++){
        this.UserItems.splice(i,1);
    }
};

module.exports = {
    UserProfile:UserProfile,
    removeuserItem: removeuserItem,
    getUserItems: getUserItems,
    emptyProfile: emptyProfile
}