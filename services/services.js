const jwt = require("jsonwebtoken");
const secret = "sadkowquenf&^^ASD9zxc((77sd2as@@";

module.exports.vertify = (req) => {
    var result = false;
    if(req.body.token != null){ 
        jwt.verify(req.body.token, secret, function (err, decoded) {
          if (err) {
            result = false;
          } else {
            result = true;
          }
        })
      }
      else{
        result = false;
      }
      return result;
}