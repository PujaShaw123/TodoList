//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require('mongoose');
const _= require('lodash');


const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));



mongoose.connect('mongodb+srv://puja_developer:puja@cluster0.hjt5z.mongodb.net/todolistDb?retryWrites=true&w=majority',{ useUnifiedTopology: true,  useNewUrlParser: true, useFindAndModify: false });
mongoose.set('useFindAndModify', true);
const itemsSchema={
	name:String,
	
};
const Item=mongoose.model("Item",itemsSchema);


const item1=new Item({
  name:"Welcome to your todolist"
});
const item2=new Item({
  name:"Hit the + button to add a new Item"
});

const item3=new Item({
  name:"<--Hit this to delete an Item"
});

const defaultItems=[item1,item2,item3];


const listSchema={
  name:String,
  items:[itemsSchema]
};

const List=mongoose.model("List",listSchema);



app.get("/", function(req, res) {

  
//retrieve the data from database.Intially No data is present so the length is 0 and then defaultItems get added then it is redirected to the same route.But next time data
//gets added so length becomes 3 and it goes to else and send th data from database to todolist.
Item.find({},function(err,foundItems){ // $$


  if(foundItems.length==0)
  {

  Item.insertMany(defaultItems,function(err){
    if(err)
      console.log(err);
    else
      console.log("Successfully saved default items to database");
  });
  res.redirect("/");//redirected to get request of rppt route $$
}
else{
  res.render("list", {listTitle:"Today", newListItems:foundItems});
}
 

});

  
});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName=req.body.list;


const item = new Item({
  name:itemName
});

if(listName=="Today")
{
  item.save();
  
    res.redirect("/");//redirected to get request of root route $$
}

else{

  List.findOne({name:listName},function(err,foundList){
    foundList.items.push(item);
    foundList.save();
    res.redirect("/" + listName);//redirected to get function of customListName

  });
}
  
});

app.get("/:customListName",function(req, res){
  const customListName=_.capitalize(req.params.customListName);


  List.findOne({name: customListName},function(err,foundList){
    if(!err)
    {
      if(!foundList)
      {
        //Create a new list
  const list=new List({
    name:customListName,
    items:defaultItems
    });
  list.save();
  res.redirect("/"+customListName );
      }

      else{
        res.render("list", {listTitle:foundList.name, newListItems:foundList.items});
      }
    }
  }
  );


});

app.get("/about", function(req, res){
  res.render("about");
});




app.post("/delete", function(req, res){
  const checkedItemId=req.body.checkbox; //to get the id of the item being checked

  const listName=req.body.listName;

  if(listName=="Today")

  {

  Item.findByIdAndRemove(checkedItemId,function(err){
    if(!err)
    {
      
      console.log("Successfully deleted the item");
      res.redirect("/");
    }
  });
}

else{
//{find}{update}
  List.findOneAndUpdate({name: listName},{$pull: {items: {_id: checkedItemId}}},function(err,foundList){
    if(!err)
    {
      
      console.log("Successfully deleted the item");
      res.redirect("/"+listName);
    }
  });
}

});



let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port, function() {
  console.log("Server started on port 3000");
});
