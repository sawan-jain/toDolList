//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose = require("mongoose")
const _ = require("lodash");
const PORT = process.env.PORT || 3000;

const app = express();

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.set('strictQuery', false);
mongoose.connect("mongodb+srv://sawan-jain-01:12345@cluster0.shxguvz.mongodb.net/toDoList");

const itemSchema = {
  name: {
    type: String,
    required:[true, "not allowed"]
  }
};

const listSchema = {
    name: {
        type: String,
        required:[true, "not allowed"]
    },
    items:[itemSchema]
};

const Item = mongoose.model("Items",itemSchema);
const List = mongoose.model("List",listSchema);

const Item1 = new Item({name:"sawan"});
const Item2 = new Item({name:"sj"});
const Item3 = new Item({name:"knaskncla"});

var defaultItems = [Item1,Item2,Item3];

app.get("/", function(req, res) {

  Item.find({},function(err,element) {
    if(element.length === 0) {
        Item.insertMany(defaultItems,function(err) {
            if(err) {
                console.log("error");
            } else {
                console.log("added default items");
            }
            res.redirect("/");
        });
    } else {
        res.render("list.ejs",{listTitle: "today", newListItems: element});
    }
  });
});

app.post("/", function(req, res){
    const newItemName = req.body.newItem;
    const listName = (req.body.list);
    const newItem = new Item({name:newItemName});

    if(listName === "today") {
        newItem.save();
        res.redirect("/");
    } else {
        List.findOne({name:listName}, function(err,element) {
            element.items.push(newItem);
            element.save();
            res.redirect("/" + listName);
        });
    }
});

app.post("/delete",function(req,res) {
    const delItem = req.body.checkbox;
    const delList = req.body.list;
    if(delList === "today") {
        Item.findByIdAndRemove(delItem,function(err) {
            console.log("done");
            res.redirect("/");
        });
    } else {
        List.findOneAndUpdate({name:delList},{$pull:{items:{_id:delItem}}},function(err,element) {
            if(!err) {
                console.log("done");
                res.redirect("/"+delList);
            }
        });
    }
});

app.get("/:topic", function(req,res) {
    let topic = _.capitalize(req.params.topic);
    List.findOne({name:topic}, function(err,element) {
        if(!err && !element) {
            const list = new List({
                name:topic,
                items:defaultItems
            });        
            list.save();
            res.redirect("/" + topic);
        } else {
            res.render("list.ejs",{listTitle: element.name, newListItems:element.items});
        }
    });
    // res.render("list.ejs",{listTitle: list.name, newListItems:list.items});

});

// app.get("/work", function(req,res){
//   res.render("list", {listTitle: "Work List", newListItems: workItems});
// });

// app.get("/about", function(req, res){
//     res.render("about");
// });

app.listen(PORT, function() {
  console.log("Server started on port 3000");
});
