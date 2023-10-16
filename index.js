const express = require("express");
const ejs = require("ejs");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");
require("dotenv").config();

const app = express();

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

// const port = process.env.PORT || 27017;

// const items = ["Wake up early", "Do Exercise", "Have a proper healthy breakfast"];
// const workItems = [];

mongoose.connect("mongodb+srv://admin-aman:" + process.env.PASSWORD + "@cluster0.krayh0b.mongodb.net/todolistitemDB");

const itemsSchema = {
  name: String
};

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item ({
  name: "Welcome to To Do List"
});

const item2 = new Item ({
  name: "Hit + button to add a new item"
});

const item3 = new Item ({
  name: "Hit the checkbox to delete an item"
});

const defaultItems = [item1, item2, item3];

const listSchema = {
  name: String,
  items: [itemsSchema]
};

const List = mongoose.model("List", listSchema);

// const day = new Date().toDateString();

app.get("/", function(req, res) {

  Item.find({}).then(function(resultItems) {
    if(resultItems.length === 0) {
      Item.insertMany(defaultItems).then(function() {
        console.log("Successfully saved items to DB");
      }).catch(function(err) {
        console.log(err);
      });
      res.redirect("/");
    } else {
      res.render("home", {listTitle: "Today's", newItems: resultItems});
    }
  }).catch(function(err) {
    console.log(err);
  });

});

app.post("/", function(req, res) {
  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name: itemName
  });

  if(listName === "Today's") {
    item.save();
    res.redirect("/");
  } else {
    List.findOne({name: listName}).then(function(resultList) {
      resultList.items.push(item);
      resultList.save();
      res.redirect("/" + listName);
    }).catch(function(err) {
      console.log(err);
    });
  }

});

app.post("/delete", function(req, res) {
  const checkedItem = req.body.checkbox;
  const listName = req.body.listName;

  if(listName === "Today's") {
    Item.findByIdAndRemove(checkedItem).then(function() {
      console.log("Successfully deleted item(s) from DB");
      res.redirect("/");
    }).catch(function(err) {
      console.log(err);
    });
  } else {
    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItem}}}).then(function(resultList) {
      res.redirect("/" + listName);
    }).catch(function(err) {
      console.log(err);
    });
  }

});

app.get("/:customListName", function(req, res) {
  const customListName = _.capitalize(req.params.customListName);

  List.findOne({name: customListName}).then(function(resultList) {
    if(!resultList) {
      const list = new List({
        name: customListName,
        items: defaultItems
      });
      list.save();
      res.redirect("/" + customListName);
    } else {
      res.render("home", {listTitle: resultList.name, newItems: resultList.items});
    }
  }).catch(function(err) {
    console.log(err);
  });

});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port, function() {
  console.log("Server started successfully");
});
