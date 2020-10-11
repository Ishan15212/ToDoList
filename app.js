//jshint esversion: 6

const express = require("express");
const bodyParser = require("body-parser");
const date= require(__dirname + "/date.js");
const mongoose = require('mongoose');
const _ = require("lodash");

const app = express();
let items=["Buy Food", "Cook Food","Eat Food"];
let workItems=[];
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static('public'));

mongoose.connect('mongodb+srv://admin-ishan:Test123@cluster0-ihf5h.mongodb.net/todolistDB', {useNewUrlParser: true, useUnifiedTopology: true});

const itemsSchema= new mongoose.Schema({
  name: String
  });


  const Item=mongoose.model("Item", itemsSchema);

  const item1= new Item({
  name: "Welcome to your todolist!",
});

const item2= new Item({
name: "Hit the+buuton of new item"
});

const item3= new Item({
name: "<-- Hit this to delete an item",
});

const defaultItems= [item1,item2,item3];


const listSchema={
  name: String,
  items: [itemsSchema]
}
const List =mongoose.model("List", listSchema);



app.get("/", function(req, res) {


  let day=date.getDate();
  Item.find({}, function(err,foundItems){
    if(foundItems.length===0){

      Item.insertMany(defaultItems, function(err){
        if(err){
          console.log(err);
        }else{
          console.log("Successfully saved default item to DB");
        }
      });
      res.redirect("/");


    } else{
      res.render("List", {
        ListTitle: day,
        NewListItems:foundItems
      })
    }
  });

});

app.get("/:customListName", function(req,res){
  const customListName= _.capitalize(req.params.customListName);
  List.findOne({name:customListName}, function(err, foundList){
    if(!err){
      if(!foundList){
        const list= new List({
          name: customListName,
          items: defaultItems

        });
        list.save();
        res.redirect("/" + customListName);

      }else{
        res.render("list", {
          ListTitle: foundList.name,
          NewListItems:foundList.items
        })
      }
    }
  })


});

app.post("/", function(req,res){
  const itemName = req.body.newItem;
  const listName= req.body.list;
  const item= new Item({
    name: itemName
  });
  if(listName=== date){
    item.save();
    res.redirect("/");
  }else{
    List.findOne({name: listName}, function(err, foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/"+ listName);
    })
  }

// if(req.body.list==="Work"){
  //   workItems.push(item);
  //   res.redirect("/work");
  // }
  // else{
  //   items.push(item);
  //   res.redirect("/");
  //
  // }

});

app.post("/delete", function(req,res){
  const checkedItemId= req.body.checkbox;
  const listName=req.body.listName;
  if(listName=== date){
    Item.findByIdAndRemove(checkedItemId, function(err){
      if(!err){
        console.log("Succesfully removed");
        res.redirect("/")
      }else{
        console.log(err);
      }

    });

  } else{
    List.findOneAndUpdate({name: listName},{$pull:{items:{_id: checkedItemId}}},function(err,foundList){
      if(!err){
        res.redirect("/"+ listName);
      }
    });
  }

});


app.get("/about", function(req,res){
  res.render("about");
});



app.listen(3000, function() {
  console.log("Server started on port 3000.");
});
