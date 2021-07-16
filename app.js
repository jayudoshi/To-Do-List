//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash")
const date = require(__dirname + "/date.js");

const app = express();
const day = date.getDate();
mongoose.connect("mongodb://localhost:27017/toDoListApp");

const itemSchema = mongoose.Schema({
  name : String
})

const Item = mongoose.model("item",itemSchema)

const listSchema = mongoose.Schema({
  name : String,
  items : [itemSchema]
})

const List = mongoose.model("list" , listSchema)

const defaultItem = []

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true},{ useUnifiedTopology: true } , { useUnifiedTopology: true }));
app.use(express.static("public"));

app.get("/", function(req, res) {



  Item.find({},(err,items)=>{
    if(err){
      console.log(err);
    }else{
        res.render("list", {listTitle: day, newListItems: items});
    }
  })

});

app.post("/", function(req, res){

  const item = req.body.newItem;
  const listTitle = req.body.list;

  const newItem = new Item({
    name : item
  })

  if(listTitle === day){
    newItem.save()
    res.redirect("/")
  }else{
    List.findOne({name : listTitle} , (err,result)=>{
      if(!err){
        result.items.push(newItem)
        result.save()
        res.redirect("/" + listTitle)
      }
    })
  }
});

app.post("/delete",function(req,res){
  const id = req.body.checkbox
  const listName = req.body.list
  if(listName === day){
    Item.deleteOne({_id : id} ,(err)=>{
      if(err){
        console.log(err);
      }
    })
    res.redirect("/")
  }else{
    console.log("Entered");
    List.findOneAndUpdate({name : listName} , { $pull : {items : {_id : id}} } ,(err)=>{
      if(err){
        console.log();
      }
    })
    res.redirect("/" + listName)
  }
})


app.get("/:listName",(req,res)=>{
  const listName = _.capitalize(req.params.listName)
  List.findOne({name : listName} , (err,result)=>{
    if(!err){
      if(!result){
        const list = new List({
          name : listName,
          items : defaultItem
        })
        list.save(()=>{
          res.redirect("/" + listName)
        })
      }else{
        res.render("list",{listTitle: listName, newListItems: result.items})
      }
    }
  })

})

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
