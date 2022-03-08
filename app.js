//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require('mongoose');
const {
  Schema
} = mongoose;

// const date = require(__dirname + "/date.js");
// const day = date.getDate();
//
//   res.render("list", {listTitle: day, newListItems: items});

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));
//mongodb+srv://jaychamp:@cluster0.cwe88.mongodb.net/myFirstDatabase?retryWrites=true&w=majority
mongoose.connect("mongodb://127.0.0.1:27017/todolistDB");
//create the schema for processing list items
const itemsSchema = new Schema({
  name: {
    type: String,
    required: true
  }
});
//create the items model
const Item = new mongoose.model('Item', itemsSchema);


const item1 = new Item({
  name: "Click + to add items"
});
const item2 = new Item({
  name: "<- Check box to delete items"
});
//inserts hardcoded default items in the lists 
const defaultItems = [item1, item2];
//create the lists schema to keep track of the users created lists
const listSchema = {
  name: String,
  items: [itemsSchema]
}
// created user created lists model
const List = mongoose.model("List", listSchema);


let allItems = [];





app.get("/", function (req, res) {
  //searches for items in db upon query
  Item.find({}, function (err, allItems) {
    //if no items, insert default items in db and redirects
    if (allItems.length === 0) {
      Item.insertMany(defaultItems, function (err) {
        if (err) {
          console.log(err);
        } else {}
      });
      res.redirect("/");
    }
    //if items exist in list, render the found items in db
    else {
      res.render("list", {
        listTitle: "Today",
        newListItems: allItems
      });
    }
  });

});

app.post("/", function (req, res) {

  const itemName = req.body.newItem;
  const listName = req.body.list;
  const newName = listName.slice(0, -1);
  console.log(newName + "1");
  const item = new Item({
    name: newName
  });
  // checks if user tries to post to home route. If so, save item to home db
  if (listName === "Today") {
    item.save();
    res.redirect("/");
  } else {
    //if user posts to a custom list, query the list add the new item then save and redirect to the same list
    List.findOne({
      name: listName
    }, function (err, foundList) {
      console.log(foundList);
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName);

    });
    
  }

});
//if user checks box, finds checked item id and removes it from db
app.post("/delete", function (req, res) {
  const checkedId = req.body.checkbox;
  const listName = req.body.listName;
  if(listName === "Today"){
    const deleted = Item.findByIdAndRemove(checkedId, function (err) {
      if (err) {
        console.log(err);
      }
    });
    res.redirect("/");
  }else{

  }
  
});


//custom list query
app.get("/:listName", function (req, res) {
  const listName = req.params.listName;

  List.findOne({ 
    name: listName
  }, function (err, result) {
    if (!err) {
      if (!result) {
        //create new list if result is empty it means list/collection doesnt exist
        const list = new List({
          name: listName,
          items: defaultItems
        });
        list.save();
        res.redirect("/" + listName);
      } else {
        //show existing list, if found in db
        res.render('list', {
          listTitle: result.name,
          newListItems: result.items
        });
      }
    }
  });
});


app.get("/about", function (req, res) {
  res.render("about");
});

app.listen(3000, function () {
  console.log("Server started on port 3000");
});