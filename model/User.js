var User = function (UserID, FirstName, LastName, EmailAddress, Address1, Address2, City, State, PostCode, Country ) {
    this.UserID = UserID;
    this.FirstName = FirstName;
    this.LastName = LastName;
    this.EmailAddress = EmailAddress;
    this.Address1 = Address1;
    this.Address2 = Address2;
    this.City = City;
    this.State = State;
    this.PostCode = PostCode;
    this.Country = Country;

    var userInfo = {
        UserID: this.UserID,
        FirstName: this.FirstName,
        LastName: this.LastName,
        EmailAddress: this.EmailAddress,
        Address1:this.Address1,
        Address2:this.Address2,
        City:this.City,
        State:this.State,
        PostCode:this.PostCode,
        Country:this.Country
    }

    return userInfo;
};

module.exports.User = User;