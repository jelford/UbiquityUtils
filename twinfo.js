CmdUtils.CreateCommand({
  names: ["twinfo", "twitfo", "tell me about"],
  author: {name: "James", email : "je208@doc.ic.ac.uk"},
  license: "MPL",
  description: "Finds information on a Twitter user",
  help: "Takes the user's screen name as an argument, and displays a summary of their information in the preview
            box, which is pasted into a document when the command is executed. Can be embedded in emails, documents
            etc, and all usernames / hashtags / urls are properly passed/linked.",

  comments: "This code was more about me learning javascript than anything else. It's not really commented at all (for which I apologise deeply), and there are probably some grevious errors. A known bug is that when the username for lookup is incomplete, it still attempts to pass the XML data from twitter, even though it's invalid / empty. There's a check in there, but that doesn't seem to do anything. This isn't a fatal bug, as most of the time it's just caught and logged by the error console, but it does slow things down a bit when you've got firebug running. Also, beware that it potentially sends a request with every character typed (not sure how to avoid that and maintain the preview), so if you overuse it you could go over your 150 request/hr limit, but I only did that once in the whole development process.",


  //Pass it a twitter ID
  arguments : [{role: "user", nountype: noun_type_twitter_user, label: "@usertofollow"}],
  

  getInfo: function(username){
      var xhttp = new XMLHttpRequest();
      xhttp.open("GET", "http://twitter.com/users/show/" + username + ".xml", false);
      xhttp.send("");
      var xmlDoc = xhttp.responseXML;
      
      if(xmlDoc == null || xmlDoc == undefined){ displayMessage("Could not retrieve user info..."); return "Could not find user"; }
 
      String.prototype.parseUsernames = function(){
          return this.replace(/[@][\w]+/g,function(username){
            var user = username.replace(/[@]/,"");
            return username.link("http://twitter.com/"+user);
          });
      };  

      String.prototype.parseHashtags = function(){
          return this.replace(/[#][\w]+/g,function(hashtag){
            var tag = hashtag.replace(/[#]/,"");
            return hashtag.link("http://twitter.com/#search?q=%23"+tag);
          });
      };

      String.prototype.parseURLS = function(){
          return this.replace(/[A-Za-z]+:\/\/[\w]+\.[A-Za-z0-9-_:%&\?\/.=]+/g, function(url){
            return url.link(url); 
          });
      };

      function getElement(tagName){
        if(xmlDoc.getElementsByTagName(tagName)[0].childNodes[0] != undefined){
          return xmlDoc.getElementsByTagName(tagName)[0].childNodes[0].nodeValue;
        };
      };

      var fullName = getElement("name");
      var screenName = getElement("screen_name"); 
      var location = getElement("location");
      var description = getElement("description");
      var profileImage = getElement("profile_image_url");
      var website = getElement("url");
      var followers = getElement("followers_count");
      var following = getElement("friends_count");
      var joinedOn = getElement("created_at");
      var noOfUpdates = getElement("statuses_count");

      var lastUpdate = xmlDoc.getElementsByTagName("status")[0];
      if(lastUpdate != undefined){
        var updateText = lastUpdate.getElementsByTagName("text")[0].childNodes[0].nodeValue;
        var timeUpdated = new Date(lastUpdate.getElementsByTagName("created_at")[0].childNodes[0].nodeValue).toUTCString();
      }

      return     "<div style='float:left'>" +
           "<img src='" + profileImage + "'/>" + 
           "</div>" + 
           "<div class='twitter'>" + "<b>" + fullName + "</b>" + "<br/>" +
           "<small><a href='https://twitter.com/" + username + "'>@" + username + "</a>" + "<br/></br><br/>" +
           "Location: " + location + "<br/><br/>" +
           "<b>Last status:</b> <i>" + timeUpdated + "</i><br/>" + 
           "<i>" + updateText.parseURLS().parseUsernames().parseHashtags() + "</i>" + "<br/><br/>" +
           "<small>(One of " + noOfUpdates + "). " +
           "Following: " + following + ", Followers: " + followers + "<br/>" +
           "</small>";

  },



  preview: function(pblock, args){
   pblock.innerHTML= args.user.text != "" ? this.getInfo(args.user.text.replace(/@/,"")) : "Finds the Twitter info for a given @user";
  },

  execute: function(args){
    CmdUtils.setSelection(args.user.text != "" ? this.getInfo(args.user.text.replace(/@/,"")) : "Finds the Twitter info for a given @user");
  },


})
